"use client";

import { useState } from "react";
import { BuilderCard } from "@/components/ecosystem/builder-card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EcosystemBuilder } from "@/lib/actions/ecosystem";
import { Search, Filter, Zap, Users, Coffee, Wifi, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EcosystemBuilderClientProps {
  initialBuilders: EcosystemBuilder[];
  allSectors: string[];
}

export function EcosystemBuilderClient({ initialBuilders, allSectors }: EcosystemBuilderClientProps) {
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sectorFilter, setSectorFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [amenitiesFilter, setAmenitiesFilter] = useState<string[]>([]);

  // Common amenities for coworking spaces
  const commonAmenities = [
    "High-speed WiFi",
    "Meeting Rooms",
    "Coffee",
    "24/7 Access",
    "Printing Services"
  ];

  // Helper to get amenity icon
  const getAmenityIcon = (amenity: string) => {
    const amenityLower = amenity.toLowerCase();
    if (amenityLower.includes('internet') || amenityLower.includes('wifi')) return <Wifi className="h-4 w-4" />;
    if (amenityLower.includes('coffee') || amenityLower.includes('café')) return <Coffee className="h-4 w-4" />;
    if (amenityLower.includes('meeting') || amenityLower.includes('conference')) return <Users className="h-4 w-4" />;
    if (amenityLower.includes('24/7') || amenityLower.includes('access')) return <Calendar className="h-4 w-4" />;
    if (amenityLower.includes('printing') || amenityLower.includes('printer')) return <Zap className="h-4 w-4" />;
    return null;
  };

  // Toggle amenity filter
  const toggleAmenityFilter = (amenity: string) => {
    if (amenitiesFilter.includes(amenity)) {
      setAmenitiesFilter(amenitiesFilter.filter(a => a !== amenity));
    } else {
      setAmenitiesFilter([...amenitiesFilter, amenity]);
    }
  };

  // Filter builders based on all criteria
  const filteredBuilders = initialBuilders.filter((builder) => {
    // Category filter
    const matchesCategory = categoryFilter === "all" || builder.category === categoryFilter;

    // Text search
    const matchesSearch =
      searchQuery === "" ||
      builder.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      builder.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      builder.location.toLowerCase().includes(searchQuery.toLowerCase());

    // Sector filter
    const matchesSector =
      sectorFilter === "all" ||
      (builder.focusSectors && builder.focusSectors.includes(sectorFilter));

    // Amenities filter (only applies to coworking spaces)
    const matchesAmenities =
      amenitiesFilter.length === 0 ||
      (builder.category === "COWORKING" &&
        builder.amenities &&
        amenitiesFilter.every(amenity =>
          builder.amenities!.some(a =>
            a.toLowerCase().includes(amenity.toLowerCase())
          )
        ));

    return matchesCategory && matchesSearch && matchesSector && matchesAmenities;
  });

  // Group builders by category for the tabs view
  const buildersByCategory = {
    INCUBATOR: filteredBuilders.filter(builder => builder.category === "INCUBATOR"),
    ACCELERATOR: filteredBuilders.filter(builder => builder.category === "ACCELERATOR"),
    COWORKING: filteredBuilders.filter(builder => builder.category === "COWORKING"),
    INVESTOR: filteredBuilders.filter(builder => builder.category === "INVESTOR"),
    GOVERNMENT: filteredBuilders.filter(builder => builder.category === "GOVERNMENT"),
    EDUCATION: filteredBuilders.filter(builder => builder.category === "EDUCATION"),
    COMMUNITY: filteredBuilders.filter(builder => builder.category === "COMMUNITY"),
    STARTUP: filteredBuilders.filter(builder => builder.category === "STARTUP"),
  };

  // Get category display name
  const getCategoryDisplay = (category: string) => {
    const categoryMap: Record<string, string> = {
      'INCUBATOR': 'Incubators',
      'ACCELERATOR': 'Accelerators',
      'COWORKING': 'Coworking Spaces',
      'INVESTOR': 'Investors',
      'GOVERNMENT': 'Government',
      'EDUCATION': 'Education',
      'COMMUNITY': 'Community',
      'STARTUP': 'Certified Startups',
    };
    return categoryMap[category] || category;
  };

  // Using neutral styling for all categories

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white rounded-lg border p-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, location, or description..."
              className="pl-9 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[180px]" aria-label="Filter by category">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="INCUBATOR">Incubators</SelectItem>
                <SelectItem value="ACCELERATOR">Accelerators</SelectItem>
                <SelectItem value="COWORKING">Coworking Spaces</SelectItem>
                <SelectItem value="INVESTOR">Investors</SelectItem>
                <SelectItem value="GOVERNMENT">Government</SelectItem>
                <SelectItem value="EDUCATION">Education</SelectItem>
                <SelectItem value="COMMUNITY">Community</SelectItem>
                <SelectItem value="STARTUP">Certified Startups</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? "bg-gray-100" : ""}
              aria-label="Toggle advanced filters"
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="pt-3 border-t mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Filter by Sector</h3>
              <Select value={sectorFilter} onValueChange={setSectorFilter}>
                <SelectTrigger className="w-full" aria-label="Filter by sector">
                  <SelectValue placeholder="All Sectors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sectors</SelectItem>
                  {allSectors.map((sector) => (
                    <SelectItem key={sector} value={sector}>
                      {sector}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Coworking Space Amenities Filter */}
            {(categoryFilter === "all" || categoryFilter === "COWORKING") && (
              <div>
                <h3 className="text-sm font-medium mb-2">Coworking Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {commonAmenities.map(amenity => (
                    <Badge
                      key={amenity}
                      variant={amenitiesFilter.includes(amenity) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleAmenityFilter(amenity)}
                    >
                      {getAmenityIcon(amenity)}
                      <span className="ml-1">{amenity}</span>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Active Filters */}
        <div className="flex flex-wrap gap-2 mt-3">
          {categoryFilter !== "all" && (
            <Badge
              variant="secondary"
              className="flex items-center gap-1"
              onClick={() => setCategoryFilter("all")}
            >
              <span>Category: {getCategoryDisplay(categoryFilter)}</span>
              <span className="cursor-pointer">×</span>
            </Badge>
          )}

          {sectorFilter !== "all" && (
            <Badge
              variant="secondary"
              className="flex items-center gap-1"
              onClick={() => setSectorFilter("all")}
            >
              <span>Sector: {sectorFilter}</span>
              <span className="cursor-pointer">×</span>
            </Badge>
          )}

          {amenitiesFilter.map(amenity => (
            <Badge
              key={amenity}
              variant="secondary"
              className="flex items-center gap-1"
              onClick={() => toggleAmenityFilter(amenity)}
            >
              <span>Amenity: {amenity}</span>
              <span className="cursor-pointer">×</span>
            </Badge>
          ))}

          {searchQuery && (
            <Badge
              variant="secondary"
              className="flex items-center gap-1"
              onClick={() => setSearchQuery("")}
            >
              <span>Search: {searchQuery}</span>
              <span className="cursor-pointer">×</span>
            </Badge>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Found {filteredBuilders.length} ecosystem builders
        {categoryFilter !== "all" && ` in ${getCategoryDisplay(categoryFilter)}`}
        {sectorFilter !== "all" && ` focused on ${sectorFilter}`}
      </div>

      {/* Tab Navigation */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="all">All ({filteredBuilders.length})</TabsTrigger>
          {Object.entries(buildersByCategory).map(([category, builders]) => (
            builders.length > 0 && (
              <TabsTrigger key={category} value={category}>
                {getCategoryDisplay(category)} ({builders.length})
              </TabsTrigger>
            )
          ))}
        </TabsList>

        {/* All Results */}
        <TabsContent value="all" className="space-y-6">
          {filteredBuilders.length === 0 ? (
            <div className="text-center p-12 bg-muted rounded-lg">
              <div className="mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-muted-foreground">
                  <circle cx="12" cy="12" r="10" />
                  <path d="m15 9-6 6" />
                  <path d="m9 9 6 6" />
                </svg>
              </div>
              <h3 className="text-lg font-medium">No results found</h3>
              <p className="text-muted-foreground mt-1 mb-4">No ecosystem builders match your current filters.</p>
              <Button onClick={() => {
                setCategoryFilter("all");
                setSectorFilter("all");
                setSearchQuery("");
                setAmenitiesFilter([]);
              }}>
                Clear All Filters
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredBuilders.map((builder) => (
                <div
                  key={builder.id}
                  className="group relative overflow-hidden rounded-lg border hover:shadow-md transition-shadow"
                >
                  <BuilderCard builder={builder} />
                  <a
                    href={`/dashboard/ecosystem-builders/${builder.id}`}
                    className="absolute inset-0"
                    aria-label={`View details for ${builder.name}`}
                  />
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Category Tabs */}
        {Object.entries(buildersByCategory).map(([category, builders]) => (
          <TabsContent key={category} value={category} className="space-y-6">
            {builders.length === 0 ? (
              <div className="text-center p-8 bg-muted rounded-lg">
                <p className="text-muted-foreground">No {getCategoryDisplay(category)} match your filters.</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {builders.map((builder) => (
                  <div
                    key={builder.id}
                    className="group relative overflow-hidden rounded-lg border hover:shadow-md transition-shadow"
                  >
                    <BuilderCard
                      builder={builder}
                    />
                    {/* Link wraps the card for navigation */}
                    <a
                      href={`/dashboard/ecosystem-builders/${builder.id}`}
                      className="absolute inset-0"
                      aria-label={`View details for ${builder.name}`}
                    />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
