"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
import { 
  ArrowLeft, 
  Building2, 
  Calendar, 
  CalendarDays,
  Check,
  CheckCircle,
  ChevronRight,
  Clock, 
  Download,
  ExternalLink, 
  FileText,
  GraduationCap,
  Landmark,
  Mail, 
  MapPin, 
  Share2, 
  Target,
  User2, 
  Users,
  Loader2
} from "lucide-react";

// Removed mock data generator

export default function FundingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params?.id === 'string' ? params.id : '';
  
  const [funding, setFunding] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isCertified, setIsCertified] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (id) {
      fetchFundingDetails();
    }
  }, [id]);

  const fetchFundingDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/funding/${id}`);
      const result = await res.json();
      if (result.success) {
        setFunding(result.data);
        setIsCertified(result.userCertified);
      } else {
        toast.error(result.error || "Failed to load details");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Status badge color mapping
  const statusColor = {
    "active": "bg-green-100 text-green-800 hover:bg-green-200",
    "Active": "bg-green-100 text-green-800 hover:bg-green-200",
    "Coming Soon": "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
    "New": "bg-blue-100 text-blue-800 hover:bg-blue-200",
    "Closed": "bg-red-100 text-red-800 hover:bg-red-200"
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-sky-600" />
      </div>
    );
  }

  if (!funding) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Opportunity Not Found</h2>
        <Button asChild variant="link" className="mt-4">
           <Link href="/dashboard/funding">Back to Funding Opportunities</Link>
        </Button>
      </div>
    );
  }

  // Start application process
  const startApplication = () => {
    if (!isCertified) {
        toast.error("Startup certification is required to apply for funding.");
        return;
    }
    router.push(`/dashboard/funding/${id}/apply`);
  };

  return (
    <div className="space-y-6">
      {/* Top navigation */}
      <div className="flex justify-between items-center">
        <Link 
          href="/dashboard/funding" 
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span>Back to Funding Opportunities</span>
        </Link>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" className="flex items-center">
            <Share2 className="h-4 w-4 mr-1" />
            <span>Share</span>
          </Button>
          <Button variant="outline" size="sm" className="flex items-center">
            <Download className="h-4 w-4 mr-1" />
            <span>Download Details</span>
          </Button>
        </div>
      </div>

      {!isCertified && (
          <Card className="border-amber-200 bg-amber-50">
              <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                          <Clock className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                          <p className="font-semibold text-amber-900">Certification Required</p>
                          <p className="text-sm text-amber-700">You must be certified before you can apply for this funding.</p>
                      </div>
                  </div>
                  <Button variant="outline" className="border-amber-300 text-amber-800 hover:bg-amber-100" asChild>
                      <Link href="/dashboard/application">Go to Certification</Link>
                  </Button>
              </CardContent>
          </Card>
      )}

      {/* Header card */}
      <Card className={`shadow-md border-l-4 ${
        funding.status === 'Active' ? 'border-l-green-500' : 
        funding.status === 'Coming Soon' ? 'border-l-yellow-500' : 
        funding.status === 'New' ? 'border-l-blue-500' : 'border-l-red-500'
      }`}>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className={statusColor[funding.status as keyof typeof statusColor]}>
                  {funding.status}
                </Badge>
                <Badge variant="outline">{funding.category}</Badge>
              </div>
              <CardTitle className="text-2xl">{funding.title}</CardTitle>
              <CardDescription className="mt-2">{funding.description}</CardDescription>
            </div>
            <div className="flex flex-col md:items-end gap-2">
              <div className="flex text-sm text-gray-500 items-center gap-1">
                <Clock size={14} />
                <span>{funding.daysLeft === 0 ? "Expired" : `${funding.daysLeft} days left`}</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold">USD {funding.amountMin?.toLocaleString()}</span>
                <span className="text-xl">-</span>
                <span className="text-2xl font-bold">{funding.amountMax?.toLocaleString()}</span>
              </div>
              <Button 
                onClick={startApplication}
                className="mt-2 bg-green-600 hover:bg-green-700 w-full md:w-auto"
              >
                Apply Now
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Key details banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <CalendarDays className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Application Deadline</p>
              <p className="font-medium">{funding.deadlineFormatted}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Applicants</p>
              <p className="font-medium">{funding.applicationCount || 0} startups</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <Landmark className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Provider</p>
              <p className="font-medium">{funding.organization || "Private Entity"}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Location</p>
              <p className="font-medium">{funding.location || "National"}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content area */}
      <div className="max-w-6xl mx-auto">
        <Tabs 
          defaultValue="overview" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid grid-cols-4 sm:grid-cols-5 w-full max-w-2xl">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="eligibility">Eligibility</TabsTrigger>
            <TabsTrigger value="application">Process</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="winners" className="hidden sm:block">Winners</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>About This Funding</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="whitespace-pre-line">{funding.longDescription}</p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Funding Uses</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        {(funding.fundingUses || []).map((use: string, index: number) => (
                          <li key={index} className="text-gray-700">{use}</li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Required Documents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {(funding.requiredDocuments || []).length > 0 ? funding.requiredDocuments.map((doc: string, index: number) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <FileText className="h-4 w-4 text-gray-600" />
                          </div>
                          <p>{doc}</p>
                        </div>
                      )) : (
                        <p className="text-sm text-muted-foreground">No specific documents listed. Check application form.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Important Dates</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="relative">
                        {/* Timeline line */}
                        <div className="absolute top-0 bottom-0 left-3 w-0.5 bg-gray-200" />
                        
                        {/* Timeline events */}
                        <div className="space-y-5">
                          <div className="flex items-start ml-0 relative">
                            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center z-10">
                              <Check className="h-3 w-3 text-green-600" />
                            </div>
                            <div className="ml-4">
                              <p className="text-sm text-gray-500">Started</p>
                              <p className="font-medium">{funding.startDate}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start ml-0 relative">
                            <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center z-10">
                              <Clock className="h-3 w-3 text-red-600" />
                            </div>
                            <div className="ml-4">
                              <p className="text-sm text-gray-500">Application Deadline</p>
                              <p className="font-medium">{funding.deadlineFormatted}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start ml-0 relative">
                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center z-10">
                              <Mail className="h-3 w-3 text-blue-600" />
                            </div>
                            <div className="ml-4">
                              <p className="text-sm text-gray-500">Status</p>
                              <Badge variant={funding.status === "active" || funding.status === "open" ? "default" : "secondary"}>{funding.status}</Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Provider</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 relative rounded-lg overflow-hidden bg-sky-50 flex items-center justify-center border border-sky-100">
                        <Landmark className="h-6 w-6 text-sky-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">{funding.organization || "Private Entity"}</h3>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest font-black">Official Partner</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{funding.creator?.name || "Member of Digital Ethiopia Network"}</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Eligibility Tab */}
          <TabsContent value="eligibility" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Eligibility Criteria</CardTitle>
                <CardDescription>Requirements that startups must meet to be eligible for this funding</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {(funding.eligibility || []).length > 0 ? (funding.eligibility || []).map((criteria: string, index: number) => (
                    <div key={index} className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">Criterion {index + 1}</h3>
                        <p className="text-gray-600 mt-1">{criteria}</p>
                      </div>
                    </div>
                  )) : (
                    <p className="text-sm text-muted-foreground">No specific eligibility criteria provided.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Selection Criteria</CardTitle>
                <CardDescription>How applications will be evaluated</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-5">
                  {(funding.selectionCriteria || []).map((criteria: any, index: number) => (
                    <div key={index}>
                      <div className="flex justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-gray-500" />
                          <h3 className="font-medium">{criteria.criterion}</h3>
                        </div>
                        <Badge variant="outline">{criteria.weight}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 ml-6">{criteria.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4 bg-gray-50">
                <p className="text-sm italic text-gray-600">
                  Note: Evaluation will be conducted by a panel of industry experts and investors.
                </p>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Application Process Tab */}
          <TabsContent value="application" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Application Process</CardTitle>
                <CardDescription>Steps to apply for this funding opportunity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  {/* Process line */}
                  <div className="absolute top-0 bottom-0 left-9 w-0.5 bg-gray-200" />
                  
                  <div className="space-y-8">
                    {(funding.applicationProcess || []).length > 0 ? (funding.applicationProcess || []).map((step: string, index: number) => (
                      <div key={index} className="flex gap-4 relative">
                        <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 z-10 border-4 border-white">
                          <span className="text-lg font-bold text-blue-600">{index + 1}</span>
                        </div>
                        <div className="pt-3">
                          <h3 className="font-semibold text-lg">Stage {index + 1}</h3>
                          <p className="text-gray-600 mt-1">{step}</p>
                        </div>
                      </div>
                    )) : (
                      <p className="text-sm text-muted-foreground italic ml-10">Process details not specified by provider.</p>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center border-t pt-6">
                <Button 
                  onClick={startApplication}
                  className="bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  Start Application
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* FAQ Tab */}
          <TabsContent value="faq" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {(funding.faq || []).map((item: any, index: number) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left font-medium">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-600">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <div className="w-full text-center">
                  <p className="text-sm text-gray-600 mb-3">
                    Don&apos;t see your question answered here?
                  </p>
                  <Button variant="outline">Contact Funding Team</Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Winners Tab */}
          <TabsContent value="winners" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Previous Funding Recipients</CardTitle>
                <CardDescription>Startups who received funding in previous rounds</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(funding.previousRecipients || []).map((recipient: any, index: number) => (
                    <Card key={index}>
                      <CardContent className="p-4 flex items-start gap-3">
                        <div className="w-14 h-14 relative rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          <Image
                            src={recipient.logo}
                            alt={recipient.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between items-center">
                            <h3 className="font-medium">{recipient.name}</h3>
                            <Badge variant="outline">{recipient.year}</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{recipient.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Call to action footer */}
      <div className="bg-green-50 p-6 rounded-lg mt-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h3 className="text-lg font-semibold text-green-800">Ready to grow your startup?</h3>
            <p className="text-green-700">Apply for this funding opportunity before {funding.deadlineFormatted}</p>
          </div>
          <Button 
            onClick={startApplication}
            className="bg-green-600 hover:bg-green-700"
            size="lg"
          >
            Start Your Application
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
