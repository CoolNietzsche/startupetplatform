"use client";

import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Mail, Phone, Building2, Eye, FileText, Download, Calendar, Users, Target, DollarSign, Briefcase, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface FundingOpportunity {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  category: string;
  applications: number;
  deadline: string;
  amountMin: number;
  amountMax: number;
  status: "active" | "draft" | "closed";
  createdAt: string;
  sectors: string[];
  location: string;
  eligibility: string[];
  fundingUses?: string[];
  applicationProcess?: string[];
}

interface Application {
  id: string;
  fundingOpportunityId: string;
  // Company Information
  companyName: string;
  registrationNumber: string;
  foundingDate: string;
  companySize: string;
  website?: string;
  address: string;
  city: string;
  // Contact Information
  applicantName: string;
  email: string;
  phone: string;
  // Project Details
  projectTitle: string;
  projectDescription: string;
  sector: string;
  impactArea: string;
  requestedAmount: number;
  timeline: string;
  teamSize: string;
  previousFunding: string;
  challenge: string;
  solution: string;
  // Documents
  businessPlan?: string;
  financialProjections?: string;
  teamCV?: string;
  presentationDeck?: string;
  proofOfRegistration: string;
  // Application metadata
  submittedDate: string;
  status: "pending" | "under_review" | "shortlisted" | "approved" | "rejected";
}

