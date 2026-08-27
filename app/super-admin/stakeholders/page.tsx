"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Building2, 
  Plus, 
  Search, 
  Edit, 
  Trash2,
  Eye,
  Users,
  Shield,
  Globe,
  Mail,
  Phone,
  MapPin,
  UserPlus,
  Loader2,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  MoreHorizontal,
  X,
  EyeOff,
  Key,
  RotateCcw
} from "lucide-react";
import { 
  getStakeholders, 
  createStakeholder, 
  updateStakeholder, 
  deleteStakeholder, 
  toggleStakeholderPortalAccess,
  addStakeholderAdmin,
  removeStakeholderAdmin,
  resetStakeholderAdminPassword,
  updateStakeholderStatus
} from "@/app/super-admin/stakeholders/actions";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

interface StakeholderAdmin {
  id: string;
  name: string;
  email: string;
  role: string;
  addedDate: string;
}

interface Stakeholder {
  id: string;
  name: string;
  type: string;
  description: string;
  website: string;
  email: string;
  phone: string;
  address: string;
  region: string;
  status: "active" | "inactive" | "pending";
  portalAccess: boolean;
  admins: StakeholderAdmin[];
  createdAt: string;
  dashboardUrl: string;
}

export default function StakeholderManagementPage() {
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isAddAdminDialogOpen, setIsAddAdminDialogOpen] = useState(false);
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false);
  const [selectedStakeholder, setSelectedStakeholder] = useState<Stakeholder | null>(null);
  const [selectedAdmin, setSelectedAdmin] = useState<StakeholderAdmin | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    type: "Government Ministry",
    customType: "",
    description: "",
    website: "",
    email: "",
    phone: "",
    address: "",
    region: "Addis Ababa",
    status: "pending" as Stakeholder['status'],
    portalAccess: false
  });

  const [isCustomType, setIsCustomType] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchStakeholders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getStakeholders({
        search: searchTerm,
        type: filterType,
        status: filterStatus
      });
      if (res.success) {
        setStakeholders(res.data || []);
      } else {
        toast.error(res.message || "Failed to load stakeholders");
      }
    } catch (error) {
      toast.error("Error fetching stakeholders");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterType, filterStatus]);

  useEffect(() => {
    fetchStakeholders();
  }, [fetchStakeholders]);

  const stakeholderTypes = [
    "Government Ministry",
    "Financial Institution",
    "Regulatory Authority",
    "Investment Authority",
    "Regional Government",
    "City Administration",
    "Development Bank",
    "Trade Association"
  ];

  const regions = [
    "Addis Ababa",
    "Oromia",
    "Amhara",
    "Tigray",
    "SNNPR",
    "Somali",
    "Afar",
    "Benishangul-Gumuz",
    "Gambela",
    "Harari",
    "Dire Dawa"
  ];

  const [adminFormData, setAdminFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "Stakeholder Admin",
    showPassword: false
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-amber-100 text-amber-800";
      case "inactive":
        return "bg-rose-100 text-rose-800 border-rose-200";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  const [resetPasswordData, setResetPasswordData] = useState({
    password: "",
    showPassword: false
  });

  const handleCreateStakeholder = async () => {
    if (!formData.name) {
      toast.error("Organization name is required");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const finalType = isCustomType && formData.customType ? formData.customType : formData.type;
      const res = await createStakeholder({ ...formData, type: finalType });
      
      if (res.success) {
        toast.success("Stakeholder created successfully");
        setIsCreateDialogOpen(false);
        resetForm();
        fetchStakeholders();
      } else {
        toast.error(res.message || "Failed to create stakeholder");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditStakeholder = (stakeholder: Stakeholder) => {
    setSelectedStakeholder(stakeholder);
    const isPredefinedType = stakeholderTypes.includes(stakeholder.type);
    setIsCustomType(!isPredefinedType);
    setFormData({
      name: stakeholder.name,
      type: isPredefinedType ? stakeholder.type : "Custom",
      customType: isPredefinedType ? "" : stakeholder.type,
      description: stakeholder.description,
      website: stakeholder.website,
      email: stakeholder.email,
      phone: stakeholder.phone,
      address: stakeholder.address,
      region: stakeholder.region,
      status: stakeholder.status,
      portalAccess: stakeholder.portalAccess
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateStakeholder = async () => {
    if (!selectedStakeholder) return;
    
    setIsSubmitting(true);
    try {
      const finalType = isCustomType && formData.customType ? formData.customType : formData.type;
      const res = await updateStakeholder(selectedStakeholder.id, { ...formData, type: finalType });
      
      if (res.success) {
        toast.success("Stakeholder updated successfully");
        setIsEditDialogOpen(false);
        resetForm();
        fetchStakeholders();
      } else {
        toast.error(res.message || "Failed to update stakeholder");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStakeholder = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        const res = await deleteStakeholder(id);
        if (res.success) {
          toast.success("Stakeholder deleted");
          fetchStakeholders();
        } else {
          toast.error(res.message || "Failed to delete stakeholder");
        }
      } catch (error) {
        toast.error("Error deleting stakeholder");
      }
    }
  };

  const handleTogglePortalAccess = async (id: string, current: boolean) => {
    try {
      const res = await toggleStakeholderPortalAccess(id, current);
      if (res.success) {
        toast.success("Portal access updated");
        fetchStakeholders();
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error("Failed to update portal access");
    }
  };

  const handleAddAdmin = async () => {
    if (!selectedStakeholder || !adminFormData.email || !adminFormData.password) return;

    setIsSubmitting(true);
    try {
      const res = await addStakeholderAdmin(selectedStakeholder.id, adminFormData);
      if (res.success) {
        toast.success("Administrator added successfully");
        setIsAddAdminDialogOpen(false);
        setAdminFormData({ name: "", email: "", password: "", role: "Stakeholder Admin", showPassword: false });
        fetchStakeholders();
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error("Failed to add administrator");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    if (!selectedAdmin || !resetPasswordData.password) return;

    setIsSubmitting(true);
    try {
      const res = await resetStakeholderAdminPassword(selectedAdmin.id, resetPasswordData.password);
      if (res.success) {
        toast.success("Password reset successfully");
        setIsResetPasswordDialogOpen(false);
        setResetPasswordData({ password: "", showPassword: false });
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error("Failed to reset password");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveAdmin = async (adminId: string) => {
    if (confirm("Are you sure you want to remove this admin?")) {
      try {
        const res = await removeStakeholderAdmin(adminId);
        if (res.success) {
          toast.success("Administrator removed");
          fetchStakeholders();
        } else {
          toast.error(res.message);
        }
      } catch (error) {
        toast.error("Failed to remove administrator");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      type: "Government Ministry",
      customType: "",
      description: "",
      website: "",
      email: "",
      phone: "",
      address: "",
      region: "Addis Ababa",
      status: "pending",
      portalAccess: false
    });
    setAdminFormData({
      name: "",
      email: "",
      password: "StartupET@2025",
      role: "Stakeholder Admin",
      showPassword: false
    });
    setIsCustomType(false);
    setSelectedStakeholder(null);
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl lg:text-3xl font-black tracking-tighter text-brand-deep-dark">
            Stakeholder <span className="text-brand-mint-teal italic">Matrix</span>
          </h1>
          <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.2em] mt-1 lg:mt-2">
            Strategic Oversight of Institutional Partners
          </p>
        </div>
        <Button 
          onClick={() => setIsCreateDialogOpen(true)} 
          className="bg-brand-mint-teal hover:bg-brand-mint-teal/90 text-white font-bold h-10 px-6 rounded-xl shadow-lg shadow-brand-mint-teal/20 transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Stakeholder
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-2 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 relative overflow-hidden bg-gradient-to-br from-brand-deep-dark to-slate-900 border-brand-deep-dark">
          <div className="flex flex-col relative z-10">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] font-bold uppercase tracking-wider text-white/60">Total Authorities</span>
              <Building2 className="h-4 w-4 text-brand-startup-amber" />
            </div>
            <div className="text-2xl font-black tracking-tight text-white mb-0.5">
              {stakeholders.length}
            </div>
          </div>
        </Card>
        
        <Card className="border-2 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 relative overflow-hidden bg-gradient-to-br from-brand-mint-teal/5 to-brand-mint-teal/20 border-brand-mint-teal/20">
          <div className="flex flex-col relative z-10">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] font-bold uppercase tracking-wider text-brand-deep-dark/60">Active Portals</span>
              <Globe className="h-4 w-4 text-brand-mint-teal" />
            </div>
            <div className="text-2xl font-black tracking-tight text-brand-deep-dark mb-0.5">
              {stakeholders.filter(s => s.portalAccess).length}
            </div>
          </div>
        </Card>
        
        <Card className="border-2 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 relative overflow-hidden bg-gradient-to-br from-brand-startup-amber/5 to-brand-startup-amber/20 border-brand-startup-amber/20">
          <div className="flex flex-col relative z-10">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] font-bold uppercase tracking-wider text-brand-deep-dark/60">Account Admins</span>
              <Users className="h-4 w-4 text-brand-startup-amber" />
            </div>
            <div className="text-2xl font-black tracking-tight text-brand-deep-dark mb-0.5">
              {stakeholders.reduce((sum, s) => sum + s.admins.length, 0)}
            </div>
          </div>
        </Card>

        <Card className="border-2 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 relative overflow-hidden bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
          <div className="flex flex-col relative z-10">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] font-bold uppercase tracking-wider text-brand-deep-dark/60">Pending</span>
              <Shield className="h-4 w-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-black tracking-tight text-brand-deep-dark mb-0.5">
              {stakeholders.filter(s => s.status === 'pending').length}
            </div>
          </div>
        </Card>
      </div>

      {/* Stakeholder Directory Container */}
      <Card className="border-0 rounded-none shadow-none bg-transparent relative z-20">
        <CardHeader className="px-0 sm:px-6 pt-4 pb-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-md group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-mint-teal/60 group-focus-within:text-brand-mint-teal transition-colors" />
              <Input
                className="pl-10 h-10 bg-brand-mint-teal/5 border border-brand-mint-teal/20 rounded-xl font-medium text-brand-deep-dark placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-brand-mint-teal/30 focus-visible:border-brand-mint-teal/40"
                placeholder="Search queries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {/* Filters */}
            <div className="flex items-center gap-2 relative z-30">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[200px] h-10 bg-brand-mint-teal/5 border border-brand-mint-teal/20 rounded-xl font-semibold text-brand-deep-dark text-sm">
                  <SelectValue placeholder="Global Type" />
                </SelectTrigger>
                <SelectContent className="bg-white rounded-xl border border-slate-100 shadow-2xl z-[150]">
                  <SelectItem value="all" className="font-semibold">All Categories</SelectItem>
                  {stakeholderTypes.map(type => (
                    <SelectItem key={type} value={type} className="font-semibold">{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(searchTerm || filterType !== "all") && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => {
                    setSearchTerm("");
                    setFilterType("all");
                  }}
                  className="h-10 w-10 text-slate-400 hover:text-brand-mint-teal hover:bg-brand-mint-teal/5 rounded-xl transition-all"
                  title="Reset Filters"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="px-0 sm:px-6 pt-3 pb-4">
          <div className="rounded-2xl overflow-hidden border border-slate-100 bg-white">
            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-gray-50/50">
                  <Loader2 className="h-6 w-6 animate-spin text-brand-mint-teal mb-2" />
                  <p className="text-sm font-bold text-slate-400">Loading records...</p>
                </div>
              ) : stakeholders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <ShieldAlert className="h-10 w-10 text-slate-300 mb-3" />
                  <p className="text-base font-bold text-slate-500">No organizations found matching your criteria.</p>
                  <p className="text-xs font-semibold text-slate-400">
                    {searchTerm || filterType !== "all" || filterStatus !== "all" 
                      ? "Try adjusting your filters."
                      : "Add your first institutional partner to get started."}
                  </p>
                  {!searchTerm && filterType === "all" && (
                    <Button variant="outline" className="mt-4 font-bold border-brand-mint-teal text-brand-mint-teal hover:bg-brand-mint-teal/10 rounded-xl" onClick={() => setIsCreateDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" /> Add Institution
                    </Button>
                  )}
                </div>
              ) : (
                <Table className="whitespace-nowrap min-w-full">
                  <TableHeader className="bg-brand-mint-teal/[0.06] border-b border-brand-mint-teal/10">
                    <TableRow className="hover:bg-transparent border-0">
                      <TableHead className="font-bold text-[11px] text-brand-deep-dark uppercase tracking-wider h-11 pl-6">Organization Name</TableHead>
                      <TableHead className="font-bold text-[11px] text-brand-deep-dark uppercase tracking-wider h-11">Institution Type</TableHead>
                      <TableHead className="font-bold text-[11px] text-brand-deep-dark uppercase tracking-wider h-11">Region</TableHead>
                      <TableHead className="font-bold text-[11px] text-brand-deep-dark uppercase tracking-wider h-11">Administrators</TableHead>
                      <TableHead className="font-bold text-[11px] text-brand-deep-dark uppercase tracking-wider h-11">Portal Access</TableHead>
                      <TableHead className="font-bold text-[11px] text-brand-deep-dark uppercase tracking-wider h-11">System Status</TableHead>
                      <TableHead className="w-[100px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stakeholders.map((stakeholder) => (
                      <TableRow key={stakeholder.id} className="group hover:bg-slate-50 border-b border-slate-100">
                        <TableCell className="pl-6 py-3">
                          <div className="flex flex-col max-w-[280px]">
                            <p className="font-bold text-brand-deep-dark text-sm truncate">{stakeholder.name}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {stakeholder.website ? (
                                <a href={stakeholder.website} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:text-blue-700 font-semibold truncate flex items-center gap-1">
                                  <Globe className="h-3 w-3" /> {stakeholder.website.replace(/^https?:\/\//, '')}
                                </a>
                              ) : (
                                <p className="text-xs text-slate-400 font-medium truncate">{stakeholder.email}</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-slate-100 text-slate-700 font-bold border-slate-200">
                            {stakeholder.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
                            <MapPin className="h-3.5 w-3.5 text-brand-mint-teal" />
                            {stakeholder.region}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
                            <Users className="h-3.5 w-3.5 text-brand-startup-amber" />
                            {stakeholder.admins.length} <span className="text-xs font-semibold text-slate-400">Users</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Switch
                              checked={stakeholder.portalAccess}
                              onCheckedChange={() => handleTogglePortalAccess(stakeholder.id, stakeholder.portalAccess)}
                              className="scale-90 data-[state=checked]:bg-brand-mint-teal"
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={`${getStatusBadgeColor(stakeholder.status)} font-bold`}
                          >
                            {stakeholder.status === 'inactive' ? 'Suspended' : stakeholder.status.charAt(0).toUpperCase() + stakeholder.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right py-3 pr-6">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-200 rounded-lg">
                                <MoreHorizontal className="h-4 w-4 text-slate-600" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-white rounded-xl border border-slate-100 shadow-2xl z-[155] w-48 font-semibold">
                              <DropdownMenuItem 
                                onClick={() => {
                                  setSelectedStakeholder(stakeholder);
                                  setIsViewDialogOpen(true);
                                }} 
                                className="cursor-pointer focus:bg-brand-mint-teal/5"
                              >
                                <Eye className="h-4 w-4 mr-2 text-brand-mint-teal" />
                                Institutional Overview
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={async () => {
                                  const newStatus = stakeholder.status === 'inactive' ? 'active' : 'inactive';
                                  const res = await updateStakeholderStatus(stakeholder.id, newStatus);
                                  if (res.success) {
                                    toast.success(`Institution ${newStatus === 'inactive' ? 'suspended' : 'activated'}`);
                                    fetchStakeholders();
                                  } else {
                                    toast.error(res.message);
                                  }
                                }} 
                                className={`cursor-pointer ${stakeholder.status === 'inactive' ? 'text-green-600 focus:bg-green-50' : 'text-amber-600 focus:bg-amber-50'}`}
                              >
                                {stakeholder.status === 'inactive' ? (
                                  <><Globe className="h-4 w-4 mr-2" /> Activate Institution</>
                                ) : (
                                  <><ShieldAlert className="h-4 w-4 mr-2" /> Suspend Institution</>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteStakeholder(stakeholder.id, stakeholder.name)}
                                className="text-red-600 cursor-pointer focus:bg-red-50 focus:text-red-700"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove Stakeholder
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CREATE DIALOG */}
      <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
        setIsCreateDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col p-0 bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden">
          <DialogHeader className="shrink-0 border-b border-slate-100 bg-slate-50 px-6 py-5">
            <DialogTitle className="text-xl font-black text-brand-deep-dark">Add New Stakeholder</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-sm font-bold text-slate-700">Organization Name <span className="text-red-500">*</span></Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Ethiopian Investment Holdings"
                  className="rounded-xl border-slate-200 focus:ring-brand-mint-teal"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-sm font-bold text-slate-700">Official Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="contact@organization.gov.et"
                    className="rounded-xl border-slate-200 focus:ring-brand-mint-teal"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone" className="text-sm font-bold text-slate-700">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+251..."
                    className="rounded-xl border-slate-200 focus:ring-brand-mint-teal"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="website" className="text-sm font-bold text-slate-700">Website URL</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://www.organization.gov.et"
                    className="rounded-xl border-slate-200 focus:ring-brand-mint-teal"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="address" className="text-sm font-bold text-slate-700">Physical Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Street, City, Building..."
                    className="rounded-xl border-slate-200 focus:ring-brand-mint-teal"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="type" className="text-sm font-bold text-slate-700">Institution Type <span className="text-red-500">*</span></Label>
                  <Select value={formData.type} onValueChange={(v) => {
                    setIsCustomType(v === "Custom");
                    setFormData({ ...formData, type: v });
                  }}>
                    <SelectTrigger className="rounded-xl border-slate-200"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-white rounded-xl border border-slate-100 shadow-2xl z-[150]">
                      {stakeholderTypes.map(t => <SelectItem key={t} value={t} className="font-semibold">{t}</SelectItem>)}
                      <SelectItem value="Custom" className="font-semibold italic">Other / Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="region" className="text-sm font-bold text-slate-700">Region / Location</Label>
                  <Select value={formData.region} onValueChange={(v) => setFormData({ ...formData, region: v })}>
                    <SelectTrigger className="rounded-xl border-slate-200"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-white rounded-xl border border-slate-100 shadow-2xl z-[150]">
                      {regions.map(r => <SelectItem key={r} value={r} className="font-semibold">{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 mt-2">
                <ShieldAlert className="h-5 w-5 text-brand-startup-amber shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-black text-brand-deep-dark uppercase tracking-wider">Administrative Security Note</p>
                  <p className="text-[11px] font-bold text-slate-600 leading-relaxed">
                    New coordinators invited to this organization will be assigned the system default password: 
                    <span className="text-brand-startup-amber font-black ml-1 select-all hover:underline cursor-help" title="Click to select">StartupET@2025</span>
                  </p>
                </div>
              </div>

              <div className="grid gap-2 text-sm">
                <Label htmlFor="description" className="text-sm font-bold text-slate-700">Organization Mandate / Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the partner's role in the ecosystem..."
                  className="rounded-xl border-slate-200 focus:ring-brand-mint-teal min-h-[100px]"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="shrink-0 border-t border-slate-100 px-6 py-6 gap-3 sm:gap-2">
            <Button variant="ghost" className="h-12 px-8 rounded-xl font-bold text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateStakeholder} disabled={isSubmitting || !formData.name} className="bg-brand-startup-amber hover:bg-brand-startup-amber/90 text-white font-bold h-12 px-10 rounded-xl shadow-lg shadow-brand-startup-amber/20 text-xs transition-all hover:scale-105 active:scale-95">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Verify & Add Stakeholder"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* VIEW DIALOG */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        {selectedStakeholder && (
          <DialogContent className="flex max-h-[90vh] w-[calc(100vw-2rem)] max-w-4xl flex-col p-0 bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden">
            <div className="h-32 bg-brand-deep-dark w-full relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-brand-deep-dark to-slate-800 opacity-90" />
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-4 right-4 text-white/60 hover:text-white hover:bg-white/10 z-20"
                onClick={() => setIsViewDialogOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
              <div className="absolute -bottom-12 left-8 z-10">
                <Avatar className="h-24 w-24 border-[6px] border-white shadow-2xl bg-white">
                  <AvatarFallback className="bg-brand-mint-teal/10 text-brand-mint-teal text-3xl font-black">
                    {selectedStakeholder.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 pt-16">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-3xl font-black text-brand-deep-dark tracking-tight">{selectedStakeholder.name}</h2>
                  <div className="flex items-center gap-3 mt-2">
                    <Badge className="bg-brand-mint-teal/10 text-brand-mint-teal border-brand-mint-teal/20 font-bold">
                      {selectedStakeholder.type}
                    </Badge>
                    <span className="text-sm font-bold text-slate-400">•</span>
                    <span className="text-sm font-bold text-slate-400">Registered {selectedStakeholder.createdAt}</span>
                  </div>
                </div>
                <Badge className={`${getStatusBadgeColor(selectedStakeholder.status)} font-black px-4 py-1.5 rounded-lg border-0 uppercase tracking-widest text-[10px]`}>
                  {selectedStakeholder.status}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-10">
                <div className="p-5 border-2 border-slate-50 rounded-2xl space-y-1.5 bg-slate-50/30">
                  <p className="text-[9px] uppercase font-black text-slate-400 tracking-widest leading-none">Official Site</p>
                  <a href={selectedStakeholder.website} target="_blank" rel="noreferrer" className="text-sm font-bold text-brand-mint-teal hover:underline flex items-center gap-1.5 truncate">
                    {selectedStakeholder.website || "No site linked"} <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
                <div className="p-5 border-2 border-slate-50 rounded-2xl space-y-1.5 bg-slate-50/30">
                  <p className="text-[9px] uppercase font-black text-slate-400 tracking-widest leading-none">Primary Channel</p>
                  <p className="text-sm font-bold text-brand-deep-dark truncate">{selectedStakeholder.email || "No contact info"}</p>
                </div>
                <div className="p-5 border-2 border-slate-50 rounded-2xl space-y-1.5 bg-slate-50/30">
                  <p className="text-[9px] uppercase font-black text-slate-400 tracking-widest leading-none">Operational Base</p>
                  <p className="text-sm font-bold text-brand-deep-dark truncate">{selectedStakeholder.address || selectedStakeholder.region}</p>
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Mandate & Mission Statement</h3>
                  <div className="text-sm font-medium text-slate-600 leading-relaxed bg-brand-mint-teal/[0.03] border border-brand-mint-teal/10 p-5 rounded-2xl">
                    {selectedStakeholder.description || "No official mandate documents on file for this institution."}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Authorized Account Admins</h3>
                    <Button 
                      size="sm" 
                      className="h-9 px-5 bg-brand-mint-teal hover:bg-brand-mint-teal/90 text-white font-bold rounded-xl shadow-lg shadow-brand-mint-teal/10 transition-all hover:scale-105 active:scale-95" 
                      onClick={() => setIsAddAdminDialogOpen(true)}
                    >
                      <UserPlus className="h-4 w-4 mr-2" /> Invite Coordinator
                    </Button>
                  </div>
                  
                  <div className="rounded-2xl border border-slate-100 overflow-hidden bg-white shadow-sm">
                    <Table>
                      <TableHeader className="bg-slate-50/50">
                        <TableRow className="hover:bg-transparent border-slate-100">
                          <TableHead className="font-bold text-[10px] text-slate-500 uppercase tracking-[0.15em] h-11 pl-6">Representative</TableHead>
                          <TableHead className="font-bold text-[10px] text-slate-500 uppercase tracking-[0.15em] h-11">Official Designation</TableHead>
                          <TableHead className="w-[80px] h-11 pr-6 text-right font-bold text-[10px] text-slate-500 uppercase tracking-[0.15em]">Control</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedStakeholder.admins.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={3} className="py-12 text-center">
                              <div className="flex flex-col items-center gap-2">
                                <Users className="h-10 w-10 text-slate-200" />
                                <p className="text-sm font-bold text-slate-400 italic">No administrative identities linked to this node.</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          selectedStakeholder.admins.map(admin => (
                            <tr key={admin.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                              <td className="pl-6 py-4">
                                <div className="font-bold text-brand-deep-dark text-sm">{admin.name}</div>
                                <div className="text-xs font-semibold text-slate-400">{admin.email}</div>
                              </td>
                              <td className="py-4">
                                <Badge className="bg-slate-100 text-slate-600 font-bold border-slate-200 px-3 py-0.5 rounded-full text-[10px]">
                                  {admin.role}
                                </Badge>
                              </td>
                              <td className="pr-6 py-4 text-right flex items-center justify-end gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-slate-300 hover:text-brand-startup-amber hover:bg-brand-startup-amber/5 rounded-lg transition-colors" 
                                  onClick={() => {
                                    setSelectedAdmin(admin);
                                    setIsResetPasswordDialogOpen(true);
                                  }}
                                  title="Reset Password"
                                >
                                  <Key className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" onClick={() => handleRemoveAdmin(admin.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter className="p-6 bg-slate-50 border-t border-slate-100 gap-3">
              <Button variant="ghost" className="h-12 px-8 rounded-xl font-bold text-xs text-slate-500 hover:text-slate-800" onClick={() => setIsViewDialogOpen(false)}>Close Oversight</Button>
              <Button onClick={() => {
                setIsViewDialogOpen(false);
                handleEditStakeholder(selectedStakeholder);
              }} className="bg-brand-startup-amber hover:bg-brand-startup-amber/90 text-white font-bold h-12 px-10 rounded-xl shadow-lg shadow-brand-startup-amber/20 text-xs transition-all hover:scale-105 active:scale-95">Update Settings</Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* EDIT DIALOG */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col p-0 bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden">
          <DialogHeader className="shrink-0 border-b border-slate-100 bg-slate-50 px-6 py-5">
            <DialogTitle className="text-xl font-black text-brand-deep-dark flex items-center gap-3">
              <Edit className="h-6 w-6 text-brand-startup-amber" /> 
              Stakeholder Configuration
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="edit-name" className="text-sm font-bold text-slate-700">Organization Name <span className="text-red-500">*</span></Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="rounded-xl border-slate-200 focus:ring-brand-mint-teal"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-email" className="text-sm font-bold text-slate-700">Official Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="rounded-xl border-slate-200 focus:ring-brand-mint-teal"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-phone" className="text-sm font-bold text-slate-700">Phone</Label>
                  <Input
                    id="edit-phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="rounded-xl border-slate-200 focus:ring-brand-mint-teal"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-website" className="text-sm font-bold text-slate-700">Website URL</Label>
                  <Input
                    id="edit-website"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="rounded-xl border-slate-200 focus:ring-brand-mint-teal"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-address" className="text-sm font-bold text-slate-700">Physical Address</Label>
                  <Input
                    id="edit-address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="rounded-xl border-slate-200 focus:ring-brand-mint-teal"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-type" className="text-sm font-bold text-slate-700">Institution Type</Label>
                  <Select value={formData.type} onValueChange={(v) => {
                    setIsCustomType(v === "Custom");
                    setFormData({ ...formData, type: v });
                  }}>
                    <SelectTrigger className="rounded-xl border-slate-200"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-white rounded-xl border border-slate-100 shadow-2xl z-[150]">
                      {stakeholderTypes.map(t => <SelectItem key={t} value={t} className="font-semibold">{t}</SelectItem>)}
                      <SelectItem value="Custom" className="font-semibold italic">Other / Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-region" className="text-sm font-bold text-slate-700">Region</Label>
                  <Select value={formData.region} onValueChange={(v) => setFormData({ ...formData, region: v })}>
                    <SelectTrigger className="rounded-xl border-slate-200"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-white rounded-xl border border-slate-100 shadow-2xl z-[150]">
                      {regions.map(r => <SelectItem key={r} value={r} className="font-semibold">{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description" className="text-sm font-bold text-slate-700">Official Mission & Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="rounded-xl border-slate-200 focus:ring-brand-mint-teal min-h-[100px]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-email" className="text-sm font-bold text-slate-700">Official Contact Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input id="edit-email" className="pl-10 rounded-xl border-slate-200 focus:ring-brand-mint-teal" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-website" className="text-sm font-bold text-slate-700">Website URL</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input id="edit-website" className="pl-10 rounded-xl border-slate-200 focus:ring-brand-mint-teal" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-status" className="text-sm font-bold text-slate-700">Registration Status</Label>
                  <Select value={formData.status} onValueChange={(v: any) => setFormData({ ...formData, status: v })}>
                    <SelectTrigger className="rounded-xl border-slate-200"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-white rounded-xl border border-slate-100 shadow-2xl z-[150]">
                      <SelectItem value="active" className="font-semibold text-green-600">Verified & Active</SelectItem>
                      <SelectItem value="inactive" className="font-semibold text-slate-500">Temporarily Inactive</SelectItem>
                      <SelectItem value="pending" className="font-semibold text-amber-600">Awaiting External Validation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between p-4 border-2 border-slate-50 rounded-2xl mt-7 bg-slate-50/30">
                  <Label className="text-sm font-bold text-slate-700 cursor-pointer" htmlFor="edit-portal">Stakeholder Hub</Label>
                  <Switch
                    id="edit-portal"
                    checked={formData.portalAccess}
                    onCheckedChange={(checked) => setFormData({ ...formData, portalAccess: checked })}
                    className="data-[state=checked]:bg-brand-mint-teal"
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="shrink-0 border-t border-slate-100 px-6 py-6 gap-3 sm:gap-2">
            <Button variant="ghost" className="h-12 px-8 rounded-xl font-bold text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100" onClick={() => setIsEditDialogOpen(false)}>Discard Changes</Button>
            <Button onClick={handleUpdateStakeholder} disabled={isSubmitting} className="bg-brand-startup-amber hover:bg-brand-startup-amber/90 text-white font-bold h-12 px-10 rounded-xl shadow-lg shadow-brand-startup-amber/20 text-xs transition-all hover:scale-105 active:scale-95">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Authorize & Update Record"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ADD ADMIN DIALOG */}
      <Dialog open={isAddAdminDialogOpen} onOpenChange={setIsAddAdminDialogOpen}>
        <DialogContent className="flex max-h-[90vh] max-w-lg flex-col p-0 bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden">
          <DialogHeader className="shrink-0 border-b border-slate-100 bg-slate-50 px-6 py-5">
            <DialogTitle className="text-xl font-black text-brand-deep-dark flex items-center gap-3">
              <UserPlus className="h-6 w-6 text-brand-mint-teal" /> 
              Authorize Coordinator
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <p className="text-slate-500 font-medium text-xs mb-6 px-1 italic">Identify a platform account to manage operations for this Stakeholder. If the user doesn't exist, a new account will be created.</p>
            <div className="grid gap-5">
              <div className="grid gap-2">
                <Label htmlFor="admin-name" className="text-sm font-bold text-slate-700">Full Name</Label>
                <Input 
                  id="admin-name" 
                  placeholder="Abebe Bikila"
                  value={adminFormData.name}
                  onChange={(e) => setAdminFormData({ ...adminFormData, name: e.target.value })}
                  className="rounded-xl border-slate-200 focus:ring-brand-mint-teal"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="admin-email" className="text-sm font-bold text-slate-700">User Email Address <span className="text-red-500">*</span></Label>
                <Input 
                  id="admin-email" 
                  type="email" 
                  placeholder="name@organization.gov.et"
                  value={adminFormData.email}
                  onChange={(e) => setAdminFormData({ ...adminFormData, email: e.target.value })}
                  className="rounded-xl border-slate-200 focus:ring-brand-mint-teal"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="admin-password" className="text-sm font-bold text-slate-700">Initial Password <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Input 
                    id="admin-password" 
                    type={adminFormData.showPassword ? "text" : "password"} 
                    placeholder="Set a default password"
                    value={adminFormData.password}
                    readOnly
                    className="rounded-xl border-slate-200 bg-slate-50 font-mono"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-slate-400 hover:text-slate-600"
                    onClick={() => setAdminFormData({ ...adminFormData, showPassword: !adminFormData.showPassword })}
                  >
                    {adminFormData.showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="admin-role" className="text-sm font-bold text-slate-700">Official Position / Title</Label>
                <Input 
                  id="admin-role" 
                  placeholder="e.g., Director of Innovations" 
                  value={adminFormData.role}
                  onChange={(e) => setAdminFormData({ ...adminFormData, role: e.target.value })}
                  className="rounded-xl border-slate-200 focus:ring-brand-mint-teal"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="shrink-0 border-t border-slate-100 px-6 py-6 gap-3 sm:gap-2">
            <Button variant="ghost" className="h-12 px-8 rounded-xl font-bold text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100" onClick={() => setIsAddAdminDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddAdmin} disabled={isSubmitting || !adminFormData.email || !adminFormData.password} className="bg-brand-mint-teal hover:bg-brand-mint-teal/90 text-white font-bold h-12 px-10 rounded-xl shadow-lg shadow-brand-mint-teal/20 text-xs transition-all hover:scale-105 active:scale-95">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Link Identity"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* RESET PASSWORD DIALOG */}
      <Dialog open={isResetPasswordDialogOpen} onOpenChange={setIsResetPasswordDialogOpen}>
        <DialogContent className="flex max-h-[90vh] max-w-md flex-col p-0 bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden">
          <DialogHeader className="shrink-0 border-b border-slate-100 bg-slate-50 px-6 py-5">
            <DialogTitle className="text-xl font-black text-brand-deep-dark flex items-center gap-3">
              <Key className="h-6 w-6 text-brand-startup-amber" /> 
              Reset Coordinator Password
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <p className="text-slate-500 font-medium text-xs mb-6 px-1 italic font-bold">Reseting password for {selectedAdmin?.name} ({selectedAdmin?.email})</p>
            <div className="grid gap-5">
              <div className="grid gap-2">
                <Label htmlFor="reset-password" className="text-sm font-bold text-slate-700">New Password <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Input 
                    id="reset-password" 
                    type={resetPasswordData.showPassword ? "text" : "password"} 
                    placeholder="Enter new secure password"
                    value={resetPasswordData.password}
                    onChange={(e) => setResetPasswordData({ ...resetPasswordData, password: e.target.value })}
                    className="rounded-xl border-slate-200 focus:ring-brand-mint-teal pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-slate-400 hover:text-slate-600"
                    onClick={() => setResetPasswordData({ ...resetPasswordData, showPassword: !resetPasswordData.showPassword })}
                  >
                    {resetPasswordData.showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="shrink-0 border-t border-slate-100 px-6 py-6 gap-3 sm:gap-2">
            <Button variant="ghost" className="h-12 px-8 rounded-xl font-bold text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100" onClick={() => setIsResetPasswordDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleResetPassword} disabled={isSubmitting || !resetPasswordData.password} className="bg-brand-startup-amber hover:bg-brand-startup-amber/90 text-white font-bold h-12 px-10 rounded-xl shadow-lg shadow-brand-startup-amber/20 text-xs transition-all hover:scale-105 active:scale-95">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Reset Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
