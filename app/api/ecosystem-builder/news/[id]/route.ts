import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    // Update views count and return the article
    const news = await db.news.update({
      where: { id },
      data: {
        views: { increment: 1 }
      },
      include: { 
        featuredImageFile: true,
        images: true
      },
    });

    return NextResponse.json({ success: true, data: news });
  } catch (error: any) {
    console.error(`[GET /api/ecosystem-builder/news/${id}]`, error);
    // If not found, prisma might throw an error on update
    if (error.code === 'P2025') {
       return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const body = await req.json();
    const { isPublished, featuredImage, imageFileIds, ...rest } = body;

    const data: any = { ...rest };

    // Handle featuredImageFileId: empty string → null
    if (Object.prototype.hasOwnProperty.call(body, "featuredImageFileId")) {
      data.featuredImageFileId = body.featuredImageFileId || null;
    }

    // Sync image relations
    if (imageFileIds && Array.isArray(imageFileIds)) {
      data.images = {
        set: imageFileIds.map((imgId: string) => ({ id: imgId })),
      };
    }

    // Quick-publish shortcut (from Publish button on list)
    if (isPublished) {
      data.status = "published";
      data.publishedDate = new Date();
    }

    // Status-driven date logic
    if (data.status === "draft") {
      // Drafts have no publish date
      data.publishedDate = null;
    } else if (data.status === "published" && !data.publishedDate) {
      // If publishing with no date provided, use now
      data.publishedDate = new Date();
    } else if (data.status === "scheduled" && data.publishedDate) {
      data.publishedDate = new Date(data.publishedDate);
    }

    // Ensure any non-null date string is converted to Date
    if (data.publishedDate && typeof data.publishedDate === "string") {
      data.publishedDate = new Date(data.publishedDate);
    }

    const news = await db.news.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, data: news });
  } catch (error: any) {
    console.error(`[PUT /api/ecosystem-builder/news/${id}]`, error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    await db.news.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
