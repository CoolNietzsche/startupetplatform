"use client";

import React, { useState } from 'react';
import { 
  Search, 
  Plus
} from 'lucide-react';

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import WorkflowDiagram from './components/workflow-diagram';
import NewApplications from './components/new-applications';
import DocumentationReview from './components/documentation-review';
import SiteAssessment from './components/site-assessment';
import ServiceEvaluation from './components/service-evaluation';
import FinalReview from './components/final-review';

// Import the ecosystem builder data
import { ECOSYSTEM_BUILDERS } from '../data';

// Define interfaces for application structure
interface Document {
  id: string;
  name: string;
  status: 'pending' | 'verified' | 'rejected';
}

interface Assessment {
  score: number;
  notes: string;
}

interface Assessments {
  infrastructure: Assessment;
  services: Assessment;
  impact: Assessment;
  sustainability: Assessment;
}

interface Application {
  id: string;
  name: string;
  type: string;
  location: string;
  submittedDate: string;
  status: 'pending' | 'certified' | 'rejected';
  notes: string;
  documents: Document[];
  assessments: Assessments;
}

interface ApplicationsByStage {
  new: Application[];
  documentation: Application[];
  site: Application[];
  service: Application[];
  final: Application[];
  [key: string]: Application[];
}

// Define the workflow stages
const WORKFLOW_STAGES = [
  { id: 'new', name: 'New Applications', description: 'Recently submitted applications' },
  { id: 'documentation', name: 'Documentation Review', description: 'Verify required documents' },
  { id: 'site', name: 'Site Assessment', description: 'Physical infrastructure evaluation' },
  { id: 'service', name: 'Service Evaluation', description: 'Quality of services offered' },
  { id: 'final', name: 'Final Review', description: 'Certification decision' },
];

// Define application types
const APPLICATION_TYPES: Record<string, string> = {
  "Co-working Space": "co-working",
  "Accelerator": "accelerator",
  "Incubator": "incubator",
  "Tech Park": "techpark",
  "Innovation Hub": "innovation",
  "Venture Capital": "vc",
  "Angel Investor": "angel",
  "Training Provider": "training",
  "Entrepreneurship Center": "center"
};

// Define initial applications for each stage based on the ecosystem builders data
const getInitialApplications = (): ApplicationsByStage => {
  const initial: ApplicationsByStage = {
    new: [],
    documentation: [],
    site: [],
    service: [],
    final: []
  };

  // Convert ecosystem builders to applications and distribute them across stages
  ECOSYSTEM_BUILDERS.forEach((builder, index) => {
    const application: Application = {
      id: builder.id,
      name: builder.name,
      type: builder.type,
      location: builder.location,
      submittedDate: new Date(2025, 3, 15 - (index % 10)).toISOString(),
      status: builder.certified ? 'certified' : 'pending',
      notes: '',
      documents: [
        { id: 'doc1', name: 'Registration Certificate', status: 'verified' },
        { id: 'doc2', name: 'Business License', status: 'pending' },
        { id: 'doc3', name: 'Financial Statements', status: 'pending' },
        { id: 'doc4', name: 'Service Catalog', status: 'pending' }
      ],
      assessments: {
        infrastructure: { score: 0, notes: '' },
        services: { score: 0, notes: '' },
        impact: { score: 0, notes: '' },
        sustainability: { score: 0, notes: '' }
      }
    };

    // Distribute applications across different stages for the demo
    if (index % 10 < 4) {
      initial.new.push(application);
    } else if (index % 10 < 6) {
      initial.documentation.push(application);
    } else if (index % 10 < 8) {
      initial.site.push(application);
    } else if (index % 10 < 9) {
      initial.service.push(application);
    } else {
      initial.final.push(application);
    }
  });

  return initial;
};

