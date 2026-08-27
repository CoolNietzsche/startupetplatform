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
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { DocumentPreview } from "@/components/document-preview";
import { AdminApplicationActions } from "@/components/admin-application-actions";
import { ApplicationFormalRequests } from "../components/ApplicationFormalRequests";
import StartupDocumentChecklist from "../components/StartupDocumentChecklist";

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
  }
> = {
  DRAFT: {
    badge: "bg-brand-deep-dark/[0.06] text-brand-deep-dark/70",
    progress: 10,
    title: "Draft",
  },
  PENDING: {
    badge: "bg-blue-50 text-blue-700",
    progress: 30,
    title: "Pending Review",
  },
  UNDER_REVIEW: {
    badge: "bg-brand-startup-amber/10 text-brand-startup-amber",
    progress: 50,
    title: "Under Review",
  },
  REVIEWED: {
    badge: "bg-purple-50 text-purple-700",
    progress: 70,
    title: "Reviewed",
  },
  ASSIGNED_TO_COMMITTEE: {
    badge: "bg-blue-50 text-blue-700",
    progress: 85,
    title: "Committee Assigned",
  },
  IN_COMMITTEE_REVIEW: {
    badge: "bg-indigo-50 text-indigo-700",
    progress: 90,
    title: "In Committee Review",
  },
  COMMITTEE_REVIEW_SUBMITTED: {
    badge: "bg-cyan-50 text-cyan-700",
    progress: 95,
    title: "Review Submitted",
  },
  CERTIFIED: {
    badge: "bg-brand-mint-teal/10 text-brand-mint-teal",
    progress: 100,
    title: "Certified",
  },
  REJECTED: {
    badge: "bg-red-50 text-red-700",
    progress: 100,
    title: "Rejected",
  },
};

function renderText(value: string | null | undefined) {
  return value && value.trim() ? value : "Not provided";
}

