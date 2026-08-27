"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Search, X, Filter, SlidersHorizontal, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { StartupCard, StartupData } from "./startup-card";

const DEFAULT_YEAR_MIN = 2015;
const DEFAULT_YEAR_MAX = new Date().getFullYear();

interface StartupDirectoryProps {
  startups: StartupData[];
  isPublic?: boolean;
  title?: string;
  subtitle?: string;
}



export function StartupDirectory({
  startups: providedStartups,
  isPublic = false,
  title = "Startups",
  subtitle = ""
}: StartupDirectoryProps) {
  const startups = providedStartups;
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [foundingYearRange, setFoundingYearRange] = useState<number[]>([
    DEFAULT_YEAR_MIN,
    DEFAULT_YEAR_MAX,
  ]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const statuses = useMemo(
    () => [...new Set(startups.map((s: StartupData) => s.status))].sort(),
    [startups]
  );

  const sectors = useMemo(
    () =>
      [
        "Agriculture",
        "Finance",
        "Health",
        "Education",
        "Technology",
        "Manufacturing",
        "Retail",
        ...startups.map((s: StartupData) => s.sector).filter(Boolean),
      ].filter(Boolean),
    [startups]
  );

  const uniqueSectors = useMemo(
    () => [...new Set(sectors)].sort(),
    [sectors]
  );

  const filteredStartups = useMemo(() => {
    return startups.filter((s: StartupData) => {
      const matchesSearch =
        !searchQuery ||
        [s.name, s.sector, s.description].some(
          (v) =>
            typeof v === "string" &&
            v.toLowerCase().includes(searchQuery.toLowerCase())
        );
      const matchesStatus =
        selectedStatuses.length === 0 || selectedStatuses.includes(s.status);
      const matchesSector =
        selectedSectors.length === 0 || selectedSectors.includes(s.sector);
      const year =
        typeof s.founded === "number" ? s.founded : DEFAULT_YEAR_MIN;
      const matchesYear =
        year >= foundingYearRange[0] && year <= foundingYearRange[1];
      return matchesSearch && matchesStatus && matchesSector && matchesYear;
    });
  }, [
    startups,
    searchQuery,
    selectedStatuses,
    selectedSectors,
    foundingYearRange,
  ]);

  const toggleStatus = (status: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s: string) => s !== status) : [...prev, status]
    );
  };

  const toggleSector = (sector: string) => {
    setSelectedSectors((prev) =>
      prev.includes(sector) ? prev.filter((s: string) => s !== sector) : [...prev, sector]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedStatuses([]);
    setSelectedSectors([]);
    setFoundingYearRange([DEFAULT_YEAR_MIN, DEFAULT_YEAR_MAX]);
  };

  const activeFilterCount =
    (searchQuery ? 1 : 0) +
    selectedStatuses.length +
    selectedSectors.length +
    (foundingYearRange[0] !== DEFAULT_YEAR_MIN ||
      foundingYearRange[1] !== DEFAULT_YEAR_MAX
      ? 1
      : 0);

  return (
    <div className="space-y-8">
      {/* Dynamic Header based on context */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 pb-8">
        <div className="space-y-3 shrink-0">
          {isPublic && (
            <Link href="/" className="inline-flex items-center gap-2 text-brand-mint-teal font-black text-[10px] uppercase tracking-widest hover:gap-3 transition-all">
              <ArrowLeft size={12} /> Back to Landing
            </Link>
          )}
          <h1 className="text-3xl md:text-4xl lg:text-[42px] font-black tracking-tighter flex items-center gap-2">
            <span className="text-brand-startup-amber">{title.split(' ')[0]}</span> <span className="text-brand-mint-teal italic underline decoration-brand-startup-amber decoration-[6px] underline-offset-[8px]">{title.split(' ').slice(1).join(' ')}</span>
          </h1>
          <p className="text-brand-mint-teal font-black max-w-xl text-[13px] leading-relaxed hidden md:block tracking-tight">
            {subtitle}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:max-w-xl">
          <div className="relative w-full group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-mint-teal h-5 w-5 pointer-events-none transition-colors">
              <Search size={18} className="stroke-[3]" />
            </div>
            <Input
              placeholder="Search registry..."
              className="pl-12 h-12 bg-white border-2 border-brand-mint-teal/30 rounded-xl shadow-xl shadow-brand-mint-teal/5 focus:border-brand-mint-teal focus:ring-4 focus:ring-brand-mint-teal/5 transition-all font-bold text-brand-deep-dark md:min-w-[400px] text-sm placeholder:text-brand-deep-dark placeholder:font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            className="md:hidden rounded-xl border-brand-mint-teal h-14 w-full"
            onClick={() => setShowMobileFilters((prev) => !prev)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </Button>
        </div>
      </div>

      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 items-center px-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-brand-mint-teal">Active parameters:</span>
          {searchQuery && (
            <Badge variant="secondary" className="bg-brand-mint-teal/5 text-brand-mint-teal border-brand-mint-teal font-bold px-2 py-1 flex items-center gap-1.5">
              Search: {searchQuery}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchQuery("")} />
            </Badge>
          )}
          {/* ... other active filters similar to above ... */}
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 text-[10px] uppercase font-black tracking-widest text-rose-500 hover:text-rose-600 hover:bg-rose-50">
            Clear all
          </Button>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-10 pt-4">
        {/* Filter Sidebar - Institutional Grade UI */}
        <div className={`md:w-72 shrink-0 ${showMobileFilters ? "block" : "hidden md:block"}`}>
          <div className="sticky top-24 space-y-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-xs uppercase tracking-widest text-brand-deep-dark flex items-center">
                  <SlidersHorizontal className="h-4 w-4 mr-2 text-brand-mint-teal" />
                  Parameters
                </h3>
                <Button variant="ghost" size="lg" onClick={clearFilters} className="h-8 px-2 text-[10px] font-black uppercase text-brand-mint-teal">
                  Reset
                </Button>
              </div>

              <div className="space-y-4">
                <h4 className="text-[13px] font-black uppercase  text-brand-deep-dark">Verified Status</h4>
                <div className="space-y-2.5">
                  {(statuses.length ? statuses : ["Certified", "Pending", "New"]).map((status) => (
                    <div key={status} className="flex items-center gap-3 group cursor-pointer" onClick={() => toggleStatus(status)}>
                      <Checkbox id={`status-${status}`} checked={selectedStatuses.includes(status)} className="border-brand-mint-teal data-[state=checked]:bg-brand-mint-teal data-[state=checked]:border-brand-mint-teal" />
                      <Label htmlFor={`status-${status}`} className="text-sm font-black text-brand-mint-teal group-hover:text-brand-mint-teal transition-colors cursor-pointer capitalize">
                        {status.toLowerCase()}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>


              <div className="space-y-4">
                <h4 className="text-[13px] font-black uppercase text-brand-deep-dark">Economic Sectors</h4>
                <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-2 [scrollbar-width:none]">
                  {uniqueSectors.map((sector) => (
                    <div key={sector} className="flex items-center gap-3 group cursor-pointer" onClick={() => toggleSector(sector)}>
                      <Checkbox id={`sector-${sector}`} checked={selectedSectors.includes(sector)} className="border-brand-mint-teal data-[state=checked]:bg-brand-mint-teal data-[state=checked]:border-brand-mint-teal" />
                      <Label htmlFor={`sector-${sector}`} className="text-sm font-black text-brand-mint-teal group-hover:text-brand-mint-teal transition-colors cursor-pointer capitalize">
                        {sector.toLowerCase()}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>


              <div className="space-y-6">
                <h4 className="text-[13px] font-black uppercase text-brand-deep-dark">Foundation Year</h4>
                <div className="px-2">
                  <Slider min={DEFAULT_YEAR_MIN} max={DEFAULT_YEAR_MAX} step={1} value={foundingYearRange} onValueChange={setFoundingYearRange} className="my-6" />
                  <div className="flex justify-between text-[11px] font-black text-brand-deep-dark">
                    <div>{foundingYearRange[0]}</div>
                    <div>{foundingYearRange[1]}</div>
                  </div>
                </div>
              </div>

              {showMobileFilters && (
                <Button className="w-full bg-brand-deep-dark text-white rounded-xl h-12" onClick={() => setShowMobileFilters(false)}>
                  Apply Parameters
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Listing - Responsive Grid */}
        <div className="grow">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredStartups.length === 0 ? (
              <div className="col-span-full text-center py-24 text-brand-deep-dark border-2 border-dashed border-brand-mint-teal rounded-[40px] bg-brand-mint-teal/5">
                <Search size={40} className="mx-auto mb-4 opacity-20" />
                <p className="font-black text-xs uppercase tracking-widest">No entities match your criteria</p>
                <Button variant="link" onClick={clearFilters} className="text-brand-mint-teal font-black text-[10px] uppercase mt-2">Clear all filters</Button>
              </div>
            ) : (
              filteredStartups.map((startup) => (
                <StartupCard key={startup.id} startup={startup} isPublic={isPublic} />
              ))
            )}
          </div>

          <div className="mt-16 flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-brand-mint-teal">
            End of records • National Repository 2.0
          </div>
        </div>
      </div>
    </div>
  );
}
