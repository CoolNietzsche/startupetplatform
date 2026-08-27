"use client";

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Calendar, 
  Edit, 
  Shield, 
  LogOut, 
  Lock,
  Activity,
  Info,
  Eye,
  EyeOff,
  History,
  Check,
  Settings,
  FileText,
  Users,
  Building,
  Database,
  BarChart,
  CreditCard,
  Key,
  Loader2
} from 'lucide-react';

import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect } from 'react';
import { getUserById, updateUser } from '../user-actions';
import { getRoles } from '../../roles/role-actions';
import { toast } from 'sonner';
import { Checkbox } from "@/components/ui/checkbox";

// Role templates with predefined permissions
const ROLE_TEMPLATES = {
  administrator: {
    label: 'Administrator',
    description: 'Full access to all system features',
    icon: <Shield className="h-4 w-4 mr-2 text-primary" />,
    permissions: {
      // Fill all permissions as true
      viewUsers: true,
      createUsers: true,
      editUsers: true,
      deleteUsers: true,
      manageRoles: true,
      viewStartups: true,
      createStartups: true,
      editStartups: true,
      deleteStartups: true,
      approveStartups: true,
      viewEcosystem: true,
      createEcosystem: true,
      editEcosystem: true,
      deleteEcosystem: true,
      viewReports: true,
      createReports: true,
      exportReports: true,
      viewSettings: true,
      editSettings: true,
      viewFinancials: true,
      manageTransactions: true,
      approvePayments: true,
      viewCertifications: true,
      issueCertifications: true,
      revokeCertifications: true,
      viewDocuments: true,
      uploadDocuments: true,
      deleteDocuments: true
    }
  },
  manager: {
    label: 'Manager',
    description: 'Can manage most features but cannot modify system settings',
    icon: <Users className="h-4 w-4 mr-2 text-indigo-600" />,
    permissions: {
      // Mix of permissions
      viewUsers: true,
      createUsers: true,
      editUsers: true,
      deleteUsers: false,
      manageRoles: false,
      viewStartups: true,
      createStartups: true,
      editStartups: true,
      deleteStartups: false,
      approveStartups: true,
      viewEcosystem: true,
      createEcosystem: true,
      editEcosystem: true,
      deleteEcosystem: false,
      viewReports: true,
      createReports: true,
      exportReports: true,
      viewSettings: true,
      editSettings: false,
      viewFinancials: true,
      manageTransactions: true,
      approvePayments: false,
      viewCertifications: true,
      issueCertifications: true,
      revokeCertifications: false,
      viewDocuments: true,
      uploadDocuments: true,
      deleteDocuments: false
    }
  },
  reviewer: {
    label: 'Reviewer',
    description: 'Can review and process applications within assigned department',
    icon: <Eye className="h-4 w-4 mr-2 text-green-600" />,
    permissions: {
      // Limited to review-related permissions
      viewUsers: false,
      createUsers: false,
      editUsers: false,
      deleteUsers: false,
      manageRoles: false,
      viewStartups: true,
      createStartups: false,
      editStartups: false,
      deleteStartups: false,
      approveStartups: false,
      viewEcosystem: false,
      createEcosystem: false,
      editEcosystem: false,
      deleteEcosystem: false,
      viewReports: false,
      createReports: false,
      exportReports: false,
      viewSettings: false,
      editSettings: false,
      viewFinancials: false,
      manageTransactions: false,
      approvePayments: false,
      viewCertifications: true,
      issueCertifications: false,
      revokeCertifications: false,
      viewDocuments: true,
      uploadDocuments: true,
      deleteDocuments: false
    }
  },
  analyst: {
    label: 'Analyst',
    description: 'Can view and generate reports only',
    icon: <BarChart className="h-4 w-4 mr-2 text-blue-600" />,
    permissions: {
      // Report-focused permissions
      viewUsers: false,
      createUsers: false,
      editUsers: false,
      deleteUsers: false,
      manageRoles: false,
      viewStartups: true,
      createStartups: false,
      editStartups: false,
      deleteStartups: false,
      approveStartups: false,
      viewEcosystem: true,
      createEcosystem: false,
      editEcosystem: false,
      deleteEcosystem: false,
      viewReports: true,
      createReports: true,
      exportReports: true,
      viewSettings: false,
      editSettings: false,
      viewFinancials: false,
      manageTransactions: false,
      approvePayments: false,
      viewCertifications: false,
      issueCertifications: false,
      revokeCertifications: false,
      viewDocuments: true,
      uploadDocuments: false,
      deleteDocuments: false
    }
  },
  readOnly: {
    label: 'Read Only',
    description: 'View-only access to system data',
    icon: <EyeOff className="h-4 w-4 mr-2 text-gray-600" />,
    permissions: {
      // View-only permissions
      viewUsers: false,
      createUsers: false,
      editUsers: false,
      deleteUsers: false,
      manageRoles: false,
      viewStartups: true,
      createStartups: false,
      editStartups: false,
      deleteStartups: false,
      approveStartups: false,
      viewEcosystem: true,
      createEcosystem: false,
      editEcosystem: false,
      deleteEcosystem: false,
      viewReports: true,
      createReports: false,
      exportReports: false,
      viewSettings: false,
      editSettings: false,
      viewFinancials: false,
      manageTransactions: false,
      approvePayments: false,
      viewCertifications: false,
      issueCertifications: false,
      revokeCertifications: false,
      viewDocuments: true,
      uploadDocuments: false,
      deleteDocuments: false
    }
  }
};

