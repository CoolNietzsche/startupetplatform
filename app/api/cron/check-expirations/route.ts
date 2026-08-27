import { NextResponse } from "next/server";
import db from "@/lib/db/index";

// Exported standard GET API route, can be hit manually or by Vercel Cron
export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    // Secure the route with a simple unguessable bearer token
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.warn("[CRON_UNAUTHORIZED_ACCESS_ATTEMPT]", {
        ip: req.headers.get("x-forwarded-for"),
        userAgent: req.headers.get("user-agent"),
      });
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    
    // Find all startups whose expiration date is deeply in the past but their certificate is still active
    const expiredStartups = await db.startup.findMany({
      where: {
        expiresAt: {
          lt: new Date(), // Extracted exactly when the date has passed
        },
        certificate: {
          status: "ACTIVE", // Only target active ones to avoid re-expiring
        },
      },
      include: {
        certificate: true,
      },
    });

    if (expiredStartups.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: "No active certificates found that have passed their expiration horizon." 
      });
    }

    // Process revocations
    const expiredIds = expiredStartups.map(s => s.certificateId);
    
    // Batch update the certificates to EXPIRED
    await db.certificate.updateMany({
      where: {
        id: { in: expiredIds }
      },
      data: {
        status: "EXPIRED"
      }
    });

    // We can also create a notification/log entry here for each startup
    
    return NextResponse.json({
      success: true,
      processedCount: expiredStartups.length,
      message: `Successfully automatically expired ${expiredStartups.length} non-renewed digital certificates.`,
      expiredIds
    });

  } catch (error: any) {
    console.error("[CRON_EXPIRATION_ERROR]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
