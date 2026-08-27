"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Users,
  UserCog,
  Building2,
  BarChart3,
  Rocket
} from "lucide-react";

export function TacticalModules() {
  const router = useRouter();

  const actions = [
    { label: "Add Authorized User", icon: Users, route: "/super-admin/users", desc: "Access level orchestration", color: "mint" },
    { label: "Form Committee", icon: UserCog, route: "/super-admin/committees", desc: "Strategic oversight formation", color: "amber" },
    { label: "Register Stakeholder", icon: Building2, route: "/super-admin/stakeholders", desc: "Institutional partner sync", color: "indigo" },
    { label: "Platform Analytics", icon: BarChart3, route: "/super-admin/analytics", desc: "Deep ecosystem intelligence", color: "slate" },
  ];

  return (
    <Card className="border border-slate-200 shadow-xl shadow-slate-200/80 bg-white">
      <CardHeader className="border-b border-slate-50 pb-4">
        <CardTitle className="text-lg font-black tracking-tight text-brand-deep-dark flex items-center gap-2">
          <Rocket className="h-5 w-5 text-brand-startup-amber" />
          Tactical Modules
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 gap-4">
          {actions.map((action, i) => (
            <button
              key={i}
              onClick={() => router.push(action.route)}
              className="flex flex-col items-start gap-3 p-5 rounded-3xl bg-slate-50/50 border border-slate-200/40 hover:bg-white hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300 group"
            >
              <div className={cn(
                "p-3 rounded-2xl group-hover:scale-110 transition-transform shadow-sm",
                action.color === 'mint' ? 'bg-brand-mint-teal text-white shadow-emerald-500/10' :
                action.color === 'amber' ? 'bg-brand-startup-amber text-white shadow-amber-500/10' : 
                action.color === 'indigo' ? 'bg-indigo-600 text-white shadow-indigo-500/10' : 'bg-slate-900 text-white shadow-slate-500/10'
              )}>
                <action.icon className="h-6 w-6" />
              </div>
              <div className="text-left mt-1">
                <span className="text-sm font-black text-brand-deep-dark block leading-tight">{action.label}</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight block mt-1.5 leading-tight group-hover:text-brand-mint-teal">Tactical Module</span>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
