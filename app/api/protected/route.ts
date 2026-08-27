import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({
            error: "Unauthorized",
            message: "You must be logged in to access this resource"
        }, { status: 401 });
    }

    return NextResponse.json({
        success: true,
        message: "This is a protected resource",
        user: session.user,
        serverTime: new Date().toISOString()
    });
}
