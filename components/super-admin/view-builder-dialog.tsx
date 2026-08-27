"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmActionDialog } from "./confirm-action-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  MapPin, 
  Calendar, 
  Users,
  Mail,
  Phone,
  Globe,
  Target,
  Briefcase,
  Loader2
} from "lucide-react";
import { suspendEcosystemBuilder, revokeEcosystemBuilderStatus } from "@/app/super-admin/ecosystem-builders/builders-actions";
import { toast } from "sonner";

interface ViewBuilderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  builder: {
    id: string;
    name: string;
    type: string;
    region: string;
    city: string;
    establishedDate: string;
    status: string;
    startupsSupported: number;
    programsOffered: number;
    contactPerson: string;
    email: string;
    phone: string;
    website: string;
    focusAreas: string[];
    services: string[];
  } | null;
  onSuccess?: () => void;
}

export function ViewBuilderDialog({ open, onOpenChange, builder, onSuccess }: ViewBuilderDialogProps) {
  const [isSuspendDialogOpen, setIsSuspendDialogOpen] = useState(false);
  const [isRevokeDialogOpen, setIsRevokeDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!builder) return null;

  const handleSuspend = async () => {
    setLoading(true);
    try {
      const res = await suspendEcosystemBuilder(builder.id);
      if (res.success) {
        toast.success(`${builder.name} has been suspended`);
        onOpenChange(false);
        if (onSuccess) onSuccess();
      } else {
        toast.error(res.message || "Failed to suspend builder");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async () => {
    setLoading(true);
    try {
      const res = await revokeEcosystemBuilderStatus(builder.id);
      if (res.success) {
        toast.success(`${builder.name} has been revoked from the ecosystem`);
        onOpenChange(false);
        if (onSuccess) onSuccess();
      } else {
        toast.error(res.message || "Failed to revoke builder");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Building2 className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <DialogTitle className="text-2xl">{builder.name}</DialogTitle>
              <DialogDescription>Ecosystem Builder Details</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status & Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-sm">{builder.type}</Badge>
            <Badge className={
              builder.status === "Active" 
                ? "bg-green-100 text-green-800" 
                : "bg-gray-100 text-gray-800"
            }>
              {builder.status}
            </Badge>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                <Users className="h-4 w-4" />
                <span>Capacity</span>
              </div>
              <div className="text-2xl font-bold">{builder.startupsSupported}</div>
              <div className="text-xs text-gray-500">Supported</div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                <Briefcase className="h-4 w-4" />
                <span>Programs</span>
              </div>
              <div className="text-2xl font-bold">{builder.programsOffered}</div>
              <div className="text-xs text-gray-500">Offered</div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                <Calendar className="h-4 w-4" />
                <span>Established</span>
              </div>
              <div className="text-2xl font-bold">
                {builder.establishedDate ? new Date(builder.establishedDate).getFullYear() : 'N/A'}
              </div>
            </div>
          </div>

          {/* Contact Person */}
          <div>
            <h3 className="font-semibold mb-3">Contact Person</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-500" />
                <span className="font-medium">{builder.contactPerson}</span>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="font-semibold mb-3">Contact Information</h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gray-500" />
                <a href={`mailto:${builder.email}`} className="text-purple-600 hover:underline">
                  {builder.email}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gray-500" />
                <a href={`tel:${builder.phone}`} className="text-purple-600 hover:underline">
                  {builder.phone}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4 text-gray-500" />
                <a 
                  href={builder.website.startsWith('http') ? builder.website : `https://${builder.website}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:underline"
                >
                  {builder.website}
                </a>
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <h3 className="font-semibold mb-3">Location</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span>{builder.city}, {builder.region}</span>
              </div>
            </div>
          </div>

          {/* Focus Areas */}
          <div>
            <h3 className="font-semibold mb-3">Focus Areas</h3>
            <div className="flex flex-wrap gap-2">
              {builder.focusAreas && builder.focusAreas.length > 0 ? (
                builder.focusAreas.map((area, index) => (
                  <Badge key={index} variant="outline" className="text-sm">
                    <Target className="mr-1 h-3 w-3" />
                    {area}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-gray-500 italic">No focus areas listed</span>
              )}
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold mb-3">Services Offered</h3>
            <div className="flex flex-wrap gap-2">
              {builder.services && builder.services.length > 0 ? (
                builder.services.map((service, index) => (
                  <Badge key={index} className="bg-purple-100 text-purple-800 text-sm">
                    {service}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-gray-500 italic">No services listed</span>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <div className="flex gap-2">
            <Button 
              variant="destructive"
              onClick={() => setIsRevokeDialogOpen(true)}
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Revoke Status
            </Button>
            <Button 
              variant="outline"
              className="text-orange-600 border-orange-600 hover:bg-orange-50"
              onClick={() => setIsSuspendDialogOpen(true)}
              disabled={loading}
            >
              Suspend Builder
            </Button>
          </div>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Suspend Confirmation Dialog */}
    <ConfirmActionDialog
      open={isSuspendDialogOpen}
      onOpenChange={setIsSuspendDialogOpen}
      onConfirm={handleSuspend}
      title="Suspend Ecosystem Builder"
      description="This will temporarily suspend the builder's access to the platform."
      actionType="suspend"
      entityName={builder.name}
    />

    {/* Revoke Confirmation Dialog */}
    <ConfirmActionDialog
      open={isRevokeDialogOpen}
      onOpenChange={setIsRevokeDialogOpen}
      onConfirm={handleRevoke}
      title="Revoke Builder Status"
      description="This will permanently revoke the ecosystem builder status."
      actionType="revoke"
      entityName={builder.name}
    />
    </>
  );
}
