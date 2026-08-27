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

    const events = await db.event.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        attendees: true
      }
    });

    const formattedEvents = events.map((event: any) => ({
      ...event,
      registeredAttendees: event.attendees.length
    }));

    return NextResponse.json({ success: true, data: formattedEvents });
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
    const event = await db.event.create({
      data: {
        title: json.title,
        description: json.description,
        date: json.date,
        time: json.time,
        location: json.location,
        type: json.type,
        category: json.category,
        capacity: parseInt(json.capacity),
        status: json.status || "draft",
        imageUrl: json.imageUrl || null,
      },
      include: {
        attendees: true
      }
    });

    return NextResponse.json({ 
      success: true, 
      data: { ...event, registeredAttendees: 0 } 
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
