import React, { Suspense } from 'react';
import { AssessmentDetailsClient } from '../../components/assessment-details-client';
import { Loader2 } from 'lucide-react';

export default function StartupAssessmentDetailPage() {
  return (
    <Suspense fallback={
      <div className="container py-32 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium">Loading startup assessment...</p>
      </div>
    }>
      <AssessmentDetailsClient entityType="startup" />
    </Suspense>
  );
}
