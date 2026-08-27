import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db/index";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status") || "active";
    const searchQuery = searchParams.get("q");

    const where: any = {
      isActive: true, // Only show active opportunities
    };

    if (status) {
      where.status = status;
    }

    if (category && category !== "all") {
      where.category = category;
    }

    if (searchQuery) {
      where.OR = [
        { title: { contains: searchQuery, mode: 'insensitive' } },
        { description: { contains: searchQuery, mode: 'insensitive' } },
        { organization: { contains: searchQuery, mode: 'insensitive' } }
      ];
    }

    const userId = session?.user ? (session.user as any).id : null;

    const opportunities = await prisma.fundingOpportunity.findMany({
      where,
      include: {
        _count: {
          select: { applications: true }
        },
        savedBy: userId ? {
            where: { userId }
        } : false
      },
      orderBy: { createdAt: 'desc' }
    });

    const data = opportunities.map((opp: any) => ({
      ...opp,
      applicationCount: opp._count.applications,
      isSaved: userId ? opp.savedBy.length > 0 : false,
      deadlineParsed: opp.deadline ? new Date(opp.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null,
      daysLeft: opp.deadline ? Math.max(0, Math.ceil((new Date(opp.deadline).getTime() - new Date().getTime()) / (1000 * 3600 * 24))) : null
    }));

    const userCertified = userId ? (await prisma.application.findFirst({
      where: { userId, status: "CERTIFIED" }
    }) !== null) : false;

    // Fetch Recent Activities
    let fundingApps: any[] = [];
    let pitches: any[] = [];
    
    if (userId) {
      try {
        fundingApps = await prisma.fundingApplication.findMany({
          where: { userId },
          include: { opportunity: true },
          orderBy: { submittedDate: 'desc' },
          take: 5
        });
      } catch (err) {
        console.error("Error fetching funding apps activity:", err);
      }

      try {
        pitches = await prisma.pitch.findMany({
          where: { startupId: userId },
          include: { investor: true },
          orderBy: { createdAt: 'desc' },
          take: 5
        });
      } catch (err) {
        console.error("Error fetching pitches activity:", err);
      }
    }

    const activities = [
      ...fundingApps.map(app => ({
        id: `app-${app.id}`,
        type: 'funding_application',
        title: 'Application Submitted',
        description: `Your application for ${app.opportunity.title} has been ${app.status}`,
        date: new Date(app.submittedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        time: new Date(app.submittedDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        status: app.status === 'certified' ? 'success' : app.status === 'rejected' ? 'error' : 'info',
        fundingId: app.fundingOpportunityId
      })),
      ...pitches.map(pitch => ({
        id: `pitch-${pitch.id}`,
        type: 'funding_update',
        title: 'Pitch Sent',
        description: `You sent a pitch to ${pitch.investor.name}`,
        date: new Date(pitch.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        time: new Date(pitch.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        status: 'info',
        fundingId: pitch.investorId
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

    // Fetch Upcoming Deadlines
    const upcomingDeadlines = await prisma.fundingOpportunity.findMany({
      where: {
        isActive: true,
        deadline: {
          gt: new Date()
        }
      },
      orderBy: {
        deadline: 'asc'
      },
      take: 3
    });

    return NextResponse.json({ 
        success: true, 
        data: data, 
        userCertified,
        activities,
        upcomingDeadlines: upcomingDeadlines.map(opp => ({
            id: opp.id,
            title: opp.title,
            deadline: opp.deadline,
            daysLeft: Math.max(0, Math.ceil((new Date(opp.deadline as Date).getTime() - new Date().getTime()) / (1000 * 3600 * 24)))
        }))
    });
  } catch (error) {
    console.error("GET Funding Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
