"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Landmark, Users, Filter, Search, X, ChevronRight, Bell, FileText, DollarSign, Sliders, Loader2, Heart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
// Rest of imports...
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";



interface FundingOpportunity {
  [key: string]: any; // Index signature to allow dynamic filtering
  id: string;
  title: string;
  description: string;
  organization?: string;
  amountMin: number;
  amountMax: number;
  status: string;
  category: string;
  sectors: string[];
  eligibility: string[];
  daysLeft: number | null;
  applicationCount: number;
  deadlineParsed: string | null;
  isSaved?: boolean;
}

interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  date: string;
  time: string;
  status: string;
  fundingId: string;
}

export default function FundingPage() {
  const [opportunities, setOpportunities] = useState<FundingOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCertified, setIsCertified] = useState(true);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<{
    category: string[];
    status: string[];
    sector: string[];
    eligibility: string[];
    amountRange: string;
    [key: string]: string | string[];
  }>({
    category: [],
    status: [],
    sector: [],
    eligibility: [],
    amountRange: "all"
  });
  const [sortBy, setSortBy] = useState("deadline");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    fetchFunding();
  }, []);

  const fetchFunding = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/funding");
      const result = await res.json();
      if (result.success) {
        setOpportunities(result.data);
        setIsCertified(result.userCertified);
        setActivities(result.activities || []);
        setUpcomingDeadlines(result.upcomingDeadlines || []);
      } else {
        toast.error(result.error || "Failed to load funding opportunities");
      }
    } catch (error) {
      toast.error("An error occurred while fetching funding");
    } finally {
      setLoading(false);
    }
  };

  const toggleSaveOpportunity = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const res = await fetch("/api/funding/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunityId: id })
      });
      const result = await res.json();
      if (result.success) {
        setOpportunities(prev => prev.map(opp => 
          opp.id === id ? { ...opp, isSaved: result.saved } : opp
        ));
        toast.success(result.saved ? "Opportunity saved" : "Opportunity removed from saved");
      }
    } catch (error) {
      toast.error("Failed to update save status");
    }
  };

  // Get status color for activity item
  const getActivityStatusColor = (status: string) => {
    switch (status) {
      case "success": return "border-l-green-500 bg-green-50";
      case "warning": return "border-l-amber-500 bg-amber-50";
      case "error": return "border-l-red-500 bg-red-50";
      case "info": return "border-l-blue-500 bg-blue-50";
      default: return "border-l-gray-500 bg-gray-50";
    }
  };
  
  // Get icon for activity item
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "funding_application": return <FileText className="h-4 w-4" />;
      case "funding_update": return <Bell className="h-4 w-4" />;
      case "funding_deadline": return <Clock className="h-4 w-4" />;
      case "funding_interview": return <Users className="h-4 w-4" />;
      case "funding_disbursement": return <DollarSign className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  // Filter the funding opportunities based on search and filters
  const handleFilterChange = (type: 'category' | 'status' | 'sector' | 'eligibility' | 'amountRange', value: string) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      
      if (type === "status" || type === "category" || type === "sector" || type === "eligibility") {
        const current = newFilters[type] as string[];
        const updated = current.includes(value)
          ? current.filter(v => v !== value)
          : [...current, value];
        newFilters[type] = updated;
      } else if (type === "amountRange") {
        newFilters[type] = value;
      }
      
      return newFilters;
    });
  };

  const filteredOpportunities = opportunities.filter(opportunity => {
    const matchesSearch = 
      opportunity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opportunity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (opportunity.organization || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filters.status.length === 0 || filters.status.includes(opportunity.status);
    const matchesCategory = filters.category.length === 0 || filters.category.includes(opportunity.category);
    
    const opportunitySectors = Array.isArray(opportunity.sectors) ? opportunity.sectors : [];
    const matchesSector = filters.sector.length === 0 || opportunitySectors.some((sector: string) => filters.sector.includes(sector));
    
    const opportunityEligibility = Array.isArray(opportunity.eligibility) ? opportunity.eligibility : [];
    const matchesEligibility = filters.eligibility.length === 0 || opportunityEligibility.some((eligibility: string) => filters.eligibility.includes(eligibility));
    
    const matchesAmountRange = filters.amountRange === "all" || 
      (filters.amountRange === "under10k" && opportunity.amountMin < 10000) ||
      (filters.amountRange === "10k-25k" && opportunity.amountMin >= 10000 && opportunity.amountMax <= 25000) ||
      (filters.amountRange === "25k-50k" && opportunity.amountMin >= 25000 && opportunity.amountMax <= 50000) ||
      (filters.amountRange === "over50k" && (opportunity.amountMax > 50000 || opportunity.amountMin > 50000));
    
    return matchesSearch && matchesStatus && matchesCategory && matchesSector && matchesEligibility && matchesAmountRange;
  });

  // Sort the filtered opportunities
  const sortedOpportunities = [...filteredOpportunities].sort((a, b) => {
    if (sortBy === "deadline") {
      return (a.daysLeft || 0) - (b.daysLeft || 0);
    } else if (sortBy === "amountMax") {
      return (b.amountMax || 0) - (a.amountMax || 0);
    } else if (sortBy === "applicants") {
      return (b.applicationCount || 0) - (a.applicationCount || 0);
    }
    return 0;
  });


  const resetFilters = () => {
    setFilters({
      status: [],
      category: [],
      sector: [],
      eligibility: [],
      amountRange: "all",
    });
    setSearchTerm("");
  };

  // Get unique values for filters
  const getUniqueValues = (field: string) => {
    const values = new Set();
    
    opportunities.forEach(opportunity => {
      if (field === "sector") {
        (opportunity.sectors || []).forEach((sector: string) => values.add(sector));
      } else if (field === "eligibility") {
        (opportunity.eligibility || []).forEach((eligibility: string) => values.add(eligibility));
      } else {
        if (opportunity[field]) values.add(opportunity[field]);
      }
    });
    
    return Array.from(values).sort();
  };

  const uniqueStatuses = getUniqueValues("status");
  const uniqueCategories = getUniqueValues("category");
  const uniqueSectors = getUniqueValues("sector");
  const uniqueEligibilities = getUniqueValues("eligibility");

  const activeFilterCount = Object.values(filters).reduce((count, filter) => {
    if (Array.isArray(filter)) {
      return count + filter.length;
    } else if (filter !== "all") {
      return count + 1;
    }
    return count;
  }, 0);

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Funding Opportunities</h1>
          <p className="text-muted-foreground mt-1">Discover grants, loans, and investment programs for your startup.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2" asChild>
            <Link href="/dashboard/funding/alerts">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Funding Alerts</span>
            </Link>
          </Button>
          <Button className="gap-2" asChild>
            <Link href="/dashboard/funding/my-applications">
              <Landmark className="h-4 w-4" />
              My Applications
            </Link>
          </Button>
        </div>
      </div>

      {!isCertified && (
          <Card className="border-amber-200 bg-amber-50 mb-8">
              <CardHeader className="pb-3">
                  <CardTitle className="text-amber-800 flex items-center gap-2 text-lg">
                      <Bell className="h-5 w-5" />
                      Certification Required
                  </CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                  <p className="text-amber-700 text-sm">
                      Your startup must be certified before you can apply for funding or send pitches to investors. 
                      Please complete your startup recognition application and wait for approval from the committee.
                  </p>
              </CardContent>
              <CardFooter className="pt-0">
                  <Button variant="outline" className="border-amber-300 text-amber-800 hover:bg-amber-100 h-9 text-sm" asChild>
                      <Link href="/dashboard/application">Complete Certification</Link>
                  </Button>
              </CardFooter>
          </Card>
      )}

      {/* Search and filter bar */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-y-0 md:space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search funding opportunities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          {searchTerm && (
            <button 
              className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
              onClick={() => setSearchTerm("")}
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        
        <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <SheetTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-9 px-3 text-xs"
              onClick={() => setIsFilterOpen(true)}
              aria-label="Filter funding opportunities"
            >
              <Filter className="h-4 w-4" />
              <span>Filter</span>
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:max-w-sm">
            <SheetHeader>
              <SheetTitle>Filter Opportunities</SheetTitle>
              <SheetDescription>
                Narrow down funding options based on your requirements
              </SheetDescription>
            </SheetHeader>
            
            <div className="py-6 space-y-6">
              {/* Status filter */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Status</h3>
                <div className="grid grid-cols-2 gap-2">
                  {uniqueStatuses.map(status => (
                    <div key={status} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`status-${status}`} 
                        checked={filters.status.includes(status)}
                        onCheckedChange={() => handleFilterChange("status", status)}
                      />
                      <label 
                        htmlFor={`status-${status}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {status}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              {/* Category filter */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Category</h3>
                <div className="grid grid-cols-1 gap-2">
                  {uniqueCategories.map(category => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`category-${category}`} 
                        checked={filters.category.includes(category)}
                        onCheckedChange={() => handleFilterChange("category", category)}
                      />
                      <label 
                        htmlFor={`category-${category}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {category}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              {/* Sector filter */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Sector</h3>
                <div className="grid grid-cols-2 gap-2">
                  {uniqueSectors.map(sector => (
                    <div key={sector} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`sector-${sector}`} 
                        checked={filters.sector.includes(sector)}
                        onCheckedChange={() => handleFilterChange("sector", sector)}
                      />
                      <label 
                        htmlFor={`sector-${sector}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {sector}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              {/* Eligibility filter */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Eligibility</h3>
                <div className="grid grid-cols-2 gap-2">
                  {uniqueEligibilities.map(eligibility => (
                    <div key={eligibility} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`eligibility-${eligibility}`} 
                        checked={filters.eligibility.includes(eligibility)}
                        onCheckedChange={() => handleFilterChange("eligibility", eligibility)}
                      />
                      <label 
                        htmlFor={`eligibility-${eligibility}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {eligibility}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              {/* Amount range filter */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Funding Amount (USD)</h3>
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="amount-all" 
                      checked={filters.amountRange === "all"}
                      onCheckedChange={() => handleFilterChange("amountRange", "all")}
                    />
                    <label htmlFor="amount-all" className="text-sm font-medium">All amounts</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="amount-under10k" 
                      checked={filters.amountRange === "under10k"}
                      onCheckedChange={() => handleFilterChange("amountRange", "under10k")}
                    />
                    <label htmlFor="amount-under10k" className="text-sm font-medium">Under $10,000</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="amount-10k-25k" 
                      checked={filters.amountRange === "10k-25k"}
                      onCheckedChange={() => handleFilterChange("amountRange", "10k-25k")}
                    />
                    <label htmlFor="amount-10k-25k" className="text-sm font-medium">$10,000 - $25,000</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="amount-25k-50k" 
                      checked={filters.amountRange === "25k-50k"}
                      onCheckedChange={() => handleFilterChange("amountRange", "25k-50k")}
                    />
                    <label htmlFor="amount-25k-50k" className="text-sm font-medium">$25,000 - $50,000</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="amount-over50k" 
                      checked={filters.amountRange === "over50k"}
                      onCheckedChange={() => handleFilterChange("amountRange", "over50k")}
                    />
                    <label htmlFor="amount-over50k" className="text-sm font-medium">Over $50,000</label>
                  </div>
                </div>
              </div>
            </div>
            
            <SheetFooter className="flex justify-between sm:justify-between">
              <Button variant="outline" onClick={resetFilters}>
                Reset Filters
              </Button>
              <SheetClose asChild>
                <Button>Apply Filters</Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Sliders className="h-4 w-4" />
              <span>Sort</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Sort By</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem 
                className={sortBy === "deadline" ? "bg-gray-100" : ""}
                onClick={() => setSortBy("deadline")}
              >
                Deadline (soonest first)
              </DropdownMenuItem>
              <DropdownMenuItem 
                className={sortBy === "amountMax" ? "bg-gray-100" : ""}
                onClick={() => setSortBy("amountMax")}
              >
                Amount (highest first)
              </DropdownMenuItem>
              <DropdownMenuItem 
                className={sortBy === "applicants" ? "bg-gray-100" : ""}
                onClick={() => setSortBy("applicants")}
              >
                Popularity (most applicants)
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Funding opportunities page content with two column layout */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Main content column */}
        <div className="flex-1 space-y-6">
          {/* Active filters */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 items-center mb-4 pb-2 border-b">
              <span className="text-sm text-gray-500">Active filters:</span>
              {filters.status.map(status => (
                <Badge key={`status-${status}`} variant="secondary" className="pl-2 flex items-center gap-1">
                  {status}
                  <button 
                    className="ml-1 rounded-full hover:bg-gray-200 p-0.5"
                    onClick={() => handleFilterChange("status", status)}
                    aria-label={`Remove ${status} filter`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {filters.category.map(category => (
                <Badge key={`category-${category}`} variant="secondary" className="pl-2 flex items-center gap-1">
                  {category}
                  <button 
                    className="ml-1 rounded-full hover:bg-gray-200 p-0.5"
                    onClick={() => handleFilterChange("category", category)}
                    aria-label={`Remove ${category} filter`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {filters.sector.map(sector => (
                <Badge key={`sector-${sector}`} variant="secondary" className="pl-2 flex items-center gap-1">
                  {sector}
                  <button 
                    className="ml-1 rounded-full hover:bg-gray-200 p-0.5"
                    onClick={() => handleFilterChange("sector", sector)}
                    aria-label={`Remove ${sector} filter`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {filters.eligibility.map(eligibility => (
                <Badge key={`eligibility-${eligibility}`} variant="secondary" className="pl-2 flex items-center gap-1">
                  {eligibility}
                  <button 
                    className="ml-1 rounded-full hover:bg-gray-200 p-0.5"
                    onClick={() => handleFilterChange("eligibility", eligibility)}
                    aria-label={`Remove ${eligibility} filter`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {filters.amountRange !== "all" && (
                <Badge variant="secondary" className="pl-2 flex items-center gap-1">
                  {filters.amountRange === "under10k" ? "Under $10K" :
                   filters.amountRange === "10k-25k" ? "$10K - $25K" :
                   filters.amountRange === "25k-50k" ? "$25K - $50K" : "Over $50K"}
                  <button 
                    className="ml-1 rounded-full hover:bg-gray-200 p-0.5"
                    onClick={() => handleFilterChange("amountRange", "all")}
                    aria-label="Remove amount range filter"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={resetFilters} className="h-7 px-2 text-xs">
                Clear all
              </Button>
            </div>
          )}

          {/* No results message */}
          {sortedOpportunities.length === 0 && (
            <div className="text-center py-12 border rounded-lg bg-gray-50">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                <Search className="h-6 w-6 text-gray-500" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No funding opportunities found</h3>
              <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
                We couldn&apos;t find any funding opportunities matching your filters. 
                Try adjusting your search terms or clearing some filters.
              </p>
              <Button variant="outline" onClick={resetFilters} className="mt-6">
                Reset Filters
              </Button>
            </div>
          )}

          {/* Funding opportunities grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sortedOpportunities.map((opportunity) => (
              <Card key={opportunity.id} className="overflow-hidden shadow hover:shadow-lg transition-all duration-200 flex flex-col group hover:translate-y-[-2px]">
                <CardContent className="p-0 flex-1">
                  <div className="p-5">
                    {/* Header row: icon + save */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-sky-50 border border-sky-100">
                        <Landmark className="h-5 w-5 text-sky-700" />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-8 rounded-full ${opportunity.isSaved ? "text-red-500 hover:text-red-600 bg-red-50" : "text-gray-400 hover:text-red-500"}`}
                        onClick={(e) => toggleSaveOpportunity(e, opportunity.id)}
                        aria-label={opportunity.isSaved ? "Unsave" : "Save"}
                      >
                        <Heart className={`h-4 w-4 ${opportunity.isSaved ? "fill-current" : ""}`} />
                      </Button>
                    </div>

                    {/* Title + org */}
                    <h3 className="font-bold text-gray-900 text-lg leading-snug group-hover:text-sky-700 transition-colors line-clamp-2">
                      {opportunity.title}
                    </h3>
                    <p className="text-xs text-muted-foreground font-medium mt-0.5">{opportunity.organization || "Private Organization"}</p>

                    {/* Description */}
                    {opportunity.description && (
                      <p className="text-sm text-gray-500 mt-3 line-clamp-2 leading-relaxed">{opportunity.description}</p>
                    )}

                    {/* Funding amount */}
                    <p className="text-sky-900 font-black mt-4 text-xl tracking-tight">
                      ${opportunity.amountMin?.toLocaleString() || '0'}
                      {opportunity.amountMax ? ` – $${opportunity.amountMax.toLocaleString()}` : '+'}
                    </p>

                    {/* Sector tags */}
                    {Array.isArray(opportunity.sectors) && opportunity.sectors.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {opportunity.sectors.slice(0, 3).map((sector: string) => (
                          <Badge key={sector} variant="outline" className="text-xs px-2 py-0.5 bg-gray-50 text-gray-600 border-gray-200 rounded-full shadow-none">
                            {sector}
                          </Badge>
                        ))}
                        {opportunity.sectors.length > 3 && (
                          <Badge variant="outline" className="text-xs px-2 py-0.5 bg-gray-50 text-gray-400 border-gray-200 rounded-full shadow-none">
                            +{opportunity.sectors.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Status + category badges */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Badge
                        className={`px-2.5 py-0.5 rounded-full text-xs border shadow-none ${
                          opportunity.status === "active" ? "bg-green-100 text-green-800 border-green-200" :
                          opportunity.status === "draft" ? "bg-amber-100 text-amber-800 border-amber-200" :
                          "bg-blue-100 text-blue-800 border-blue-200"
                        }`}
                      >
                        {(opportunity.status || "ACTIVE").toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className="bg-sky-50/50 border-sky-100 text-sky-700 px-2.5 py-0.5 rounded-full text-xs shadow-none">
                        {(opportunity.category || "GRANT").toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </CardContent>

                {/* Footer with deadline + View More CTA */}
                <CardFooter className="px-5 py-3 border-t bg-gray-50/60 flex items-center justify-between gap-3">
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      {opportunity.deadlineParsed ? "Deadline" : ""}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {opportunity.daysLeft !== null && opportunity.daysLeft !== undefined && (
                        <span className={`text-xs font-bold ${
                          (opportunity.daysLeft as number) <= 7 ? "text-red-600" :
                          (opportunity.daysLeft as number) <= 30 ? "text-amber-600" :
                          "text-gray-600"
                        }`}>
                          {opportunity.daysLeft <= 0 ? "Expired" : `${opportunity.daysLeft}d left`}
                        </span>
                      )}
                      {opportunity.deadlineParsed && (
                        <span className="text-[11px] text-gray-400 truncate">{opportunity.deadlineParsed}</span>
                      )}
                      {!opportunity.deadlineParsed && (
                        <span className="text-xs text-gray-400">Ongoing / No deadline</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-sky-600 mt-0.5">
                      <Users className="h-3 w-3" />
                      <span className="text-[11px] font-semibold">{opportunity.applicationCount || 0} applicants</span>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    className="bg-sky-600 hover:bg-sky-700 text-white shrink-0 gap-1.5 rounded-lg px-4"
                    asChild
                  >
                    <Link href={`/dashboard/funding/${opportunity.id}`}>
                      View More
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
        
        {/* Recent Activities Sidebar */}
        <div className="w-full md:w-72 flex-shrink-0 space-y-4">
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Recent Activities</CardTitle>
              <CardDescription>Your latest updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activities.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No recent activities found.</p>
                ) : activities.map((activity) => (
                  <div 
                    key={activity.id} 
                    className={`border-l-4 p-3 rounded-sm bg-opacity-60 ${getActivityStatusColor(activity.status)}`}
                  >
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5 text-gray-600">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <h4 className="text-sm font-medium truncate">{activity.title}</h4>
                        <p className="text-xs text-gray-600 line-clamp-2">{activity.description}</p>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs text-gray-500">{activity.date}</span>
                          <Button variant="ghost" size="sm" className="h-7 px-2" asChild aria-label={`View details for ${activity.title}`}>
                            <Link href={`/dashboard/funding/${activity.fundingId}`}>
                              <ChevronRight className="h-3.5 w-3.5" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href="/dashboard/funding/my-applications">
                  View All Applications
                </Link>
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Upcoming Deadlines</CardTitle>
              <CardDescription>Don&apos;t miss out</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingDeadlines.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No upcoming deadlines.</p>
                ) : upcomingDeadlines.map((opportunity) => (
                    <div key={opportunity.id} className="flex items-start gap-2">
                      <div className={`flex-shrink-0 w-12 h-10 rounded flex flex-col items-center justify-center border ${opportunity.daysLeft <= 7 ? 'bg-red-100 text-red-800 border-red-200' : 'bg-blue-100 text-blue-800 border-blue-200'}`}>
                        <span className="text-[10px] font-semibold leading-none mb-0.5">Days</span>
                        <span className="text-sm font-bold leading-none">{opportunity.daysLeft}</span>
                      </div>
                      <div className="overflow-hidden">
                        <Link href={`/dashboard/funding/${opportunity.id}`} className="text-sm font-medium hover:text-blue-600 block truncate">
                          {opportunity.title}
                        </Link>
                        <p className="text-[10px] text-gray-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(opportunity.deadline).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href="/dashboard/funding">
                  View All Opportunities
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
