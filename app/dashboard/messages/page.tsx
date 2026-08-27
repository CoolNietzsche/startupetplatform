import ApplicantMessagesClient from "./client-page";
import { getUserInbox } from "@/lib/actions/communication";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function DashboardMessagesPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) return null;
  const userId = session.user.id;

  const inboxRes = await getUserInbox();
  
  // Fetch user applications for context-aware chat initiation
  const applications = await db.application.findMany({
    where: { userId },
    select: { id: true, startupName: true, status: true, reviewerId: true }
  });

  const ecoApplications = await db.ecoApplication.findMany({
    where: { builder: { userId } },
    select: { id: true, name: true, status: true, reviewerId: true }
  });

  const initialInbox = inboxRes.success ? inboxRes.data : [];

  return (
    <ApplicantMessagesClient 
      initialInbox={initialInbox as any[]} 
      applications={applications}
      ecoApplications={ecoApplications}
    />
  );
}

