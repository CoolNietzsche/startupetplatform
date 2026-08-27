import ApplicantMessagesClient from "@/app/dashboard/messages/client-page";
import { getUserInbox } from "@/lib/actions/communication";

export const dynamic = "force-dynamic";

export default async function EcosystemMessagesPage() {
  const inboxRes = await getUserInbox();
  const initialInbox = inboxRes.success ? inboxRes.data : [];

  return <ApplicantMessagesClient initialInbox={initialInbox as any[]} />;
}
