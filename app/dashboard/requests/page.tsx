import React from "react";
import Link from "next/link";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ArrowUpRight 
} from "lucide-react";
import { RequestModal } from "@/components/dashboard/request-modal";
import { getMyFormalRequests } from "./actions";

export const dynamic = "force-dynamic";

export default async function RequestsPage() {
  const res = await getMyFormalRequests();
  const requests = (res.success && res.data) ? res.data : [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 uppercase font-black text-[9px]">Pending</Badge>;
      case "ACCEPTED":
        return <Badge variant="outline" className="bg-[#EFFFF6] text-[#00C076] border-[#00C076]/20 uppercase font-black text-[9px]">Accepted</Badge>;
      case "REJECTED":
        return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 uppercase font-black text-[9px]">Rejected</Badge>;
      case "CANCELLED":
        return <Badge variant="outline" className="bg-slate-100 text-slate-500 border-slate-200 uppercase font-black text-[9px]">Cancelled</Badge>;
      default:
        return <Badge variant="outline" className="uppercase font-black text-[9px]">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-4 w-4 text-amber-500" />;
      case "ACCEPTED":
        return <CheckCircle2 className="h-4 w-4 text-[#00C076]" />;
      case "REJECTED":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "CANCELLED":
        return <ArrowUpRight className="h-4 w-4 text-slate-400 rotate-180" />;
      default:
        return <FileText className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter text-brand-deep-dark">
            Formal <span className="text-brand-mint-teal italic">Requests</span>
          </h1>
          <p className="text-slate-500 font-bold text-sm tracking-tight">
            Manage official communications and support requests with stakeholders.
          </p>
        </div>
        <RequestModal />
      </div>

      <Card className="border border-slate-200 shadow-xl shadow-slate-200/80 bg-white overflow-hidden">
        <CardHeader className="border-b border-slate-50 bg-slate-50/30">
          <CardTitle className="text-lg font-black tracking-tight text-brand-deep-dark flex items-center gap-2">
            <FileText className="h-5 w-5 text-brand-mint-teal" />
            Request History
          </CardTitle>
          <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Tracking your formal ecosystem engagement
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="w-[100px] text-[10px] font-black uppercase tracking-widest text-slate-500 px-6 py-4">Status</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-6">Subject</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-6">Recipient</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-6">Date</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-6 text-right px-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id} className="group border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <TableCell className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(request.status)}
                      {getStatusBadge(request.status)}
                    </div>
                  </TableCell>
                  <TableCell className="px-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-brand-deep-dark group-hover:text-brand-mint-teal transition-colors">
                        {request.subject}
                      </span>
                      {request.rejectionReason && (
                        <span className="text-[10px] text-red-500 font-bold italic mt-1">
                          Reason: {request.rejectionReason}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-6">
                    <span className="text-sm font-bold text-slate-600">{(request.recipient as any).name}</span>
                  </TableCell>
                  <TableCell className="px-6">
                    <span className="text-xs font-bold text-slate-400">
                      {request.createdAt.toLocaleDateString()}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 text-right">
                    <Button asChild variant="outline" size="sm" className="rounded-xl font-black text-[10px] uppercase tracking-widest border-slate-200">
                      <Link href={`/dashboard/requests/${request.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {requests.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="p-4 rounded-full bg-slate-50">
                        <FileText className="h-8 w-8 text-slate-200" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-black text-slate-400 uppercase tracking-widest text-xs">No formal requests sent yet.</p>
                        <p className="text-slate-300 text-[10px] font-bold">Use the button above to initiate your first official communication.</p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
