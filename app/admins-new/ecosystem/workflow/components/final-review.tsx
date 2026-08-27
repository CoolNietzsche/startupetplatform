import React, { useState } from 'react';
import BaseApplications, { ApplicationType } from './base-applications';
import { Award, CheckCircle, AlertCircle, XCircle, Star, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface FinalReviewProps {
  applications: ApplicationType[];
  stage: string;
  onApprove: (applicationId: string) => void;
  onReject: (applicationId: string) => void;
}

export default function FinalReview({ 
  applications, 
  stage, 
  onApprove,
  onReject
}: FinalReviewProps) {
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [certificationLevel, setCertificationLevel] = useState('standard');
  const [finalRemarks, setFinalRemarks] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  
  const showMessage = (type: 'success' | 'error' | 'info', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };
  
  const handleOpenReview = (applicationId: string) => {
    const app = applications.find(a => a.id === applicationId);
    if (app) {
      setSelectedApp(applicationId);
      setCertificationLevel('standard');
      setFinalRemarks('');
    }
  };
  
  const handleApprove = () => {
    if (selectedApp) {
      onApprove(selectedApp);
      setSelectedApp(null);
      showMessage('success', `Application approved and certified as ${certificationLevel.toUpperCase()} ecosystem builder`);
    }
  };
  
  const handleReject = () => {
    if (selectedApp) {
      onReject(selectedApp);
      setSelectedApp(null);
      showMessage('error', 'Application rejected');
    }
  };
  
  const calculateAverageScore = (application) => {
    if (!application) return 0;
    
    // Collect all assessment scores
    const scores = [];
    if (application.assessments) {
      Object.values(application.assessments).forEach(category => {
        if (typeof (category as any).score === 'number') {
          scores.push((category as any).score);
        }
      });
    }
    
    if (scores.length === 0) return 0;
    const sum = scores.reduce((acc, score) => acc + score, 0);
    return Math.round((sum / scores.length) * 10) / 10;
  };
  
  const getCertificationRecommendation = (score: number) => {
    if (score < 5) return 'Not Recommended';
    if (score < 7) return 'Basic';
    if (score < 8.5) return 'Standard';
    return 'Premium';
  };
  
  const getRecommendationColor = (recommendation: string) => {
    switch(recommendation) {
      case 'Not Recommended': return 'text-red-600';
      case 'Basic': return 'text-amber-600';
      case 'Standard': return 'text-blue-600';
      case 'Premium': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };
  
  const selectedApplication = applications.find(app => app.id === selectedApp);
  const averageScore = selectedApplication ? calculateAverageScore(selectedApplication) : 0;
  const recommendation = getCertificationRecommendation(averageScore);
  
  return (
    <>
      <BaseApplications
        applications={applications}
        stage={stage}
        onMoveApplication={(appId) => handleOpenReview(appId)}
        actionButtonText="Issue Certificate"
        actionButtonIcon={<Award className="ml-2 h-4 w-4" />}
        emptyStateMessage="No applications pending final review"
      />
      
      {/* Final Review Dialog */}
      {selectedApp && selectedApplication && (
        <Dialog open={Boolean(selectedApp)} onOpenChange={() => setSelectedApp(null)}>
          <DialogContent className="max-w-[750px] p-0 overflow-y-auto max-h-[95vh] border-none shadow-2xl">
             <div className="bg-gradient-to-br from-green-600 to-emerald-700 p-8 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                      <Award className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <DialogTitle className="text-2xl font-black text-white whitespace-nowrap">Issue Official Certificate</DialogTitle>
                      <DialogDescription className="text-green-50/80 font-medium whitespace-nowrap">
                        Grant official Ecosystem Builder status
                      </DialogDescription>
                    </div>
                  </div>
                  <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm h-8 px-3">
                    {selectedApplication.type || 'Ecosystem Builder'}
                  </Badge>
              </div>
          </div>

            <div className="p-8 bg-slate-50">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  {/* Preview Side */}
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Draft Certificate Preview</Label>
                    <div className="aspect-[1/1.414] bg-white rounded-xl shadow-inner border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-6 text-center group cursor-pointer hover:border-green-300 transition-colors">
                      <div className="scale-75 origin-center transform transition-transform group-hover:scale-90">
                         <div className="border-[8px] border-emerald-600 p-4 w-full h-full bg-white relative">
                            <div className="border-2 border-emerald-600/30 p-2 h-full flex flex-col items-center">
                               <ShieldCheck className="h-10 w-10 text-emerald-600 mb-2" />
                               <div className="text-[8px] font-black text-emerald-800 uppercase tracking-tighter mb-1">Republic of Ethiopia</div>
                               <div className="text-[6px] font-medium text-slate-500 mb-4 text-center">Ministry of Innovation & Technology</div>
                               <div className="w-12 h-[1px] bg-emerald-600 mb-4" />
                               <div className="text-[10px] font-black text-slate-800 uppercase mb-1">CERTIFICATE</div>
                               <div className="text-[5px] text-slate-400 italic mb-1">This is to certify that</div>
                               <div className="text-[9px] font-black text-emerald-700 underline underline-offset-4 mb-2">{selectedApplication.name}</div>
                               <div className="text-[5px] text-slate-500 text-center px-4 leading-[1.4]">has successfully met all established criteria for official {selectedApplication.type} status.</div>
                            </div>
                         </div>
                      </div>
                    </div>
                  </div>

                  {/* Settings Side */}
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Certification Level</Label>
                      <div className="grid grid-cols-1 gap-2">
                        {['basic', 'standard', 'premium'].map((level) => (
                          <div 
                            key={level}
                            onClick={() => setCertificationLevel(level)}
                            className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                              certificationLevel === level 
                                ? 'border-green-500 bg-green-50 shadow-sm' 
                                : 'bg-white hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`p-1.5 rounded-lg ${
                                level === 'premium' ? 'bg-purple-100' : level === 'standard' ? 'bg-blue-100' : 'bg-amber-100'
                              }`}>
                                <Star className={`h-4 w-4 ${
                                  level === 'premium' ? 'text-purple-600' : level === 'standard' ? 'text-blue-600' : 'text-amber-600'
                                }`} />
                              </div>
                              <span className="font-bold text-sm capitalize">{level}</span>
                            </div>
                            {certificationLevel === level && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Performance Audit</Label>
                      <div className="bg-white p-4 rounded-xl border space-y-3">
                        <div className="flex justify-between items-center text-sm font-bold">
                           <span className="text-slate-500">Avg. Score</span>
                           <span className="text-emerald-600">{averageScore}/10</span>
                        </div>
                        <Progress value={averageScore * 10} className="h-2" />
                        <p className="text-[10px] text-slate-400 font-medium italic">
                          Manual validation of infrastructure, services, and impact completed.
                        </p>
                      </div>
                    </div>
                  </div>
               </div>

               <Separator className="mb-8" />
               
               <DialogFooter className="gap-2 sm:gap-0">
                  <Button 
                    variant="outline" 
                    onClick={handleReject}
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-bold"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                  
                  <Button 
                    onClick={handleApprove}
                    disabled={averageScore < 5}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold min-w-[200px]"
                  >
                    <Award className="mr-2 h-4 w-4" />
                    Approve & Issue Certificate
                  </Button>
               </DialogFooter>
            </div>
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
            {message.type === 'error' && <XCircle className="h-5 w-5 mr-2" />}
            {message.type === 'info' && <AlertCircle className="h-5 w-5 mr-2" />}
            {message.text}
          </span>
        </div>
      )}
    </>
  );
}
