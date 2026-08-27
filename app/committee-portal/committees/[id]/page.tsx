import React from 'react';
import { getMyCommittees } from '../actions';
import { CommitteesClient } from '../committees-client';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function CommitteeDetailPage({ params }: { params: { id: string } }) {
  const result = await getMyCommittees();

  if (!result.success) {
    if (result.message === "Unauthorized") {
      redirect("/auth/sign-in");
    }
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-4">Error loading committee</h1>
        <p className="text-destructive">{result.message}</p>
      </div>
    );
  }

  const committees = result.data || [];

  return <CommitteesClient initialCommittees={committees} defaultCommitteeId={params.id} />;
}
