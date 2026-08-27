import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db/index";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const builder = await prisma.ecosystemBuilder.findUnique({
      where: { userId: (session.user as any).id }
    });

    if (!builder) {
      return NextResponse.json({ success: false, error: "Ecosystem Builder profile not found" }, { status: 404 });
    }

    // Verify that the application belongs to an opportunity created by this builder
    const application = await prisma.fundingApplication.findUnique({
      where: { id: params.id },
      include: {
        opportunity: true
      }
    });

    if (!application || application.opportunity.creatorId !== builder.id) {
      return NextResponse.json({ success: false, error: "Forbidden: You do not have permission over this application" }, { status: 403 });
    }

    const body = await req.json();
    const { status } = body;

    const updated = await prisma.fundingApplication.update({
      where: { id: params.id },
      data: { status }
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("PUT Application Status Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
