"use client";

import { useState, useEffect } from "react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Shield,
  Mail,
  Phone,
  Building2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  ShieldOff,
  ShieldCheck
} from "lucide-react";
import { toast } from "sonner";
import { UserRole } from "@prisma/client";
import { cn } from "@/lib/utils";
import { 
  getUsers, 
  deleteUser, 
  restoreUser, 
  createUser, 
  updateUser, 
  toggleUserSuspension,
} from "./actions";

export default function UserManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const [stats, setStats] = useState({
    total: 0,
    adminCount: 0,
    reviewerCount: 0,
    verifiedCount: 0
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"delete" | "suspend" | null>(null);
  const [userToConfirm, setUserToConfirm] = useState<any>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "USER" as UserRole,
    organization: "",
  });

  useEffect(() => {
    fetchUsers();
  }, [currentPage, pageSize, searchTerm, filterRole, statusFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const result = await getUsers(currentPage, pageSize, searchTerm, filterRole, statusFilter);
      if (result.success) {
        setUsers(result.data || []);
        if (result.stats) setStats(result.stats);
        if (result.pagination) {
          setTotalPages(result.pagination.totalPages);
          setTotalItems(result.pagination.total);
        }
      } else {
        toast.error(result.message || "Failed to fetch users");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email) {
       toast.error("Please fill in all required fields");
       return;
    }
    setIsSaving(true);
    try {
      const res = await createUser({
        email: formData.email.trim(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        role: formData.role,
        phoneNumber: formData.phone.trim(),
      });
      if (res.success) {
        toast.success("User created successfully");
        setIsCreateDialogOpen(false);
        setFormData({ firstName: "", lastName: "", email: "", phone: "", role: "USER", organization: "" });
        fetchUsers();
      } else {
        toast.error(res.message || "Failed to create user");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phoneNumber || "",
      role: user.role as UserRole,
      organization: "", // Not directly in the new schema but kept for UI structure
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    setIsSaving(true);
    try {
      const res = await updateUser(selectedUser.id, {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        role: formData.role,
        phoneNumber: formData.phone.trim(),
      });
      if (res.success) {
        toast.success("User updated successfully");
        setIsEditDialogOpen(false);
        setUsers(users.map(u => 
          u.id === selectedUser.id ? { 
            ...u, 
            firstName: formData.firstName.trim(), 
            lastName: formData.lastName.trim(), 
            role: formData.role, 
            phoneNumber: formData.phone.trim() 
          } : u
        ));
      } else {
        toast.error(res.message || "Failed to update user");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const triggerDeleteUser = (user: any) => {
    setUserToConfirm(user);
    setConfirmAction("delete");
    setIsConfirmDialogOpen(true);
  };

  const triggerToggleSuspension = (user: any) => {
    setUserToConfirm(user);
    setConfirmAction("suspend");
    setIsConfirmDialogOpen(true);
  };

  const executeConfirmAction = async () => {
    if (!userToConfirm || !confirmAction) return;
    setIsConfirming(true);
    try {
      if (confirmAction === "delete") {
        const res = await deleteUser(userToConfirm.id);
        if (res.success) {
          toast.success(res.message || "User archived");
          setUsers(users.filter(u => u.id !== userToConfirm.id));
          setTotalItems(prev => Math.max(0, prev - 1));
          setIsConfirmDialogOpen(false);
        } else {
          toast.error(res.message || "Failed to archive user");
        }
      } else if (confirmAction === "suspend") {
        const actionLabel = userToConfirm.isSuspended ? "unsuspend" : "suspend";
        const res = await toggleUserSuspension(userToConfirm.id, userToConfirm.isSuspended);
        if (res.success) {
          toast.success(res.message || `User ${actionLabel}ed`);
          setUsers(users.map(u => 
            u.id === userToConfirm.id ? { ...u, isSuspended: !u.isSuspended } : u
          ));
          setIsConfirmDialogOpen(false);
        } else {
          toast.error(res.message || `Failed to ${actionLabel} user`);
        }
      }
    } finally {
      setIsConfirming(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':      return 'bg-brand-deep-dark text-white';
      case 'ADMIN':            return 'bg-brand-mint-teal/20 text-brand-mint-teal border border-brand-mint-teal/30';
      case 'REVIEWER':         return 'bg-indigo-100 text-indigo-700 border border-indigo-200';
      case 'COMMITTEE':        return 'bg-brand-startup-amber/15 text-brand-startup-amber border border-brand-startup-amber/30';
      case 'ECOSYSTEM_BUILDER':return 'bg-violet-100 text-violet-700 border border-violet-200';
      case 'USER':             return 'bg-brand-startup-amber/15 text-brand-startup-amber border border-brand-startup-amber/40';
      default:                 return 'bg-slate-100 text-slate-500 border border-slate-200';
    }
  };

  const formatRole = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':       return 'Super Admin';
      case 'ADMIN':             return 'Admin';
      case 'REVIEWER':          return 'Reviewer';
      case 'COMMITTEE':         return 'Committee';
      case 'ECOSYSTEM_BUILDER': return 'Ecosystem Builder';
      case 'USER':              return 'Startup';
      default:                  return role.replace(/_/g, ' ');
    }
  };

  const getStatusBadgeColor = (user: any) => {
    if (user.isSuspended) return 'bg-red-100 text-red-800';
    if (user.emailVerified) return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6 w-full pt-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-brand-deep-dark">
            User <span className="text-brand-mint-teal">Management</span>
          </h1>
        </div>
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-brand-mint-teal hover:bg-brand-mint-teal/90 text-white font-bold h-10 px-6 rounded-xl shadow-lg shadow-brand-mint-teal/20 text-sm transition-all hover:scale-105 active:scale-95 group"
        >
          <Plus className="mr-1.5 h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
          Add User
        </Button>
      </div>

      {/* Minimized KPI Section */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 px-2">
        <Card className="bg-gradient-to-br from-brand-mint-teal/5 to-brand-mint-teal/20 border-2 border-brand-mint-teal/20 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden">
          <div className="flex items-center gap-4 relative z-10">
             <div className="h-12 w-12 rounded-xl bg-brand-mint-teal flex items-center justify-center shadow-lg shadow-brand-mint-teal/20 shrink-0">
               <Users className="h-6 w-6 text-white" />
             </div>
             <div className="flex flex-col">
               <span className="text-[10px] font-bold text-brand-deep-dark opacity-60 leading-none">Total Population</span>
               <div className="text-2xl font-bold text-brand-deep-dark tracking-tight leading-7 mt-0.5">{loading ? "..." : totalItems}</div>
               <p className="text-[9px] font-bold text-brand-mint-teal italic leading-none mt-0.5">Aggregate Nodes</p>
             </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-brand-startup-amber/5 to-brand-startup-amber/20 border-2 border-brand-startup-amber/20 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden">
          <div className="flex items-center gap-4 relative z-10">
             <div className="h-12 w-12 rounded-xl bg-brand-startup-amber flex items-center justify-center shadow-lg shadow-brand-startup-amber/20 shrink-0">
               <Users className="h-6 w-6 text-white" />
             </div>
             <div className="flex flex-col">
               <span className="text-[10px] font-bold text-brand-deep-dark opacity-60 leading-none">Verified Assets</span>
               <div className="text-2xl font-bold text-brand-deep-dark tracking-tight leading-7 mt-0.5">{loading ? "..." : stats.verifiedCount}</div>
               <p className="text-[9px] font-bold text-brand-startup-amber italic leading-none mt-0.5">Active Status</p>
             </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-2 border-indigo-200 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden">
          <div className="flex items-center gap-4 relative z-10">
             <div className="h-12 w-12 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20 shrink-0">
               <Shield className="h-6 w-6 text-white" />
             </div>
             <div className="flex flex-col">
               <span className="text-[10px] font-bold text-brand-deep-dark opacity-60 leading-none">Administrative Tier</span>
               <div className="text-2xl font-bold text-brand-deep-dark tracking-tight leading-7 mt-0.5">{loading ? "..." : stats.adminCount}</div>
               <p className="text-[9px] font-bold text-indigo-600 italic leading-none mt-0.5">Goverance Core</p>
             </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-slate-50 to-slate-200 border-2 border-slate-200 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden">
          <div className="flex items-center gap-4 relative z-10">
             <div className="h-12 w-12 rounded-xl bg-brand-deep-dark flex items-center justify-center shadow-lg shadow-brand-deep-dark/40 shrink-0">
               <Shield className="h-6 w-6 text-white" />
             </div>
             <div className="flex flex-col">
               <span className="text-[10px] font-bold text-brand-deep-dark opacity-60 leading-none">Strategic Reviewers</span>
               <div className="text-2xl font-bold text-brand-deep-dark tracking-tight leading-7 mt-0.5">{loading ? "..." : stats.reviewerCount}</div>
               <p className="text-[9px] font-bold text-brand-deep-dark italic leading-none mt-0.5">Evaluation Force</p>
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
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>
            {/* Filters */}
            <div className="flex items-center gap-2 relative z-30">
              <Select value={filterRole} onValueChange={(v) => { setFilterRole(v); setCurrentPage(1); }}>
                <SelectTrigger className="w-[150px] h-10 bg-brand-mint-teal/5 border border-brand-mint-teal/20 rounded-xl font-semibold text-brand-deep-dark text-sm">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent className="bg-white rounded-xl border border-slate-100 shadow-2xl z-[150]">
                  <SelectItem value="all" className="font-semibold">All Roles</SelectItem>
                  {Object.keys(UserRole).map(role => (
                    <SelectItem key={role} value={role} className="font-semibold">{formatRole(role)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
                <SelectTrigger className="w-[130px] h-10 bg-brand-mint-teal/5 border border-brand-mint-teal/20 rounded-xl font-semibold text-brand-deep-dark text-sm">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-white rounded-xl border border-slate-100 shadow-2xl z-[150]">
                  <SelectItem value="all" className="font-semibold">Any Status</SelectItem>
                  <SelectItem value="active" className="font-semibold">Verified</SelectItem>
                  <SelectItem value="inactive" className="font-semibold">Unverified</SelectItem>
                  <SelectItem value="archived" className="font-semibold">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="px-6 pt-3 pb-4">
          <div className="rounded-2xl overflow-hidden border border-slate-100">
            <div className="overflow-x-auto">
            <Table className="whitespace-nowrap min-w-full">
              <TableHeader className="bg-brand-mint-teal/[0.06] border-b border-brand-mint-teal/10">
                <TableRow className="border-none hover:bg-transparent">
                  <TableHead className="py-3 font-bold text-[13px] text-brand-deep-dark pl-6 whitespace-nowrap">Identity</TableHead>
                  <TableHead className="py-3 font-bold text-[13px] text-brand-deep-dark whitespace-nowrap hidden md:table-cell">Email</TableHead>
                  <TableHead className="py-3 font-bold text-[13px] text-brand-deep-dark whitespace-nowrap">Role</TableHead>
                  <TableHead className="py-3 font-bold text-[13px] text-brand-deep-dark whitespace-nowrap hidden sm:table-cell">Status</TableHead>
                  <TableHead className="py-3 font-bold text-[13px] text-brand-deep-dark whitespace-nowrap hidden lg:table-cell">Registered At</TableHead>
                  <TableHead className="py-3 font-bold text-[13px] text-brand-deep-dark text-right pr-6 whitespace-nowrap">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-16">
                       <Loader2 className="h-8 w-8 animate-spin mx-auto text-brand-mint-teal opacity-30" />
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-16">
                       <div className="flex flex-col items-center gap-2 opacity-30">
                          <Users className="h-10 w-10" />
                          <p className="font-semibold text-sm">No users found</p>
                       </div>
                    </TableCell>
                  </TableRow>
                ) : users.map((user) => (
                  <TableRow
                    key={user.id}
                    className={cn(
                      "border-b border-slate-50 transition-colors",
                      user.isSuspended ? "bg-red-50/40 hover:bg-red-50/60" : "hover:bg-brand-mint-teal/[0.02]"
                    )}
                  >
                    <TableCell className="py-2.5 pl-6 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className={cn("font-semibold text-sm", user.isSuspended ? "text-slate-400" : "text-brand-deep-dark")}>
                          {user.firstName} {user.lastName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-2.5 whitespace-nowrap hidden md:table-cell">
                      <span className="text-sm text-slate-500">{user.email}</span>
                    </TableCell>
                    <TableCell className="py-2.5 whitespace-nowrap">
                      <Badge className={cn("px-2.5 py-0.5 rounded-full font-semibold text-[11px] border shadow-none", getRoleBadgeColor(user.role))}>
                        {formatRole(user.role)}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-2.5 whitespace-nowrap hidden sm:table-cell">
                      {user.isSuspended ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                          <ShieldOff className="h-3 w-3" /> Suspended
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-mint-teal bg-brand-mint-teal/10 px-2 py-0.5 rounded-full border border-brand-mint-teal/20">
                          <ShieldCheck className="h-3 w-3" /> Active
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="py-2.5 text-sm text-slate-500 whitespace-nowrap hidden lg:table-cell">
                      {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </TableCell>
                    <TableCell className="py-2.5 text-right pr-6">
                      {/* Desktop */}
                      <div className="hidden md:flex justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => handleEditUser(user)} className="h-7 w-7 rounded-lg hover:bg-brand-mint-teal/10 hover:text-brand-mint-teal">
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon" variant="ghost"
                          onClick={() => triggerToggleSuspension(user)}
                          title={user.isSuspended ? "Unsuspend" : "Suspend"}
                          className={cn("h-7 w-7 rounded-lg", user.isSuspended ? "text-green-500 hover:bg-green-50 hover:text-green-600" : "hover:bg-orange-50 hover:text-orange-500")}
                        >
                          {user.isSuspended ? <ShieldCheck className="h-3.5 w-3.5" /> : <ShieldOff className="h-3.5 w-3.5" />}
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => triggerDeleteUser(user)} className="h-7 w-7 rounded-lg hover:bg-red-50 hover:text-red-500">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      {/* Mobile: 3-dot dropdown */}
                      <div className="flex md:hidden justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-xl border border-slate-100 shadow-xl z-[100]">
                            <DropdownMenuItem onClick={() => handleEditUser(user)} className="font-semibold gap-2 cursor-pointer">
                              <Edit className="h-3.5 w-3.5 text-brand-mint-teal" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => triggerToggleSuspension(user)}
                              className={cn("font-semibold gap-2 cursor-pointer", user.isSuspended ? "text-green-600 focus:text-green-600" : "text-orange-500 focus:text-orange-500")}
                            >
                              {user.isSuspended
                                ? <><ShieldCheck className="h-3.5 w-3.5" /> Unsuspend</>
                                : <><ShieldOff className="h-3.5 w-3.5" /> Suspend</>}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => triggerDeleteUser(user)} className="font-semibold gap-2 cursor-pointer text-red-500 focus:text-red-500">
                              <Trash2 className="h-3.5 w-3.5" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4 px-4">
             <div className="text-[11px] font-bold text-slate-400">
                Users {((currentPage - 1) * pageSize) + 1}—{Math.min(currentPage * pageSize, totalItems)} of {totalItems}
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

      {/* Flagship Discovery & Interaction Dialogs */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl rounded-[40px] border border-slate-100 shadow-[0_40px_100px_-15px_rgba(0,0,0,0.1)] bg-white p-10 overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold text-brand-deep-dark">
              Add New User
            </DialogTitle>
            <DialogDescription className="text-sm font-semibold text-slate-500 mt-1">
              Create a new user account in the system
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-6 relative z-10">
            <div className="grid grid-cols-2 gap-5">
                <div className="grid gap-2">
                <Label htmlFor="firstName" className="text-xs font-bold text-brand-deep-dark pl-1">First Name <span className="text-red-500">*</span></Label>
                <Input
                    id="firstName"
                    className="h-12 bg-white border border-slate-200 rounded-xl font-semibold text-brand-deep-dark focus-visible:ring-2 focus-visible:ring-brand-mint-teal/20"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="E.g. John"
                />
                </div>
                <div className="grid gap-2">
                <Label htmlFor="lastName" className="text-xs font-bold text-brand-deep-dark pl-1">Last Name <span className="text-red-500">*</span></Label>
                <Input
                    id="lastName"
                    className="h-12 bg-white border border-slate-200 rounded-xl font-semibold text-brand-deep-dark focus-visible:ring-2 focus-visible:ring-brand-mint-teal/20"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="E.g. Doe"
                />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-xs font-bold text-brand-deep-dark pl-1">Email Address <span className="text-red-500">*</span></Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 transition-colors group-focus-within:text-brand-mint-teal" />
                  <Input
                    id="email"
                    type="email"
                    className="pl-12 h-12 bg-white border border-slate-200 rounded-xl font-semibold text-brand-deep-dark focus-visible:ring-2 focus-visible:ring-brand-mint-teal/20"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@domain.com"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone" className="text-xs font-bold text-brand-deep-dark pl-1">Phone Number</Label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 transition-colors group-focus-within:text-brand-startup-amber" />
                  <Input
                    id="phone"
                    className="pl-12 h-12 bg-white border border-slate-200 rounded-xl font-semibold text-brand-deep-dark focus-visible:ring-2 focus-visible:ring-brand-startup-amber/20"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+251..."
                  />
                </div>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role" className="text-xs font-bold text-brand-deep-dark pl-1">User Role <span className="text-red-500">*</span></Label>
              <Select value={formData.role} onValueChange={(value: UserRole) => setFormData({ ...formData, role: value })}>
                <SelectTrigger className="h-12 bg-white border border-slate-200 rounded-xl font-bold text-brand-deep-dark px-4">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white rounded-xl border border-slate-100 shadow-2xl z-[150]">
                  {Object.keys(UserRole).map(role => (
                    <SelectItem key={role} value={role} className="font-semibold">{role.replace('_', ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="mt-8 gap-4">
            <Button variant="ghost" className="h-12 px-8 rounded-xl font-bold text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleCreateUser} 
              disabled={isSaving || !formData.firstName || !formData.lastName || !formData.email}
              className="bg-brand-mint-teal hover:bg-brand-mint-teal/90 text-white font-bold h-12 px-10 rounded-xl shadow-lg shadow-brand-mint-teal/20 text-xs transition-all hover:scale-105 active:scale-95"
            >
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Add User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl rounded-[40px] border border-slate-100 shadow-[0_40px_100px_-15px_rgba(0,0,0,0.1)] bg-white p-10 overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold text-brand-deep-dark">
              Edit User Details
            </DialogTitle>
            <DialogDescription className="text-sm font-semibold text-slate-500 mt-1">
              Update account information and roles
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-6 relative z-10">
             <div className="grid grid-cols-2 gap-5">
                <div className="grid gap-2">
                <Label htmlFor="edit-firstName" className="text-xs font-bold text-brand-deep-dark pl-1">First Name</Label>
                <Input
                    id="edit-firstName"
                    className="h-12 bg-white border border-slate-200 rounded-xl font-semibold text-brand-deep-dark focus-visible:ring-2 focus-visible:ring-brand-startup-amber/20"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
                </div>
                <div className="grid gap-2">
                <Label htmlFor="edit-lastName" className="text-xs font-bold text-brand-deep-dark pl-1">Last Name</Label>
                <Input
                    id="edit-lastName"
                    className="h-12 bg-white border border-slate-200 rounded-xl font-semibold text-brand-deep-dark focus-visible:ring-2 focus-visible:ring-brand-startup-amber/20"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div className="grid gap-2">
                <Label htmlFor="edit-email" className="text-xs font-bold text-brand-deep-dark pl-1">Email Address</Label>
                <div className="relative opacity-60">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="edit-email"
                    type="email"
                    className="pl-12 h-12 bg-slate-50 border border-slate-200 rounded-xl font-bold text-brand-deep-dark cursor-not-allowed"
                    readOnly
                    disabled
                    value={formData.email}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-phone" className="text-xs font-bold text-brand-deep-dark pl-1">Phone Number</Label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 transition-colors group-focus-within:text-brand-startup-amber" />
                  <Input
                    id="edit-phone"
                    className="pl-12 h-12 bg-white border border-slate-200 rounded-xl font-semibold text-brand-deep-dark focus-visible:ring-2 focus-visible:ring-brand-startup-amber/20"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-role" className="text-xs font-bold text-brand-deep-dark pl-1">User Role</Label>
              <Select value={formData.role} onValueChange={(value: UserRole) => setFormData({ ...formData, role: value })}>
                <SelectTrigger className="h-12 bg-white border border-slate-200 rounded-xl font-bold text-brand-deep-dark px-4">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white rounded-xl border border-slate-100 shadow-2xl z-[150]">
                  {Object.keys(UserRole).map(role => (
                    <SelectItem key={role} value={role} className="font-semibold">{role.replace('_', ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="mt-8 gap-4">
            <Button variant="ghost" className="h-12 px-8 rounded-xl font-bold text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleUpdateUser} 
              disabled={isSaving}
              className="bg-brand-startup-amber hover:bg-brand-startup-amber/90 text-white font-bold h-12 px-10 rounded-xl shadow-lg shadow-brand-startup-amber/20 text-xs transition-all hover:scale-105 active:scale-95"
            >
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Edit className="mr-2 h-4 w-4" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent className="max-w-md rounded-[40px] border border-slate-100 shadow-[0_40px_100px_-15px_rgba(0,0,0,0.1)] bg-white p-10 overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold text-brand-deep-dark">
              {confirmAction === "delete" ? "Archive User" : userToConfirm?.isSuspended ? "Unsuspend User" : "Suspend User"}
            </DialogTitle>
            <DialogDescription className="text-sm font-semibold text-slate-500 mt-2">
              Are you sure you want to {confirmAction === "delete" ? "archive" : userToConfirm?.isSuspended ? "unsuspend" : "suspend"} the account for <span className="text-brand-deep-dark">{userToConfirm?.firstName} {userToConfirm?.lastName}</span>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-8 gap-4">
            <Button variant="ghost" className="h-12 px-8 rounded-xl font-bold text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100" onClick={() => setIsConfirmDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={executeConfirmAction} 
              disabled={isConfirming}
              className={cn(
                "font-bold h-12 px-10 rounded-xl shadow-lg text-xs transition-all hover:scale-105 active:scale-95 text-white",
                confirmAction === "delete" || (!userToConfirm?.isSuspended && confirmAction === "suspend") 
                  ? "bg-red-500 hover:bg-red-600 shadow-red-500/20" 
                  : "bg-brand-mint-teal hover:bg-brand-mint-teal/90 shadow-brand-mint-teal/20"
              )}
            >
              {isConfirming ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {confirmAction === "delete" ? "Archive User" : userToConfirm?.isSuspended ? "Unsuspend User" : "Suspend User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
