import React from "react";
import { Award, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { WORKFLOW_STEPS, type EcosystemApplicationStatus } from "./types";

interface CertificationWorkflowProps {
  currentStatus: string | EcosystemApplicationStatus;
  title?: string;
  description?: string;
  className?: string;
  showDetails?: boolean;
}

export function CertificationWorkflow({ 
  currentStatus, 
  title = "Certification Process Workflow",
  description = "Standardized process for ecosystem builder certification",
  className,
  showDetails = true
}: CertificationWorkflowProps) {
  const status = currentStatus?.toUpperCase() || "PENDING";
  const activeIndex = WORKFLOW_STEPS.findIndex(s => s.status === status);
  
  return (
    <Card className={cn("overflow-hidden mb-6", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Award className="h-4 w-4 text-primary" />
          {title}
        </CardTitle>
        {description && <CardDescription className="text-xs">{description}</CardDescription>}
      </CardHeader>
      <CardContent className="pt-2 pb-6">
        <div className="relative flex justify-between items-start">
          {/* Progress Line Background */}
          <div className="absolute top-5 left-0 w-full h-0.5 bg-muted -z-0" />
          
          {/* Active Progress Line */}
          <div 
            className="absolute top-5 left-0 h-0.5 bg-primary transition-all duration-700 -z-0" 
            style={{ width: `${activeIndex >= 0 ? (activeIndex / (WORKFLOW_STEPS.length - 1)) * 100 : 0}%` }}
          />

          {WORKFLOW_STEPS.map((step, idx) => {
            const isCompleted = idx < activeIndex;
            const isActive = idx === activeIndex;
            const Icon = step.icon;

            return (
              <div key={step.status} className="flex flex-col items-center gap-2 relative z-10 w-full group">
                <div 
                  className={cn(
                    "h-10 w-10 rounded-full border-2 flex items-center justify-center transition-all bg-background",
                    isActive ? "border-primary scale-110 shadow-sm ring-4 ring-primary/10 text-primary" : 
                    isCompleted ? "border-primary bg-primary text-white" : "border-muted text-muted-foreground"
                  )}
                  title={step.description}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-6 w-6" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                <div className="text-center px-1">
                  <div className={cn(
                    "text-[10px] font-bold uppercase tracking-tight transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}>
                    {step.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {showDetails && activeIndex >= 0 && (
            <div className="mt-6 p-3 rounded-lg bg-muted/40 border text-xs">
                <p className="font-semibold text-primary mb-1">Current Stage: {WORKFLOW_STEPS[activeIndex].label}</p>
                <p className="text-muted-foreground italic">{WORKFLOW_STEPS[activeIndex].description}</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
