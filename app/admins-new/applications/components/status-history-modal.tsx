"use client";

import React from 'react';
import { 
  History,
  Clock,
  User,
  MessageSquare
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow, format } from "date-fns";

interface StatusHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: {
    id: string;
    name: string;
    history?: any[];
  } | null;
}

export function StatusHistoryModal({ 
  isOpen, 
  onClose, 
  application 
}: StatusHistoryModalProps) {
  if (!application) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Status History: {application.name}
          </DialogTitle>
          <DialogDescription>
            Chronological log of all status changes and actions.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {application.history && application.history.length > 0 ? (
            <div className="relative ml-4 border-l border-slate-200 pl-8 space-y-8">
              {application.history.map((item, index) => (
                <div key={item.id || index} className="relative">
                  {/* Timeline Dot */}
                  <div className="absolute -left-[41px] top-1 h-5 w-5 rounded-full border-4 border-white bg-primary shadow-sm" />
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="font-bold">
                        {item.status.replaceAll("_", " ")}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                      </span>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                      <div className="flex items-start gap-2 mb-2">
                        <User className="h-3.5 w-3.5 mt-0.5 text-slate-400" />
                        <span className="text-xs font-medium text-slate-600">
                          {item.changedBy ? `${item.changedBy.firstName} ${item.changedBy.lastName}` : "System / Administrator"}
                        </span>
                      </div>
                      
                      {item.comment && (
                        <div className="flex items-start gap-2">
                          <MessageSquare className="h-3.5 w-3.5 mt-0.5 text-slate-400" />
                          <p className="text-sm text-slate-700 leading-relaxed italic">
                            "{item.comment}"
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-[10px] text-slate-400 font-medium px-1">
                      {format(new Date(item.createdAt), "PPP p")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <History className="h-10 w-10 mx-auto mb-2 opacity-20" />
              <p>No history records found for this application.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