export default function EcosystemCertificationWorkflow() {
  // State for the active stage tab
  const [activeStage, setActiveStage] = useState<string>('new');
  
  // State for applications in each stage
  const [applications, setApplications] = useState<ApplicationsByStage>(getInitialApplications());
  
  // State for search and filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  
  // State for adding new application dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newApplication, setNewApplication] = useState<Application>({
    id: '',
    name: '',
    type: '',
    location: '',
    submittedDate: '',
    status: 'pending',
    notes: '',
    documents: [],
    assessments: {
      infrastructure: { score: 0, notes: '' },
      services: { score: 0, notes: '' },
      impact: { score: 0, notes: '' },
      sustainability: { score: 0, notes: '' }
    }
  });

  // Function to handle moving an application to the next stage
  const handleMoveApplication = (applicationId: string) => {
    const currentStageIndex = WORKFLOW_STAGES.findIndex(stage => stage.id === activeStage);
    if (currentStageIndex < WORKFLOW_STAGES.length - 1) {
      const nextStageId = WORKFLOW_STAGES[currentStageIndex + 1].id;
      
      setApplications(prev => {
        // Find the application in the current stage
        const application = prev[activeStage].find(app => app.id === applicationId);
        if (!application) return prev;
        
        // Create new state with application moved to next stage
        return {
          ...prev,
          [activeStage]: prev[activeStage].filter(app => app.id !== applicationId),
          [nextStageId]: [...prev[nextStageId], application]
        };
      });
    }
  };
  
  // Function to approve an application (certify)
  const handleApproveApplication = (applicationId: string) => {
    setApplications(prev => {
      const stageId = 'final';
      const updatedApplications = [...prev[stageId]];
      const appIndex = updatedApplications.findIndex(app => app.id === applicationId);
      
      if (appIndex !== -1) {
        updatedApplications[appIndex] = {
          ...updatedApplications[appIndex],
          status: 'certified'
        };
      }
      
      return {
        ...prev,
        [stageId]: updatedApplications
      };
    });
  };
  
  // Function to reject an application
  const handleRejectApplication = (applicationId: string) => {
    setApplications(prev => {
      const stageId = 'final';
      const updatedApplications = [...prev[stageId]];
      const appIndex = updatedApplications.findIndex(app => app.id === applicationId);
      
      if (appIndex !== -1) {
        updatedApplications[appIndex] = {
          ...updatedApplications[appIndex],
          status: 'rejected'
        };
      }
      
      return {
        ...prev,
        [stageId]: updatedApplications
      };
    });
  };
  
  // Function to add new application
  const handleAddNewApplication = () => {
    // Generate ID and set submission date
    const newId = `EB-APP-${Math.floor(Math.random() * 10000)}`;
    const newApplicationWithId = {
      ...newApplication,
      id: newId,
      submittedDate: new Date().toISOString(),
      documents: [
        { id: 'doc1', name: 'Registration Certificate', status: 'pending' as 'pending' | 'verified' | 'rejected' },
        { id: 'doc2', name: 'Business License', status: 'pending' as 'pending' | 'verified' | 'rejected' },
        { id: 'doc3', name: 'Financial Statements', status: 'pending' as 'pending' | 'verified' | 'rejected' },
        { id: 'doc4', name: 'Service Catalog', status: 'pending' as 'pending' | 'verified' | 'rejected' }
      ]
    };
    
    setApplications(prev => {
      return {
        ...prev,
        new: [...prev.new, newApplicationWithId]
      };
    });
    
    // Reset form
    setNewApplication({
      id: '',
      name: '',
      type: '',
      location: '',
      submittedDate: '',
      status: 'pending',
      notes: '',
      documents: [],
      assessments: {
        infrastructure: { score: 0, notes: '' },
        services: { score: 0, notes: '' },
        impact: { score: 0, notes: '' },
        sustainability: { score: 0, notes: '' }
      }
    });
    
    setIsDialogOpen(false);
  };
  
  // Function to handle completing documentation review
  const handleCompleteDocumentationReview = (applicationId: string, documentStatuses: any) => {
    setApplications(prev => {
      const stageId = 'documentation';
      const updatedApplications = [...prev[stageId]];
      const appIndex = updatedApplications.findIndex(app => app.id === applicationId);
      
      if (appIndex !== -1) {
        updatedApplications[appIndex] = {
          ...updatedApplications[appIndex],
          documents: documentStatuses
        };
      }
      
      return {
        ...prev,
        [stageId]: updatedApplications
      };
    });
    handleMoveApplication(applicationId);
  };
  
  // Function to handle completing site assessment
  const handleCompleteSiteAssessment = (applicationId: string, assessmentData: any) => {
    setApplications(prev => {
      const stageId = 'site';
      const updatedApplications = [...prev[stageId]];
      const appIndex = updatedApplications.findIndex(app => app.id === applicationId);
      
      if (appIndex !== -1) {
        updatedApplications[appIndex] = {
          ...updatedApplications[appIndex],
          assessments: assessmentData
        };
      }
      
      return {
        ...prev,
        [stageId]: updatedApplications
      };
    });
    handleMoveApplication(applicationId);
  };
  
  // Function to handle completing service evaluation
  const handleCompleteServiceEvaluation = (applicationId: string, evaluationData: any) => {
    setApplications(prev => {
      const stageId = 'service';
      const updatedApplications = [...prev[stageId]];
      const appIndex = updatedApplications.findIndex(app => app.id === applicationId);
      
      if (appIndex !== -1) {
        updatedApplications[appIndex] = {
          ...updatedApplications[appIndex],
          assessments: evaluationData
        };
      }
      
      return {
        ...prev,
        [stageId]: updatedApplications
      };
    });
    handleMoveApplication(applicationId);
  };
  
  // Filter applications based on search query and type filter
  const getFilteredApplications = () => {
    return applications[activeStage].filter(app => {
      const matchesSearch = searchQuery === '' || 
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.location.toLowerCase().includes(searchQuery.toLowerCase());
        
      const matchesType = typeFilter === 'all' || app.type === typeFilter;
      
      return matchesSearch && matchesType;
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ecosystem Builder Certification</h1>
          <p className="text-muted-foreground">Manage certification applications for ecosystem builders</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Application
        </Button>
      </div>
      
      {/* Workflow Diagram */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <WorkflowDiagram stages={WORKFLOW_STAGES} activeStage={activeStage} />
        </CardContent>
      </Card>
      
      {/* Search and Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by name or ID..."
            className="pl-8 bg-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[200px] bg-white">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="co-working">Co-working Space</SelectItem>
            <SelectItem value="accelerator">Accelerator</SelectItem>
            <SelectItem value="incubator">Incubator</SelectItem>
            <SelectItem value="techpark">Tech Park</SelectItem>
            <SelectItem value="innovation">Innovation Hub</SelectItem>
            <SelectItem value="vc">Venture Capital</SelectItem>
            <SelectItem value="angel">Angel Investor</SelectItem>
            <SelectItem value="training">Training Provider</SelectItem>
            <SelectItem value="center">Entrepreneurship Center</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Stage Tabs */}
      <Tabs 
        defaultValue="new" 
        value={activeStage} 
        onValueChange={setActiveStage}
        className="space-y-4"
      >
        <TabsList className="grid grid-cols-5 h-auto">
          {WORKFLOW_STAGES.map(stage => (
            <TabsTrigger 
              key={stage.id} 
              value={stage.id}
              className="py-2 relative"
            >
              {stage.name}
              {applications[stage.id].length > 0 && (
                <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                  {applications[stage.id].length}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {/* New Applications Tab */}
        <TabsContent value="new" className="space-y-4">
          <NewApplications 
            applications={getFilteredApplications()}
            stage="new"
            onMoveApplication={handleMoveApplication}
          />
        </TabsContent>
        
        {/* Documentation Review Tab */}
        <TabsContent value="documentation" className="space-y-4">
          <DocumentationReview 
            applications={getFilteredApplications()}
            stage="documentation"
            onMoveApplication={handleMoveApplication}
            onCompleteReview={(applicationId: string, documentStatuses: any) => {
              handleCompleteDocumentationReview(applicationId, documentStatuses);
            }}
          />
        </TabsContent>
        
        {/* Site Assessment Tab */}
        <TabsContent value="site" className="space-y-4">
          <SiteAssessment 
            applications={getFilteredApplications()}
            stage="site"
            onMoveApplication={handleMoveApplication}
            onCompleteAssessment={(applicationId: string, assessmentData: any) => {
              handleCompleteSiteAssessment(applicationId, assessmentData);
            }}
          />
        </TabsContent>
        
        {/* Service Evaluation Tab */}
        <TabsContent value="service" className="space-y-4">
          <ServiceEvaluation 
            applications={getFilteredApplications()}
            stage="service"
            onMoveApplication={handleMoveApplication}
            onCompleteEvaluation={(applicationId: string, evaluationData: any) => {
              handleCompleteServiceEvaluation(applicationId, evaluationData);
            }}
          />
        </TabsContent>
        
        {/* Final Review Tab */}
        <TabsContent value="final" className="space-y-4">
          <FinalReview 
            applications={getFilteredApplications()}
            stage="final"
            onApprove={handleApproveApplication}
            onReject={handleRejectApplication}
          />
        </TabsContent>
      </Tabs>
      
      {/* Add New Application Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Application</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input 
                type="text" 
                value={newApplication.name} 
                onChange={(e) => setNewApplication(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <Label>Type</Label>
              <Select 
                value={newApplication.type} 
                onValueChange={(value) => setNewApplication(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(APPLICATION_TYPES).map(type => (
                    <SelectItem key={type} value={APPLICATION_TYPES[type]}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Location</Label>
              <Input 
                type="text" 
                value={newApplication.location} 
                onChange={(e) => setNewApplication(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea 
                value={newApplication.notes} 
                onChange={(e) => setNewApplication(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => {
            // Reset form and close dialog
            setNewApplication({
              id: '',
              name: '',
              type: '',
              location: '',
              submittedDate: '',
              status: 'pending',
              notes: '',
              documents: [],
              assessments: {
                infrastructure: { score: 0, notes: '' },
                services: { score: 0, notes: '' },
                impact: { score: 0, notes: '' },
                sustainability: { score: 0, notes: '' }
              }
            });
            setIsDialogOpen(false);
          }}>Cancel</Button>
          <Button onClick={handleAddNewApplication}>Add Application</Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
