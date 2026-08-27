import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const [sessions, user, passwordHistory] = await Promise.all([
    db.userSession.findMany({
      where: { userId, isActive: true },
      orderBy: { lastActiveAt: "desc" },
    }),
    db.user.findUnique({
      where: { id: userId },
      select: { lockedUntil: true, loginAttempts: true },
    }),
    db.passwordHistory.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return NextResponse.json({
    sessions,
    lockout: {
      lockedUntil: user?.lockedUntil,
      loginAttempts: user?.loginAttempts,
      isLocked: user?.lockedUntil ? new Date() < user.lockedUntil : false,
    },
    passwordHistory: passwordHistory.map((h) => ({
      id: h.id,
      createdAt: h.createdAt,
    })),
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { action, sessionId, currentSessionToken } = body;

  if (action === "terminate" && sessionId) {
    const result = await db.userSession.updateMany({
      where: { id: sessionId, userId: session.user.id },
      data: { isActive: false },
    });
    if (result.count === 0) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  }

  if (action === "terminateOthers") {
    if (currentSessionToken) {
      await db.userSession.updateMany({
        where: {
          userId: session.user.id,
          token: { not: currentSessionToken },
          isActive: true,
        },
        data: { isActive: false },
      });
    } else {
      await db.userSession.updateMany({
        where: { userId: session.user.id, isActive: true },
        data: { isActive: false },
      });
    }
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}
