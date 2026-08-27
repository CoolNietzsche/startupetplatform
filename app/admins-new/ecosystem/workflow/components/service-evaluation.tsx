import React, { useState } from 'react';
import BaseApplications, { ApplicationType } from './base-applications';
import { CheckCircle, AlertCircle, Activity, ClipboardCheck } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ServiceEvaluationProps {
  applications: ApplicationType[];
  stage: string;
  onMoveApplication: (applicationId: string) => void;
  onCompleteEvaluation: (applicationId: string, evaluationData: any) => void;
}

export default function ServiceEvaluation({ 
  applications, 
  stage, 
  onMoveApplication,
  onCompleteEvaluation
}: ServiceEvaluationProps) {
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [evaluationData, setEvaluationData] = useState<any>({
    serviceQuality: { score: 0, notes: '' },
    programOffering: { score: 0, notes: '' },
    staffExpertise: { score: 0, notes: '' },
    networkAccess: { score: 0, notes: '' },
    impact: { score: 0, notes: '' }
  });
  const [activeTab, setActiveTab] = useState('serviceQuality');
  const [evaluationType, setEvaluationType] = useState('onsite');
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  
  const showMessage = (type: 'success' | 'error' | 'info', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };
  
  const handleOpenEvaluation = (applicationId: string) => {
    const app = applications.find(a => a.id === applicationId);
    if (app) {
      // Initialize with any existing assessment data or defaults
      setEvaluationData({
        serviceQuality: { score: 0, notes: '' },
        programOffering: { score: 0, notes: '' },
        staffExpertise: { score: 0, notes: '' },
        networkAccess: { score: 0, notes: '' },
        impact: { score: 0, notes: '' },
        ...app.assessments
      });
      setSelectedApp(applicationId);
      setActiveTab('serviceQuality');
    }
  };
  
  const handleScoreChange = (category: string, value: number[]) => {
    setEvaluationData(prev => ({
      ...prev,
      [category]: { ...prev[category], score: value[0] }
    }));
  };
  
  const handleNotesChange = (category: string, notes: string) => {
    setEvaluationData(prev => ({
      ...prev,
      [category]: { ...prev[category], notes }
    }));
  };
  
  const calculateAverageScore = () => {
    const scores = Object.values(evaluationData).map(item => (item as any).score);
    const sum = scores.reduce((acc, score) => acc + score, 0);
    return Math.round((sum / scores.length) * 10) / 10;
  };
  
  const handleCompleteEvaluation = () => {
    if (selectedApp) {
      onCompleteEvaluation(selectedApp, evaluationData);
      setSelectedApp(null);
      showMessage('success', 'Service evaluation completed successfully');
    }
  };
  
  const getScoreLabel = (score: number) => {
    if (score < 3) return 'Poor';
    if (score < 5) return 'Below Average';
    if (score < 7) return 'Average';
    if (score < 9) return 'Good';
    return 'Excellent';
  };
  
  return (
    <>
      <BaseApplications
        applications={applications}
        stage={stage}
        onMoveApplication={(appId) => handleOpenEvaluation(appId)}
        actionButtonText="Evaluate Services"
        actionButtonIcon={<Activity className="ml-2 h-4 w-4" />}
        emptyStateMessage="No applications pending service evaluation"
      />
      
      {/* Service Evaluation Dialog */}
      {selectedApp && (
        <Dialog open={Boolean(selectedApp)} onOpenChange={() => setSelectedApp(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Service Quality Evaluation</DialogTitle>
            </DialogHeader>
            
            <div className="flex items-center justify-between mb-4 mt-4">
              <div>
                <Label className="mb-1.5 block">Evaluation Type</Label>
                <Select value={evaluationType} onValueChange={setEvaluationType}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select evaluation type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="onsite">On-site Evaluation</SelectItem>
                    <SelectItem value="remote">Remote Assessment</SelectItem>
                    <SelectItem value="client">Client Feedback</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <p>Evaluation should assess all service aspects provided</p>
                <p>by the ecosystem builder to determine quality level.</p>
              </div>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-5">
                <TabsTrigger value="serviceQuality">Service Quality</TabsTrigger>
                <TabsTrigger value="programOffering">Program Offering</TabsTrigger>
                <TabsTrigger value="staffExpertise">Staff Expertise</TabsTrigger>
                <TabsTrigger value="networkAccess">Network Access</TabsTrigger>
                <TabsTrigger value="impact">Impact</TabsTrigger>
              </TabsList>
              
              <TabsContent value="serviceQuality" className="space-y-4 mt-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <Label>Service Quality & Delivery</Label>
                    <span className="text-sm font-medium">
                      {evaluationData.serviceQuality.score}/10 - {getScoreLabel(evaluationData.serviceQuality.score)}
                    </span>
                  </div>
                  <Slider 
                    value={[evaluationData.serviceQuality.score]}
                    max={10}
                    step={1}
                    onValueChange={(value) => handleScoreChange('serviceQuality', value)}
                    className="mb-4"
                  />
                  
                  <Label>Evaluation Notes</Label>
                  <Textarea 
                    placeholder="Enter notes about service quality and delivery..."
                    value={evaluationData.serviceQuality.notes}
                    onChange={(e) => handleNotesChange('serviceQuality', e.target.value)}
                    className="mt-1.5"
                    rows={4}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="programOffering" className="space-y-4 mt-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <Label>Program Offerings & Relevance</Label>
                    <span className="text-sm font-medium">
                      {evaluationData.programOffering.score}/10 - {getScoreLabel(evaluationData.programOffering.score)}
                    </span>
                  </div>
                  <Slider 
                    value={[evaluationData.programOffering.score]}
                    max={10}
                    step={1}
                    onValueChange={(value) => handleScoreChange('programOffering', value)}
                    className="mb-4"
                  />
                  
                  <Label>Evaluation Notes</Label>
                  <Textarea 
                    placeholder="Enter notes about program offerings and relevance..."
                    value={evaluationData.programOffering.notes}
                    onChange={(e) => handleNotesChange('programOffering', e.target.value)}
                    className="mt-1.5"
                    rows={4}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="staffExpertise" className="space-y-4 mt-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <Label>Staff Expertise & Mentorship</Label>
                    <span className="text-sm font-medium">
                      {evaluationData.staffExpertise.score}/10 - {getScoreLabel(evaluationData.staffExpertise.score)}
                    </span>
                  </div>
                  <Slider 
                    value={[evaluationData.staffExpertise.score]}
                    max={10}
                    step={1}
                    onValueChange={(value) => handleScoreChange('staffExpertise', value)}
                    className="mb-4"
                  />
                  
                  <Label>Evaluation Notes</Label>
                  <Textarea 
                    placeholder="Enter notes about staff expertise and mentorship quality..."
                    value={evaluationData.staffExpertise.notes}
                    onChange={(e) => handleNotesChange('staffExpertise', e.target.value)}
                    className="mt-1.5"
                    rows={4}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="networkAccess" className="space-y-4 mt-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <Label>Network & Partnership Access</Label>
                    <span className="text-sm font-medium">
                      {evaluationData.networkAccess.score}/10 - {getScoreLabel(evaluationData.networkAccess.score)}
                    </span>
                  </div>
                  <Slider 
                    value={[evaluationData.networkAccess.score]}
                    max={10}
                    step={1}
                    onValueChange={(value) => handleScoreChange('networkAccess', value)}
                    className="mb-4"
                  />
                  
                  <Label>Evaluation Notes</Label>
                  <Textarea 
                    placeholder="Enter notes about network and partnership access..."
                    value={evaluationData.networkAccess.notes}
                    onChange={(e) => handleNotesChange('networkAccess', e.target.value)}
                    className="mt-1.5"
                    rows={4}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="impact" className="space-y-4 mt-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <Label>Impact & Results</Label>
                    <span className="text-sm font-medium">
                      {evaluationData.impact.score}/10 - {getScoreLabel(evaluationData.impact.score)}
                    </span>
                  </div>
                  <Slider 
                    value={[evaluationData.impact.score]}
                    max={10}
                    step={1}
                    onValueChange={(value) => handleScoreChange('impact', value)}
                    className="mb-4"
                  />
                  
                  <Label>Evaluation Notes</Label>
                  <Textarea 
                    placeholder="Enter notes about measurable impact and results..."
                    value={evaluationData.impact.notes}
                    onChange={(e) => handleNotesChange('impact', e.target.value)}
                    className="mt-1.5"
                    rows={4}
                  />
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="bg-gray-50 p-4 rounded-lg mt-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Overall Service Score</h3>
                  <p className="text-sm text-muted-foreground">Average score across all service categories</p>
                </div>
                <div className="text-xl font-bold">
                  {calculateAverageScore()}/10
                </div>
              </div>
            </div>
            
            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={() => setSelectedApp(null)}>Cancel</Button>
              <Button onClick={handleCompleteEvaluation}>
                <ClipboardCheck className="mr-2 h-4 w-4" />
                Complete Evaluation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Toast message */}
      {message && (
        <div className={`
          fixed bottom-4 right-4 px-4 py-3 rounded shadow-md z-50
          ${message.type === 'success' ? 'bg-green-100 border border-green-400 text-green-700' : 
            message.type === 'error' ? 'bg-red-100 border border-red-400 text-red-700' :
            'bg-blue-100 border border-blue-400 text-blue-700'}
        `}>
          <span className="flex items-center">
            {message.type === 'success' && <CheckCircle className="h-5 w-5 mr-2" />}
            {message.type === 'error' && <AlertCircle className="h-5 w-5 mr-2" />}
            {message.type === 'info' && <AlertCircle className="h-5 w-5 mr-2" />}
            {message.text}
          </span>
        </div>
      )}
    </>
  );
}
