import AdminMessagesClient from "./client-page";
import { getUserInbox } from "@/lib/actions/communication";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  const inboxRes = await getUserInbox();
  
  // Cast or pass empty array if failed
  const initialInbox = inboxRes.success ? inboxRes.data : [];

  return <AdminMessagesClient initialInbox={initialInbox as any[]} />;
}
