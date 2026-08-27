import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";

export async function GET(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const attendees = await db.attendee.findMany({
      where: { eventId: id },
      orderBy: { registeredAt: "desc" }
    });

    return NextResponse.json({ success: true, data: attendees });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const json = await req.json();
    const attendee = await db.attendee.create({
      data: {
        eventId: id,
        name: json.name,
        email: json.email,
        phone: json.phone,
        company: json.company,
        status: json.status || "confirmed",
        checkInStatus: json.checkInStatus || "not-checked-in",
      }
    });

    return NextResponse.json({ success: true, data: attendee });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
