"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Shield,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash,
  CheckCircle2,
  XCircle,
  Info,
  Lock,
  ChevronRight,
  Loader2,
  ArrowLeft,
  Key
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import Link from "next/link";
import { getRoles, createRole, updateRole, deleteRole, getPermissions } from "./role-actions";

export default function RolesPage() {
  const router = useRouter();
  const [roles, setRoles] = useState<any[]>([]);
  const [availablePermissions, setAvailablePermissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [currentRole, setCurrentRole] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<any>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [rolesRes, permRes] = await Promise.all([
        getRoles(),
        getPermissions()
      ]);

      if (!rolesRes.success) {
        const msg = rolesRes.message || "Failed to fetch roles";
        if (msg === "Unauthorized") {
          router.replace('/auth/sign-in');
          return;
        }
        if (msg === "Forbidden") {
          router.replace('/admins-new');
          return;
        }
      }

      if (!permRes.success) {
        const msg = permRes.message || "Failed to fetch permissions";
        if (msg === "Unauthorized") {
          router.replace('/auth/sign-in');
          return;
        }
        if (msg === "Forbidden") {
          router.replace('/admins-new');
          return;
        }
      }

      if (rolesRes.success) setRoles(rolesRes.data || []);
      if (permRes.success) setAvailablePermissions(permRes.data || []);

      if (!rolesRes.success || !permRes.success) {
        toast.error("Failed to synchronize authority matrix");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    const result = await getRoles();
    if (result.success) {
      setRoles(result.data || []);
    }
  };

  const filteredRoles = roles.filter(role => 
    role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddRole = () => {
    setCurrentRole({
      name: '',
      description: '',
      permissionCodes: []
    });
    setIsEditing(false);
    setShowRoleDialog(true);
  };

  const handleEditRole = (role: any) => {
    setCurrentRole({ 
      ...role,
      permissionCodes: role.permissions?.map((p: any) => p.code) || []
    });
    setIsEditing(true);
    setShowRoleDialog(true);
  };

  const handleDeleteClick = (role: any) => {
    setRoleToDelete(role);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!roleToDelete) return;
    
    const res = await deleteRole(roleToDelete.id);
    if (res.success) {
      toast.success("Role decommissioned successfully");
      fetchRoles();
    } else {
      toast.error(res.message);
    }
    setShowDeleteDialog(false);
    setRoleToDelete(null);
  };

  const handleSaveRole = async () => {
    if (!currentRole.name.trim()) {
      toast.error("Role Identity name is required");
      return;
    }

    setIsSaving(true);
    let res;
    if (isEditing) {
      res = await updateRole(currentRole.id, {
        name: currentRole.name,
        description: currentRole.description,
        permissionCodes: currentRole.permissionCodes
      });
    } else {
      res = await createRole({
        name: currentRole.name,
        description: currentRole.description,
        permissionCodes: currentRole.permissionCodes
      });
    }

    if (res.success) {
      toast.success(isEditing ? "Authority matrix updated" : "New role initialized");
      fetchRoles();
      setShowRoleDialog(false);
    } else {
      toast.error(res.message);
    }
    setIsSaving(false);
  };

  const togglePermission = (code: string) => {
    const codes = [...(currentRole.permissionCodes || [])];
    const index = codes.indexOf(code);
    if (index > -1) {
      codes.splice(index, 1);
    } else {
      codes.push(code);
    }
    setCurrentRole({ ...currentRole, permissionCodes: codes });
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-950">
                  Authority Matrix
                </h1>
                <p className="text-sm text-slate-500 font-medium tracking-tight">
                  Define system roles and stakeholder permissions
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <Button
              variant="outline"
              size="sm"
              asChild
              className="rounded-xl border-slate-200 hover:bg-slate-50 h-10 px-4 font-bold text-slate-700"
            >
              <Link href="/admins-new/users">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Identities
              </Link>
            </Button>
            <Button
              onClick={handleAddRole}
              size="sm"
              className="gap-2 bg-slate-900 hover:bg-black text-white shadow-sm border-0 rounded-xl px-5 h-10 font-bold"
            >
              <Plus className="h-4 w-4" />
              Add Authority Role
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl ring-1 ring-slate-200 shadow-sm p-4">
           <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              type="search"
              placeholder="Filter roles by name..."
              className="pl-9 bg-white border-slate-200 rounded-xl focus-visible:ring-slate-950 placeholder:text-slate-400 h-11"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Roles Table */}
        <div className="bg-white rounded-2xl ring-1 ring-slate-200 shadow-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/80 hover:bg-slate-50/80 border-b border-slate-200">
                <TableHead className="text-xs font-bold text-slate-600 uppercase tracking-wider pl-6 py-4">Stakeholder Role</TableHead>
                <TableHead className="text-xs font-bold text-slate-600 uppercase tracking-wider py-4">Access Rights</TableHead>
                <TableHead className="text-xs font-bold text-slate-600 uppercase tracking-wider py-4">Active Users</TableHead>
                <TableHead className="w-[56px] py-4" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-20">
                     <div className="flex flex-col items-center gap-3">
                      <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
                      <p className="text-sm text-slate-500 font-bold uppercase tracking-tight">Syncing Authority Matrix...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredRoles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-20">
                    <p className="font-bold text-slate-400">No roles found in the database</p>
                  </TableCell>
                </TableRow>
              ) : filteredRoles.map((role) => (
                <TableRow key={role.id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-0 group">
                  <TableCell className="pl-6 py-5">
                    <div className="space-y-1">
                      <p className="font-extrabold text-slate-950">{role.name}</p>
                      <p className="text-xs text-slate-500 line-clamp-1">{role.description || 'No description provided'}</p>
                    </div>
                  </TableCell>
                  <TableCell className="py-5">
                    <div className="flex flex-wrap gap-1.5">
                      {role.permissions?.slice(0, 3).map((p: any) => (
                        <Badge key={p.id} variant="outline" className="text-[10px] font-bold border-slate-200 bg-white text-slate-600 uppercase">
                          {p.name}
                        </Badge>
                      ))}
                      {role.permissions?.length > 3 && (
                        <Badge variant="outline" className="text-[10px] font-bold border-slate-200 bg-slate-50 text-indigo-600">
                          +{role.permissions.length - 3} more
                        </Badge>
                      )}
                      {!role.permissions?.length && (
                        <span className="text-[10px] text-slate-400 italic font-medium">No permissions assigned</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-5">
                    <div className="flex items-center gap-2">
                      <p className="font-black text-slate-900">{role._count?.users || 0}</p>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter">Identities</p>
                    </div>
                  </TableCell>
                  <TableCell className="pr-6 py-5 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-900">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 rounded-xl border-slate-200 shadow-xl p-1">
                        <DropdownMenuItem onClick={() => handleEditRole(role)} className="rounded-lg gap-2 cursor-pointer font-bold py-2.5">
                          <Edit className="h-4 w-4 text-indigo-500" /> Edit Access
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDeleteClick(role)} className="rounded-lg gap-2 cursor-pointer font-bold text-red-600 hover:text-red-700 hover:bg-red-50 py-2.5">
                          <Trash className="h-4 w-4" /> Delete Role
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Role Edit/Create Dialog */}
        <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
          <DialogContent className="max-w-2xl rounded-2xl border-slate-200 bg-white shadow-2xl p-0 overflow-hidden">
            <DialogHeader className="p-6 pb-2 bg-white">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-slate-900 shadow-lg shadow-slate-200">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <DialogTitle className="text-xl font-black text-slate-950 uppercase tracking-tight">
                  {isEditing ? 'Configure Access' : 'Register New Stakeholder'}
                </DialogTitle>
              </div>
            </DialogHeader>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="role-name" className="text-sm font-black text-slate-700 uppercase tracking-tighter">Role Identity</Label>
                  <Input
                    id="role-name"
                    value={currentRole?.name || ''}
                    onChange={(e) => setCurrentRole({ ...currentRole, name: e.target.value })}
                    placeholder="e.g. Startup Committee"
                    className="h-11 rounded-xl border-slate-200 focus-visible:ring-slate-950 font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role-desc" className="text-sm font-black text-slate-700 uppercase tracking-tighter">Functional Scope</Label>
                  <Input
                    id="role-desc"
                    value={currentRole?.description || ''}
                    onChange={(e) => setCurrentRole({ ...currentRole, description: e.target.value })}
                    placeholder="Briefly describe what this stakeholder can perform..."
                    className="h-11 rounded-xl border-slate-200 focus-visible:ring-slate-950 font-bold"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4 text-indigo-600" />
                    <Label className="text-sm font-black text-slate-700 uppercase tracking-tighter">Permission Matrix</Label>
                  </div>
                  <Badge variant="outline" className="font-bold text-indigo-600 border-indigo-100 bg-indigo-50">
                    {currentRole?.permissionCodes?.length || 0} Unified Rights
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {availablePermissions.map((perm) => (
                    <div 
                      key={perm.id}
                      className={`relative flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                        currentRole?.permissionCodes?.includes(perm.code) 
                        ? 'border-indigo-500 bg-indigo-50/30' 
                        : 'border-slate-100 bg-slate-50/50 hover:bg-slate-100'
                      }`}
                      onClick={() => togglePermission(perm.code)}
                    >
                      <div className="pt-0.5">
                        <Checkbox 
                          id={perm.code} 
                          checked={currentRole?.permissionCodes?.includes(perm.code)}
                          onCheckedChange={() => togglePermission(perm.code)}
                          className="rounded-md border-slate-300 data-[state=checked]:bg-slate-900"
                        />
                      </div>
                      <div className="space-y-0.5 pointer-events-none">
                        <p className="text-xs font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                          {perm.name}
                          {perm.category && (
                            <span className="text-[8px] px-1 bg-slate-200 text-slate-600 rounded">
                              {perm.category}
                            </span>
                          )}
                        </p>
                        <p className="text-[10px] text-slate-500 font-bold leading-none">{perm.description || 'System standard right'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter className="p-6 bg-slate-50/50 border-t border-slate-100">
              <Button
                variant="outline"
                onClick={() => setShowRoleDialog(false)}
                className="rounded-xl border-slate-200 font-bold px-6"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveRole}
                disabled={isSaving}
                className="rounded-xl bg-slate-900 hover:bg-black text-white px-8 font-black shadow-lg shadow-slate-200"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {isEditing ? 'COMMIT MATRIX' : 'INITIALIZE ROLE'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="max-w-md rounded-2xl border-slate-200 bg-white p-0 overflow-hidden shadow-2xl">
            <div className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <Trash className="h-6 w-6 text-red-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-950 uppercase tracking-tighter">Decommission Role</h3>
                <p className="text-sm text-slate-500 font-bold leading-relaxed">
                  Are you sure you want to remove the <span className="text-slate-900 font-black">{roleToDelete?.name}</span> role from the authority matrix? This will impact all assigned identities.
                </p>
              </div>
            </div>
            <DialogFooter className="p-6 pt-2 bg-slate-50/50 flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
                className="rounded-xl flex-1 border-slate-200 font-bold h-11"
              >
                ABORT
              </Button>
              <Button
                onClick={confirmDelete}
                className="rounded-xl flex-1 bg-red-600 hover:bg-red-700 text-white font-black h-11 shadow-lg shadow-red-100"
              >
                CONFIRM DECOMMISSION
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
}
