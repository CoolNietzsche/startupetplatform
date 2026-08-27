import React from 'react';
import {
  Briefcase,
  AlertCircle,
  Award,
  DollarSign,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import EthiopiaMap from './components/ethiopia-map';
import { DashboardExport } from './components/dashboard-export';
import { getAdminDashboardStats } from './actions';
import { checkExpiredCertificates } from '@/lib/expiry';
import { runDailyMaintenance } from '@/lib/retention';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const expiryResult = await checkExpiredCertificates().catch(() => ({ expiredCount: 0 }));
  await runDailyMaintenance().catch(() => {});
  const stats = await getAdminDashboardStats();

  return (
    <div className="portal-page-container">
      <div className="portal-header">
        <div className="portal-title-group">
          <h1 className="text-3xl font-black tracking-tighter text-slate-900">Ecosystem Analytics</h1>
          <p className="text-muted-foreground">Monitor and analyze the Ethiopian startup ecosystem</p>
        </div>
        <div className="flex items-center gap-4">
          <Select defaultValue="30d">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          <DashboardExport stats={stats} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card className="premium-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Startups</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStartups}</div>
            <p className="text-xs text-muted-foreground mt-1">Active applications in system</p>
          </CardContent>
        </Card>
        <Card className="premium-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingReviews}</div>
            <p className="text-xs text-muted-foreground mt-1">Requiring attention</p>
          </CardContent>
        </Card>
        <Card className="premium-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certified Entities</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.certifiedStartups + stats.certifiedEcosystemBuilders}</div>
            <p className="text-xs text-muted-foreground mt-1">Startups + Ecosystem Builders</p>
          </CardContent>
        </Card>
        <Card className="premium-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">Registered platform users</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Application Submissions</CardTitle>
            <CardDescription>Monthly application volume trend</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] flex items-end gap-3 px-2">
              {stats.monthlyApplications.map(({ month, count }, i) => (
                <div key={month} className="premium-bar-chart-item group">
                  <div
                    className="premium-bar-filling bg-primary/80 group-hover:bg-primary"
                    style={{ height: `${Math.max((count / 70) * 100, 2)}%` }}
                  >
                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] font-bold hidden group-hover:block whitespace-nowrap bg-slate-800 text-white px-1.5 py-0.5 rounded shadow-xl">
                      {count} apps
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              {stats.monthlyApplications.map(({ month }) => (
                <div key={month} className="text-center">{month.substring(0, 3)}</div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="premium-card">
          <CardHeader>
            <CardTitle>Certification Levels</CardTitle>
            <CardDescription>Distribution by certification tier</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.certificationLevels.map(({ level, count }) => (
                <div key={level} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{level}</span>
                    <span className="text-sm text-muted-foreground">{count}</span>
                  </div>
                  <Progress value={count / Math.max(...stats.certificationLevels.map(l => l.count), 1) * 100} className="h-2" />
                </div>
              ))}
              {stats.certificationLevels.length === 0 && (
                <p className="text-sm text-muted-foreground">No certifications yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="col-span-3">
          <EthiopiaMap />
        </div>

        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Sector Distribution</CardTitle>
            <CardDescription>Startups by industry sector</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {stats.sectorDistribution.map(({ sector, count }) => (
                <div key={sector} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{sector}</span>
                    <span className="text-sm text-muted-foreground">{count}</span>
                  </div>
                  <Progress value={(count / Math.max(...stats.sectorDistribution.map(s => s.count), 1)) * 100} className="h-2" />
                </div>
              ))}
              {stats.sectorDistribution.length === 0 && (
                <p className="text-sm text-muted-foreground">No sector data yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="premium-card">
          <CardHeader>
            <CardTitle>Ecosystem Builders</CardTitle>
            <CardDescription>Supporting organizations by type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.ecosystemBuilders.map(({ type, count }) => (
                <div key={type} className="flex items-center">
                  <div className="w-full">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{type}</span>
                      <span className="text-xs text-muted-foreground">{count}</span>
                    </div>
                    <Progress
                      value={count}
                      max={Math.max(...stats.ecosystemBuilders.map(e => e.count), 1)}
                      className="h-2"
                    />
                  </div>
                </div>
              ))}
              {stats.ecosystemBuilders.length === 0 && (
                <p className="text-sm text-muted-foreground">No ecosystem builders yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="premium-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Applications</CardTitle>
              <CardDescription>Latest submissions requiring review</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="hidden md:flex">View All</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-slate-400 text-[11px] uppercase tracking-wider font-bold">
                  <th className="text-left pb-4 px-2">ID</th>
                  <th className="text-left pb-4 px-2">Entity Name</th>
                  <th className="text-left pb-4 px-2">Type</th>
                  <th className="text-left pb-4 px-2">Category</th>
                  <th className="text-left pb-4 px-2">Submitted</th>
                  <th className="text-left pb-4 px-2">Status</th>
                  <th className="text-right pb-4 px-2">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {stats.recentApplications.map((app) => (
                  <tr key={app.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-2 text-xs font-mono text-slate-500">{app.id.slice(0, 12)}</td>
                    <td className="py-4 px-2 font-semibold text-slate-900">{app.name}</td>
                    <td className="py-4 px-2 text-slate-600">{app.type}</td>
                    <td className="py-4 px-2 text-slate-600">
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold uppercase">{app.category}</span>
                    </td>
                    <td className="py-4 px-2 text-slate-500">{app.submitted}</td>
                    <td className="py-4 px-2">
                      <Badge
                        variant={
                          app.status === "CERTIFIED" ? "success" :
                            ["PENDING", "UNDER_REVIEW"].includes(app.status) ? "warning" :
                              app.status === "REJECTED" ? "destructive" :
                                "outline"
                        }
                        className="font-bold text-[10px] uppercase tracking-wider"
                      >
                        {app.status === "CERTIFIED" ? "Approved" :
                          app.status === "PENDING" ? "Pending Review" :
                            app.status === "UNDER_REVIEW" ? "Under Review" :
                              app.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-2 text-right">
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">Review</Button>
                    </td>
                  </tr>
                ))}
                {stats.recentApplications.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">No recent applications</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
