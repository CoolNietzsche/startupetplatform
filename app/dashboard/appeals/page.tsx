"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { submitAppeal, getMyAppeals } from "./actions";
import { useToast } from "@/hooks/use-toast";

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "secondary",
  APPROVED: "default",
  REJECTED: "destructive",
};

export default function AppealsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [appeals, setAppeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [applicationId, setApplicationId] = useState("");
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      getMyAppeals(session.user.id)
        .then(setAppeals)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitAppeal(applicationId, reason, details || undefined);
      toast({ title: "Appeal submitted", variant: "default" });
      setShowForm(false);
      setApplicationId("");
      setReason("");
      setDetails("");
      if (session?.user?.id) {
        const updated = await getMyAppeals(session.user.id);
        setAppeals(updated);
      }
    } catch (err: any) {
      toast({ title: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Appeals</h1>
          <p className="text-muted-foreground">Manage your application appeals</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Submit Appeal"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Submit Appeal</CardTitle>
            <CardDescription>Fill in the details to submit a new appeal</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Application ID</label>
                <input
                  type="text"
                  value={applicationId}
                  onChange={(e) => setApplicationId(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Reason</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Details (optional)</label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                  rows={4}
                />
              </div>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <p className="text-muted-foreground">Loading appeals...</p>
      ) : appeals.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No appeals found.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {appeals.map((appeal) => (
            <Card key={appeal.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div className="space-y-1">
                  <p className="font-medium">{appeal.reason}</p>
                  <p className="text-sm text-muted-foreground">
                    Application: {appeal.application?.startupName || appeal.applicationId}
                  </p>
                  {appeal.details && (
                    <p className="text-sm text-muted-foreground">{appeal.details}</p>
                  )}
                </div>
                <Badge variant={statusVariant[appeal.status] || "outline"}>
                  {appeal.status}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
