import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PlusCircle, SearchIcon, Filter, Calendar, FileText, MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function FundingManagement() {
  const opportunities: any[] = [];
  const applicants: any[] = [];

  // Helper functions for UI display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'ETB' }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'draft':
        return <Badge variant="outline" className="border-amber-500 text-amber-600">Draft</Badge>;
      case 'ended':
        return <Badge variant="outline" className="border-gray-500 text-gray-600">Ended</Badge>;
      case 'approved':
        return <Badge className="bg-green-500">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'under_review':
        return <Badge variant="outline" className="border-blue-500 text-blue-600">Under Review</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container px-4 py-6 lg:py-8">
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Funding Management</h1>
          <p className="text-muted-foreground">
            Manage your funding opportunities and review applicants
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/ecosystem-builder-portal/funding/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Opportunity
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="opportunities" className="mt-6">
        <TabsList>
          <TabsTrigger value="opportunities">Funding Opportunities</TabsTrigger>
          <TabsTrigger value="applicants">Applicants</TabsTrigger>
        </TabsList>
        <TabsContent value="opportunities" className="space-y-4 mt-4">
          <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
            <div className="flex flex-grow max-w-md">
              <div className="relative w-full">
                <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search opportunities..."
                  className="pl-8"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Sort by
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Newest first</DropdownMenuItem>
                  <DropdownMenuItem>Oldest first</DropdownMenuItem>
                  <DropdownMenuItem>Funding amount: High to low</DropdownMenuItem>
                  <DropdownMenuItem>Funding amount: Low to high</DropdownMenuItem>
                  <DropdownMenuItem>Deadline: Soonest first</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <div className="grid gap-4">
            {opportunities.map((opportunity) => (
              <Card key={opportunity.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{opportunity.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {opportunity.description}
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/ecosystem-builder-portal/funding/${opportunity.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/ecosystem-builder-portal/funding/${opportunity.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {opportunity.sectors.map((sector, index) => (
                      <span key={index} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                        {sector}
                      </span>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      <p className="font-medium mt-1">
                        {getStatusBadge(opportunity.status)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Funding</p>
                      <p className="font-medium mt-1">{formatCurrency(opportunity.totalFunding)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Deadline</p>
                      <div className="flex items-center mt-1">
                        <Calendar className="mr-1 h-3 w-3" />
                        <span className="font-medium">{formatDate(opportunity.deadline)}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Applicants</p>
                      <p className="font-medium mt-1">{opportunity.applicants}</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="flex items-center justify-between w-full">
                    <div className="text-xs text-muted-foreground">
                      Created on {formatDate(opportunity.createdAt)}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/dashboard/ecosystem-builder-portal/funding/${opportunity.id}`}>
                          Manage
                        </Link>
                      </Button>
                      {opportunity.status === 'draft' && (
                        <Button size="sm">
                          Publish
                        </Button>
                      )}
                    </div>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="applicants" className="space-y-4 mt-4">
          <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
            <div className="flex flex-grow max-w-md">
              <div className="relative w-full">
                <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search applicants..."
                  className="pl-8"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <FileText className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
          
          <div className="rounded-md border">
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <th className="h-12 px-4 text-left align-middle font-medium">Startup</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Applied For</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Date</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
                    <th className="h-12 px-4 text-right align-middle font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {applicants.map((applicant) => {
                    const opportunity = opportunities.find(o => o.id === applicant.opportunityId);
                    return (
                      <tr key={applicant.id} className="border-b transition-colors hover:bg-muted/50">
                        <td className="p-4 align-middle">{applicant.startupName}</td>
                        <td className="p-4 align-middle">{opportunity?.title || "Unknown"}</td>
                        <td className="p-4 align-middle">{formatDate(applicant.appliedDate)}</td>
                        <td className="p-4 align-middle">{getStatusBadge(applicant.status)}</td>
                        <td className="p-4 align-middle text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/dashboard/ecosystem-builder-portal/funding/applications/${applicant.id}`}>
                              View Application
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
