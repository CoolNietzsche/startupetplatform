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

    const event = await db.event.findUnique({
      where: { id },
      include: { attendees: true }
    });

    if (!event) {
      return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      data: { ...event, registeredAttendees: event.attendees.length } 
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(
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
    
    // Partial update logic: only update fields present in the request
    const updateData: any = {};
    if (json.title !== undefined) updateData.title = json.title;
    if (json.description !== undefined) updateData.description = json.description;
    if (json.date !== undefined) updateData.date = json.date;
    if (json.time !== undefined) updateData.time = json.time;
    if (json.location !== undefined) updateData.location = json.location;
    if (json.type !== undefined) updateData.type = json.type;
    if (json.category !== undefined) updateData.category = json.category;
    if (json.capacity !== undefined) updateData.capacity = parseInt(json.capacity);
    if (json.status !== undefined) updateData.status = json.status;
    if (json.imageUrl !== undefined) updateData.imageUrl = json.imageUrl;

    const event = await db.event.update({
      where: { id },
      data: updateData,
      include: { attendees: true }
    });

    return NextResponse.json({ 
      success: true, 
      data: { ...event, registeredAttendees: event.attendees.length } 
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await db.event.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: "Event deleted successfully." });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
