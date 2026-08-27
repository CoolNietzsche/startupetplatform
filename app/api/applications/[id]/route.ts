import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const role = session.user.role?.toUpperCase();
    const isAdmin =
      role === "ADMIN" || role === "SUPER_ADMIN" || role === "REVIEWER";

    const application = await prisma.application.findFirst({
      where: isAdmin
        ? { id }
        : {
            id,
            userId: session.user.id,
          },
      include: {
        founders: true,
        statusHistory: {
          orderBy: {
            createdAt: "asc",
          },
        },
        businessLicenseFile: true,
        articlesOfIncorpFile: true,
        pitchDeckFile: true,
        financialsFile: true,
        certificate: true,
      },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: application });
  } catch (error) {
    console.error("Error fetching application details:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
