import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const bookings = await db.booking.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        space: { select: { name: true } }
      }
    });

    // Format for frontend
    const formatted = bookings.map((b: any) => ({
      ...b,
      spaceName: b.space?.name || "Unknown Space",
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const json = await req.json();
    const booking = await db.booking.create({
      data: {
        spaceId: json.spaceId,
        clientName: json.clientName,
        clientEmail: json.clientEmail,
        clientPhone: json.clientPhone,
        date: json.date,
        startTime: json.startTime,
        endTime: json.endTime,
        duration: json.duration,
        totalCost: json.totalCost,
        purpose: json.purpose,
        status: json.status || "pending",
      },
      include: {
        space: { select: { name: true } }
      }
    });

    return NextResponse.json({ 
      success: true, 
      data: { ...booking, spaceName: booking.space?.name || "" } 
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
