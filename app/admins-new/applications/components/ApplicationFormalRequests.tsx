import React from "react";
import db from "@/lib/db";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText, Clock, CheckCircle2, XCircle, Paperclip } from "lucide-react";

export async function ApplicationFormalRequests({ startupId }: { startupId: string }) {
  const requests = await db.formalRequest.findMany({
    where: { senderId: startupId },
    include: {
      recipient: {
        select: { name: true },
      },
      attachment: {
        select: { originalName: true, id: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge className="bg-amber-100 text-amber-800 border-transparent text-[10px] uppercase font-bold">Pending</Badge>;
      case "ACCEPTED":
        return <Badge className="bg-[#EFFFF6] text-[#00C076] border-transparent text-[10px] uppercase font-bold">Accepted</Badge>;
      case "REJECTED":
        return <Badge className="bg-red-100 text-red-800 border-transparent text-[10px] uppercase font-bold">Rejected</Badge>;
      case "CANCELLED":
        return <Badge className="bg-slate-100 text-slate-500 border-transparent text-[10px] uppercase font-bold">Cancelled</Badge>;
      default:
        return <Badge className="text-[10px] uppercase font-bold">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Formal Request Oversight
        </CardTitle>
        <CardDescription>
          Monitor official communications between this startup and ecosystem stakeholders.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px] text-[10px] font-black uppercase tracking-widest px-6">Status</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest px-6">Subject</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest px-6">Recipient</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest px-6 text-right">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell className="px-6 py-4">
                  {getStatusBadge(request.status)}
                </TableCell>
                <TableCell className="px-6">
                  <div className="flex flex-col">
                    <span className="font-bold text-sm">{request.subject}</span>
                    {request.rejectionReason && (
                      <span className="text-[10px] text-red-500 font-medium">
                        Rejected: {request.rejectionReason}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="px-6">
                  <span className="text-sm font-medium">{request.recipient.name}</span>
                </TableCell>
                <TableCell className="px-6 text-right text-xs text-muted-foreground">
                  {request.createdAt.toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
            {requests.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-muted-foreground italic text-sm">
                  No formal requests recorded for this startup.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