export default async function ApplicationDetailsPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  const { id } = await params;

  const role = session.user.role?.toUpperCase();
  const isAdmin =
    role === "ADMIN" || role === "SUPER_ADMIN" || role === "REVIEWER";

  const application = await db.application.findFirst({
    where: {
      id,
      OR: [
        ...(isAdmin ? [{ id }] : []),
        { userId: session.user.id },
      ],
    },
    include: {
      founders: true,
      statusHistory: {
        orderBy: {
          createdAt: "asc",
        },
      },
      assignments: {
        orderBy: { assignedAt: "desc" },
        take: 1,
        include: {
          committee: true,
          assignedBy: {
            select: { firstName: true, lastName: true, email: true },
          },
        },
      },
      startup: {
        select: { id: true },
      },
    },
  });

  if (!application) {
    notFound();
  }

  const status = statusConfig[application.status] ?? {
    badge: "bg-brand-deep-dark/[0.06] text-brand-deep-dark/70",
    progress: 0,
    title: application.status.replaceAll("_", " "),
  };

  const currentAssignment = application.assignments?.[0];

  return (
    <div className="p-6 bg-brand-deep-dark/[0.02]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admins-new/applications">
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Application Review</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge className={status.badge}>{status.title}</Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Assignment Info */}
          {currentAssignment && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Committee Assignment
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-sm text-brand-deep-dark/50">
                    Committee
                  </Label>
                  <p className="font-medium">
                    {currentAssignment.committee?.name || "N/A"}
                  </p>
                  <p className="text-sm text-brand-deep-dark/50">
                    {currentAssignment.committee?.entityType}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-brand-deep-dark/50">
                    Assigned By
                  </Label>
                  <p className="font-medium">
                    {[
                      currentAssignment.assignedBy?.firstName,
                      currentAssignment.assignedBy?.lastName,
                    ]
                      .filter(Boolean)
                      .join(" ") ||
                      currentAssignment.assignedBy?.email ||
                      "N/A"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-brand-deep-dark/50">
                    Status
                  </Label>
                  <p className="font-medium">
                    {currentAssignment.status.replaceAll("_", " ")}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Organization Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Organization Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-brand-deep-dark/50">
                    Startup Name
                  </Label>
                  <p className="font-medium">
                    {renderText(application.startupName)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-brand-deep-dark/50">
                    Business Registration Number
                  </Label>
                  <p className="font-medium">
                    {renderText(application.businessLicense)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-brand-deep-dark/50">
                    TIN Number
                  </Label>
                  <p className="font-medium">{renderText(application.tin)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-brand-deep-dark/50">
                    Number of Employees
                  </Label>
                  <p className="font-medium">
                    {application.numberOfEmployees ?? "Not provided"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-brand-deep-dark/50">
                    Capital (ETB)
                  </Label>
                  <p className="font-medium">
                    {renderText(application.vision)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-brand-deep-dark/50">
                    Founding Date
                  </Label>
                  <p className="font-medium">
                    {application.foundingDate
                      ? format(
                          new Date(application.foundingDate),
                          "MMM d, yyyy",
                        )
                      : "Not provided"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-brand-deep-dark/50">
                    Industry
                  </Label>
                  <p className="font-medium">
                    {renderText(application.industry)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-brand-deep-dark/50">
                    Stage
                  </Label>
                  <p className="font-medium">
                    {renderText(application.typeOfCompany)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-brand-deep-dark/50">
                    Website
                  </Label>
                  <p className="font-medium">
                    {application.website ? (
                      <a
                        href={application.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-mint-teal hover:underline"
                      >
                        {renderText(application.website)}
                      </a>
                    ) : (
                      "Not provided"
                    )}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-brand-deep-dark/50">
                    Business Email
                  </Label>
                  <p className="font-medium">{renderText(application.email)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-brand-deep-dark/50">
                    Alternative Email
                  </Label>
                  <p className="font-medium">
                    {renderText(application.alternateEmail)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-brand-deep-dark/50">
                    Phone Number
                  </Label>
                  <p className="font-medium">
                    {renderText(application.phoneNumber)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Founder Information */}
          <Card>
            <CardHeader>
              <CardTitle>Founder Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {application.founders.length > 0 ? (
                application.founders.map((founder) => (
                  <div
                    key={founder.id}
                    className="space-y-3 rounded-md border p-4"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-lg">
                        {renderText(founder.fullName)}
                      </p>
                      <Badge variant="outline">
                        {renderText(founder.role)}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <Label className="text-xs font-medium text-brand-deep-dark/50">
                          FCN
                        </Label>
                        <p className="font-medium">{renderText(founder.fcn)}</p>
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-brand-deep-dark/50">
                          Email
                        </Label>
                        <p className="font-medium">
                          {renderText(founder.email)}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-brand-deep-dark/50">
                          Phone
                        </Label>
                        <p className="font-medium">
                          {renderText(founder.phone)}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-brand-deep-dark/50">
                          Shares
                        </Label>
                        <p className="font-medium">
                          {founder.noOfShares ?? "Not provided"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-brand-deep-dark/50">
                  <UserCheck className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p>No founder information available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reviewer Information */}
          {application.reviewerId && (
            <Card>
              <CardHeader>
                <CardTitle>Reviewer Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-deep-dark/[0.06] rounded-full flex items-center justify-center">
                      <UserCheck className="h-5 w-5 text-brand-deep-dark/70" />
                    </div>
                    <div>
                      <p className="font-medium">Assigned Reviewer</p>
                      <p className="text-sm text-brand-deep-dark/50">
                        ID: {application.reviewerId}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Business Details & Innovation Assessment */}
          <Card>
            <CardHeader>
              <CardTitle>Business Details & Innovation Assessment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="rounded-md border bg-brand-deep-dark/[0.02] p-4">
                <p className="mb-2 text-brand-deep-dark/50">
                  Business Description
                </p>
                <p className="max-h-56 overflow-y-auto whitespace-pre-wrap break-words leading-7 pr-1">
                  {renderText(application.productDescription)}
                </p>
              </div>
              <div className="rounded-md border bg-brand-deep-dark/[0.02] p-4">
                <p className="mb-2 text-brand-deep-dark/50">Problem Statement</p>
                <p className="max-h-56 overflow-y-auto whitespace-pre-wrap break-words leading-7 pr-1">
                  {renderText(application.problemStatement)}
                </p>
              </div>
              <div className="rounded-md border bg-brand-deep-dark/[0.02] p-4">
                <p className="mb-2 text-brand-deep-dark/50">Solution</p>
                <p className="max-h-56 overflow-y-auto whitespace-pre-wrap break-words leading-7 pr-1">
                  {renderText(application.solution)}
                </p>
              </div>
              <div className="rounded-md border bg-brand-deep-dark/[0.02] p-4">
                <p className="mb-2 text-brand-deep-dark/50">
                  Innovation Description
                </p>
                <p className="max-h-56 overflow-y-auto whitespace-pre-wrap break-words leading-7 pr-1">
                  {renderText(application.innovationDescription)}
                </p>
              </div>
              <div className="rounded-md border bg-brand-deep-dark/[0.02] p-4">
                <p className="mb-2 text-brand-deep-dark/50">Target Market</p>
                <p className="max-h-56 overflow-y-auto whitespace-pre-wrap break-words leading-7 pr-1">
                  {renderText(application.targetMarket)}
                </p>
              </div>
              <div className="rounded-md border bg-brand-deep-dark/[0.02] p-4">
                <p className="mb-2 text-brand-deep-dark/50">
                  Competitive Advantage
                </p>
                <p className="max-h-56 overflow-y-auto whitespace-pre-wrap break-words leading-7 pr-1">
                  {renderText(application.competitiveAdvantage)}
                </p>
              </div>
              <div className="rounded-md border bg-brand-deep-dark/[0.02] p-4">
                <p className="mb-2 text-brand-deep-dark/50">Scalability Plan</p>
                <p className="max-h-56 overflow-y-auto whitespace-pre-wrap break-words leading-7 pr-1">
                  {renderText(application.scalabilityPlan)}
                </p>
              </div>
              <div className="rounded-md border bg-brand-deep-dark/[0.02] p-4">
                <p className="mb-2 text-brand-deep-dark/50">
                  Traction & Key Metrics
                </p>
                <p className="max-h-56 overflow-y-auto whitespace-pre-wrap break-words leading-7 pr-1">
                  {renderText(application.traction)}
                </p>
              </div>
              <div className="rounded-md border bg-brand-deep-dark/[0.02] p-4">
                <p className="mb-2 text-brand-deep-dark/50">Risk Assessment</p>
                <p className="max-h-56 overflow-y-auto whitespace-pre-wrap break-words leading-7 pr-1">
                  {renderText(application.riskAssessment)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Financial Information */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-brand-deep-dark/50">Annual Revenue (ETB)</p>
                  <p>{renderText(application.revenue)}</p>
                </div>
                <div>
                  <p className="text-brand-deep-dark/50">
                    Total Funding Raised (ETB)
                  </p>
                  <p>{renderText(application.totalFundingRaised)}</p>
                </div>
              </div>
              <div>
                <p className="text-brand-deep-dark/50">Investment Needed (ETB)</p>
                <p>{renderText(application.investmentNeeded)}</p>
              </div>
              <div className="rounded-md border bg-brand-deep-dark/[0.02] p-4">
                <p className="mb-2 text-brand-deep-dark/50">Use of Funds</p>
                <p className="max-h-56 overflow-y-auto whitespace-pre-wrap break-words leading-7 pr-1">
                  {renderText(application.useOfFunds)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Decision Information */}
          {application.reason && (
            <Card>
              <CardHeader>
                <CardTitle>Decision Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  className={`rounded-md border p-4 ${
                    application.status === "REJECTED"
                      ? "bg-red-50"
                      : application.status === "ROLLED_BACK"
                        ? "bg-amber-50"
                        : "bg-brand-deep-dark/[0.02]"
                  }`}
                >
                  <p
                    className={`mb-2 font-medium ${
                      application.status === "REJECTED"
                        ? "text-red-700"
                        : application.status === "ROLLED_BACK"
                          ? "text-amber-700"
                          : "text-brand-deep-dark/70"
                    }`}
                  >
                    {application.status === "REJECTED"
                      ? "Rejection Reason"
                      : application.status === "ROLLED_BACK"
                        ? "Rollback Reason"
                        : "Decision Reason"}
                  </p>
                  <p
                    className={`text-sm whitespace-pre-wrap break-words ${
                      application.status === "REJECTED"
                        ? "text-red-600"
                        : application.status === "ROLLED_BACK"
                          ? "text-amber-600"
                          : "text-brand-deep-dark/50"
                    }`}
                  >
                    {application.reason}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Formal Request Oversight */}
          {application.startup?.id && (
            <ApplicationFormalRequests startupId={application.startup.id} />
          )}

          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Supporting Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {application.businessLicenseFileId && (
                <DocumentPreview
                  label="Business Registration Certificate"
                  fileId={application.businessLicenseFileId}
                />
              )}

              {application.articlesOfIncorpFileId && (
                <DocumentPreview
                  label="Articles of Incorporation"
                  fileId={application.articlesOfIncorpFileId}
                />
              )}

              {application.pitchDeckFileId && (
                <div className="space-y-3">
                  <h4 className="font-medium">Pitch Deck</h4>
                  <div className="text-center">
                    <FileText className="h-12 w-12 mx-auto mb-3 text-brand-deep-dark/50 opacity-50" />
                    <p className="text-sm text-brand-deep-dark/50 mb-3">
                      PowerPoint presentation - Preview not available
                    </p>
                    <Button asChild>
                      <a
                        href={`/api/files/${application.pitchDeckFileId}/download`}
                        className="inline-flex items-center"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </a>
                    </Button>
                  </div>
                </div>
              )}

              {application.financialsFileId && (
                <DocumentPreview
                  label="Financial Statements"
                  fileId={application.financialsFileId}
                />
              )}

              {!application.businessLicenseFileId &&
                !application.articlesOfIncorpFileId &&
                !application.pitchDeckFileId &&
                !application.financialsFileId && (
                  <div className="text-center py-8 text-brand-deep-dark/50">
                    <FileText className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p>No supporting documents uploaded</p>
                  </div>
                )}
            </CardContent>
          </Card>

          {/* Pre-Assessment Checklist */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Pre-Assessment Checklist
              </CardTitle>
            </CardHeader>
            <CardContent>
              <StartupDocumentChecklist
                applicationId={application.id}
                status={application.status}
                submittedAt={application.createdAt.toISOString()}
                hasBusinessLicense={!!application.businessLicenseFileId}
                hasArticlesOfIncorp={!!application.articlesOfIncorpFileId}
                hasPitchDeck={!!application.pitchDeckFileId}
                hasFinancials={!!application.financialsFileId}
                initialDocVerification={(application as any).documentVerification || []}
              />
            </CardContent>
          </Card>

          {/* Status History Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Status History Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {application.statusHistory.length > 0 ? (
                <ol className="relative ml-2 space-y-6 border-l pl-6">
                  {application.statusHistory.map((history) => {
                    const historyStatus =
                      statusConfig[history.status]?.title ??
                      history.status.replaceAll("_", " ");

                    return (
                      <li key={history.id} className="relative space-y-1">
                        <span className="absolute -left-[31px] mt-1 h-3 w-3 rounded-full border-2 border-background bg-primary" />
                        <div className="flex items-center gap-2">
                          <Badge className="bg-brand-deep-dark/[0.06] text-brand-deep-dark/70">
                            {historyStatus}
                          </Badge>
                          <p className="text-xs text-brand-deep-dark/50">
                            {formatDistanceToNow(new Date(history.createdAt), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                        <p className="text-xs text-brand-deep-dark/50">
                          {format(new Date(history.createdAt), "PPP p")}
                        </p>
                        {history.comment ? (
                          <p className="text-sm leading-6 whitespace-pre-wrap break-words">
                            {history.comment}
                          </p>
                        ) : null}
                      </li>
                    );
                  })}
                </ol>
              ) : (
                <p className="text-sm text-brand-deep-dark/50">
                  No status history entries were found for this application yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Application Status */}
          <Card>
            <CardHeader>
              <CardTitle>Application Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Progress value={status.progress} className="h-2" />
                <p className="text-xs text-brand-deep-dark/50">
                  {status.progress}% Complete
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-brand-deep-dark/50" />
                <span className="text-sm">
                  Submitted:{" "}
                  {format(new Date(application.createdAt), "MMM d, yyyy")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-brand-deep-dark/50" />
                <span className="text-sm">
                  Updated:{" "}
                  {formatDistanceToNow(new Date(application.updatedAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Review Actions */}
          {isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle>Review Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <AdminApplicationActions
                  applicationId={id}
                  applicationStatus={application.status}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