// Define permission categories for grouping
const PERMISSION_CATEGORIES = [
  {
    id: 'users',
    name: 'Users & Access Management',
    icon: <Users className="h-4 w-4" />,
    permissions: [
      { id: 'viewUsers', name: 'View Users', description: 'Can view user list and profiles' },
      { id: 'createUsers', name: 'Create Users', description: 'Can add new users to the system' },
      { id: 'editUsers', name: 'Edit Users', description: 'Can modify existing user accounts' },
      { id: 'deleteUsers', name: 'Delete Users', description: 'Can remove users from the system' },
      { id: 'manageRoles', name: 'Manage Roles', description: 'Can assign and modify user roles' }
    ]
  },
  {
    id: 'startups',
    name: 'Startup Management',
    icon: <Building className="h-4 w-4" />,
    permissions: [
      { id: 'viewStartups', name: 'View Startups', description: 'Can view startup information' },
      { id: 'createStartups', name: 'Create Startups', description: 'Can add new startups to the system' },
      { id: 'editStartups', name: 'Edit Startups', description: 'Can modify startup information' },
      { id: 'deleteStartups', name: 'Delete Startups', description: 'Can remove startups from the system' },
      { id: 'approveStartups', name: 'Approve Startups', description: 'Can approve new startup applications' }
    ]
  },
  {
    id: 'ecosystem',
    name: 'Ecosystem Management',
    icon: <Building className="h-4 w-4" />,
    permissions: [
      { id: 'viewEcosystem', name: 'View Ecosystem', description: 'Can view ecosystem builder information' },
      { id: 'createEcosystem', name: 'Create Ecosystem', description: 'Can add new ecosystem builders' },
      { id: 'editEcosystem', name: 'Edit Ecosystem', description: 'Can modify ecosystem builder information' },
      { id: 'deleteEcosystem', name: 'Delete Ecosystem', description: 'Can remove ecosystem builders' }
    ]
  },
  {
    id: 'reports',
    name: 'Reports & Analytics',
    icon: <BarChart className="h-4 w-4" />,
    permissions: [
      { id: 'viewReports', name: 'View Reports', description: 'Can access system reports' },
      { id: 'createReports', name: 'Create Reports', description: 'Can generate new reports' },
      { id: 'exportReports', name: 'Export Reports', description: 'Can export/download reports' }
    ]
  },
  {
    id: 'settings',
    name: 'System Settings',
    icon: <Settings className="h-4 w-4" />,
    permissions: [
      { id: 'viewSettings', name: 'View Settings', description: 'Can view system settings' },
      { id: 'editSettings', name: 'Edit Settings', description: 'Can modify system settings' }
    ]
  },
  {
    id: 'financial',
    name: 'Financial Management',
    icon: <CreditCard className="h-4 w-4" />,
    permissions: [
      { id: 'viewFinancials', name: 'View Financials', description: 'Can view financial information' },
      { id: 'manageTransactions', name: 'Manage Transactions', description: 'Can process financial transactions' },
      { id: 'approvePayments', name: 'Approve Payments', description: 'Can approve payment requests' }
    ]
  },
  {
    id: 'certification',
    name: 'Certification Program',
    icon: <Check className="h-4 w-4" />,
    permissions: [
      { id: 'viewCertifications', name: 'View Certifications', description: 'Can view certification information' },
      { id: 'issueCertifications', name: 'Issue Certifications', description: 'Can issue new certifications' },
      { id: 'revokeCertifications', name: 'Revoke Certifications', description: 'Can revoke existing certifications' }
    ]
  },
  {
    id: 'documents',
    name: 'Document Management',
    icon: <FileText className="h-4 w-4" />,
    permissions: [
      { id: 'viewDocuments', name: 'View Documents', description: 'Can view system documents' },
      { id: 'uploadDocuments', name: 'Upload Documents', description: 'Can upload new documents' },
      { id: 'deleteDocuments', name: 'Delete Documents', description: 'Can delete existing documents' }
    ]
  }
];

