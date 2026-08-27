"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Plus,
  Mail,
  Phone,
  MoreHorizontal,
  Edit,
  Trash,
  Shield,
  User,
  UserCheck,
  ExternalLink,
  Download,
  Users,
  Activity,
  TrendingUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Ban,
  Lock
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getUsers, deleteUser, restoreUser, createUser, updateUser, toggleUserSuspension } from "./user-actions";
import { getRoles } from "../roles/role-actions";
import { useEffect } from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";


const USER_ROLES = {
  SUPER_ADMIN: {
    label: 'Super Admin',
    color: 'from-red-600 to-rose-700',
    bg: 'bg-red-100',
    text: 'text-red-900',
    border: 'border-red-300',
    icon: <Shield className="h-4 w-4 text-red-700" />,
    description: 'System-wide configuration and emergency access'
  },
  ADMIN: {
    label: 'Administrator',
    color: 'from-violet-600 to-purple-700',
    bg: 'bg-violet-100',
    text: 'text-violet-900',
    border: 'border-violet-300',
    icon: <Shield className="h-4 w-4 text-violet-700" />,
    description: 'Full access to all system features and settings'
  },
  MANAGER: {
    label: 'Manager',
    color: 'from-blue-600 to-cyan-700',
    bg: 'bg-blue-100',
    text: 'text-blue-900',
    border: 'border-blue-300',
    icon: <UserCheck className="h-4 w-4 text-blue-700" />,
    description: 'Department-level management and approval capabilities'
  },
  REVIEWER: {
    label: 'Reviewer',
    color: 'from-emerald-600 to-teal-700',
    bg: 'bg-emerald-100',
    text: 'text-emerald-900',
    border: 'border-emerald-300',
    icon: <User className="h-4 w-4 text-emerald-700" />,
    description: 'Can review and process applications within assigned department'
  },
  SUPPORT: {
    label: 'Support',
    color: 'from-amber-600 to-orange-700',
    bg: 'bg-amber-100',
    text: 'text-amber-900',
    border: 'border-amber-300',
    icon: <Activity className="h-4 w-4 text-amber-700" />,
    description: 'Access to help desks and user support tools'
  },
  USER: {
    label: 'Standard User',
    color: 'from-slate-600 to-slate-700',
    bg: 'bg-slate-100',
    text: 'text-slate-900',
    border: 'border-slate-300',
    icon: <User className="h-4 w-4 text-slate-700" />,
    description: 'General access to the public portal'
  },
  DYNAMIC: {
    label: 'Custom Authority',
    color: 'from-slate-400 to-slate-500',
    bg: 'bg-slate-50',
    text: 'text-slate-600',
    border: 'border-slate-200',
    icon: <Lock className="h-3 w-3 text-slate-500" />,
    description: 'Roles managed via Authority Matrix'
  }
};

const DEPARTMENTS = [
  'Platform Administration',
  'Startup Certification',
  'Ecosystem Certification',
  'Startup Support',
  'Ecosystem Support',
  'Data & Reports'
];

const AVATAR_GRADIENTS = [
  'from-violet-400 to-purple-600',
  'from-blue-400 to-cyan-600',
  'from-emerald-400 to-teal-600',
  'from-rose-400 to-pink-600',
  'from-amber-400 to-orange-600',
  'from-indigo-400 to-blue-600',
];

