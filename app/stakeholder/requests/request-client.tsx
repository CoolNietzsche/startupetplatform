"use client";

import React from "react";
import {
  Card,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  FileText, 
  Clock, 
} from "lucide-react";
import Link from "next/link";

export default function StakeholderRequestsClient({ initialRequests }: { initialRequests: any[] }) {
  const requests = initialRequests;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge className="bg-amber-500 text-white border-transparent uppercase font-black text-[9px] tracking-widest px-3">Pending</Badge>;
      case "ACCEPTED":
        return <Badge className="bg-brand-mint-teal text-white border-transparent uppercase font-black text-[9px] tracking-widest px-3">Accepted</Badge>;
      case "REJECTED":
        return <Badge className="bg-rose-500 text-white border-transparent uppercase font-black text-[9px] tracking-widest px-3">Rejected</Badge>;
      case "CANCELLED":
        return <Badge className="bg-slate-500 text-white border-transparent uppercase font-black text-[9px] tracking-widest px-3">Cancelled</Badge>;
      default:
        return <Badge className="uppercase font-black text-[9px] tracking-widest px-3">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Inbox Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl lg:text-4xl font-black tracking-tighter text-brand-deep-dark">
            Incoming <span className="text-brand-mint-teal italic">Requests</span>
          </h1>
          <p className="text-slate-500 font-bold text-sm tracking-tight user-select-none">
            Review and respond to formal requests from ecosystem startups.
          </p>
        </div>
      </div>

      <Card className="border border-slate-200 shadow-xl shadow-slate-200/80 bg-white overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="hover:bg-transparent border-slate-100">
              <TableHead className="w-[100px] text-[10px] font-black uppercase tracking-widest text-[#2c3e50]/50 px-6 py-5">Status</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-[#2c3e50]/50 px-6">Startup</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-[#2c3e50]/50 px-6">Subject</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-[#2c3e50]/50 px-6 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id} className="group hover:bg-slate-50/50 transition-colors border-slate-50">
                <TableCell className="px-6 py-6">
                  {getStatusBadge(request.status)}
                </TableCell>
                <TableCell className="px-6">
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-brand-deep-dark uppercase tracking-tight">{request.sender.name}</span>
                    <span className="text-[10px] font-bold text-slate-400">{request.sender.user.email}</span>
                  </div>
                </TableCell>
                <TableCell className="px-6">
                  <span className="font-bold text-slate-700 tracking-tight">{request.subject}</span>
                </TableCell>
                <TableCell className="px-6 text-right">
                  <Button 
                    asChild
                    variant="outline" 
                    size="sm" 
                    className="border-slate-200 text-brand-deep-dark font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all rounded-xl"
                  >
                    <Link href={`/stakeholder/requests/${request.id}`}>
                      Review Request
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {requests.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="h-64 text-center">
                   <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="p-5 rounded-3xl bg-slate-50">
                        <FileText className="h-10 w-10 text-slate-200" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Inbox clear</p>
                        <p className="text-slate-300 text-[10px] font-bold">No incoming formal requests at this time.</p>
                      </div>
                   </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
