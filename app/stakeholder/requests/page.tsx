import React from "react";
import StakeholderRequestsClient from "./request-client";
import { getIncomingRequests } from "./actions";

export const dynamic = "force-dynamic";

export default async function StakeholderRequestsPage() {
  const res = await getIncomingRequests();
  const requests = res.success ? res.data : [];

  return (
    <StakeholderRequestsClient initialRequests={requests} />
  );
}
