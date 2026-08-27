"use client";

import React, { useEffect, useState } from 'react';
import { Megaphone, Plus, RefreshCw, Loader2, Clock, CalendarDays, Target, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { getCalls, createCall } from "./actions";

interface CallRow {
  id: string; title: string; description: string; targetType: string;
  status: string; opensAt: string; closesAt: string; requirements: string[];
  callStatus: string; daysRemaining: number; isOpen: boolean; createdAt: string;
}

export default function CallsPage() {
  const [calls, setCalls] = useState<CallRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", targetType: "both", opensAt: "", closesAt: "", requirements: "" });

  const fetchData = async () => {
    setLoading(true);
    const res = await getCalls();
    if (res.success) setCalls(res.data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async () => {
    setCreating(true);
    const res = await createCall({
      title: form.title,
      description: form.description,
      targetType: form.targetType,
      opensAt: form.opensAt,
      closesAt: form.closesAt,
      requirements: form.requirements.split("\n").filter(Boolean),
    });
    if (res.success) {
      toast.success(res.message);
      setShowCreateDialog(false);
      setForm({ title: "", description: "", targetType: "both", opensAt: "", closesAt: "", requirements: "" });
      await fetchData();
    } else {
      toast.error(res.message);
    }
    setCreating(false);
  };

  const statusBadge = (c: CallRow) => {
    if (!c.isOpen && c.status === "PUBLISHED") return <Badge className="bg-red-100 text-red-700 border-red-200">Closed</Badge>;
    if (c.isOpen) return <Badge className="bg-green-100 text-green-700 border-green-200">Open</Badge>;
    if (c.status === "DRAFT") return <Badge variant="outline">Draft</Badge>;
    if (c.status === "CANCELLED") return <Badge variant="destructive">Cancelled</Badge>;
    if (c.status === "CLOSED") return <Badge className="bg-slate-100 text-slate-700">Closed</Badge>;
    return <Badge variant="outline">{c.status}</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Calls for Applications</h1>
          <p className="text-sm text-muted-foreground">Manage calls per Art. 6 — minimum 30-day application window</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" /> New Call
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {calls.map((c) => (
            <Card key={c.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Megaphone className="h-5 w-5 text-primary" />
                      {c.title}
                    </CardTitle>
                    <CardDescription>{c.description}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {statusBadge(c)}
                    <Badge variant="outline" className="text-xs">
                      <Target className="h-3 w-3 mr-1" />{c.targetType}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Opens:</span>
                    <span>{new Date(c.opensAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Closes:</span>
                    <span>{new Date(c.closesAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Days Remaining:</span>
                    <span className={c.daysRemaining <= 30 ? "text-amber-600 font-bold" : "font-bold"}>{c.daysRemaining}</span>
                  </div>
                </div>
                {c.requirements.length > 0 && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Requirements</p>
                    <ul className="list-disc list-inside space-y-1">
                      {c.requirements.map((r, i) => <li key={i} className="text-sm text-muted-foreground">{r}</li>)}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          {calls.length === 0 && (
            <div className="text-center py-20 text-muted-foreground">
              <Megaphone className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p>No calls for applications yet</p>
            </div>
          )}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Create Call for Applications</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Q1 2026 Startup Designation Call" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the call purpose..." />
            </div>
            <div>
              <Label>Target Type</Label>
              <Select value={form.targetType} onValueChange={(v) => setForm({ ...form, targetType: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="startup">Startup</SelectItem>
                  <SelectItem value="ecosystem">Ecosystem Builder</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Opens At</Label>
                <Input type="date" value={form.opensAt} onChange={(e) => setForm({ ...form, opensAt: e.target.value })} />
              </div>
              <div>
                <Label>Closes At</Label>
                <Input type="date" value={form.closesAt} onChange={(e) => setForm({ ...form, closesAt: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Requirements (one per line)</Label>
              <Textarea value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} placeholder="Enter each requirement on a new line..." rows={5} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={creating || !form.title || !form.opensAt || !form.closesAt}>
              {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Create Call
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
