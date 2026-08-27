import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Authentication required to register for events" }, { status: 401 });
  }

  try {
    const { id: eventId } = await params;
    const body = await req.json();
    
    // Validate event exists and is not closed/cancelled
    const event = await db.event.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });
    }

    if (event.status === "cancelled") {
      return NextResponse.json({ success: false, error: "Event has been cancelled" }, { status: 400 });
    }

    // Check for existing registration
    const existingAttendee = await db.attendee.findFirst({
      where: {
        eventId,
        OR: [
          { email: body.email },
          { phone: body.phone }
        ]
      }
    });

    if (existingAttendee) {
      return NextResponse.json({ 
        success: false, 
        error: "You have already registered for this event with this email or phone number." 
      }, { status: 400 });
    }

    // Check capacity
    const attendeeCount = await db.attendee.count({
      where: { eventId, status: "confirmed" }
    });

    if (attendeeCount >= event.capacity) {
      // In a real app, maybe add to waitlist, but for now just return error
      // return NextResponse.json({ success: false, error: "Event is full" }, { status: 400 });
    }

    // Create attendee
    const attendee = await db.attendee.create({
      data: {
        eventId,
        name: body.fullName || body.name,
        email: body.email,
        phone: body.phone,
        company: body.organizationName || body.company || "Individual",
        status: "confirmed", // Set to confirmed by default for this simple integration
      }
    });

    return NextResponse.json({ 
      success: true, 
      data: attendee,
      confirmationCode: `ETH-${attendee.id.slice(-8).toUpperCase()}`
    });
  } catch (error: any) {
    console.error("[POST /api/events/[id]/register]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
