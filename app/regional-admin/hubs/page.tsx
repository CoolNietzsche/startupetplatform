"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Trash2, UserPlus, Palette } from "lucide-react";
import { createHub, updateHubBranding, deleteHub, createHubManager, createMentor, getRegionalDashboardStats } from "../actions";

export default function HubsPage() {
  const [hubs, setHubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createRegion, setCreateRegion] = useState("");
  const [createDesc, setCreateDesc] = useState("");

  const load = async () => {
    const stats = await getRegionalDashboardStats();
    setHubs(stats.hubs);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    try {
      await createHub({ name: createName, region: createRegion, description: createDesc || undefined });
      toast.success("Hub created");
      setCreateOpen(false);
      setCreateName(""); setCreateRegion(""); setCreateDesc("");
      load();
    } catch (e: any) { toast.error(e.message); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this hub? This cannot be undone.")) return;
    try { await deleteHub(id); toast.success("Hub deleted"); load(); }
    catch (e: any) { toast.error(e.message); }
  };

  const handleBrand = async (id: string, color: string) => {
    try { await updateHubBranding(id, { primaryColor: color }); toast.success("Branding updated"); load(); }
    catch (e: any) { toast.error(e.message); }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading hubs...</div>;

  return (
    <div className="space-y-6 w-full pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-slate-900">Hub Management</h1>
          <p className="text-slate-500 font-bold text-sm">Create and manage regional hubs</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> New Hub</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create New Hub</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Hub Name</Label><Input value={createName} onChange={e => setCreateName(e.target.value)} placeholder="e.g. Addis Ababa Innovation Hub" /></div>
              <div><Label>Region</Label><Input value={createRegion} onChange={e => setCreateRegion(e.target.value)} placeholder="e.g. Addis Ababa" /></div>
              <div><Label>Description (optional)</Label><Input value={createDesc} onChange={e => setCreateDesc(e.target.value)} placeholder="Brief description" /></div>
              <Button onClick={handleCreate} className="w-full" disabled={!createName || !createRegion}>Create Hub</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {hubs.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-slate-500">No hubs created yet.</CardContent></Card>
      ) : (
        <div className="grid gap-6">
          {hubs.map((hub: any) => (
            <HubCard key={hub.id} hub={hub} onDelete={handleDelete} onBrand={handleBrand} onRefresh={load} />
          ))}
        </div>
      )}
    </div>
  );
}

function HubCard({ hub, onDelete, onBrand, onRefresh }: { hub: any; onDelete: (id: string) => void; onBrand: (id: string, color: string) => void; onRefresh: () => void }) {
  const [mgrOpen, setMgrOpen] = useState(false);
  const [mgrEmail, setMgrEmail] = useState("");
  const [mgrFirst, setMgrFirst] = useState("");
  const [mgrLast, setMgrLast] = useState("");
  const [mgrPhone, setMgrPhone] = useState("");
  const [mentorOpen, setMentorOpen] = useState(false);
  const [mtrEmail, setMtrEmail] = useState("");
  const [mtrFirst, setMtrFirst] = useState("");
  const [mtrLast, setMtrLast] = useState("");
  const [mtrPhone, setMtrPhone] = useState("");
  const [color, setColor] = useState(hub.primaryColor || "#2563eb");

  return (
    <Card className="border border-slate-200 shadow-lg bg-white">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: hub.primaryColor || "#2563eb" }} />
          <CardTitle className="text-xl font-black tracking-tight text-slate-900">{hub.name}</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
          <Button variant="outline" size="sm" onClick={() => onBrand(hub.id, color)}><Palette className="h-3 w-3" /></Button>

          <Dialog open={mgrOpen} onOpenChange={setMgrOpen}>
            <DialogTrigger asChild><Button variant="outline" size="sm"><UserPlus className="h-3 w-3 mr-1" /> Add Manager</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Hub Manager for {hub.name}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Email *</Label><Input value={mgrEmail} onChange={e => setMgrEmail(e.target.value)} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>First Name *</Label><Input value={mgrFirst} onChange={e => setMgrFirst(e.target.value)} /></div>
                  <div><Label>Last Name *</Label><Input value={mgrLast} onChange={e => setMgrLast(e.target.value)} /></div>
                </div>
                <div><Label>Phone</Label><Input value={mgrPhone} onChange={e => setMgrPhone(e.target.value)} /></div>
                <Button className="w-full" disabled={!mgrEmail || !mgrFirst || !mgrLast} onClick={async () => {
                  try {
                    const res = await createHubManager({ email: mgrEmail, firstName: mgrFirst, lastName: mgrLast, phoneNumber: mgrPhone || undefined, hubId: hub.id });
                    toast.success(res.message);
                    setMgrOpen(false); setMgrEmail(""); setMgrFirst(""); setMgrLast(""); setMgrPhone("");
                  } catch (e: any) { toast.error(e.message); }
                }}>Create Hub Manager</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={mentorOpen} onOpenChange={setMentorOpen}>
            <DialogTrigger asChild><Button variant="outline" size="sm"><UserPlus className="h-3 w-3 mr-1" /> Add Mentor</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Mentor for {hub.name}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Email *</Label><Input value={mtrEmail} onChange={e => setMtrEmail(e.target.value)} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>First Name *</Label><Input value={mtrFirst} onChange={e => setMtrFirst(e.target.value)} /></div>
                  <div><Label>Last Name *</Label><Input value={mtrLast} onChange={e => setMtrLast(e.target.value)} /></div>
                </div>
                <div><Label>Phone</Label><Input value={mtrPhone} onChange={e => setMtrPhone(e.target.value)} /></div>
                <Button className="w-full" disabled={!mtrEmail || !mtrFirst || !mtrLast} onClick={async () => {
                  try {
                    const res = await createMentor({ email: mtrEmail, firstName: mtrFirst, lastName: mtrLast, phoneNumber: mtrPhone || undefined, hubId: hub.id });
                    toast.success(res.message);
                    setMentorOpen(false); setMtrEmail(""); setMtrFirst(""); setMtrLast(""); setMtrPhone("");
                  } catch (e: any) { toast.error(e.message); }
                }}>Create Mentor</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="destructive" size="sm" onClick={() => onDelete(hub.id)}><Trash2 className="h-3 w-3" /></Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-slate-500 mb-3">Region: {hub.region}{hub.description ? ` — ${hub.description}` : ""}</div>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div><span className="font-bold text-slate-500">Startups:</span> {hub.startups?.length || 0}</div>
          <div><span className="font-bold text-slate-500">Programs:</span> {hub.incubationPrograms?.length || 0}</div>
          <div><span className="font-bold text-slate-500">Mentors:</span> {hub.mentorAssignments?.length || 0}</div>
        </div>
      </CardContent>
    </Card>
  );
}
