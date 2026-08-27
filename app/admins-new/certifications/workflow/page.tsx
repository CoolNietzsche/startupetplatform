"use client";

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Award, 
  CheckCircle, 
  Clock, 
  FileText, 
  ClipboardCheck, 
  AlertCircle,
  Plus,
  Search
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

import { StageApplications } from './components/stage-applications';
import { WorkflowDiagram } from './components/workflow-diagram';
import { CertificationRequirements } from './components/certification-requirements';
import { CriteriaEvaluation } from './components/criteria-evaluation';
import { Suspense } from 'react';

// Define types for our application structure
type ApplicationBase = {
  id: string;
  startupName: string;
  startupId: string;
  submissionDate: string;
  applicationType: string;
  sector: string;
  location: string;
  status: string;
  assignedTo: string | null;
  [key: string]: any; // For additional properties in different stages
};

// Define application state type
type ApplicationState = {
  new: ApplicationBase[];
  documentation: ApplicationBase[];
  technical: ApplicationBase[];
  business: ApplicationBase[];
  final: ApplicationBase[];
  completed: ApplicationBase[];
  [key: string]: ApplicationBase[]; // Index signature for string access
};

// Define workflow stage
type WorkflowStage = {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  count: number;
};

// Mock data for applications at different stages
const INITIAL_APPLICATIONS: ApplicationState = {
  new: [
    {
      id: "APP-2025-423",
      startupName: "Tech Addis",
      startupId: "ST-2025-0701",
      submissionDate: "2025-04-28",
      applicationType: "Level 1 Certification",
      sector: "Information & Technology",
      location: "Addis Ababa",
      status: "New",
      assignedTo: null
    },
    {
      id: "APP-2025-419",
      startupName: "Lalibela Drone Delivery",
      startupId: "ST-2025-0698",
      submissionDate: "2025-04-26",
      applicationType: "Level 1 Certification",
      sector: "Logistics",
      location: "Lalibela",
      status: "New",
      assignedTo: null
    },
    {
      id: "APP-2025-416",
      startupName: "Habesha Finance",
      startupId: "ST-2025-0695",
      submissionDate: "2025-04-25",
      applicationType: "Level 1 Certification",
      sector: "Fintech",
      location: "Addis Ababa",
      status: "New",
      assignedTo: null
    }
  ],
  documentation: [
    {
      id: "APP-2025-413",
      startupName: "Teff Connect",
      startupId: "ST-2025-0692",
      submissionDate: "2025-04-22",
      applicationType: "Level 1 Certification",
      sector: "Agriculture",
      location: "Bahir Dar",
      status: "Documentation Review",
      assignedTo: "Kebede Alemu",
      documentsRequired: 6,
      documentsSubmitted: 4,
      documentsVerified: 2
    },
    {
      id: "APP-2025-410",
      startupName: "Abyssinia Fintech",
      startupId: "ST-2025-0689",
      submissionDate: "2025-04-20",
      applicationType: "Level 2 Certification",
      sector: "Fintech",
      location: "Addis Ababa",
      status: "Documentation Review",
      assignedTo: "Tigist Haile",
      documentsRequired: 8,
      documentsSubmitted: 7,
      documentsVerified: 5
    }
  ],
  technical: [
    {
      id: "APP-2025-405",
      startupName: "Africom",
      startupId: "ST-2025-0798",
      submissionDate: "2025-04-15",
      applicationType: "Level 1 Certification",
      sector: "Communication",
      location: "Addis Ababa",
      status: "Technical Assessment",
      assignedTo: "Dawit Mengistu",
      technicalCriteriaMet: 3,
      technicalCriteriaTotal: 5,
      technicalScore: 68
    }
  ],
  business: [
    {
      id: "APP-2025-402",
      startupName: "Green Hub Ethiopia",
      startupId: "ST-2025-0684",
      submissionDate: "2025-04-12",
      applicationType: "Level 1 Certification",
      sector: "CleanTech",
      location: "Hawassa",
      status: "Business Assessment",
      assignedTo: "Yared Getachew",
      businessCriteriaMet: 7,
      businessCriteriaTotal: 8,
      businessScore: 82
    }
  ],
  final: [
    {
      id: "APP-2025-399",
      startupName: "Axum Analytics",
      startupId: "ST-2025-0681",
      submissionDate: "2025-04-08",
      applicationType: "Level 1 Certification",
      sector: "Information & Technology",
      location: "Mekelle",
      status: "Final Review",
      assignedTo: "Kidist Abebe",
      technicalScore: 85,
      businessScore: 78,
      recommendedAction: "Approve"
    }
  ],
  completed: [
    {
      id: "APP-2025-395",
      startupName: "Addis Payments",
      startupId: "ST-2025-0678",
      submissionDate: "2025-04-03",
      applicationType: "Level 1 Certification",
      sector: "Fintech",
      location: "Addis Ababa",
      status: "Approved",
      assignedTo: "Kebede Alemu",
      technicalScore: 92,
      businessScore: 88,
      completionDate: "2025-04-29",
      certificateId: "CERT-2025-2243"
    },
    {
      id: "APP-2025-388",
      startupName: "Ethio Cloud",
      startupId: "ST-2025-0671",
      submissionDate: "2025-03-28",
      applicationType: "Level 2 Certification",
      sector: "Information & Technology",
      location: "Addis Ababa",
      status: "Rejected",
      assignedTo: "Tigist Haile",
      technicalScore: 65,
      businessScore: 58,
      completionDate: "2025-04-25",
      rejectionReason: "Failed to meet minimum technical requirements"
    }
  ]
};

