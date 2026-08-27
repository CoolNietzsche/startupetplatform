"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Award,
  BadgeCheck,
  Filter,
  Search,
  Users,
  Building2,
  RefreshCw,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

import { getApprovedApplications } from "../actions";

const levelLabelMap: Record<string, string> = {
  "level-1": "Level 1",
  "level-2": "Level 2",
  "level-3": "Level 3",
};

interface ApplicationData {
  id: string;
  startupName: string;
  sector: string;
  level: string;
  score: number;
  leadAssessor: string;
  committee: string;
  decisionDate: string;
  applicationType: string;
  entityType?: string;
}

export default function IssueCertificatePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [sectorFilter, setSectorFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<ApplicationData[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const result = await getApprovedApplications();
    if (result.success && result.data) {
      setApplications(result.data as ApplicationData[]);
    } else {
      console.error("Failed to load applications:", result.message);
    }
    setLoading(false);
  };

  const SUMMARY = useMemo(() => {
    return {
      total: applications.length,
      level1: applications.filter((a) => a.level === "level-1").length,
      level2: applications.filter((a) => a.level === "level-2").length,
      level3: applications.filter((a) => a.level === "level-3").length,
    };
  }, [applications]);

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const matchesSearch =
        !searchQuery ||
        app.startupName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesLevel = levelFilter === "all" || app.level === levelFilter;
      const matchesSector =
        sectorFilter === "all" ||
        app.sector.toLowerCase() === sectorFilter.toLowerCase();

      // Category filter
      const matchesCategory =
        categoryFilter === "all" ||
        categoryFilter === app.entityType ||
        categoryFilter === "startup"; // defaulting due to previous logic if needed

      return matchesSearch && matchesLevel && matchesSector && matchesCategory;
    });
  }, [searchQuery, levelFilter, sectorFilter, categoryFilter, applications]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, levelFilter, sectorFilter, categoryFilter, pageSize]);

  const clearFilters = () => {
    setSearchQuery("");
    setLevelFilter("all");
    setSectorFilter("all");
    setCategoryFilter("all");
  };

  const handleRefresh = () => {
    loadData();
  };

  const totalPages = Math.max(
    1,
    Math.ceil(filteredApplications.length / pageSize),
  );
  const paginatedApplications = filteredApplications.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <div className="p-6 bg-gray-50 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admins-new/certifications">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">
            Issue Certificates
          </h1>
          <p className="text-muted-foreground">
            Select committee-approved applications to generate digital
            certificates.
          </p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <Card className="h-full">
          <CardContent className="py-3 px-4 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <CardTitle className="text-sm">Ready to issue</CardTitle>
              <CardDescription className="text-xs">
                Applications cleared by committees
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 text-2xl font-bold">
              <Award className="h-5 w-5 text-amber-500" />
              {SUMMARY.total}
            </div>
          </CardContent>
        </Card>
        <Card className="h-full">
          <CardContent className="py-3 px-4 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <CardTitle className="text-sm">Level 1</CardTitle>
              <CardDescription className="text-xs">
                Awaiting certificate
              </CardDescription>
            </div>
            <div className="text-2xl font-bold">{SUMMARY.level1}</div>
          </CardContent>
        </Card>
        <Card className="h-full">
          <CardContent className="py-3 px-4 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <CardTitle className="text-sm">Level 2</CardTitle>
              <CardDescription className="text-xs">
                Awaiting certificate
              </CardDescription>
            </div>
            <div className="text-2xl font-bold">{SUMMARY.level2}</div>
          </CardContent>
        </Card>
        <Card className="h-full">
          <CardContent className="py-3 px-4 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <CardTitle className="text-sm">Level 3</CardTitle>
              <CardDescription className="text-xs">
                Awaiting certificate
              </CardDescription>
            </div>
            <div className="text-2xl font-bold">{SUMMARY.level3}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="mt-5">
          <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-6 items-end">
            <div className="md:col-span-2">
              <label className="text-xs font-medium text-muted-foreground mb-2 block">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by startup or ID"
                  className="pl-8"
                  type="search"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">
                Certification level
              </label>
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All levels</SelectItem>
                  <SelectItem value="level-1">Level 1</SelectItem>
                  <SelectItem value="level-2">Level 2</SelectItem>
                  <SelectItem value="level-3">Level 3</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">
                Sector
              </label>
              <Select value={sectorFilter} onValueChange={setSectorFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All sectors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All sectors</SelectItem>
                  <SelectItem value="Fintech">Fintech</SelectItem>
                  <SelectItem value="Information & Technology">
                    Information & Technology
                  </SelectItem>
                  <SelectItem value="CleanTech">CleanTech</SelectItem>
                  <SelectItem value="Communication">Communication</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">
                Category
              </label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="startup">Startup</SelectItem>
                  <SelectItem value="ecosystem">Ecosystems</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">
                Reset
              </label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={clearFilters}
                >
                  Clear filters
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Refresh"
                  onClick={handleRefresh}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Committee-approved applications</CardTitle>
              <CardDescription>
                Only applications that passed assessments are shown.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <BadgeCheck className="h-4 w-4 text-emerald-600" /> Passed
                assessments
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4 text-blue-600" /> Committee decision
              </span>
              <span className="flex items-center gap-1">
                <Building2 className="h-4 w-4 text-amber-600" /> Sector ready
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed p-12 text-center text-sm text-muted-foreground">
                <RefreshCw className="h-8 w-8 animate-spin" />
                <span>Loading approved applications...</span>
              </div>
            ) : (
              filteredApplications.length === 0 && (
                <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                  <Filter className="h-5 w-5" />
                  No applications match the current filters.
                </div>
              )
            )}

            {!loading &&
              paginatedApplications.map((app) => {
                return (
                  <div
                    key={app.id}
                    className="flex flex-col gap-3 rounded-lg border bg-white p-4 shadow-sm transition hover:border-primary/40 hover:shadow"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="flex items-start gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge
                              variant="outline"
                              className="border-primary/40 bg-primary/5 text-primary"
                            >
                              {levelLabelMap[app.level]}
                            </Badge>
                            <span className="text-sm font-semibold">
                              {app.startupName}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              #{app.id}
                            </span>
                          </div>
                          <div className="mt-1 text-sm text-muted-foreground">
                            {app.applicationType} · {app.sector}
                          </div>
                          <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <BadgeCheck className="h-4 w-4 text-emerald-600" />
                              Assessment score {app.score}%
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4 text-blue-600" />
                              {app.leadAssessor}
                            </span>
                            <span className="flex items-center gap-1">
                              <Building2 className="h-4 w-4 text-amber-600" />
                              {app.committee}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right text-xs text-muted-foreground md:text-sm">
                        <div className="font-medium text-gray-800">
                          Decision: {app.decisionDate}
                        </div>
                        <div>Ready for issuance</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        Passed committee review
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admins-new/applications/${app.id}`}>
                            View dossier
                          </Link>
                        </Button>
                        <Button size="sm" asChild>
                          <Link
                            href={`/admins-new/certifications/generate?appId=${app.id}&name=${encodeURIComponent(app.startupName)}&level=${app.level}`}
                          >
                            <Award className="mr-2 h-4 w-4" />
                            Generate
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}

            {/* Pagination */}
            {filteredApplications.length > pageSize && (
              <div className="flex flex-col gap-3 pt-4 border-t sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>
                    Page {currentPage} of {totalPages}
                  </span>
                  <span>·</span>
                  <span>Items per page:</span>
                  <Select
                    value={pageSize.toString()}
                    onValueChange={(v) => setPageSize(Number(v))}
                  >
                    <SelectTrigger className="h-8 w-[90px]">
                      <SelectValue placeholder={pageSize.toString()} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Prev
                  </Button>
                  {[...Array(totalPages)].map((_, idx) => {
                    const page = idx + 1;
                    return (
                      <Button
                        key={page}
                        variant={page === currentPage ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    );
                  })}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
