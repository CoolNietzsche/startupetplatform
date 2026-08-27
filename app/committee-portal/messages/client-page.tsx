"use client";

import React from "react";
import Link from "next/link";
import { Mail, Shield, ExternalLink, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CommunicationCenter } from "@/messaging/CommunicationCenter";

export default function CommitteeMessagesClient({ initialInbox }: { initialInbox: any[] }) {
  return (
    <CommunicationCenter
      initialInbox={initialInbox}
      title="Strategic Inquiries"
      subtitle=""
      headerIcon={Shield}
      role="COMMITTEE"
      renderHeaderActions={(selectedThread) => {
        const conv = selectedThread?.conversation;

        return (
          <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-500">
            {conv && (conv.applicationId || conv.ecoApplicationId) && (
              <Link href={conv.ecoApplicationId ? `/committee-portal/ecosystem/${conv.ecoApplicationId}` : `/committee-portal/assessments/${conv.applicationId}`}>
                <Button className="bg-brand-mint-teal hover:bg-brand-mint-teal/80 text-white shadow-md rounded-xl font-black uppercase tracking-widest text-[10px] h-10 px-6 transition-all">
                  <FileText className="w-4 h-4 mr-2 text-indigo-100" /> Review Assessment
                </Button>
              </Link>
            )}

            {/* Action to start a new consultation thread if needed - though usually initiated from assessment */}
            <Button variant="outline" className="border-slate-200 hover:border-indigo-200 hover:bg-indigo-50 text-slate-700 font-extrabold uppercase tracking-widest text-[10px] h-10 px-5 rounded-xl transition-all shadow-sm">
              <Mail className="w-4 h-4 mr-2 text-indigo-500" /> New Consultation
            </Button>
          </div>
        );
      }}

    />
  );
}
