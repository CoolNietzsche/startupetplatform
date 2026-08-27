"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  AlertCircle,
  ArrowLeft, 
  Building, 
  CalendarDays, 
  Check, 
  CheckCircle,
  CircleCheck,
  CircleDot,
  CircleX, 
  Clock, 
  Download,
  ExternalLink, 
  Eye,
  FileDown,
  FileText,
  HelpCircle,
  MessageCircle,
  MessagesSquare,
  PenLine,
  User2
} from "lucide-react";

// Mock application data
const getApplicationData = (id: string) => {
  // This would be replaced with an API call in a real implementation
  return {
    id,
    programName: "Ethiopian Startup Growth Fund 2025",
    status: "Under Review",
    statusType: "review",
    fundingAmount: "45,000",
    submissionDate: "April 23, 2025",
    reviewDate: "May 23, 2025",
    category: "Seed Funding",
    provider: "Ministry of Innovation and Technology",
    providerContact: "funding@mint.gov.et",
    company: {
      name: "TechVenture Ethiopia",
      registrationNumber: "ET-BUS-23456",
      foundingDate: "2022-06-15",
      website: "https://techventure-eth.com",
      employeeCount: "11-20",
      sector: "Technology & Software",
      stage: "Seed",
      description: "TechVenture Ethiopia is a technology company focused on developing innovative software solutions for businesses in the Ethiopian market. Our core products include cloud-based ERP systems tailored for local businesses and mobile payment integration platforms.",
      address: "Bole Road, Addis Ababa",
      city: "Addis Ababa"
    },
    project: {
      title: "Enterprise Cloud Solution for SMEs",
      summary: "A cloud-based enterprise resource planning solution designed specifically for Ethiopian small and medium enterprises, addressing local business needs, compliance requirements, and integration with local payment systems.",
      objectives: "1. Develop a fully localized ERP platform\n2. Integrate with local payment systems\n3. Ensure compliance with Ethiopian tax regulations\n4. Create a scalable architecture for different business sizes",
      problemStatement: "Ethiopian SMEs struggle with expensive and complex ERP systems designed for western markets that don't address local business practices, language needs, or regulatory compliance requirements.",
      solution: "Our solution provides a cost-effective, fully localized ERP system with Amharic language support, compliance with Ethiopian tax regulations, and seamless integration with local payment providers and banks.",
      targetMarket: "Small and medium businesses in Ethiopia, focusing initially on retail, distribution, and service businesses with 5-50 employees.",
      competitiveAdvantage: "Our solution is built from the ground up for the Ethiopian market, unlike international solutions that are merely translated or superficially adapted. We understand local business practices and regulations deeply.",
      fundingAmount: "45000",
      fundingUsage: "The requested funding will be used for:\n- Development team expansion (60%)\n- Server infrastructure and operations (15%)\n- Marketing and customer acquisition (15%)\n- Compliance certification and legal requirements (10%)",
      currentProgress: "MVP",
      keyMilestones: "1. Complete core accounting and inventory modules (Month 3)\n2. Implement local payment integrations (Month 5)\n3. Launch beta with 15 test customers (Month 7)\n4. Full commercial launch (Month 10)",
      sustainabilityImpact: "Financial Inclusion"
    },
    documents: {
      businessRegistration: { filename: "Business_Registration.pdf", url: "#", type: "application/pdf", size: 1240000 },
      businessPlan: { filename: "TechVenture_Business_Plan.pdf", url: "#", type: "application/pdf", size: 2800000 },
      financialProjections: { filename: "Financial_Projections_2025-2027.xlsx", url: "#", type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", size: 980000 },
      teamCVs: { filename: "Team_CVs.pdf", url: "#", type: "application/pdf", size: 3200000 },
      proofOfConcept: { filename: "Product_Demo_Screenshots.pdf", url: "#", type: "application/pdf", size: 4100000 }
    },
    timeline: [
      { date: "April 23, 2025", title: "Application Submitted", description: "Your application was successfully submitted", status: "complete" },
      { date: "April 30, 2025", title: "Initial Screening", description: "Application passed initial eligibility screening", status: "complete" },
      { date: "May 15, 2025", title: "Technical Review", description: "Detailed review by technical committee", status: "current" },
      { date: "May 23, 2025", title: "Decision", description: "Final funding decision will be made", status: "upcoming" },
      { date: "June 15, 2025", title: "Disbursement", description: "Funds will be disbursed if approved", status: "upcoming" }
    ],
    communication: [
      { 
        date: "April 25, 2025", 
        from: "system", 
        subject: "Application Received", 
        message: "Thank you for submitting your application to the Ethiopian Startup Growth Fund 2025. Your application has been received and is now under review. We will be in touch with updates as they become available." 
      },
      { 
        date: "April 30, 2025", 
        from: "reviewer", 
        subject: "Initial Screening Complete", 
        message: "We are pleased to inform you that your application has passed our initial screening process. Your application will now move to the technical review phase, where our expert committee will evaluate the details of your project." 
      }
    ]
  };
};

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params?.id === 'string' ? params.id : '';
  const [activeTab, setActiveTab] = useState("overview");
  
  const application = getApplicationData(id);
  
  const getStatusBadge = (statusType: string) => {
    switch (statusType) {
      case "draft":
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Draft</Badge>;
      case "review":
        return <Badge className="bg-amber-100 text-amber-800">Under Review</Badge>;
      case "shortlisted":
        return <Badge className="bg-blue-100 text-blue-800">Shortlisted</Badge>;
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case "declined":
        return <Badge className="bg-red-100 text-red-800">Declined</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            asChild
          >
            <Link href="/dashboard/funding/my-applications">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Application: {application.id}</h1>
        </div>
        {getStatusBadge(application.statusType)}
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-xl">{application.programName}</CardTitle>
              <CardDescription>{application.category} • Submitted on {application.submissionDate}</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex gap-2 items-center">
                <MessageCircle className="h-4 w-4" />
                <span>Contact</span>
              </Button>
              <Button className="flex gap-2 items-center">
                <FileDown className="h-4 w-4" />
                <span>Download PDF</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Application Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Application Progress</span>
                <span className="text-gray-500">Decision by {application.reviewDate}</span>
              </div>
              <Progress value={60} className="h-2" />
              
              <div className="grid grid-cols-5 text-xs mt-1 pb-4">
                {application.timeline.map((step, i) => (
                  <div 
                    key={i}
                    className={`flex flex-col items-center text-center ${
                      step.status === 'complete' 
                        ? 'text-green-600' 
                        : step.status === 'current' 
                          ? 'text-blue-600'
                          : 'text-gray-400'
                    }`}
                  >
                    {step.status === 'complete' ? (
                      <CheckCircle className="h-5 w-5 mb-1" />
                    ) : step.status === 'current' ? (
                      <CircleDot className="h-5 w-5 mb-1" />
                    ) : (
                      <Circle className="h-5 w-5 mb-1" />
                    )}
                    <span className="font-medium">{step.title}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-5 w-full max-w-3xl">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="communication">Communication</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="mt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <Building className="h-5 w-5 text-gray-600" />
                        <CardTitle className="text-base">Company</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm text-gray-500">Name</p>
                          <p className="font-medium">{application.company.name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Business Registration</p>
                          <p className="font-medium">{application.company.registrationNumber}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Sector & Stage</p>
                          <p className="font-medium">{application.company.sector} • {application.company.stage}</p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="border-t pt-3">
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="h-3 w-3 mr-1" />
                        View Full Details
                      </Button>
                    </CardFooter>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-gray-600" />
                        <CardTitle className="text-base">Project</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm text-gray-500">Title</p>
                          <p className="font-medium">{application.project.title}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Funding Request</p>
                          <p className="font-medium">${application.project.fundingAmount} USD</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Current Progress</p>
                          <p className="font-medium">{application.project.currentProgress}</p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="border-t pt-3">
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="h-3 w-3 mr-1" />
                        View Full Details
                      </Button>
                    </CardFooter>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <ExternalLink className="h-5 w-5 text-gray-600" />
                        <CardTitle className="text-base">Provider</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm text-gray-500">Organization</p>
                          <p className="font-medium">{application.provider}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Category</p>
                          <p className="font-medium">{application.category}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Contact</p>
                          <p className="font-medium">{application.providerContact}</p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="border-t pt-3">
                      <Button variant="outline" size="sm" className="w-full">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Visit Provider
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
                
                <div className="bg-gray-50 border rounded-lg p-4">
                  <div className="flex gap-2 mb-4">
                    <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium">Next Steps</h3>
                      <p className="text-sm text-gray-600">Your application is currently in the Technical Review phase. The expert committee is reviewing your project details and documents.</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-sm">
                      <span className="text-gray-500">Estimated decision by:</span>
                      <span className="font-medium ml-1">{application.timeline[3].date}</span>
                    </div>
                    <Button variant="outline" className="flex gap-2 items-center">
                      <HelpCircle className="h-4 w-4" />
                      <span>Request Update</span>
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="details" className="mt-6">
                {/* Content for the Details tab would be here */}
                <p>Company and project details will be displayed here.</p>
              </TabsContent>
              
              <TabsContent value="documents" className="mt-6">
                {/* Content for the Documents tab would be here */}
                <p>Uploaded documents will be displayed here.</p>
              </TabsContent>
              
              <TabsContent value="timeline" className="mt-6">
                {/* Content for the Timeline tab would be here */}
                <p>Application timeline would be displayed here.</p>
              </TabsContent>
              
              <TabsContent value="communication" className="mt-6">
                {/* Content for the Communication tab would be here */}
                <p>Communication history would be displayed here.</p>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import styles from "../../funding.module.css";

// Circle component for the timeline
function Circle({ className }: { className?: string }) {
  return (
    <div className={`rounded-full border-2 border-current w-5 h-5 ${className || ""}`} />
  );
}
