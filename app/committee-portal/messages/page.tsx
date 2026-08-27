import CommitteeMessagesClient from "./client-page";
import { getUserInbox } from "@/lib/actions/communication";

export const dynamic = "force-dynamic";

export default async function CommitteeMessagesPage() {
  const inboxRes = await getUserInbox();
  const initialInbox = inboxRes.success ? (inboxRes.data || []) : [];

  // Fix payload serialization for Date objects returned by Prisma
  const serializedInbox = JSON.parse(JSON.stringify(initialInbox));

  return <CommitteeMessagesClient initialInbox={serializedInbox} />;
}
