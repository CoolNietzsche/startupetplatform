"use client";

import React, { useEffect, useState } from 'react';
import { BarChart, FileText, RefreshCw, Loader2, AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { getDirectiveReportData } from "./actions";
import type { ReportRequirement } from "@/lib/directive/reports";

interface EntityReportStatus { entityId: string; entityName: string; reportStatus: string; dueDate: string | null; }

export default function DirectiveReportsPage() {
  const [entityType, setEntityType] = useState<"startup" | "ecosystem">("startup");
  const [requirements, setRequirements] = useState<ReportRequirement[]>([]);
  const [reportStatuses, setReportStatuses] = useState<{ requirement: ReportRequirement; entityStatuses: EntityReportStatus[] }[]>([]);
  const [stats, setStats] = useState({ compliant: 0, overdue: 0, dueSoon: 0, neverSubmitted: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  const fetchData = async (type: "startup" | "ecosystem") => {
    setLoading(true);
    const res = await getDirectiveReportData(type);
    if (res.success) {
      setRequirements(res.data.requirements);
      setReportStatuses(res.data.reportStatuses);
      setStats(res.data.stats);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(entityType); }, [entityType]);

  const statusBadge = (s: string) => {
    switch (s) {
      case "COMPLIANT": return <Badge className="bg-green-100 text-green-700 border-green-200"><CheckCircle className="h-3 w-3 mr-1" />Compliant</Badge>;
      case "OVERDUE": return <Badge className="bg-red-100 text-red-700 border-red-200"><XCircle className="h-3 w-3 mr-1" />Overdue</Badge>;
      case "DUE_SOON": return <Badge className="bg-amber-100 text-amber-700 border-amber-200"><Clock className="h-3 w-3 mr-1" />Due Soon</Badge>;
      case "NEVER_SUBMITTED": return <Badge variant="outline"><AlertTriangle className="h-3 w-3 mr-1" />Never Submitted</Badge>;
      default: return <Badge variant="outline">{s}</Badge>;
    }
  };

  const statusColor = (s: string) => {
    if (s === "COMPLIANT") return "bg-green-50";
    if (s === "OVERDUE") return "bg-red-50";
    if (s === "DUE_SOON") return "bg-amber-50";
    return "";
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Directive Compliance Reports</h1>
          <p className="text-sm text-muted-foreground">Report tracking per Art. 19.5, 20.5, 29.1</p>
        </div>
        <Button variant="outline" onClick={() => fetchData(entityType)} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Entities</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{stats.total}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Compliant</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-green-600">{stats.compliant}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Overdue</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-red-600">{stats.overdue}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Due Soon</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-amber-600">{stats.dueSoon}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Never Submitted</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-slate-600">{stats.neverSubmitted}</p></CardContent></Card>
      </div>

      <Tabs value={entityType} onValueChange={(v) => setEntityType(v as any)}>
        <TabsList>
          <TabsTrigger value="startup">Startup Reports</TabsTrigger>
          <TabsTrigger value="ecosystem">Ecosystem Reports</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="space-y-6">
          {reportStatuses.map((rs) => (
            <Card key={rs.requirement.reportType}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-5 w-5" />
                  {rs.requirement.description}
                  <Badge variant="outline" className="text-xs">{rs.requirement.directiveRef}</Badge>
                  <Badge variant="secondary" className="text-xs">{rs.requirement.frequency}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        <th className="text-left pb-3 pl-2">Entity</th>
                        <th className="text-center pb-3">Status</th>
                        <th className="text-center pb-3">Due Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rs.entityStatuses.map((es) => (
                        <tr key={es.entityId} className={`border-b hover:bg-slate-50 ${statusColor(es.reportStatus)}`}>
                          <td className="py-3 pl-2 font-medium">{es.entityName}</td>
                          <td className="py-3 text-center">{statusBadge(es.reportStatus)}</td>
                          <td className="py-3 text-center text-xs text-muted-foreground">{es.dueDate ? new Date(es.dueDate).toLocaleDateString() : "—"}</td>
                        </tr>
                      ))}
                      {rs.entityStatuses.length === 0 && (
                        <tr><td colSpan={3} className="py-8 text-center text-muted-foreground">No entities found</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
