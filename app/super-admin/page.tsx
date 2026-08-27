import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  Users,
  Activity,
  CheckCircle,
  Clock,
  Award,
  FileText,
  DollarSign,
  Globe,
  Target,
  ArrowUpRight,
  Zap,
  ShieldCheck,
  Rocket
} from "lucide-react";
import { getSuperAdminStats, getRecentOperationalStream } from "./actions";
import { TacticalModules } from "@/components/dashboard/tactical-modules";

export const dynamic = "force-dynamic";

export default async function SuperAdminDashboard() {
  const stats = await getSuperAdminStats();
  const operationalStream = await getRecentOperationalStream();

  const iconMap: Record<string, any> = {
    FileText,
    Award,
    Building2: Globe, // Fallback
  };

  return (
    <div className="space-y-4 w-full">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-0">
        <div className="space-y-1">
          <h1 className="text-2xl lg:text-3xl font-black tracking-tighter text-brand-deep-dark">
            Super Admin <span className="text-brand-mint-teal italic">Dashboard</span>
          </h1>
        </div>
      </div>

      {/* High-Resolution KPI Grid (REAL DATA) */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Users", value: stats.totalUsers.toLocaleString(), growth: stats.userGrowth, icon: Users, color: "text-brand-mint-teal", bg: "bg-brand-mint-teal/10", shadow: "shadow-brand-mint-teal/10" },
          { label: "Registered Startups", value: stats.totalStartups.toLocaleString(), growth: stats.startupGrowth, icon: Rocket, color: "text-brand-startup-amber", bg: "bg-brand-startup-amber/10", shadow: "shadow-brand-startup-amber/10" },
          { label: "Platform Requests", value: stats.totalApplications.toLocaleString(), growth: stats.applicationGrowth, icon: FileText, color: "text-blue-600", bg: "bg-blue-50", shadow: "shadow-blue-600/10" },
          { label: "Ecosystem Funding", value: stats.totalFunding, growth: stats.fundingGrowth, icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50", shadow: "shadow-emerald-600/10" },
        ].map((kpi, i) => (
          <Card key={i} className={cn(
            "relative overflow-hidden border border-slate-200 shadow-xl shadow-slate-200/80 bg-white group hover:translate-y-[-4px] transition-all duration-300 hover:shadow-brand-mint-teal/20",
          )}>
             <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
               <span className="text-[11px] font-black text-brand-deep-dark uppercase tracking-widest">{kpi.label}</span>
               <div className={cn("p-2.5 rounded-xl transition-all duration-300", kpi.bg, kpi.color)}>
                 <kpi.icon className="h-5 w-5" />
               </div>
             </CardHeader>
             <CardContent>
               <div className={cn("text-4xl font-black tracking-tighter transition-colors", kpi.color)}>{kpi.value}</div>
               <div className="flex items-center gap-1.5 mt-2">
                 <div className={cn(
                   "flex items-center text-[11px] font-black px-2 py-0.5 rounded-full",
                   kpi.color === 'text-brand-mint-teal' ? 'bg-emerald-50 text-emerald-600' :
                   kpi.color === 'text-brand-startup-amber' ? 'bg-amber-50 text-amber-600' :
                   kpi.color === 'text-blue-600' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                 )}>
                   <ArrowUpRight className="h-3 w-3 mr-0.5" />
                   {kpi.growth}%
                 </div>
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Monthly Yield</span>
               </div>
             </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Ecosystem High-Density Indices */}
        <Card className="md:col-span-1 border border-slate-200 shadow-xl shadow-slate-200/80 bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-black tracking-tight text-brand-deep-dark">
              <Globe className="h-5 w-5 text-brand-mint-teal" />
              Ecosystem Indices
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {[
              { label: "Certified Entities", value: stats.certifiedStartups, progress: 41, color: "bg-brand-mint-teal" },
              { label: "Institutional Builders", value: stats.ecosystemBuilders, progress: 65, color: "bg-brand-startup-amber" },
              { label: "Strategic Stakeholders", value: stats.activeStakeholders, progress: 78, color: "bg-indigo-600" },
            ].map((item, i) => (
              <div key={i} className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-slate-800">{item.label}</span>
                  <Badge variant="secondary" className="bg-slate-50 text-brand-deep-dark font-black text-[11px] border border-slate-100">{item.value}</Badge>
                </div>
                <div className="relative h-2 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100/50">
                  <div 
                    className={cn("absolute inset-y-0 left-0 transition-all duration-1000 ease-out rounded-full", item.color)}
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Operational Efficiency Matrix */}
        <Card className="md:col-span-1 border border-slate-200 shadow-xl shadow-slate-200/80 bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-black tracking-tight text-brand-deep-dark">
              <Target className="h-5 w-5 text-brand-startup-amber" />
              Service Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3.5">
            {[
              { label: "Approval Rate", value: `${stats.applicationApprovalRate}%`, icon: CheckCircle, sub: "High Performance", color: "mint" },
              { label: "Avg Processing", value: stats.averageProcessingTime, icon: Clock, sub: "Cycle Efficiency", color: "blue" },
              { label: "User Feedback", value: `${stats.userSatisfaction}/5.0`, icon: Award, sub: "Satisfaction Index", color: "amber" },
            ].map((metric, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/50 border border-slate-200/40 group hover:bg-white hover:shadow-lg transition-all">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2.5 rounded-xl transition-all duration-300",
                    metric.color === 'mint' ? 'bg-brand-mint-teal/10 text-brand-mint-teal' :
                    metric.color === 'blue' ? 'bg-blue-50 text-blue-600' : 'bg-brand-startup-amber/10 text-brand-startup-amber'
                  )}>
                    <metric.icon className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className={cn(
                      "text-[9px] font-black uppercase tracking-widest leading-none",
                      metric.color === 'mint' ? 'text-brand-mint-teal' :
                      metric.color === 'blue' ? 'text-blue-600' : 'text-brand-startup-amber'
                    )}>{metric.sub}</span>
                    <span className="text-sm font-black text-slate-800 mt-1">{metric.label}</span>
                  </div>
                </div>
                <span className="text-xl font-black tracking-tighter text-brand-deep-dark">{metric.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* System Integrity Terminal */}
        <Card className="md:col-span-1 border border-slate-200 shadow-xl shadow-slate-200/80 bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-black tracking-tight text-brand-deep-dark">
              <Zap className="h-5 w-5 text-indigo-600" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-black text-slate-800 tracking-tight">Platform Uptime</span>
                <Badge className="bg-brand-mint-teal text-white font-black text-[11px] px-2 shadow-sm">{stats.systemUptime}%</Badge>
              </div>
              <div className="relative h-2 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100/50">
                <div 
                  className="absolute inset-y-0 left-0 bg-brand-mint-teal transition-all duration-1000 ease-out rounded-full shadow-[0_0_8px_rgba(33,197,152,0.4)]"
                  style={{ width: `${stats.systemUptime}%` }}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-2xl border border-slate-200/60 bg-slate-50/50 group hover:bg-white transition-colors">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block leading-none">Active Admins</span>
                <span className="text-2xl font-black text-brand-deep-dark mt-1.5 block">{stats.activeAdmins}</span>
              </div>
              <div className="p-3.5 rounded-2xl border border-rose-100 bg-rose-50/30 group hover:bg-white transition-colors">
                <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest block leading-none">Pending items</span>
                <span className="text-2xl font-black text-rose-600 mt-1.5 block">{stats.pendingApprovals}</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-100 group hover:shadow-md transition-all">
               <div className="flex items-center gap-2.5">
                 <ShieldCheck className="h-4 w-4 text-indigo-600" />
                 <div className="flex flex-col">
                   <span className="text-[9px] font-black text-indigo-900/50 uppercase tracking-widest leading-none">Health Score</span>
                   <span className="text-xs font-black text-indigo-900 mt-1 uppercase">Institutional Integrity</span>
                 </div>
               </div>
               <span className="text-2xl font-black text-indigo-600 tracking-tighter">{stats.systemHealth}/100</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Operational Stream */}
        <Card className="border border-slate-200 shadow-xl shadow-slate-200/80 bg-white">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 pb-4">
            <CardTitle className="text-lg font-black tracking-tight text-brand-deep-dark flex items-center gap-2">
              <Activity className="h-5 w-5 text-brand-mint-teal" />
              Operational Stream
            </CardTitle>
            <button className="text-[10px] font-black uppercase text-brand-mint-teal tracking-[0.2em] hover:underline">Full Log System</button>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {operationalStream.map((activity, i) => {
                const IconComp = iconMap[activity.icon] || Info;
                return (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group">
                    <div className={cn(
                      "p-3 rounded-xl shrink-0 group-hover:scale-110 transition-transform",
                      activity.color === 'mint' ? 'bg-brand-mint-teal/10 text-brand-mint-teal' :
                      activity.color === 'amber' ? 'bg-brand-startup-amber/10 text-brand-startup-amber' : 'bg-indigo-50 text-indigo-600'
                    )}>
                      <IconComp className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-brand-deep-dark">{activity.label}</p>
                      <p className="text-xs font-bold text-slate-500 truncate">{activity.context}</p>
                      <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-widest">{activity.time}</p>
                    </div>
                    <div className="h-2 w-2 rounded-full bg-slate-100 group-hover:bg-brand-mint-teal transition-colors self-center shadow-[0_0_8px_rgba(33,197,152,0.4)]" />
                  </div>
                );
              })}
              {operationalStream.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No recent platform activity</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tactical Modules */}
        <TacticalModules />
      </div>
    </div>
  );
}

const Info = (props: any) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </svg>
);
