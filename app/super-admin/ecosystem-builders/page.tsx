"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import { ViewBuilderDialog } from "@/components/super-admin/view-builder-dialog";
import { ConfirmActionDialog } from "@/components/super-admin/confirm-action-dialog";
import { 
  Search, 
  Download,
  Building2,
  MapPin,
  Calendar,
  Users,
  Eye,
  Ban,
  ShieldX,
  BarChart3,
  Globe,
  Loader2
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  getCertifiedEcosystemBuilders, 
  suspendEcosystemBuilder, 
  revokeEcosystemBuilderStatus 
} from "./builders-actions";
import { toast } from "sonner";

export default function EcosystemBuildersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isSuspendDialogOpen, setIsSuspendDialogOpen] = useState(false);
  const [isRevokeDialogOpen, setIsRevokeDialogOpen] = useState(false);
  
  const [builders, setBuilders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBuilder, setSelectedBuilder] = useState<any | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getCertifiedEcosystemBuilders({
        search: searchTerm,
        type: selectedType,
        region: selectedRegion,
      });

      if (res.success) {
        setBuilders(res.data || []);
      } else {
        toast.error(res.message || "Failed to fetch builders");
      }
    } catch (error) {
      console.error("Error fetching builders:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedType, selectedRegion]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);



  const handleViewBuilder = (id: string) => {
    const builder = builders.find(b => b.id === id);
    if (builder) {
      setSelectedBuilder(builder);
      setIsViewDialogOpen(true);
    }
  };

  const handleSuspendBuilder = (id: string) => {
    const builder = builders.find(b => b.id === id);
    if (builder) {
      setSelectedBuilder(builder);
      setIsSuspendDialogOpen(true);
    }
  };

  const handleRevokeBuilder = (id: string) => {
    const builder = builders.find(b => b.id === id);
    if (builder) {
      setSelectedBuilder(builder);
      setIsRevokeDialogOpen(true);
    }
  };

  const confirmSuspend = async () => {
    if (selectedBuilder) {
      try {
        const res = await suspendEcosystemBuilder(selectedBuilder.id);
        if (res.success) {
          toast.success(`${selectedBuilder.name} has been suspended`);
          fetchData();
        } else {
          toast.error(res.message || "Failed to suspend builder");
        }
      } catch (error) {
        toast.error("Failed to suspend builder");
      }
    }
  };

  const confirmRevoke = async () => {
    if (selectedBuilder) {
      try {
        const res = await revokeEcosystemBuilderStatus(selectedBuilder.id);
        if (res.success) {
          toast.success(`${selectedBuilder.name} has been revoked from the ecosystem`);
          fetchData();
        } else {
          toast.error(res.message || "Failed to revoke builder");
        }
      } catch (error) {
        toast.error("Failed to revoke builder");
      }
    }
  };

  const handleExport = () => {
    toast.info("Exporting ecosystem builders data to CSV...");
  };

  const filteredBuilders = builders.filter(builder => {
    const matchesStatus = selectedStatus === "all" || builder.status === selectedStatus;
    return matchesStatus;
  });

  const totalBuilders = builders.length;
  const activeBuilders = builders.filter(b => b.status === "Active").length;
  const totalStartupsSupported = builders.reduce((sum, b) => sum + (b.startupsSupported || 0), 0);
  const totalPrograms = builders.reduce((sum, b) => sum + (b.programsOffered || 0), 0);

  const buildersByRegion = builders.reduce((acc, builder) => {
    if (builder.region) {
      acc[builder.region] = (acc[builder.region] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const buildersByType = builders.reduce((acc, builder) => {
    if (builder.type) {
      acc[builder.type] = (acc[builder.type] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ecosystem Builders</h1>
          <p className="text-muted-foreground">
            Manage certified incubators, accelerators, and innovation hubs
          </p>
        </div>

      </div>

      {loading && builders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-purple-600 mb-4" />
          <p className="text-muted-foreground italic">Fetching ecosystem builders...</p>
        </div>
      ) : (
        <>
          {/* Statistics Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Builders</CardTitle>
                <Building2 className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalBuilders}</div>
                <p className="text-xs text-muted-foreground">
                  {activeBuilders} certified & active
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Startups Capacity</CardTitle>
                <Users className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalStartupsSupported}</div>
                <p className="text-xs text-muted-foreground">
                  Total capacity across builders
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-gray-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Programs</CardTitle>
                <BarChart3 className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalPrograms}</div>
                <p className="text-xs text-muted-foreground">
                  Programs offered
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-gray-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Regions Covered</CardTitle>
                <Globe className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Object.keys(buildersByRegion).length}</div>
                <p className="text-xs text-muted-foreground">
                  Nationwide presence
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Distribution Cards */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Regional Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(buildersByRegion)
                    .sort(([, a], [, b]) => b - a)
                    .map(([region, count]) => (
                      <div key={region} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-purple-500" />
                          <span className="text-sm font-medium">{region}</span>
                        </div>
                        <Badge variant="secondary">{count} builders</Badge>
                      </div>
                    ))}
                  {Object.keys(buildersByRegion).length === 0 && (
                    <p className="text-sm text-muted-foreground italic text-center py-4">No regional data available</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Builder Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(buildersByType)
                    .sort(([, a], [, b]) => b - a)
                    .map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium">{type}</span>
                        </div>
                        <Badge variant="secondary">{count} builders</Badge>
                      </div>
                    ))}
                  {Object.keys(buildersByType).length === 0 && (
                    <p className="text-sm text-muted-foreground italic text-center py-4">No type data available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card>
            <CardHeader>
              <CardTitle>Ecosystem Builders Directory</CardTitle>
              <CardDescription>Search and filter ecosystem builders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or city..."
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
                    <SelectItem value="Dire Dawa">Dire Dawa</SelectItem>
                    <SelectItem value="Harari">Harari</SelectItem>
                    <SelectItem value="Afar">Afar</SelectItem>
                    <SelectItem value="Benishangul-Gumuz">Benishangul-Gumuz</SelectItem>
                    <SelectItem value="Gambela">Gambela</SelectItem>
                    <SelectItem value="Sidama">Sidama</SelectItem>
                    <SelectItem value="South Ethiopia">South Ethiopia</SelectItem>
                    <SelectItem value="Central Ethiopia">Central Ethiopia</SelectItem>
                    <SelectItem value="South West Ethiopia">South West Ethiopia</SelectItem>
                    <SelectItem value="Somali">Somali</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Incubator">Incubator</SelectItem>
                    <SelectItem value="Accelerator">Accelerator</SelectItem>
                    <SelectItem value="Innovation Hub">Innovation Hub</SelectItem>
                    <SelectItem value="Coworking Space">Coworking Space</SelectItem>
                    <SelectItem value="Investor Network">Investor Network</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" onClick={handleExport}>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>

              {/* Builders Table */}
              <div className="rounded-md border">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Builder
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Location
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Established
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Capacity
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredBuilders.map((builder) => (
                        <tr key={builder.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Building2 className="h-5 w-5 text-purple-600" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{builder.name}</div>
                                <div className="text-sm text-gray-500">{builder.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <Badge variant="outline">{builder.type}</Badge>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{builder.city}</div>
                            <div className="text-sm text-gray-500">{builder.region}</div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-500">
                              <Calendar className="mr-1 h-4 w-4" />
                              {builder.establishedDate ? new Date(builder.establishedDate).getFullYear() : 'N/A'}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Users className="mr-1 h-4 w-4 text-gray-400" />
                              <span className="text-sm font-medium">{builder.startupsSupported || 0}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <Badge className={builder.status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                              {builder.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleViewBuilder(builder.id)} title="View Details">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-700" onClick={() => handleSuspendBuilder(builder.id)} title="Suspend">
                                <Ban className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleRevokeBuilder(builder.id)} title="Revoke Status">
                                <ShieldX className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {filteredBuilders.length === 0 && !loading && (
                <div className="text-center py-12">
                  <Building2 className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No builders found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}


      
      {/* View Builder Dialog */}
      <ViewBuilderDialog 
        open={isViewDialogOpen} 
        onOpenChange={setIsViewDialogOpen}
        builder={selectedBuilder}
        onSuccess={fetchData}
      />
      
      {/* Suspend Confirmation Dialog */}
      <ConfirmActionDialog
        open={isSuspendDialogOpen}
        onOpenChange={setIsSuspendDialogOpen}
        onConfirm={confirmSuspend}
        title="Suspend Ecosystem Builder"
        description="This will temporarily suspend the builder's access to the platform."
        actionType="suspend"
        entityName={selectedBuilder?.name || ""}
      />
      
      {/* Revoke Confirmation Dialog */}
      <ConfirmActionDialog
        open={isRevokeDialogOpen}
        onOpenChange={setIsRevokeDialogOpen}
        onConfirm={confirmRevoke}
        title="Revoke Builder Status"
        description="This will permanently revoke the ecosystem builder status."
        actionType="revoke"
        entityName={selectedBuilder?.name || ""}
      />
    </div>
  );
}
