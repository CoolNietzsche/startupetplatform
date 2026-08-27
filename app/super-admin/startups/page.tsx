"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ViewStartupDialog } from "@/components/super-admin/view-startup-dialog";
import { ConfirmActionDialog } from "@/components/super-admin/confirm-action-dialog";
import { 
  Search, 
  Download,
  Rocket,
  MapPin,
  Calendar,
  Users,
  Eye,
  Ban,
  ShieldX,
  BarChart3,
  DollarSign,
  Award,
  Briefcase,
  TrendingUp,
  Loader2
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getStartups, suspendStartup, revokeStartupCertification } from "./startups-actions";
import { toast } from "sonner";

export default function StartupsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedSector, setSelectedSector] = useState("all");
  const [selectedStage, setSelectedStage] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isSuspendDialogOpen, setIsSuspendDialogOpen] = useState(false);
  const [isRevokeDialogOpen, setIsRevokeDialogOpen] = useState(false);
  
  const [startups, setStartups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStartup, setSelectedStartup] = useState<any | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getStartups({
        search: searchTerm,
        sector: selectedSector,
        region: selectedRegion,
        status: selectedStatus,
      });

      if (res.success) {
        setStartups(res.data || []);
      } else {
        toast.error(res.message || "Failed to fetch startups");
      }
    } catch (error) {
      console.error("Error fetching startups:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedSector, selectedRegion, selectedStatus]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleViewStartup = (id: string) => {
    const startup = startups.find(s => s.id === id);
    if (startup) {
      setSelectedStartup(startup);
      setIsViewDialogOpen(true);
    }
  };

  const handleSuspendStartup = (id: string) => {
    const startup = startups.find(s => s.id === id);
    if (startup) {
      setSelectedStartup(startup);
      setIsSuspendDialogOpen(true);
    }
  };

  const handleRevokeStartup = (id: string) => {
    const startup = startups.find(s => s.id === id);
    if (startup) {
      setSelectedStartup(startup);
      setIsRevokeDialogOpen(true);
    }
  };

  const confirmSuspend = async () => {
    if (selectedStartup) {
      try {
        const res = await suspendStartup(selectedStartup.id);
        if (res.success) {
          toast.success(`${selectedStartup.name} has been suspended`);
          fetchData();
        } else {
          toast.error(res.message || "Failed to suspend startup");
        }
      } catch (error) {
        toast.error("Failed to suspend startup");
      }
    }
  };

  const confirmRevoke = async () => {
    if (selectedStartup) {
      try {
        const res = await revokeStartupCertification(selectedStartup.id);
        if (res.success) {
          toast.success(`Certification revoked for ${selectedStartup.name}`);
          fetchData();
        } else {
          toast.error(res.message || "Failed to revoke certification");
        }
      } catch (error) {
        toast.error("Failed to revoke certification");
      }
    }
  };

  const handleExport = () => {
    toast.info("Exporting startups data to CSV...");
  };

  const filteredStartups = startups;

  // Calculate statistics
  const totalStartups = startups.length;
  const certifiedStartups = startups.filter(s => s.certificationStatus === "Certified").length;
  const totalFunding = startups.reduce((sum, s) => sum + s.fundingRaised, 0);
  const totalEmployees = startups.reduce((sum, s) => sum + s.employeeCount, 0);

  const startupsBySector = startups.reduce((acc, startup) => {
    acc[startup.sector] = (acc[startup.sector] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const startupsByRegion = startups.reduce((acc, startup) => {
    acc[startup.region] = (acc[startup.region] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const startupsByStage = startups.reduce((acc, startup) => {
    acc[startup.stage] = (acc[startup.stage] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Registered Startups</h1>
          <p className="text-muted-foreground">
            View and manage all registered startups in the ecosystem
          </p>
        </div>
      </div>

      {loading && startups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-purple-600 mb-4" />
          <p className="text-muted-foreground italic">Fetching startups...</p>
        </div>
      ) : (
        <>
          {/* Statistics Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Startups</CardTitle>
                <Rocket className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalStartups}</div>
                <p className="text-xs text-muted-foreground">
                  {certifiedStartups} certified
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Funding</CardTitle>
                <DollarSign className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(totalFunding / 1000000).toFixed(1)}M ETB
                </div>
                <p className="text-xs text-muted-foreground">
                  Raised by startups
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-gray-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                <Users className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalEmployees}</div>
                <p className="text-xs text-muted-foreground">
                  Jobs created
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-gray-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Team Size</CardTitle>
                <BarChart3 className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {totalStartups > 0 ? Math.round(totalEmployees / totalStartups) : 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Employees per startup
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Distribution Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sector Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(startupsBySector)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 5)
                    .map(([sector, count]) => (
                      <div key={sector} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-purple-500" />
                          <span className="text-sm font-medium">{sector}</span>
                        </div>
                        <Badge variant="secondary">{count} startups</Badge>
                      </div>
                    ))}
                  {Object.keys(startupsBySector).length === 0 && <p className="text-sm text-muted-foreground italic">No sector data</p>}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Regional Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(startupsByRegion)
                    .sort(([, a], [, b]) => b - a)
                    .map(([region, count]) => (
                      <div key={region} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium">{region}</span>
                        </div>
                        <Badge variant="secondary">{count} startups</Badge>
                      </div>
                    ))}
                  {Object.keys(startupsByRegion).length === 0 && <p className="text-sm text-muted-foreground italic">No regional data</p>}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Funding Stage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(startupsByStage)
                    .sort(([, a], [, b]) => b - a)
                    .map(([stage, count]) => (
                      <div key={stage} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-purple-500" />
                          <span className="text-sm font-medium">{stage}</span>
                        </div>
                        <Badge variant="secondary">{count} startups</Badge>
                      </div>
                    ))}
                  {Object.keys(startupsByStage).length === 0 && <p className="text-sm text-muted-foreground italic">No stage data</p>}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card>
            <CardHeader>
              <CardTitle>Startups Directory</CardTitle>
              <CardDescription>Search and filter registered startups</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or founder..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Regions</SelectItem>
                    <SelectItem value="Addis Ababa">Addis Ababa</SelectItem>
                    <SelectItem value="Oromia">Oromia</SelectItem>
                    <SelectItem value="Amhara">Amhara</SelectItem>
                    <SelectItem value="Tigray">Tigray</SelectItem>
                    <SelectItem value="SNNPR">SNNPR</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedSector} onValueChange={setSelectedSector}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Sector" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sectors</SelectItem>
                    <SelectItem value="Fintech">Fintech</SelectItem>
                    <SelectItem value="Agritech">Agritech</SelectItem>
                    <SelectItem value="Healthtech">Healthtech</SelectItem>
                    <SelectItem value="Edtech">Edtech</SelectItem>
                    <SelectItem value="Mobility">Mobility</SelectItem>
                    <SelectItem value="Clean Energy">Clean Energy</SelectItem>
                    <SelectItem value="Logistics">Logistics</SelectItem>
                    <SelectItem value="Tourism">Tourism</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedStage} onValueChange={setSelectedStage}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stages</SelectItem>
                    <SelectItem value="Pre-Seed">Pre-Seed</SelectItem>
                    <SelectItem value="Seed">Seed</SelectItem>
                    <SelectItem value="Series A">Series A</SelectItem>
                    <SelectItem value="Series B">Series B</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Certified">Certified</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" onClick={handleExport}>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>

              {/* Startups Table */}
              <div className="rounded-md border">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Startup
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Sector
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Stage
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Location
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Founded
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Funding
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Certification
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredStartups.map((startup) => (
                        <tr key={startup.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Rocket className="h-5 w-5 text-purple-600" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{startup.name}</div>
                                <div className="text-sm text-gray-500">{startup.founder}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <Badge variant="outline">{startup.sector}</Badge>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <Badge className="bg-purple-100 text-purple-800">{startup.stage}</Badge>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{startup.city}</div>
                            <div className="text-sm text-gray-500">{startup.region}</div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-500">
                              <Calendar className="mr-1 h-4 w-4" />
                              {startup.foundedDate}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <DollarSign className="mr-1 h-4 w-4 text-gray-400" />
                              <span className="text-sm font-medium">
                                {(startup.fundingRaised / 1000000).toFixed(1)}M
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex flex-col gap-1">
                              <Badge className={
                                startup.certificationStatus === "Certified" 
                                  ? "bg-green-100 text-green-800" 
                                  : startup.certificationStatus === "Pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-100 text-gray-800"
                              }>
                                {startup.certificationStatus}
                              </Badge>
                              {startup.certificationStatus === "Certified" && (
                                <Badge variant="outline" className="text-xs">
                                  <Award className="mr-1 h-3 w-3" />
                                  {startup.certificationLevel}
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleViewStartup(startup.id)} title="View Details">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-700" onClick={() => handleSuspendStartup(startup.id)} title="Suspend">
                                <Ban className="h-4 w-4" />
                              </Button>
                              {startup.certificationStatus === "Certified" && (
                                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleRevokeStartup(startup.id)} title="Revoke Certification">
                                  <ShieldX className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {filteredStartups.length === 0 && !loading && (
                <div className="text-center py-12">
                  <Rocket className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No startups found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* View Startup Dialog */}
      <ViewStartupDialog 
        open={isViewDialogOpen} 
        onOpenChange={setIsViewDialogOpen}
        startup={selectedStartup}
      />
      
      {/* Suspend Confirmation Dialog */}
      <ConfirmActionDialog
        open={isSuspendDialogOpen}
        onOpenChange={setIsSuspendDialogOpen}
        onConfirm={confirmSuspend}
        title="Suspend Startup"
        description="This will temporarily suspend the startup&apos;s access to the platform."
        actionType="suspend"
        entityName={selectedStartup?.name || ""}
      />
      
      {/* Revoke Confirmation Dialog */}
      <ConfirmActionDialog
        open={isRevokeDialogOpen}
        onOpenChange={setIsRevokeDialogOpen}
        onConfirm={confirmRevoke}
        title="Revoke Certification"
        description="This will permanently revoke the startup&apos;s certification."
        actionType="revoke"
        entityName={selectedStartup?.name || ""}
      />
    </div>
  );
}
