import React, { useState } from 'react';
import { 
  CheckCircle, 
  X, 
  Plus,
  Award, 
  Save,
  Edit
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function CertificationRequirements({ viewOnly = false }: { viewOnly?: boolean }) {
  const [activeLevel, setActiveLevel] = useState<string>('level1');
  const [editMode, setEditMode] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Requirements data for each level
  const [requirements, setRequirements] = useState({
    level1: [
      {
        id: 'business_registration',
        name: 'Business Registration',
        description: 'Must have valid business registration certificate',
        required: true
      },
      {
        id: 'min_team_size',
        name: 'Minimum Team Size',
        description: 'At least 2 full-time team members',
        required: true
      },
      {
        id: 'functional_mvp',
        name: 'Functional MVP',
        description: 'Must have a working minimum viable product',
        required: true
      },
      {
        id: 'business_plan',
        name: 'Business Plan',
        description: 'Must have a documented business plan',
        required: true
      },
      {
        id: 'local_impact',
        name: 'Local Impact',
        description: 'Demonstrable local economic or social impact',
        required: true
      }
    ],
    level2: [
      {
        id: 'business_age',
        name: 'Business Age',
        description: 'In operation for at least 1 year',
        required: true
      },
      {
        id: 'revenue',
        name: 'Revenue Generation',
        description: 'Must have generated at least $10,000 in revenue',
        required: true
      },
      {
        id: 'jobs_created',
        name: 'Job Creation',
        description: 'Must have created at least 5 jobs',
        required: true
      },
      {
        id: 'tech_innovation',
        name: 'Technical Innovation',
        description: 'Demonstrable technical innovation in product/service',
        required: true
      },
      {
        id: 'security_compliance',
        name: 'Security Compliance',
        description: 'Meets basic security compliance standards',
        required: true
      },
      {
        id: 'user_base',
        name: 'User Base',
        description: 'At least 1,000 active users/customers',
        required: true
      }
    ],
    level3: [
      {
        id: 'business_age_advanced',
        name: 'Business Age',
        description: 'In operation for at least 2 years',
        required: true
      },
      {
        id: 'revenue_advanced',
        name: 'Revenue Generation',
        description: 'Must have generated at least $100,000 in revenue',
        required: true
      },
      {
        id: 'jobs_created_advanced',
        name: 'Job Creation',
        description: 'Must have created at least 15 jobs',
        required: true
      },
      {
        id: 'funding',
        name: 'Secured Funding',
        description: 'Raised funding from recognized investors/institutions',
        required: true
      },
      {
        id: 'international_presence',
        name: 'International Presence',
        description: 'Has customers or operations outside Ethiopia',
        required: true
      },
      {
        id: 'innovation_awards',
        name: 'Innovation Recognition',
        description: 'Received industry awards or recognition',
        required: false
      },
      {
        id: 'social_impact',
        name: 'Social Impact',
        description: 'Significant measurable social or environmental impact',
        required: false
      }
    ]
  });
  
  const [editedRequirements, setEditedRequirements] = useState({...requirements});
  
  const handleEditToggle = () => {
    if (viewOnly) return;
    if (editMode) {
      // Save changes
      setRequirements(editedRequirements);
      setSuccessMessage("Requirements updated successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    }
    setEditMode(!editMode);
  };
  
  const handleRequirementChange = (levelId: string, requirementId: string, field: string, value: any) => {
    if (viewOnly) return;
    setEditedRequirements(prev => ({
      ...prev,
      [levelId]: prev[levelId as keyof typeof prev].map(req => 
        req.id === requirementId ? { ...req, [field]: value } : req
      )
    }));
  };
  
  const handleDeleteRequirement = (levelId: string, requirementId: string) => {
    if (viewOnly) return;
    setEditedRequirements(prev => ({
      ...prev,
      [levelId]: prev[levelId as keyof typeof prev].filter(req => req.id !== requirementId)
    }));
  };
  
  const handleAddRequirement = (levelId: string) => {
    if (viewOnly) return;
    const newId = `new_requirement_${Math.floor(Math.random() * 1000)}`;
    setEditedRequirements(prev => ({
      ...prev,
      [levelId]: [
        ...prev[levelId as keyof typeof prev], 
        {
          id: newId,
          name: 'New Requirement',
          description: 'Description of the new requirement',
          required: true
        }
      ]
    }));
  };
  
  const renderRequirements = (levelId: string) => {
    const currentRequirements = editMode 
      ? editedRequirements[levelId as keyof typeof editedRequirements]
      : requirements[levelId as keyof typeof requirements];
      
    return (
      <div className="space-y-4">
        {currentRequirements.map((req) => (
          <div key={req.id} className="border rounded-md p-3 bg-white">
            {editMode ? (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="sr-only" htmlFor={`req-name-${req.id}`}>Requirement name</label>
                  <input 
                    id={`req-name-${req.id}`}
                    className="font-medium w-full border-b outline-none"
                    value={req.name}
                    onChange={(e) => handleRequirementChange(levelId, req.id, 'name', e.target.value)}
                    aria-label="Requirement name"
                  />
                  <button 
                    className="text-red-500 hover:text-red-700"
                    onClick={() => handleDeleteRequirement(levelId, req.id)}
                    aria-label="Delete requirement"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <label className="sr-only" htmlFor={`req-description-${req.id}`}>Requirement description</label>
                <textarea 
                  id={`req-description-${req.id}`}
                  className="w-full text-sm text-gray-600 border rounded p-2 min-h-[60px]"
                  value={req.description}
                  onChange={(e) => handleRequirementChange(levelId, req.id, 'description', e.target.value)}
                  aria-label="Requirement description"
                />
                <div className="flex items-center">
                  <label className="flex items-center space-x-2 text-sm">
                    <input 
                      type="checkbox" 
                      checked={req.required}
                      onChange={(e) => handleRequirementChange(levelId, req.id, 'required', e.target.checked)}
                      className="rounded border-gray-300"
                      aria-label="Required for certification"
                    />
                    <span>Required for certification</span>
                  </label>
                </div>
              </div>
            ) : (
              <>
                <div className="font-medium flex items-center">
                  {req.required && <CheckCircle className="h-4 w-4 text-green-600 mr-1.5 flex-shrink-0" />}
                  {req.name}
                </div>
                <div className="text-sm text-gray-600 mt-1">{req.description}</div>
              </>
            )}
          </div>
        ))}
        
        {!viewOnly && editMode && (
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => handleAddRequirement(levelId)}
            aria-label="Add new requirement"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New Requirement
          </Button>
        )}
      </div>
    );
  };
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Certification Requirements</CardTitle>
            <CardDescription>
              Criteria for startup certification at different levels
            </CardDescription>
          </div>
          
          {!viewOnly && (
            <Button 
              variant={editMode ? "default" : "outline"} 
              size="sm"
              onClick={handleEditToggle}
              aria-label={editMode ? "Save changes" : "Edit requirements"}
            >
              {editMode ? (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              ) : (
                <>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Requirements
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeLevel} onValueChange={setActiveLevel}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="level1">
              <Award className="mr-2 h-4 w-4" />
              Level 1
            </TabsTrigger>
            <TabsTrigger value="level2">
              <Award className="mr-2 h-4 w-4" />
              Level 2
            </TabsTrigger>
            <TabsTrigger value="level3">
              <Award className="mr-2 h-4 w-4" />
              Level 3
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="level1" className="py-2">
            <div className="mb-4">
              <Badge className="mb-2">Basic Certification</Badge>
              <p className="text-sm text-muted-foreground">
                Entry-level certification for early-stage startups demonstrating basic viability and potential.
              </p>
            </div>
            
            {renderRequirements('level1')}
          </TabsContent>
          
          <TabsContent value="level2" className="py-2">
            <div className="mb-4">
              <Badge className="mb-2">Intermediate Certification</Badge>
              <p className="text-sm text-muted-foreground">
                For growing startups with established products and demonstrable market traction.
              </p>
            </div>
            
            {renderRequirements('level2')}
          </TabsContent>
          
          <TabsContent value="level3" className="py-2">
            <div className="mb-4">
              <Badge className="mb-2" variant="outline">Elite Certification</Badge>
              <p className="text-sm text-muted-foreground">
                For mature startups with significant growth, impact, and market leadership.
              </p>
            </div>
            
            {renderRequirements('level3')}
          </TabsContent>
        </Tabs>
      </CardContent>
      
      {!viewOnly && successMessage && (
        <div className="fixed bottom-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-md z-50">
          <span className="flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            {successMessage}
          </span>
        </div>
      )}
    </Card>
  );
}
