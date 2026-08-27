"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Edit,
  Download,
  Share2,
  AlertCircle,
  Activity,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getStartupById } from "../actions";
import { StartupInfoSection } from "./components/startup-info-section";
import { CertificationSection } from "./components/certification-section";
import { FinancialsSection } from "./components/financials-section";
import { TeamSection } from "./components/team-section";
import { DocumentsSection } from "./components/documents-section";
import { ActivitySection } from "./components/activity-section";

export default function StartupDetailsPage() {
  const params = useParams();
  const id = params.id as string;

  const [startup, setStartup] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    async function loadStartup() {
      setIsLoading(true);
      try {
        const res = await getStartupById(id);
        if (res.success && res.data) {
          setStartup(res.data);
        } else {
          setError(res.message || "Failed to load startup");
        }
      } catch (err) {
        setError("An unexpected error occurred");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    if (id) {
      loadStartup();
    }
  }, [id]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <Activity className="h-16 w-16 text-primary animate-spin mb-4" />
        <h1 className="text-2xl font-bold mb-2">Loading Startup...</h1>
      </div>
    );
  }

  // If startup not found or error, show an error state
  if (error || !startup) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <AlertCircle className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-2">Startup Not Found</h1>
        <p className="text-muted-foreground mb-6">
          {error || `The startup with ID ${id} could not be found.`}
        </p>
        <Button asChild>
          <Link href="/admins-new/startups">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Startups
          </Link>
        </Button>
      </div>
    );
  }

  // Certification status badge variant
  const statusVariant =
    startup.status === "Certified"
      ? "success"
      : startup.status === "Pending"
        ? "outline"
        : startup.status === "Under Review"
          ? "warning"
          : "destructive";

  return (
    <div className="p-6 bg-gray-50">
      {/* Header with back button */}
      <div className="flex items-center mb-6">
        <Button variant="outline" size="icon" asChild className="mr-4">
          <Link href="/admins-new/startups">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center">
            {startup.name}
            <Badge variant={statusVariant} className="ml-3">
              {startup.status}
            </Badge>
          </h1>
          <p className="text-muted-foreground">
            {startup.id} • {startup.sector}
          </p>
        </div>

        <div className="ml-auto flex gap-2">
          <Button variant="outline">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button asChild>
            <Link href={`/admins-new/startups/${startup.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      {/* Main content with tabs */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left column - Startup info */}
        <div className="col-span-1 space-y-6">
          <StartupInfoSection startup={startup} />

          {/* Certification info */}
          <CertificationSection startup={startup} />
        </div>

        {/* Right column - Tabs with detailed content */}
        <div className="col-span-2">
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="team">Team</TabsTrigger>
              <TabsTrigger value="financials">Financials</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            {/* Overview tab */}
            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Startup Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{startup.description}</p>

                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium mb-2">Core Products</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Enterprise Resource Planning (ERP) software</li>
                        <li>Business process automation solutions</li>
                        <li>Custom software development</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Target Market</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Medium to large Ethiopian enterprises</li>
                        <li>Government agencies</li>
                        <li>Financial institutions</li>
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="font-medium mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {startup.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Business Model</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium mb-2">Revenue Model</h3>
                      <p>
                        Subscription-based SaaS model with annual enterprise
                        contracts
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">
                        Competitive Advantage
                      </h3>
                      <p>
                        Localized solutions specifically designed for Ethiopian
                        business environments
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Growth Strategy</h3>
                      <p>
                        Expanding into neighboring East African countries and
                        diversifying product offerings
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Challenges</h3>
                      <p>
                        Limited access to capital and technical talent pool in
                        the local market
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Team tab */}
            <TabsContent value="team">
              <TeamSection startup={startup} />
            </TabsContent>

            {/* Financials tab */}
            <TabsContent value="financials">
              <FinancialsSection startup={startup} />
            </TabsContent>

            {/* Documents tab */}
            <TabsContent value="documents">
              <DocumentsSection startup={startup} />
            </TabsContent>

            {/* Activity tab */}
            <TabsContent value="activity">
              <ActivitySection startup={startup} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
