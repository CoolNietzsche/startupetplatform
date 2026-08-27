import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // 1. Fetch their currently active startup profile
    const existingStartup = await db.startup.findUnique({
      where: { userId },
      include: {
        application: true
      }
    });

    if (!existingStartup) {
      return NextResponse.json({ success: false, error: "No active startup profile found to renew." }, { status: 404 });
    }

    // 2. Prevent overlapping renewal spam
    const existingPendingRenewal = await db.application.findFirst({
      where: {
        userId,
        type: "RENEWAL",
        status: {
          notIn: ["CERTIFIED", "REJECTED", "EXPIRED", "ROLLED_BACK"]
        }
      }
    });

    if (existingPendingRenewal) {
      return NextResponse.json({ 
        success: false, 
        error: "You already have an active renewal application in progress.",
        applicationId: existingPendingRenewal.id
      }, { status: 400 });
    }

    // 3. Create a cloned scaffold of the existing application for the renewal
    const oldApp = existingStartup.application;
    const newRenewalApplication = await db.application.create({
      data: {
        userId: userId,
        type: "RENEWAL",
        status: "DRAFT", // Start as draft so they can confirm/edit details before submitting
        startupName: oldApp.startupName,
        industry: oldApp.industry,
        website: oldApp.website,
        phoneNumber: oldApp.phoneNumber,
        email: oldApp.email,
        tin: oldApp.tin,
        numberOfEmployees: oldApp.numberOfEmployees,
        // (Other fields are left blank or can be copied depending on Ministry requirements)
        reason: "Scheduled Periodic Regulatory Renewal",
      }
    });

    return NextResponse.json({
      success: true,
      message: "Renewal application drafted successfully.",
      applicationId: newRenewalApplication.id
    });

  } catch (error: any) {
    console.error("[RENEWAL_GENERATION_ERROR]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
