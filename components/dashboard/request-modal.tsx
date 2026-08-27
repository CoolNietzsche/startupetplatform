"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileUploader } from "@/components/ui/file-uploader";
import { toast } from "sonner";
import { PlusCircle, Loader2, Send } from "lucide-react";
import { getAvailableStakeholders, submitFormalRequest } from "@/app/dashboard/requests/actions";

export function RequestModal() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stakeholders, setStakeholders] = useState<any[]>([]);
  const [form, setForm] = useState({
    subject: "",
    body: "",
    recipientStakeholderId: "",
    attachmentFileIds: [] as string[],
  });

  useEffect(() => {
    if (open) {
      const fetchStakeholders = async () => {
        const res = await getAvailableStakeholders();
        if (res.success) {
          setStakeholders(res.data);
        }
      };
      fetchStakeholders();
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject || !form.body || !form.recipientStakeholderId) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await submitFormalRequest({
        ...form,
        attachmentFileId: form.attachmentFileIds[0] || undefined,
      });

      if (res.success) {
        toast.success("Formal request submitted successfully.");
        setOpen(false);
        setForm({
          subject: "",
          body: "",
          recipientStakeholderId: "",
          attachmentFileIds: [],
        });
      } else {
        toast.error(res.message || "Failed to submit request.");
      }
    } catch (err) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#00C076] hover:bg-[#00B06C] text-white font-black uppercase tracking-widest gap-2 rounded-xl shadow-lg shadow-emerald-500/20 px-6">
          <PlusCircle className="h-4 w-4" />
          New Formal Request
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[95vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-2 shrink-0">
          <DialogTitle className="text-2xl font-black text-brand-deep-dark tracking-tight">Formal Request</DialogTitle>
          <DialogDescription>
            Submit a formal request to a stakeholder. You can attach a PDF document for support.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-2">
          <form id="formal-request-form" onSubmit={handleSubmit} className="space-y-6 pt-4 pb-6">
            <div className="space-y-2">
              <Label htmlFor="stakeholder" className="text-xs font-black uppercase tracking-widest text-slate-500">To Stakeholder</Label>
              <Select 
                onValueChange={(val) => setForm({ ...form, recipientStakeholderId: val })}
                value={form.recipientStakeholderId}
              >
                <SelectTrigger className="h-12 border-slate-200 focus:ring-brand-mint-teal transition-all">
                  <SelectValue placeholder="Select a stakeholder organization" />
                </SelectTrigger>
                <SelectContent>
                  {stakeholders.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} <span className="text-[10px] text-slate-400 ml-2">({s.type})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject" className="text-xs font-black uppercase tracking-widest text-slate-500">Subject</Label>
              <Input
                id="subject"
                placeholder="Enquiry regarding innovation grant"
                className="h-12 border-slate-200 focus:ring-brand-mint-teal transition-all"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
              />
            </div>

            <div className="space-y-2 relative">
              <div className="flex justify-between items-center">
                <Label htmlFor="body" className="text-xs font-black uppercase tracking-widest text-slate-500">Message Body</Label>
                <span className={`text-[10px] font-bold ${form.body.length > 2000 ? 'text-red-500' : 'text-slate-400'}`}>
                  {form.body.length} / 2000
                </span>
              </div>
              <Textarea
                id="body"
                placeholder="Provide detailed information about your request..."
                className="min-h-[150px] border-slate-200 focus:ring-brand-mint-teal transition-all resize-none"
                value={form.body}
                maxLength={2000}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <FileUploader
                label="Attachments (PDF Only)"
                maxFiles={1}
                acceptedTypes={[".pdf"]}
                value={form.attachmentFileIds}
                onChange={(ids) => setForm({ ...form, attachmentFileIds: ids })}
              />
            </div>
          </form>
        </div>

        <DialogFooter className="shrink-0 border-t border-slate-100 px-6 py-4 bg-slate-50/50">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
            className="font-bold border-slate-200"
          >
            Cancel
          </Button>
          <Button
            form="formal-request-form"
            type="submit"
            disabled={loading}
            className="bg-brand-deep-dark hover:bg-brand-deep-dark/90 text-white font-black uppercase tracking-widest px-8"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <div className="flex items-center gap-2">
                <Send className="h-4 w-4" />
                Submit Request
              </div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
