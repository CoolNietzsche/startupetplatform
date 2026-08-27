"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MessageCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { initAdminChatWithApplicant } from "@/lib/actions/communication";
import { cn } from "@/lib/utils";

interface ContactBuilderButtonProps {
  applicationId: string;
  entityType: "startup" | "ecosystem";
  variant?: "outline" | "ghost" | "default" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  /** When true renders only the icon, no label text */
  showIconOnly?: boolean;
  /** Custom button label — defaults to "Direct Message" */
  label?: string;
  /** Called after navigation is triggered */
  onSuccess?: (conversationId: string) => void;
}

export function ContactBuilderButton({
  applicationId,
  entityType,
  variant = "outline",
  size = "sm",
  className,
  showIconOnly = false,
  label = "Direct Message",
  onSuccess,
}: ContactBuilderButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleContact = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setLoading(true);
    try {
      const res = await initAdminChatWithApplicant(applicationId, entityType);

      if (res.success && res.data?.conversationId) {
        const conversationId = res.data.conversationId;
        onSuccess?.(conversationId);
        router.push(`/admins-new/messages?conversationId=${conversationId}`);
      } else {
        toast.error(res.error || "Failed to initiate chat");
      }
    } catch {
      toast.error("An error occurred while opening chat");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      size={size}
      variant={variant}
      className={cn(
        "rounded-xl",
        variant === "ghost" &&
          "h-8 w-8 p-0 text-indigo-600 hover:text-indigo-700 hover:bg-white hover:border-slate-200 border border-transparent shadow-sm",
        className
      )}
      onClick={handleContact}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <MessageCircle className={cn("h-4 w-4", !showIconOnly && "mr-2")} />
          {!showIconOnly && label}
        </>
      )}
    </Button>
  );
}
