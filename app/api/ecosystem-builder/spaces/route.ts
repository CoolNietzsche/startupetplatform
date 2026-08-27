import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";

export async function GET() {
  try {
    const spaces = await db.space.findMany({
      orderBy: { createdAt: "desc" }
    });
    
    // Calculate bookings today
    const today = new Date().toISOString().slice(0, 10);
    
    const spacesWithData = await Promise.all(spaces.map(async (space: any) => {
      const bookingsToday = await db.booking.count({
        where: {
          spaceId: space.id,
          date: today,
          status: { not: "cancelled" }
        }
      });
      return { ...space, bookingsToday };
    }));

    return NextResponse.json({ success: true, data: spacesWithData });
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
    const space = await db.space.create({
      data: {
        name: json.name,
        type: json.type,
        capacity: json.capacity,
        pricePerHour: json.pricePerHour,
        location: json.location,
        description: json.description || "",
        amenities: Array.isArray(json.amenities) ? json.amenities.join(", ") : json.amenities,
        status: json.status || "available",
      }
    });

    return NextResponse.json({ success: true, data: space });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
