import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { fileService } from "@/lib/services/file";
import { FILE_CATEGORIES, type FileCategoryValue } from "@/types/file.types";
import { rateLimit } from "@/lib/rate-limit";
import { validateFile } from "@/lib/upload-limit";

export const dynamic = "force-dynamic";
export const maxDuration = 30;
export const runtime = "nodejs";

function parseCategory(value: string | null): FileCategoryValue | null {
  if (!value) return null;
  const normalized = value.toUpperCase() as FileCategoryValue;
  return FILE_CATEGORIES.includes(normalized) ? normalized : null;
}

function isMissingFileTableError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : "";
  return (
    (error as { code?: string } | null)?.code === "P2021" &&
    (message.includes("file.File") || message.includes("table `file.File` does not exist"))
  );
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Apply Rate Limiting: Max 5 uploads per minute per user
    const { success, remaining } = await rateLimit(`upload:${session.user.id}`, 5, 60);
    if (!success) {
      return NextResponse.json(
        { error: "Too many upload requests. Please wait a minute." },
        { status: 429 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }

    const validationError = validateFile(file);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const category = parseCategory(formData.get("category")?.toString() ?? null);
    if (!category) {
      return NextResponse.json(
        { error: "Valid file category is required" },
        { status: 400 },
      );
    }

    const metadataRaw = formData.get("metadata")?.toString();
    const metadata = metadataRaw ? JSON.parse(metadataRaw) : undefined;

    const uploaded = await fileService.uploadFile({
      file,
      uploadedBy: session.user.id,
      category,
      entityType: formData.get("entityType")?.toString() || undefined,
      entityId: formData.get("entityId")?.toString() || undefined,
      directory: formData.get("directory")?.toString() || undefined,
      isPublic: formData.get("isPublic")?.toString() === "true",
      metadata,
    });

    return NextResponse.json(uploaded, { status: 201 });
  } catch (error) {
    console.error("[POST /api/files/upload]", error);

    if (isMissingFileTableError(error)) {
      return NextResponse.json(
        {
          error: "File storage schema is not available",
          message:
            "The database is missing the file storage tables required for document upload. This project uses the split Prisma schema folder, so sync `prisma/schema` to the database before submitting documents.",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 },
    );
  }
}
