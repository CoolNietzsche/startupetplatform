import React from 'react';
import BaseApplications, { ApplicationType } from './base-applications';
import { ChevronRight } from 'lucide-react';

interface NewApplicationsProps {
  applications: ApplicationType[];
  stage: string;
  onMoveApplication: (applicationId: string) => void;
}

export default function NewApplications({ 
  applications, 
  stage, 
  onMoveApplication 
}: NewApplicationsProps) {
  return (
    <BaseApplications
      applications={applications}
      stage={stage}
      onMoveApplication={onMoveApplication}
      actionButtonText="Start Review"
      actionButtonIcon={<ChevronRight className="ml-2 h-4 w-4" />}
      emptyStateMessage="No new applications to review"
    />
  );
}
