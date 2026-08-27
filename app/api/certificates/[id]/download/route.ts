import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";
import {
  loadCertificateFlexible,
  regenerateCertificatePdfToBuffer,
} from "@/lib/services/certificate-regeneration";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cert = await loadCertificateFlexible(id);
    if (!cert) {
      return NextResponse.json(
        { error: "Certificate record not found" },
        { status: 404 },
      );
    }

    const isAdmin =
      session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN";

    if (!isAdmin) {
      if (cert.type === "ECOSYSTEM" && cert.ecoApplication) {
        const isOwner = await db.ecosystemBuilder.findFirst({
          where: {
            id: cert.ecoApplication.builderId,
            userId: session.user.id,
          },
        });
        if (!isOwner) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
      } else if (cert.type === "STARTUP" && (cert.startup || cert.application)) {
        const appId = cert.startup?.applicationId || cert.application?.id;
        if (!appId) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        const isOwner = await db.application.findFirst({
          where: { id: appId, userId: session.user.id },
        });
        if (!isOwner) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
      }
    }

    const origin = new URL(request.url).origin;
    const fileBuffer = await regenerateCertificatePdfToBuffer(cert, origin);

    const filename = `certificate-${cert.certificateNumber || cert.id}.pdf`;
    const inline = request.nextUrl.searchParams.get("inline") === "true";

    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("[GET /api/certificates/[id]/download]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