export default function UserDetailPage() {
  const params = useParams();
  const userId = params.id as string;
  
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showResetPasswordDialog, setShowResetPasswordDialog] = useState(false);
  const [editedUser, setEditedUser] = useState<any>(null);
  const [permissions, setPermissions] = useState<any>({});
  const [selectedRoleTemplate, setSelectedRoleTemplate] = useState("");
  const [showPermissionHistory, setShowPermissionHistory] = useState(false);

  const [availableRoles, setAvailableRoles] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [res, rolesRes] = await Promise.all([
        getUserById(userId),
        getRoles()
      ]);

      if (res.success) {
        const userData = res.data as any;
        setUser(userData);
        setEditedUser({
          ...userData,
          roles: userData.roles?.map((r: any) => r.id) || []
        });
        setPermissions(userData.customPermissions || {});
      } else {
        toast.error("Failed to load user: " + res.message);
      }

      if (rolesRes.success) {
        setAvailableRoles(rolesRes.data || []);
      }

      setLoading(false);
    };
    fetchData();
  }, [userId]);
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };
  
const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};
  
  // Handle permission change
  const handlePermissionChange = (key: string, value: boolean) => {
    setPermissions({
      ...permissions,
      [key]: value
    });
  };
  
  // Apply a role template to the user's permissions
  const applyRoleTemplate = (roleId: string) => {
    if (roleId && ROLE_TEMPLATES[roleId as keyof typeof ROLE_TEMPLATES]) {
      const templatePermissions = ROLE_TEMPLATES[roleId as keyof typeof ROLE_TEMPLATES].permissions;
      setPermissions({...templatePermissions});
      setSelectedRoleTemplate(roleId);
    }
  };
  
  // Save user changes
  const saveChanges = async () => {
    const res = await updateUser(userId, {
      firstName: editedUser.firstName,
      lastName: editedUser.lastName,
      phoneNumber: editedUser.phoneNumber,
      role: editedUser.role,
      roles: editedUser.roles,
    });
    
    if (res.success) {
      toast.success("User updated successfully");
      setIsEditing(false);
      // Refresh user data
      const updated = await getUserById(userId);
      if (updated.success) {
        setUser(updated.data);
        setEditedUser({
          ...updated.data,
          roles: updated.data.roles?.map((r: any) => r.id) || []
        });
      }
    } else {
      toast.error(res.message || "Failed to update user");
    }
  };
  
  // Reset password
  const handleResetPassword = () => {
    // In a real app, this would call an API to reset the password
    setShowResetPasswordDialog(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
        <p className="text-slate-500 font-black tracking-tight uppercase">Accessing Identity Vault...</p>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="container py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">User Not Found</h1>
        <p className="text-muted-foreground mb-6">The user you are looking for does not exist or you don&apos;t have permission to view it.</p>
        <Button asChild>
          <Link href="/admins-new/users">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Users
          </Link>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container py-8">
      {/* Back button and actions */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admins-new/users">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Users
          </Link>
        </Button>
        
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={saveChanges}>
                Save Changes
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setShowResetPasswordDialog(true)}>
                <Lock className="mr-2 h-4 w-4" />
                Reset Password
              </Button>
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit User
              </Button>
            </>
          )}
        </div>
      </div>
      
      {/* User profile header */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <Avatar className="h-24 w-24 border-4 border-white shadow-xl">
              {user.avatar ? (
                <AvatarImage src={user.avatar} alt={`${user.firstName} ${user.lastName}`} />
              ) : (
                <AvatarFallback className="text-2xl font-black bg-slate-900 text-white">
                  {user.firstName[0]}{user.lastName?.[0] || ''}
                </AvatarFallback>
              )}
            </Avatar>
            
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                <h1 className="text-3xl font-black tracking-tight text-slate-950">
                  {user.firstName} {user.lastName}
                </h1>
                <div className="flex items-center gap-2 md:ml-2">
                  <Badge 
                    variant={user.isSuspended ? 'destructive' : 'default'}
                    className={!user.isSuspended ? 'bg-emerald-500 hover:bg-emerald-600 text-white font-bold' : 'font-bold'}
                  >
                    {user.isSuspended ? 'SUSPENDED' : 'ACTIVE'}
                  </Badge>
                  {user.emailVerified ? (
                    <Badge className="bg-blue-500 text-white font-bold">VERIFIED</Badge>
                  ) : (
                    <Badge variant="outline" className="border-slate-300 text-slate-500 font-bold">UNVERIFIED</Badge>
                  )}
                </div>
              </div>
              
              <div className="text-sm font-bold text-slate-400 font-mono tracking-tighter uppercase mb-4">
                ID: {user.id}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 mt-3">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-slate-400" />
                  {isEditing ? (
                    <div className="flex gap-2">
                       <Input 
                        value={editedUser.firstName} 
                        onChange={(e) => setEditedUser({...editedUser, firstName: e.target.value})}
                        className="h-8 w-[120px] rounded-lg"
                        placeholder="First Name"
                      />
                       <Input 
                        value={editedUser.lastName} 
                        onChange={(e) => setEditedUser({...editedUser, lastName: e.target.value})}
                        className="h-8 w-[120px] rounded-lg"
                        placeholder="Last Name"
                      />
                    </div>
                  ) : (
                    <span className="text-slate-700 font-medium">{user.email}</span>
                  )}
                </div>
                
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-slate-400" />
                  {isEditing ? (
                    <Input 
                      value={editedUser.phoneNumber} 
                      onChange={(e) => setEditedUser({...editedUser, phoneNumber: e.target.value})}
                      className="h-8 w-[180px] rounded-lg"
                    />
                  ) : (
                    <span className="text-slate-700 font-medium">{user.phoneNumber || 'N/A'}</span>
                  )}
                </div>
                
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-slate-400" />
                  <span className="text-slate-700 font-medium whitespace-nowrap">Joined {formatDate(user.createdAt)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-center justify-center bg-muted p-4 rounded">
              <div className="text-sm text-muted-foreground mb-1">Role</div>
              <div className="flex items-center mb-1">
                <Shield className="h-5 w-5 mr-2 text-primary" />
                <span className="font-semibold capitalize">
                  {user.role}
                </span>
              </div>
              <div className="flex flex-wrap gap-1 justify-center max-w-[150px]">
                {user.roles?.map((r: any) => (
                  <Badge key={r.id} variant="outline" className="text-[9px] font-bold border-slate-200 bg-white text-slate-500 uppercase py-0 px-1.5">
                    {r.name}
                  </Badge>
                ))}
              </div>
              <div className="text-sm">{user.department}</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Tabs for different sections */}
      <Tabs defaultValue="activity">
        <TabsList className="mb-8">
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="security">Security & Permissions</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        
        {/* Activity tab */}
        <TabsContent value="activity">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Login history */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Logins</CardTitle>
                <CardDescription>User login activity history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {user.loginHistory?.map((login: any, index: number) => (
                    <div key={index} className="flex items-start">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 shrink-0">
                        <LogOut className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">{login.action === 'login' ? 'Logged in' : 'Logged out'}</div>
                        <div className="text-sm text-muted-foreground">{formatDateTime(login.timestamp)}</div>
                        <div className="text-xs mt-1">
                          {login.device} • IP: {login.ip}
                        </div>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-6">
                      <p className="text-sm text-slate-400 italic">No recent login history recorded</p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full">
                  View All Login History
                </Button>
              </CardFooter>
            </Card>
            
            {/* Activity log */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Activity Log</CardTitle>
                <CardDescription>Recent actions taken by this user</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {user.activityLog?.map((activity: any, index: number) => (
                    <div key={index} className="flex items-start">
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mr-3 shrink-0">
                        <Activity className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium">{activity.action}</div>
                        <div className="text-sm text-muted-foreground">{formatDateTime(activity.timestamp)}</div>
                        <div className="text-xs mt-1">
                          {activity.target}
                        </div>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-6">
                      <p className="text-sm text-slate-400 italic">No recent activities recorded</p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full">
                  View Complete Activity Log
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        {/* Security & Permissions tab */}
        <TabsContent value="security">
          <div className="space-y-8">
            {/* Role template selector */}
            <Card>
              <CardHeader className="px-6 pt-6 pb-4">
                <CardTitle className="text-lg">Role Template</CardTitle>
                <CardDescription>Apply a predefined role template to set permissions</CardDescription>
              </CardHeader>
              <CardContent className="px-6 py-4">
                <div className="space-y-4">
                  <div className="flex space-x-4">
                    <div className="flex-1">
                      <Select 
                        value={selectedRoleTemplate} 
                        onValueChange={applyRoleTemplate}
                        disabled={!isEditing}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role template" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(ROLE_TEMPLATES).map(([id, template]) => (
                            <SelectItem key={id} value={id}>
                              <div className="flex items-center">
                                {template.icon}
                                <span>{template.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {isEditing && selectedRoleTemplate && (
                      <Button 
                        variant="outline" 
                        onClick={() => setSelectedRoleTemplate("")}
                        size="sm"
                      >
                        Clear Template
                      </Button>
                    )}
                  </div>
                  
                  {selectedRoleTemplate && (
                    <div className="bg-muted p-4 rounded-md">
                      <div className="flex items-center mb-2">
                        {ROLE_TEMPLATES[selectedRoleTemplate as keyof typeof ROLE_TEMPLATES].icon}
                        <span className="font-medium">{ROLE_TEMPLATES[selectedRoleTemplate as keyof typeof ROLE_TEMPLATES].label}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {ROLE_TEMPLATES[selectedRoleTemplate as keyof typeof ROLE_TEMPLATES].description}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Dynamic Authority Roles */}
            <Card>
              <CardHeader className="px-6 pt-6 pb-4">
                <CardTitle className="text-lg">Authority Matrix Roles</CardTitle>
                <CardDescription>Assign custom authority roles with specific permission sets</CardDescription>
              </CardHeader>
              <CardContent className="px-6 py-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {availableRoles.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No custom authority roles defined</p>
                  ) : availableRoles.map((role) => (
                    <div 
                      key={role.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                        isEditing 
                          ? (editedUser.roles?.includes(role.id) ? 'border-indigo-500 bg-indigo-50/30 cursor-pointer' : 'border-slate-100 bg-slate-50/50 hover:bg-slate-100 cursor-pointer') 
                          : (user.roles?.some((r: any) => r.id === role.id) ? 'border-indigo-500 bg-indigo-50/30' : 'border-slate-100 bg-slate-50/50 opacity-60')
                      }`}
                      onClick={() => {
                        if (!isEditing) return;
                        const newRoles = [...(editedUser.roles || [])];
                        const idx = newRoles.indexOf(role.id);
                        if (idx > -1) newRoles.splice(idx, 1);
                        else newRoles.push(role.id);
                        setEditedUser({ ...editedUser, roles: newRoles });
                      }}
                    >
                      <Checkbox 
                        checked={isEditing ? editedUser.roles?.includes(role.id) : user.roles?.some((r: any) => r.id === role.id)}
                        onCheckedChange={() => {}} // Handle via div click
                        disabled={!isEditing}
                        className="rounded-md border-slate-300"
                      />
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-slate-900 leading-none">{role.name}</p>
                        <p className="text-[10px] text-slate-500 font-medium leading-none truncate max-w-[200px]">{role.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Detailed permissions by category */}
            <Card>
              <CardHeader className="px-6 pt-6 pb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-lg">Detailed Permissions</CardTitle>
                    <CardDescription>Configure individual permissions for this user</CardDescription>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowPermissionHistory(!showPermissionHistory)}
                  >
                    <History className="h-4 w-4 mr-2" />
                    {showPermissionHistory ? "Hide History" : "View History"}
                  </Button>
                </div>
              </CardHeader>
              
              {showPermissionHistory && (
                <div className="px-6 py-4 border-b">
                  <h3 className="text-sm font-medium mb-4">Permission Change History</h3>
                  <div className="space-y-4">
                    {user.permissionHistory?.map((entry, index) => (
                      <div key={index} className="flex items-start">
                        <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center mr-3 shrink-0">
                          <Key className="h-4 w-4 text-amber-600" />
                        </div>
                        <div>
                          <div className="font-medium">{entry.action}</div>
                          <div className="text-sm text-muted-foreground">{formatDateTime(entry.timestamp)}</div>
                          <div className="text-xs mt-1">
                            {entry.detail} • By: {entry.by}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <CardContent className="px-6 py-4">
                <div className="space-y-8">
                  {PERMISSION_CATEGORIES.map(category => (
                    <div key={category.id} className="space-y-4">
                      <div className="flex items-center">
                        <div className="h-7 w-7 rounded-full bg-primary-50 flex items-center justify-center mr-2">
                          {category.icon}
                        </div>
                        <h3 className="text-base font-medium">{category.name}</h3>
                      </div>
                      
                      <div className="space-y-3 ml-9">
                        {category.permissions.map(permission => (
                          <div key={permission.id} className="flex items-center justify-between">
                            <div className="flex flex-col space-y-1">
                              <div className="font-medium">{permission.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {permission.description}
                              </div>
                            </div>
                            <Switch 
                              checked={permissions[permission.id as keyof typeof permissions] || false} 
                              onCheckedChange={(checked) => handlePermissionChange(permission.id, checked)}
                              disabled={!isEditing}
                            />
                          </div>
                        ))}
                      </div>
                      
                      {category.id !== PERMISSION_CATEGORIES[PERMISSION_CATEGORIES.length - 1].id && (
                        <Separator className="my-4" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="px-6 py-4 flex justify-between">
                <div className="text-sm text-muted-foreground">
                  Last updated: {formatDateTime(user.updatedAt)}
                </div>
                {isEditing && (
                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={() => setPermissions(user.permissions)}>
                      Reset
                    </Button>
                    <Button onClick={saveChanges}>
                      Save Permission Changes
                    </Button>
                  </div>
                )}
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        {/* Notifications tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader className="px-6 pt-6 pb-4">
              <CardTitle className="text-lg">Notification Settings</CardTitle>
              <CardDescription>Configure which notifications the user receives</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="grid gap-6">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col space-y-1">
                      <div className="font-medium">Email Notifications</div>
                      <div className="text-sm text-muted-foreground">
                        Receive email notifications for important events
                      </div>
                    </div>
                    <Switch 
                      checked={true} 
                      onCheckedChange={() => {}}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col space-y-1">
                      <div className="font-medium">New Application Alerts</div>
                      <div className="text-sm text-muted-foreground">
                        Get notified when new applications are submitted
                      </div>
                    </div>
                    <Switch 
                      checked={true} 
                      onCheckedChange={() => {}}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col space-y-1">
                      <div className="font-medium">Certification Status Updates</div>
                      <div className="text-sm text-muted-foreground">
                        Notifications about changes in certification status
                      </div>
                    </div>
                    <Switch 
                      checked={true} 
                      onCheckedChange={() => {}}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col space-y-1">
                      <div className="font-medium">Report Notifications</div>
                      <div className="text-sm text-muted-foreground">
                        Receive notifications about new reports
                      </div>
                    </div>
                    <Switch 
                      checked={false} 
                      onCheckedChange={() => {}}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col space-y-1">
                      <div className="font-medium">System Notifications</div>
                      <div className="text-sm text-muted-foreground">
                        Important system updates and maintenance alerts
                      </div>
                    </div>
                    <Switch 
                      checked={true} 
                      onCheckedChange={() => {}}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Reset password dialog */}
      <Dialog open={showResetPasswordDialog} onOpenChange={setShowResetPasswordDialog}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle>Reset User Password</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <p className="text-slate-600 font-medium">
              Are you sure you want to reset the password for <strong className="text-slate-900">{user.firstName} {user.lastName}</strong>?
            </p>
            <p className="text-sm text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100 italic">
              This will generate a new temporary password and send it to the user&apos;s email address: <strong className="text-indigo-600">{user.email}</strong>.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResetPasswordDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleResetPassword}>
              Reset Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
