import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";
import { createAuditLog } from "@/lib/audit";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const role = (session.user as any).role;
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: { managedHub: true },
  });

  const hubId = role === "SUPER_ADMIN" ? undefined : user?.managedHub?.id;
  const where = hubId ? { hubId } : {};

  const reports = await db.hubReport.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { hub: true },
  });
  return NextResponse.json({ success: true, data: reports });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { hubId, period, title, description, metrics } = body;

  if (!hubId || !period || !title) {
    return NextResponse.json({ error: "hubId, period, and title are required" }, { status: 400 });
  }

  const report = await db.hubReport.create({
    data: { hubId, period, title, description, metrics: metrics || {}, status: "DRAFT" },
  });

  await createAuditLog({
    userId: session.user.id,
    action: "REPORT_SUBMITTED",
    resource: `hub-report:${report.id}`,
    details: { hubId, period, title },
  });

  return NextResponse.json({ success: true, data: report });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, status, metrics, description } = body;

  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const updateData: any = {};
  if (status) updateData.status = status;
  if (metrics) updateData.metrics = metrics;
  if (description !== undefined) updateData.description = description;
  if (status === "SUBMITTED") updateData.submittedAt = new Date();
  if (status === "REVIEWED") { updateData.reviewedAt = new Date(); updateData.reviewedBy = session.user.id; }

  const report = await db.hubReport.update({ where: { id }, data: updateData });

  await createAuditLog({
    userId: session.user.id,
    action: status === "SUBMITTED" ? "REPORT_SUBMITTED" : "REPORT_REVIEWED",
    resource: `hub-report:${report.id}`,
    details: { status },
  });

  return NextResponse.json({ success: true, data: report });
}
