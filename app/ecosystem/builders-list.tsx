"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { EcosystemBuilder } from "@/lib/actions/ecosystem";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { MapPin, Search, Filter, Coffee, Wifi, Users, Calendar, Star } from "lucide-react";

interface PublicBuildersListProps {
  initialBuilders: EcosystemBuilder[];
  allSectors: string[];
  showLogin?: boolean;
  featuredOnly?: boolean;
}

export function PublicBuildersList({ 
  initialBuilders, 
  allSectors, 
  showLogin = false,
  featuredOnly = false 
}: PublicBuildersListProps) {
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sectorFilter, setSectorFilter] = useState<string>("all");
  const [filterView, setFilterView] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  // If featuredOnly is true, only show 6 builders max
  const maxBuilders = featuredOnly ? 6 : initialBuilders.length;
  
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
    
    return matchesCategory && matchesSearch && matchesSector;
  }).slice(0, maxBuilders);

  // Helper to get color based on category
  const getCategoryStyle = (category: string) => {
    const styleMap: Record<string, { bg: string, text: string, border: string }> = {
      'INCUBATOR': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
      'ACCELERATOR': { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
      'COWORKING': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
      'INVESTOR': { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200' },
      'GOVERNMENT': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
      'EDUCATION': { bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-200' },
      'COMMUNITY': { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-200' },
    };
    return styleMap[category] || { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' };
  };
  
  // Format category for display
  const formatCategory = (category: string) => {
    return category.charAt(0) + category.slice(1).toLowerCase();
  };
  
  // Helper to get amenity icon
  const getAmenityIcon = (amenity: string) => {
    const amenityLower = amenity.toLowerCase();
    if (amenityLower.includes('internet') || amenityLower.includes('wifi')) 
      return <Wifi className="h-4 w-4" aria-hidden="true" />;
    if (amenityLower.includes('coffee') || amenityLower.includes('café')) 
      return <Coffee className="h-4 w-4" aria-hidden="true" />;
    if (amenityLower.includes('meeting') || amenityLower.includes('conference')) 
      return <Users className="h-4 w-4" aria-hidden="true" />;
    return <Calendar className="h-4 w-4" aria-hidden="true" />;
  };
  
  // Get button text and URL based on builder type
  const getActionDetails = (builder: EcosystemBuilder) => {
    const isCoworkingSpace = builder.category === "COWORKING";
    
    let text = isCoworkingSpace ? "Book Space" : "Apply Now";
    if (builder.category === "INVESTOR") text = "Request Funding";
    else if (builder.category === "INCUBATOR" || builder.category === "ACCELERATOR") text = "Apply to Program";
    
    const url = showLogin 
      ? "/login?redirectTo=" + encodeURIComponent(`/dashboard/ecosystem/builders/${builder.id}?action=${isCoworkingSpace ? 'booking' : 'apply'}`)
      : `/dashboard/ecosystem/builders/${builder.id}?action=${isCoworkingSpace ? 'booking' : 'apply'}`;
    
    return { text, url };
  };
  
  // Get deterministic rating based on builder ID to avoid hydration mismatch
  const getDeterministicRating = (id: string) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const normalized = Math.abs(hash % 100) / 100; // 0 to 0.99
    return (normalized * (5.0 - 3.8) + 3.8).toFixed(1);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {!featuredOnly && (
        <>
          {/* Search and Filter Bar */}
          <div className="bg-white rounded-lg border shadow-sm p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by name, description or location..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Button 
                variant="outline" 
                size="icon" 
                className="h-10 w-10 sm:w-auto sm:px-4 flex items-center gap-2"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filters</span>
              </Button>
            </div>
            
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t">
                <div>
                  <label className="text-sm font-medium mb-1 block">Category</label>
                  <Select 
                    value={categoryFilter} 
                    onValueChange={setCategoryFilter}
                  >
                    <SelectTrigger>
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
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Sector Focus</label>
                  <Select 
                    value={sectorFilter} 
                    onValueChange={setSectorFilter}
                  >
                    <SelectTrigger>
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
                
                <div className="flex items-end">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      setCategoryFilter("all");
                      setSectorFilter("all");
                      setSearchQuery("");
                      setShowFilters(false);
                    }}
                  >
                    Reset Filters
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          {/* View Filtering Tabs */}
          <Tabs value={filterView} onValueChange={setFilterView} className="w-full">
            <TabsList className="w-full max-w-md grid grid-cols-4">
              <TabsTrigger value="all" className="text-sm">All</TabsTrigger>
              <TabsTrigger value="popular" className="text-sm">Popular</TabsTrigger>
              <TabsTrigger value="new" className="text-sm">New</TabsTrigger>
              <TabsTrigger value="nearby" className="text-sm">Nearby</TabsTrigger>
            </TabsList>
          </Tabs>
        </>
      )}
      
      {/* Builder Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredBuilders.map((builder) => {
          const isCoworkingSpace = builder.category === "COWORKING";
          const colors = getCategoryStyle(builder.category);
          const { text, url } = getActionDetails(builder);
          const rating = getDeterministicRating(builder.id);
          
          return (
            <Card key={builder.id} className="overflow-hidden">
              <div className="h-44 overflow-hidden relative bg-gray-100">
                <Image 
                  src={builder.logo || `https://placehold.co/800x600/${colors.border.substring(7)}?text=${encodeURIComponent(builder.name)}`} 
                  alt={builder.name}
                  width={800}
                  height={600}
                  className="w-full h-full object-cover"
                />
                <Badge className={`absolute top-3 left-3 ${colors.bg} ${colors.text}`}>
                  {formatCategory(builder.category)}
                </Badge>
              </div>
              
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">{builder.name}</h3>
                  <div className="flex items-center bg-gray-100 text-gray-800 rounded-md px-2 py-1 text-sm">
                    <Star className="h-3.5 w-3.5 text-yellow-500 mr-1 fill-yellow-500" />
                    <span>{rating}</span>
                  </div>
                </div>
                
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <MapPin className="h-3.5 w-3.5 mr-1" />
                  <span>{builder.location}</span>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0 pb-3">
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                  {builder.description}
                </p>
                
                {/* Services tags */}
                {builder.services && builder.services.length > 0 && (
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-1.5">
                      {builder.services.slice(0, 3).map((service) => (
                        <span 
                          key={service} 
                          className="inline-block px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs"
                        >
                          {service}
                        </span>
                      ))}
                      {builder.services.length > 3 && (
                        <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                          +{builder.services.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Amenities section for coworking spaces */}
                {isCoworkingSpace && builder.amenities && builder.amenities.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-3">
                    {builder.amenities.slice(0, 3).map((amenity) => (
                      <div key={amenity} className="flex items-center text-xs text-gray-600">
                        {getAmenityIcon(amenity)}
                        <span className="ml-1">{amenity}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Price display for coworking spaces */}
                {isCoworkingSpace && builder.pricingPlans && builder.pricingPlans.length > 0 && (
                  <div className="mt-3 text-sm">
                    <span className="font-medium text-gray-700">
                      From {builder.pricingPlans[0].price}
                    </span>
                    <span className="text-gray-500 text-xs ml-1">
                      / {builder.pricingPlans[0].billingCycle}
                    </span>
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="flex justify-between border-t pt-3">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/ecosystem/builders/${builder.id}`} className="text-sm">
                    View Details
                  </Link>
                </Button>
                
                <Button 
                  size="sm" 
                  className={`
                    ${isCoworkingSpace ? 'bg-green-600 hover:bg-green-700' : 
                    builder.category === 'INVESTOR' ? 'bg-amber-600 hover:bg-amber-700' : 
                    builder.category === 'INCUBATOR' || builder.category === 'ACCELERATOR' ? 
                    'bg-blue-600 hover:bg-blue-700' : 'bg-primary'}
                  `}
                  asChild
                >
                  <Link href={url} className="text-sm">
                    {text}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
      
      {/* Login to Apply CTA */}
      {showLogin && filteredBuilders.length > 0 && !featuredOnly && (
        <div className="bg-gray-100 rounded-lg p-6 mt-8 text-center">
          <h3 className="text-lg font-medium mb-2">Ready to Connect?</h3>
          <p className="text-gray-600 mb-4">
            Log in to your account to apply to programs, request funding, or book coworking spaces.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild>
              <Link href="/auth/sign-in">Log In</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/auth/sign-up">Create Account</Link>
            </Button>
          </div>
        </div>
      )}
      
      {/* No Results */}
      {filteredBuilders.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-gray-400">
              <circle cx="12" cy="12" r="10" />
              <path d="m15 9-6 6" />
              <path d="m9 9 6 6" />
            </svg>
          </div>
          <h3 className="text-lg font-medium">No results found</h3>
          <p className="text-gray-500 mt-2 mb-4">No ecosystem builders match your current filters.</p>
          <Button onClick={() => {
            setCategoryFilter("all");
            setSectorFilter("all");
            setSearchQuery("");
          }}>
            Reset Filters
          </Button>
        </div>
      )}
    </div>
  );
}
