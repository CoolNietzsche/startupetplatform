"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
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
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  Download,
  ExternalLink,
  Flag,
  Globe,
  Mail,
  MapPin,
  Phone,
  Share2,
  User2,
  Users,
  Award,
  TrendingUp,
  FileText,
  CheckCircle,
  BarChart3,
  Activity,
  AlertCircle
} from "lucide-react";
import { getStartupByIdForDashboard } from "../actions";

const PLACEHOLDER_COVER = "https://images.unsplash.com/photo-1560179707-f14e90ef3623?q=80&w=3174&auto=format&fit=crop";
const PLACEHOLDER_LOGO = "https://images.unsplash.com/photo-1563906267088-b029e7101114?q=80&w=1000&auto=format&fit=crop";

export default function StartupDetailsPage() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";
  const [startup, setStartup] = useState<{
    id: string;
    name: string;
    logo: string;
    coverImage: string;
    tagline: string;
    description: string;
    status: string;
    foundedDate: string;
    sector: string;
    stage: string;
    employeeCount: string;
    location: string;
    websiteUrl: string;
    email: string;
    phone: string;
    founders: { name: string; role: string; image?: string; bio?: string }[];
    team: { name: string; role: string }[];
    traction: {
      customers: number;
      revenue: string;
      growth: string;
      metrics: { label: string; value: number }[];
    };
    funding: {
      raised: string;
      rounds: { type: string; amount: string; date: string; investors: string[] }[];
      seeking: string;
    };
    products: { name: string; description: string; status: string; image: string }[];
    documents: { name: string; type: string; size?: string; date: string }[];
    milestones: { title: string; date: string; completed: boolean }[];
    verificationProgress: number;
    verificationSteps: { name: string; status: string }[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await getStartupByIdForDashboard(id);
        if (cancelled) return;
        if (res.success && res.data) {
          const d = res.data;
          setStartup({
            id: d.id,
            name: d.name,
            logo: d.logo || PLACEHOLDER_LOGO,
            coverImage: PLACEHOLDER_COVER,
            tagline: d.description?.slice(0, 80) || d.name,
            description: d.description || "No description available.",
            status: d.status,
            foundedDate: String(d.founded),
            sector: d.sector,
            stage: d.stage,
            employeeCount: d.employees ? String(d.employees) : "—",
            location: d.location,
            websiteUrl: d.website.startsWith("http") ? d.website : `https://${d.website}`,
            email: d.email,
            phone: d.phone,
            founders: d.founders.map((f) => ({
              name: f.name,
              role: f.role,
              image: PLACEHOLDER_LOGO,
              bio: f.email ? `Contact: ${f.email}` : undefined,
            })),
            team: [],
            traction: {
              customers: 0,
              revenue: d.financials.revenue?.Current || "—",
              growth: "—",
              metrics: [],
            },
            funding: {
              raised: d.financials.fundingTotal,
              rounds: [],
              seeking: d.financials.investmentNeeded || "—",
            },
            products: [],
            documents: d.documents.map((doc) => ({ name: doc.name, type: doc.type, date: doc.date })),
            milestones: [
              { title: "Certified", date: d.certification.issued, completed: true },
            ],
            verificationProgress: 100,
            verificationSteps: [
              { name: "Certification", status: "completed" },
            ],
          });
        } else {
          setError(res.message || "Startup not found");
        }
      } catch (err) {
        if (!cancelled) setError("Failed to load startup");
        console.error(err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  if (isLoading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <Activity className="h-16 w-16 text-primary animate-spin mb-4" />
        <h1 className="text-2xl font-bold mb-2">Loading startup...</h1>
      </div>
    );
  }

  if (error || !startup) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <AlertCircle className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-2">Startup not found</h1>
        <p className="text-muted-foreground mb-6">{error || "This startup could not be loaded."}</p>
        <Button asChild>
          <Link href="/dashboard/startups">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Startups
          </Link>
        </Button>
      </div>
    );
  }

  // Status badge color mapping
  const statusColor = {
    "Verified": "bg-green-100 text-green-800 hover:bg-green-200",
    "Pending": "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
    "New": "bg-blue-100 text-blue-800 hover:bg-blue-200",
    "Rejected": "bg-red-100 text-red-800 hover:bg-red-200"
  };

  return (
    <div className="space-y-6">
      {/* Top navigation */}
      <div className="flex justify-between items-center">
        <Link 
          href="/dashboard/startups" 
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span>Back to Startups</span>
        </Link>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" className="flex items-center">
            <Share2 className="h-4 w-4 mr-1" />
            <span>Share</span>
          </Button>
          <Button size="sm" className="bg-green-600 hover:bg-green-700">
            <Mail className="h-4 w-4 mr-1" />
            <span>Contact</span>
          </Button>
        </div>
      </div>

      {/* Hero section */}
      <div className="relative h-48 md:h-64 w-full rounded-xl overflow-hidden">
        <Image
          src={startup.coverImage}
          alt={`${startup.name} cover image`}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute bottom-4 left-4 flex items-center">
          <div className="w-20 h-20 rounded-lg overflow-hidden bg-white shadow-md relative">
            <Image
              src={startup.logo}
              alt={`${startup.name} logo`}
              fill
              className="object-cover"
            />
          </div>
          <div className="ml-4 text-white">
            <h1 className="text-2xl font-bold tracking-tight">{startup.name}</h1>
            <div className="flex items-center mt-1">
              <MapPin className="h-4 w-4 mr-1" />
              <span className="text-sm">{startup.location}</span>
            </div>
          </div>
        </div>
        <Badge className={`absolute top-4 right-4 ${statusColor[startup.status as keyof typeof statusColor]}`}>
          {startup.status}
        </Badge>
      </div>

      {/* Content area */}
      <div className="max-w-6xl mx-auto">
        <Tabs 
          defaultValue="overview" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid grid-cols-5 w-full max-w-2xl">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="traction">Traction</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>About</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg font-medium text-gray-800 mb-4">{startup.tagline}</p>
                    <p className="text-gray-600">{startup.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                      <div>
                        <p className="text-sm text-gray-500">Founded</p>
                        <div className="flex items-center mt-1">
                          <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                          <p className="font-medium">{startup.foundedDate}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Sector</p>
                        <div className="flex items-center mt-1">
                          <Building2 className="h-4 w-4 mr-1 text-gray-400" />
                          <p className="font-medium">{startup.sector}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Stage</p>
                        <div className="flex items-center mt-1">
                          <Flag className="h-4 w-4 mr-1 text-gray-400" />
                          <p className="font-medium">{startup.stage}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Team Size</p>
                        <div className="flex items-center mt-1">
                          <Users className="h-4 w-4 mr-1 text-gray-400" />
                          <p className="font-medium">{startup.employeeCount}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4 mt-6">
                      <Button variant="outline" className="flex items-center">
                        <Globe className="h-4 w-4 mr-1" />
                        <a 
                          href={startup.websiteUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center"
                        >
                          Website
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </Button>
                      <Button variant="outline" className="flex items-center">
                        <Mail className="h-4 w-4 mr-1" />
                        <a href={`mailto:${startup.email}`}>{startup.email}</a>
                      </Button>
                      <Button variant="outline" className="flex items-center">
                        <Phone className="h-4 w-4 mr-1" />
                        <a href={`tel:${startup.phone}`}>{startup.phone}</a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Milestones</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      {/* Timeline line */}
                      <div className="absolute top-0 bottom-0 left-[19px] w-0.5 bg-gray-200" />
                      
                      {/* Timeline events */}
                      <div className="space-y-5">
                        {startup.milestones.map((milestone, index) => (
                          <div key={index} className="flex items-start relative">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 ${
                              milestone.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                            }`}>
                              {milestone.completed ? (
                                <CheckCircle className="h-5 w-5" />
                              ) : (
                                <Clock className="h-5 w-5" />
                              )}
                            </div>
                            <div className="ml-4">
                              <h4 className="font-medium">{milestone.title}</h4>
                              <p className="text-sm text-gray-500">{milestone.date}</p>
                            </div>
                            <div className={`absolute right-0 top-2 px-2 py-0.5 rounded text-xs font-medium ${
                              milestone.completed ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                            }`}>
                              {milestone.completed ? 'Completed' : 'Upcoming'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Verification Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span className="font-medium">{startup.verificationProgress}%</span>
                        </div>
                        <Progress value={startup.verificationProgress} className="h-2" />
                      </div>
                      
                      <div className="space-y-3 mt-4">
                        {startup.verificationSteps.map((step, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className={`w-5 h-5 rounded-full mr-2 flex items-center justify-center ${
                                step.status === 'completed' ? 'bg-green-100 text-green-600' : 
                                step.status === 'in-progress' ? 'bg-yellow-100 text-yellow-600' :
                                'bg-gray-100 text-gray-400'
                              }`}>
                                {step.status === 'completed' ? (
                                  <CheckCircle className="h-3 w-3" />
                                ) : (
                                  <div className="w-2 h-2 rounded-full bg-current" />
                                )}
                              </div>
                              <span className="text-sm">{step.name}</span>
                            </div>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              step.status === 'completed' ? 'bg-green-100 text-green-600' : 
                              step.status === 'in-progress' ? 'bg-yellow-100 text-yellow-600' :
                              'bg-gray-100 text-gray-500'
                            }`}>
                              {step.status.charAt(0).toUpperCase() + step.status.slice(1)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Funding</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Total Raised</p>
                      <p className="text-xl font-bold">{startup.funding.raised}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Funding Rounds</p>
                      <div className="space-y-3 mt-2">
                        {startup.funding.rounds.map((round, index) => (
                          <div key={index} className="border-l-2 border-green-500 pl-3 py-1">
                            <div className="flex justify-between">
                              <h4 className="font-medium">{round.type}</h4>
                              <span className="font-medium">{round.amount}</span>
                            </div>
                            <p className="text-xs text-gray-500">{round.date}</p>
                            <p className="text-xs mt-1">{round.investors.join(", ")}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Currently Seeking</p>
                      <p className="font-medium">{startup.funding.seeking}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Founders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {startup.founders.map((founder, index) => (
                    <div key={index} className="flex bg-gray-50 rounded-lg overflow-hidden">
                      <div className="w-24 h-24 relative">
                        <Image
                          src={founder.image}
                          alt={founder.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-lg">{founder.name}</h3>
                        <p className="text-sm text-gray-600">{founder.role}</p>
                        <p className="mt-2 text-sm">{founder.bio}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {startup.team.map((member, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-3">
                        <User2 className="h-6 w-6 text-gray-500" />
                      </div>
                      <h4 className="font-medium">{member.name}</h4>
                      <p className="text-sm text-gray-600">{member.role}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Traction Tab */}
          <TabsContent value="traction" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium text-gray-500">Customers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold">{startup.traction.customers}</span>
                    <Badge className="ml-2 bg-green-100 text-green-800">Active</Badge>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium text-gray-500">Monthly Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold">{startup.traction.revenue}</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium text-gray-500">Growth Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <span className="text-3xl font-bold">{startup.traction.growth}</span>
                    <TrendingUp className="ml-2 h-5 w-5 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Key Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {startup.traction.metrics.map((metric, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">{metric.label}</span>
                        <span>{metric.value}%</span>
                      </div>
                      <Progress value={metric.value} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Market Position</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-48 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="h-16 w-16 text-gray-300 mx-auto" />
                    <p className="mt-2 text-gray-500">Market position chart placeholder</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {startup.products.map((product, index) => (
                <Card key={index} className="overflow-hidden">
                  <div className="h-48 relative">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                    <Badge 
                      className={`absolute top-2 right-2 ${
                        product.status === 'Launched' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {product.status}
                    </Badge>
                  </div>
                  <CardHeader>
                    <CardTitle>{product.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{product.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Business Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {startup.documents.map((doc, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{doc.name}</h4>
                          <p className="text-xs text-gray-500">{doc.type} • {doc.size} • {doc.date}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Certificates & Awards</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-32 bg-gray-50 rounded-lg border-2 border-dashed">
                  <div className="text-center">
                    <Award className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No certificates or awards yet</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
