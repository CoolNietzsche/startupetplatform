import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { fileService } from "@/lib/services/file";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await fileService.getFileBuffer(id);
    if (!payload) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const { file, data } = payload;
    const inline = _request.nextUrl.searchParams.get("inline") === "true";

    // Ensure correct MIME type for PDFs — browsers need this to render inline
    const mimeType = file.originalName.toLowerCase().endsWith(".pdf")
      ? "application/pdf"
      : file.mimeType || "application/octet-stream";

    // Use Buffer.from() for a clean copy — avoids shared backing store issues
    const uint8 = new Uint8Array(Buffer.from(data));

    return new NextResponse(uint8, {
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": inline
          ? `inline; filename="${encodeURIComponent(file.originalName)}"`
          : `attachment; filename="${encodeURIComponent(file.originalName)}"`,
        "Content-Length": uint8.byteLength.toString(),
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("[GET /api/files/:id/download]", error);
    return NextResponse.json({ error: "Download failed" }, { status: 500 });
  }
}
