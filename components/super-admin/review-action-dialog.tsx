"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, 
  FileText, 
  Download,
  CheckCircle,
  XCircle,
  Lock
} from "lucide-react";

interface ReviewActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: {
    id: number;
    requestType: string;
    entityType: string;
    entityName: string;
    requestedBy: string;
    requestedByRole: string;
    requestDate: string;
    reason: string;
    description: string;
    priority: string;
    documents: { name: string; size: string }[];
    evidence: string;
  } | null;
  onApprove: (notes: string, password: string) => void;
  onReject: (notes: string, password: string) => void;
}

export function ReviewActionDialog({
  open,
  onOpenChange,
  request,
  onApprove,
  onReject,
}: ReviewActionDialogProps) {
  const [reviewNotes, setReviewNotes] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (!request) return null;

  const handleApprove = () => {
    if (!reviewNotes.trim()) {
      setError("Review notes are required");
      return;
    }
    if (!password) {
      setError("Password is required");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    onApprove(reviewNotes, password);
    resetForm();
  };

  const handleReject = () => {
    if (!reviewNotes.trim()) {
      setError("Review notes are required to reject");
      return;
    }
    if (!password) {
      setError("Password is required");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    onReject(reviewNotes, password);
    resetForm();
  };

  const resetForm = () => {
    setReviewNotes("");
    setPassword("");
    setError("");
    onOpenChange(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-orange-100 text-orange-800";
      case "low": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getActionTypeColor = (type: string) => {
    return type === "revoke" ? "bg-red-100 text-red-800" : "bg-orange-100 text-orange-800";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <DialogTitle className="text-2xl">Review Action Request</DialogTitle>
              <DialogDescription>
                Review and approve or reject this {request.requestType} request
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Request Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-lg font-semibold">{request.entityName}</h3>
              <Badge className={getActionTypeColor(request.requestType)}>
                {request.requestType === "suspend" ? "Suspend" : "Revoke"}
              </Badge>
              <Badge variant="outline">{request.entityType}</Badge>
              <Badge className={getPriorityColor(request.priority)}>
                {request.priority} priority
              </Badge>
            </div>
            <p className="text-sm text-gray-600">
              Requested by <strong>{request.requestedBy}</strong> ({request.requestedByRole}) on{" "}
              {new Date(request.requestDate).toLocaleDateString()}
            </p>
          </div>

          {/* Reason */}
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              Reason for {request.requestType === "suspend" ? "Suspension" : "Revocation"}
            </h4>
            <div className="bg-orange-50 border-2 border-orange-200 p-4 rounded-lg">
              <p className="font-medium mb-2">{request.reason}</p>
              <p className="text-sm text-gray-700">{request.description}</p>
            </div>
          </div>

          {/* Evidence */}
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4 text-purple-500" />
              Evidence & Documentation
            </h4>
            <p className="text-sm text-gray-600 mb-3">{request.evidence}</p>
            <div className="space-y-2">
              {request.documents.map((doc, index) => (
                <div key={index} className="flex items-center justify-between bg-white border rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="text-sm font-medium">{doc.name}</p>
                      <p className="text-xs text-gray-500">{doc.size}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Review Notes */}
          <div className="space-y-2">
            <Label htmlFor="reviewNotes">
              Review Notes <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="reviewNotes"
              value={reviewNotes}
              onChange={(e) => {
                setReviewNotes(e.target.value);
                setError("");
              }}
              placeholder="Provide your review notes and decision rationale..."
              rows={4}
              className={error && !reviewNotes ? "border-red-500" : ""}
            />
            <p className="text-xs text-gray-500">
              These notes will be recorded in the system and visible to other admins
            </p>
          </div>

          {/* Password Confirmation */}
          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Confirm with your password <span className="text-red-500">*</span>
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              placeholder="Enter your password"
              className={error && !password ? "border-red-500" : ""}
            />
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
          </div>

          {/* Warning */}
          <div className={`p-4 rounded-lg border-2 ${
            request.requestType === "revoke" 
              ? "bg-red-50 border-red-200" 
              : "bg-orange-50 border-orange-200"
          }`}>
            <p className={`text-sm font-medium ${
              request.requestType === "revoke" ? "text-red-800" : "text-orange-800"
            }`}>
              {request.requestType === "revoke" 
                ? "⚠️ Approving this will permanently revoke access and cannot be undone!"
                : "⚠️ Approving this will temporarily suspend access to the platform"}
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={resetForm}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleReject}
            className="bg-red-600 hover:bg-red-700"
          >
            <XCircle className="mr-2 h-4 w-4" />
            Reject Request
          </Button>
          <Button
            onClick={handleApprove}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Approve & Execute
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
