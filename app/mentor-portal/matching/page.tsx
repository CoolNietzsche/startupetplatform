"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  getCurrentUserProfile,
  requestMentorMatch,
  getMyRequests,
  getMentorDirectory,
  searchMentors,
  getStartupDirectory,
  getAcademyDirectory,
  getAcceleratorDirectory,
} from "./actions";

interface MentorResult {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  managedHub: { name: string } | null;
}

interface RequestResult {
  id: string;
  startupId: string;
  mentorId: string | null;
  mentorName: string | null;
  message: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  mentor: { id: string; firstName: string; lastName: string; email: string } | null;
}

interface StartupEntry {
  id: string;
  name: string;
  sector: string | null;
  region: string | null;
  hub: { name: string } | null;
}

interface AcademyEntry {
  id: string;
  name: string;
  region: string;
  description: string | null;
  _count: { startups: number };
}

interface AcceleratorEntry {
  id: string;
  name: string;
  region: string;
  description: string | null;
  _count: { incubationPrograms: number };
}

export default function MentorMatchingPage() {
  const [startupId, setStartupId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<MentorResult[]>([]);
  const [searched, setSearched] = useState(false);

  const [myRequests, setMyRequests] = useState<RequestResult[]>([]);

  const [mentorDir, setMentorDir] = useState<MentorResult[]>([]);
  const [startupDir, setStartupDir] = useState<StartupEntry[]>([]);
  const [academyDir, setAcademyDir] = useState<AcademyEntry[]>([]);
  const [acceleratorDir, setAcceleratorDir] = useState<AcceleratorEntry[]>([]);

  const [requesting, setRequesting] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      try {
        const profile = await getCurrentUserProfile();
        setStartupId(profile.startupId);
        setUserRole(profile.role);

        if (profile.startupId) {
          const requests = await getMyRequests(profile.startupId);
          setMyRequests(requests);
        }

        const [mentors, startups, academies, accelerators] = await Promise.all([
          getMentorDirectory(),
          getStartupDirectory(),
          getAcademyDirectory(),
          getAcceleratorDirectory(),
        ]);
        setMentorDir(mentors);
        setStartupDir(startups);
        setAcademyDir(academies);
        setAcceleratorDir(accelerators);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    setSearched(true);
    try {
      const results = await searchMentors(searchQuery);
      setSearchResults(results);
    } catch (e) {
      console.error(e);
    }
  }, [searchQuery]);

  const handleRequestMatch = useCallback(async (mentorId: string, mentorName?: string) => {
    if (!startupId) return;
    setRequesting(mentorId);
    try {
      await requestMentorMatch({ startupId, mentorId, mentorName });
      const requests = await getMyRequests(startupId);
      setMyRequests(requests);
    } catch (e) {
      console.error(e);
    } finally {
      setRequesting(null);
    }
  }, [startupId]);

  const statusBadge = (status: string) => {
    const variants: Record<string, string> = {
      PENDING: "warning",
      ACCEPTED: "success",
      DECLINED: "destructive",
    };
    return <Badge variant={(variants[status] || "outline") as any}>{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full pb-10">
      <div className="space-y-1">
        <h1 className="text-3xl lg:text-4xl font-black tracking-tighter text-slate-900">
          Mentor <span className="text-amber-600 italic">Matching</span>
        </h1>
        <p className="text-slate-500 font-bold text-sm tracking-tight">
          Find and request mentorship for your startup
        </p>
      </div>

      <Tabs defaultValue="find-mentor" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="find-mentor">Find Mentor</TabsTrigger>
          <TabsTrigger value="my-requests">My Requests</TabsTrigger>
          <TabsTrigger value="directory">Directory</TabsTrigger>
        </TabsList>

        <TabsContent value="find-mentor" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Search Mentors</CardTitle>
              <CardDescription>Search by name or email to find the right mentor</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Search mentors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button onClick={handleSearch}>Search</Button>
              </div>
            </CardContent>
          </Card>

          {searched && searchResults.length === 0 && (
            <p className="text-sm text-slate-500 text-center py-8">No mentors found.</p>
          )}

          {searchResults.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {searchResults.map((mentor) => (
                <Card key={mentor.id} className="border border-slate-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base">
                      {mentor.firstName} {mentor.lastName}
                    </CardTitle>
                    <CardDescription>{mentor.email}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-xs text-slate-500">
                      Hub: {mentor.managedHub?.name ?? "Unassigned"}
                    </p>
                    {startupId ? (
                      <Button
                        size="sm"
                        className="w-full"
                        disabled={requesting === mentor.id}
                        onClick={() =>
                          handleRequestMatch(
                            mentor.id,
                            `${mentor.firstName} ${mentor.lastName}`
                          )
                        }
                      >
                        {requesting === mentor.id ? "Requesting..." : "Request Match"}
                      </Button>
                    ) : (
                      <p className="text-xs text-amber-600">
                        You need a startup profile to request a mentor.
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="my-requests">
          <Card>
            <CardHeader>
              <CardTitle>My Match Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {myRequests.length === 0 ? (
                <p className="text-sm text-slate-500">No requests yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mentor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myRequests.map((req) => (
                      <TableRow key={req.id}>
                        <TableCell>
                          {req.mentor
                            ? `${req.mentor.firstName} ${req.mentor.lastName}`
                            : req.mentorName || "Unassigned"}
                        </TableCell>
                        <TableCell>{statusBadge(req.status)}</TableCell>
                        <TableCell className="text-xs text-slate-500">
                          {new Date(req.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="directory">
          <Tabs defaultValue="mentors">
            <TabsList className="mb-4">
              <TabsTrigger value="mentors">Mentors</TabsTrigger>
              <TabsTrigger value="startups">Startups</TabsTrigger>
              <TabsTrigger value="academies">Academies</TabsTrigger>
              <TabsTrigger value="accelerators">Accelerators</TabsTrigger>
            </TabsList>

            <TabsContent value="mentors">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {mentorDir.map((mentor) => (
                  <Card key={mentor.id} className="border border-slate-200 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-base">
                        {mentor.firstName} {mentor.lastName}
                      </CardTitle>
                      <CardDescription>{mentor.email}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-slate-500">
                        Hub: {mentor.managedHub?.name ?? "Unassigned"}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="startups">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {startupDir.map((startup) => (
                  <Card key={startup.id} className="border border-slate-200 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-base">{startup.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1">
                      {startup.sector && (
                        <p className="text-xs text-slate-500">Sector: {startup.sector}</p>
                      )}
                      {startup.region && (
                        <p className="text-xs text-slate-500">Region: {startup.region}</p>
                      )}
                      <p className="text-xs text-slate-500">
                        Hub: {startup.hub?.name ?? "Unassigned"}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="academies">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {academyDir.map((academy) => (
                  <Card key={academy.id} className="border border-slate-200 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-base">{academy.name}</CardTitle>
                      <CardDescription>{academy.region}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-1">
                      {academy.description && (
                        <p className="text-xs text-slate-500">{academy.description}</p>
                      )}
                      <p className="text-xs text-slate-500">
                        Startups: {academy._count.startups}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="accelerators">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {acceleratorDir.map((acc) => (
                  <Card key={acc.id} className="border border-slate-200 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-base">{acc.name}</CardTitle>
                      <CardDescription>{acc.region}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-1">
                      {acc.description && (
                        <p className="text-xs text-slate-500">{acc.description}</p>
                      )}
                      <p className="text-xs text-slate-500">
                        Programs: {acc._count.incubationPrograms}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
}
