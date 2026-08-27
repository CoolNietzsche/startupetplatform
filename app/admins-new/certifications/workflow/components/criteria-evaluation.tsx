import React, { useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  ArrowRight, 
  File,
  Save
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

type CriteriaEvaluationProps = {
  stage: string;
};

// Technical criteria for Level 1 Certification
const TECHNICAL_CRITERIA = [
  {
    id: "mvp",
    name: "Functional Minimum Viable Product",
    description: "The startup has a working product that addresses a defined problem",
    weight: 25,
    required: true
  },
  {
    id: "innovation",
    name: "Technical Innovation",
    description: "The product contains innovative technical solutions or approaches",
    weight: 20,
    required: false
  },
  {
    id: "users",
    name: "User Base",
    description: "The product has a minimum of 100 active users",
    weight: 15,
    required: true
  },
  {
    id: "documentation",
    name: "Technical Documentation",
    description: "The startup has comprehensive technical documentation for their product",
    weight: 20,
    required: true
  },
  {
    id: "security",
    name: "Security Standards Compliance",
    description: "The product implements basic security standards and protections",
    weight: 20,
    required: false
  }
];

// Business criteria for Level 1 Certification
const BUSINESS_CRITERIA = [
  {
    id: "market",
    name: "Clearly Defined Target Market",
    description: "The startup has identified and validated their target market",
    weight: 15,
    required: true
  },
  {
    id: "revenue",
    name: "Revenue Generation",
    description: "The startup has generated revenue (any amount)",
    weight: 15,
    required: false
  },
  {
    id: "team",
    name: "Team Size and Composition",
    description: "The startup has at least 2 full-time team members with relevant skills",
    weight: 15,
    required: true
  },
  {
    id: "business_model",
    name: "Business Model Validation",
    description: "The startup has validated their business model with real customers",
    weight: 20,
    required: true
  },
  {
    id: "local_impact",
    name: "Local Content/Impact",
    description: "The startup contributes positively to the Ethiopian economy or society",
    weight: 20,
    required: true
  },
  {
    id: "growth",
    name: "Growth Potential",
    description: "The startup demonstrates potential for growth and scalability",
    weight: 15,
    required: true
  }
];

export function CriteriaEvaluation({ stage }: CriteriaEvaluationProps) {
  const [evaluationType, setEvaluationType] = useState<string>('scorecard');
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  
  // For technical assessment
  const [technicalScores, setTechnicalScores] = useState<{[key: string]: number}>(
    TECHNICAL_CRITERIA.reduce((acc, criteria) => ({...acc, [criteria.id]: 0}), {})
  );
  
  // For business assessment
  const [businessScores, setBusinessScores] = useState<{[key: string]: number}>(
    BUSINESS_CRITERIA.reduce((acc, criteria) => ({...acc, [criteria.id]: 0}), {})
  );
  
  // For yes/no evaluation
  const [technicalMet, setTechnicalMet] = useState<{[key: string]: string}>(
    TECHNICAL_CRITERIA.reduce((acc, criteria) => ({...acc, [criteria.id]: ""}), {})
  );
  
  const [businessMet, setBusinessMet] = useState<{[key: string]: string}>(
    BUSINESS_CRITERIA.reduce((acc, criteria) => ({...acc, [criteria.id]: ""}), {})
  );
  
  // For notes
  const [notes, setNotes] = useState("");
  
  // Calculate overall score based on weights and scores
  const calculateOverallScore = (scores: {[key: string]: number}, criteria: any[]) => {
    let totalWeightedScore = 0;
    let totalWeight = 0;
    
    criteria.forEach(criterion => {
      totalWeightedScore += (scores[criterion.id] || 0) * criterion.weight;
      totalWeight += criterion.weight;
    });
    
    return totalWeight > 0 ? Math.round(totalWeightedScore / totalWeight) : 0;
  };
  
  // Calculate criteria met count for pass/fail evaluation
  const calculateCriteriaMet = (met: {[key: string]: string}, criteria: any[]) => {
    return criteria.filter(criterion => met[criterion.id] === "yes").length;
  };
  
  // Check if all required criteria are met
  const allRequiredCriteriaMet = (met: {[key: string]: string}, criteria: any[]) => {
    return criteria
      .filter(criterion => criterion.required)
      .every(criterion => met[criterion.id] === "yes");
  };
  
  const technicalScore = calculateOverallScore(technicalScores, TECHNICAL_CRITERIA);
  const businessScore = calculateOverallScore(businessScores, BUSINESS_CRITERIA);
  
  const technicalCriteriaMet = calculateCriteriaMet(technicalMet, TECHNICAL_CRITERIA);
  const businessCriteriaMet = calculateCriteriaMet(businessMet, BUSINESS_CRITERIA);
  
  const technicalRequiredMet = allRequiredCriteriaMet(technicalMet, TECHNICAL_CRITERIA);
  const businessRequiredMet = allRequiredCriteriaMet(businessMet, BUSINESS_CRITERIA);
  
  // The criteria to use based on the current stage
  const currentCriteria = stage === 'technical' ? TECHNICAL_CRITERIA : BUSINESS_CRITERIA;
  const currentScores = stage === 'technical' ? technicalScores : businessScores;
  const setCurrentScores = stage === 'technical' ? setTechnicalScores : setBusinessScores;
  const currentMet = stage === 'technical' ? technicalMet : businessMet;
  const setCurrentMet = stage === 'technical' ? setTechnicalMet : setBusinessMet;
  
  // Update score for a criterion
  const updateScore = (id: string, score: number) => {
    setCurrentScores(prev => ({...prev, [id]: score}));
  };
  
  // Update if a criterion is met
  const updateCriteriaMet = (id: string, value: string) => {
    setCurrentMet(prev => ({...prev, [id]: value}));
  };
  
  const saveAssessment = () => {
    // In a real application, this would save the assessment to a database
    setSaveMessage("Assessment saved successfully!");
    
    // Clear the message after 3 seconds
    setTimeout(() => {
      setSaveMessage(null);
    }, 3000);
  };

  const saveNotes = () => {
    // In a real application, this would save the notes to a database
    setSaveMessage("Notes saved successfully!");
    
    // Clear the message after 3 seconds
    setTimeout(() => {
      setSaveMessage(null);
    }, 3000);
  };
  
  const completeAssessment = () => {
    // Here we would normally trigger a state change to move to the next stage
    // For this demo, we'll just show a success message
    setSaveMessage("Assessment completed and application moved to next stage!");
    
    // Clear the message after 3 seconds
    setTimeout(() => {
      setSaveMessage(null);
    }, 3000);
  };
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle>
            {stage === 'technical' ? 'Technical Assessment' : 'Business Assessment'}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <select 
              className="p-2 text-sm border rounded-md bg-white"
              value={evaluationType}
              onChange={(e) => setEvaluationType(e.target.value)}
              aria-label="Evaluation Type"
            >
              <option value="scorecard">Scorecard (0-100)</option>
              <option value="passfail">Pass/Fail Evaluation</option>
            </select>
            <Button size="sm" onClick={saveAssessment}>
              <Save className="h-4 w-4 mr-2" />
              Save Assessment
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="criteria">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="criteria">Assessment Criteria</TabsTrigger>
            <TabsTrigger value="documents">Supporting Documents</TabsTrigger>
            <TabsTrigger value="notes">Assessment Notes</TabsTrigger>
          </TabsList>
          
          {/* Criteria Assessment Tab */}
          <TabsContent value="criteria" className="p-1">
            <div className="space-y-6">
              {currentCriteria.map((criterion) => (
                <div key={criterion.id} className="border rounded-md p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center">
                        <h3 className="font-medium text-base">{criterion.name}</h3>
                        {criterion.required && (
                          <Badge className="ml-2">Required</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {criterion.description}
                      </p>
                    </div>
                    <Badge variant="outline">Weight: {criterion.weight}%</Badge>
                  </div>
                  
                  {evaluationType === 'scorecard' ? (
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Score: {currentScores[criterion.id] || 0}</span>
                        <span className="text-muted-foreground">0-100</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <Slider
                          value={[currentScores[criterion.id] || 0]}
                          min={0}
                          max={100}
                          step={5}
                          onValueChange={(value: number[]) => updateScore(criterion.id, value[0])}
                          className="flex-1"
                        />
                        <div className="grid grid-cols-5 gap-1">
                          {[0, 25, 50, 75, 100].map((value) => (
                            <Button 
                              key={value} 
                              variant={currentScores[criterion.id] === value ? "default" : "outline"} 
                              size="sm"
                              className="h-8 w-10"
                              onClick={() => updateScore(criterion.id, value)}
                            >
                              {value}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4">
                      <RadioGroup 
                        value={currentMet[criterion.id]} 
                        onValueChange={(value) => updateCriteriaMet(criterion.id, value)}
                        className="flex space-x-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id={`${criterion.id}-yes`} />
                          <Label
                            htmlFor={`${criterion.id}-yes`}
                            className="flex items-center"
                          >
                            <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                            Meets Criteria
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id={`${criterion.id}-no`} />
                          <Label
                            htmlFor={`${criterion.id}-no`}
                            className="flex items-center"
                          >
                            <XCircle className="h-4 w-4 text-red-600 mr-1" />
                            Does Not Meet
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="partial" id={`${criterion.id}-partial`} />
                          <Label
                            htmlFor={`${criterion.id}-partial`}
                            className="flex items-center"
                          >
                            <AlertCircle className="h-4 w-4 text-amber-500 mr-1" />
                            Partially Meets
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  )}
                </div>
              ))}
              
              {/* Overall Assessment */}
              <div className="border rounded-md p-4 bg-gray-50">
                <h3 className="font-medium text-base mb-3">Overall Assessment</h3>
                
                {evaluationType === 'scorecard' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">
                        Overall Score
                      </div>
                      <div className="text-3xl font-bold">
                        {stage === 'technical' ? technicalScore : businessScore}/100
                      </div>
                      <Progress 
                        value={stage === 'technical' ? technicalScore : businessScore} 
                        className="h-2 mt-2" 
                      />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">
                        Assessment Status
                      </div>
                      <div className="flex items-center">
                        {((stage === 'technical' && technicalScore >= 65) || 
                          (stage === 'business' && businessScore >= 65)) ? (
                          <div className="flex items-center">
                            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                            <span className="text-green-700 font-medium">Meets Requirements</span>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <XCircle className="h-5 w-5 text-red-600 mr-2" />
                            <span className="text-red-700 font-medium">Does Not Meet Requirements</span>
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground mt-2">
                        {stage === 'technical' ? 
                          'Technical assessment requires a minimum score of 65/100' : 
                          'Business assessment requires a minimum score of 65/100'}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">
                        Criteria Met
                      </div>
                      <div className="text-lg font-medium">
                        {stage === 'technical' ? 
                          `${technicalCriteriaMet}/${TECHNICAL_CRITERIA.length} Criteria` : 
                          `${businessCriteriaMet}/${BUSINESS_CRITERIA.length} Criteria`}
                      </div>
                      <Progress 
                        value={stage === 'technical' ? 
                          (technicalCriteriaMet / TECHNICAL_CRITERIA.length) * 100 : 
                          (businessCriteriaMet / BUSINESS_CRITERIA.length) * 100} 
                        className="h-2 mt-2" 
                      />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">
                        Required Criteria
                      </div>
                      <div className="flex items-center">
                        {((stage === 'technical' && technicalRequiredMet) || 
                          (stage === 'business' && businessRequiredMet)) ? (
                          <div className="flex items-center">
                            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                            <span className="text-green-700 font-medium">All Required Criteria Met</span>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <XCircle className="h-5 w-5 text-red-600 mr-2" />
                            <span className="text-red-700 font-medium">Missing Required Criteria</span>
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground mt-2">
                        All required criteria must be met for certification
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end mt-4">
                  <Button onClick={completeAssessment}>
                    Complete Assessment <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Supporting Documents Tab */}
          <TabsContent value="documents">
            <div className="space-y-4">
              <div className="bg-gray-50 border border-dashed rounded-md p-8 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <File className="h-6 w-6 text-gray-500" />
                </div>
                <h3 className="font-medium">Supporting Documents</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  Upload and review documents that support your assessment
                </p>
                <Button>Upload Document</Button>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <p>The following documents from the startup can be referenced during assessment:</p>
                <ul className="list-disc pl-5 mt-2">
                  <li>Business Registration Certificate</li>
                  <li>Technical Documentation</li>
                  <li>Financial Statements</li>
                  <li>Business Plan</li>
                  <li>Team Structure & CVs</li>
                </ul>
              </div>
            </div>
          </TabsContent>
          
          {/* Assessment Notes Tab */}
          <TabsContent value="notes">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="assessment-notes">Assessment Notes</Label>
                <Textarea 
                  id="assessment-notes" 
                  placeholder="Enter detailed notes about your assessment findings..." 
                  className="min-h-[200px]"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              
              <div className="flex justify-end">
                <Button onClick={saveNotes}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Notes
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      {/* Feedback Message */}
      {saveMessage && (
        <div className="fixed bottom-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-md z-50">
          <span className="flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            {saveMessage}
          </span>
        </div>
      )}
    </Card>
  );
}
