"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { 
  Bell, 
  Search, 
  CheckCheck, 
  Info, 
  AlertCircle, 
  CheckCircle2, 
  XCircle,
  Inbox,
  Clock,
  Loader2,
  ChevronRight,
  ShieldCheck,
  Zap,
  LayoutGrid
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { 
  getUserNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead 
} from "@/lib/notifications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link: string | null;
  createdAt: string | Date;
}

export default function CommitteeNotificationsPage() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "unread" | "read">("all");
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    const result = await getUserNotifications((session.user as any).id);
    if (result.success) {
      setNotifications(result.data as any);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, [session?.user?.id]);

  useEffect(() => {
    let result = notifications;

    if (activeFilter === "unread") {
      result = result.filter(n => !n.isRead);
    } else if (activeFilter === "read") {
      result = result.filter(n => n.isRead);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(n => 
        n.title.toLowerCase().includes(query) || 
        n.message.toLowerCase().includes(query)
      );
    }

    setFilteredNotifications(result);
  }, [notifications, activeFilter, searchQuery]);

  const handleMarkAsRead = async (id: string) => {
    const result = await markNotificationAsRead(id);
    if (result.success) {
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!session?.user?.id) return;
    setMarkingAll(true);
    const result = await markAllNotificationsAsRead((session.user as any).id);
    if (result.success) {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    }
    setMarkingAll(false);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="h-5 w-5 text-indigo-500" />;
      case 'warning': return <AlertCircle className="h-5 w-5 text-amber-500" />;
      case 'error': return <XCircle className="h-5 w-5 text-rose-500" />;
      default: return <Info className="h-5 w-5 text-slate-500" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-6 space-y-12 animate-in fade-in duration-1000">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
               <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-slate-900 uppercase">Reviewer Logs</h1>
          </div>
          <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-xl">
             Your activity stream for all committee reviews, application updates, and task assignments.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline"
            className="rounded-xl border-slate-200 h-12 px-6 font-bold shadow-sm"
            onClick={fetchNotifications}
          >
            Refresh
          </Button>
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700 text-white h-12 px-8 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-200 active:scale-95 transition-all"
            onClick={handleMarkAllAsRead}
            disabled={markingAll || notifications.every(n => n.isRead)}
          >
            {markingAll ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCheck className="mr-2 h-4 w-4" />}
            Clear Stream
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4 bg-slate-50 p-2 rounded-[2rem] border border-slate-200/60 shadow-inner">
         <div className="relative group flex-1 w-full">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
            <Input 
              placeholder="Search through logs..."
              className="h-14 pl-14 border-none bg-transparent focus-visible:ring-0 text-lg placeholder:text-slate-300 font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
         </div>
         <div className="flex p-1.5 bg-white rounded-2xl border border-slate-200 gap-1 min-w-[340px]">
            {(["all", "unread", "read"] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={cn(
                  "flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                  activeFilter === filter 
                    ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/20" 
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                )}
              >
                {filter}
              </button>
            ))}
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        {loading ? (
             Array(4).fill(0).map((_, i) => (
               <Skeleton key={i} className="h-32 w-full rounded-[2.5rem]" />
             ))
        ) : filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <div 
              key={notification.id}
              className={cn(
                "group relative bg-white border border-slate-200/60 p-8 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all duration-300 flex flex-col md:flex-row items-start md:items-center gap-8",
                !notification.isRead && "bg-gradient-to-br from-indigo-50/20 via-white to-white border-indigo-100"
              )}
            >
              <div className={cn(
                "h-16 w-16 rounded-2xl flex items-center justify-center shrink-0 shadow-lg border-2 transition-transform group-hover:scale-110",
                !notification.isRead ? "bg-white border-indigo-100 text-indigo-500" : "bg-slate-50 border-slate-100 text-slate-400"
              )}>
                {getIcon(notification.type)}
              </div>

              <div className="flex-1 space-y-2">
                 <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                       <h3 className={cn(
                         "text-xl font-black tracking-tight",
                         notification.isRead ? "text-slate-600" : "text-slate-900"
                       )}>
                         {notification.title}
                       </h3>
                       {!notification.isRead && (
                         <div className="flex items-center gap-1.5 bg-indigo-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-lg tracking-widest animate-pulse">
                           <Zap className="h-2 w-2 fill-white" />
                           Priority
                         </div>
                       )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                 </div>
                 
                 <p className={cn(
                   "text-base leading-relaxed max-w-4xl",
                   notification.isRead ? "text-slate-400 font-medium italic opacity-80" : "text-slate-700 font-semibold"
                 )}>
                   {notification.message}
                 </p>

                 <div className="flex items-center gap-4 pt-4">
                    {notification.link && (
                      <Link 
                        href={notification.link}
                        className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 flex items-center gap-1.5 hover:gap-3 transition-all"
                      >
                        Action Required <ChevronRight className="h-3 h-3" />
                      </Link>
                    )}
                    {!notification.isRead && (
                      <button 
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 hover:text-slate-900 transition-colors"
                      >
                        Acknowledge
                      </button>
                    )}
                 </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-32 flex flex-col items-center justify-center text-center space-y-6">
             <div className="h-24 w-24 bg-slate-50 rounded-[2rem] flex items-center justify-center border-4 border-white shadow-xl">
               <Inbox className="h-10 w-10 text-slate-200" />
             </div>
             <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Operational Void</h3>
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-2 max-w-[280px] mx-auto">
                  No active command signals or logs found in your sector.
                </p>
             </div>
             <Button 
              variant="outline" 
              className="rounded-xl px-12 h-12 font-black uppercase text-[10px] tracking-widest border-2 border-indigo-100 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all"
              onClick={() => {setActiveFilter("all"); setSearchQuery("");}}
             >
               Reset Signals
             </Button>
          </div>
        )}
      </div>

      {/* Meta Footer */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-8 mt-12 opacity-40 hover:opacity-100 transition-opacity">
         <div className="flex items-center gap-2">
            <LayoutGrid className="h-4 w-4 text-emerald-500" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol V3.2 Stable</span>
         </div>
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Ministry of Innovation & Technology</p>
      </div>
    </div>
  );
}
