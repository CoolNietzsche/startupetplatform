import { NextRequest, NextResponse } from "next/server";
import { logAuditEvent, type AuditAction } from "@/lib/audit";

export async function POST(request: NextRequest) {
  try {
    const secret = request.headers.get("x-audit-secret");
    if (secret !== process.env.NEXTAUTH_SECRET) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    await logAuditEvent({
      userId: body.userId,
      email: body.email,
      action: body.action as AuditAction,
      resource: body.resource,
      details: body.details,
      ipAddress: body.ipAddress,
      userAgent: body.userAgent,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[AuditLog API] Error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