function CertificationWorkflowContent() {
  const [currentStage, setCurrentStage] = useState<string>('new');
  const [searchQuery, setSearchQuery] = useState('');
  const [applications, setApplications] = useState<ApplicationState>(INITIAL_APPLICATIONS);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showAddApplicationModal, setShowAddApplicationModal] = useState<boolean>(false);
  const [wizardApplications, setWizardApplications] = useState<ApplicationBase[]>([]);

  useEffect(() => {
    const fetchWizardApplications = async () => {
      const responses: ApplicationBase[] = [
        {
          id: "APP-2025-500",
          startupName: "Demo Startup",
          startupId: "ST-2025-0800",
          submissionDate: "2025-05-02",
          applicationType: "Level 2 Certification",
          sector: "EdTech",
          location: "Dire Dawa",
          status: "New",
          assignedTo: null,
        }
      ];
      setWizardApplications(responses);
    };
    fetchWizardApplications();
  }, []);

  const getApplicationsForStage = (stage: string) => {
    if (stage === 'new') {
      const ids = new Set(INITIAL_APPLICATIONS.new.map(app => app.id));
      return [...wizardApplications.filter(app => !ids.has(app.id)), ...applications[stage]];
    }
    return applications[stage];
  };

  // Function to move application from one stage to the next
  const moveApplication = (applicationId: string, fromStage: string, toStage: string) => {
    // Find the application in the fromStage
    const applicationIndex = applications[fromStage].findIndex(app => app.id === applicationId);
    if (applicationIndex === -1) return;
    
    // Get the application and update its status
    const application = {...applications[fromStage][applicationIndex]};
    
    // Update status based on the toStage
    switch(toStage) {
      case 'documentation':
        application.status = 'Documentation Review';
        application.assignedTo = 'Kebede Alemu'; // Mock assignment
        application.documentsRequired = 6;
        application.documentsSubmitted = 2;
        application.documentsVerified = 0;
        break;
      case 'technical':
        application.status = 'Technical Assessment';
        application.assignedTo = 'Dawit Mengistu'; // Mock assignment
        application.technicalCriteriaMet = 0;
        application.technicalCriteriaTotal = 5;
        application.technicalScore = 0;
        break;
      case 'business':
        application.status = 'Business Assessment';
        application.assignedTo = 'Yared Getachew'; // Mock assignment
        application.businessCriteriaMet = 0;
        application.businessCriteriaTotal = 6;
        application.businessScore = 0;
        break;
      case 'final':
        application.status = 'Final Review';
        application.assignedTo = 'Kidist Abebe'; // Mock assignment
        application.recommendedAction = 'Pending';
        break;
      case 'completed':
        if (application.recommendedAction === 'Approve') {
          application.status = 'Approved';
          application.completionDate = new Date().toISOString().split('T')[0];
          application.certificateId = `CERT-${Math.floor(10000 + Math.random() * 90000)}`;
        } else {
          application.status = 'Rejected';
          application.completionDate = new Date().toISOString().split('T')[0];
          application.rejectionReason = 'Failed to meet certification requirements';
        }
        break;
    }
    
    // Create new arrays for the stages
    const updatedFromStage = [
      ...applications[fromStage].slice(0, applicationIndex),
      ...applications[fromStage].slice(applicationIndex + 1)
    ];
    
    const updatedToStage = [...applications[toStage], application];
    
    // Update state
    setApplications({
      ...applications,
      [fromStage]: updatedFromStage,
      [toStage]: updatedToStage
    });
  };
  
  // Move application to next stage
  const handleMoveApplication = (applicationId: string) => {
    // Find current stage
    const currentStage = Object.keys(applications).find(stage =>
      applications[stage].some(app => app.id === applicationId)
    );
    if (!currentStage) return;

    // Determine next stage
    const stageOrder = ['new', 'documentation', 'technical', 'business', 'final', 'completed'];
    const nextStage = stageOrder[stageOrder.indexOf(currentStage) + 1];
    if (!nextStage) return;

    moveApplication(applicationId, currentStage, nextStage);
  };

  // Approve application (move to completed with Approved status)
  const handleApprove = (applicationId: string) => {
    const currentStage = Object.keys(applications).find(stage =>
      applications[stage].some(app => app.id === applicationId)
    );
    if (!currentStage) return;
    // Set recommended action to approve before moving
    const applicationIndex = applications[currentStage].findIndex(app => app.id === applicationId);
    if (applicationIndex === -1) return;
    const updatedApplications = [...applications[currentStage]];
    updatedApplications[applicationIndex] = {
      ...updatedApplications[applicationIndex],
      recommendedAction: 'Approve',
      status: 'Approved',
      completionDate: new Date().toISOString().split('T')[0]
    };
    setApplications({
      ...applications,
      [currentStage]: updatedApplications
    });
    moveApplication(applicationId, currentStage, 'completed');
  };

  // Reject application (move to completed with Rejected status)
  const handleReject = (applicationId: string) => {
    const currentStage = Object.keys(applications).find(stage =>
      applications[stage].some(app => app.id === applicationId)
    );
    if (!currentStage) return;
    // Set recommended action to reject before moving
    const applicationIndex = applications[currentStage].findIndex(app => app.id === applicationId);
    if (applicationIndex === -1) return;
    const updatedApplications = [...applications[currentStage]];
    updatedApplications[applicationIndex] = {
      ...updatedApplications[applicationIndex],
      recommendedAction: 'Reject',
      status: 'Rejected',
      completionDate: new Date().toISOString().split('T')[0]
    };
    setApplications({
      ...applications,
      [currentStage]: updatedApplications
    });
    moveApplication(applicationId, currentStage, 'completed');
  };

  // Count applications for each stage
  const stageCounts = {
    new: applications.new.length,
    documentation: applications.documentation.length,
    technical: applications.technical.length,
    business: applications.business.length,
    final: applications.final.length,
    completed: applications.completed.length
  };
  
  // Workflow stages with dynamic counts
  const workflowStages: WorkflowStage[] = [
    {
      id: "new",
      name: "New Applications",
      description: "Applications awaiting initial screening",
      icon: <FileText className="h-5 w-5" />,
      count: stageCounts.new
    },
    {
      id: "documentation",
      name: "Documentation Review",
      description: "Verifying required documents",
      icon: <ClipboardCheck className="h-5 w-5" />,
      count: stageCounts.documentation
    },
    {
      id: "technical",
      name: "Technical Assessment",
      description: "Evaluating technical criteria",
      icon: <AlertCircle className="h-5 w-5" />,
      count: stageCounts.technical
    },
    {
      id: "business",
      name: "Business Assessment",
      description: "Evaluating business criteria",
      icon: <Clock className="h-5 w-5" />,
      count: stageCounts.business
    },
    {
      id: "final",
      name: "Final Review",
      description: "Making certification decisions",
      icon: <Award className="h-5 w-5" />,
      count: stageCounts.final
    },
    {
      id: "completed",
      name: "Completed",
      description: "Approved or rejected applications",
      icon: <CheckCircle className="h-5 w-5" />,
      count: stageCounts.completed
    }
  ];

  // Filter applications based on search query and type filter
  const filteredApplications = getApplicationsForStage(currentStage)
    .filter(app => {
      // Filter by search query
      const matchesSearch = app.startupName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.sector.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filter by certification type
      const matchesType = typeFilter === 'all' || 
        (typeFilter === 'level1' && app.applicationType.includes('Level 1')) ||
        (typeFilter === 'level2' && app.applicationType.includes('Level 2')) ||
        (typeFilter === 'level3' && app.applicationType.includes('Level 3'));
      
      return matchesSearch && matchesType;
    });

  // Add new application function
  const addNewApplication = () => {
    const newApplication: ApplicationBase = {
      id: `APP-2025-${Math.floor(500 + Math.random() * 500)}`,
      startupName: "New Startup", // In a real app, this would come from a form
      startupId: `ST-2025-${Math.floor(1000 + Math.random() * 1000)}`,
      submissionDate: new Date().toISOString().split('T')[0],
      applicationType: "Level 1 Certification",
      sector: "Information & Technology",
      location: "Addis Ababa",
      status: "New",
      assignedTo: null
    };
    
    setApplications({
      ...applications,
      new: [...applications.new, newApplication]
    });
    
    setShowAddApplicationModal(false);
  };
  
  return (
    <div className="p-6 bg-gray-50">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Button variant="outline" size="icon" asChild className="mr-4">
          <Link href="/admins-new/certifications">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Certification Workflow</h1>
          <p className="text-muted-foreground">
            Manage startup certification applications through the standardized workflow
          </p>
        </div>
        
        <div className="ml-auto flex gap-2">
          <Button onClick={() => setShowAddApplicationModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Application
          </Button>
        </div>
      </div>
      
      {/* Workflow Overview */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>Certification Process Workflow</CardTitle>
          <CardDescription>
            All startup applications follow this standardized certification process
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WorkflowDiagram stages={workflowStages} currentStage={currentStage} />
        </CardContent>
      </Card>
      
      {/* Main Content */}
      <div className="grid grid-cols-4 gap-6">
        {/* Sidebar - Workflow Stages */}
        <div className="col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Workflow Stages</CardTitle>
            </CardHeader>
            <CardContent className="px-2 pb-2">
              <div className="space-y-1">
                {workflowStages.map((stage) => (
                  <Button
                    key={stage.id}
                    variant={currentStage === stage.id ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setCurrentStage(stage.id)}
                  >
                    <div className="flex items-center w-full">
                      <div className="mr-2">{stage.icon}</div>
                      <div className="flex-1 text-left">{stage.name}</div>
                      <Badge variant="outline" className="ml-auto">
                        {stage.count}
                      </Badge>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Requirements based on certification level */}
          <div className="mt-6">
            <CertificationRequirements />
          </div>
        </div>
        
        {/* Main content - Applications in current stage */}
        <div className="col-span-3 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle>{workflowStages.find(s => s.id === currentStage)?.name}</CardTitle>
                
                <div className="flex space-x-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search applications..."
                      className="w-full md:w-[200px] pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <Select 
                    value={typeFilter}
                    onValueChange={(value) => setTypeFilter(value)}
                  >
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Applications</SelectItem>
                      <SelectItem value="level1">Level 1 Certification</SelectItem>
                      <SelectItem value="level2">Level 2 Certification</SelectItem>
                      <SelectItem value="level3">Level 3 Certification</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <StageApplications 
                applications={filteredApplications} 
                stage={currentStage}
                onMoveApplication={handleMoveApplication}
                onApprove={handleApprove}
                onReject={handleReject}
              />
              
              {filteredApplications.length === 0 && (
                <div className="text-center py-8 px-4">
                  <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                    <ClipboardCheck className="h-6 w-6 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium mb-1">No Applications</h3>
                  <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
                    There are currently no applications in this stage of the certification workflow.
                  </p>
                  {currentStage === 'new' && (
                    <Button onClick={() => setShowAddApplicationModal(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add New Application
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          
          {currentStage === 'technical' || currentStage === 'business' ? (
            <CriteriaEvaluation stage={currentStage} />
          ) : null}
        </div>
      </div>
      
      {/* Add Application Modal */}
      {showAddApplicationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Add New Application</h3>
            
            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-6">
                This will create a new application in the certification workflow. 
                In a production system, this would include a full form to collect 
                startup details.
              </p>
              
              <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4">
                <p className="text-sm text-amber-800">
                  For this demo, we&apos;ll create a sample application with placeholder data.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setShowAddApplicationModal(false)}
              >
                Cancel
              </Button>
              <Button onClick={addNewApplication}>
                Create Application
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CertificationWorkflowPage() {
  return (
    <Suspense fallback={<div>Loading workflow...</div>}>
      <CertificationWorkflowContent />
    </Suspense>
  );
}
