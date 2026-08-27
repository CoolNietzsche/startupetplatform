"use client";

import React, { useEffect, useState } from 'react';
import { Shield, RefreshCw, Loader2, CalendarDays, AlertTriangle, CheckCircle, FileSearch, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { getMonitoringData, logInspectionFinding } from "./actions";

interface EntityRow {
  id: string; name: string; entityType: string;
  lastInspectionDate: string | null; nextInspectionDate: string;
  isOverdue: boolean; category: string; region: string;
  complianceScore: number; findingsCount: number; openFindings: number;
}

export default function MonitoringPage() {
  const [entities, setEntities] = useState<EntityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFindDialog, setShowFindDialog] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<EntityRow | null>(null);
  const [logging, setLogging] = useState(false);
  const [findingForm, setFindingForm] = useState({ description: "", severity: "MINOR", directiveRef: "Art. 23", correctiveAction: "" });

  const fetchData = async () => {
    setLoading(true);
    const res = await getMonitoringData();
    if (res.success) setEntities(res.data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleLogFinding = async () => {
    if (!selectedEntity) return;
    setLogging(true);
    const res = await logInspectionFinding(selectedEntity.id, selectedEntity.entityType as any, findingForm as any);
    if (res.success) {
      toast.success(res.message);
      setShowFindDialog(false);
      setFindingForm({ description: "", severity: "MINOR", directiveRef: "Art. 23", correctiveAction: "" });
    } else {
      toast.error(res.message);
    }
    setLogging(false);
  };

  const overdueCount = entities.filter(e => e.isOverdue).length;
  const compliantCount = entities.filter(e => e.complianceScore >= 80).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Monitoring & Evaluation</h1>
          <p className="text-sm text-muted-foreground">Annual inspections, findings, and compliance tracking per Art. 23</p>
        </div>
        <Button variant="outline" onClick={fetchData} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Entities</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{entities.length}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Compliant (≥80%)</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-green-600">{compliantCount}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Inspection Overdue</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-red-600">{overdueCount}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Next Cycle</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">12 mos</p><p className="text-xs text-muted-foreground">Per Art. 23.2</p></CardContent></Card>
      </div>

      {loading ? (
        <div className="py-20 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" /></div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><FileSearch className="h-5 w-5" /> Certified Entities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <th className="text-left pb-3 pl-2">Entity</th>
                    <th className="text-center pb-3">Type</th>
                    <th className="text-center pb-3">Region</th>
                    <th className="text-center pb-3">Last Inspection</th>
                    <th className="text-center pb-3">Next Inspection</th>
                    <th className="text-center pb-3">Status</th>
                    <th className="text-center pb-3">Compliance</th>
                    <th className="text-center pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {entities.map((e) => (
                    <tr key={e.id} className="border-b hover:bg-slate-50">
                      <td className="py-3 pl-2 font-medium">{e.name}</td>
                      <td className="py-3 text-center"><Badge variant="outline">{e.entityType}</Badge></td>
                      <td className="py-3 text-center text-xs">{e.region}</td>
                      <td className="py-3 text-center text-xs text-muted-foreground">{e.lastInspectionDate ? new Date(e.lastInspectionDate).toLocaleDateString() : "Never"}</td>
                      <td className="py-3 text-center text-xs">{new Date(e.nextInspectionDate).toLocaleDateString()}</td>
                      <td className="py-3 text-center">
                        {e.isOverdue ? (
                          <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Overdue</Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-700 border-green-200"><CheckCircle className="h-3 w-3 mr-1" />On Track</Badge>
                        )}
                      </td>
                      <td className="py-3 text-center">
                        <span className={`font-bold ${e.complianceScore >= 80 ? "text-green-600" : e.complianceScore >= 60 ? "text-amber-600" : "text-red-600"}`}>
                          {e.complianceScore}%
                        </span>
                      </td>
                      <td className="py-3 text-center">
                        <Button size="sm" variant="outline" onClick={() => { setSelectedEntity(e); setShowFindDialog(true); }}>
                          <Plus className="h-3 w-3 mr-1" /> Log Finding
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {entities.length === 0 && (
                    <tr><td colSpan={8} className="py-8 text-center text-muted-foreground">No certified entities found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={showFindDialog} onOpenChange={setShowFindDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Inspection Finding — {selectedEntity?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Severity</Label>
              <Select value={findingForm.severity} onValueChange={(v) => setFindingForm({ ...findingForm, severity: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="OBSERVATION">Observation</SelectItem>
                  <SelectItem value="MINOR">Minor</SelectItem>
                  <SelectItem value="MAJOR">Major</SelectItem>
                  <SelectItem value="CRITICAL">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Directive Reference</Label>
              <Input value={findingForm.directiveRef} onChange={(e) => setFindingForm({ ...findingForm, directiveRef: e.target.value })} />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={findingForm.description} onChange={(e) => setFindingForm({ ...findingForm, description: e.target.value })} rows={3} />
            </div>
            <div>
              <Label>Corrective Action (optional)</Label>
              <Textarea value={findingForm.correctiveAction} onChange={(e) => setFindingForm({ ...findingForm, correctiveAction: e.target.value })} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFindDialog(false)}>Cancel</Button>
            <Button onClick={handleLogFinding} disabled={logging || !findingForm.description}>
              {logging ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Log Finding
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
