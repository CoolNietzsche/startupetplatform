import { getStartupsForDashboard } from "./actions";
import { StartupsClient } from "./startups-client";

export const dynamic = "force-dynamic";

export default async function StartupsPage() {
  const result = await getStartupsForDashboard();
  const startups = result.success ? result.data : [];

  return <StartupsClient startups={startups} />;
}
