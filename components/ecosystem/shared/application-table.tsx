import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Award, Info, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EcosystemStatusBadge } from "./status-badge";
import { ContactBuilderButton } from "./contact-builder-button";
import type { EcosystemApplicationStatus } from "./types";
import Link from "next/link";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Data shape
// ---------------------------------------------------------------------------

export interface EcosystemTableItem {
  id: string;
  applicationId: string;
  name: string;
  type: string;
  location: string;
  region?: string;
  /** Admin API returns workflowStatus; builder API returns status */
  status: string | EcosystemApplicationStatus;
  workflowStatus?: string;
  certified?: boolean;
  website?: string;
  established?: string | number;
  capacity?: string | number;
  services?: string[];
  createdAt?: Date;
  canEdit?: boolean;
  certificateId?: string;
  [key: string]: any;
}

// ---------------------------------------------------------------------------
// Column descriptor
// Used for both extraColumns (inserted before Status)
// and trailingColumns (inserted after Status, before Actions)
// ---------------------------------------------------------------------------

export interface TableColumnDef<T = EcosystemTableItem> {
  /** Column header label */
  header: string;
  /** Renders the cell content */
  cell: (item: T) => React.ReactNode;
  /** Optional CSS classes applied to both <th> and <td> */
  className?: string;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface EcosystemApplicationTableProps {
  data: EcosystemTableItem[];
  loading?: boolean;

  /**
   * Fully replaces the built-in action buttons for every row.
   * Receives the row item and must return the action node(s).
   */
  renderActions?: (item: EcosystemTableItem) => React.ReactNode;

  /**
   * Extra columns inserted **before** the Status column.
   * Use for admin page columns: Est. Year, Capacity, Services count.
   */
  extraColumns?: TableColumnDef[];

  /**
   * Extra columns inserted **after** the Status column and before Actions.
   * Use for builder page column: Date Filed.
   */
  trailingColumns?: TableColumnDef[];

  emptyMessage?: string;
  /**
   * Fully replaces the default empty state UI.
   * If provided, emptyMessage is ignored.
   */
  renderEmpty?: React.ReactNode;
  className?: string;

  /**
   * Whether to show the default "View Profile" link button when
   * renderActions is NOT provided.
   */
  showProfileView?: boolean;

  /**
   * When true, rows with status COMMITTEE_REVIEW_SUBMITTED that are not
   * yet certified show a pulsing green "READY" chip next to the badge.
   * Admin-only feature.
   */
  showReadyIndicator?: boolean;

  /**
   * Hide the Status column on small screens (adds hidden md:table-cell).
   * Defaults to false to match original page behaviour for both portals.
   */
  hideStatusOnMobile?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function EcosystemApplicationTable({
  data,
  loading = false,
  renderActions,
  extraColumns = [],
  trailingColumns = [],
  emptyMessage = "No applications found.",
  renderEmpty,
  className,
  showProfileView = true,
  showReadyIndicator = false,
  hideStatusOnMobile = false,
}: EcosystemApplicationTableProps) {
  // Total column count for the empty-state colSpan
  // org + type + location + extraColumns + status + trailingColumns + actions
  const totalCols = 4 + extraColumns.length + trailingColumns.length + 1;

  const statusCellClass = cn(
    hideStatusOnMobile && "hidden md:table-cell"
  );

  // ── Loading ──
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center border rounded-lg bg-white">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary/60" />
          <p className="text-sm text-muted-foreground font-medium">
            Loading applications...
          </p>
        </div>
      </div>
    );
  }

  // ── Empty ──
  if (data.length === 0) {
    if (renderEmpty) {
      return (
        <div className="flex h-64 flex-col items-center justify-center border rounded-lg bg-white border-dashed border-slate-300 text-muted-foreground text-sm">
          {renderEmpty}
        </div>
      );
    }
    return (
      <div className="flex h-64 flex-col items-center justify-center border rounded-lg bg-white border-dashed border-slate-300">
        <p className="text-slate-500 font-medium">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "border rounded-lg bg-white shadow-sm overflow-hidden",
        className
      )}
    >
      {/* overflow-x-auto enables horizontal scroll on small screens */}
      <div className="overflow-x-auto">
      <Table className="min-w-full">
        {/* ── Header ── */}
        <TableHeader className="bg-brand-1/5 border-y border-brand-1/10">
          <TableRow className="hover:bg-transparent border-b-2 border-brand-1/20">
            <TableHead className="h-10 px-4 text-left align-middle font-extrabold text-slate-900 uppercase text-xs tracking-widest whitespace-nowrap">
              Organization
            </TableHead>
            <TableHead className="h-10 px-4 text-left align-middle font-extrabold text-slate-900 uppercase text-xs tracking-widest whitespace-nowrap">
              Type
            </TableHead>
            <TableHead className="h-10 px-4 text-left align-middle font-extrabold text-slate-900 uppercase text-xs tracking-widest whitespace-nowrap border-b-2 border-brand-1/20">Region</TableHead>
            <TableHead className="h-10 px-4 text-left align-middle font-extrabold text-slate-900 uppercase text-xs tracking-widest whitespace-nowrap border-b-2 border-brand-1/20">City</TableHead>

