"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Building, 
  Calendar, 
  Globe, 
  MapPin, 
  Users, 
  Award, 
  ArrowLeft,
  Phone,
  Mail,
  ExternalLink,
  Edit,
  Download,
  Share2,
  Check,
  Loader2,
  Clock
} from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { getEcosystemBuilderById, setEcosystemBuilderCertified } from "../ecosystem-actions";
import StartupsList from './components/startups-list';
import ProgramsSection from './components/programs-section';
import CertificateSection from './components/certificate-section';
import ResourcesSection from './components/resources-section';

export default function EcosystemBuilderPage() {
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [currentBuilder, setCurrentBuilder] = useState<any | null>(null);
  const [certLoading, setCertLoading] = useState(false);
  
  // State for active tab
  const [activeTab, setActiveTab] = useState("overview");

  const fetchBuilder = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await getEcosystemBuilderById(id);
      if (!res.success) {
        toast.error(res.message || "Ecosystem builder not found");
        setCurrentBuilder(null);
        return;
      }
      setCurrentBuilder(res.data as any);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuilder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 bg-gray-50">
        <div className="inline-flex items-center text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </div>
      </div>
    );
  }

  if (!currentBuilder) {
    return <div className="p-6">Ecosystem builder not found</div>;
  }

  return (
    <div className="p-6 bg-gray-50">
      {/* Header with back button */}
      <div className="mb-4">
        <Link href="/admins-new/ecosystem">
          <Button variant="ghost" size="sm" className="mb-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Ecosystem Builders
          </Button>
        </Link>
      </div>
      
      {/* Ecosystem builder header card */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Logo and basic info */}
            <div className="flex items-start">
              <Avatar className="h-20 w-20 mr-4">
                <AvatarFallback className="bg-primary/10 text-primary text-xl font-medium">
                  {currentBuilder.name.substring(0, 2)}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">{currentBuilder.name}</h1>
                  {currentBuilder.certified && (
                    <Badge variant="success" className="ml-2">
                      <Check className="mr-1 h-3 w-3" />
                      Certified Builder
                    </Badge>
                  )}
                  {currentBuilder.workflowStatus !== "CERTIFIED" && (
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-300">
                      Application: {currentBuilder.workflowStatus.replace(/_/g, " ")}
                    </Badge>
                  )}
                </div>
                <div className="text-muted-foreground">{currentBuilder.type}</div>
                
                {/* Contact details */}
                <div className="mt-3 space-y-1.5 text-sm">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                    {currentBuilder.location}
                  </div>
                  <div className="flex items-center">
                    <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                    <a href={`https://${currentBuilder.website}`} target="_blank" className="text-primary hover:underline">
                      {currentBuilder.website}
                    </a>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    Established in {currentBuilder.established}
                  </div>
                  {currentBuilder.capacity && (
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                      Capacity: {currentBuilder.capacity} startups
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex gap-2 md:ml-auto">
              {currentBuilder.workflowStatus === 'COMMITTEE_REVIEW_SUBMITTED' ? (
                <Button
                  onClick={async () => {
                    setCertLoading(true);
                    try {
                      const res = await setEcosystemBuilderCertified(currentBuilder.id, true);
                      if (!res.success) {
                        toast.error(res.message || "Failed to issue certificate");
                        return;
                      }
                      toast.success("Certificate issued successfully");
                      await fetchBuilder();
                    } finally {
                      setCertLoading(false);
                    }
                  }}
                  disabled={certLoading}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold"
                >
                  {certLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Award className="mr-2 h-4 w-4" />}
                  Issue Certificate
                </Button>
              ) : currentBuilder.certified ? (
                <Link href={`/admins-new/certifications?search=${currentBuilder.name}`} passHref>
                  <Button className="bg-green-600 hover:bg-green-700 text-white font-bold">
                    <Award className="mr-2 h-4 w-4" />
                    View Certificate
                  </Button>
                </Link>
              ) : (
                <Badge variant="warning" className="flex items-center gap-1 py-1.5 px-3">
                  <Clock className="h-4 w-4" />
                  Committee Review Pending
                </Badge>
              )}
              
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Main content tabs */}
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="startups">Supported Startups</TabsTrigger>
          <TabsTrigger value="programs">Programs</TabsTrigger>
          <TabsTrigger value="certification">Certification</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Description and Services */}
          <Card>
            <CardHeader>
              <CardTitle>About {currentBuilder.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {currentBuilder.description || `${currentBuilder.name} is a leading ${currentBuilder.type.toLowerCase()} in ${currentBuilder.location}, established in ${currentBuilder.established}. They provide various services to support startups in the Ethiopian ecosystem.`}
              </p>
              
              <h3 className="font-medium mt-6 mb-3">Services Offered</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentBuilder.services.map(service => (
                  <div key={service} className="flex items-center">
                    <Check className="h-4 w-4 text-green-600 mr-2" />
                    <span>{service}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Startups Supported</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">42</div>
                <p className="text-xs text-muted-foreground">+8% from last year</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">68%</div>
                <p className="text-xs text-muted-foreground">Based on sustainability after 2 years</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Jobs Created</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,240</div>
                <p className="text-xs text-muted-foreground">Through supported startups</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Funding Facilitated</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$2.8M</div>
                <p className="text-xs text-muted-foreground">Investment into startups</p>
              </CardContent>
            </Card>
          </div>
          
          {/* Industry Focus */}
          <Card>
            <CardHeader>
              <CardTitle>Industry Focus</CardTitle>
              <CardDescription>Sectors where this ecosystem builder specializes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Agritech</span>
                    <span>35%</span>
                  </div>
                  <Progress value={35} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Fintech</span>
                    <span>25%</span>
                  </div>
                  <Progress value={25} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Healthcare</span>
                    <span>20%</span>
                  </div>
                  <Progress value={20} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Edutech</span>
                    <span>15%</span>
                  </div>
                  <Progress value={15} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Other</span>
                    <span>5%</span>
                  </div>
                  <Progress value={5} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Supported Startups Tab */}
        <TabsContent value="startups">
          <StartupsList builderId={currentBuilder.id} />
        </TabsContent>
        
        {/* Programs Tab */}
        <TabsContent value="programs">
          <ProgramsSection builderId={currentBuilder.id} />
        </TabsContent>
        
        {/* Certification Tab */}
        <TabsContent value="certification">
          <CertificateSection builder={currentBuilder} />
        </TabsContent>
        
        {/* Resources Tab */}
        <TabsContent value="resources">
          <ResourcesSection builderId={currentBuilder.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