function getAvatarGradient(name: string) {
  const idx = name.charCodeAt(0) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[idx];
}

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('standard');
  const [stats, setStats] = useState({
    total: 0,
    adminCount: 0,
    reviewerCount: 0,
    verifiedCount: 0
  });
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [showUserDialog, setShowUserDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  const [availableRoles, setAvailableRoles] = useState<any[]>([]);

  useEffect(() => {
    fetchUsers(currentPage, pageSize, searchQuery, roleFilter, statusFilter);
    fetchAvailableRoles();
  }, [currentPage, pageSize, searchQuery, roleFilter, statusFilter]);

  const fetchAvailableRoles = async () => {
    const res = await getRoles();
    if (!res.success) {
      const msg = res.message || "Failed to fetch roles";
      if (msg === "Unauthorized") {
        router.replace('/auth/sign-in');
        return;
      }
      if (msg === "Forbidden") {
        router.replace('/admins-new');
        return;
      }
      return;
    }
    setAvailableRoles(res.data || []);
  };

  const fetchUsers = async (page: number, size: number, search: string, role: string, status: string) => {
    setLoading(true);
    try {
      const result = await getUsers(page, size, search, role, status);
      if (result.success) {
        setUsers(result.data || []);
        if (result.stats) {
          setStats(result.stats);
        }
        if (result.pagination) {
          setTotalPages(result.pagination.totalPages);
          setTotalItems(result.pagination.total);
        }
        return;
      }

      const msg = result.message || "Failed to fetch users";
      if (msg === "Unauthorized") {
        router.replace('/auth/sign-in');
        return;
      }
      if (msg === "Forbidden") {
        router.replace('/admins-new');
        return;
      }

      toast.error("Failed to fetch users");
    } catch (err) {
      toast.error("An error occurred while fetching users");
    } finally {
      setLoading(false);
    }
  };

  // Filters are now handled server-side for performance and correct pagination
  const handleAddUser = () => {
    setCurrentUser({
      firstName: '', 
      lastName: '', 
      email: '', 
      phoneNumber: '', 
      role: 'USER',
      roles: [], // Dynamic roles
    });
    setActiveTab('standard');
    setIsEditing(false);
    setShowUserDialog(true);
  };

  const handleEditUser = (user: any) => {
    setCurrentUser({ 
      ...user,
      roles: user.roles?.map((r: any) => r.id) || []
    });
    setActiveTab(user.role === 'USER' ? 'standard' : 'admin');
    setIsEditing(false); // Reset editing state
    setIsEditing(true);
    setShowUserDialog(true);
  };

  const handleDeleteUser = (userId: string) => {
    setUserToDelete(userId);
    setShowDeleteDialog(true);
  };

  const handleToggleSuspension = async (user: any) => {
    const res = await toggleUserSuspension(user.id, user.isSuspended);
    if (res.success) {
      toast.success(res.message);
      fetchUsers(currentPage, pageSize, searchQuery, roleFilter, statusFilter);
    } else {
      toast.error(res.message);
    }
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    const res = await deleteUser(userToDelete);
    if (res.success) {
      toast.success("Identity archived (Soft Delete)");
      fetchUsers(currentPage, pageSize, searchQuery, roleFilter, statusFilter);
    } else {
      toast.error("Failed to archive identity");
    }
    setShowDeleteDialog(false);
    setUserToDelete(null);
  };

  const handleRestoreUser = async (userId: string) => {
    const res = await restoreUser(userId);
    if (res.success) {
      toast.success("Identity restored");
      fetchUsers(currentPage, pageSize, searchQuery, roleFilter, statusFilter);
    } else {
      toast.error("Failed to restore identity");
    }
  };

  const handleSaveUser = async () => {
    // Validation
    if (!currentUser.firstName?.trim()) {
      toast.error("First Name is required");
      return;
    }
    if (!currentUser.lastName?.trim()) {
      toast.error("Last Name is required");
      return;
    }
    if (!currentUser.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(currentUser.email)) {
      toast.error("A valid Email Address is required");
      return;
    }
    if (!currentUser.phoneNumber?.trim() || !/^\+?[0-9]{10,15}$/.test(currentUser.phoneNumber.replace(/\s/g, ''))) {
      toast.error("A valid Phone Number is required (e.g., +251 911 223344)");
      return;
    }
    if (!currentUser.role) {
      toast.error("Please select a System Role");
      return;
    }

    setIsSaving(true);
    let res;
    if (isEditing) {
      res = await updateUser(currentUser.id, {
        firstName: currentUser.firstName.trim(),
        lastName: currentUser.lastName.trim(),
        role: currentUser.role,
        phoneNumber: currentUser.phoneNumber.trim(),
        roles: currentUser.roles
      });
    } else {
      res = await createUser({
        email: currentUser.email.trim(),
        firstName: currentUser.firstName.trim(),
        lastName: currentUser.lastName.trim(),
        role: currentUser.role,
        phoneNumber: currentUser.phoneNumber.trim(),
        roles: currentUser.roles
      });
    }

    if (res.success) {
      toast.success(isEditing ? "Identity updated" : "Identity registered");
      fetchUsers(currentPage, pageSize, searchQuery, roleFilter, statusFilter);
      setShowUserDialog(false);
      setCurrentUser(null);
    } else {
      toast.error(res.message || "Failed to save identity");
    }
    setIsSaving(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
  };

  const activeCount = stats.verifiedCount;
  const adminCount = stats.adminCount;
  const reviewerCount = stats.reviewerCount;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-950">
                  Identity Matrix
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Manage user accounts, roles &amp; system access
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="group flex items-center justify-start gap-0 hover:gap-2 border-slate-200 bg-white hover:bg-slate-50 transition-all duration-500 rounded-xl px-0 hover:px-4 h-10 w-10 hover:w-36 overflow-hidden shadow-sm hover:shadow-md border-b-2"
            >
              <div className="flex items-center justify-center w-10 h-10 shrink-0">
                <Download className="h-4 w-4 text-slate-600 transition-colors group-hover:text-indigo-600" />
              </div>
              <span className="text-xs font-black text-slate-900 opacity-0 group-hover:opacity-100 transition-all duration-500 whitespace-nowrap tracking-tight">
                EXPORT MATRIX
              </span>
            </Button>
            <Button
              onClick={handleAddUser}
              size="sm"
              className="gap-2 bg-slate-900 hover:bg-black text-white shadow-sm border-0 rounded-xl px-5"
            >
              <Plus className="h-4 w-4" />
              Add Identity
            </Button>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: 'Total Identities',
              value: loading ? '...' : totalItems,
              sub: `${activeCount} verified`,
              icon: <Users className="h-5 w-5" />,
              grad: 'from-indigo-500 to-purple-600',
              bg: 'from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40',
              ring: 'ring-indigo-100 dark:ring-indigo-900/30',
            },
            {
              label: 'Administrators',
              value: adminCount,
              sub: 'Full system access',
              icon: <Shield className="h-5 w-5" />,
              grad: 'from-violet-500 to-purple-600',
              bg: 'from-violet-50 to-purple-50 dark:from-violet-950/40 dark:to-purple-950/40',
              ring: 'ring-violet-100 dark:ring-violet-900/30',
            },
            {
              label: 'Reviewers',
              value: reviewerCount,
              sub: 'All departments',
              icon: <UserCheck className="h-5 w-5" />,
              grad: 'from-emerald-500 to-teal-600',
              bg: 'from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40',
              ring: 'ring-emerald-100 dark:ring-emerald-900/30',
            },
            {
              label: 'New This Month',
              value: 2,
              sub: 'Last 30 days',
              icon: <TrendingUp className="h-5 w-5" />,
              grad: 'from-amber-500 to-orange-600',
              bg: 'from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40',
              ring: 'ring-amber-100 dark:ring-amber-900/30',
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="relative rounded-2xl p-5 bg-white ring-1 ring-slate-200 shadow-sm border-b-2 border-slate-100 group hover:border-indigo-500 transition-all duration-200"
            >
              <div className="absolute inset-0 bg-white/40 dark:bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-black text-slate-950">{stat.value}</p>
                  <p className="text-xs text-slate-600 mt-1 font-medium">{stat.sub}</p>
                </div>
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.grad} shadow-lg text-white`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Search & Filters ── */}
        <div className="bg-white rounded-2xl ring-1 ring-slate-200 shadow-sm p-4 border-b-2 border-slate-100">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                type="search"
                placeholder="Search by name, email or ID..."
                className="pl-9 bg-white border-slate-200 rounded-xl focus-visible:ring-slate-950 placeholder:text-slate-400 h-11"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[150px] h-11 rounded-xl bg-white border-slate-200 text-slate-900 font-medium">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                  <SelectItem value="ADMIN">Administrator</SelectItem>
                  <SelectItem value="MANAGER">Manager</SelectItem>
                  <SelectItem value="REVIEWER">Reviewer</SelectItem>
                  <SelectItem value="SUPPORT">Support</SelectItem>
                  <SelectItem value="USER">Standard User</SelectItem>
                </SelectContent>
              </Select>


              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] h-11 rounded-xl bg-white border-slate-200 text-slate-900 font-medium">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Verified</SelectItem>
                  <SelectItem value="inactive">Unverified</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>

              {(roleFilter !== 'all' || statusFilter !== 'all' || searchQuery) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setRoleFilter('all'); setStatusFilter('all'); setSearchQuery(''); }}
                  className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-sm"
                >
                  Clear filters
                </Button>
              )}
            </div>
          </div>
          {totalItems > 0 && !loading && (
            <p className="mt-3 text-xs text-slate-600 font-bold">
              Showing <span className="text-indigo-600">{(currentPage-1)*pageSize + 1}</span> to <span className="text-indigo-600">{Math.min(currentPage*pageSize, totalItems)}</span> of <span className="text-indigo-600">{totalItems}</span> identities
            </p>
          )}
        </div>

        {/* ── Table ── */}
        <div className="bg-white rounded-2xl ring-1 ring-slate-200 shadow-md ring-inset overflow-hidden border-slate-200">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/80 hover:bg-slate-50/80 border-b border-slate-200">
                <TableHead className="text-xs font-bold text-slate-600 uppercase tracking-wider pl-6 py-4">Identity</TableHead>
                <TableHead className="text-xs font-bold text-slate-600 uppercase tracking-wider py-4">Contact</TableHead>
                <TableHead className="text-xs font-bold text-slate-600 uppercase tracking-wider py-4">Role</TableHead>
                <TableHead className="text-xs font-bold text-slate-600 uppercase tracking-wider py-4">Status</TableHead>
                <TableHead className="text-xs font-bold text-slate-600 uppercase tracking-wider py-4">Joined Date</TableHead>
                <TableHead className="w-[56px] py-4" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-20">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
                      <p className="text-sm text-slate-500 font-medium">Syncing with Identity Vault...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-20">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800">
                        <Search className="h-6 w-6 text-slate-400" />
                      </div>
                      <p className="font-medium text-slate-600 dark:text-slate-300">No identities found</p>
                      <p className="text-sm text-slate-400 dark:text-slate-500">Try adjusting your search or filters</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : users.map((user, idx) => {
                const role = USER_ROLES[user.role as keyof typeof USER_ROLES];
                const displayName = `${user.firstName} ${user.lastName}`;
                const initials = user.firstName[0] + (user.lastName?.[0] || '');
                const gradClass = getAvatarGradient(displayName);
                return (
                  <TableRow
                    key={user.id}
                    className={`
                      border-b border-slate-200 
                      hover:bg-slate-50
                      transition-colors duration-150
                      ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}
                    `}
                  >
                    {/* Identity */}
                    <TableCell className="pl-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative flex-shrink-0">
                          <Avatar className="h-9 w-9 ring-2 ring-white dark:ring-slate-900 shadow-md">
                            <AvatarFallback className={`bg-gradient-to-br ${gradClass} text-white text-xs font-bold`}>
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          {user.emailVerified && (
                            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/admins-new/users/${user.id}`}
                            className="flex items-center gap-1 font-bold text-slate-900 hover:text-indigo-600 transition-colors text-sm group"
                          >
                            <span className="truncate">{displayName}</span>
                            <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                          </Link>
                          <p className="text-xs text-slate-500 font-mono mt-0.5 truncate max-w-[100px]">{user.id}</p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Contact */}
                    <TableCell className="py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                          <Mail className="h-3.5 w-3.5 text-indigo-600 flex-shrink-0" />
                          <span className="truncate max-w-[180px]">{user.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm font-bold text-slate-800">
                          <Phone className="h-3.5 w-3.5 text-indigo-500 flex-shrink-0" />
                          <span>{user.phoneNumber || 'N/A'}</span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Role */}
                    <TableCell className="py-4">
                      <div className="flex flex-col gap-1.5 items-start">
                        {role && (
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${role.bg} ${role.text} border ${role.border}`}>
                            {role.icon}
                            {role.label}
                          </span>
                        )}
                        {user.roles?.map((r: any) => (
                          <span key={r.id} className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-50 text-slate-600 border border-slate-200 uppercase tracking-tighter">
                            <Lock className="h-2.5 w-2.5 text-slate-400" />
                            {r.name}
                          </span>
                        ))}
                        {!role && (!user.roles || user.roles.length === 0) && (
                          <span className="text-slate-400 text-sm italic">No role assigned</span>
                        )}
                      </div>
                    </TableCell>


                    {/* Status */}
                    <TableCell className="py-4">
                      <div className="flex flex-col gap-1.5">
                        {user.isSuspended && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black bg-red-100 text-red-900 ring-1 ring-red-400">
                            <Ban className="h-3 w-3" />
                            SUSPENDED
                          </span>
                        )}
                        {user.emailVerified ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 ring-1 ring-emerald-400/50 shadow-sm">
                            <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse shadow-[0_0_8px_rgba(5,150,105,0.5)]" />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-900 ring-1 ring-slate-400/50 shadow-sm">
                            <span className="h-2 w-2 rounded-full bg-slate-500" />
                            Unverified
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Last Active -> Joined Date */}
                    <TableCell className="py-4">
                      <span className="text-sm font-bold text-slate-800">
                        {user.createdAt ? formatDate(user.createdAt) : 'Never'}
                      </span>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="py-4 pr-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl border-slate-200 dark:border-slate-700">
                          <DropdownMenuItem asChild>
                            <Link href={`/admins-new/users/${user.id}`} className="flex items-center gap-2 px-3 py-2 cursor-pointer">
                              <ExternalLink className="h-4 w-4 text-slate-500" />
                              <span>View Profile</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditUser(user)} className="flex items-center gap-2 px-3 py-2 cursor-pointer font-medium">
                            <Edit className="h-4 w-4 text-slate-500" />
                            <span>Edit Identity</span>
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem 
                            onClick={() => handleToggleSuspension(user)} 
                            className={`flex items-center gap-2 px-3 py-2 cursor-pointer font-bold ${user.isSuspended ? 'text-emerald-600' : 'text-amber-600'}`}
                          >
                            <Ban className="h-4 w-4" />
                            <span>{user.isSuspended ? 'Lift Suspension' : 'Suspend Account'}</span>
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />
                          {statusFilter === 'archived' ? (
                            <DropdownMenuItem
                              onClick={() => handleRestoreUser(user.id)}
                              className="flex items-center gap-2 px-3 py-2 cursor-pointer text-emerald-600 focus:text-white focus:bg-emerald-600 font-bold"
                            >
                              <UserCheck className="h-4 w-4" />
                              <span>Restore Identity</span>
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => handleDeleteUser(user.id)}
                              className="flex items-center gap-2 px-3 py-2 cursor-pointer text-amber-600 focus:text-white focus:bg-amber-600 font-bold"
                            >
                              <Trash className="h-4 w-4" />
                              <span>Archive Identity</span>
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* ── Pagination ── */}
        <div className="flex items-center justify-between px-2 py-4 mt-2 bg-white rounded-xl border border-slate-200 px-6">
          <div className="flex items-center gap-3">
            <p className="text-sm font-bold text-slate-700">Rows per page:</p>
            <Select 
              value={pageSize.toString()} 
              onValueChange={(v) => {
                setPageSize(parseInt(v));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[80px] h-10 border-slate-200 rounded-xl font-bold text-slate-900 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
                <SelectItem value="200">200</SelectItem>
                <SelectItem value="300">300</SelectItem>
                <SelectItem value="500">500</SelectItem>
                <SelectItem value="1000">1000</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-6">
            <p className="text-sm font-bold text-slate-700">
              Page <span className="text-indigo-600 font-black px-1.5 py-0.5 bg-indigo-50 rounded-md">{currentPage}</span> of <span className="text-slate-900 font-black">{totalPages}</span>
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 border-slate-200 hover:bg-slate-50 rounded-xl disabled:opacity-30 transition-all font-bold"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1 || loading}
              >
                <ChevronLeft className="h-5 w-5 text-slate-700" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 border-slate-200 hover:bg-slate-50 rounded-xl disabled:opacity-30 transition-all font-bold"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || loading}
              >
                <ChevronRight className="h-5 w-5 text-slate-700" />
              </Button>
            </div>
          </div>
        </div>

        {/* ── Edit / Create Dialog ── */}
        {currentUser && (
          <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
            <DialogContent className="max-w-md rounded-2xl border-slate-200 bg-white shadow-2xl p-0 overflow-hidden">
              <DialogHeader className="p-6 pb-2 bg-white">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-900 shadow-md">
                    {isEditing ? <Edit className="h-4 w-4 text-white" /> : <Plus className="h-4 w-4 text-white" />}
                  </div>
                  <DialogTitle className="text-xl font-black text-slate-950 tracking-tight">
                    {isEditing ? 'Update Identity' : 'Register Identity'}
                  </DialogTitle>
                </div>
              </DialogHeader>

              <Tabs 
                value={activeTab} 
                onValueChange={(v) => {
                  setActiveTab(v);
                  if (v === 'standard') {
                    setCurrentUser({ ...currentUser, role: 'USER' });
                  } else if (currentUser.role === 'USER') {
                    // Default to ADMIN if moving from standard to admin tab
                    setCurrentUser({ ...currentUser, role: 'ADMIN' });
                  }
                }} 
                className="mt-2"
              >
                <TabsList className="grid grid-cols-2 rounded-xl bg-slate-100/80 p-1 h-12 mx-6">
                  <TabsTrigger 
                    value="standard" 
                    className="rounded-lg text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-slate-950 data-[state=active]:shadow-md transition-all"
                  >
                    Standard User
                  </TabsTrigger>
                  <TabsTrigger 
                    value="admin" 
                    className="rounded-lg text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-slate-950 data-[state=active]:shadow-md transition-all"
                  >
                    Admin Group
                  </TabsTrigger>
                </TabsList>

                <div className="space-y-6 py-6 max-h-[60vh] overflow-y-auto px-6 mt-2">
                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="u-fname" className="text-sm font-bold text-slate-700">
                        First Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="u-fname"
                        placeholder="e.g. Abebe"
                        value={currentUser.firstName}
                        onChange={(e) => setCurrentUser({ ...currentUser, firstName: e.target.value })}
                        className="rounded-xl border-slate-200 bg-white focus-visible:ring-indigo-600 font-medium h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="u-lname" className="text-sm font-bold text-slate-700">
                        Last Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="u-lname"
                        placeholder="e.g. Bikila"
                        value={currentUser.lastName}
                        onChange={(e) => setCurrentUser({ ...currentUser, lastName: e.target.value })}
                        className="rounded-xl border-slate-200 bg-white focus-visible:ring-indigo-600 font-medium h-11"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="u-email" className="text-sm font-bold text-slate-700">
                      Email Address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="u-email"
                      type="email"
                      disabled={isEditing}
                      placeholder="name@example.com"
                      value={currentUser.email}
                      onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })}
                      className="rounded-xl border-slate-200 bg-white focus-visible:ring-indigo-600 font-medium h-11 disabled:opacity-60"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="u-phone" className="text-sm font-bold text-slate-700">
                      Phone Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="u-phone"
                      placeholder="+251 9... or 09..."
                      value={currentUser.phoneNumber || ''}
                      onChange={(e) => setCurrentUser({ ...currentUser, phoneNumber: e.target.value })}
                      className="rounded-xl border-slate-200 bg-white focus-visible:ring-indigo-600 font-medium h-11"
                    />
                  </div>

                  {/* Administrative Configuration (Only in Admin Tab) */}
                  {activeTab === 'admin' && (
                    <div className="space-y-5 pt-6 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-300 pb-2">
                      <div className="space-y-2">
                        <Label htmlFor="u-role" className="text-sm font-bold text-slate-700">
                          Select Administrative Authority <span className="text-red-500">*</span>
                        </Label>
                        <Select 
                          value={availableRoles.find(r => currentUser.roles?.includes(r.id))?.id || ''} 
                          onValueChange={(roleId) => {
                            const selectedRole = availableRoles.find(r => r.id === roleId);
                            if (selectedRole) {
                              // Map db role name to approximate enum value or use ADMIN as fallback
                              const enumGuess = selectedRole.name.toUpperCase().replace(/\s+/g, '_');
                              setCurrentUser({ 
                                ...currentUser, 
                                role: enumGuess,
                                roles: [roleId] // Primary selection sets the roles array
                              });
                            }
                          }}
                        >
                          <SelectTrigger id="u-role" className="rounded-xl border-slate-200 bg-white font-bold h-12 ring-inset">
                            <SelectValue placeholder="Select from Authority Matrix..." />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl shadow-2xl border-slate-200">
                            {availableRoles.map((role) => (
                              <SelectItem key={role.id} value={role.id} className="py-2.5 font-bold">
                                {role.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {(() => {
                        const selectedRoleId = currentUser.roles?.[0];
                        const dbRole = availableRoles.find(r => r.id === selectedRoleId);
                        if (!dbRole) return null;

                        // Try to get styling from static mapping, or fallback to DYNAMIC style
                        const styleKey = currentUser.role as keyof typeof USER_ROLES;
                        const r = USER_ROLES[styleKey] || USER_ROLES.DYNAMIC;
                        
                        return (
                          <div className={`flex items-start gap-4 p-4 rounded-2xl ${r.bg} border ${r.border} shadow-sm animate-in fade-in zoom-in-95 duration-200`}>
                            <div className={`p-2.5 rounded-xl bg-white shadow-md ring-1 ${r.border}`}>{r.icon}</div>
                            <div>
                               <div className="flex items-center gap-2">
                                <p className={`text-xs font-black uppercase tracking-widest ${r.text}`}>{dbRole.name}</p>
                                <Badge variant="outline" className="text-[9px] font-black border-slate-200 bg-white text-slate-500 uppercase py-0 px-1">DB Verified</Badge>
                              </div>
                              <p className="text-xs text-slate-700 mt-1 leading-relaxed font-medium">
                                {dbRole.description || 'This role grants specific permissions defined in the Authority Matrix.'}
                              </p>
                              {dbRole.permissions && dbRole.permissions.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {dbRole.permissions.slice(0, 5).map((p: any) => (
                                    <span key={p.id} className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-slate-500 uppercase">
                                      {p.name}
                                    </span>
                                  ))}
                                  {dbRole.permissions.length > 5 && <span className="text-[9px] font-bold text-slate-400">+{dbRole.permissions.length - 5} more</span>}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* Auto-indicator for Standard Users */}
                  {activeTab === 'standard' && (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 border-dashed">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-sm text-slate-600">
                          <User className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 leading-none">Automatic Assignment</p>
                          <p className="text-[11px] text-slate-500 mt-1">Identity will be registered as a <b>Standard User</b> by default.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Dynamic Roles Matrix */}
                  <div className="space-y-4 pt-6 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-black text-slate-700 uppercase tracking-tighter">Authority Matrix Roles</Label>
                      {availableRoles.length > 0 && (
                        <Badge variant="outline" className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border-indigo-100 uppercase">
                          From Database
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {availableRoles.length === 0 ? (
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 border-dashed text-center">
                          <p className="text-xs text-slate-400 italic font-medium">No custom authority roles defined in database</p>
                          <Button 
                            variant="link" 
                            size="sm" 
                            className="text-[10px] text-indigo-600 font-bold uppercase mt-1"
                            asChild
                          >
                            <Link href="/admins-new/roles">Create a Role</Link>
                          </Button>
                        </div>
                      ) : availableRoles.map((role) => (
                        <div 
                          key={role.id}
                          className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer group ${
                            currentUser.roles?.includes(role.id) 
                            ? 'border-indigo-500 bg-indigo-50/30' 
                            : 'border-slate-100 bg-slate-50/50 hover:bg-slate-100'
                          }`}
                          onClick={() => {
                            const newRoles = [...(currentUser.roles || [])];
                            const idx = newRoles.indexOf(role.id);
                            if (idx > -1) newRoles.splice(idx, 1);
                            else newRoles.push(role.id);
                            setCurrentUser({ ...currentUser, roles: newRoles });
                          }}
                        >
                          <Checkbox 
                            checked={currentUser.roles?.includes(role.id)}
                            onCheckedChange={() => {}} 
                            className="rounded-md border-slate-300 pointer-events-none group-hover:border-slate-400"
                          />
                          <div className="space-y-0.5">
                            <p className="text-xs font-bold text-slate-900 leading-none">{role.name}</p>
                            <p className="text-[10px] text-slate-500 font-medium leading-none truncate max-w-[250px]">{role.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Tabs>

                <div className="px-6 pb-6">
                  <DialogFooter className="gap-2 pt-4 border-t border-slate-100 mt-2">
                    <Button
                      variant="outline"
                      disabled={isSaving}
                      onClick={() => setShowUserDialog(false)}
                      className="rounded-xl border-slate-200 font-bold text-slate-700 hover:bg-slate-50 h-11 px-6"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveUser}
                      disabled={isSaving}
                      className="rounded-xl bg-slate-900 hover:bg-black text-white border-0 shadow-lg px-8 h-11 font-bold"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        isEditing ? 'Update Info' : 'Confirm Registration'
                      )}
                    </Button>
                  </DialogFooter>
                </div>
            </DialogContent>
          </Dialog>
        )}

        {/* ── Delete Dialog ── */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="max-w-sm rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl">
            <DialogHeader>
              <div className="flex flex-col items-center gap-3 text-center pt-2">
                <div className="p-3 rounded-full bg-red-100 dark:bg-red-950/40">
                  <Trash className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
                  Archive Identity?
                </DialogTitle>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  This will de-activate the user&apos;s access but preserve their data in the archive. This action can be reversed by an administrator.
                </p>
              </div>
            </DialogHeader>
            <DialogFooter className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1 rounded-xl border-slate-200 dark:border-slate-700"
                onClick={() => setShowDeleteDialog(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1 rounded-xl bg-amber-600 hover:bg-amber-700 border-0"
                onClick={confirmDelete}
              >
                Archive
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
}