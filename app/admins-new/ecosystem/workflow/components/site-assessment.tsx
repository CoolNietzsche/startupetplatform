import React, { useState } from 'react';
import BaseApplications, { ApplicationType } from './base-applications';
import { Building, CheckCircle, AlertCircle, Ruler } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SiteAssessmentProps {
  applications: ApplicationType[];
  stage: string;
  onMoveApplication: (applicationId: string) => void;
  onCompleteAssessment: (applicationId: string, assessmentData: any) => void;
}

export default function SiteAssessment({ 
  applications, 
  stage, 
  onMoveApplication,
  onCompleteAssessment
}: SiteAssessmentProps) {
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [assessmentData, setAssessmentData] = useState<any>({
    infrastructure: { score: 0, notes: '' },
    facilities: { score: 0, notes: '' },
    accessibility: { score: 0, notes: '' },
    equipment: { score: 0, notes: '' },
    space: { score: 0, notes: '' }
  });
  const [activeTab, setActiveTab] = useState('infrastructure');
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  
  const showMessage = (type: 'success' | 'error' | 'info', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };
  
  const handleOpenAssessment = (applicationId: string) => {
    const app = applications.find(a => a.id === applicationId);
    if (app) {
      // Initialize with any existing assessment data or defaults
      setAssessmentData({
        infrastructure: { score: 0, notes: '' },
        facilities: { score: 0, notes: '' },
        accessibility: { score: 0, notes: '' },
        equipment: { score: 0, notes: '' },
        space: { score: 0, notes: '' },
        ...app.assessments
      });
      setSelectedApp(applicationId);
      setActiveTab('infrastructure');
    }
  };
  
  const handleScoreChange = (category: string, value: number[]) => {
    setAssessmentData(prev => ({
      ...prev,
      [category]: { ...prev[category], score: value[0] }
    }));
  };
  
  const handleNotesChange = (category: string, notes: string) => {
    setAssessmentData(prev => ({
      ...prev,
      [category]: { ...prev[category], notes }
    }));
  };
  
  const calculateAverageScore = () => {
    const scores = Object.values(assessmentData).map(item => (item as any).score);
    const sum = scores.reduce((acc, score) => acc + score, 0);
    return Math.round((sum / scores.length) * 10) / 10;
  };
  
  const handleCompleteAssessment = () => {
    if (selectedApp) {
      onCompleteAssessment(selectedApp, assessmentData);
      setSelectedApp(null);
      showMessage('success', 'Site assessment completed successfully');
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
        onMoveApplication={(appId) => handleOpenAssessment(appId)}
        actionButtonText="Conduct Site Assessment"
        actionButtonIcon={<Building className="ml-2 h-4 w-4" />}
        emptyStateMessage="No applications pending site assessment"
      />
      
      {/* Site Assessment Dialog */}
      {selectedApp && (
        <Dialog open={Boolean(selectedApp)} onOpenChange={() => setSelectedApp(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Site Assessment</DialogTitle>
            </DialogHeader>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
              <TabsList className="grid grid-cols-5">
                <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
                <TabsTrigger value="facilities">Facilities</TabsTrigger>
                <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
                <TabsTrigger value="equipment">Equipment</TabsTrigger>
                <TabsTrigger value="space">Space</TabsTrigger>
              </TabsList>
              
              <TabsContent value="infrastructure" className="space-y-4 mt-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <Label>Building Quality & Maintenance</Label>
                    <span className="text-sm font-medium">
                      {assessmentData.infrastructure.score}/10 - {getScoreLabel(assessmentData.infrastructure.score)}
                    </span>
                  </div>
                  <Slider 
                    value={[assessmentData.infrastructure.score]}
                    max={10}
                    step={1}
                    onValueChange={(value) => handleScoreChange('infrastructure', value)}
                    className="mb-4"
                  />
                  
                  <Label>Assessment Notes</Label>
                  <Textarea 
                    placeholder="Enter notes about the building infrastructure..."
                    value={assessmentData.infrastructure.notes}
                    onChange={(e) => handleNotesChange('infrastructure', e.target.value)}
                    className="mt-1.5"
                    rows={4}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="facilities" className="space-y-4 mt-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <Label>Amenities & Facilities</Label>
                    <span className="text-sm font-medium">
                      {assessmentData.facilities.score}/10 - {getScoreLabel(assessmentData.facilities.score)}
                    </span>
                  </div>
                  <Slider 
                    value={[assessmentData.facilities.score]}
                    max={10}
                    step={1}
                    onValueChange={(value) => handleScoreChange('facilities', value)}
                    className="mb-4"
                  />
                  
                  <Label>Assessment Notes</Label>
                  <Textarea 
                    placeholder="Enter notes about available facilities..."
                    value={assessmentData.facilities.notes}
                    onChange={(e) => handleNotesChange('facilities', e.target.value)}
                    className="mt-1.5"
                    rows={4}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="accessibility" className="space-y-4 mt-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <Label>Location & Accessibility</Label>
                    <span className="text-sm font-medium">
                      {assessmentData.accessibility.score}/10 - {getScoreLabel(assessmentData.accessibility.score)}
                    </span>
                  </div>
                  <Slider 
                    value={[assessmentData.accessibility.score]}
                    max={10}
                    step={1}
                    onValueChange={(value) => handleScoreChange('accessibility', value)}
                    className="mb-4"
                  />
                  
                  <Label>Assessment Notes</Label>
                  <Textarea 
                    placeholder="Enter notes about location accessibility..."
                    value={assessmentData.accessibility.notes}
                    onChange={(e) => handleNotesChange('accessibility', e.target.value)}
                    className="mt-1.5"
                    rows={4}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="equipment" className="space-y-4 mt-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <Label>Technology & Equipment</Label>
                    <span className="text-sm font-medium">
                      {assessmentData.equipment.score}/10 - {getScoreLabel(assessmentData.equipment.score)}
                    </span>
                  </div>
                  <Slider 
                    value={[assessmentData.equipment.score]}
                    max={10}
                    step={1}
                    onValueChange={(value) => handleScoreChange('equipment', value)}
                    className="mb-4"
                  />
                  
                  <Label>Assessment Notes</Label>
                  <Textarea 
                    placeholder="Enter notes about technology and equipment..."
                    value={assessmentData.equipment.notes}
                    onChange={(e) => handleNotesChange('equipment', e.target.value)}
                    className="mt-1.5"
                    rows={4}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="space" className="space-y-4 mt-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <Label>Space Utilization</Label>
                    <span className="text-sm font-medium">
                      {assessmentData.space.score}/10 - {getScoreLabel(assessmentData.space.score)}
                    </span>
                  </div>
                  <Slider 
                    value={[assessmentData.space.score]}
                    max={10}
                    step={1}
                    onValueChange={(value) => handleScoreChange('space', value)}
                    className="mb-4"
                  />
                  
                  <Label>Assessment Notes</Label>
                  <Textarea 
                    placeholder="Enter notes about space utilization..."
                    value={assessmentData.space.notes}
                    onChange={(e) => handleNotesChange('space', e.target.value)}
                    className="mt-1.5"
                    rows={4}
                  />
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="bg-gray-50 p-4 rounded-lg mt-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Overall Assessment Score</h3>
                  <p className="text-sm text-muted-foreground">Average score across all categories</p>
                </div>
                <div className="text-xl font-bold">
                  {calculateAverageScore()}/10
                </div>
              </div>
            </div>
            
            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={() => setSelectedApp(null)}>Cancel</Button>
              <Button onClick={handleCompleteAssessment}>
                Complete Assessment
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
