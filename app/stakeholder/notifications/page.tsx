"use client";

import { useSession } from "next-auth/react";
import { 
  Bell, 
  ShieldCheck, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  MoreHorizontal,
  ChevronRight,
  Target,
  ArrowUpRight,
  Activity,
  Globe,
  Zap
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function StakeholderNotificationsPage() {
  const { data: session } = useSession();

  const notifications = [
    {
      id: 1,
      title: "Quarterly Ecosystem Report Available",
      message: "The Q1 2026 Innovation Index and Regional Scaling Report has been generated for your institution.",
      type: "report",
      status: "unread",
      time: "2 hours ago",
      priority: "high"
    },
    {
      id: 2,
      title: "Institutional Audit Complete",
      message: "Security synchronization for your coordinator nodes was successful. No anomalies detected.",
      type: "security",
      status: "read",
      time: "5 hours ago",
      priority: "medium"
    },
    {
      id: 3,
      title: "New Coordinator Verified",
      message: "The newly added administrator for your institution has successfully completed their initial sync.",
      type: "system",
      status: "read",
      time: "1 day ago",
      priority: "low"
    }
  ];

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl lg:text-4xl font-black tracking-tighter text-brand-deep-dark">
            Notification <span className="text-brand-mint-teal italic">Hub</span>
          </h1>
          <p className="text-slate-500 font-bold text-sm tracking-tight">
            Institutional alerts and strategic intelligence updates
          </p>
        </div>
        <Button className="bg-brand-mint-teal text-white font-black px-6 rounded-xl h-10 shadow-lg shadow-brand-mint-teal/20">
          <CheckCircle2 className="mr-2 h-4 w-4" />
          Mark All Read
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
            <div className="relative flex-1 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-brand-mint-teal transition-colors" />
              <Input 
                placeholder="Search alerts..." 
                className="pl-10 h-10 border-none bg-transparent focus-visible:ring-0 font-medium"
              />
            </div>
            <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 rounded-xl">
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-3">
            {notifications.map((alert) => (
              <Card key={alert.id} className={cn(
                "border border-slate-200 shadow-xl shadow-slate-200/50 bg-white transition-all hover:border-brand-mint-teal/30 cursor-pointer overflow-hidden group",
                alert.status === 'unread' && "border-l-4 border-l-brand-mint-teal"
              )}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className={cn(
                      "p-3 rounded-2xl shrink-0 transition-transform group-hover:scale-110",
                      alert.type === 'report' ? 'bg-indigo-50 text-indigo-600' :
                      alert.type === 'security' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-600'
                    )}>
                      {alert.type === 'report' ? <Target className="h-5 w-5" /> : 
                       alert.type === 'security' ? <ShieldCheck className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <h4 className="font-black text-brand-deep-dark text-lg leading-snug group-hover:text-brand-mint-teal transition-colors">{alert.title}</h4>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0 mt-1">{alert.time}</span>
                      </div>
                      <p className="text-sm font-medium text-slate-500 mt-1 leading-relaxed">{alert.message}</p>
                      <div className="flex items-center gap-3 mt-4">
                        <Badge className={cn(
                          "uppercase text-[10px] font-black px-2.5 py-0.5 rounded-lg border-0",
                          alert.priority === 'high' ? 'bg-rose-100 text-rose-600' :
                          alert.priority === 'medium' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'
                        )}>
                          {alert.priority} Priority
                        </Badge>
                        <div className="h-1 w-1 rounded-full bg-slate-300" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol Index: {alert.id * 123}</span>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-300 self-center group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Intelligence Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border border-slate-200 shadow-xl bg-white overflow-hidden rounded-3xl">
            <CardHeader className="bg-brand-deep-dark text-white text-center py-8 relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-mint-teal/10 rounded-full blur-3xl" />
              <Activity className="h-10 w-10 text-brand-mint-teal mx-auto mb-4" />
              <CardTitle className="text-2xl font-black italic tracking-tighter">System Health</CardTitle>
              <CardDescription className="text-white/60 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">Live Institutional Telemetry</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
               {[
                 { label: "Sync Latency", value: "14ms", status: "Optimal", color: "text-emerald-500" },
                 { label: "Audit Integrity", value: "100%", status: "Verified", color: "text-brand-mint-teal" },
                 { label: "Protocol Compliance", value: "High", status: "Verified", color: "text-brand-startup-amber" },
               ].map((item, i) => (
                 <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                   <div className="space-y-0.5">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                     <p className="text-xl font-black text-brand-deep-dark tracking-tighter">{item.value}</p>
                   </div>
                   <div className={cn("text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-white border border-slate-100", item.color)}>
                     {item.status}
                   </div>
                 </div>
               ))}
            </CardContent>
          </Card>

          <div className="p-8 bg-gradient-to-br from-brand-mint-teal to-brand-mint-teal/80 rounded-[40px] shadow-2xl shadow-brand-mint-teal/20 text-white relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10 group-hover:scale-110 transition-transform" />
             <Zap className="h-10 w-10 mb-4" />
             <h3 className="text-2xl font-black tracking-tighter leading-tight italic">Need Technical Support?</h3>
             <p className="text-white/80 font-bold text-sm mt-2 leading-relaxed">Our institutional support team is available 24/7 for security audit escalations.</p>
             <Button className="mt-6 w-full bg-white text-brand-mint-teal font-black h-12 rounded-2xl hover:bg-slate-50 transition-colors uppercase tracking-widest text-xs">
               Contact Support Node
             </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
