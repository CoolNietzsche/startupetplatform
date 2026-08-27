"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  CalendarDays, 
  Clock, 
  FileText, 
  ChevronRight, 
  ExternalLink, 
  CircleCheck, 
  CircleDashed, 
  CircleX, 
  CircleDot,
  Filter,
  Loader2
} from "lucide-react";



export default function MyApplicationsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/funding/my-applications");
      const result = await res.json();
      if (result.success) {
        setApplications(result.data);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // Filter applications based on active tab and search term
  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.programName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          app.provider.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "draft") return app.statusType === "draft" && matchesSearch;
    if (activeTab === "review") return (app.statusType === "review" || app.statusType === "shortlisted" || app.statusType === "pending" || app.statusType === "under_review") && matchesSearch;
    if (activeTab === "approved") return (app.statusType === "approved" || app.statusType === "certified") && matchesSearch;
    if (activeTab === "declined") return (app.statusType === "declined" || app.statusType === "rejected") && matchesSearch;
    
    return matchesSearch;
  });
  
  const handleViewApplication = (application: any) => {
    router.push(`/dashboard/funding/${application.opportunityId}`);
  };
  
  const handleContinueDraft = (application: any) => {
    router.push(`/dashboard/funding/${application.opportunityId}/apply`);
  };
  
  const getStatusBadge = (statusType: string) => {
    switch (statusType) {
      case "draft":
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Draft</Badge>;
      case "review":
        return <Badge className="bg-amber-100 text-amber-800 border-0">Under Review</Badge>;
      case "shortlisted":
        return <Badge className="bg-blue-100 text-blue-800 border-0">Shortlisted</Badge>;
      case "approved":
        return <Badge className="bg-green-100 text-green-800 border-0">Approved</Badge>;
      case "declined":
        return <Badge className="bg-red-100 text-red-800 border-0">Declined</Badge>;
      default:
        return <Badge variant="outline">{statusType}</Badge>;
    }
  };
  
  const getStatusIcon = (statusType: string) => {
    switch (statusType) {
      case "draft":
        return <CircleDashed className="h-5 w-5 text-gray-500" />;
      case "review":
      case "pending":
      case "under_review":
        return <CircleDot className="h-5 w-5 text-amber-500" />;
      case "shortlisted":
        return <CircleDot className="h-5 w-5 text-blue-500" />;
      case "approved":
      case "certified":
        return <CircleCheck className="h-5 w-5 text-green-500" />;
      case "declined":
      case "rejected":
        return <CircleX className="h-5 w-5 text-red-500" />;
      default:
        return <CircleDashed className="h-5 w-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-green-600" />
        <p className="text-muted-foreground animate-pulse text-sm">Loading your applications...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">My Funding Applications</h1>
        <Button 
          asChild 
          className="bg-green-600 hover:bg-green-700"
        >
          <Link href="/dashboard/funding">
            Find New Opportunities
          </Link>
        </Button>
      </div>
      
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search by name or reference number..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex gap-2">
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filter</span>
            </Button>
            <Button variant="outline" className="flex gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 w-full max-w-3xl">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="draft">Drafts</TabsTrigger>
            <TabsTrigger value="review">In Review</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="declined">Declined</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-6">
            {filteredApplications.length === 0 ? (
              <div className="text-center py-12 border rounded-lg bg-gray-50">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No applications found</h3>
                <p className="text-gray-500 mt-1 mb-4">
                  {searchTerm ? 
                    "Try adjusting your search terms or filters" : 
                    "You don&apos;t have any applications in this category yet"}
                </p>
                <Button asChild>
                  <Link href="/dashboard/funding">Browse Funding Opportunities</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredApplications.map((application) => (
                  <Card key={application.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(application.statusType)}
                          <CardTitle className="text-lg">{application.programName}</CardTitle>
                        </div>
                        {getStatusBadge(application.statusType)}
                      </div>
                      <CardDescription>Reference: {application.id} • {application.category}</CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex gap-2 items-center">
                          <CalendarDays className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="text-gray-500">Submitted on</p>
                            <p className="font-medium">{application.submissionDate}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 items-center">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="text-gray-500">Decision by</p>
                            <p className="font-medium">{application.reviewDate}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 items-center">
                          <ExternalLink className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="text-gray-500">Provider</p>
                            <p className="font-medium">{application.provider}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="flex justify-between pt-2 border-t">
                      <p className="text-gray-700 font-medium">${application.fundingAmount} USD</p>
                      {application.statusType === 'draft' ? (
                        <Button onClick={() => handleContinueDraft(application)}>
                          Continue Application
                        </Button>
                      ) : (
                        <Button variant="outline" onClick={() => handleViewApplication(application)}>
                          View Details
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
