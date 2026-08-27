"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  Building2,
  Calendar,
  ChevronRight,
  AlertCircle,
  FileCheck,
  Bookmark,
  HandCoins,
  BookOpen,
  Star,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

const stats: any[] = [];
const deadlines: any[] = [];
const resources: any[] = [];

const progressReports: any[] = [];

const notifications: any[] = [];

export default function DashboardPage() {
  const { data: session } = useSession();
  const user = session?.user;

  // Helper function for progress color
  const getProgressColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-gray-200";
      case "in-progress":
        return "bg-[#2863e9]";
      case "completed":
        return "bg-green-500";
      default:
        return "bg-gray-200";
    }
  };

  const [statusData, setStatusData] = React.useState<any>(null);
  const [isStatusLoading, setIsStatusLoading] = React.useState(true);
  const [isRenewing, setIsRenewing] = React.useState(false);

  React.useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await fetch('/api/startups/my-status');
        const data = await res.json();
        if (data.success) {
          setStatusData(data);
        }
      } catch (err) {
        console.error("Failed to fetch startup status", err);
      } finally {
        setIsStatusLoading(false);
      }
    }
    fetchStatus();
  }, []);

  const handleRenew = async () => {
    setIsRenewing(true);
    try {
      const res = await fetch('/api/startups/renew', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        window.location.href = `/dashboard/funding/my-applications`; // Or redirect directly to the new app edit page if we had the ID
      } else {
        toast.error(data.error || "Failed to start renewal process");
      }
    } catch (err) {
      toast.error("An error occurred while initiating renewal.");
    } finally {
      setIsRenewing(false);
    }
  };

  const userName = (user as any)?.firstName || (user?.name?.split(" ")[0]) || user?.name || "User";

  return (
    <div className="space-y-6 px-4 sm:px-6 pt-6">
      {/* Welcome section with quick action buttons */}
      <div className="flex flex-col space-y-2 md:flex-row md:justify-between md:items-center">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Welcome, <span className="capitalize">{userName}</span>!
          </h2>
        </div>
        <div className="flex gap-2 flex-wrap md:flex-nowrap">
          <Button size="sm" asChild>
            <Link href="/dashboard/application/apply">Apply New Startup Application</Link>
          </Button>
        </div>
      </div>

      {/* 🚀 SOVEREIGN CERTIFICATION STATUS MONITOR */}
      {!isStatusLoading && statusData?.hasCertificate && (
        <Card className={`border-2 overflow-hidden relative ${statusData.startup.daysLeft < 30 ? 'border-amber-400 bg-amber-50/50' : 'border-emerald-200 bg-emerald-50/30'}`}>
          <div className={`absolute top-0 left-0 w-1.5 h-full ${statusData.startup.daysLeft < 30 ? 'bg-amber-400' : 'bg-emerald-500'}`} />
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-2xl ${statusData.startup.daysLeft < 30 ? 'bg-amber-100/50' : 'bg-emerald-100/50'}`}>
                  {statusData.startup.daysLeft < 30 ? (
                    <AlertCircle className={`h-6 w-6 text-amber-600`} />
                  ) : (
                    <ShieldCheck className={`h-6 w-6 text-emerald-600`} />
                  )}
                </div>
                <div className="space-y-1">
                  <h3 className="font-black text-brand-deep-dark uppercase tracking-tight flex items-center gap-2">
                    National Startup Certification
                    <Badge className={`${statusData.startup.daysLeft < 0 ? 'bg-red-500' : statusData.startup.daysLeft < 30 ? 'bg-amber-500' : 'bg-emerald-500'} text-white text-[9px] px-2 py-0`}>
                      {statusData.startup.daysLeft < 0 ? 'EXPIRED' : statusData.startup.status}
                    </Badge>
                  </h3>
                  <p className="text-sm text-slate-600 font-medium max-w-xl leading-relaxed">
                    Your certification as a <span className="text-brand-deep-dark font-bold">{statusData.startup.level}</span> is {statusData.startup.daysLeft < 0 ? 'expired' : 'active'}. 
                    {statusData.startup.daysLeft < 0 ? (
                      <span className="text-red-600 font-bold ml-1">Your certification expired {Math.abs(statusData.startup.daysLeft)} days ago. Please renew immediately.</span>
                    ) : statusData.startup.daysLeft < 30 ? (
                      <span className="text-amber-600 font-bold ml-1">Audit expires in {statusData.startup.daysLeft} days. Renewal recommended.</span>
                    ) : (
                      <span className="text-emerald-600 font-bold ml-1">Valid for another {statusData.startup.daysLeft} days.</span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                 <Button asChild variant="outline" className="border-slate-200 text-brand-deep-dark font-bold hover:bg-white">
                   <Link href={`/certificate/${statusData.startup.certificateId}`}>View Certificate</Link>
                 </Button>
                 <Button 
                   onClick={handleRenew} 
                   disabled={isRenewing}
                    className="bg-brand-deep-dark hover:bg-brand-deep-dark/90 text-white font-black uppercase tracking-widest text-xs px-6"
                 >
                   {isRenewing ? 'Starting...' : 'Renew Now'}
                 </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      {/* Alert banner for critical items */}

      {/* Main dashboard grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Funding Applications"
          value={0}
          description="Across all programs"
          icon={<HandCoins className="h-4 w-4 text-[#2863e9]" />}
        />
        <StatsCard
          title="Approved"
          value={0}
          description="0% success rate"
          icon={<CheckCircle2 className="h-4 w-4 text-green-500" />}
        />
        <StatsCard
          title="Pending Reports"
          value={0}
          description="No pending reports"
          icon={<FileCheck className="h-4 w-4 text-amber-500" />}
        />
        <StatsCard
          title="Upcoming Deadlines"
          value={0}
          description="No upcoming deadlines"
          icon={<Calendar className="h-4 w-4 text-red-500" />}
        />
      </div>

      {/* Priority tasks section */}
      {deadlines.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-medium">Priority Tasks</h3>
            <Button variant="ghost" size="sm" className="gap-1" asChild>
              <Link href="/dashboard/tasks">
                View All <ChevronRight className="h-3 w-3" />
              </Link>
            </Button>
          </div>
          <div className="space-y-3">
            {deadlines
              .filter((d: any) => d.daysLeft <= 14)
              .map((deadline: any) => (
                <Card key={deadline.id} className="overflow-hidden">
                  <div
                    className={`h-1 ${deadline.daysLeft <= 5 ? "bg-red-500" : "bg-amber-500"}`}
                  />
                  <CardContent className="p-4 pt-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar
                            className={`h-4 w-4 ${deadline.daysLeft <= 5 ? "text-red-500" : "text-amber-500"}`}
                          />
                          <span className="font-medium">{deadline.title}</span>
                          <Badge
                            variant={deadline.daysLeft <= 5 ? "destructive" : "outline"}
                            className="ml-2"
                          >
                            {deadline.daysLeft} days left
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Grant application due on {deadline.deadline}
                        </p>
                      </div>
                      <Button size="sm" asChild>
                        <Link href={`/dashboard/funding/opportunities/${deadline.id}/apply`}>
                          Apply
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      )}

      {/* Two-column layout for wider screens */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Important notices */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Important Notices
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="flex gap-3 pb-3 border-b last:border-0 last:pb-0"
              >
                <div
                  className={`w-2 h-2 rounded-full mt-2 ${notification.type === "alert" ? "bg-red-500" : "bg-[#2863e9]"}`}
                ></div>
                <div>
                  <p className="font-medium">{notification.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {notification.date}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="ghost" size="sm" className="gap-1" asChild>
              <Link href="/dashboard/notifications">
                View All Notifications <ChevronRight className="h-3 w-3" />
              </Link>
            </Button>
          </CardFooter>
        </Card>


      </div>

      {/* Resource section */}
      {resources.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-medium">Essential Resources</h3>
            <Button variant="ghost" size="sm" className="gap-1" asChild>
              <Link href="/dashboard/documents">
                Browse Library <ChevronRight className="h-3 w-3" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {resources.map((resource: any) => (
              <Card key={resource.id} className="flex flex-col">
                <CardHeader className="pb-2 flex-grow">
                  <div className="flex justify-between items-start">
                    <Badge variant="secondary" className="mb-2">
                      {resource.type}
                    </Badge>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <Bookmark className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardTitle className="text-base">{resource.title}</CardTitle>
                  <CardDescription className="text-xs">
                    {resource.downloads} downloads
                  </CardDescription>
                </CardHeader>
                <CardFooter className="pt-0">
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href="/dashboard/documents">Download</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
