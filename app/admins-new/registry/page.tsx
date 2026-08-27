"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Bookmark, Search, RefreshCw, Loader2, MapPin, Building, Award, XCircle, AlertTriangle, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { getRegistryData } from "./actions";
import type { RegistryEntry, RegistryStats } from "@/lib/directive/registry";

export default function RegistryPage() {
  const [entries, setEntries] = useState<RegistryEntry[]>([]);
  const [stats, setStats] = useState<RegistryStats | null>(null);
  const [totalEntries, setTotalEntries] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async (search?: string) => {
    setLoading(true);
    const res = await getRegistryData(search || undefined);
    if (res.success) {
      setEntries(res.data.entries);
      setStats(res.data.stats);
      setTotalEntries(res.data.totalEntries);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, []);

  const handleSearch = () => { fetchData(searchQuery || undefined); };

  const certBadge = (s: string) => {
    switch (s) {
      case "ACTIVE": return <Badge className="bg-green-100 text-green-700 border-green-200"><Award className="h-3 w-3 mr-1" />Active</Badge>;
      case "SUSPENDED": return <Badge className="bg-amber-100 text-amber-700 border-amber-200"><AlertTriangle className="h-3 w-3 mr-1" />Suspended</Badge>;
      case "REVOKED": return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Revoked</Badge>;
      case "EXPIRED": return <Badge variant="outline">Expired</Badge>;
      default: return <Badge variant="outline">{s}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Certificate Registry</h1>
          <p className="text-sm text-muted-foreground">Public registry of certified startups and ecosystem builders per Art. 8, 10</p>
        </div>
        <Button variant="outline" onClick={() => fetchData()} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Registered</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{totalEntries}</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Active</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-green-600">{stats.totalActive}</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Suspended</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-amber-600">{stats.totalSuspended}</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Revoked</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-red-600">{stats.totalRevoked}</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Expired</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-slate-600">{stats.totalExpired}</p></CardContent></Card>
        </div>
      )}

      {/* By Region */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4" /> By Region</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(stats.byRegion).sort(([,a], [,b]) => b - a).map(([region, count]) => (
                  <div key={region} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{region}</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(count / totalEntries) * 100} className="w-24 h-2" />
                      <span className="text-xs font-bold text-muted-foreground">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Building className="h-4 w-4" /> By Stage</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(stats.startupsByStage).map(([stage, count]) => (
                  <div key={stage} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{stage}</span>
                    <span className="text-xs font-bold text-muted-foreground">{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, certificate#, region, sector..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        <Button variant="secondary" onClick={handleSearch}><Search className="mr-2 h-4 w-4" /> Search</Button>
      </div>

      {/* Registry Table */}
      <Card>
        <CardContent>
          {loading ? (
            <div className="py-20 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <th className="text-left pb-3 pl-2">Certificate #</th>
                    <th className="text-left pb-3">Entity Name</th>
                    <th className="text-center pb-3">Type</th>
                    <th className="text-center pb-3">Stage</th>
                    <th className="text-center pb-3">Region</th>
                    <th className="text-center pb-3">Sector</th>
                    <th className="text-center pb-3">Issued At</th>
                    <th className="text-center pb-3">Expires At</th>
                    <th className="text-center pb-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e, i) => (
                    <tr key={`${e.certificateNumber}-${i}`} className="border-b hover:bg-slate-50">
                      <td className="py-3 pl-2 font-mono text-xs">{e.certificateNumber.slice(0, 12)}...</td>
                      <td className="py-3 font-medium">{e.entityName}</td>
                      <td className="py-3 text-center"><Badge variant="outline">{e.entityType}</Badge></td>
                      <td className="py-3 text-center">{e.stage}</td>
                      <td className="py-3 text-center">{e.region}</td>
                      <td className="py-3 text-center text-xs text-muted-foreground">{e.sector || "—"}</td>
                      <td className="py-3 text-center text-xs">{new Date(e.issuedAt).toLocaleDateString()}</td>
                      <td className="py-3 text-center text-xs">{e.expiresAt ? new Date(e.expiresAt).toLocaleDateString() : "—"}</td>
                      <td className="py-3 text-center">{certBadge(e.certificateStatus)}</td>
                    </tr>
                  ))}
                  {entries.length === 0 && (
                    <tr><td colSpan={9} className="py-8 text-center text-muted-foreground">No entries found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
