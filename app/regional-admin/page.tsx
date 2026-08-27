import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getRegionalDashboardStats } from "./actions";

export const dynamic = "force-dynamic";

export default async function RegionalAdminDashboard() {
  const stats = await getRegionalDashboardStats();

  const kpis = [
    { label: "Total Hubs", value: stats.hubs.length },
    { label: "Total Startups", value: stats.totalStartups },
    { label: "Active Programs", value: stats.totalPrograms },
    { label: "Mentors Assigned", value: stats.totalMentors },
  ];

  return (
    <div className="space-y-6 w-full pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl lg:text-4xl font-black tracking-tighter text-slate-900">
            Regional <span className="text-blue-600 italic">Dashboard</span>
          </h1>
          <p className="text-slate-500 font-bold text-sm tracking-tight">
            Oversight and management of hubs across regions
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, i) => (
          <Card key={i} className="border border-slate-200 shadow-lg bg-white">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <span className="text-xs font-black uppercase tracking-widest text-slate-500">{kpi.label}</span>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black tracking-tighter text-slate-900">{kpi.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6">
        {stats.hubs.map((hub) => (
          <Card key={hub.id} className="border border-slate-200 shadow-lg bg-white">
            <CardHeader>
              <CardTitle className="text-xl font-black tracking-tight text-slate-900">{hub.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3 mb-4">
                <div className="text-sm"><span className="font-bold text-slate-500">Startups:</span> {hub.startups.length}</div>
                <div className="text-sm"><span className="font-bold text-slate-500">Programs:</span> {hub.incubationPrograms.length}</div>
                <div className="text-sm"><span className="font-bold text-slate-500">Mentors:</span> {hub.mentorAssignments.length}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
