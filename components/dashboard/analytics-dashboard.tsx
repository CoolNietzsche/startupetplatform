"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { 
  BarChart3, 
  TrendingUp, 
  Users,
  Building2,
  Award,
  FileText,
  Download,
  DollarSign,
  ArrowUpRight,
  MapPin,
  Wallet,
  Target,
  Info
} from "lucide-react";

interface AnalyticsProps {
  stats: any;
  detailed: any;
  operationalStream: any;
}

export function AnalyticsDashboard({ stats, detailed, operationalStream }: AnalyticsProps) {
  const [timeRange, setTimeRange] = useState("30days");
  const [activeSection, setActiveSection] = useState("overview");

  const menuItems = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "startups", label: "Startup Analytics", icon: Building2 },
    { id: "funding", label: "Funding & Investment", icon: Wallet },
    { id: "regional", label: "Regional Distribution", icon: MapPin },
    { id: "performance", label: "Performance Metrics", icon: Target }
  ];

  const handleExportData = () => {
    alert("Analytics data export initiated...");
  };

  const iconMap: Record<string, any> = {
    FileText,
    Award,
    Users,
  };

  return (
    <div className="space-y-6">
      {/* Header - Adaptive Layout */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-brand-deep-dark">Analytics Dashboard</h1>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-full md:w-[180px] border-slate-200 bg-white font-black text-brand-deep-dark">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days" className="font-black">Last 7 days</SelectItem>
              <SelectItem value="30days" className="font-black">Last 30 days</SelectItem>
              <SelectItem value="90days" className="font-black">Last 90 days</SelectItem>
              <SelectItem value="all" className="font-black">All time</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExportData} className="flex-1 md:flex-none bg-brand-deep-dark hover:bg-slate-800 text-white font-black">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Tactical Navigation Sidebar - Responsive Orchestration */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 scrollbar-hide lg:sticky lg:top-6">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={cn(
                    "whitespace-nowrap flex-shrink-0 lg:w-full flex items-center justify-between px-5 py-3 lg:py-4 text-xs lg:text-sm font-black rounded-xl lg:rounded-2xl transition-all duration-300 group",
                    isActive
                      ? "bg-brand-mint-teal/20 text-brand-mint-teal shadow-[0_4_24px_rgba(33,197,152,0.1)] translate-x-1"
                      : "text-slate-500 hover:text-brand-deep-dark hover:bg-white hover:translate-x-1"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={cn(
                      "h-4 w-4 lg:h-5 lg:w-5 transition-transform duration-300 group-hover:scale-110",
                      isActive ? "text-brand-mint-teal" : "text-slate-400 group-hover:text-brand-deep-dark"
                    )} />
                    <span className="tracking-tight">{item.label}</span>
                  </div>
                  {isActive && <div className="hidden lg:block h-1.5 w-1.5 rounded-full bg-brand-mint-teal animate-pulse shadow-[0_0_8px_rgba(33,197,152,0.6)]" />}
                </button>
              );
            })}
          </nav>
        </aside>

        <div className="flex-1 space-y-6 overflow-hidden">
          {activeSection === "overview" && (
            <div className="space-y-6">
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {[
                  { label: "Total Users", value: stats.totalUsers, growth: stats.userGrowth, icon: Users, color: "mint" },
                  { label: "Total Startups", value: stats.totalStartups, growth: stats.startupGrowth, icon: Building2, color: "amber" },
                  { label: "Applications", value: stats.totalApplications, growth: stats.applicationGrowth, icon: FileText, color: "blue" },
                  { label: "Certs Issued", value: stats.certifiedStartups, growth: 10.7, icon: Award, color: "emerald" },
                  { label: "Investment", value: stats.totalFunding, growth: 22.1, icon: DollarSign, color: "green" },
                  { label: "Eco Builders", value: stats.ecosystemBuilders, growth: 6.4, icon: Building2, color: "indigo" },
                ].map((kpi, i) => (
                  <Card key={i} className="border border-slate-200 shadow-xl shadow-slate-200/50 bg-white group hover:translate-y-[-2px] transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <span className="text-[11px] font-black text-brand-deep-dark uppercase tracking-widest">{kpi.label}</span>
                      <kpi.icon className="h-4 w-4 text-slate-400 group-hover:text-brand-mint-teal transition-colors" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-black text-brand-deep-dark tracking-tighter">{kpi.value}</div>
                      <div className="flex items-center text-[11px] font-black text-emerald-600 mt-1">
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        +{kpi.growth}% Yield
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid gap-4 grid-cols-1 xl:grid-cols-2">
                <Card className="border border-slate-200 shadow-xl shadow-slate-200/50 bg-white">
                  <CardHeader>
                    <CardTitle className="text-lg font-black text-brand-deep-dark">Regional Distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {detailed.regionalData.map((item: any) => (
                      <div key={item.region} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-black text-slate-800">{item.region}</span>
                          <span className="text-xs font-black text-slate-600">{item.startups} startups</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 border border-slate-200/50 overflow-hidden">
                          <div 
                            className="bg-brand-mint-teal h-full transition-all duration-1000 shadow-[0_0_8px_rgba(33,197,152,0.4)]" 
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="border border-slate-200 shadow-xl shadow-slate-200/50 bg-white">
                  <CardHeader>
                    <CardTitle className="text-lg font-black text-brand-deep-dark">Sector Distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {detailed.sectorData.map((item: any) => (
                      <div key={item.sector} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100/50 group hover:bg-white hover:shadow-md transition-all">
                        <div className="flex items-center gap-3 flex-1">
                          <div className={cn("w-3 h-3 rounded-full shadow-sm", item.color)} />
                          <span className="text-sm font-black text-slate-800">{item.sector}</span>
                        </div>
                        <Badge variant="outline" className="font-black border-slate-200 bg-white text-brand-deep-dark">{item.count}</Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <Card className="border border-slate-200 shadow-xl shadow-slate-200/80 bg-white">
                <CardHeader>
                  <CardTitle className="text-lg font-black text-brand-deep-dark">Monthly Analysis</CardTitle>
                  <CardDescription className="text-[10px] font-black text-slate-500 uppercase tracking-[0.1em]">Historical application trends</CardDescription>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <div className="flex items-end justify-between h-64 min-w-[500px] gap-4 px-2 pb-4">
                    {detailed.monthlyApplications.map((item: any) => {
                      const maxCount = Math.max(...detailed.monthlyApplications.map((m: any) => m.count));
                      const height = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                      return (
                        <div key={item.month} className="flex-1 flex flex-col items-center gap-3">
                          <div className="text-xs font-black text-brand-mint-teal">{item.count}</div>
                          <div 
                            className="w-full bg-brand-mint-teal/20 hover:bg-brand-mint-teal rounded-t-xl transition-all duration-500 shadow-[0_-4px_12px_rgba(33,197,152,0.1)] border-x border-t border-brand-mint-teal/10"
                            style={{ height: `${Math.max(height, 5)}%` }}
                          />
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.month}</div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-slate-200 shadow-xl shadow-slate-200/80 bg-white">
                <CardHeader>
                  <CardTitle className="text-lg font-black text-brand-deep-dark">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {operationalStream.map((activity: any, i: number) => {
                    const IconComp = iconMap[activity.icon] || Info;
                    return (
                      <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:bg-white transition-all">
                        <div className={cn(
                          "p-4 rounded-xl w-fit",
                          activity.color === 'mint' ? 'bg-brand-mint-teal/10 text-brand-mint-teal' :
                          activity.color === 'amber' ? 'bg-brand-startup-amber/10 text-brand-startup-amber' : 'bg-indigo-50 text-indigo-600'
                        )}>
                          <IconComp className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-black text-brand-deep-dark">{activity.label}</p>
                          <p className="text-xs font-bold text-slate-500">{activity.context}</p>
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{activity.time}</span>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Startup Analytics Section */}
          {activeSection === "startups" && (
            <div className="space-y-6">
              <Card className="border border-slate-200 shadow-xl shadow-slate-200/50 bg-white">
                <CardHeader>
                  <CardTitle className="text-lg font-black text-brand-deep-dark flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-brand-mint-teal" />
                    Startup Trajectory
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="overflow-x-auto pb-4">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-4">Ecosystem Pipeline</span>
                    <div className="flex items-end justify-between h-48 min-w-[400px] gap-4 px-2">
                      {detailed.monthlyApplications.map((item: any) => {
                        const maxCount = Math.max(...detailed.monthlyApplications.map((m: any) => m.count));
                        const height = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                        return (
                          <div key={item.month} className="flex-1 flex flex-col items-center gap-3">
                            <div className="text-xs font-black text-brand-mint-teal">{item.count}</div>
                            <div 
                              className="w-full bg-brand-mint-teal/20 rounded-t-xl transition-all duration-500 border-x border-t border-brand-mint-teal/10 hover:bg-brand-mint-teal"
                              style={{ height: `${Math.max(height, 5)}%` }}
                            />
                            <div className="text-[10px] font-black text-slate-400">{item.month}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Funding & Investment Section */}
          {activeSection === "funding" && (
            <div className="space-y-6">
              <Card className="border border-slate-200 shadow-xl shadow-slate-200/50 bg-white">
                <CardHeader>
                  <CardTitle className="text-lg font-black text-brand-deep-dark flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-brand-startup-amber" />
                    Financial Intelligence
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                    <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 flex flex-col justify-between h-36">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Aggregate Capital</span>
                      <div className="mt-2">
                        <p className="text-2xl lg:text-3xl font-black text-brand-deep-dark tracking-tighter">{stats.totalFunding}</p>
                        <div className="flex items-center text-[11px] font-black text-emerald-600 mt-1">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Seed Baseline
                        </div>
                      </div>
                    </div>
                    <div className="p-6 rounded-3xl bg-brand-mint-teal/5 border border-brand-mint-teal/10 flex flex-col justify-between h-36">
                      <span className="text-[10px] font-black text-brand-mint-teal uppercase tracking-widest">Investment Nodes</span>
                      <div className="mt-2 text-2xl font-black text-brand-mint-teal tracking-tighter">{stats.activeInvestmentNodes} Entities</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Regional Distribution Section */}
          {activeSection === "regional" && (
            <div className="space-y-6">
              <Card className="border border-slate-200 shadow-xl shadow-slate-200/50 bg-white">
                <CardHeader>
                  <CardTitle className="text-lg font-black text-brand-deep-dark flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-indigo-600" />
                    Geographical Domain
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                    {detailed.regionalData.map((item: any) => (
                      <div key={item.region} className="p-5 rounded-3xl bg-slate-50 border border-slate-100 space-y-3 hover:bg-white hover:shadow-lg transition-all">
                        <div className="flex items-center justify-between">
                          <h4 className="font-black text-sm lg:text-base text-slate-800">{item.region}</h4>
                          <Badge variant="outline" className="font-black border-slate-200 bg-white">{item.startups} Nodes</Badge>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-brand-mint-teal h-full transition-all duration-1000 shadow-[0_0_8px_rgba(33,197,152,0.4)]" 
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.percentage}% Footprint</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Performance Metrics Section */}
          {activeSection === "performance" && (
            <div className="space-y-6">
              <Card className="border border-slate-200 shadow-xl shadow-slate-200/50 bg-white">
                <CardHeader>
                  <CardTitle className="text-lg font-black text-brand-deep-dark flex items-center gap-2">
                    <Target className="h-5 w-5 text-brand-mint-teal" />
                    Efficiency Terminal
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
                    {[
                      { label: "Approval Delta", value: `${stats.applicationApprovalRate}%`, icon: Building2, color: "text-emerald-600" },
                      { label: "Processing Latency", value: stats.averageProcessingTime, icon: FileText, color: "text-blue-600" },
                      { label: "Institutional Health", value: `${stats.systemHealth}/100`, icon: Award, color: "text-indigo-600" },
                      { label: "Satisfaction Index", value: `${stats.userSatisfaction}/5.0`, icon: Award, color: "text-amber-600" },
                    ].map((idx, i) => (
                      <div key={i} className="p-6 rounded-3xl border border-slate-100 bg-slate-50/50 text-center flex flex-col items-center group hover:bg-white hover:shadow-xl hover:translate-y-[-4px] transition-all">
                        <div className="p-4 rounded-2xl mb-4 bg-white shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                          <idx.icon className={cn("h-7 w-7", idx.color)} />
                        </div>
                        <span className="text-[11px] font-black text-brand-deep-dark/80 uppercase tracking-widest block mb-2">{idx.label}</span>
                        <span className="text-2xl lg:text-3xl font-black text-brand-deep-dark tracking-tighter">{idx.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
