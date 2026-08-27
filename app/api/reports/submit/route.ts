import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";
import { createNotification, notifyAllAdmins } from "@/lib/notifications";

const VALID_REPORT_TYPES = ["STARTUP_PROGRESS", "INCUBATION_PROGRESS", "ECOSYSTEM_ANNUAL"] as const;

const REPORT_TYPE_LABELS: Record<string, string> = {
  STARTUP_PROGRESS: "Startup Progress",
  INCUBATION_PROGRESS: "Incubation Progress",
  ECOSYSTEM_ANNUAL: "Ecosystem Annual",
};

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { reportType, notes, fileIds } = body;

    if (!reportType || !VALID_REPORT_TYPES.includes(reportType)) {
      return NextResponse.json({ error: "Invalid report type" }, { status: 400 });
    }
    if (!Array.isArray(fileIds) || fileIds.length === 0) {
      return NextResponse.json({ error: "At least one file is required" }, { status: 400 });
    }

    const entityType = reportType === "ECOSYSTEM_ANNUAL" ? "ecosystem" : "startup";

    const report = await db.reportSubmission.create({
      data: {
        entityId: session.user.id,
        entityType,
        reportType,
        notes,
        fileIds,
        status: "SUBMITTED",
        submittedById: session.user.id,
      },
    });

    const label = REPORT_TYPE_LABELS[reportType] || reportType;

    // Notify admins of new report submission
    await notifyAllAdmins({
      title: "New Report Submitted",
      message: `${label} report submitted by ${session.user.name || session.user.email} (Art. 19.5/20.5/29.1)`,
      type: "info",
      link: "/admins-new/reports/directive",
    });

    // Confirm to submitter
    await createNotification({
      userId: session.user.id,
      title: "Report Submitted",
      message: `${label} report submitted successfully. Advisors have been notified.`,
      type: "success",
    });

    return NextResponse.json({ success: true, reportId: report.id });
  } catch (error: any) {
    console.error("Report submission failed:", error);
    return NextResponse.json({ error: "Failed to submit report" }, { status: 500 });
  }
}
