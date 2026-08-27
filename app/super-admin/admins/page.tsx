"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Building2,
  Plus,
  Search,
  Edit,
  Trash2,
  Shield,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Users,
  AlertTriangle,
  Ban
} from "lucide-react";
import { getAdmins, updateAdminRole, deleteAdmin as deleteAdminAction, createAdmin, suspendAdmin } from "./admin-actions";
import { toast } from "sonner";

interface Admin {
  id: string;
  name: string;
  email: string;
  role: "admin" | "reviewer";
  isReviewManager: boolean;
  department: string;
  responsibilities: string[];
  status: "active" | "inactive";
  assignedTasks: number;
  completedTasks: number;
  joinedDate: string;
}

export default function AdminManagementPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSuspendDialogOpen, setIsSuspendDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "reviewer" as Admin['role'],
    isReviewManager: false,
    department: "",
    responsibilities: [] as string[],
    status: "active" as Admin['status']
  });

  const availableResponsibilities = [
    "Review Applications",
    "Approve Certifications",
    "Manage Users",
    "Review Certifications",
    "Assess Applications",
    "Oversee Operations",
    "Generate Reports",
    "Monitor Performance",
    "Verify Documents",
    "Process Payments"
  ];

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdmins({
        search: searchTerm,
        role: filterRole,
        page: currentPage,
        pageSize: pageSize,
      });
      if (res.success) {
        setAdmins(res.data as Admin[]);
        if (res.pagination) {
          setTotalPages(res.pagination.totalPages);
          setTotalCount(res.pagination.totalCount);
        }
      } else {
        toast.error(res.message || "Failed to fetch admins");
      }
    } catch (error) {
      toast.error("Failed to load admins");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterRole, currentPage, pageSize]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateAdmin = async () => {
    setLoading(true);
    try {
      const res = await createAdmin({
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role,
        isReviewManager: formData.isReviewManager,
        responsibilities: formData.responsibilities
      });
      if (res.success) {
        toast.success(res.message || "Admin created successfully");
        fetchData();
        setIsCreateDialogOpen(false);
        setFormData({ firstName: "", lastName: "", email: "", role: "reviewer", isReviewManager: false, department: "", responsibilities: [], status: "active" });
      } else {
        toast.error(res.message || "Failed to create admin");
      }
    } catch (error) {
      toast.error("An error occurred during creation");
    } finally {
      setLoading(false);
    }
  };

  const handleEditAdmin = (admin: Admin) => {
    setSelectedAdmin(admin);
    setFormData({
      firstName: admin.name.split(' ')[0],
      lastName: admin.name.split(' ').slice(1).join(' '),
      email: admin.email,
      role: admin.role,
      isReviewManager: admin.isReviewManager,
      department: admin.department,
      responsibilities: admin.responsibilities,
      status: admin.status
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateAdmin = async () => {
    if (selectedAdmin) {
      setLoading(true);
      try {
        const res = await updateAdminRole(selectedAdmin.id, formData.role, formData.isReviewManager, formData.responsibilities);
        if (res.success) {
          toast.success("Admin role updated successfully");
          fetchData();
          setIsEditDialogOpen(false);
        } else {
          toast.error(res.message || "Failed to update admin");
        }
      } catch (error) {
        toast.error("An error occurred");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteAdmin = (admin: Admin) => {
    setSelectedAdmin(admin);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteAdmin = async () => {
    if (selectedAdmin) {
      setLoading(true);
      try {
        const res = await deleteAdminAction(selectedAdmin.id);
        if (res.success) {
          toast.success("Admin removed successfully");
          fetchData();
          setIsDeleteDialogOpen(false);
        } else {
          toast.error(res.message || "Failed to remove admin");
        }
      } catch (error) {
        toast.error("Failed to remove admin");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSuspendAdmin = (admin: Admin) => {
    setSelectedAdmin(admin);
    setIsSuspendDialogOpen(true);
  };

  const confirmSuspendAdmin = async () => {
    if (selectedAdmin) {
      setLoading(true);
      try {
        const newStatus = selectedAdmin.status === "active"; // active -> going to suspend
        const res = await suspendAdmin(selectedAdmin.id, newStatus);
        if (res.success) {
          toast.success(`Admin ${newStatus ? 'suspended' : 'activated'} successfully`);
          fetchData();
          setIsSuspendDialogOpen(false);
        } else {
          toast.error(res.message || "Failed to update admin status");
        }
      } catch (error) {
        toast.error("Failed to process suspend action");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleToggleResponsibility = (responsibility: string) => {
    setFormData({
      ...formData,
      responsibilities: formData.responsibilities.includes(responsibility)
        ? formData.responsibilities.filter(r => r !== responsibility)
        : [...formData.responsibilities, responsibility]
    });
  };

  const getRoleBadgeColor = (role: Admin['role']) => {
    switch (role) {
      case 'admin': return 'bg-blue-100 text-blue-800';
      case 'reviewer': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status: Admin['status']) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  const filteredAdmins = admins; // Filtering moved to server side

  const getCompletionRate = (admin: Admin) => {
    if (admin.assignedTasks === 0) return 0;
    return Math.round((admin.completedTasks / admin.assignedTasks) * 100);
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-brand-deep-dark">Admin Management</h1>
        </div>
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-brand-startup-amber hover:bg-brand-startup-amber/90 text-white font-bold h-10 px-6 rounded-xl shadow-lg shadow-brand-startup-amber/20 transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Node Admin
        </Button>
      </div>

      {/* Discovery Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-2 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 relative overflow-hidden bg-gradient-to-br from-brand-deep-dark to-slate-900 border-brand-deep-dark">
          <div className="flex flex-col relative z-10">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] font-bold uppercase tracking-wider text-white/60">Total Admins</span>
              <Shield className="h-4 w-4 text-brand-startup-amber" />
            </div>
            <div className="text-2xl font-black tracking-tight text-white mb-0.5">
              {admins.length}
            </div>
          </div>
        </Card>

        <Card className="border-2 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 relative overflow-hidden bg-gradient-to-br from-brand-mint-teal/5 to-brand-mint-teal/20 border-brand-mint-teal/20">
          <div className="flex flex-col relative z-10">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] font-bold uppercase tracking-wider text-brand-deep-dark/60">Active Status</span>
              <CheckCircle className="h-4 w-4 text-brand-mint-teal" />
            </div>
            <div className="text-2xl font-black tracking-tight text-brand-deep-dark mb-0.5">
              {admins.filter(a => a.status === 'active').length}
            </div>
          </div>
        </Card>

        <Card className="border-2 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 relative overflow-hidden bg-gradient-to-br from-brand-startup-amber/5 to-brand-startup-amber/20 border-brand-startup-amber/20">
          <div className="flex flex-col relative z-10">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] font-bold uppercase tracking-wider text-brand-deep-dark/60">Pending Action</span>
              <Clock className="h-4 w-4 text-brand-startup-amber" />
            </div>
            <div className="text-2xl font-black tracking-tight text-brand-deep-dark mb-0.5">
              {admins.reduce((sum, a) => sum + a.assignedTasks, 0)}
            </div>
          </div>
        </Card>

        <Card className="border-2 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 relative overflow-hidden bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
          <div className="flex flex-col relative z-10">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] font-bold uppercase tracking-wider text-brand-deep-dark/60">Execution</span>
              <CheckCircle className="h-4 w-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-black tracking-tight text-brand-deep-dark mb-0.5">
              {admins.reduce((sum, a) => sum + a.completedTasks, 0)}
            </div>
          </div>
        </Card>
      </div>

      {/* Discovery Terminal */}
      <Card className="border-0 rounded-none shadow-none bg-transparent relative z-20">
        <CardHeader className="px-6 pt-4 pb-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-md group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-mint-teal/60 group-focus-within:text-brand-mint-teal transition-colors" />
              <Input
                className="pl-10 h-10 bg-brand-mint-teal/5 border border-brand-mint-teal/20 rounded-xl font-medium text-brand-deep-dark placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-brand-mint-teal/30 focus-visible:border-brand-mint-teal/40"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            {/* Filters */}
            <div className="flex items-center gap-2 relative z-30">
              <Select
                value={filterRole}
                onValueChange={(val) => {
                  setFilterRole(val);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[180px] h-10 bg-brand-mint-teal/5 border border-brand-mint-teal/20 rounded-xl font-semibold text-brand-deep-dark text-sm">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent className="bg-white rounded-xl border border-slate-100 shadow-2xl z-[150]">
                  <SelectItem value="all" className="font-semibold">All Roles</SelectItem>
                  <SelectItem value="admin" className="font-semibold">Node Admin</SelectItem>
                  <SelectItem value="reviewer" className="font-semibold">Reviewer</SelectItem>
                  <SelectItem value="review_manager" className="font-semibold">Review Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-6 pt-3 pb-4">
          <div className="rounded-2xl overflow-hidden border border-slate-100 bg-white">
            <div className="overflow-x-auto">
              <Table className="whitespace-nowrap min-w-full">
                <TableHeader className="bg-brand-mint-teal/[0.06] border-b border-brand-mint-teal/10">
                  <TableRow className="hover:bg-transparent border-0">
                    <TableHead className="font-bold text-[11px] text-brand-deep-dark uppercase tracking-wider h-11 pl-6">Core Identity</TableHead>
                    <TableHead className="font-bold text-[11px] text-brand-deep-dark uppercase tracking-wider h-11">Access Level</TableHead>
                    <TableHead className="font-bold text-[11px] text-brand-deep-dark uppercase tracking-wider h-11">Department</TableHead>
                    <TableHead className="font-bold text-[11px] text-brand-deep-dark uppercase tracking-wider h-11">Capacity</TableHead>
                    <TableHead className="font-bold text-[11px] text-brand-deep-dark uppercase tracking-wider h-11">Execution</TableHead>
                    <TableHead className="font-bold text-[11px] text-brand-deep-dark uppercase tracking-wider h-11">Status</TableHead>
                    <TableHead className="font-bold text-[11px] text-brand-deep-dark uppercase tracking-wider h-11 text-right pr-6">Directives</TableHead>
                  </TableRow>
                </TableHeader>
            <TableBody>
              {loading && admins.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-purple-600 mb-2" />
                    <p className="text-muted-foreground italic">Loading administrators...</p>
                  </TableCell>
                </TableRow>
              ) : filteredAdmins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{admin.name}</p>
                      <p className="text-sm text-muted-foreground">{admin.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Badge className={getRoleBadgeColor(admin.role)}>
                        {admin.role === 'admin' ? 'Node Admin' : 'Review'}
                      </Badge>
                      {admin.isReviewManager && (
                        <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                          Review Manager
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{admin.department}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <span className="font-medium">{admin.completedTasks}</span>
                      <span className="text-muted-foreground"> / {admin.assignedTasks}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${getCompletionRate(admin)}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {getCompletionRate(admin)}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeColor(admin.status)}>
                      {admin.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="ghost" onClick={() => handleEditAdmin(admin)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleSuspendAdmin(admin)}>
                        <Ban className={`h-4 w-4 ${admin.status === 'active' ? 'text-amber-500' : 'text-slate-400'}`} />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteAdmin(admin)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!loading && filteredAdmins.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    <p className="text-muted-foreground">No administrators found.</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4 px-4">
             <div className="text-[11px] font-bold text-slate-400">
                Admins {((currentPage - 1) * pageSize) + 1}—{Math.min(currentPage * pageSize, totalCount)} of {totalCount}
             </div>
             <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1 || loading}
                  className="rounded-xl font-bold text-[10px] border-none bg-slate-50 hover:bg-slate-100 px-4 h-9"
                >
                   <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                </Button>
                <div className="bg-brand-mint-teal/10 px-4 h-9 flex items-center rounded-xl text-[11px] font-bold text-brand-mint-teal">
                  Page {currentPage} of {totalPages}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || loading}
                  className="rounded-xl font-bold text-[10px] border-none bg-slate-50 hover:bg-slate-100 px-4 h-9"
                >
                   Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
             </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Admin Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden">
          <DialogHeader className="p-6 pb-2 border-b border-slate-100 bg-slate-50">
            <DialogTitle>Add New Admin</DialogTitle>
            <DialogDescription>
              Create a new administrator account
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="firstName">First Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="Abebe"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lastName">Last Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Kebede"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@startupet.et"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="role">Role <span className="text-red-500">*</span></Label>
                  <Select value={formData.role} onValueChange={(value: Admin['role']) => setFormData({ ...formData, role: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white rounded-xl border border-slate-100 shadow-2xl z-[150]">
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="reviewer">Review</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg bg-slate-50">
                <div className="space-y-0.5">
                  <Label className="text-base">Review Manager</Label>
                  <p className="text-sm text-muted-foreground">
                    Grant permission to manage the review process and committees.
                  </p>
                </div>
                <Switch
                  checked={formData.isReviewManager}
                  onCheckedChange={(checked) => setFormData({ ...formData, isReviewManager: checked })}
                />
              </div>

              <div className="grid gap-2">
                <Label>Responsibilities</Label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border rounded-md">
                  {availableResponsibilities.map((resp) => (
                    <div key={resp} className="flex items-center space-x-2">
                      <Checkbox
                        id={`add-${resp}`}
                        checked={formData.responsibilities.includes(resp)}
                        onCheckedChange={() => handleToggleResponsibility(resp)}
                      />
                      <label
                        htmlFor={`add-${resp}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {resp}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex gap-3">
                <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0" />
                <div className="text-sm text-amber-800">
                  <p className="font-semibold mb-1">Temporary Password</p>
                  <p>New admins will be assigned the temporary password: <code className="bg-amber-100 px-1 rounded font-bold">ChangeMe123!</code>. They should update it upon first login.</p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="p-6 border-t border-slate-100 gap-3">
            <Button variant="ghost" className="h-12 px-8 rounded-xl font-bold text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleCreateAdmin} 
              disabled={!formData.firstName || !formData.lastName || !formData.email || loading}
              className="bg-brand-startup-amber hover:bg-brand-startup-amber/90 text-white font-bold h-12 px-10 rounded-xl shadow-lg shadow-brand-startup-amber/20 text-xs transition-all hover:scale-105 active:scale-95"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Create Admin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Admin Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden">
          <DialogHeader className="p-6 pb-2 border-b border-slate-100 bg-slate-50">
            <DialogTitle>Edit Admin</DialogTitle>
            <DialogDescription>
              Update administrator information
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-firstName">First Name</Label>
                  <Input
                    id="edit-firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-lastName">Last Name</Label>
                  <Input
                    id="edit-lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-role">Role</Label>
                  <Select value={formData.role} onValueChange={(value: Admin['role']) => setFormData({ ...formData, role: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white rounded-xl border border-slate-100 shadow-2xl z-[150]">
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="reviewer">Review</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select value={formData.status} onValueChange={(value: Admin['status']) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white rounded-xl border border-slate-100 shadow-2xl z-[150]">
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg bg-slate-50">
                <div className="space-y-0.5">
                  <Label className="text-base">Review Manager</Label>
                  <p className="text-sm text-muted-foreground">
                    Grant permission to manage the review process and committees.
                  </p>
                </div>
                <Switch 
                  checked={formData.isReviewManager} 
                  onCheckedChange={(checked) => setFormData({ ...formData, isReviewManager: checked })} 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-department">Department</Label>
                <Input
                  id="edit-department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Responsibilities</Label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border rounded-md">
                  {availableResponsibilities.map((resp) => (
                    <div key={resp} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-${resp}`}
                        checked={formData.responsibilities.includes(resp)}
                        onCheckedChange={() => handleToggleResponsibility(resp)}
                      />
                      <label
                        htmlFor={`edit-${resp}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {resp}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="p-6 border-t border-slate-100 gap-3">
            <Button variant="ghost" className="h-12 px-8 rounded-xl font-bold text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleUpdateAdmin}
              disabled={loading}
              className="bg-brand-startup-amber hover:bg-brand-startup-amber/90 text-white font-bold h-12 px-10 rounded-xl shadow-lg shadow-brand-startup-amber/20 text-xs transition-all hover:scale-105 active:scale-95"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl p-6">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-black text-brand-deep-dark flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-500" /> Confirm Removal
            </DialogTitle>
            <DialogDescription className="text-sm font-semibold text-slate-500 pt-2">
              Are you sure you want to remove <span className="font-bold text-brand-deep-dark px-1">{selectedAdmin?.name}</span>?
              This action will revoke their administrative access immediately.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 sm:justify-start w-full">
            <Button
              variant="ghost"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={loading}
              className="flex-1 h-11 rounded-xl font-bold text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDeleteAdmin}
              disabled={loading}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold h-11 rounded-xl shadow-lg shadow-red-500/20 text-xs transition-all hover:scale-105 active:scale-95"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Remove Admin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend Confirmation Dialog */}
      <Dialog open={isSuspendDialogOpen} onOpenChange={setIsSuspendDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl p-6">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-black text-brand-deep-dark flex items-center gap-2">
              <Ban className={`h-5 w-5 ${selectedAdmin?.status === 'active' ? 'text-amber-500' : 'text-green-500'}`} /> 
              Confirm {selectedAdmin?.status === 'active' ? 'Suspension' : 'Activation'}
            </DialogTitle>
            <DialogDescription className="text-sm font-semibold text-slate-500 pt-2">
              Are you sure you want to {selectedAdmin?.status === 'active' ? 'suspend' : 'activate'} <span className="font-bold text-brand-deep-dark px-1">{selectedAdmin?.name}</span>?
              {selectedAdmin?.status === 'active' ? ' They will temporarily lose access to the system.' : ' Their access will be restored.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 sm:justify-start w-full">
            <Button
              variant="ghost"
              onClick={() => setIsSuspendDialogOpen(false)}
              disabled={loading}
              className="flex-1 h-11 rounded-xl font-bold text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmSuspendAdmin}
              disabled={loading}
              className={`flex-1 text-white font-bold h-11 rounded-xl shadow-lg text-xs transition-all hover:scale-105 active:scale-95 ${
                selectedAdmin?.status === 'active' 
                ? 'bg-brand-startup-amber hover:bg-brand-startup-amber/90 shadow-brand-startup-amber/20' 
                : 'bg-brand-mint-teal hover:bg-brand-mint-teal/90 shadow-brand-mint-teal/20'
              }`}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {selectedAdmin?.status === 'active' ? 'Suspend Admin' : 'Activate Admin'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
