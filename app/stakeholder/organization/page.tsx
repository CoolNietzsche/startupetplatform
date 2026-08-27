"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  Search, 
  Edit, 
  Users, 
  Mail, 
  Phone, 
  MapPin, 
  UserPlus, 
  Loader2, 
  ShieldAlert, 
  MoreHorizontal,
  RotateCcw,
  Globe,
  Trash2,
  Key,
  X
} from "lucide-react";
import { 
  getStakeholders, 
  updateStakeholder, 
  addStakeholderAdmin,
  removeStakeholderAdmin,
  resetStakeholderAdminPassword
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
}

export default function StakeholderOrganizationPage() {
  const { data: session } = useSession();
  const stakeholderId = session?.user?.stakeholderId;

  const [stakeholder, setStakeholder] = useState<Stakeholder | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddAdminDialogOpen, setIsAddAdminDialogOpen] = useState(false);
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<StakeholderAdmin | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    website: "",
    email: "",
    phone: "",
    address: "",
    region: "",
  });

  const [adminFormData, setAdminFormData] = useState({
    name: "",
    email: "",
    password: "StartupET@2025",
    role: "Stakeholder Admin",
    showPassword: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchOrganization = useCallback(async () => {
    if (!stakeholderId) return;
    setLoading(true);
    try {
      const res = await getStakeholders({ search: "" });
      if (res.success) {
        const org = res.data?.find(s => s.id === stakeholderId);
        if (org) {
          setStakeholder(org as Stakeholder);
          setFormData({
            name: org.name,
            description: org.description || "",
            website: org.website || "",
            email: org.email || "",
            phone: org.phone || "",
            address: org.address || "",
            region: org.region || ""
          });
        }
      }
    } catch (error) {
      toast.error("Failed to load organization profile");
    } finally {
      setLoading(false);
    }
  }, [stakeholderId]);

  useEffect(() => {
    fetchOrganization();
  }, [fetchOrganization]);

  const handleUpdateProfile = async () => {
    if (!stakeholder) return;
    setIsSubmitting(true);
    try {
      const res = await updateStakeholder(stakeholder.id, { ...formData, type: stakeholder.type, status: stakeholder.status, portalAccess: stakeholder.portalAccess });
      if (res.success) {
        toast.success("Institutional profile updated");
        setIsEditDialogOpen(false);
        fetchOrganization();
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddAdmin = async () => {
    if (!stakeholder) return;
    setIsSubmitting(true);
    try {
      const res = await addStakeholderAdmin(stakeholder.id, adminFormData);
      if (res.success) {
        toast.success("Administrator added");
        setIsAddAdminDialogOpen(false);
        setAdminFormData({ name: "", email: "", password: "StartupET@2025", role: "Stakeholder Admin", showPassword: false });
        fetchOrganization();
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error("Failed to add administrator");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand-mint-teal mb-4" />
        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Synchronizing Records...</p>
      </div>
    );
  }

  if (!stakeholder) {
    return (
      <Card className="p-10 text-center bg-white border-slate-200">
        <ShieldAlert className="h-12 w-12 text-rose-500 mx-auto mb-4" />
        <h2 className="text-2xl font-black text-brand-deep-dark mb-2">Access Denied</h2>
        <p className="text-slate-500 font-medium">Your account is not linked to an active institutional stakeholder.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl lg:text-4xl font-black tracking-tighter text-brand-deep-dark">
            Organization <span className="text-brand-mint-teal italic">Profile</span>
          </h1>
          <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.2em]">
            Institutional Root Node: {stakeholder.id.slice(0, 8)}
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={() => setIsEditDialogOpen(true)}
            variant="outline"
            className="border-2 border-slate-200 font-bold h-10 px-6 rounded-xl hover:bg-slate-50"
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
          <Button 
            onClick={() => setIsAddAdminDialogOpen(true)}
            className="bg-brand-mint-teal hover:bg-brand-mint-teal/90 text-white font-bold h-10 px-6 rounded-xl shadow-lg shadow-brand-mint-teal/20"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Add Coordinator
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1 border border-slate-200 shadow-xl bg-white overflow-hidden rounded-3xl">
          <div className="h-24 bg-brand-deep-dark relative">
             <div className="absolute inset-0 bg-gradient-to-r from-brand-deep-dark to-slate-800 opacity-90" />
             <div className="absolute -bottom-10 left-6">
                <Avatar className="h-20 w-20 border-4 border-white shadow-xl bg-white">
                  <AvatarFallback className="bg-brand-mint-teal text-white text-2xl font-black">
                    {stakeholder.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
             </div>
          </div>
          <CardContent className="pt-14 space-y-6 flex flex-col items-center text-center">
            <div>
              <h2 className="text-2xl font-black tracking-tighter text-brand-deep-dark">{stakeholder.name}</h2>
              <Badge className="mt-2 bg-slate-100 text-slate-700 font-bold">{stakeholder.type}</Badge>
            </div>
            
            <div className="w-full space-y-4 pt-4 border-t border-slate-100 text-left">
               <div className="flex items-center gap-3">
                 <Globe className="h-4 w-4 text-brand-mint-teal" />
                 <span className="text-sm font-bold text-slate-600">{stakeholder.website || 'No website provided'}</span>
               </div>
               <div className="flex items-center gap-3">
                 <Mail className="h-4 w-4 text-brand-mint-teal" />
                 <span className="text-sm font-bold text-slate-600">{stakeholder.email}</span>
               </div>
               <div className="flex items-center gap-3">
                 <Phone className="h-4 w-4 text-brand-mint-teal" />
                 <span className="text-sm font-bold text-slate-600">{stakeholder.phone}</span>
               </div>
               <div className="flex items-center gap-3">
                 <MapPin className="h-4 w-4 text-brand-mint-teal" />
                 <span className="text-sm font-bold text-slate-600">{stakeholder.address}, {stakeholder.region}</span>
               </div>
            </div>
          </CardContent>
        </Card>

        {/* Admins Table */}
        <Card className="lg:col-span-2 border border-slate-200 shadow-xl bg-white rounded-3xl">
          <CardHeader className="border-b border-slate-50 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-black tracking-tight text-brand-deep-dark">Platform Coordinators</CardTitle>
              <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Institutional Level Administrators</CardDescription>
            </div>
            <Users className="h-6 w-6 text-brand-startup-amber" />
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-bold text-[10px] uppercase tracking-wider pl-8">Name</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase tracking-wider">Email</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase tracking-wider">Status</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stakeholder.admins.map((admin) => (
                  <TableRow key={admin.id} className="group hover:bg-slate-50 transition-colors">
                    <TableCell className="pl-8 py-4">
                      <p className="font-bold text-brand-deep-dark">{admin.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{admin.role}</p>
                    </TableCell>
                    <TableCell className="text-sm font-medium text-slate-600">{admin.email}</TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-700 font-bold text-[10px] px-2 shadow-sm shadow-green-100">ACTIVE</Badge>
                    </TableCell>
                    <TableCell className="pr-8">
                       <DropdownMenu>
                         <DropdownMenuTrigger asChild>
                           <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-200 rounded-lg">
                             <MoreHorizontal className="h-4 w-4" />
                           </Button>
                         </DropdownMenuTrigger>
                         <DropdownMenuContent align="end" className="bg-white rounded-xl border-slate-100 shadow-2xl font-semibold">
                            <DropdownMenuItem 
                              onClick={() => {
                                setSelectedAdmin(admin);
                                setIsResetPasswordDialogOpen(true);
                              }}
                              className="focus:bg-amber-50"
                            >
                              <Key className="h-4 w-4 mr-2 text-brand-startup-amber" />
                              Change Password
                            </DropdownMenuItem>
                         </DropdownMenuContent>
                       </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-xl bg-white rounded-3xl p-0 overflow-hidden shadow-2xl">
          <DialogHeader className="bg-slate-50 px-8 py-6 border-b border-slate-100">
            <DialogTitle className="text-xl font-black text-brand-deep-dark">Edit Institutional Profile</DialogTitle>
          </DialogHeader>
          <div className="px-8 py-6 grid gap-4">
            <div className="grid gap-2">
              <Label className="text-xs font-bold text-slate-500 uppercase">Organization Name</Label>
              <Input 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="rounded-xl border-slate-200 focus:ring-brand-mint-teal"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-xs font-bold text-slate-500 uppercase">Mandate / Bio</Label>
              <Input 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="rounded-xl border-slate-200 focus:ring-brand-mint-teal"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-xs font-bold text-slate-500 uppercase">Website</Label>
                <Input value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} className="rounded-xl" />
              </div>
              <div className="grid gap-2">
                <Label className="text-xs font-bold text-slate-500 uppercase">Email</Label>
                <Input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="rounded-xl" />
              </div>
            </div>
          </div>
          <DialogFooter className="px-8 py-6 border-t border-slate-100 bg-slate-50">
             <Button variant="ghost" onClick={() => setIsEditDialogOpen(false)} className="font-bold text-slate-500">Cancel</Button>
             <Button onClick={handleUpdateProfile} disabled={isSubmitting} className="bg-brand-mint-teal text-white font-bold px-8 rounded-xl shadow-lg shadow-brand-mint-teal/20">
               {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Save Changes"}
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Admin Dialog */}
      <Dialog open={isAddAdminDialogOpen} onOpenChange={setIsAddAdminDialogOpen}>
        <DialogContent className="max-w-md bg-white rounded-3xl p-0 overflow-hidden shadow-2xl">
          <DialogHeader className="bg-brand-deep-dark px-8 py-6 text-white">
            <DialogTitle className="text-xl font-black">Add System Coordinator</DialogTitle>
            <DialogDescription className="text-white/60 font-medium">Grant administrative access to your institution.</DialogDescription>
          </DialogHeader>
          <div className="p-8 space-y-4">
            <div className="grid gap-2">
              <Label className="font-bold">Full Name</Label>
              <Input placeholder="John Doe" value={adminFormData.name} onChange={e => setAdminFormData({...adminFormData, name: e.target.value})} className="rounded-xl" />
            </div>
            <div className="grid gap-2">
              <Label className="font-bold">Official Email</Label>
              <Input type="email" placeholder="john.doe@org.gov.et" value={adminFormData.email} onChange={e => setAdminFormData({...adminFormData, email: e.target.value})} className="rounded-xl" />
            </div>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
              <ShieldAlert className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[11px] font-bold text-slate-600">The coordinator will be created with the system default password: <span className="text-brand-startup-amber font-black">StartupET@2025</span></p>
            </div>
          </div>
          <DialogFooter className="p-8 pt-0">
             <Button onClick={handleAddAdmin} disabled={isSubmitting} className="w-full h-12 bg-brand-startup-amber text-white font-black text-md rounded-2xl shadow-xl shadow-brand-startup-amber/20">
               {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Verify & Authorize"}
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={isResetPasswordDialogOpen} onOpenChange={setIsResetPasswordDialogOpen}>
        <DialogContent className="max-w-md bg-white rounded-3xl p-0 overflow-hidden shadow-2xl">
          <DialogHeader className="bg-brand-startup-amber px-8 py-6 text-white text-center">
            <Key className="h-10 w-10 mx-auto mb-3 opacity-90" />
            <DialogTitle className="text-xl font-black">Change Coordinator Password</DialogTitle>
            <DialogDescription className="text-white/80 font-medium">Manually define new credentials for {selectedAdmin?.name}</DialogDescription>
          </DialogHeader>
          <div className="p-8 space-y-4">
            <div className="grid gap-2">
              <Label className="font-bold text-slate-700">New Password</Label>
              <Input 
                type="password" 
                placeholder="Enter strong password..." 
                value={adminFormData.password === "StartupET@2025" ? "" : adminFormData.password} 
                onChange={e => setAdminFormData({...adminFormData, password: e.target.value})} 
                className="rounded-xl border-slate-200 focus:ring-brand-startup-amber" 
              />
            </div>
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-start gap-3">
              <ShieldAlert className="h-5 w-5 text-brand-startup-amber mt-0.5" />
              <p className="text-[11px] font-bold text-slate-500 leading-relaxed">
                Security Policy: Password changes are logged for institutional audit. Ensure the coordinator is notified of their new credentials securely.
              </p>
            </div>
          </div>
          <DialogFooter className="p-8 pt-0">
             <Button 
               onClick={async () => {
                 if (!selectedAdmin || !adminFormData.password) return;
                 setIsSubmitting(true);
                 try {
                   const res = await resetStakeholderAdminPassword(selectedAdmin.id, adminFormData.password);
                   if (res.success) {
                     toast.success("Coordinator password updated successfully");
                     setIsResetPasswordDialogOpen(false);
                     setAdminFormData(prev => ({ ...prev, password: "StartupET@2025" }));
                   } else {
                     toast.error(res.message);
                   }
                 } catch (error) {
                   toast.error("Failed to update password");
                 } finally {
                   setIsSubmitting(false);
                 }
               }} 
               disabled={isSubmitting || !adminFormData.password} 
               className="w-full h-12 bg-brand-deep-dark text-white font-black text-md rounded-2xl shadow-xl shadow-brand-deep-dark/20 flex items-center justify-center"
             >
               {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Confirm New Credentials"}
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
