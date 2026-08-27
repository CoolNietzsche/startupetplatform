import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db/index";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { opportunityId } = await req.json();

    if (!opportunityId) {
      return NextResponse.json({ success: false, error: "Missing opportunityId" }, { status: 400 });
    }

    // Use a transactional approach or toggle logic
    try {
      // First, try to find the existing save
      const existing = await prisma.savedOpportunity.findUnique({
        where: {
          userId_opportunityId: {
            userId,
            opportunityId
          }
        }
      });

      if (existing) {
        // If it exists, remove it (unsave)
        await prisma.savedOpportunity.delete({
          where: {
            id: existing.id
          }
        });
        return NextResponse.json({ success: true, saved: false });
      } else {
        // If it doesn't exist, create it (save)
        // We use a try-catch here because a concurrent request might have 
        // created it between our check and our create call
        try {
          await prisma.savedOpportunity.create({
            data: {
              userId,
              opportunityId
            }
          });
          return NextResponse.json({ success: true, saved: true });
        } catch (createError: any) {
          // If it was already created by someone else (P2002), just return successful save
          if (createError.code === 'P2002') {
            return NextResponse.json({ success: true, saved: true });
          }
          throw createError;
        }
      }
    } catch (innerError) {
      throw innerError;
    }
  } catch (error) {
    console.error("POST Save Opportunity Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
