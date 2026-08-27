import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const event = await db.event.findUnique({
      where: { id },
      include: {
        attendees: {
          select: {
            id: true,
            status: true,
          }
        }
      }
    });

    if (!event) {
      return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });
    }

    const formattedEvent = {
      ...event,
      registeredAttendees: event.attendees.filter(a => a.status === 'confirmed').length,
      image: event.imageUrl || "/events/tech-summit.jpg",
      venue: event.location,
      categories: event.category ? [event.category] : ["General"],
      longDescription: event.description, // Use description as longDescription
    };

    return NextResponse.json({ success: true, data: formattedEvent });
  } catch (error: any) {
    console.error(`[GET /api/events/${params}]`, error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
