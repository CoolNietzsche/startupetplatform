"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getRegionStartups, assignStartupToHub } from "../actions";

export default function StartupsPage() {
  const [data, setData] = useState<{ startups: any[]; hubs: any[] }>({ startups: [], hubs: [] });
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try { setData(await getRegionStartups()); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleAssign = async (startupId: string, hubId: string) => {
    try {
      await assignStartupToHub(startupId, hubId === "unassign" ? null : hubId);
      toast.success("Startup reassigned");
      load();
    } catch (e: any) { toast.error(e.message); }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading startups...</div>;

  return (
    <div className="space-y-6 w-full pb-10">
      <div>
        <h1 className="text-3xl font-black tracking-tighter text-slate-900">Regional Startups</h1>
        <p className="text-slate-500 font-bold text-sm">View and assign startups to hubs</p>
      </div>

      {data.startups.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-slate-500">No startups registered in this region.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {data.startups.map((s: any) => (
            <Card key={s.id} className="border border-slate-200 shadow-sm bg-white">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">{s.name}</div>
                  <div className="text-xs text-slate-500">
                    Level: {s.level} | Sector: {s.industry || "N/A"} | Region: {s.appRegion || "N/A"}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">Hub:</span>
                  <Select defaultValue={s.hubId || "unassign"} onValueChange={(val) => handleAssign(s.id, val)}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassign">— Unassigned —</SelectItem>
                      {data.hubs.map((h: any) => (
                        <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
