"use client";

import React from "react";
import { PlusCircle, Building2, UserCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CommunicationCenter } from "@/messaging/CommunicationCenter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  initAppChatWithAdmin,
  initAppChatWithCommittee,
  initEcoChatWithAdmin,
  initEcoChatWithCommittee,
  getOrCreateEcoConversation
} from "@/lib/actions/communication";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function ApplicantMessagesClient({
  initialInbox,
  applications = [],
  ecoApplications = []
}: {
  initialInbox: any[],
  applications?: any[],
  ecoApplications?: any[]
}) {
  const router = useRouter();

  const handleInit = async (action: any, id: string) => {
    const res = await action(id);
    if (res.success && res.data?.conversationId) {
      toast.success("Connection established successfully");
      // To properly select the new thread, we might need a refresh or the CommunicationCenter handles it
      // For now, simpler to just revalidate/refresh
      window.location.reload();
    } else {
      toast.error(res.error || "Failed to establish link");
    }
  };

  return (
    <CommunicationCenter
      initialInbox={initialInbox}
      title="Messaging"
      subtitle=""
      headerIcon={Building2}
      role="APPLICANT"
    />
  );
}
