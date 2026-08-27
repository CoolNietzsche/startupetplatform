"use client";

import React, { useState } from 'react';
import { FileText, Upload, Loader2, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FileUploader } from "@/components/ui/file-uploader";
import { toast } from "sonner";

export default function SubmitReportPage() {
  const [reportType, setReportType] = useState("STARTUP_PROGRESS");
  const [notes, setNotes] = useState("");
  const [fileIds, setFileIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (fileIds.length === 0) {
      toast.error("Please upload a report file");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/reports/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportType, notes, fileIds }),
      });
      if (res.ok) {
        toast.success(`${reportType === "STARTUP_PROGRESS" ? "Startup Progress" : "Incubation Progress"} report submitted (Art. 19.5/20.5)`);
        setNotes("");
        setFileIds([]);
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to submit report");
      }
    } catch {
      toast.error("Failed to submit report");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Submit Report</h1>
        <p className="text-sm text-muted-foreground">Quarterly progress and incubation reports per Art. 19.5, 20.5</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Report Details</CardTitle>
          <CardDescription>Reports are due quarterly within 15 days after each period ends</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Report Type</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="STARTUP_PROGRESS">Startup Progress Report (Art. 19.5)</SelectItem>
                <SelectItem value="INCUBATION_PROGRESS">Incubation Progress Report (Art. 20.5)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Report File (PDF, DOC, XLS up to 10MB)</Label>
            <FileUploader value={fileIds} onChange={setFileIds} maxFiles={1} maxSize={10 * 1024 * 1024} acceptedTypes={["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"]} />
          </div>
          <div>
            <Label>Notes / Summary</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} placeholder="Brief summary of progress, KPIs, milestones achieved..." />
          </div>
          <Button className="w-full" onClick={handleSubmit} disabled={submitting || fileIds.length === 0}>
            {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            {submitting ? "Submitting..." : "Submit Report"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">Report Schedule</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p><strong>Startup Progress (Art. 19.5):</strong> Quarterly — due 15 days after each quarter</p>
          <p><strong>Incubation Progress (Art. 20.5):</strong> Quarterly — due 15 days after each quarter</p>
        </CardContent>
      </Card>
    </div>
  );
}
