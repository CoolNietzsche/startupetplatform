import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const startup = await db.startup.findUnique({
      where: { userId: session.user.id },
      include: {
        certificate: true,
      }
    });

    if (!startup) {
      return NextResponse.json({ success: true, hasCertificate: false });
    }

    let daysLeft = 0;
    if (startup.expiresAt) {
      const now = new Date();
      const difference = startup.expiresAt.getTime() - now.getTime();
      daysLeft = Math.ceil(difference / (1000 * 3600 * 24));
    }

    return NextResponse.json({
      success: true,
      hasCertificate: true,
      startup: {
        id: startup.id,
        level: startup.level,
        certificateId: startup.certificateId,
        expiresAt: startup.expiresAt,
        daysLeft,
        status: startup.certificate?.status || "UNKNOWN",
      }
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
