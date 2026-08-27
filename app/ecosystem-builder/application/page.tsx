"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  Award,
  ClipboardCheck,
  Download,
  Edit,
  Info,
  Loader2,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  EcosystemApplicationTable,
  type EcosystemTableItem,
} from "@/components/ecosystem/shared";

// ---------------------------------------------------------------------------
// Types (kept exactly as original)
// ---------------------------------------------------------------------------

type EcosystemBuilderApplication = {
  id: string;
  builderId: string;
  status:
    | "draft"
    | "pending"
    | "under_review"
    | "certified"
    | "rejected"
    | "CLARIFICATION_REQUESTED";
  workflowStatus: string;
  certified: boolean;
  canEdit: boolean;
  name: string;
  type: string;
  location: string;
  region: string;
  website: string | null;
  services: string[];
  description: string | null;
  established: number | null;
  capacity: number | null;
  businessLicenseFileId: string | null;
  taxRegistrationFileId: string | null;
  businessLicenseFileName: string | null;
  taxRegistrationFileName: string | null;
  createdAt: string;
  updatedAt: string;
  certificateId: string | null;
};

type ApiResponse =
  | { success: true; data: EcosystemBuilderApplication[] }
  | { success: false; error: string };

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function EcosystemBuilderApplicationStatusPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applications, setApplications] = useState<EcosystemBuilderApplication[]>([]);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  // ── Pagination State ──
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // ── Tab filtering (identical logic to original) ──
  const filteredApplications = useMemo(() => {
    let list = [];
    if (activeTab === "all") list = applications;
    else if (activeTab === "under_review")
      list = applications.filter((a) =>
        ["draft", "pending", "under_review", "CLARIFICATION_REQUESTED"].includes(a.status)
      );
    else if (activeTab === "certified")
      list = applications.filter((a) => a.status === "certified");
    else if (activeTab === "completed")
      list = applications.filter((a) =>
        ["certified", "rejected"].includes(a.status)
      );
    else list = applications;

    return list;
  }, [applications, activeTab]);

  // ── Pagination logic ──
  const totalItems = filteredApplications.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredApplications.slice(startIndex, startIndex + pageSize);
  }, [filteredApplications, currentPage, pageSize]);

  // Reset page when tab or page size changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, pageSize]);

  // ── Map current page items to table item shape ──
  const tableData: EcosystemTableItem[] = useMemo(
    () =>
      paginatedItems.map((app) => ({
        id: app.id,
        applicationId: app.id,
        name: app.name,
        type: app.type,
        location: app.location,
        region: app.region,
        status: app.status,
        workflowStatus: app.workflowStatus,
        certified: app.certified,
        website: app.website ?? undefined,
        established: app.established ?? undefined,
        capacity: app.capacity ?? undefined,
        services: app.services,
        createdAt: new Date(app.createdAt),
        canEdit: app.canEdit,
        certificateId: app.certificateId ?? undefined,
      })),
    [paginatedItems]
  );

  // ── Data fetching (identical to original) ──
  useEffect(() => {
    setMounted(true);
    async function load() {
      try {
        const response = await fetch("/api/ecosystem-builder/application");
        const result = (await response.json()) as ApiResponse;
        if (result.success) {
          setApplications(result.data);
        } else {
          setError(result.error);
        }
      } catch {
        setError("Failed to fetch application history.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // ── Full-page loading (identical to original) ──
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // ── Per-row action buttons (identical behaviour to original) ──
  function renderRowActions(item: EcosystemTableItem) {
    // Find the raw application to access certificateId / canEdit safely
    const app = applications.find((a) => a.id === item.id)!;

    return (
      <div className="flex items-center justify-center">
        {/* Desktop View: Visible buttons */}
        <div className="hidden md:flex items-center justify-center gap-2">
          {/* Details */}
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/ecosystem-builder/application/${app.id}`}>
              <Info className="h-4 w-4 mr-1 text-primary" />
              Details
            </Link>
          </Button>

          {/* Edit (only when canEdit) */}
          {app.canEdit && (
            <Button variant="outline" size="sm" asChild>
              <Link
                href={`/ecosystem-builder/apply?mode=edit&applicationId=${app.id}`}
              >
                <Edit className="h-4 w-4 mr-1 text-primary" />
                Edit
              </Link>
            </Button>
          )}

          {/* Certificate actions (only when certified) */}
          {app.certificateId && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
                asChild
              >
                <Link href="/ecosystem-builder/certifications">
                  <Award className="h-4 w-4 mr-1" />
                  View Certification
                </Link>
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="text-green-600 border-green-200 hover:bg-green-50"
                onClick={() =>
                  window.open(
                    `/api/certificates/${app.certificateId}/download`,
                    "_blank"
                  )
                }
              >
                <Download className="h-4 w-4 mr-1" />
                Certificate
              </Button>
            </>
          )}
        </div>

        {/* Mobile View: 3-dot menu */}
        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-48">
              <DropdownMenuItem asChild>
                <Link href={`/ecosystem-builder/application/${app.id}`}>
                  <Info className="h-4 w-4 mr-2 text-primary" />
                  Details
                </Link>
              </DropdownMenuItem>
              
              {app.canEdit && (
                <DropdownMenuItem asChild>
                  <Link href={`/ecosystem-builder/apply?mode=edit&applicationId=${app.id}`}>
                    <Edit className="h-4 w-4 mr-2 text-primary" />
                    Edit
                  </Link>
                </DropdownMenuItem>
              )}

              {app.certificateId && (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/ecosystem-builder/certifications">
                      <Award className="h-4 w-4 mr-2 text-blue-600" />
                      View Certification
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => window.open(`/api/certificates/${app.certificateId}/download`, "_blank")}>
                    <Download className="h-4 w-4 mr-2 text-green-600" />
                    Download Certificate
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto pt-2 pb-10 space-y-4">
      {/* ── Header (identical to original) ── */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl sm:text-3xl font-bold tracking-tight truncate">Application Requests</h1>
        <Button asChild size="sm" className="shrink-0 rounded-xl px-4 shadow-sm">
          <Link href="/ecosystem-builder/apply">
            <Plus className="h-4 w-4 mr-1.5" />
            New Application
          </Link>
        </Button>
      </div>

      {/* ── Tabs (identical to original) ── */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Applications</TabsTrigger>
          <TabsTrigger value="under_review">Under Review</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="certified">Certified</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          <EcosystemApplicationTable
            data={tableData}
            showProfileView={false}
            /* Date Filed column — after Status, matches original column order */
            trailingColumns={[
              {
                header: "Applied On",
                cell: (item) =>
                  mounted ? (item.createdAt?.toLocaleDateString() ?? "—") : "...",
              },
            ]}
            /* Custom row actions — identical to original */
            renderActions={renderRowActions}
            /* Custom empty state — identical to original layout */
            renderEmpty={
              <>
                <ClipboardCheck className="h-8 w-8 opacity-20" />
                <p>No application requests found.</p>
                <Button variant="link" asChild>
                  <Link href="/ecosystem-builder/apply">
                    Apply now to get started
                  </Link>
                </Button>
              </>
            }
          />

          {/* ── Pagination Controls ── */}
          {totalItems > 0 && (
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white border rounded-lg">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-neutral-500 whitespace-nowrap">Show:</span>
                  <Select
                    value={pageSize.toString()}
                    onValueChange={(val) => setPageSize(parseInt(val))}
                  >
                    <SelectTrigger className="h-8 w-[80px]">
                      <SelectValue placeholder={pageSize.toString()} />
                    </SelectTrigger>
                    <SelectContent>
                      {[5, 10, 20, 50, 100, 200, 500, 1000].map((size) => (
                        <SelectItem key={size} value={size.toString()}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-sm text-neutral-500">
                  Showing <span className="font-semibold text-neutral-900">{Math.min(totalItems, (currentPage - 1) * pageSize + 1)}</span>
                  {" "}-{" "}
                  <span className="font-semibold text-neutral-900">{Math.min(totalItems, currentPage * pageSize)}</span>
                  {" "}of{" "}
                  <span className="font-semibold text-neutral-900">{totalItems}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="h-8 px-3"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Logic to show a few page numbers around the current page
                    let pageNum = currentPage;
                    if (totalPages <= 5) pageNum = i + 1;
                    else if (currentPage <= 3) pageNum = i + 1;
                    else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                    else pageNum = currentPage - 2 + i;

                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="h-8 w-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="h-8 px-3"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ── Error banner (identical to original) ── */}
      {error && (
        <div className="flex items-center gap-2 p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-4 w-4" />
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}
