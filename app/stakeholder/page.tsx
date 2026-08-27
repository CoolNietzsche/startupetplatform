import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  Users,
  Activity,
  FileText,
  DollarSign,
  Globe,
  Target,
  ArrowUpRight,
  Zap,
  ShieldCheck,
  Rocket,
  Building2,
  CheckCircle,
  Clock,
  Award
} from "lucide-react";
import { getSuperAdminStats, getRecentOperationalStream } from "@/app/super-admin/actions";

export const dynamic = "force-dynamic";

export default async function StakeholderDashboard() {
  const session = await getServerSession(authOptions);
  
  // Reuse stats fetching - the action already handles stakeholderId filtering internally
  const stats = await getSuperAdminStats();
  const operationalStream = await getRecentOperationalStream();

  return (
    <div className="space-y-6 w-full pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl lg:text-4xl font-black tracking-tighter text-brand-deep-dark">
            Institutional <span className="text-brand-mint-teal italic">Intelligence</span>
          </h1>
          <p className="text-slate-500 font-bold text-sm tracking-tight">
            Ecosystem oversight and digital economic monitoring for {session?.user?.name || 'Stakeholder'}
          </p>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Ecosystem Users", value: stats.totalUsers.toLocaleString(), growth: stats.userGrowth, icon: Users, color: "text-brand-mint-teal", bg: "bg-brand-mint-teal/10" },
          { label: "Certified Startups", value: stats.totalStartups.toLocaleString(), growth: stats.startupGrowth, icon: Rocket, color: "text-brand-startup-amber", bg: "bg-brand-startup-amber/10" },
          { label: "Protocol Requests", value: stats.totalApplications.toLocaleString(), growth: stats.applicationGrowth, icon: FileText, color: "text-indigo-600", bg: "bg-indigo-50" },
          { label: "Ecosystem Yield", value: stats.totalFunding, growth: stats.fundingGrowth, icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
        ].map((kpi, i) => (
          <Card key={i} className="border border-slate-200 shadow-xl shadow-slate-200/80 bg-white group hover:-translate-y-1 transition-all duration-300">
             <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0 text-slate-800">
               <span className="text-[10px] font-black uppercase tracking-widest">{kpi.label}</span>
               <div className={cn("p-2.5 rounded-xl", kpi.bg, kpi.color)}>
                 <kpi.icon className="h-5 w-5" />
               </div>
             </CardHeader>
             <CardContent>
               <div className={cn("text-4xl font-black tracking-tighter", kpi.color)}>{kpi.value}</div>
               <div className="flex items-center gap-1.5 mt-2">
                 <div className="flex items-center text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
                   <ArrowUpRight className="h-3 w-3 mr-0.5" />
                   {kpi.growth}%
                 </div>
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Yield Velocity</span>
               </div>
             </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Indices */}
        <Card className="md:col-span-1 border border-slate-200 shadow-xl shadow-slate-200/80 bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-black tracking-tight text-brand-deep-dark flex items-center gap-2">
              <Globe className="h-5 w-5 text-brand-mint-teal" />
              Ecosystem Indices
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {[
              { label: "Certified Entities", value: stats.certifiedStartups, progress: 41, color: "bg-brand-mint-teal" },
              { label: "Institutional Presence", value: stats.ecosystemBuilders, progress: 65, color: "bg-brand-startup-amber" },
              { label: "Global Stakeholders", value: stats.activeStakeholders, progress: 78, color: "bg-indigo-600" },
            ].map((item, i) => (
              <div key={i} className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-slate-800">{item.label}</span>
                  <div className="bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100 text-brand-deep-dark font-black text-[11px]">{item.value}</div>
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

        {/* Service Performance */}
        <Card className="md:col-span-1 border border-slate-200 shadow-xl shadow-slate-200/80 bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-black tracking-tight text-brand-deep-dark flex items-center gap-2">
              <Target className="h-5 w-5 text-brand-startup-amber" />
              Portal Efficiency
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Approval Latency", value: `${stats.applicationApprovalRate}%`, icon: CheckCircle, color: "mint" },
              { label: "Cycle Management", value: stats.averageProcessingTime, icon: Clock, color: "blue" },
              { label: "Institutional Trust", value: `${stats.userSatisfaction}/5.0`, icon: Award, color: "amber" },
            ].map((metric, i) => (
              <div key={i} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/50 border border-slate-200/40">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2.5 rounded-xl",
                    metric.color === 'mint' ? 'bg-brand-mint-teal/10 text-brand-mint-teal' :
                    metric.color === 'blue' ? 'bg-blue-50 text-blue-600' : 'bg-brand-startup-amber/10 text-brand-startup-amber'
                  )}>
                    <metric.icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-black text-slate-800">{metric.label}</span>
                </div>
                <span className="text-xl font-black tracking-tighter text-brand-deep-dark">{metric.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* System Integrity */}
        <Card className="md:col-span-1 border border-slate-200 shadow-xl shadow-slate-200/80 bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-black tracking-tight text-brand-deep-dark flex items-center gap-2">
              <Zap className="h-5 w-5 text-indigo-600" />
              Portal Availability
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-black text-slate-800 tracking-tight">Active Uptime</span>
                <div className="bg-brand-mint-teal text-white font-black text-[10px] px-2 py-0.5 rounded-full">{stats.systemUptime}%</div>
              </div>
              <div className="relative h-2 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100/50">
                <div 
                  className="absolute inset-y-0 left-0 bg-brand-mint-teal transition-all duration-1000 ease-out rounded-full"
                  style={{ width: `${stats.systemUptime}%` }}
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100">
               <div className="flex items-center gap-2.5">
                 <ShieldCheck className="h-5 w-5 text-indigo-600" />
                 <span className="text-xs font-black text-indigo-900 uppercase">Institutional Trust Score</span>
               </div>
               <span className="text-2xl font-black text-indigo-600 tracking-tighter">{stats.systemHealth}/100</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Operational Stream */}
        <Card className="border border-slate-200 shadow-xl shadow-slate-200/80 bg-white">
          <CardHeader className="border-b border-slate-50 pb-4">
            <CardTitle className="text-lg font-black tracking-tight text-brand-deep-dark flex items-center gap-2">
              <Activity className="h-5 w-5 text-brand-mint-teal" />
              Institutional Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {operationalStream.map((activity, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group">
                  <div className={cn(
                    "p-3 rounded-xl shrink-0 transition-transform group-hover:scale-110",
                    activity.color === 'mint' ? 'bg-brand-mint-teal/10 text-brand-mint-teal' : 'bg-brand-startup-amber/10 text-brand-startup-amber'
                  )}>
                    <Activity className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-brand-deep-dark">{activity.label}</p>
                    <p className="text-xs font-bold text-slate-500 truncate">{activity.context}</p>
                    <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-widest">{activity.time}</p>
                  </div>
                  <div className="h-2 w-2 rounded-full bg-slate-100 group-hover:bg-brand-mint-teal transition-colors self-center" />
                </div>
              ))}
              {operationalStream.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No recent organizational activities recorded.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Quick Information */}
        <Card className="border border-slate-200 shadow-xl shadow-slate-200/80 bg-white overflow-hidden">
          <div className="p-8 h-full flex flex-col justify-center bg-gradient-to-br from-brand-deep-dark to-slate-900 border-brand-deep-dark text-white relative">
             <div className="absolute top-0 right-0 w-64 h-64 bg-brand-mint-teal/10 rounded-full blur-[100px] pointer-events-none" />
             <div className="relative z-10 space-y-6">
               <Building2 className="h-12 w-12 text-brand-startup-amber" />
               <div className="space-y-2">
                 <h3 className="text-3xl font-black tracking-tighter leading-none italic">Welcome back.</h3>
                 <p className="text-slate-400 font-bold text-sm max-w-sm">
                   Your institutional portal provides privileged access to Ethiopia's digital economic infrastructure. Use the sidebar to manage your organizational profile and administrators.
                 </p>
               </div>
               <div className="pt-4 flex gap-3">
                  <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 flex flex-col items-center">
                    <span className="text-[9px] font-black text-white/40 uppercase">Role</span>
                    <span className="text-[11px] font-black text-brand-startup-amber uppercase">STAKEHOLDER</span>
                  </div>
                  <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 flex flex-col items-center">
                    <span className="text-[9px] font-black text-white/40 uppercase">Status</span>
                    <span className="text-[11px] font-black text-brand-mint-teal uppercase">ACTIVE</span>
                  </div>
               </div>
             </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