export default function EcosystemBuilderFundingPage() {
  const [opportunities, setOpportunities] = useState<FundingOpportunity[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCertified, setIsCertified] = useState(true); // Default to true, update on fetch
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // We'll fetch applications when managing a specific opportunity or on mount
  useEffect(() => {
    fetchOpportunities();
    fetchApplications();
  }, []);

  const fetchOpportunities = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/ecosystem-builder/funding", { cache: "no-store" });
      const result = await res.json();
      
      if (res.status === 403) {
        setIsCertified(false);
        setErrorMessage(result.error);
        return;
      }

      if (result.success) {
        setOpportunities(result.data);
        setIsCertified(true);
      } else {
        toast.error(result.error || "Failed to fetch opportunities");
      }
    } catch (error) {
      toast.error("An error occurred while fetching opportunities");
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    const res = await fetch("/api/ecosystem-builder/funding/applications", { cache: "no-store" });
    const result = await res.json();
    if (result.success) {
      setApplications(result.data);
    }
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);
  const [isApplicationDetailsOpen, setIsApplicationDetailsOpen] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<FundingOpportunity | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  
  const getInitialFormData = () => ({
    title: "",
    description: "",
    longDescription: "",
    category: "",
    amountMin: "",
    amountMax: "",
    deadline: "",
    sectors: "",
    location: "",
    eligibility: "",
    fundingUses: "",
    applicationProcess: ""
  });

  const [formData, setFormData] = useState(getInitialFormData());
  const [formErrors, setFormErrors] = useState<Record<string, boolean>>({});

  const resetForm = () => {
    setFormData(getInitialFormData());
    setFormErrors({});
  };

  const validateForm = () => {
    const errors: Record<string, boolean> = {};
    if (!formData.title.trim()) errors.title = true;
    if (!formData.category) errors.category = true;
    if (!formData.amountMin) errors.amountMin = true;
    if (!formData.amountMax) errors.amountMax = true;
    if (!formData.deadline) errors.deadline = true;
    if (!formData.description.trim()) errors.description = true;
    if (!formData.eligibility.trim()) errors.eligibility = true;
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenCreateModal = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };

  const filteredOpportunities = useMemo(() => {
    return opportunities.filter(opp => 
      opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [opportunities, searchQuery]);

  const activeOpportunities = useMemo(() => filteredOpportunities.filter(opp => opp.status === "active"), [filteredOpportunities]);
  const draftOpportunities = useMemo(() => filteredOpportunities.filter(opp => opp.status === "draft"), [filteredOpportunities]);
  const closedOpportunities = useMemo(() => filteredOpportunities.filter(opp => opp.status === "closed"), [filteredOpportunities]);

  const handleSearch = () => {
    // Search is handled by useMemo dependency on searchQuery
  };

  const handleCreateOpportunity = async () => {
    if (!validateForm()) {
      return toast.error("Please fill in all required fields indicated in red.");
    }

    try {
      const res = await fetch("/api/ecosystem-builder/funding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Opportunity created successfully");
        setIsCreateDialogOpen(false);
        fetchOpportunities();
        resetForm();
      } else {
        toast.error(result.error || "Failed to create opportunity");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    }
  };

  const handleViewDetails = (opportunity: FundingOpportunity) => {
    setSelectedOpportunity(opportunity);
    setIsDetailsDialogOpen(true);
  };

  const handleEditOpportunity = (opportunity: FundingOpportunity) => {
    setSelectedOpportunity(opportunity);
    setFormErrors({});
    setFormData({
      title: opportunity.title,
      description: opportunity.description,
      longDescription: opportunity.longDescription || "",
      category: opportunity.category,
      amountMin: opportunity.amountMin.toString(),
      amountMax: opportunity.amountMax.toString(),
      deadline: opportunity.deadline,
      sectors: opportunity.sectors.join(', '),
      location: opportunity.location,
      eligibility: opportunity.eligibility.join(', '),
      fundingUses: opportunity.fundingUses?.join(', ') || "",
      applicationProcess: opportunity.applicationProcess?.join(', ') || ""
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateOpportunity = async () => {
    if (selectedOpportunity) {
      if (!validateForm()) {
        return toast.error("Please fill in all required fields indicated in red.");
      }

      try {
        const res = await fetch(`/api/ecosystem-builder/funding/${selectedOpportunity.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        });
        const result = await res.json();
        if (result.success) {
          toast.success("Updated successfully");
          setIsEditDialogOpen(false);
          fetchOpportunities();
        } else {
          toast.error(result.error || "Failed to update");
        }
      } catch (error) {
        toast.error("An unexpected error occurred");
      }
    }
  };

  const handleManageApplications = async (opportunity: FundingOpportunity) => {
    setSelectedOpportunity(opportunity);
    setIsManageDialogOpen(true);
    // Fetch applications for this opportunity
    try {
      const res = await fetch(`/api/ecosystem-builder/funding/${opportunity.id}`);
      const result = await res.json();
      if (result.success && result.data.applications) {
        setApplications(result.data.applications);
      }
    } catch (_) {}
  };

  const handleViewApplicationDetails = (application: Application) => {
    setSelectedApplication(application);
    setIsApplicationDetailsOpen(true);
  };

  const handleUpdateApplicationStatus = async (applicationId: string, newStatus: Application['status']) => {
    try {
      const res = await fetch(`/api/ecosystem-builder/funding/applications/${applicationId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setApplications(applications.map(app =>
          app.id === applicationId ? { ...app, status: newStatus } : app
        ));
        toast.success("Status updated");
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const getStatusColor = (status: Application['status']) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'under_review': return 'bg-blue-100 text-blue-800';
      case 'shortlisted': return 'bg-purple-100 text-purple-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handlePublish = async (id: string) => {
    try {
      const res = await fetch(`/api/ecosystem-builder/funding/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "active", isActive: true })
      });
      if (res.ok) {
        fetchOpportunities();
        toast.success("Published successfully");
      }
    } catch (_) {}
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this opportunity?")) {
      try {
        const res = await fetch(`/api/ecosystem-builder/funding/${id}`, { method: "DELETE" });
        if (res.ok) {
          fetchOpportunities();
          toast.success("Deleted successfully");
        }
      } catch (error) {
        toast.error("Failed to delete");
      }
    }
  };



  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Funding Management</h1>
          <p className="text-muted-foreground">
            Create and manage funding opportunities for startups.
          </p>
        </div>
        {isCertified && (
          <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Opportunity
          </Button>
        )}
      </div>

      {!isCertified && (
          <Card className="border-amber-200 bg-amber-50 mb-6">
              <CardHeader>
                  <CardTitle className="text-amber-800 flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Verification Required
                  </CardTitle>
              </CardHeader>
              <CardContent>
                  <p className="text-amber-700">
                      {errorMessage || "Your account must be certified before you can manage funding opportunities."}
                  </p>
                  <p className="text-amber-600 text-sm mt-2">
                      Please complete your ecosystem builder application and wait for approval from our committee.
                  </p>
              </CardContent>
              <CardFooter>
                  <Button variant="outline" className="border-amber-300 text-amber-800 hover:bg-amber-100" asChild>
                      <a href="/ecosystem-builder/apply">Go to Application</a>
                  </Button>
              </CardFooter>
          </Card>
      )}

      {isCertified && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Total Opportunities</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{opportunities.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Active Programs</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {opportunities.filter(o => o.status === "active").length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{applications.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {applications.filter(a => a.status === "PENDING" || a.status === "UNDER_REVIEW").length}
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="opportunities" className="space-y-4">
            <TabsList>
              <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
              <TabsTrigger value="draft">Drafts</TabsTrigger>
              <TabsTrigger value="closed">Closed</TabsTrigger>
              <TabsTrigger value="applications">Recent Applications</TabsTrigger>
            </TabsList>

            <TabsContent value="opportunities" className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-1 items-center space-x-2">
                  <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search opportunities..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {activeOpportunities.map((opportunity) => (
                  <Card key={opportunity.id} className="flex flex-col">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-xl line-clamp-1">{opportunity.title}</CardTitle>
                        <Badge variant={opportunity.status === "active" ? "default" : "secondary"}>
                          {opportunity.status}
                        </Badge>
                      </div>
                      <CardDescription className="line-clamp-2 break-words h-10 overflow-hidden">
                        {opportunity.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <p className="text-sm">Applications: <span className="font-medium">{opportunity.applications}</span></p>
                      <p className="text-sm">Deadline: <span className="font-medium">{opportunity.deadline}</span></p>
                      <p className="text-sm">Amount: <span className="font-medium">${opportunity.amountMin.toLocaleString()} - ${opportunity.amountMax.toLocaleString()}</span></p>
                    </CardContent>
                    <CardFooter className="flex justify-between mt-auto pt-4">
                      <Button variant="outline" size="sm" onClick={() => handleViewDetails(opportunity)}>View Details</Button>
                      <Button variant="secondary" size="sm" onClick={() => handleManageApplications(opportunity)}>Manage</Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
              {activeOpportunities.length === 0 && (
                <div className="text-center text-muted-foreground py-6">
                  No active funding opportunities.
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="draft" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {draftOpportunities.map((opportunity) => (
                  <Card key={opportunity.id}>
                    <CardHeader>
                      <CardTitle>{opportunity.title}</CardTitle>
                      <CardDescription>Draft opportunity</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">Status: <span className="font-medium text-amber-500">Draft</span></p>
                      <p className="text-sm">Created: <span className="font-medium">{opportunity.createdAt}</span></p>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" onClick={() => handleEditOpportunity(opportunity)}>Edit</Button>
                      <Button onClick={() => handlePublish(opportunity.id)}>Publish</Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
              {draftOpportunities.length === 0 && (
                <div className="text-center text-muted-foreground py-6">
                  No draft funding opportunities.
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="closed" className="text-center text-muted-foreground py-6">
              {closedOpportunities.length === 0 ? "No closed funding opportunities." : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {closedOpportunities.map((opportunity) => (
                    <Card key={opportunity.id}>
                      <CardHeader>
                        <CardTitle>{opportunity.title}</CardTitle>
                        <CardDescription>
                          <Badge variant="outline">Closed</Badge>
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">Applications: <span className="font-medium">{opportunity.applications}</span></p>
                        <p className="text-sm">Deadline: <span className="font-medium">{opportunity.deadline}</span></p>
                      </CardContent>
                      <CardFooter>
                        <Button variant="outline" onClick={() => handleViewDetails(opportunity)}>View Details</Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="applications" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Applications</CardTitle>
                  <CardDescription>View and manage all applications across your funding programs</CardDescription>
                </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Program</TableHead>
                    <TableHead>Sector</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                        No applications found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    applications.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell>
                          <div className="font-medium">{app.companyName}</div>
                          <div className="text-xs text-muted-foreground">{app.applicantName}</div>
                        </TableCell>
                        <TableCell>
                          {opportunities.find(o => o.id === app.fundingOpportunityId)?.title || "Unknown Program"}
                        </TableCell>
                        <TableCell>{app.sector}</TableCell>
                        <TableCell>${app.requestedAmount.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(app.status)}>
                            {app.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(app.submittedDate).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleViewApplicationDetails(app)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
        </>
      )}
      {/* Create Opportunity Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Funding Opportunity</DialogTitle>
            <DialogDescription>
              Fill in the details below to define your new funding program.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold border-b pb-1">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="title" className="flex items-center gap-1">Program Title <span className="text-red-500">*</span></Label>
                  <Input
                    id="title"
                    placeholder="e.g. Early Stage Startup Fund"
                    className={formErrors.title ? "border-red-500 ring-offset-red-200" : ""}
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category" className="flex items-center gap-1">Category <span className="text-red-500">*</span></Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(val) => setFormData({ ...formData, category: val })}
                  >
                    <SelectTrigger id="category" className={formErrors.category ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GRANT">Grant</SelectItem>
                      <SelectItem value="INVESTMENT">Investment</SelectItem>
                      <SelectItem value="ACCELERATOR">Accelerator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="e.g. Ethiopia, Global"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="deadline">Deadline</Label>
                  <Input
                    id="deadline"
                    type="date"
                    className={formErrors.deadline ? "border-red-500" : ""}
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold border-b pb-1">Financials</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="amountMin">Min Amount ($)</Label>
                  <Input
                    id="amountMin"
                    type="number"
                    placeholder="0"
                    className={formErrors.amountMin ? "border-red-500" : ""}
                    value={formData.amountMin}
                    onChange={(e) => setFormData({ ...formData, amountMin: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="amountMax">Max Amount ($)</Label>
                  <Input
                    id="amountMax"
                    type="number"
                    placeholder="100000"
                    className={formErrors.amountMax ? "border-red-500 bg-red-50/50" : ""}
                    value={formData.amountMax}
                    onChange={(e) => {
                      setFormData({ ...formData, amountMax: e.target.value });
                      if (formErrors.amountMax) setFormErrors(prev => ({ ...prev, amountMax: false }));
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold border-b pb-1">Detailed Content</h3>
              <div className="grid gap-2">
                <Label htmlFor="description" className="flex items-center gap-1">Short Description <span className="text-red-500">*</span></Label>
                <Textarea
                  id="description"
                  placeholder="A brief overview of the opportunity..."
                  className={`h-20 ${formErrors.description ? "border-red-500" : ""}`}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="longDescription">Detailed Description</Label>
                <Textarea
                  id="longDescription"
                  placeholder="Full program details, values, and requirements..."
                  className="h-32"
                  value={formData.longDescription}
                  onChange={(e) => setFormData({ ...formData, longDescription: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="sectors">Industry Sectors (comma separated)</Label>
                <Input
                  id="sectors"
                  placeholder="e.g. AI, FinTech, Agriculture"
                  value={formData.sectors}
                  onChange={(e) => setFormData({ ...formData, sectors: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="eligibility" className="flex items-center gap-1">Eligibility Criteria <span className="text-red-500">*</span></Label>
                <Textarea
                  id="eligibility"
                  placeholder="Who can apply? (One per line or comma separated)"
                  className={`h-24 ${formErrors.eligibility ? "border-red-500" : ""}`}
                  value={formData.eligibility}
                  onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="fundingUses">Intended Uses (comma separated)</Label>
                  <Input
                    id="fundingUses"
                    placeholder="e.g. R&D, Capex"
                    value={formData.fundingUses}
                    onChange={(e) => setFormData({ ...formData, fundingUses: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="applicationProcess">Workflow Steps (comma separated)</Label>
                  <Input
                    id="applicationProcess"
                    placeholder="e.g. Apply, Interview, Grant"
                    value={formData.applicationProcess}
                    onChange={(e) => setFormData({ ...formData, applicationProcess: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateOpportunity} className="bg-primary">Create Opportunity</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Funding Opportunity Details</DialogTitle>
            <DialogDescription>
              Review the full parameters of this funding program.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {selectedOpportunity && (
              <>
                <div className="grid grid-cols-1 gap-4">
                  <div className="grid gap-2">
                    <Label className="text-muted-foreground font-bold">Program Title</Label>
                    <div className="p-3 bg-muted/20 rounded-md border font-extrabold break-all overflow-hidden text-xl tracking-tight leading-none">
                      {selectedOpportunity.title}
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-muted-foreground font-bold">Category</Label>
                    <div className="p-2 bg-muted/30 rounded border break-words overflow-hidden font-medium">
                      {selectedOpportunity.category}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="grid gap-2">
                    <Label className="text-muted-foreground font-bold">Location</Label>
                    <div className="p-2 bg-muted/30 rounded border break-words overflow-hidden text-sm">
                      {selectedOpportunity.location || "Global Region"}
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-muted-foreground font-bold">Deadline</Label>
                    <div className="p-2 bg-muted/30 rounded border font-mono">
                      {selectedOpportunity.deadline}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="grid gap-2">
                    <Label className="text-muted-foreground font-bold">Min Amount ($)</Label>
                    <div className="p-2 bg-muted/30 rounded border font-mono font-semibold">
                      ${selectedOpportunity.amountMin?.toLocaleString()}
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-muted-foreground font-bold text-primary">Max Amount ($)</Label>
                    <div className="p-3 bg-primary/5 border-primary/20 rounded border font-mono font-black text-primary text-xl">
                      ${selectedOpportunity.amountMax?.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label className="text-muted-foreground font-bold">Short Description</Label>
                  <div className="p-3 bg-muted/20 border border-dashed rounded text-sm italic break-words overflow-hidden">
                    "{selectedOpportunity.description}"
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label className="text-muted-foreground font-bold">Detailed Description</Label>
                  <div className="p-5 bg-white border border-border/50 rounded-xl text-sm leading-relaxed whitespace-pre-wrap break-words">
                    {selectedOpportunity.longDescription || "No detailed context provided."}
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label className="text-muted-foreground font-bold">Industry Sectors</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedOpportunity.sectors?.map((sector: string, i: number) => (
                      <Badge key={i} variant="outline" className="text-[10px] bg-primary/5 border-primary/20">
                        {sector}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label className="text-muted-foreground font-bold">Eligibility Criteria</Label>
                  <div className="space-y-2">
                    {selectedOpportunity.eligibility?.map((item: string, i: number) => (
                      <div key={i} className="flex items-start gap-2 text-[11px] p-2 bg-muted/30 rounded border break-words overflow-hidden">
                        <span className="h-1 w-1 rounded-full bg-primary mt-1.5 shrink-0" />
                        <span className="flex-1">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label className="text-muted-foreground font-bold">Intended Uses</Label>
                  <div className="space-y-2">
                    {selectedOpportunity.fundingUses && selectedOpportunity.fundingUses.length > 0 ? (
                      selectedOpportunity.fundingUses.map((item: string, i: number) => (
                        <div key={i} className="flex items-start gap-2 text-[11px] p-2 bg-muted/30 rounded border break-words overflow-hidden">
                          <span className="h-1 w-1 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                          <span className="flex-1">{item}</span>
                        </div>
                      ))
                    ) : (
                      <div className="p-2 bg-muted/30 rounded border text-xs text-muted-foreground italic">Unspecified</div>
                    )}
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label className="text-muted-foreground font-bold">Workflow Steps</Label>
                  <div className="space-y-2">
                    {selectedOpportunity.applicationProcess && selectedOpportunity.applicationProcess.length > 0 ? (
                      selectedOpportunity.applicationProcess.map((item: string, i: number) => (
                        <div key={i} className="flex items-start gap-2 text-[11px] p-2 bg-muted/30 rounded border break-words overflow-hidden">
                          <span className="h-1 w-1 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                          <span className="flex-1 text-purple-700 font-medium">Step {i+1}: {item}</span>
                        </div>
                      ))
                    ) : (
                      <div className="p-2 bg-muted/30 rounded border text-xs text-muted-foreground italic">Not defined</div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
              <Users className="h-4 w-4" />
              {selectedOpportunity?.applications} Applicants
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>Dismiss</Button>
              <Button 
                variant="outline" 
                className="border-primary/20 text-primary hover:bg-primary/5"
                onClick={() => {
                  setIsDetailsDialogOpen(false);
                  if (selectedOpportunity) handleEditOpportunity(selectedOpportunity);
                }}
              >
                Modify
              </Button>
              <Button className="bg-primary">Share</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Opportunity Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Funding Opportunity</DialogTitle>
            <DialogDescription>
              Modify the parameters of your existing funding program.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold border-b pb-1">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-title" className="flex items-center gap-1">Program Title <span className="text-red-500">*</span></Label>
                  <Input
                    id="edit-title"
                    className={formErrors.title ? "border-red-500 ring-offset-red-200" : ""}
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-category" className="flex items-center gap-1">Category <span className="text-red-500">*</span></Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(val) => setFormData({ ...formData, category: val })}
                  >
                    <SelectTrigger id="edit-category" className={formErrors.category ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GRANT">Grant</SelectItem>
                      <SelectItem value="INVESTMENT">Investment</SelectItem>
                      <SelectItem value="ACCELERATOR">Accelerator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-location">Location</Label>
                  <Input
                    id="edit-location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-deadline">Deadline</Label>
                  <Input
                    id="edit-deadline"
                    type="date"
                    className={formErrors.deadline ? "border-red-500" : ""}
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold border-b pb-1">Financials</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-amountMin">Min Amount ($)</Label>
                  <Input
                    id="edit-amountMin"
                    type="number"
                    className={formErrors.amountMin ? "border-red-500" : ""}
                    value={formData.amountMin}
                    onChange={(e) => setFormData({ ...formData, amountMin: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-amountMax">Max Amount ($)</Label>
                  <Input
                    id="edit-amountMax"
                    type="number"
                    className={formErrors.amountMax ? "border-red-500 bg-red-50/50" : ""}
                    value={formData.amountMax}
                    onChange={(e) => {
                      setFormData({ ...formData, amountMax: e.target.value });
                      if (formErrors.amountMax) setFormErrors(prev => ({ ...prev, amountMax: false }));
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold border-b pb-1">Detailed Content</h3>
              <div className="grid gap-2">
                <Label htmlFor="edit-description" className="flex items-center gap-1">Short Description <span className="text-red-500">*</span></Label>
                <Textarea
                  id="edit-description"
                  className={`h-20 ${formErrors.description ? "border-red-500" : ""}`}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-longDescription">Detailed Description</Label>
                <Textarea
                  id="edit-longDescription"
                  className="h-32"
                  value={formData.longDescription}
                  onChange={(e) => setFormData({ ...formData, longDescription: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-sectors">Industry Sectors (comma separated)</Label>
                <Input
                  id="edit-sectors"
                  value={formData.sectors}
                  onChange={(e) => setFormData({ ...formData, sectors: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-eligibility" className="flex items-center gap-1">Eligibility Criteria <span className="text-red-500">*</span></Label>
                <Textarea
                  id="edit-eligibility"
                  className={`h-24 ${formErrors.eligibility ? "border-red-500" : ""}`}
                  value={formData.eligibility}
                  onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-fundingUses">Intended Uses (comma separated)</Label>
                  <Input
                    id="edit-fundingUses"
                    value={formData.fundingUses}
                    onChange={(e) => setFormData({ ...formData, fundingUses: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-applicationProcess">Workflow Steps (comma separated)</Label>
                  <Input
                    id="edit-applicationProcess"
                    value={formData.applicationProcess}
                    onChange={(e) => setFormData({ ...formData, applicationProcess: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="flex items-center justify-between">
            <Button 
              variant="destructive" 
              onClick={() => {
                if (selectedOpportunity && window.confirm("Are you sure?")) {
                  handleDelete(selectedOpportunity.id);
                  setIsEditDialogOpen(false);
                }
              }}
            >
              Delete
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleUpdateOpportunity}>Save Changes</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Applications Dialog */}
      <Dialog open={isManageDialogOpen} onOpenChange={setIsManageDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Applications - {selectedOpportunity?.title}</DialogTitle>
            <DialogDescription>
              Review and manage applications for this funding opportunity
            </DialogDescription>
          </DialogHeader>
          {selectedOpportunity && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Total Applications</p>
                  <p className="text-2xl font-bold">
                    {applications.filter(app => app.fundingOpportunityId === selectedOpportunity.id).length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending Review</p>
                  <p className="text-2xl font-bold">
                    {applications.filter(app => app.fundingOpportunityId === selectedOpportunity.id && app.status === 'pending').length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Under Review</p>
                  <p className="text-2xl font-bold">
                    {applications.filter(app => app.fundingOpportunityId === selectedOpportunity.id && app.status === 'under_review').length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Approved</p>
                  <p className="text-2xl font-bold text-green-600">
                    {applications.filter(app => app.fundingOpportunityId === selectedOpportunity.id && app.status === 'approved').length}
                  </p>
                </div>
              </div>

              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Applicant</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Sector</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Update Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications
                      .filter(app => app.fundingOpportunityId === selectedOpportunity.id)
                      .map((application) => (
                        <TableRow key={application.id}>
                          <TableCell className="font-medium">{application.applicantName}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                              {application.companyName}
                            </div>
                          </TableCell>
                          <TableCell>${application.requestedAmount.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{application.sector}</Badge>
                          </TableCell>
                          <TableCell className="text-sm">{application.submittedDate}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(application.status)}>
                              {application.status.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={application.status}
                              onValueChange={(value) => handleUpdateApplicationStatus(application.id, value as Application['status'])}
                            >
                              <SelectTrigger className="w-[140px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="under_review">Under Review</SelectItem>
                                <SelectItem value="shortlisted">Shortlisted</SelectItem>
                                <SelectItem value="approved">Approved</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewApplicationDetails(application)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
                {applications.filter(app => app.fundingOpportunityId === selectedOpportunity.id).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No applications received yet for this opportunity.
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsManageDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setIsManageDialogOpen(false);
              if (selectedOpportunity) handleEditOpportunity(selectedOpportunity);
            }}>
              Edit Opportunity
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Application Details Dialog */}
      <Dialog open={isApplicationDetailsOpen} onOpenChange={setIsApplicationDetailsOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details - {selectedApplication?.projectTitle}</DialogTitle>
            <DialogDescription>
              Complete application information submitted by {selectedApplication?.applicantName}
            </DialogDescription>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-6">
              {/* Application Status Banner */}
              <div className="p-4 bg-muted rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Application Status</p>
                  <Badge className={`${getStatusColor(selectedApplication.status)} mt-1`}>
                    {selectedApplication.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Submitted On</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <p className="font-medium">{selectedApplication.submittedDate}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Requested Amount</p>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <p className="text-xl font-bold text-green-600">
                      ${selectedApplication.requestedAmount.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <Tabs defaultValue="company" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="company">Company Info</TabsTrigger>
                  <TabsTrigger value="project">Project Details</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                  <TabsTrigger value="status">Status & Actions</TabsTrigger>
                </TabsList>

                {/* Company Information Tab */}
                <TabsContent value="company" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        Company Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-muted-foreground">Company Name</Label>
                          <p className="font-medium">{selectedApplication.companyName}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Registration Number</Label>
                          <p className="font-medium">{selectedApplication.registrationNumber}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Founding Date</Label>
                          <p className="font-medium">{selectedApplication.foundingDate}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Company Size</Label>
                          <p className="font-medium">{selectedApplication.companySize} employees</p>
                        </div>
                        {selectedApplication.website && (
                          <div>
                            <Label className="text-muted-foreground">Website</Label>
                            <a href={selectedApplication.website} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline">
                              {selectedApplication.website}
                            </a>
                          </div>
                        )}
                        <div>
                          <Label className="text-muted-foreground">Location</Label>
                          <p className="font-medium">{selectedApplication.city}</p>
                        </div>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Address</Label>
                        <p className="font-medium">{selectedApplication.address}, {selectedApplication.city}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Mail className="h-5 w-5" />
                        Contact Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-muted-foreground">Contact Person</Label>
                          <p className="font-medium">{selectedApplication.applicantName}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Email</Label>
                          <a href={`mailto:${selectedApplication.email}`} className="font-medium text-blue-600 hover:underline">
                            {selectedApplication.email}
                          </a>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Phone</Label>
                          <a href={`tel:${selectedApplication.phone}`} className="font-medium text-blue-600 hover:underline">
                            {selectedApplication.phone}
                          </a>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Project Details Tab */}
                <TabsContent value="project" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Project Overview
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-muted-foreground">Project Title</Label>
                        <p className="font-semibold text-lg">{selectedApplication.projectTitle}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Project Description</Label>
                        <p className="text-sm leading-relaxed">{selectedApplication.projectDescription}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-muted-foreground">Sector</Label>
                          <Badge variant="outline" className="mt-1">{selectedApplication.sector}</Badge>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Impact Area</Label>
                          <Badge variant="outline" className="mt-1">{selectedApplication.impactArea}</Badge>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Timeline</Label>
                          <p className="font-medium">{selectedApplication.timeline}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Team Size</Label>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <p className="font-medium">{selectedApplication.teamSize} members</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Problem & Solution</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-muted-foreground font-semibold">Challenge / Problem Statement</Label>
                        <p className="text-sm leading-relaxed mt-2 p-3 bg-red-50 border-l-4 border-red-500 rounded">
                          {selectedApplication.challenge}
                        </p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground font-semibold">Proposed Solution</Label>
                        <p className="text-sm leading-relaxed mt-2 p-3 bg-green-50 border-l-4 border-green-500 rounded">
                          {selectedApplication.solution}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Funding Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-muted-foreground">Previous Funding</Label>
                        <p className="text-sm mt-1">{selectedApplication.previousFunding}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Applied For</Label>
                        <div className="p-3 bg-blue-50 rounded-lg mt-1">
                          <p className="font-semibold text-blue-900">
                            {opportunities.find(opp => opp.id === selectedApplication.fundingOpportunityId)?.title}
                          </p>
                          <p className="text-sm text-blue-700">
                            {opportunities.find(opp => opp.id === selectedApplication.fundingOpportunityId)?.category}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Documents Tab */}
                <TabsContent value="documents" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Submitted Documents
                      </CardTitle>
                      <CardDescription>
                        All documents uploaded by the applicant
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {selectedApplication.proofOfRegistration && (
                          <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-blue-600" />
                              <div>
                                <p className="font-medium">Proof of Registration</p>
                                <p className="text-xs text-muted-foreground">{selectedApplication.proofOfRegistration}</p>
                              </div>
                            </div>
                            <Button size="sm" variant="outline">
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        )}
                        {selectedApplication.businessPlan && (
                          <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-green-600" />
                              <div>
                                <p className="font-medium">Business Plan</p>
                                <p className="text-xs text-muted-foreground">{selectedApplication.businessPlan}</p>
                              </div>
                            </div>
                            <Button size="sm" variant="outline">
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        )}
                        {selectedApplication.financialProjections && (
                          <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-purple-600" />
                              <div>
                                <p className="font-medium">Financial Projections</p>
                                <p className="text-xs text-muted-foreground">{selectedApplication.financialProjections}</p>
                              </div>
                            </div>
                            <Button size="sm" variant="outline">
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        )}
                        {selectedApplication.teamCV && (
                          <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-orange-600" />
                              <div>
                                <p className="font-medium">Team CVs</p>
                                <p className="text-xs text-muted-foreground">{selectedApplication.teamCV}</p>
                              </div>
                            </div>
                            <Button size="sm" variant="outline">
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        )}
                        {selectedApplication.presentationDeck && (
                          <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-red-600" />
                              <div>
                                <p className="font-medium">Pitch Deck</p>
                                <p className="text-xs text-muted-foreground">{selectedApplication.presentationDeck}</p>
                              </div>
                            </div>
                            <Button size="sm" variant="outline">
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        )}
                      </div>
                      {!selectedApplication.businessPlan && !selectedApplication.financialProjections && 
                       !selectedApplication.teamCV && !selectedApplication.presentationDeck && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          Only required document (Proof of Registration) was submitted.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Status & Actions Tab */}
                <TabsContent value="status" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Update Application Status</CardTitle>
                      <CardDescription>
                        Change the status of this application
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-4">
                        <Label>Current Status:</Label>
                        <Badge className={getStatusColor(selectedApplication.status)}>
                          {selectedApplication.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4">
                        <Label>Change To:</Label>
                        <Select
                          value={selectedApplication.status}
                          onValueChange={(value) => {
                            handleUpdateApplicationStatus(selectedApplication.id, value as Application['status']);
                            setSelectedApplication({ ...selectedApplication, status: value as Application['status'] });
                          }}
                        >
                          <SelectTrigger className="w-[200px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="under_review">Under Review</SelectItem>
                            <SelectItem value="shortlisted">Shortlisted</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button className="w-full" variant="outline" onClick={() => {
                        toast.info(`Contact ${selectedApplication.applicantName} at ${selectedApplication.email}`);
                      }}>
                        <Mail className="h-4 w-4 mr-2" />
                        Send Email to Applicant
                      </Button>
                      <Button className="w-full" variant="outline" onClick={() => {
                        toast.info(`Call ${selectedApplication.applicantName} at ${selectedApplication.phone}`);
                      }}>
                        <Phone className="h-4 w-4 mr-2" />
                        Call Applicant
                      </Button>
                      <Button className="w-full" variant="outline">
                        <FileText className="h-4 w-4 mr-2" />
                        Download All Documents
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApplicationDetailsOpen(false)}>
              Close
            </Button>
            <Button 
              onClick={() => {
                if (selectedApplication) {
                  toast.info(`Contact ${selectedApplication.applicantName} at ${selectedApplication.email}`);
                }
              }}
            >
              <Mail className="h-4 w-4 mr-2" />
              Contact Applicant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
