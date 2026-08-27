import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email") || (session.user as any).email;

    if (!email) {
      return NextResponse.json({ success: true, data: [] });
    }

    const registrations = await db.attendee.findMany({
      where: { email },
      include: {
        event: true
      },
      orderBy: { registeredAt: 'desc' }
    });

    const formatted = registrations.map(reg => ({
      id: reg.event.id,
      registrationId: reg.id,
      attendeeName: reg.name,
      title: reg.event.title,
      date: reg.event.date,
      time: reg.event.time,
      location: reg.event.location,
      venue: reg.event.location,
      image: reg.event.imageUrl || "/events/tech-summit.jpg",
      status: reg.status === 'confirmed' ? 'Confirmed' : 'Pending',
      ticketId: `ETH-${reg.id.slice(-8).toUpperCase()}`,
      registrationDate: reg.registeredAt.toLocaleDateString(),
      isPast: new Date(reg.event.date) < new Date()
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
