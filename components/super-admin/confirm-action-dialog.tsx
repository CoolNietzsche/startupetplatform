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
import { AlertTriangle, Lock } from "lucide-react";

interface ConfirmActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  actionType: "suspend" | "revoke";
  entityName: string;
}

export function ConfirmActionDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  actionType,
  entityName,
}: ConfirmActionDialogProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleConfirm = () => {
    // Simple password validation (in production, this would verify against actual user password)
    if (!password) {
      setError("Password is required");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    // In production, verify password with backend
    // For now, we'll accept any password with 6+ characters
    onConfirm();
    setPassword("");
    setError("");
    onOpenChange(false);
  };

  const handleCancel = () => {
    setPassword("");
    setError("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
              actionType === "revoke" ? "bg-red-100" : "bg-orange-100"
            }`}>
              <AlertTriangle className={`h-6 w-6 ${
                actionType === "revoke" ? "text-red-600" : "text-orange-600"
              }`} />
            </div>
            <div>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription className="mt-1">
                {description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Warning Message */}
          <div className={`p-4 rounded-lg border-2 ${
            actionType === "revoke" 
              ? "bg-red-50 border-red-200" 
              : "bg-orange-50 border-orange-200"
          }`}>
            <p className={`text-sm font-medium ${
              actionType === "revoke" ? "text-red-800" : "text-orange-800"
            }`}>
              {actionType === "revoke" ? "⚠️ This action is permanent and cannot be undone!" : "⚠️ This will temporarily suspend access"}
            </p>
            <p className={`text-sm mt-1 ${
              actionType === "revoke" ? "text-red-600" : "text-orange-600"
            }`}>
              You are about to {actionType} <strong>{entityName}</strong>
            </p>
          </div>

          {/* Password Confirmation */}
          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Confirm with your password
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
              className={error ? "border-red-500" : ""}
            />
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
          </div>

          {/* Additional Info */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-600">
              {actionType === "revoke" 
                ? "This will permanently revoke access and remove all associated privileges."
                : "This will temporarily suspend access. You can reactivate later."}
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            variant={actionType === "revoke" ? "destructive" : "default"}
            onClick={handleConfirm}
            className={actionType === "suspend" ? "bg-orange-600 hover:bg-orange-700" : ""}
          >
            {actionType === "revoke" ? "Revoke Permanently" : "Suspend"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
