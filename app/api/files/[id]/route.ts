import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { fileService } from "@/lib/services/file";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const file = await fileService.getFileById(id);
    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Permission check
    const isAdmin = ["SUPER_ADMIN", "ADMIN"].includes((session.user as any).role);
    const isOwner = file.uploadedBy === session.user.id;
    
    if (!file.isPublic && !isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden: You do not have permission to access this file" }, { status: 403 });
    }

    return NextResponse.json(file);
  } catch (error) {
    console.error("[GET /api/files/:id]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const file = await fileService.getFileById(id);
    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Only owner or admin can update metadata
    const isAdmin = ["SUPER_ADMIN", "ADMIN"].includes((session.user as any).role);
    const isOwner = file.uploadedBy === session.user.id;

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const updated = await fileService.updateFileMetadata(id, body);
    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PATCH /api/files/:id]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Update failed" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const file = await fileService.getFileById(id);
    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Only owner or admin can delete
    const isAdmin = ["SUPER_ADMIN", "ADMIN"].includes((session.user as any).role);
    const isOwner = file.uploadedBy === session.user.id;

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const hardDelete =
      request.nextUrl.searchParams.get("hard")?.toLowerCase() === "true";

    if (hardDelete) {
      await fileService.hardDeleteFile(id);
    } else {
      await fileService.softDeleteFile(id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/files/:id]", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
