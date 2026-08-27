"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquarePlus } from "lucide-react";
import { requestClarification } from "@/lib/actions/clarification";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export function RequestClarificationModal({ 
  applicationId,
  ecoApplicationId,
  open,
  onOpenChange
}: { 
  applicationId?: string;
  ecoApplicationId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!topic || !message) return toast.error("Please fill in all fields.");

    setLoading(true);
    const result = await requestClarification({
      applicationId,
      ecoApplicationId,
      topic,
      messageContent: message,
    });

    if (result.success) {
      toast.success("Clarification thread opened & applicant notified!");
      onOpenChange(false);
      setTopic("");
      setMessage("");
      // Router refresh helps ensure the application status label changes on page
      router.refresh();
      // Optionally forward the admin straight into the inbox
      router.push(`/admins-new/messages`);
    } else {
      toast.error(result.error || "Failed to process request");
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] border-slate-100 shadow-xl rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-slate-800">
            <MessageSquarePlus className="w-5 h-5 text-blue-600" />
            Request Clarification
          </DialogTitle>
          <DialogDescription>
            This action pauses the application and creates a real-time messaging thread to request specific information or documents from the applicant.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="topic" className="font-bold text-slate-700">Subject / Topic</Label>
            <Input 
              id="topic"
              placeholder="e.g. Missing Financial Document" 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="rounded-xl border-slate-200"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message" className="font-bold text-slate-700">Detailed Message</Label>
            <Textarea 
              id="message"
              placeholder="Explain what is missing so the applicant knows what to upload..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[120px] rounded-xl border-slate-200"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" className="font-bold text-slate-500 rounded-xl" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md"
            disabled={loading || !topic || !message}
            onClick={handleSubmit}
          >
            {loading ? "Processing..." : "Open Thread & Notify"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
