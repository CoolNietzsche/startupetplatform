import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";

export async function GET() {
  try {
    // Only fetch non-draft events for the public dashboard
    const events = await db.event.findMany({
      where: {
        status: {
          in: ["upcoming", "past", "featured"]
        }
      },
      orderBy: { 
        date: "desc" 
      },
      include: {
        attendees: {
          where: {
            status: "confirmed"
          }
        }
      }
    });

    const formattedEvents = events.map((event) => ({
      ...event,
      registeredAttendees: event.attendees.length,
      // Map database fields to mock fields the UI expects if they differ
      image: event.imageUrl || "/events/tech-summit.jpg", // Default if missing
      categories: event.category ? [event.category] : ["General"], // UI expects array
      venue: event.location, // UI has both venue and location
    }));

    return NextResponse.json({ success: true, data: formattedEvents });
  } catch (error: any) {
    console.error("[GET /api/events]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
