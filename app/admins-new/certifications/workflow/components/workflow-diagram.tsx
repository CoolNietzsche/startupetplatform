import React from 'react';
import styles from './workflow-diagram.module.css';
import { CheckCircle } from 'lucide-react';

type WorkflowStage = {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  count: number;
};

type WorkflowDiagramProps = {
  stages: WorkflowStage[];
  currentStage: string;
};

export function WorkflowDiagram({ stages, currentStage }: WorkflowDiagramProps) {
  return (
    <div className={styles.diagramContainer}>
      <div className={styles.stagesContainer}>
        {stages.map((stage) => {
          // Determine the state of this stage (active, completed, or upcoming)
          const stageIndex = stages.findIndex(s => s.id === currentStage);
          const isActive = stage.id === currentStage;
          const isCompleted = stages.findIndex(s => s.id === stage.id) < stageIndex;
          
          return (
            <div key={stage.id} className={styles.stage}>
              {/* Circle with icon */}
              <div className={`${styles.circle} ${isActive ? styles.circleActive : ''} ${isCompleted ? styles.circleComplete : ''}`}>
                {isCompleted ? (
                  <CheckCircle className="h-6 w-6" />
                ) : (
                  <div className={styles.iconContainer}>
                    {stage.icon}
                  </div>
                )}
              </div>
              
              {/* Stage name */}
              <div className={`${styles.stageName} ${isActive ? styles.stageNameActive : ''} ${isCompleted ? styles.stageNameComplete : ''}`}>
                {stage.name}
              </div>
              
              {/* Stage description - only shown if active */}
              {isActive && (
                <div className={styles.stageDescription}>
                  {stage.description}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Connecting line */}
      <div className={styles.connectingLine} />
    </div>
  );
}
