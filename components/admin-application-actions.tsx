"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  RotateCcw,
  XCircle,
  CheckSquare,
  UserPlus,
  Award,
  Clock,
  CheckCircle,
  MessageSquare,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import {
  passScreeningAction,
  rollbackApplicationAction,
  rejectApplicationAction,
  approveApplicationAction,
} from "@/app/admins-new/applications/application-actions";
import { AssignCommitteeModal } from "@/app/admins-new/applications/components/AssignCommitteeModal";
import { toast } from "sonner";
import { RequestClarificationModal } from "@/components/request-clarification-modal";
import { MessageSquarePlus } from "lucide-react";

interface AdminApplicationActionsProps {
  applicationId: string;
  applicationStatus: string;
}

export function AdminApplicationActions({
  applicationId,
  applicationStatus,
}: AdminApplicationActionsProps) {
  const router = useRouter();
  const [showRejectionReason, setShowRejectionReason] = useState(false);
  const [showRollbackReason, setShowRollbackReason] = useState(false);
  const [showPassScreeningConfirm, setShowPassScreeningConfirm] =
    useState(false);
  const [showAssignCommitteeModal, setShowAssignCommitteeModal] = useState(false);
  const [showClarificationModal, setShowClarificationModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rollbackReason, setRollbackReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRollback = async () => {
    if (!rollbackReason.trim()) return;

    setIsSubmitting(true);
    try {
      const result = await rollbackApplicationAction(
        applicationId,
        rollbackReason,
      );
      if (result.success) {
        setRollbackReason("");
        setShowRollbackReason(false);
        toast.success("Application rolled back");
        router.refresh();
      } else {
        toast.error(result.message || "Rollback failed");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) return;

    setIsSubmitting(true);
    try {
      const result = await rejectApplicationAction(
        applicationId,
        rejectionReason,
      );
      if (result.success) {
        setRejectionReason("");
        setShowRejectionReason(false);
        toast.success("Application rejected");
        router.refresh();
      } else {
        toast.error(result.message || "Reject failed");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePassScreening = async () => {
    setIsSubmitting(true);
    try {
      const result = await passScreeningAction(applicationId);
      if (result.success) {
        setShowPassScreeningConfirm(false);
        toast.success("Pass screening successful");
        router.refresh();
      } else {
        toast.error(result.message || "Pass screening failed");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      const result = await approveApplicationAction(applicationId);
      if (result.success) {
        toast.success("Application certified successfully");
        router.refresh();
      } else {
        toast.error(result.message || "Failed to certify");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRollbackClick = () => {
    setShowRollbackReason(true);
    setShowRejectionReason(false);
  };

  const handleRejectClick = () => {
    setShowRejectionReason(true);
    setShowRollbackReason(false);
  };

  const handlePassScreeningClick = () => {
    setShowPassScreeningConfirm(true);
  };

  const handleAssignCommitteeClick = () => {
    setShowAssignCommitteeModal(true);
  };

  const renderContent = () => {
    if (applicationStatus === "CERTIFIED") {
      return (
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <Award className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <p className="font-medium text-green-800">Already Certified</p>
          <p className="text-sm text-green-600">
            This application has been certified
          </p>
        </div>
      );
    }

    if (applicationStatus === "REJECTED") {
      return (
        <div className="text-center p-4 bg-red-50 rounded-lg">
          <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
          <p className="font-medium text-red-800">Application Rejected</p>
          <p className="text-sm text-red-600">
            This application was not approved
          </p>
        </div>
      );
    }

    if (applicationStatus === "REVIEWED") {
      return (
        <div className="space-y-3">
          <div className="text-center p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
            <CheckSquare className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="font-bold text-blue-900">Application Reviewed</p>
            <p className="text-sm text-blue-600">
              Initial screening completed. The application is now ready for committee assignment.
            </p>
          </div>
          <Button
            variant="outline"
            className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 font-bold h-12 rounded-xl"
            onClick={handleAssignCommitteeClick}
            disabled={isSubmitting}
          >
            <UserPlus className="mr-2 h-5 w-5" />
            Assign Committee
          </Button>
        </div>
      );
    }

    if (applicationStatus === "CLARIFICATION_REQUESTED") {
      return (
        <div className="space-y-4">
          <div className="text-center p-4 bg-amber-50/50 border border-amber-100 rounded-xl">
            <MessageSquare className="h-8 w-8 text-amber-600 mx-auto mb-2" />
            <p className="font-bold text-amber-900">Clarification Requested</p>
            <p className="text-sm text-amber-600">
              The application is currently paused awaiting clarifying documents from the applicant.
            </p>
          </div>
          <Link href="/admins-new/messages" className="block w-full">
            <Button
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold h-12 rounded-xl shadow-lg"
            >
              Open Messaging Hub
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      );
    }

    if (applicationStatus === "ASSIGNED_TO_COMMITTEE") {
      return (
        <div className="text-center p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
          <UserPlus className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <p className="font-bold text-blue-900">Committee Assigned</p>
          <p className="text-sm text-blue-600">
            The application has been assigned to a committee.
          </p>
        </div>
      );
    }

    if (applicationStatus === "IN_COMMITTEE_REVIEW") {
      return (
        <div className="space-y-4">
          <div className="text-center p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl">
            <Clock className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
            <p className="font-bold text-indigo-900">In Committee Review</p>
            <p className="text-sm text-indigo-600">
              Committee members are currently evaluating the application.
            </p>
          </div>
          <Button
            className="w-full bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 font-bold h-10 rounded-xl shadow-sm"
            onClick={() => setShowClarificationModal(true)}
            disabled={isSubmitting}
          >
            <MessageSquarePlus className="mr-2 h-4 w-4" />
            Request Clarification
          </Button>
        </div>
      );
    }

    if (applicationStatus === "COMMITTEE_REVIEW_SUBMITTED") {
      return (
        <div className="space-y-4">
          <div className="text-center p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl">
            <CheckCircle className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
            <p className="font-bold text-emerald-900">Review Submitted</p>
            <p className="text-sm text-emerald-600">
              Committee evaluation is complete. You can now issue the certification.
            </p>
          </div>
          <Button
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 rounded-xl shadow-lg shadow-emerald-100"
            onClick={handleApprove}
            disabled={isSubmitting}
          >
            <Award className="mr-2 h-5 w-5" />
            Issue Certificate
          </Button>
        </div>
      );
    }

    // Default: PENDING or UNDER_REVIEW or others
    return (
      <div className="space-y-4">
        {(applicationStatus === "PENDING" || applicationStatus === "UNDER_REVIEW") && (
          <>
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 rounded-xl shadow-lg shadow-blue-100"
              onClick={handlePassScreeningClick}
              disabled={isSubmitting}
            >
              <CheckSquare className="mr-2 h-5 w-5" />
              Mark as Reviewed
            </Button>
            <Separator className="my-4" />
          </>
        )}

        {showRejectionReason ? (
          <div className="space-y-3 p-4 border border-red-200 rounded-xl bg-red-50/50">
            <Label htmlFor="rejection" className="text-red-800 font-bold block mb-2">
              Rejection Reason
            </Label>
            <Textarea
              id="rejection"
              placeholder="Provide a detailed reason for rejection..."
              className="min-h-[100px] rounded-xl border-red-200"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="ghost"
                onClick={() => setShowRejectionReason(false)}
                className="font-bold"
              >
                Cancel
              </Button>
              <Button
                onClick={handleReject}
                disabled={!rejectionReason.trim() || isSubmitting}
                className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg"
              >
                Reject
              </Button>
            </div>
          </div>
        ) : showRollbackReason ? (
          <div className="space-y-3 p-4 border border-amber-200 rounded-xl bg-amber-50/50">
            <Label htmlFor="rollback" className="text-amber-800 font-bold block mb-2">
              Rollback Reason
            </Label>
            <Textarea
              id="rollback"
              placeholder="Explain why the user needs to provide more info..."
              className="min-h-[100px] rounded-xl border-amber-200"
              value={rollbackReason}
              onChange={(e) => setRollbackReason(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="ghost"
                onClick={() => setShowRollbackReason(false)}
                className="font-bold"
              >
                Cancel
              </Button>
              <Button
                onClick={handleRollback}
                disabled={!rollbackReason.trim() || isSubmitting}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg"
              >
                Rollback
              </Button>
            </div>
          </div>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full rounded-xl h-10 border-slate-200 font-bold">
                More Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px] rounded-xl">
              <DropdownMenuItem
                className="text-blue-600 focus:text-blue-700 font-medium"
                onClick={() => setShowClarificationModal(true)}
              >
                <MessageSquarePlus className="mr-2 h-4 w-4" />
                Request Clarification
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-amber-600 focus:text-amber-700 font-medium"
                onClick={handleRollbackClick}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Roll Back
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600 focus:text-red-700 font-medium"
                onClick={handleRejectClick}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Reject Application
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="font-bold text-slate-900 mb-4">Admin Actions</h3>
        {renderContent()}
      </div>

      {/* Pass Screening Confirmation Dialog */}
      {showPassScreeningConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-in fade-in">
          <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-sm w-full mx-4 border border-slate-100">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-2 rounded-lg mr-3">
                <CheckSquare className="text-blue-600 h-5 w-5" />
              </div>
              <span className="font-bold text-slate-900 text-lg">Mark as Reviewed</span>
            </div>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              Are you sure you want to mark this application as reviewed? It will then be available for committee assignment.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="ghost"
                onClick={() => setShowPassScreeningConfirm(false)}
                disabled={isSubmitting}
                className="font-bold rounded-xl"
              >
                Cancel
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
                disabled={isSubmitting}
                onClick={handlePassScreening}
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}

      {showAssignCommitteeModal && (
        <AssignCommitteeModal
          isOpen={showAssignCommitteeModal}
          onOpenChange={setShowAssignCommitteeModal}
          applicationId={applicationId}
          onSuccess={() => router.refresh()}
        />
      )}

      {/* CLARIFICATION MODAL */}
      <RequestClarificationModal
        applicationId={applicationId}
        open={showClarificationModal}
        onOpenChange={setShowClarificationModal}
      />
    </>
  );
}
