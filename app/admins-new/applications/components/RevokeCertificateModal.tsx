"use client";

import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { setApplicationCertified } from "../application-actions";
import { 
  AlertTriangle, 
  Trash2, 
  RefreshCw,
  X
} from "lucide-react";

interface RevokeCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: {
    id: string;
    name: string;
  } | null;
  onSuccess?: () => void;
}

export function RevokeCertificateModal({
  isOpen,
  onClose,
  application,
  onSuccess
}: RevokeCertificateModalProps) {
  const [isRevoking, setIsRevoking] = useState(false);

  const handleRevoke = async () => {
    if (!application) return;
    
    setIsRevoking(true);
    const loadingToast = toast.loading("Revoking certification...");
    try {
      const res = await setApplicationCertified(application.id, false);
      if (res.success) {
        toast.success("Certificate revoked successfully");
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast.error(res.message || "Failed to revoke");
      }
    } catch (error) {
      toast.error("An error occurred during revocation");
    } finally {
      setIsRevoking(false);
      toast.dismiss(loadingToast);
    }
  };

  if (!application) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[450px] rounded-2xl p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-red-50 p-6 flex flex-col items-center text-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center shadow-sm">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Revoke Certification?</h3>
            <p className="text-red-700/70 text-sm font-medium">This action cannot be easily undone.</p>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-slate-600 text-[13px] leading-relaxed text-center font-medium">
            Are you sure you want to revoke the certificate for <span className="text-slate-900 font-bold italic">"{application.name}"</span>? 
            Their official startup status will be removed and the application will return to <span className="text-sky-600 font-bold uppercase tracking-tighter">'Review Submitted'</span> for re-evaluation.
          </p>

          <div className="flex flex-col gap-2 pt-2">
            <Button 
              onClick={handleRevoke}
              disabled={isRevoking}
              className="w-full h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black shadow-lg shadow-red-900/10 transition-all active:scale-[0.98]"
            >
              {isRevoking ? (
                <RefreshCw className="h-5 w-5 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-5 w-5 mr-2" />
              )}
              {isRevoking ? "Processing..." : "Confirm Revocation"}
            </Button>
            <Button 
              variant="ghost" 
              onClick={onClose}
              disabled={isRevoking}
              className="w-full h-11 rounded-xl text-slate-500 hover:text-slate-900 font-bold text-sm"
            >
              No, Keep Certificate
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
