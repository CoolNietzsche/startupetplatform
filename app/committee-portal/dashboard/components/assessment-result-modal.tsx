"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  TrendingUp,
  User,
  Star,
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
} from "lucide-react";
import { getAssessmentResults } from "../actions";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AssessmentResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string | null;
  entityType?: "ecosystem" | "startup";
}

export function AssessmentResultModal({
  isOpen,
  onClose,
  applicationId,
  entityType = "ecosystem",
}: AssessmentResultModalProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (isOpen && applicationId) {
      fetchResults();
    }
  }, [isOpen, applicationId, entityType]);

  const fetchResults = async () => {
    setLoading(true);
    const result = await getAssessmentResults(applicationId!, entityType);
    if (result.success) {
      setData(result.data);
    }
    setLoading(false);
  };

  const getRecommendationBadge = (rec: string) => {
    switch (rec) {
      case "APPROVE":
        return (
          <Badge className="bg-green-100 text-green-800">
            <ThumbsUp className="w-3 h-3 mr-1" /> Approve
          </Badge>
        );
      case "REJECT":
        return (
          <Badge className="bg-red-100 text-red-800">
            <ThumbsDown className="w-3 h-3 mr-1" /> Reject
          </Badge>
        );
      case "MORE_INFO":
        return (
          <Badge className="bg-amber-100 text-amber-800">
            <HelpCircle className="w-3 h-3 mr-1" /> More Info
          </Badge>
        );
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Assessment Results: {data?.applicationName}</DialogTitle>
          <DialogDescription>
            Detailed scores and recommendations from the committee:{" "}
            {data?.committeeName}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">
              Gathering committee evaluations...
            </p>
          </div>
        ) : data ? (
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-8 py-4">
              {/* Overall Summary Card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-amber-50 rounded-lg p-6 flex flex-col items-center justify-center border border-amber-100">
                  <span className="text-sm text-muted-foreground mb-2">
                    Avg. Excellence Rating
                  </span>
                  <div className="text-4xl font-bold text-amber-600">
                    {(data.overallAverageRating ?? 0).toFixed(1)}
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">
                    out of 5.0
                  </span>
                  <Progress
                    value={(data.overallAverageRating ?? 0) * 20}
                    className="h-2 w-full mt-4"
                  />
                </div>

                <div className="bg-primary/5 rounded-lg p-6 flex flex-col items-center justify-center border border-primary/10">
                  <span className="text-sm text-muted-foreground mb-2">
                    Avg. Total Valuation
                  </span>
                  <div className="text-4xl font-bold text-primary">
                    {(data.overallAverageValuation ?? 0).toFixed(0)}
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">
                    pts / {data.totalWeightAvailable ?? "—"} total
                  </span>
                  <Progress
                    value={
                      data.totalWeightAvailable > 0
                        ? ((data.overallAverageValuation ?? 0) /
                            data.totalWeightAvailable) *
                          100
                        : 0
                    }
                    className="h-2 w-full mt-4"
                  />
                </div>

                <div className="bg-secondary/5 rounded-lg p-6 col-span-1 border">
                  <h4 className="font-semibold mb-4 flex items-center text-sm">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Member Recommendations
                    <span className="ml-auto text-xs font-normal text-muted-foreground">
                      {data.memberResults.length} member
                      {data.memberResults.length !== 1 ? "s" : ""}
                    </span>
                  </h4>
                  <div className="space-y-2">
                    {data.memberResults.map((res: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-3 px-3 py-2 rounded-md bg-background border"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <User className="w-3.5 h-3.5 text-primary" />
                          </div>
                          <span className="text-sm font-medium truncate">
                            {res.memberName}
                          </span>
                        </div>
                        <div className="flex-shrink-0">
                          {getRecommendationBadge(res.recommendation)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Individual Member Table */}
              <div>
                <h4 className="font-semibold mb-4">Member Breakdown</h4>
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead>Committee Member</TableHead>
                        <TableHead className="text-center">
                          Avg. Rating
                        </TableHead>
                        <TableHead className="text-center">
                          Total Valuation
                        </TableHead>
                        <TableHead className="text-right">Verdict</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.memberResults.map((res: any, idx: number) => (
                        <TableRow key={idx} className="align-top">
                          <TableCell className="font-medium whitespace-nowrap align-top py-4">
                            <div className="flex flex-col">
                              <span>{res.memberName}</span>
                              <span className="text-xs text-muted-foreground mt-0.5">
                                {res.overallComment &&
                                res.overallComment.length > 60
                                  ? res.overallComment.substring(0, 60) + "..."
                                  : res.overallComment}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center align-top py-4">
                            <div className="flex items-baseline justify-center gap-1">
                              <span className="text-lg font-bold text-amber-500">
                                {(res.averageRating ?? 0).toFixed(1)}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                /5.0
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center align-top py-4">
                            <div className="flex items-baseline justify-center gap-1">
                              <span className="text-lg font-bold text-primary">
                                {res.totalValuation ?? 0}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                pts
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right align-top py-4">
                            {getRecommendationBadge(res.recommendation)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Criterion Average */}
              <div>
                <h4 className="font-semibold mb-4">Criterion Performance</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.criteria.map((c: any) => {
                    const avg =
                      data.memberResults.reduce((sum: number, r: any) => {
                        const score =
                          r.criteriaScores.find(
                            (cs: any) => cs.criterionId === c.id,
                          )?.score || 0;
                        return sum + score;
                      }, 0) / data.memberResults.length;

                    return (
                      <div key={c.id} className="p-4 rounded-lg border bg-card">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm font-medium">{c.name}</span>
                          <span className="text-xl font-bold text-primary">
                            {avg.toFixed(1)}
                          </span>
                        </div>
                        <Progress value={avg * 20} className="h-1.5" />
                      </div>
                    );
                  })}
                </div>
              </div>

              {data.decision && (
                <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-6">
                  <h4 className="font-semibold text-blue-900 mb-2">
                    Final Committee Decision
                  </h4>
                  <div className="flex items-center space-x-4 mb-4">
                    <Badge className="text-lg px-4 py-1">
                      {data.decision.finalDecision}
                    </Badge>
                  </div>
                  <p className="text-sm text-blue-800 italic">
                    "{data.decision.summary}"
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        ) : (
          <div className="py-12 text-center text-muted-foreground">
            No assessment data found.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
