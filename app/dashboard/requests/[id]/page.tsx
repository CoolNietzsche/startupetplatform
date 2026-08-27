import React from "react";
import { notFound } from "next/navigation";
import { getFormalRequestById } from "../actions";
import RequestDetailClient from "./request-detail-client";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function RequestDetailPage({ params }: PageProps) {
  const { id } = await params;
  const res = await getFormalRequestById(id);

  if (!res.success || !res.data) {
    notFound();
  }

  return (
    <RequestDetailClient request={res.data} />
  );
}
