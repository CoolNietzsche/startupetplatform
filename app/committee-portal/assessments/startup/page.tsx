import React from 'react';
import { redirect } from 'next/navigation';
import { getDashboardData } from '../../dashboard/actions';
import { AssessmentsClient } from '../assessments-client';

export const dynamic = 'force-dynamic';

export default async function StartupAssessmentsPage() {
  const result = await getDashboardData();

  if (!result.success) {
    if (result.message === 'Unauthorized') {
      redirect('/auth/sign-in');
    }
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-4">Error loading assessments</h1>
        <p className="text-destructive">{result.message}</p>
      </div>
    );
  }

  const { committees, pendingAssessments, underReviewAssessments, completedAssessments } = result.data || {
    committees: [],
    pendingAssessments: [],
    underReviewAssessments: [],
    completedAssessments: [],
  };

  return (
    <AssessmentsClient
      committees={committees}
      pendingAssessments={pendingAssessments}
      underReviewAssessments={underReviewAssessments}
      completedAssessments={completedAssessments}
      mode="startup"
    />
  );
}
