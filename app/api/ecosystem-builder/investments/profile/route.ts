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

    // Find the ecosystem builder
    const builder = await prisma.ecosystemBuilder.findUnique({
      where: { userId },
      include: { investor: true }
    });

    if (!builder) {
      return NextResponse.json({ success: false, error: "Ecosystem Builder not found" }, { status: 404 });
    }

    // BUSINESS RULE: Only certified builders can manage investment profiles
    if (!builder.certified) {
      return NextResponse.json({ 
        success: false, 
        error: "Your account must be certified before you can manage investment profiles." 
      }, { status: 403 });
    }

    return NextResponse.json({ 
      success: true, 
      data: builder.investor || null 
    });
  } catch (error) {
    console.error("GET Investment Profile Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();

    const builder = await prisma.ecosystemBuilder.findUnique({
      where: { userId }
    });

    if (!builder) {
      return NextResponse.json({ success: false, error: "Ecosystem Builder not found" }, { status: 404 });
    }

    // BUSINESS RULE: Only certified builders can post/update investment profiles
    if (!builder.certified) {
      return NextResponse.json({ 
        success: false, 
        error: "Your account must be certified before you can manage investment profiles." 
      }, { status: 403 });
    }

    const investorData = {
      name: body.name || builder.name,
      type: body.type || "VC", // Default type
      description: body.description,
      investmentThesis: body.investmentThesis,
      minTicketSize: parseFloat(body.minTicketSize) || 0,
      maxTicketSize: parseFloat(body.maxTicketSize) || 0,
      preferredStages: body.preferredStages || [],
      sectors: body.sectors || [],
      regions: body.regions || [],
      portfolio: body.portfolio || [],
      website: body.website,
      email: body.email,
      phone: body.phone,
      address: body.address,
      builderId: builder.id
    };

    let investor;
    if (builder.id) {
        // Upsert logic for investor linked to this builder
        const existingInvestor = await prisma.investor.findUnique({
            where: { builderId: builder.id }
        });

        if (existingInvestor) {
            investor = await prisma.investor.update({
                where: { id: existingInvestor.id },
                data: investorData
            });
        } else {
            investor = await prisma.investor.create({
                data: investorData
            });
        }
    }

    return NextResponse.json({ success: true, data: investor });
  } catch (error) {
    console.error("POST Investment Profile Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
