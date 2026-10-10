import { NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { site } from "@/content/site";

export const runtime = "nodejs";

const inquirySchema = z.object({
  type: z.enum(["water-wholesale", "import-quote", "export-inquiry", "general-contact"]),
  name: z.string().trim().min(2).max(100),
  company: z.string().trim().max(150).optional().default(""),
  email: z.union([z.email(), z.literal("")]).optional().default(""),
  phone: z.string().trim().max(40).optional().default(""),
  message: z.string().trim().min(10).max(3000),
  website: z.string().max(200).optional().default(""),
  turnstileToken: z.string().min(1).max(2048),
}).refine((data) => data.email.length > 0 || data.phone.length > 0, {
  path: ["email"],
  message: "An email address or phone number is required.",
});

type Inquiry = z.infer<typeof inquirySchema>;
const topicLabels: Record<Inquiry["type"], string> = {
  "water-wholesale": "Fine Water / wholesale",
  "import-quote": "Import quote",
  "export-inquiry": "Export inquiry",
  "general-contact": "General inquiry",
};

function clientAddress(request: Request): string {
  return request.headers.get("cf-connecting-ip")?.trim()
    || request.headers.get("x-real-ip")?.trim()
    || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || "unknown";
}

let limiter: Ratelimit | undefined;
const localWindows = new Map<string, { start: number; count: number }>();

function getRateLimiter(): Ratelimit | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  if (!limiter) {
    limiter = new Ratelimit({
      redis: new Redis({ url, token }),
      limiter: Ratelimit.slidingWindow(5, "15 m"),
      analytics: false,
      prefix: "belema-site:inquiry",
    });
  }
  return limiter;
}

async function checkRateLimit(request: Request): Promise<{ allowed: boolean; reset?: number; configured: boolean }> {
  const address = clientAddress(request);
  const shared = getRateLimiter();
  if (shared) {
    const result = await shared.limit(address);
    return { allowed: result.success, reset: result.reset, configured: true };
  }
  if (process.env.NODE_ENV === "production") return { allowed: false, configured: false };
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const record = localWindows.get(address);
  if (!record || now - record.start >= windowMs) {
    localWindows.set(address, { start: now, count: 1 });
    return { allowed: true, configured: true };
  }
  if (record.count >= 5) return { allowed: false, reset: record.start + windowMs, configured: true };
  record.count += 1;
  return { allowed: true, configured: true };
}

async function verifyTurnstile(token: string, remoteIp?: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return false;
  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp) body.set("remoteip", remoteIp);
  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
      signal: AbortSignal.timeout(5000),
      cache: "no-store",
    });
    if (!response.ok) return false;
    const result = await response.json() as { success?: boolean };
    return result.success === true;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const requestOrigin = request.headers.get("origin");
  const host = request.headers.get("host");
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 16_000) return NextResponse.json({ error: "payload_too_large" }, { status: 413 });
  if (requestOrigin && host) {
    try {
      if (new URL(requestOrigin).host !== host) return NextResponse.json({ error: "forbidden" }, { status: 403 });
    } catch {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
  } else if (process.env.NODE_ENV === "production" && (!requestOrigin || !host)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  let raw: unknown;
  try { raw = await request.json(); } catch { return NextResponse.json({ error: "invalid_json" }, { status: 400 }); }
  const parsed = inquirySchema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  const inquiry = parsed.data;

  // Quietly discard bot submissions that fill the hidden honeypot.
  if (inquiry.website.trim()) return NextResponse.json({ ok: true });

  const inTestMode = process.env.INQUIRY_TEST_MODE === "true" && process.env.NODE_ENV !== "production";
  const throttle = await checkRateLimit(request);
  if (!throttle.configured) return NextResponse.json({ error: "not_configured" }, { status: 503 });
  if (!throttle.allowed) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: throttle.reset ? { "Retry-After": String(Math.max(1, Math.ceil((throttle.reset - Date.now()) / 1000))) } : undefined });
  }
  if (inTestMode && inquiry.turnstileToken === "test-token") return NextResponse.json({ ok: true });

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from || !process.env.TURNSTILE_SECRET_KEY) return NextResponse.json({ error: "not_configured" }, { status: 503 });

  const remoteIp = clientAddress(request);
  const verified = await verifyTurnstile(inquiry.turnstileToken, remoteIp);
  if (!verified) return NextResponse.json({ error: "verification_failed" }, { status: 400 });

  const text = [
    `Inquiry type: ${topicLabels[inquiry.type]}`,
    `Name: ${inquiry.name}`,
    inquiry.company ? `Company: ${inquiry.company}` : "",
    inquiry.email ? `Email: ${inquiry.email}` : "",
    inquiry.phone ? `Phone: ${inquiry.phone}` : "",
    "",
    "Message:",
    inquiry.message,
  ].filter(Boolean).join("\n");

  try {
    const result = await new Resend(apiKey).emails.send({
      from,
      to: [site.contact.email],
      ...(inquiry.email ? { replyTo: inquiry.email } : {}),
      subject: `Website inquiry: ${topicLabels[inquiry.type]}`,
      text,
    });
    if (result.error) return NextResponse.json({ error: "delivery_failed" }, { status: 502 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "delivery_failed" }, { status: 502 });
  }
}
