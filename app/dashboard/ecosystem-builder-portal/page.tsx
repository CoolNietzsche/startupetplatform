import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function EcosystemBuilderDashboard() {
  // In a real implementation, we would fetch this data from the API
  const applicationStatus = "pending"; // Can be "none", "pending", "approved", "rejected"
  const recentFundingOpportunities = [
    { id: "1", title: "Tech Startup Fund 2025", applicants: 12, status: "Active" },
    { id: "2", title: "Women Entrepreneurs Grant", applicants: 8, status: "Draft" },
  ];
  const upcomingBookings = [
    { id: "1", name: "Meeting Room A", date: "2025-07-28", time: "09:00-11:00", attendees: 5 },
    { id: "2", name: "Event Space", date: "2025-08-01", time: "14:00-17:00", attendees: 25 },
  ];
  const recentNews = [
    { id: "1", title: "New Innovation Hub Opening", views: 120, date: "2025-07-20" },
    { id: "2", title: "Partnership with Local University Announced", views: 85, date: "2025-07-15" },
  ];

  return (
    <div className="container px-4 py-6 lg:py-8">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Ecosystem Builder Portal</h1>
        <div className="flex items-center gap-2">
          {applicationStatus === "none" && (
            <Button asChild>
              <Link href="/dashboard/ecosystem-builder-portal/apply">Apply for Ecosystem Builder Status</Link>
            </Button>
          )}
          {applicationStatus === "approved" && (
            <Badge className="bg-green-500">Verified Ecosystem Builder</Badge>
          )}
          {applicationStatus === "pending" && (
            <Badge variant="outline" className="border-amber-500 text-amber-600">Application Pending</Badge>
          )}
          {applicationStatus === "rejected" && (
            <Badge variant="outline" className="border-red-500 text-red-600">Application Rejected</Badge>
          )}
        </div>
      </div>

      {applicationStatus === "pending" && (
        <Card className="mt-6">
          <CardHeader className="pb-3">
            <CardTitle>Application In Progress</CardTitle>
            <CardDescription>
              Your ecosystem builder application is currently being reviewed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Submitted on: <span className="font-medium text-foreground">July 22, 2025</span>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/ecosystem-builder-portal/apply">View Application</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {applicationStatus === "approved" && (
        <Tabs defaultValue="overview" className="mt-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="funding">Funding</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="news">News</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Funding Opportunities</CardTitle>
                  <CardDescription>Manage your listings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{recentFundingOpportunities.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Active opportunities
                  </p>
                  <Button className="w-full mt-4" size="sm" asChild>
                    <Link href="/dashboard/ecosystem-builder-portal/funding">
                      Manage Funding
                    </Link>
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Bookings</CardTitle>
                  <CardDescription>Space reservations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{upcomingBookings.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Upcoming bookings
                  </p>
                  <Button className="w-full mt-4" size="sm" asChild>
                    <Link href="/dashboard/ecosystem-builder-portal/bookings">
                      Manage Bookings
                    </Link>
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">News & Updates</CardTitle>
                  <CardDescription>Your recent publications</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{recentNews.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Published in last 30 days
                  </p>
                  <Button className="w-full mt-4" size="sm" asChild>
                    <Link href="/dashboard/ecosystem-builder-portal/news">
                      Manage News
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Funding Opportunities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {recentFundingOpportunities.map((opportunity) => (
                      <div key={opportunity.id} className="flex items-center justify-between p-2 border rounded-md">
                        <div>
                          <div className="font-medium">{opportunity.title}</div>
                          <div className="text-sm text-muted-foreground">{opportunity.applicants} Applicants</div>
                        </div>
                        <Badge variant={opportunity.status === "Active" ? "default" : "outline"}>
                          {opportunity.status}
                        </Badge>
                      </div>
                    ))}
                    <Button variant="ghost" size="sm" className="w-full mt-2" asChild>
                      <Link href="/dashboard/ecosystem-builder-portal/funding">View All</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {upcomingBookings.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-2 border rounded-md">
                        <div>
                          <div className="font-medium">{booking.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {booking.date} • {booking.time}
                          </div>
                        </div>
                        <Badge variant="outline">{booking.attendees} Attendees</Badge>
                      </div>
                    ))}
                    <Button variant="ghost" size="sm" className="w-full mt-2" asChild>
                      <Link href="/dashboard/ecosystem-builder-portal/bookings">View All</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="funding" className="mt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Your Funding Opportunities</CardTitle>
                  <Button size="sm" asChild>
                    <Link href="/dashboard/ecosystem-builder-portal/funding/create">
                      Create New
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentFundingOpportunities.map((opportunity) => (
                    <div key={opportunity.id} className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <div className="font-medium">{opportunity.title}</div>
                        <div className="text-sm text-muted-foreground">{opportunity.applicants} Applicants</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={opportunity.status === "Active" ? "default" : "outline"}>
                          {opportunity.status}
                        </Badge>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/ecosystem-builder-portal/funding/${opportunity.id}`}>
                            Manage
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings" className="mt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Manage Bookings</CardTitle>
                  <Button size="sm" asChild>
                    <Link href="/dashboard/ecosystem-builder-portal/bookings/calendar">
                      View Calendar
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <div className="font-medium">{booking.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {booking.date} • {booking.time}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{booking.attendees} Attendees</Badge>
                        <Button variant="outline" size="sm">
                          Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="news" className="mt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Your News & Updates</CardTitle>
                  <Button size="sm" asChild>
                    <Link href="/dashboard/ecosystem-builder-portal/news/create">
                      Create New
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentNews.map((newsItem) => (
                    <div key={newsItem.id} className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <div className="font-medium">{newsItem.title}</div>
                        <div className="text-sm text-muted-foreground">
                          Published: {newsItem.date} • {newsItem.views} views
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/ecosystem-builder-portal/news/${newsItem.id}`}>
                          Edit
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {applicationStatus === "none" && (
        <div className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Become a Verified Ecosystem Builder</CardTitle>
              <CardDescription>
                Join the Ethiopian startup ecosystem as an official ecosystem builder.
                Get verified to showcase your services and connect with startups.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">List Funding Opportunities</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Publish your funding opportunities directly on the platform for startups to discover and apply.
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Manage Space Bookings</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Showcase your coworking space and easily manage reservations through the platform.
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Share News & Updates</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Keep the ecosystem informed about your latest initiatives, events, and opportunities.
                    </p>
                  </div>
                </div>
                <div className="flex justify-center">
                  <Button size="lg" asChild>
                    <Link href="/dashboard/ecosystem-builder-portal/apply">Apply Now</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {applicationStatus === "rejected" && (
        <Card className="mt-6">
          <CardHeader className="pb-3">
            <CardTitle>Application Status</CardTitle>
            <CardDescription>
              Your ecosystem builder application has been reviewed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-100 rounded-md">
                <h3 className="text-red-600 font-medium mb-1">Application Rejected</h3>
                <p className="text-sm text-muted-foreground">
                  Unfortunately, your application did not meet our current criteria for ecosystem builders.
                  Please review the feedback below and consider reapplying.
                </p>
              </div>
              <div className="p-4 border rounded-md">
                <h3 className="font-medium mb-1">Feedback</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Your application was missing required documentation about your organization's history
                  and impact on the local ecosystem. Please provide evidence of at least 1 year of
                  supporting startups in Ethiopia.
                </p>
                <Button asChild>
                  <Link href="/dashboard/ecosystem-builder-portal/apply">Reapply</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
