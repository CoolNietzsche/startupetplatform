"use client";

import React from "react";
import Link from "next/link";
import { Mail, Building2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CommunicationCenter } from "@/messaging/CommunicationCenter";

export default function AdminMessagesClient({ initialInbox }: { initialInbox: any[] }) {
  return (
    <CommunicationCenter
      initialInbox={initialInbox}
      title="Protocol Center"
      headerIcon={Mail}
      role="ADMIN"
      renderHeaderActions={(selectedThread) => {
        const conv = selectedThread?.conversation;
        if (!conv) return null;

        const isEco = !!conv.ecoApplicationId;
        const appPath = isEco
          ? `/admins-new/ecosystem/review/${conv.ecoApplicationId}`
          : `/admins-new/applications/${conv.applicationId}`;

        if (!conv.applicationId && !conv.ecoApplicationId) return null;

        return (
          <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-500">
            <Link href={appPath}>
              <Button variant="outline" className="bg-white border-brand-deep-dark/10 hover:border-brand-mint-teal/30 hover:bg-brand-mint-teal/5 text-brand-deep-dark/70 font-extrabold uppercase tracking-widest text-[10px] h-10 px-5 rounded-xl transition-all shadow-sm">
                <Info className="w-4 h-4 mr-2 text-brand-mint-teal" /> Application Info
              </Button>
            </Link>
            <Link href={appPath}>
              <Button className="bg-brand-deep-dark hover:bg-brand-mint-teal text-white shadow-md rounded-xl font-black uppercase tracking-widest text-[10px] h-10 px-6 transition-all">
                <Building2 className="w-4 h-4 mr-2 text-white/70" /> Open Application
              </Button>
            </Link>
          </div>
        );

      }}
    />
  );
}
