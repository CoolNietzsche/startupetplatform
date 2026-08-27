import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db/index";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Find the ecosystem builder and their investor profile
    const builder = await prisma.ecosystemBuilder.findUnique({
      where: { userId },
      include: { 
        investor: {
            include: {
                pitches: {
                    include: {
                        startup: {
                            select: {
                                firstName: true,
                                lastName: true,
                                email: true,
                                startup: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                }
            }
        } 
      }
    });
    
    if (!builder) {
        return NextResponse.json({ success: false, error: "Ecosystem Builder not found" }, { status: 404 });
    }

    // BUSINESS RULE: Only certified builders can see pitches
    if (!builder.certified) {
        return NextResponse.json({ 
          success: false, 
          error: "Your account must be certified before you can view pitches." 
        }, { status: 403 });
    }
    if (!builder || !builder.investor) {
      return NextResponse.json({ 
        success: true, 
        data: [], 
        message: "No investor profile linked yet. Please create one to see pitches." 
      });
    }

    return NextResponse.json({ 
      success: true, 
      data: builder.investor.pitches 
    });
  } catch (error) {
    console.error("GET Pitches Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
