import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";

export async function PUT(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string, attendeeId: string }> }
) {
  try {
    const { attendeeId } = await params;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const json = await req.json();

    const updateData: any = {};
    if (json.status !== undefined) updateData.status = json.status;
    if (json.checkInStatus !== undefined) updateData.checkInStatus = json.checkInStatus;

    const attendee = await db.attendee.update({
      where: { id: attendeeId },
      data: updateData
    });

    return NextResponse.json({ success: true, data: attendee });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string, attendeeId: string }> }
) {
  try {
    const { attendeeId } = await params;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await db.attendee.delete({
      where: { id: attendeeId }
    });

    return NextResponse.json({ success: true, message: "Attendee removed successfully." });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
