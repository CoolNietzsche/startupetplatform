import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";

const generateSlug = (text: string) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Auto-publish any scheduled articles whose time has passed
    const now = new Date();
    await db.news.updateMany({
      where: {
        status: "scheduled",
        publishedDate: { lte: now },
      },
      data: { status: "published" },
    });

    const news = await db.news.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        featuredImageFile: true,
        images: true,
      },
    });
    return NextResponse.json({ success: true, data: news });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      requestId,
      title,
      excerpt,
      content,
      category,
      author,
      featuredImageFileId,
      imageFileIds,
      status,
      publishedDate,
    } = body;

    if (!title || !content || !category || !author) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // ── Idempotency guard ────────────────────────────────────────────────────
    // If the same requestId was already processed within the last 60 seconds,
    // return the existing record instead of creating a duplicate.
    if (requestId) {
      const sixtySecondsAgo = new Date(Date.now() - 60_000);
      const existing = await db.news.findFirst({
        where: {
          slug: { startsWith: `${generateSlug(title)}-${requestId.slice(-6)}` },
          createdAt: { gte: sixtySecondsAgo },
        },
      });
      if (existing) {
        return NextResponse.json({ success: true, data: existing });
      }
    }

    // Embed the last 6 chars of the requestId into the slug for the guard above
    const slugOrigin = generateSlug(title);
    const suffix = requestId ? requestId.slice(-6) : Date.now().toString(36);
    const slug = `${slugOrigin}-${suffix}`;

    // Status-driven published date
    let finalPublishedDate: Date | null = null;
    if (status === "published") {
      finalPublishedDate = new Date();
    } else if (status === "scheduled" && publishedDate) {
      finalPublishedDate = new Date(publishedDate);
    }

    let news: any;
    try {
      news = await db.news.create({
        data: {
          title,
          slug,
          excerpt: excerpt || "",
          content,
          category,
          author,
          featuredImageFileId: featuredImageFileId || null,
          images:
            imageFileIds && Array.isArray(imageFileIds)
              ? { connect: imageFileIds.map((id: string) => ({ id })) }
              : undefined,
          status: status || "draft",
          publishedDate: finalPublishedDate,
        },
      });
    } catch (createError: any) {
      // P2002 = Prisma unique constraint violation
      // This happens when two simultaneous duplicate requests both pass the
      // pre-check above and race to insert — one wins, one gets P2002.
      // In that case, just return the record that was already created.
      if (createError?.code === "P2002") {
        const already = await db.news.findFirst({ where: { slug } });
        if (already) {
          return NextResponse.json({ success: true, data: already });
        }
      }
      throw createError; // re-throw any other error
    }

    return NextResponse.json({ success: true, data: news });
  } catch (error: any) {
    console.error("[POST /api/ecosystem-builder/news]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

