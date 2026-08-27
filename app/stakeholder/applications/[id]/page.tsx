import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { format, formatDistanceToNow } from "date-fns";
import {
  ArrowLeftIcon,
  Users,
  FileText,
  Download,
  Calendar,
  Clock,
  Building,
  UserCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { DocumentPreview } from "@/components/document-preview";

import db from "@/lib/db";
import { authOptions } from "@/lib/auth";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

const statusConfig: Record<
  string,
  {
    badge: string;
    progress: number;
    title: string;
    description: string;
  }
> = {
  DRAFT: {
    badge: "bg-gray-100 text-gray-800",
    progress: 10,
    title: "Draft",
    description: "This application is still in draft.",
  },
  PENDING: {
    badge: "bg-blue-100 text-blue-800",
    progress: 30,
    title: "Pending Review",
    description: "Application is waiting for initial screening.",
  },
  UNDER_REVIEW: {
    badge: "bg-yellow-100 text-yellow-800",
    progress: 50,
    title: "Under Review",
    description: "Application is currently being reviewed.",
  },
  REVIEWED: {
    badge: "bg-purple-100 text-purple-800",
    progress: 70,
    title: "Reviewed",
    description: "Initial screening passed.",
  },
  ASSIGNED_TO_COMMITTEE: {
    badge: "bg-blue-100 text-blue-800",
    progress: 85,
    title: "Committee Assigned",
    description: "Assigned to a committee for evaluation.",
  },
  IN_COMMITTEE_REVIEW: {
    badge: "bg-indigo-100 text-indigo-800",
    progress: 90,
    title: "In Committee Review",
    description: "Currently being evaluated by the committee.",
  },
  COMMITTEE_REVIEW_SUBMITTED: {
    badge: "bg-cyan-100 text-cyan-800",
    progress: 95,
    title: "Review Submitted",
    description: "Committee has submitted evaluation results.",
  },
  CERTIFIED: {
    badge: "bg-green-100 text-green-800",
    progress: 100,
    title: "Certified",
    description: "Application approved and certified.",
  },
  REJECTED: {
    badge: "bg-red-100 text-red-800",
    progress: 100,
    title: "Rejected",
    description: "Application was not approved.",
  },
};

function renderText(value: string | null | undefined) {
  return value && value.trim() ? value : "Not provided";
}

export default async function StakeholderApplicationDetailsPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "STAKEHOLDER") {
    redirect("/auth/sign-in");
  }

  const { id } = await params;
  const stakeholderId = session.user.stakeholderId;

  const application = await db.application.findFirst({
    where: {
      id,
      startup: {
        formalRequests: {
          some: {
            recipientStakeholderId: stakeholderId!,
          }
        }
      }
    },
    include: {
      founders: true,
      statusHistory: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!application) {
    notFound();
  }

  const status = statusConfig[application.status] ?? {
    badge: "bg-gray-100 text-gray-800",
    progress: 0,
    title: application.status.replaceAll("_", " "),
    description: "Application status information unavailable.",
  };

  return (
    <div className="p-6 bg-gray-50 max-w-7xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild className="rounded-xl border-slate-200 shadow-sm">
            <Link href="/stakeholder/requests">
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Back to Requests
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-black text-brand-deep-dark tracking-tight leading-tight">Startup Dossier</h1>
            <p className="text-slate-500 font-bold text-sm tracking-tight">Full ecosystem profile and application metadata.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge className={`${status.badge} px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest border-transparent`}>{status.title}</Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Organization Details */}
          <Card className="border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="flex items-center gap-2 text-brand-deep-dark">
                <Building className="h-5 w-5 text-brand-mint-teal" />
                Organization Details
              </CardTitle>
              <CardDescription className="font-bold">
                {renderText(application.startupName)} • Submitted{" "}
                {formatDistanceToNow(new Date(application.createdAt), {
                  addSuffix: true,
                })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                <div>
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Startup Name</Label>
                  <p className="font-bold text-slate-800">{renderText(application.startupName)}</p>
                </div>
                <div>
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Registration Number</Label>
                  <p className="font-bold text-slate-800">{renderText(application.businessLicense)}</p>
                </div>
                <div>
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">TIN Number</Label>
                  <p className="font-bold text-slate-800">{renderText(application.tin)}</p>
                </div>
                <div>
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Employees</Label>
                  <p className="font-bold text-slate-800">{application.numberOfEmployees ?? "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Industry</Label>
                  <p className="font-bold text-slate-800">{renderText(application.industry)}</p>
                </div>
                <div>
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Stage</Label>
                  <p className="font-bold text-slate-800">{renderText(application.typeOfCompany)}</p>
                </div>
                <div className="col-span-2">
                   <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Business Email</Label>
                   <p className="font-bold text-slate-800">{renderText(application.email)}</p>
                </div>
                {application.website && (
                  <div className="col-span-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Website</Label>
                    <p className="font-bold text-brand-mint-teal underline">
                      <a href={application.website} target="_blank" rel="noopener noreferrer">{application.website}</a>
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Founder Information */}
          <Card className="border border-slate-200 shadow-xl shadow-slate-200/50">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="text-brand-deep-dark flex items-center gap-2">
                <Users className="h-5 w-5 text-brand-mint-teal" />
                Founding Team
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {application.founders.map((founder) => (
                <div key={founder.id} className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="font-black text-slate-800">{founder.fullName}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{founder.role}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-600">{founder.email}</p>
                    <p className="text-[10px] font-black text-slate-400">{founder.phone}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Core Business Details */}
          <Card className="border border-slate-200 shadow-xl shadow-slate-200/50">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="text-brand-deep-dark">Innovation & Strategy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {[
                { label: "Business Description", value: application.productDescription },
                { label: "Problem Statement", value: application.problemStatement },
                { label: "Proposed Solution", value: application.solution },
                { label: "Target Market", value: application.targetMarket },
                { label: "Competitive Advantage", value: application.competitiveAdvantage },
              ].map((section, idx) => (
                <div key={idx} className="space-y-2">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">{section.label}</h4>
                  <div className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100 text-slate-700 leading-relaxed font-medium text-sm">
                    {renderText(section.value)}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Financials */}
          <Card className="border border-slate-200 shadow-xl shadow-slate-200/50">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="text-brand-deep-dark">Financial Snapshot</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-2 gap-6">
               <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Revenue Status</span>
                  <p className="font-black text-2xl text-slate-800">{renderText(application.revenue)}</p>
               </div>
               <div className="p-4 rounded-2xl bg-brand-mint-teal/5 border border-brand-mint-teal/10">
                  <span className="text-[9px] font-black text-brand-mint-teal uppercase tracking-widest font-black">Funding Raised</span>
                  <p className="font-black text-2xl text-brand-deep-dark">{renderText(application.totalFundingRaised)}</p>
               </div>
               <div className="col-span-2 p-4 rounded-2xl bg-white border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Use of Funds</span>
                  <p className="text-sm font-medium text-slate-700 leading-relaxed">{renderText(application.useOfFunds)}</p>
               </div>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card className="border border-slate-200 shadow-xl shadow-slate-200/50">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="flex items-center gap-2 text-brand-deep-dark">
                <FileText className="h-5 w-5 text-brand-mint-teal" />
                Verification Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {[
                { label: "Business Registration", id: application.businessLicenseFileId },
                { label: "Articles of Incorporation", id: application.articlesOfIncorpFileId },
                { label: "Financial Records", id: application.financialsFileId },
              ].map((doc, idx) => (
                doc.id && (
                  <DocumentPreview key={idx} label={doc.label} fileId={doc.id} />
                )
              ))}
              {application.pitchDeckFileId && (
                 <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-white">
                    <div className="flex items-center gap-3">
                       <div className="p-2 rounded-xl bg-orange-50 text-orange-600">
                          <FileText className="h-5 w-5" />
                       </div>
                       <span className="font-black text-slate-800">Pitch Deck</span>
                    </div>
                    <Button size="sm" variant="outline" asChild className="rounded-xl font-bold">
                       <a href={`/api/files/${application.pitchDeckFileId}/download`} className="flex items-center gap-2">
                          <Download className="h-4 w-4" /> Download
                       </a>
                    </Button>
                 </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
           <Card className="border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
              <CardHeader className="bg-brand-deep-dark text-white">
                 <CardTitle className="text-lg">Vital Stats</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                 <div className="space-y-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Application Progress</span>
                    <Progress value={status.progress} className="h-2 bg-slate-100" />
                    <p className="text-right text-[10px] font-black text-brand-mint-teal">{status.progress}% COMPLETE</p>
                 </div>
                 
                 <Separator className="bg-slate-100" />
                 
                 <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <div>
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Submitted</p>
                       <p className="text-sm font-bold text-slate-700">{format(new Date(application.createdAt), "MMM d, yyyy")}</p>
                    </div>
                 </div>
                 
                 <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <div>
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Last Activity</p>
                       <p className="text-sm font-bold text-slate-700">{formatDistanceToNow(new Date(application.updatedAt), { addSuffix: true })}</p>
                    </div>
                 </div>
              </CardContent>
           </Card>
           
           <Card className="border-2 border-brand-mint-teal/20 bg-brand-mint-teal/[0.02]">
              <CardContent className="pt-6">
                 <div className="flex gap-3 mb-4">
                    <UserCheck className="h-5 w-5 text-brand-mint-teal shrink-0" />
                    <p className="text-xs font-bold text-slate-700 leading-relaxed italic">
                      This dossier is provided for evaluation purposes. All data is verified by the NSLP Administration.
                    </p>
                 </div>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}

const Separator = ({ className }: { className?: string }) => <div className={`h-px w-full ${className}`} />;
