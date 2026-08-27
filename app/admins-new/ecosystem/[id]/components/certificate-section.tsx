import React from 'react';
import Link from 'next/link';
import { 
  Award, 
  CheckCircle, 
  Clock, 
  Download, 
  FileText, 
  Share2,
  Calendar,
  AlertCircle,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  FileSearch
} from 'lucide-react';

import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { setEcosystemBuilderCertified } from "../../ecosystem-actions";
import { EcosystemCertificateModal } from "../../components/ecosystem-certificate-modal";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

interface CertificateSectionProps {
  builder: {
    id: string;
    name: string;
    certified: boolean;
    [key: string]: any;
  };
}

export default function CertificateSection({ builder }: CertificateSectionProps) {
  const [showIssueModal, setShowIssueModal] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Current date for certificate issuance
  const currentDate = new Date();
  const issueDate = currentDate.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  // Calculate expiry date (2 years from now)
  const expiryDate = new Date(currentDate);
  expiryDate.setFullYear(expiryDate.getFullYear() + 2);
  const expiryDateString = expiryDate.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const handleIssueCertificate = async () => {
    setIsSubmitting(true);
    try {
      const res = await setEcosystemBuilderCertified(builder.id, true);
      if (res.success) {
        toast.success("Certificate issued successfully");
        setShowIssueModal(false);
        // We might want to reload or update parent state here
        window.location.reload(); 
      } else {
        toast.error(res.message || "Failed to issue certificate");
      }
    } catch (error) {
      toast.error("An error occurred during issuance");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-6">
      {builder.certified ? (
        <>
          <Card className="border-green-100">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center pb-6">
                <div className="h-16 w-16 rounded-full bg-green-50 flex items-center justify-center mb-4">
                  <Award className="h-8 w-8 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold mb-1">Certified Ecosystem Builder</h2>
                <p className="text-muted-foreground">
                  {builder.name} is an officially certified ecosystem builder by the Ethiopian Ministry of Innovation and Technology.
                </p>
              </div>
              
              <div className="grid gap-6 md:grid-cols-3 pt-4 border-t">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Certificate Number</div>
                  <div className="font-medium">ETH-EB-2025-{builder.id.split('-')[1]}</div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Issue Date</div>
                  <div className="font-medium">{issueDate}</div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Valid Until</div>
                  <div className="font-medium">{expiryDateString}</div>
                </div>
              </div>
              
              <div className="flex justify-center gap-3 mt-6">
                <Link href={`/admins-new/certificates/${builder.applicationId || builder.id}`} passHref>
                  <Button variant="outline">
                    <Award className="mr-2 h-4 w-4" />
                    View Certificate
                  </Button>
                </Link>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Download Certificate
                </Button>
                <Button variant="outline">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share Certificate
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Certification Standards</CardTitle>
                <CardDescription>
                  This organization meets or exceeds the following standards
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span>Infrastructure Quality</span>
                      </div>
                      <span>92%</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span>Service Quality</span>
                      </div>
                      <span>95%</span>
                    </div>
                    <Progress value={95} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span>Startup Success Rate</span>
                      </div>
                      <span>87%</span>
                    </div>
                    <Progress value={87} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span>Financial Stability</span>
                      </div>
                      <span>90%</span>
                    </div>
                    <Progress value={90} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span>Job Creation Impact</span>
                      </div>
                      <span>88%</span>
                    </div>
                    <Progress value={88} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Audit & Renewal</CardTitle>
                <CardDescription>
                  Certification renewal and audit information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-5">
                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 text-muted-foreground mr-3 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Next Audit Date</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        January 15, 2026
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <FileText className="h-5 w-5 text-muted-foreground mr-3 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Audit Requirements</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Annual financial statements, impact reports, and member survey results are required for the next audit.
                      </p>
                      <Button variant="link" className="p-0 h-auto mt-1">
                        View full requirements
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-muted-foreground mr-3 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Previous Audit</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Last audit completed on January 15, 2023 with a 94% compliance score.
                      </p>
                      <Button variant="link" className="p-0 h-auto mt-1">
                        View audit report
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-full bg-amber-50 flex items-center justify-center mb-4">
                <Clock className="h-8 w-8 text-amber-500" />
              </div>
              <h2 className="text-2xl font-bold mb-1">Certification Pending</h2>
              <p className="text-muted-foreground mb-6">
                {builder.name} has applied for certification but has not yet completed the process.
              </p>
              
              <div className="w-full max-w-md">
                <div className="space-y-2 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span>Certification Progress</span>
                    <span>65%</span>
                  </div>
                  <Progress value={65} className="h-2" />
                </div>
              </div>
              
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 mb-6 max-w-lg">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-amber-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <h4 className="font-medium text-amber-800">Outstanding Requirements</h4>
                    <ul className="mt-2 space-y-1 text-amber-700">
                      <li>• Complete on-site infrastructure assessment</li>
                      <li>• Submit startup success metrics from the past 2 years</li>
                      <li>• Financial stability documentation</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              {builder.workflowStatus === 'COMMITTEE_REVIEW_SUBMITTED' ? (
                <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => setShowIssueModal(true)}>
                  <Award className="mr-2 h-4 w-4" />
                  Issue Certificate
                </Button>
              ) : (
                <div className="flex flex-col items-center">
                  <Badge variant="outline" className="mb-4 py-1 px-3 border-amber-200 bg-amber-50 text-amber-700">
                    <Clock className="h-3 w-3 mr-1" />
                    Pending Committee Finalization
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    Certification actions will unlock once the committee review is submitted.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <EcosystemCertificateModal
        isOpen={showIssueModal}
        onClose={() => setShowIssueModal(false)}
        builder={builder as any}
        ecoApplicationId={builder.applicationId}
        onSuccess={() => window.location.reload()}
      />
    </div>
  );
}
