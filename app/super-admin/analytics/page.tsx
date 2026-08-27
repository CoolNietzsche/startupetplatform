import { getSuperAdminStats, getDetailedAnalytics, getRecentOperationalStream } from "../actions";
import { AnalyticsDashboard } from "@/components/dashboard/analytics-dashboard";

export const dynamic = "force-dynamic";

export default async function AnalyticsDashboardPage() {
  const [stats, detailed, operationalStream] = await Promise.all([
    getSuperAdminStats(),
    getDetailedAnalytics(),
    getRecentOperationalStream()
  ]);

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <AnalyticsDashboard 
        stats={stats} 
        detailed={detailed} 
        operationalStream={operationalStream} 
      />
    </div>
  );
}
