import React from 'react';
import { CheckCircle } from 'lucide-react';

type WorkflowStage = {
  id: string;
  name: string;
  description: string;
};

interface WorkflowDiagramProps {
  stages: WorkflowStage[];
  activeStage: string;
}

export default function WorkflowDiagram({ stages, activeStage }: WorkflowDiagramProps) {
  return (
    <div className="relative">
      <div className="flex justify-between items-center">
        {stages.map((stage, index) => {
          // Determine the state of this stage (active, completed, or upcoming)
          const stageIndex = stages.findIndex(s => s.id === activeStage);
          const isActive = stage.id === activeStage;
          const isCompleted = stages.findIndex(s => s.id === stage.id) < stageIndex;
          
          // Determine the appropriate color class based on state
          const circleColorClass = isActive 
            ? "bg-primary border-primary text-white" 
            : isCompleted 
              ? "bg-green-100 border-green-500 text-green-700" 
              : "bg-gray-100 border-gray-300 text-gray-500";
          
          const textColorClass = isActive 
            ? "text-primary" 
            : isCompleted 
              ? "text-green-700" 
              : "text-gray-500";
              
          return (
            <div key={stage.id} className={`flex flex-col items-center text-center w-[${100 / stages.length}%]`}>
              {/* Circle with number or check */}
              <div className={`h-12 w-12 rounded-full border-2 flex items-center justify-center mb-2 ${circleColorClass}`}>
                {isCompleted ? (
                  <CheckCircle className="h-6 w-6" />
                ) : (
                  <div className="h-6 w-6 flex items-center justify-center">
                    {index + 1}
                  </div>
                )}
              </div>
              
              {/* Stage name */}
              <div className={`font-medium text-sm ${textColorClass}`}>
                {stage.name}
              </div>
              
              {/* Description (only shown for active stage) */}
              {isActive && (
                <div className="text-xs text-muted-foreground mt-1 max-w-[140px]">
                  {stage.description}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Connecting line */}
      <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200 -z-10" />
    </div>
  );
}
