"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Award, Check, Download, Eye, FileText, Calendar, Building2, AlertCircle, RefreshCw, Share2, ExternalLink, CheckCircle, Shield, Clock, Maximize2 } from "lucide-react";
import { toast } from "sonner";
import { getStartupCertifications } from "./actions";
import Link from "next/link";

interface Certificate {
  id: string;
  certificateId: string;
  level: number;
  levelName: string;
  issueDate: string;
  expiryDate: string;
  issuedBy: string;
  status: "active" | "expired" | "upgraded" | "revoked";
  requirements: string[];
  realCertificateId?: string;
  startupName: string;
}

export default function StartupCertificationsPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const result = await getStartupCertifications();
        
        if (result.success && result.data) {
          setCertificates(result.data as any);
        } else if (!result.success) {
          setError(result.message || "Failed to fetch certifications.");
        }
      } catch (err) {
        setError("An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const [isViewCertificateOpen, setIsViewCertificateOpen] = useState(false);
  const [isRequirementsOpen, setIsRequirementsOpen] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);

  const activeCertificate = certificates.find(c => c.status === "active");

  const handleViewCertificate = (cert: Certificate) => {
    setSelectedCertificate(cert);
    setIsViewCertificateOpen(true);
  };

  const handleDownloadCertificate = (cert: any) => {
    if (cert.realCertificateId) {
      window.open(`/api/certificates/${cert.realCertificateId}/download`, '_blank');
    } else {
      toast.error(`Certificate file not available for ${cert.certificateId}.`);
    }
  };

  const handleViewRequirements = () => {
    setIsRequirementsOpen(true);
  };

  const handleShareVerification = (cert: any) => {
    if (cert.realCertificateId) {
      const url = `${window.location.origin}/verify/startup/${cert.realCertificateId}`;
      navigator.clipboard.writeText(url);
      toast.success("Verification link copied to clipboard!");
    } else {
      toast.error("Verification link not available.");
    }
  };

  const getStatusColor = (status: Certificate['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'upgraded': return 'bg-gray-100 text-gray-800';
      case 'revoked': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container py-12 flex flex-col items-center justify-center min-h-[400px]">
        <RefreshCw className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground animate-pulse">Loading certifications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-12">
        <Card className="max-w-md mx-auto border-red-100 shadow-lg">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle>Error Loading Certifications</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Certifications</h1>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {activeCertificate ? (
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-none shadow-xl bg-gradient-to-br from-white to-slate-50 overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Award className="h-24 w-24 text-primary" />
              </div>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 uppercase tracking-wider text-[10px] font-bold">
                    Active Credential
                  </Badge>
                  <div className="bg-primary/10 p-2 rounded-xl">
                    <Award className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold">{activeCertificate.startupName}</CardTitle>
                <CardDescription className="text-blue-600 font-bold uppercase tracking-widest text-[10px]">Certified Startup</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm py-2 border-b border-slate-100">
                    <span className="text-slate-500 font-medium flex items-center gap-2"><FileText className="h-4 w-4" /> Certificate ID</span>
                    <span className="font-mono font-bold text-slate-900">{activeCertificate.certificateId}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm py-2 border-b border-slate-100">
                    <span className="text-slate-500 font-medium flex items-center gap-2"><Calendar className="h-4 w-4" /> Issued Date</span>
                    <span className="font-bold text-slate-900">{new Date(activeCertificate.issueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm py-2 border-b border-slate-100">
                    <span className="text-slate-500 font-medium flex items-center gap-2"><Shield className="h-4 w-4" /> Authority</span>
                    <span className="font-bold text-slate-900 text-right text-xs">Min. of Innovation & Tech</span>
                  </div>
                  <div className="flex items-center justify-between text-sm py-2">
                    <span className="text-slate-500 font-medium flex items-center gap-2"><Clock className="h-4 w-4" /> Expiry</span>
                    <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-bold">No Expiration</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button className="w-full shadow-lg shadow-primary/20" onClick={() => handleDownloadCertificate(activeCertificate)}>
                    <Download className="mr-2 h-4 w-4" /> Download
                  </Button>
                  <Button variant="outline" className="w-full border-slate-200" onClick={() => handleShareVerification(activeCertificate)}>
                    <Share2 className="mr-2 h-4 w-4" /> Share
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Key Requirements
                </CardTitle>
                <CardDescription>To maintain your active status</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-3">
                  {activeCertificate.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 transition-colors hover:bg-slate-100/50">
                      <div className="mt-0.5 bg-green-100 p-1 rounded-full">
                        <Check className="h-3 w-3 text-green-600" />
                      </div>
                      <span className="text-xs text-slate-700 font-medium leading-relaxed">{req}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" className="w-full text-xs text-primary font-bold hover:bg-primary/5" onClick={handleViewRequirements}>
                  View Official Standards <ExternalLink className="ml-2 h-3 w-3" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        ) : (
          <div className="lg:col-span-1">
            <Card className="border-dashed border-2 flex flex-col items-center justify-center p-12 text-center h-full bg-slate-50/50">
              <div className="bg-slate-100 p-6 rounded-3xl mb-4">
                <AlertCircle className="h-12 w-12 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">No Certification Yet</h3>
              <p className="text-slate-500 mt-2 max-w-xs mx-auto text-sm">
                Your organization is currently transitioning through the national evaluation layers.
              </p>
              <Button asChild className="mt-8 rounded-xl px-8 shadow-lg shadow-primary/20">
                <Link href="/dashboard/application/apply">Submit Application</Link>
              </Button>
            </Card>
          </div>
        )}

        <div className="lg:col-span-2 space-y-6">
          {activeCertificate && (
            <Card className="border-none shadow-2xl overflow-hidden bg-slate-900 ring-1 ring-white/10">
              <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-4 bg-slate-950/50">
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    Official Credential Preview
                  </CardTitle>
                  <CardDescription className="text-slate-400">Verified System Generated Document</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white hover:bg-white/10 rounded-lg" onClick={() => window.open(`/api/certificates/${activeCertificate.realCertificateId}/download?inline=true`, '_blank')}>
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0 bg-slate-800 relative group">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 pointer-events-none z-10" />
                <iframe 
                  src={`/api/certificates/${activeCertificate.realCertificateId}/download?inline=true`}
                  className="w-full h-[650px] border-none"
                  title="Official Certificate Document"
                />
              </CardContent>
              <CardFooter className="bg-slate-950/80 p-4 border-t border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none pt-0.5">Blockchain Verified • Hash: {activeCertificate.realCertificateId?.slice(0, 16)}...</span>
                </div>
                <Button variant="ghost" size="sm" className="text-primary font-bold text-[10px] hover:bg-primary/10 uppercase tracking-widest h-8" onClick={() => handleDownloadCertificate(activeCertificate)}>
                  <Download className="h-3.5 w-3.5 mr-2" /> Download Original
                </Button>
              </CardFooter>
            </Card>
          )}


        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Certification History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Certificate ID</TableHead>
                  <TableHead>Startup Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Issue Date</TableHead>
                  <TableHead className="hidden sm:table-cell">Expiry Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {certificates.map((cert) => (
                  <TableRow key={cert.id}>
                    <TableCell className="font-mono text-xs">{cert.certificateId}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100 uppercase text-[10px]">
                        {cert.startupName}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {new Date(cert.issueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-slate-400 font-medium">
                      {cert.expiryDate === "N/A" ? "Perpetual" : new Date(cert.expiryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(cert.status)}>
                        {cert.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => handleViewCertificate(cert)} title="View Details">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => handleShareVerification(cert)} title="Share Verification">
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => handleDownloadCertificate(cert)} title="Download PDF">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View Certificate Dialog */}
      <Dialog open={isViewCertificateOpen} onOpenChange={setIsViewCertificateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Certificate Details</DialogTitle>
            <DialogDescription>
              {selectedCertificate?.certificateId}
            </DialogDescription>
          </DialogHeader>
          {selectedCertificate && (
            <div className="space-y-4">
              <div className="flex items-center justify-center py-6">
                <div className="text-center">
                  <div className="mx-auto rounded-full bg-primary/10 p-6 mb-4">
                    <Award className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">{selectedCertificate.startupName}</h3>
                  <p className="text-muted-foreground text-sm uppercase tracking-wider font-bold text-blue-600">Certified Startup</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <FileText className="h-4 w-4" />
                    Certificate ID
                  </div>
                  <p className="font-medium">{selectedCertificate.certificateId}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Calendar className="h-4 w-4" />
                    Issue Date
                  </div>
                  <p className="font-medium">
                    {new Date(selectedCertificate.issueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Calendar className="h-4 w-4" />
                    Expiry Date
                  </div>
                  <p className="font-medium">
                    {selectedCertificate.expiryDate === "N/A" ? "No Expiration" : new Date(selectedCertificate.expiryDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Building2 className="h-4 w-4" />
                    Issued By
                  </div>
                  <p className="font-medium text-sm">{selectedCertificate.issuedBy}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Requirements</h4>
                <ul className="space-y-2">
                  {selectedCertificate.requirements.map((req, idx) => (
                    <li key={idx} className="flex items-center text-sm">
                      <Check className="h-4 w-4 mr-2 text-green-600" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsViewCertificateOpen(false)}>Close</Button>
            <Button variant="secondary" onClick={() => handleShareVerification(selectedCertificate)}>
              <Share2 className="mr-2 h-4 w-4" />
              Copy Link
            </Button>
            <Button onClick={() => selectedCertificate && handleDownloadCertificate(selectedCertificate)}>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Requirements Dialog */}
      <Dialog open={isRequirementsOpen} onOpenChange={setIsRequirementsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Certification Requirements</DialogTitle>
            <DialogDescription>
              Full list of requirements to maintain your certification
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-3">Annual Requirements</h4>
              <ul className="space-y-2">
                {activeCertificate?.requirements.map((req, idx) => (
                  <li key={idx} className="flex items-start">
                    <Check className="h-4 w-4 mr-2 text-green-600 mt-0.5" />
                    <span className="text-sm">{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">Important Notes</h4>
              <ul className="space-y-1 text-sm text-blue-800">
                <li>• All requirements must be met annually to maintain certification</li>
                <li>• Failure to meet requirements may result in certification suspension</li>
                <li>• Submit annual reports by the anniversary of your certification date</li>
                <li>• Contact support if you need assistance meeting requirements</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRequirementsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


    </div>
  );
}
