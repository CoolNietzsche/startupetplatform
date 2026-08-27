"use client";

import React, { useEffect, useState } from 'react';
import { Scale, RefreshCw, Loader2, Clock, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { getAppeals, decideAppeal, submitAppeal } from "./actions";

interface AppealRow {
  id: string; entityId: string; entityName: string; entityType: string;
  decisionDate: string; appealDeadline: string; isTimely: boolean;
  status: string; daysRemaining: number; fromDb?: boolean;
}

export default function AppealsPage() {
  const [appeals, setAppeals] = useState<AppealRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [deciding, setDeciding] = useState<string | null>(null);
  const [showDecideDialog, setShowDecideDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedAppeal, setSelectedAppeal] = useState<AppealRow | null>(null);
  const [decision, setDecision] = useState("UPHELD");
  const [reason, setReason] = useState("");
  const [createForm, setCreateForm] = useState({ entityId: "", entityType: "startup", grounds: "PROCEDURAL_ERROR", description: "" });
  const [creating, setCreating] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const res = await getAppeals();
    if (res.success) setAppeals(res.data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleDecide = async () => {
    if (!selectedAppeal) return;
    setDeciding(selectedAppeal.id);
    const res = await decideAppeal(selectedAppeal.id, selectedAppeal.entityId, selectedAppeal.entityType as any, decision as any, reason);
    if (res.success) {
      toast.success(res.message);
      setShowDecideDialog(false);
      setSelectedAppeal(null);
      setDecision("UPHELD");
      setReason("");
      await fetchData();
    } else {
      toast.error(res.message);
    }
    setDeciding(null);
  };

  const handleCreate = async () => {
    setCreating(true);
    const res = await submitAppeal(createForm.entityId, createForm.entityType as any, createForm.grounds, createForm.description);
    if (res.success) {
      toast.success(res.message);
      setShowCreateDialog(false);
      setCreateForm({ entityId: "", entityType: "startup", grounds: "PROCEDURAL_ERROR", description: "" });
      await fetchData();
    } else {
      toast.error(res.message);
    }
    setCreating(false);
  };

  const statusBadge = (a: AppealRow) => {
    if (a.status === "UPHELD") return <Badge className="bg-green-100 text-green-700 border-green-200">Upheld</Badge>;
    if (a.status === "DENIED") return <Badge variant="destructive">Denied</Badge>;
    if (a.status === "DISMISSED") return <Badge variant="outline">Dismissed</Badge>;
    if (a.status === "EXPIRED") return <Badge className="bg-slate-100 text-slate-700">Expired</Badge>;
    if (a.isTimely) return <Badge className="bg-amber-100 text-amber-700 border-amber-200"><Clock className="h-3 w-3 mr-1" />Appealable</Badge>;
    return <Badge variant="destructive">Expired</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Appeals Management</h1>
          <p className="text-sm text-muted-foreground">Review and decide appeals per Art. 35 — 30-day filing deadline, 60-day review period</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}><Plus className="mr-2 h-4 w-4" /> File Appeal</Button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" /></div>
      ) : (
        <Card>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <th className="text-left pb-3 pl-2">Entity</th>
                    <th className="text-center pb-3">Type</th>
                    <th className="text-center pb-3">Filed At</th>
                    <th className="text-center pb-3">Deadline</th>
                    <th className="text-center pb-3">Status</th>
                    <th className="text-center pb-3">Days Left</th>
                    <th className="text-center pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appeals.map((a) => (
                    <tr key={a.id} className="border-b hover:bg-slate-50">
                      <td className="py-3 pl-2 font-medium">{a.entityName || a.entityId.slice(0, 12)}</td>
                      <td className="py-3 text-center"><Badge variant="outline">{a.entityType}</Badge></td>
                      <td className="py-3 text-center text-xs">{new Date(a.decisionDate).toLocaleDateString()}</td>
                      <td className="py-3 text-center text-xs">{new Date(a.appealDeadline).toLocaleDateString()}</td>
                      <td className="py-3 text-center">{statusBadge(a)}</td>
                      <td className="py-3 text-center">
                        <span className={a.daysRemaining <= 7 && a.isTimely ? "text-red-600 font-bold" : ""}>{a.isTimely ? a.daysRemaining : "—"}</span>
                      </td>
                      <td className="py-3 text-center">
                        {a.isTimely && a.status !== "UPHELD" && a.status !== "DENIED" && a.status !== "DISMISSED" ? (
                          <Button size="sm" variant="outline" onClick={() => { setSelectedAppeal(a); setShowDecideDialog(true); }}>
                            <Scale className="h-3 w-3 mr-1" /> Decide
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {appeals.length === 0 && (
                    <tr><td colSpan={7} className="py-8 text-center text-muted-foreground">No appeals found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Decide Dialog */}
      <Dialog open={showDecideDialog} onOpenChange={setShowDecideDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Decide Appeal — {selectedAppeal?.entityName || selectedAppeal?.entityId}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Decision</Label>
              <Select value={decision} onValueChange={setDecision}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="UPHELD">Upheld — Restore designation</SelectItem>
                  <SelectItem value="DENIED">Denied — Maintain decision</SelectItem>
                  <SelectItem value="DISMISSED">Dismissed — Procedural grounds</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Reason</Label>
              <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Provide the reasoning for this decision..." rows={4} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDecideDialog(false)}>Cancel</Button>
            <Button onClick={handleDecide} disabled={deciding === selectedAppeal?.id || !reason}>
              {deciding === selectedAppeal?.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Submit Decision
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* File Appeal Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>File New Appeal (Art. 35)</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Entity ID</Label>
              <Input value={createForm.entityId} onChange={(e) => setCreateForm({ ...createForm, entityId: e.target.value })} placeholder="Application or Ecosystem ID" />
            </div>
            <div>
              <Label>Entity Type</Label>
              <Select value={createForm.entityType} onValueChange={(v) => setCreateForm({ ...createForm, entityType: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="startup">Startup</SelectItem>
                  <SelectItem value="ecosystem">Ecosystem Builder</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Grounds</Label>
              <Select value={createForm.grounds} onValueChange={(v) => setCreateForm({ ...createForm, grounds: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PROCEDURAL_ERROR">Procedural Error</SelectItem>
                  <SelectItem value="NEW_EVIDENCE">New Evidence</SelectItem>
                  <SelectItem value="MISAPPLICATION">Misapplication of Criteria</SelectItem>
                  <SelectItem value="BIAS">Bias or Conflict of Interest</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={createForm.description} onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })} rows={4} placeholder="Describe the grounds for appeal..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={creating || !createForm.entityId || !createForm.description}>
              {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              File Appeal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
