"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Building2,
  Calendar,
  FileText,
  Briefcase,
  Clock,
  CheckCircle,
  AlertCircle,
  ClipboardCheck,
  Mail,
  Loader2
} from 'lucide-react';

type ApplicationStatus = "none" | "draft" | "pending" | "under_review" | "certified" | "rejected";

type EcosystemApplication = {
  id: string;
  status: "draft" | "pending" | "under_review" | "certified" | "rejected";
  name: string;
  certificate: { certificateNumber: string; issuedAt: string } | null;
};

type BookingItem = {
  id: string;
  status: string;
  createdAt: string;
  spaceName: string;
  clientName: string;
};

type EventItem = {
  id: string;
  title: string;
  date: string;
  time: string;
  status: string;
  registeredAttendees: number;
};

type NewsItem = {
  id: string;
  title: string;
  status: string;
  createdAt: string;
};

type ActivityItem = {
  id: string;
  type: "booking" | "news";
  title: string;
  description: string;
  timestamp: string;
};

export default function EcosystemBuilderDashboard() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState<EcosystemApplication | null>(null);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [fundingCount, setFundingCount] = useState<number | null>(null); // null = locked (not certified yet)

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [applicationRes, bookingsRes, eventsRes, newsRes, fundingRes] = await Promise.allSettled([
        fetch("/api/ecosystem-builder/application").then((r) => r.json()),
        fetch("/api/ecosystem-builder/bookings").then((r) => r.json()),
        fetch("/api/ecosystem-builder/events").then((r) => r.json()),
        fetch("/api/ecosystem-builder/news").then((r) => r.json()),
        fetch("/api/ecosystem-builder/funding").then((r) => r.json()),
      ]);

      if (cancelled) return;

      if (applicationRes.status === "fulfilled" && applicationRes.value?.success) {
        setApplication(applicationRes.value.data[0] ?? null);
      }
      if (bookingsRes.status === "fulfilled" && bookingsRes.value?.success) {
        setBookings(bookingsRes.value.data ?? []);
      }
      if (eventsRes.status === "fulfilled" && eventsRes.value?.success) {
        setEvents(eventsRes.value.data ?? []);
      }
      if (newsRes.status === "fulfilled" && newsRes.value?.success) {
        setNews(newsRes.value.data ?? []);
      }
      if (fundingRes.status === "fulfilled" && fundingRes.value?.success) {
        setFundingCount((fundingRes.value.data ?? []).length);
      }
      // funding stays null (locked) if the request 403'd - expected for uncertified builders

      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const applicationStatus: ApplicationStatus = application?.status ?? "none";
  const displayName = application?.name || session?.user?.name || "Ecosystem Builder";

  const activeBookings = bookings.filter((b) => b.status === "pending" || b.status === "confirmed").length;
  const upcomingEventsList = events.filter((e) => e.status === "upcoming");
  const publishedNews = news.filter((n) => n.status === "published").length;

  const recentActivity: ActivityItem[] = [
    ...bookings.slice(0, 5).map((b) => ({
      id: b.id,
      type: "booking" as const,
      title: "Space booking",
      description: `${b.clientName} booked ${b.spaceName}`,
      timestamp: b.createdAt,
    })),
    ...news.slice(0, 5).map((n) => ({
      id: n.id,
      type: "news" as const,
      title: n.status === "published" ? "News article published" : "News article drafted",
      description: n.title,
      timestamp: n.createdAt,
    })),
  ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return "just now";
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    }
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  };

  const getApplicationStatusDisplay = () => {
    switch (applicationStatus) {
      case "certified":
        return (
          <div className="flex items-center space-x-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            <span>Approved &amp; Certified</span>
          </div>
        );
      case "pending":
      case "under_review":
        return (
          <div className="flex items-center space-x-2 text-amber-600">
            <Clock className="h-5 w-5" />
            <span>Application Under Review</span>
          </div>
        );
      case "rejected":
        return (
          <div className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <span>Application Needs Revision</span>
          </div>
        );
      case "draft":
        return (
          <div className="flex items-center space-x-2 text-blue-600">
            <ClipboardCheck className="h-5 w-5" />
            <span>Application Draft In Progress</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center space-x-2 text-blue-600">
            <ClipboardCheck className="h-5 w-5" />
            <span>Apply for Certification</span>
          </div>
        );
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "booking":
        return <Building2 className="h-5 w-5 text-purple-500" />;
      case "news":
        return <FileText className="h-5 w-5 text-blue-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with welcome message and certification status */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome, {displayName}</h1>
          <p className="text-muted-foreground mt-1">
            Ecosystem Builder Dashboard
          </p>
        </div>

        <div className="flex flex-col items-end">
          {applicationStatus === "certified" ? (
            <div className="text-right">
              <Badge className="bg-green-500 text-white mb-1">Certified Ecosystem Builder</Badge>
              {application?.certificate && (
                <p className="text-sm text-muted-foreground">
                  Certification #{application.certificate.certificateNumber}<br />
                  Issued on {formatDate(application.certificate.issuedAt)}
                </p>
              )}
            </div>
          ) : (
            <Button asChild>
              <Link href={applicationStatus === "none" || applicationStatus === "draft" ? "/ecosystem-builder/apply" : "/ecosystem-builder/application"}>
                {applicationStatus === "none" ? "Apply for Certification" :
                  applicationStatus === "draft" ? "Continue Application" :
                    applicationStatus === "rejected" ? "Review & Resubmit" :
                      "View Application"}
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Funding Opportunities</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fundingCount ?? "—"}</div>
            <p className="text-xs text-muted-foreground">
              {fundingCount === null ? "Available once certified" : `${fundingCount} posted`}
            </p>
          </CardContent>
          <CardFooter className="p-2">
            <Link
              href="/ecosystem-builder/funding"
              className="text-xs text-blue-600 hover:underline"
            >
              Manage funding
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Space Bookings</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeBookings}</div>
            <p className="text-xs text-muted-foreground">Active reservations</p>
          </CardContent>
          <CardFooter className="p-2">
            <Link
              href="/ecosystem-builder/bookings"
              className="text-xs text-blue-600 hover:underline"
            >
              Manage bookings
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Events & Programs</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingEventsList.length}</div>
            <p className="text-xs text-muted-foreground">Upcoming events</p>
          </CardContent>
          <CardFooter className="p-2">
            <Link
              href="/ecosystem-builder/events"
              className="text-xs text-blue-600 hover:underline"
            >
              View calendar
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">News & Updates</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{publishedNews}</div>
            <p className="text-xs text-muted-foreground">Published articles</p>
          </CardContent>
          <CardFooter className="p-2">
            <Link
              href="/ecosystem-builder/news"
              className="text-xs text-blue-600 hover:underline"
            >
              Manage content
            </Link>
          </CardFooter>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="events">Upcoming Events</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Application Status or Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>
                {applicationStatus === "certified"
                  ? "Quick Actions"
                  : "Application Status"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {applicationStatus === "certified" ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Button asChild variant="outline" size="lg" className="h-24 flex flex-col justify-center">
                    <Link href="/ecosystem-builder/funding">
                      <Briefcase className="h-6 w-6 mb-2" />
                      <span>Manage Funding</span>
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="h-24 flex flex-col justify-center">
                    <Link href="/ecosystem-builder/news">
                      <FileText className="h-6 w-6 mb-2" />
                      <span>Manage News</span>
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="h-24 flex flex-col justify-center">
                    <Link href="/ecosystem-builder/events">
                      <Calendar className="h-6 w-6 mb-2" />
                      <span>Manage Events</span>
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="h-24 flex flex-col justify-center">
                    <Link href="/ecosystem-builder/bookings">
                      <Building2 className="h-6 w-6 mb-2" />
                      <span>Manage Bookings</span>
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="h-24 flex flex-col items-center justify-center bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100">
                    <Link href="/ecosystem-builder/messages">
                      <Mail className="h-6 w-6 mb-2" />
                      <span>Support Hub</span>
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      {getApplicationStatusDisplay()}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button asChild variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                        <Link href="/ecosystem-builder/messages">
                          <Mail className="h-4 w-4 mr-2" />
                          Messages
                        </Link>
                      </Button>
                      <Button asChild>
                        <Link href={applicationStatus === "none" || applicationStatus === "draft" ? "/ecosystem-builder/apply" : "/ecosystem-builder/application"}>
                          {applicationStatus === "none" ? "Start Application" :
                            applicationStatus === "draft" ? "Continue Application" :
                              applicationStatus === "rejected" ? "Resubmit Application" :
                                "View Details"}
                        </Link>
                      </Button>
                    </div>
                  </div>

                  {(applicationStatus === "pending" || applicationStatus === "under_review") && (
                    <div className="bg-amber-50 p-4 rounded-md">
                      <p className="text-amber-800 text-sm">
                        Your application is currently under review. This process typically takes 3-5 business days.
                        You will receive an email notification once a decision has been made.
                      </p>
                    </div>
                  )}

                  {applicationStatus === "rejected" && (
                    <div className="bg-red-50 p-4 rounded-md">
                      <p className="text-red-800 text-sm">
                        Your application requires some revisions before it can be approved.
                        Please review the feedback provided and resubmit your application.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your latest actions and updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {recentActivity.map((item) => (
                  <div key={`${item.type}-${item.id}`} className="flex">
                    <div className="mr-4">
                      {getActivityIcon(item.type)}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {item.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatTimeAgo(item.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}

                {recentActivity.length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">No recent activity</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>
                Events you can attend or manage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingEventsList.map((event) => (
                  <div key={event.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div className="flex items-start space-x-4">
                      <div className="p-2 bg-amber-50 rounded-md">
                        <Calendar className="h-5 w-5 text-amber-500" />
                      </div>
                      <div>
                        <h4 className="font-medium">{event.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(event.date)} at {event.time} · {event.registeredAttendees} attendees
                        </p>
                      </div>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/ecosystem-builder/events?id=${event.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                ))}

                {upcomingEventsList.length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">No upcoming events</p>
                    <Button asChild className="mt-2">
                      <Link href="/ecosystem-builder/events">
                        Schedule New Event
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/ecosystem-builder/events">
                  Manage All Events
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
