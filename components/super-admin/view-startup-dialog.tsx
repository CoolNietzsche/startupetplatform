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
  Rocket, 
  MapPin, 
  Calendar, 
  Users, 
  DollarSign,
  Mail,
  Phone,
  Globe,
  Award,
  Briefcase
} from "lucide-react";

interface ViewStartupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  startup: {
    id: string;
    name: string;
    sector: string;
    stage: string;
    region: string;
    city: string;
    foundedDate: string;
    certificationStatus: string;
    certificationLevel: string;
    employeeCount: number;
    fundingRaised: number;
    founder: string;
    email: string;
    phone: string;
    website: string;
    description: string;
    revenueModel: string;
  } | null;
}

export function ViewStartupDialog({ open, onOpenChange, startup }: ViewStartupDialogProps) {
  const [isSuspendDialogOpen, setIsSuspendDialogOpen] = useState(false);
  const [isRevokeDialogOpen, setIsRevokeDialogOpen] = useState(false);

  if (!startup) return null;

  const handleSuspend = () => {
    alert(`${startup.name} has been suspended`);
    onOpenChange(false);
  };

  const handleRevoke = () => {
    alert(`Certification revoked for ${startup.name}`);
    onOpenChange(false);
  };

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Rocket className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <DialogTitle className="text-2xl">{startup.name}</DialogTitle>
              <DialogDescription>Startup Details & Information</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status & Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-sm">{startup.sector}</Badge>
            <Badge className="bg-purple-100 text-purple-800 text-sm">{startup.stage}</Badge>
            <Badge className={
              startup.certificationStatus === "Certified" 
                ? "bg-green-100 text-green-800" 
                : "bg-yellow-100 text-yellow-800"
            }>
              {startup.certificationStatus}
            </Badge>
            {startup.certificationStatus === "Certified" && (
              <Badge variant="outline" className="text-sm">
                <Award className="mr-1 h-3 w-3" />
                {startup.certificationLevel}
              </Badge>
            )}
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold mb-2">About</h3>
            <p className="text-gray-600">{startup.description}</p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                <Users className="h-4 w-4" />
                <span>Employees</span>
              </div>
              <div className="text-2xl font-bold">{startup.employeeCount}</div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                <DollarSign className="h-4 w-4" />
                <span>Funding</span>
              </div>
              <div className="text-2xl font-bold">
                {(startup.fundingRaised / 1000000).toFixed(1)}M
              </div>
              <div className="text-xs text-gray-500">ETB</div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                <Calendar className="h-4 w-4" />
                <span>Founded</span>
              </div>
              <div className="text-2xl font-bold">
                {new Date(startup.foundedDate).getFullYear()}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                <Briefcase className="h-4 w-4" />
                <span>Revenue</span>
              </div>
              <div className="text-sm font-semibold">{startup.revenueModel}</div>
            </div>
          </div>

          {/* Founder Information */}
          <div>
            <h3 className="font-semibold mb-3">Founder Information</h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-500" />
                <span className="font-medium">{startup.founder}</span>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="font-semibold mb-3">Contact Information</h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gray-500" />
                <a href={`mailto:${startup.email}`} className="text-purple-600 hover:underline">
                  {startup.email}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gray-500" />
                <a href={`tel:${startup.phone}`} className="text-purple-600 hover:underline">
                  {startup.phone}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4 text-gray-500" />
                <a 
                  href={`https://${startup.website}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:underline"
                >
                  {startup.website}
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
                <span>{startup.city}, {startup.region}</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <div className="flex gap-2">
            {startup.certificationStatus === "Certified" && (
              <Button 
                variant="destructive"
                onClick={() => setIsRevokeDialogOpen(true)}
              >
                Revoke Certification
              </Button>
            )}
            <Button 
              variant="outline"
              className="text-orange-600 border-orange-600 hover:bg-orange-50"
              onClick={() => setIsSuspendDialogOpen(true)}
            >
              Suspend Startup
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
      title="Suspend Startup"
      description="This will temporarily suspend the startup's access to the platform."
      actionType="suspend"
      entityName={startup.name}
    />

    {/* Revoke Confirmation Dialog */}
    <ConfirmActionDialog
      open={isRevokeDialogOpen}
      onOpenChange={setIsRevokeDialogOpen}
      onConfirm={handleRevoke}
      title="Revoke Certification"
      description="This will permanently revoke the startup's certification."
      actionType="revoke"
      entityName={startup.name}
    />
    </>
  );
}
