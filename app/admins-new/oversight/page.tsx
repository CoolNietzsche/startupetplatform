"use client";

import React, { useEffect, useState } from 'react';
import { Shield, Users, Clock, AlertTriangle, CheckCircle, XCircle, RefreshCw, Loader2, UserCheck, Activity, BarChart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getOversightStats } from "./actions";

interface CommitteePerf {
  committeeId: string; committeeName: string; entityType: string;
  totalAssignments: number; completedAssignments: number; overdueAssignments: number;
  avgCompletionDays: number; passRate: number; health: "HEALTHY" | "WARNING" | "CRITICAL"; memberCount: number;
}

interface CacMemberRow {
  id: string; name: string; email: string; role: string;
  committeeName: string; termEnd: string; isExpired: boolean; appointedAt: string;
}

export default function OversightPage() {
  const [perf, setPerf] = useState<CommitteePerf[]>([]);
  const [cacMembers, setCacMembers] = useState<CacMemberRow[]>([]);
  const [quorumConfig, setQuorumConfig] = useState<any>(null);
  const [stats, setStats] = useState({ totalCommittees: 0, totalActiveMembers: 0 });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const res = await getOversightStats();
    if (res.success) {
      setPerf(res.data.committeePerformance);
      setCacMembers(res.data.cacMembers);
      setQuorumConfig(res.data.quorumConfig);
      setStats(res.data);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const healthIcon = (h: string) => {
    if (h === "HEALTHY") return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (h === "WARNING") return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  const healthColor = (h: string) => {
    if (h === "HEALTHY") return "bg-green-100 text-green-700 border-green-200";
    if (h === "WARNING") return "bg-amber-100 text-amber-700 border-amber-200";
    return "bg-red-100 text-red-700 border-red-200";
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">CAC Oversight Dashboard</h1>
          <p className="text-sm text-muted-foreground">Committee health, performance, and CAC term management per Art. 33/34</p>
        </div>
        <Button variant="outline" onClick={fetchData} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Committees</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{stats.totalCommittees}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Active CAC Members</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{stats.totalActiveMembers}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Quorum Requirement</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{quorumConfig?.requiredApprovals || 0}</p>
            <p className="text-xs text-muted-foreground">Approvals needed (Art. 13.1)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">CAC Quorum Config</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{quorumConfig?.config?.requiredPresent || 0}%</p>
            <p className="text-xs text-muted-foreground">present + {quorumConfig?.config?.requiredApprovals || 0} approvals</p>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : (
        <>
          {/* Committee Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Committee Performance (Art. 33.2)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <th className="text-left pb-3 pl-2">Committee</th>
                      <th className="text-center pb-3">Type</th>
                      <th className="text-center pb-3">Members</th>
                      <th className="text-center pb-3">Assignments</th>
                      <th className="text-center pb-3">Completed</th>
                      <th className="text-center pb-3">Overdue</th>
                      <th className="text-center pb-3">Avg Days</th>
                      <th className="text-center pb-3">Pass Rate</th>
                      <th className="text-center pb-3">Health</th>
                    </tr>
                  </thead>
                  <tbody>
                    {perf.map((c) => (
                      <tr key={c.committeeId} className="border-b hover:bg-slate-50">
                        <td className="py-3 pl-2 font-medium">{c.committeeName}</td>
                        <td className="py-3 text-center"><Badge variant="outline">{c.entityType}</Badge></td>
                        <td className="py-3 text-center">{c.memberCount}</td>
                        <td className="py-3 text-center">{c.totalAssignments}</td>
                        <td className="py-3 text-center">{c.completedAssignments}</td>
                        <td className="py-3 text-center">
                          <span className={c.overdueAssignments > 0 ? "text-red-600 font-bold" : ""}>{c.overdueAssignments}</span>
                        </td>
                        <td className="py-3 text-center">{c.avgCompletionDays}d</td>
                        <td className="py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Progress value={c.passRate} className="w-16 h-2" />
                            <span className="font-bold text-xs">{c.passRate}%</span>
                          </div>
                        </td>
                        <td className="py-3 text-center">
                          <Badge className={healthColor(c.health)}>
                            {healthIcon(c.health)}<span className="ml-1">{c.health}</span>
                          </Badge>
                        </td>
                      </tr>
                    ))}
                    {perf.length === 0 && (
                      <tr><td colSpan={9} className="py-8 text-center text-muted-foreground">No committees found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* CAC Members */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> CAC Members & Terms (Art. 33.3 — 3-year term)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <th className="text-left pb-3 pl-2">Name</th>
                      <th className="text-left pb-3">Email</th>
                      <th className="text-center pb-3">Role</th>
                      <th className="text-left pb-3">Committee</th>
                      <th className="text-center pb-3">Appointed</th>
                      <th className="text-center pb-3">Term End</th>
                      <th className="text-center pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cacMembers.map((m) => (
                      <tr key={m.id} className="border-b hover:bg-slate-50">
                        <td className="py-3 pl-2 font-medium">{m.name}</td>
                        <td className="py-3 text-muted-foreground">{m.email}</td>
                        <td className="py-3 text-center">
                          <Badge variant={m.role === "CHAIR" ? "default" : "outline"}>{m.role}</Badge>
                        </td>
                        <td className="py-3">{m.committeeName}</td>
                        <td className="py-3 text-center text-xs">{new Date(m.appointedAt).toLocaleDateString()}</td>
                        <td className="py-3 text-center text-xs">{new Date(m.termEnd).toLocaleDateString()}</td>
                        <td className="py-3 text-center">
                          {m.isExpired ? (
                            <Badge className="bg-red-100 text-red-700 border-red-200">Expired</Badge>
                          ) : (
                            <Badge className="bg-green-100 text-green-700 border-green-200">Active</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                    {cacMembers.length === 0 && (
                      <tr><td colSpan={7} className="py-8 text-center text-muted-foreground">No CAC members found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
