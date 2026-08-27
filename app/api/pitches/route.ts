import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db/index";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Check if the user has a certified startup application
    const certifiedApplication = await prisma.application.findFirst({
      where: {
        userId,
        status: "CERTIFIED"
      }
    });

    if (!certifiedApplication) {
      return NextResponse.json({ 
        success: false, 
        error: "Your startup must be certified before you can send pitches to investors. Please complete your startup certification first." 
      }, { status: 403 });
    }

    const body = await req.json();
    const { investorId, subject, message, attachments } = body;

    const pitch = await prisma.pitch.create({
      data: {
        startupId: userId,
        investorId,
        subject,
        message,
        attachments: attachments || [],
        status: "PENDING"
      }
    });

    return NextResponse.json({ success: true, data: pitch });
  } catch (error) {
    console.error("POST Pitch Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
