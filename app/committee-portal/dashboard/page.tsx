import React from 'react';
import { getDashboardData } from './actions';
import { DashboardClient } from './dashboard-client';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const result = await getDashboardData();

  if (!result.success) {
    if (result.message === "Unauthorized") {
      redirect("/auth/sign-in");
    }
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-4">Error loading dashboard</h1>
        <p className="text-destructive">{result.message}</p>
      </div>
    );
  }

  const { committees, pendingAssessments, underReviewAssessments, completedAssessments, upcomingMeetings } = result.data || {
    committees: [],
    pendingAssessments: [],
    underReviewAssessments: [],
    completedAssessments: [],
    upcomingMeetings: []
  };

  return (
    <DashboardClient 
      committees={committees}
      pendingAssessments={pendingAssessments}
      underReviewAssessments={underReviewAssessments}
      completedAssessments={completedAssessments}
      upcomingMeetings={upcomingMeetings}
    />
  );
}
