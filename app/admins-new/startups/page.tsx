"use client";

import React, { useState, useEffect } from "react";
import { getStartups, getStartupStats } from "./actions";

// Types for startups
interface Startup {
  id: string;
  name: string;
  logo: string | null;
  sector: string;
  location: string;
  founded: number | string;
  employees: number;
  stage: string;
  website: string;
  description: string;
  status: string;
  certification: {
    id: string;
    level: string;
    issued: string;
    expiry: string;
  } | null;
  founders: {
    name: string;
    role: string;
    email: string;
  }[];
  tags: string[];
}

interface Stats {
  total: number;
  certified: number;
  pending: number;
  underReview: number;
  rejected: number;
  bySector: Record<string, number>;
  byStage: Record<string, number>;
}

import {
  Search,
  MoreHorizontal,
  Download,
  Tag,
  CheckCircle,
  XCircle,
  AlertCircle,
  Award,
  Eye,
  Edit,
  Trash,
  ArrowUpDown,
  ChevronDown,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
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

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

export default function StartupsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sectorFilter, setSectorFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [selectedStartups, setSelectedStartups] = useState<string[]>([]);

  const [startups, setStartups] = useState<Startup[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    certified: 0,
    pending: 0,
    underReview: 0,
    rejected: 0,
    bySector: {},
    byStage: {},
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const [startupsRes, statsRes] = await Promise.all([
          getStartups(),
          getStartupStats(),
        ]);

        if (startupsRes.success && startupsRes.data) {
          setStartups(startupsRes.data as any[]);
        }
        if (statsRes.success && statsRes.data) {
          setStats(statsRes.data);
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  // Filter startups based on search and filters
  const filteredStartups = startups.filter((startup) => {
    const matchesSearch =
      !searchQuery ||
      startup.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      startup.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (startup.description &&
        startup.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSector =
      sectorFilter === "all" || startup.sector === sectorFilter;
    const matchesStatus =
      statusFilter === "all" || startup.status === statusFilter;
    const matchesStage = stageFilter === "all" || startup.stage === stageFilter;
    const matchesLocation =
      locationFilter === "all" || startup.location === locationFilter;

    return (
      matchesSearch &&
      matchesSector &&
      matchesStatus &&
      matchesStage &&
      matchesLocation
    );
  });

  // Toggle a startup selection
  const toggleStartupSelection = (startupId: string) => {
    setSelectedStartups((prev) => {
      if (prev.includes(startupId)) {
        return prev.filter((id) => id !== startupId);
      } else {
        return [...prev, startupId];
      }
    });
  };

  // Bulk actions for selected startups
  const handleBulkAction = (action: string) => {
    // Implementation would depend on action type
    // Reset selection after action
    setSelectedStartups([]);
  };

  // Toggle select all startups
  const toggleSelectAll = () => {
    if (selectedStartups.length === filteredStartups.length) {
      setSelectedStartups([]);
    } else {
      setSelectedStartups(filteredStartups.map((startup) => startup.id));
    }
  };

  return (
    <div className="p-6 bg-gray-50">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Startups Management
          </h1>
          <p className="text-muted-foreground">
            Manage and certify startups in the Ethiopian ecosystem
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Applications
            </CardTitle>
            <div className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : stats.total}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certified</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : stats.certified}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {isLoading
                ? "..."
                : Math.round((stats.certified / (stats.total || 1)) * 100)}
              % of all
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : stats.pending}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Under Review</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : stats.underReview}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : stats.rejected}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main tabs */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Certified Startups</h2>
        {/* Bulk actions dropdown - only shown when items are selected */}
        {selectedStartups.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Actions ({selectedStartups.length}){" "}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => handleBulkAction("delete")}
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete Records
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="space-y-4">
        {/* Filter controls */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search startups..."
              className="w-full bg-white pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Select value={sectorFilter} onValueChange={setSectorFilter}>
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue placeholder="Filter by sector" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sectors</SelectItem>
              <SelectItem value="Information & Technology">
                Information & Technology
              </SelectItem>
              <SelectItem value="Fintech">Fintech</SelectItem>
              <SelectItem value="Agriculture">Agriculture</SelectItem>
              <SelectItem value="Healthcare">Healthcare</SelectItem>
              <SelectItem value="Education">Education</SelectItem>
              <SelectItem value="E-commerce">E-commerce</SelectItem>
              <SelectItem value="Communication">Communication</SelectItem>
              <SelectItem value="Software">Software</SelectItem>
            </SelectContent>
          </Select>

          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue placeholder="Filter by stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              <SelectItem value="Seed">Seed</SelectItem>
              <SelectItem value="Early">Early</SelectItem>
              <SelectItem value="Growth">Growth</SelectItem>
              <SelectItem value="Scale">Scale</SelectItem>
            </SelectContent>
          </Select>

          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue placeholder="Filter by location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="Addis Ababa">Addis Ababa</SelectItem>
              <SelectItem value="Hawassa">Hawassa</SelectItem>
              <SelectItem value="Adama">Adama</SelectItem>
              <SelectItem value="Bahir Dar">Bahir Dar</SelectItem>
              <SelectItem value="Mekelle">Mekelle</SelectItem>
              <SelectItem value="Dire Dawa">Dire Dawa</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" className="ml-auto">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>

        {/* Startups table */}
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground text-xs">
                  <th className="text-left py-3 px-4">
                    <Checkbox
                      checked={
                        selectedStartups.length === filteredStartups.length &&
                        filteredStartups.length > 0
                      }
                      onCheckedChange={toggleSelectAll}
                    />
                  </th>
                  <th className="text-left py-3 px-4">
                    <div className="flex items-center">
                      Startup
                      <ArrowUpDown className="ml-1 h-3 w-3" />
                    </div>
                  </th>
                  <th className="text-left py-3 px-4">
                    <div className="flex items-center">
                      Sector
                      <ArrowUpDown className="ml-1 h-3 w-3" />
                    </div>
                  </th>
                  <th className="text-left py-3 px-4">Location</th>
                  <th className="text-left py-3 px-4">
                    <div className="flex items-center">
                      Founded
                      <ArrowUpDown className="ml-1 h-3 w-3" />
                    </div>
                  </th>
                  <th className="text-left py-3 px-4">Employees</th>
                  <th className="text-left py-3 px-4">Stage</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-center py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="py-8 text-center text-muted-foreground italic"
                    >
                      Loading startups...
                    </td>
                  </tr>
                ) : filteredStartups.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="py-8 text-center text-muted-foreground italic"
                    >
                      No startups found.
                    </td>
                  </tr>
                ) : (
                  filteredStartups.map((startup) => (
                    <tr key={startup.id} className="border-b">
                      <td className="py-3 px-4">
                        <Checkbox
                          checked={selectedStartups.includes(startup.id)}
                          onCheckedChange={() =>
                            toggleStartupSelection(startup.id)
                          }
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-2 bg-primary/10">
                            <AvatarFallback className="font-medium">
                              {startup.name.substring(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{startup.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {startup.website}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">{startup.sector}</td>
                      <td className="py-3 px-4">{startup.location}</td>
                      <td className="py-3 px-4">{startup.founded}</td>
                      <td className="py-3 px-4">{startup.employees}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="font-normal">
                          {startup.stage}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="success" className="font-normal">
                          {startup.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/admins-new/startups/${startup.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/admins-new/startups/${startup.id}/edit`}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Startup
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/admins-new/certificates/${startup.certification?.id ?? ""}`}
                              >
                                <Award className="mr-2 h-4 w-4" />
                                View Certificate
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </CardContent>
          <CardFooter className="flex justify-between border-t py-4">
            <div className="text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-medium">{filteredStartups.length}</span> of{" "}
              <span className="font-medium">{startups.length}</span> startups
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
