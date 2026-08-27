"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Shield,
  Check,
  X,
  Save,
  Loader2
} from "lucide-react";
import { getAccessControlData, updateRolePermissions } from "./actions";
import { toast } from "sonner";

interface Permission {
  id: string; // This is the permission code
  name: string;
  description: string;
  category: string;
}

interface RolePermissions {
  id: string; // Role database ID
  role: string; // Role name
  permissions: { [key: string]: boolean };
}

export default function AccessControlPage() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermissions[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await getAccessControlData();
      if (result.success) {
        setPermissions(result.permissions || []);
        setRolePermissions(result.roles || []);
        if (result.roles && result.roles.length > 0) {
          // Find Admin or Super Admin if available, else first role
          const initialRole = result.roles.find((r: any) => r.role.toLowerCase() === "admin") ||
            result.roles.find((r: any) => r.role.toLowerCase() === "super admin") ||
            result.roles[0];
          setSelectedRole(initialRole.role);
        }
      } else {
        toast.error(result.message || "Failed to fetch access control data");
      }
    } catch (err) {
      toast.error("An error occurred while fetching data");
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionToggle = (permissionId: string) => {
    setRolePermissions(rolePermissions.map(rp =>
      rp.role === selectedRole
        ? {
          ...rp,
          permissions: {
            ...rp.permissions,
            [permissionId]: !rp.permissions[permissionId]
          }
        }
        : rp
    ));
  };

  const handleSavePermissions = async () => {
    const currentRole = rolePermissions.find(rp => rp.role === selectedRole);
    if (!currentRole) return;

    setSaving(true);
    try {
      const selectedPermissionCodes = Object.entries(currentRole.permissions)
        .filter(([_, granted]) => granted)
        .map(([code, _]) => code);

      const result = await updateRolePermissions(currentRole.id, selectedPermissionCodes);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      toast.error("An error occurred while saving permissions");
    } finally {
      setSaving(false);
    }
  };

  const getRoleLabel = (role: string) => {
    return role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const currentRolePermissions = rolePermissions.find(rp => rp.role === selectedRole);

  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as { [key: string]: Permission[] });

  const getPermissionCount = (role: string) => {
    const rp = rolePermissions.find(r => r.role === role);
    if (!rp) return 0;
    return Object.values(rp.permissions).filter(Boolean).length;
  };

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-brand-deep-dark">Access Control</h1>
        </div>
        <Button
          onClick={handleSavePermissions}
          disabled={saving}
          className="bg-brand-startup-amber hover:bg-brand-startup-amber/90 text-white font-bold h-12 px-8 rounded-xl shadow-lg shadow-brand-startup-amber/20 transition-all hover:scale-105 active:scale-95"
        >
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Configuration
        </Button>
      </div>

      {/* Role Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {rolePermissions.map((rp) => {
          const isSuperAdmin = rp.role.toLowerCase() === "super admin" || rp.role === "SUPER_ADMIN";
          return (
            <Card key={rp.id} className={`border-2 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 relative overflow-hidden ${isSuperAdmin ? 'bg-gradient-to-br from-brand-deep-dark to-slate-900 border-brand-deep-dark' : 'bg-gradient-to-br from-brand-mint-teal/5 to-brand-mint-teal/20 border-brand-mint-teal/20'}`}>
              <div className="flex flex-col relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${isSuperAdmin ? 'text-white/60' : 'text-brand-deep-dark/60'}`}>
                    {getRoleLabel(rp.role)}
                  </span>
                  <Shield className={`h-4 w-4 ${isSuperAdmin ? 'text-brand-startup-amber' : 'text-brand-mint-teal'}`} />
                </div>
                <div className={`text-3xl font-black tracking-tight ${isSuperAdmin ? 'text-white' : 'text-brand-deep-dark'}`}>
                  {getPermissionCount(rp.role)}
                </div>
                <p className={`text-[9px] font-bold italic leading-none mt-1 ${isSuperAdmin ? 'text-brand-startup-amber' : 'text-brand-mint-teal'}`}>
                  Permissions Granted
                </p>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Discovery Terminal / Permissions Editor */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card className="rounded-3xl border border-slate-100 shadow-sm bg-white overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4 pt-6 px-6">
              <CardTitle className="text-lg font-bold text-brand-deep-dark">Active Role</CardTitle>
              <CardDescription className="text-xs font-semibold text-slate-500">
                Select a role to modify its access list
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <Label htmlFor="role-select" className="text-xs font-bold text-brand-deep-dark pl-1">Target Role</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-full h-12 bg-white border border-slate-200 rounded-xl font-bold text-brand-deep-dark px-4 mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white rounded-xl border border-slate-100 shadow-2xl z-[150]">
                  {rolePermissions.map((rp) => (
                    <SelectItem key={rp.id} value={rp.role} className="font-semibold cursor-pointer">
                      {getRoleLabel(rp.role)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {(selectedRole.toLowerCase() === "super admin" || selectedRole.toLowerCase() === "super_admin") && (
                <div className="mt-6 p-4 bg-brand-startup-amber/10 border border-brand-startup-amber/20 rounded-2xl flex items-start gap-3">
                  <Shield className="h-5 w-5 text-brand-startup-amber shrink-0 mt-0.5" />
                  <p className="text-xs font-bold text-brand-startup-amber leading-relaxed">
                    Super Admin role has immutable root access to all system permissions. Modifiers are disabled.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="rounded-3xl border border-slate-100 shadow-sm bg-white overflow-hidden h-full">
            <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4 pt-6 px-6">
              <CardTitle className="text-lg font-bold text-brand-deep-dark">Access Configuration</CardTitle>
              <CardDescription className="text-xs font-semibold text-slate-500">
                Toggle capabilities for the selected role
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-8 max-h-[600px] overflow-y-auto">
              {Object.entries(groupedPermissions).map(([category, perms]) => (
                <div key={category} className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    <h3 className="text-xs font-black uppercase text-brand-deep-dark tracking-wider">{category}</h3>
                    <div className="h-px bg-slate-100 flex-1"></div>
                  </div>
                  <div className="grid gap-0 -mx-2">
                    {perms.map((permission) => {
                      const isGranted = currentRolePermissions?.permissions[permission.id] || false;
                      const isDisabled = selectedRole.toLowerCase() === "super admin" || selectedRole.toLowerCase() === "super_admin";
                      return (
                        <div
                          key={permission.id}
                          className={`flex items-center justify-between px-4 py-1.5 rounded-lg border-b border-transparent transition-all duration-200 ${isGranted ? 'bg-brand-mint-teal/5' : 'hover:bg-slate-50'}`}
                        >
                          <div className="flex-1 pr-4">
                            <div className="flex items-center gap-3">
                              <Label htmlFor={permission.id} className="font-bold text-sm text-brand-deep-dark cursor-pointer">
                                {permission.name}
                              </Label>
                              {isGranted ? (
                                <Badge className="bg-brand-mint-teal text-white hover:bg-brand-mint-teal border-none text-[9px] px-2 h-5 rounded-md">
                                  GRANTED
                                </Badge>
                              ) : (
                                <Badge className="bg-slate-100 text-slate-500 hover:bg-slate-200 border-none text-[9px] px-2 h-5 rounded-md">
                                  DENIED
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Switch
                            id={permission.id}
                            checked={isGranted}
                            onCheckedChange={() => handlePermissionToggle(permission.id)}
                            disabled={isDisabled}
                            className="data-[state=checked]:bg-brand-mint-teal"
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Permission Matrix */}
      <Card className="rounded-3xl border border-slate-100 shadow-sm bg-white overflow-hidden">
        <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4 pt-6 px-6">
          <CardTitle className="text-lg font-bold text-brand-deep-dark">Global Permission Matrix</CardTitle>
          <CardDescription className="text-xs font-semibold text-slate-500">
            Cross-sectional view of access across all roles
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="whitespace-nowrap min-w-full">
              <TableHeader className="bg-brand-mint-teal/[0.03] border-b border-brand-mint-teal/10">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-bold text-xs text-brand-deep-dark uppercase tracking-wider h-14 pl-6">Permission Module</TableHead>
                  {rolePermissions.map((rp) => (
                    <TableHead key={rp.id} className="font-bold text-xs text-brand-deep-dark uppercase tracking-wider text-center h-14">
                      {getRoleLabel(rp.role)}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {permissions.map((permission) => (
                  <TableRow key={permission.id} className="hover:bg-slate-50/50 transition-colors cursor-default border-b border-slate-100">
                    <TableCell className="pl-6 py-1.5">
                      <div className="font-bold text-base text-brand-deep-dark">{permission.name}</div>
                    </TableCell>
                    {rolePermissions.map((rp) => (
                      <TableCell key={rp.id} className="py-1.5">
                        <div className="flex justify-center">
                          {rp.permissions[permission.id] ? (
                            <div className="h-8 w-8 rounded-full bg-brand-mint-teal/10 flex items-center justify-center">
                              <Check className="h-5 w-5 text-brand-mint-teal" strokeWidth={3} />
                            </div>
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                              <X className="h-4 w-4 text-slate-500" strokeWidth={3} />
                            </div>
                          )}
                        </div>
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
