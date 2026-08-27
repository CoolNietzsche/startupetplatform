import React from "react";
import { notFound } from "next/navigation";
import { getIncomingRequestById } from "../actions";
import StakeholderRequestDetailClient from "./request-detail-client";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function StakeholderRequestDetailPage({ params }: PageProps) {
  const { id } = await params;
  const res = await getIncomingRequestById(id);

  if (!res.success || !res.data) {
    notFound();
  }

  return (
    <StakeholderRequestDetailClient request={res.data} />
  );
}