            {/* Columns before Status (e.g. Est. Year, Capacity, Services) */}
            {extraColumns.map((col) => (
              <TableHead
                key={col.header}
                className={cn(
                  "h-10 px-4 text-left align-middle font-extrabold text-slate-900 uppercase text-xs tracking-widest whitespace-nowrap border-b-2 border-brand-1/20",
                  col.className
                )}
              >
                {col.header}
              </TableHead>
            ))}

            <TableHead
              className={cn("h-10 px-4 text-left align-middle font-extrabold text-slate-900 uppercase text-xs tracking-widest whitespace-nowrap border-b-2 border-brand-1/20", statusCellClass)}
            >
              Status
            </TableHead>

            {/* Columns after Status (e.g. Date Filed) */}
            {trailingColumns.map((col) => (
              <TableHead
                key={col.header}
                className={cn(
                  "h-10 px-4 text-left align-middle font-extrabold text-slate-900 uppercase text-xs tracking-widest whitespace-nowrap",
                  col.className
                )}
              >
                {col.header}
              </TableHead>
            ))}

            <TableHead className="h-10 px-4 text-center align-middle font-extrabold text-slate-900 uppercase text-xs tracking-widest whitespace-nowrap border-b-2 border-brand-1/20">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>

        {/* ── Body ── */}
        <TableBody>
          {data.map((item) => {
            const effectiveStatus =
              item.workflowStatus || item.status || "DRAFT";

            const isReadyToCertify =
              showReadyIndicator &&
              String(effectiveStatus).toUpperCase() ===
                "COMMITTEE_REVIEW_SUBMITTED" &&
              !item.certified;

            return (
              <TableRow
                key={item.applicationId || item.id}
                className="hover:bg-brand-1/[0.04] transition-colors whitespace-nowrap border-b border-slate-100 last:border-0"
              >
                {/* Organization */}
                <TableCell className="py-1.5">
                  <div className="flex items-center">
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5 font-medium text-slate-900 truncate">
                        {item.name}
                        {item.certified && (
                          <Award className="h-4 w-4 text-green-600 fill-green-50 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  </div>
                </TableCell>

                {/* Type */}
                <TableCell className="text-slate-900 capitalize whitespace-nowrap py-1.5">
                  {item.type}
                </TableCell>

                {/* Region */}
                <TableCell className="text-slate-700 whitespace-nowrap py-1.5">
                  {item.region || <span className="text-slate-400">—</span>}
                </TableCell>

                {/* City */}
                <TableCell className="text-slate-900 whitespace-nowrap py-1.5">
                  {item.location || <span className="text-slate-400">—</span>}
                </TableCell>

                {/* Extra columns before Status */}
                {extraColumns.map((col) => (
                  <TableCell
                    key={col.header}
                    className={cn(col.className, "py-1.5 text-slate-900 whitespace-nowrap")}
                  >
                    {col.cell(item)}
                  </TableCell>
                ))}

                {/* Status + optional READY chip */}
                <TableCell className={cn(statusCellClass, "py-1.5")}>
                  <div className="flex items-center gap-2">
                    <EcosystemStatusBadge status={effectiveStatus} />
                    {isReadyToCertify && (
                      <div className="flex items-center text-[10px] text-green-600 font-bold bg-green-50 px-1.5 py-0.5 rounded border border-green-100 animate-pulse">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        READY
                      </div>
                    )}
                  </div>
                </TableCell>

                {/* Trailing columns after Status (e.g. Date Filed) */}
                {trailingColumns.map((col) => (
                  <TableCell
                    key={col.header}
                    className={cn(col.className, "py-1.5 text-slate-900 whitespace-nowrap")}
                  >
                    {col.cell(item)}
                  </TableCell>
                ))}

                {/* Actions */}
                <TableCell className="text-center py-1.5">
                  <div className="flex items-center justify-center gap-1.5">
                    {renderActions ? (
                      renderActions(item)
                    ) : (
                      <>
                        <ContactBuilderButton
                          applicationId={item.applicationId}
                          entityType="ecosystem"
                          variant="ghost"
                          showIconOnly
                        />
                        {showProfileView && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 rounded-xl"
                            asChild
                          >
                            <Link
                              href={`/admins-new/ecosystem/${item.id}?applicationId=${item.applicationId}`}
                            >
                              <Info className="h-4 w-4 text-slate-400" />
                              <span className="sr-only">View Profile</span>
                            </Link>
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      </div> {/* end overflow-x-auto */}
    </div>
  );
}
