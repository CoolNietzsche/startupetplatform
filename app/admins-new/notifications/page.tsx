"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { 
  Bell, 
  Search, 
  Filter, 
  CheckCheck, 
  Info, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  Clock,
  Inbox,
  Loader2,
  ChevronRight,
  ExternalLink
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
import { Separator } from "@/components/ui/separator";
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

export default function AdminNotificationsPage() {
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

    // Apply Filter
    if (activeFilter === "unread") {
      result = result.filter(n => !n.isRead);
    } else if (activeFilter === "read") {
      result = result.filter(n => n.isRead);
    }

    // Apply Search
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
      case 'success': return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'error': return <XCircle className="h-5 w-5 text-rose-500" />;
      default: return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-4 md:p-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-2">Notifications History</h1>
          <p className="text-slate-500 font-medium">Keep track of all system activities and updates</p>
        </div>
        <Button 
          variant="outline" 
          onClick={handleMarkAllAsRead} 
          disabled={markingAll || notifications.filter(n => !n.isRead).length === 0}
          className="rounded-2xl border-slate-200 hover:bg-slate-50 gap-2 h-11 px-6 transition-all"
        >
          {markingAll ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCheck className="h-4 w-4" />}
          Mark all as read
        </Button>
      </div>

      <Card className="border-slate-200/60 shadow-xl shadow-slate-200/30 overflow-hidden rounded-[2rem]">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
          <div className="flex flex-col lg:flex-row gap-6 justify-between">
            <div className="flex bg-white p-1 rounded-2xl border border-slate-200/60 w-fit">
              {(["all", "unread", "read"] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={cn(
                    "px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                    activeFilter === filter 
                      ? "bg-slate-900 text-white shadow-lg" 
                      : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  {filter}
                </button>
              ))}
            </div>

            <div className="relative group max-w-md w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <Input
                placeholder="Search history..."
                className="pl-11 h-12 rounded-2xl border-slate-200 focus:ring-4 focus:ring-blue-500/5 transition-all bg-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <div key={i} className="p-8 flex gap-6">
                  <Skeleton className="h-10 w-10 rounded-xl" />
                  <div className="space-y-3 flex-1">
                    <Skeleton className="h-5 w-1/3 rounded-lg" />
                    <Skeleton className="h-4 w-2/3 rounded-lg" />
                  </div>
                </div>
              ))
            ) : filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={cn(
                    "p-8 flex flex-col sm:flex-row gap-6 transition-all border-l-4",
                    notification.isRead ? "border-transparent opacity-70" : "border-blue-500 bg-blue-50/10"
                  )}
                >
                  <div className="flex-shrink-0">
                    <div className={cn(
                      "h-12 w-12 rounded-2xl flex items-center justify-center shadow-sm border",
                      notification.isRead ? "bg-slate-50 border-slate-200" : "bg-white border-blue-100 shadow-blue-200/20"
                    )}>
                      {getIcon(notification.type)}
                    </div>
                  </div>
                  
                  <div className="flex-grow space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h3 className={cn("text-base font-bold", notification.isRead ? "text-slate-600" : "text-slate-900")}>
                        {notification.title}
                      </h3>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </span>
                        {!notification.isRead && (
                          <Badge variant="info" className="text-[9px] font-black uppercase tracking-tighter px-2 h-5">NEW</Badge>
                        )}
                      </div>
                    </div>
                    
                    <p className={cn("text-sm leading-relaxed max-w-3xl", notification.isRead ? "text-slate-500" : "text-slate-700")}>
                      {notification.message}
                    </p>

                    <div className="flex items-center gap-4 pt-2">
                      {notification.link && (
                        <Link 
                          href={notification.link}
                          className="text-xs font-black text-blue-600 uppercase tracking-widest hover:underline flex items-center gap-1.5"
                        >
                          View Activity <ChevronRight className="h-3 w-3" />
                        </Link>
                      )}
                      {!notification.isRead && (
                        <button 
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors"
                        >
                          Dismiss
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-20 flex flex-col items-center justify-center text-center space-y-4">
                <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <Inbox className="h-10 w-10 text-slate-200" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">Zero Activity Found</h3>
                <p className="text-slate-500 max-w-xs font-medium">You've cleared your inbox or no notifications match your filter.</p>
                <Button variant="outline" onClick={() => setActiveFilter("all")} className="rounded-xl px-8 h-10 font-bold border-slate-200 uppercase text-[10px] tracking-widest">
                  Reset Filters
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
           <div className="flex items-center gap-3 mb-3">
             <div className="h-8 w-8 bg-white rounded-xl flex items-center justify-center border border-slate-200">
               <Bell className="h-3.5 w-3.5 text-slate-400" />
             </div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Updates</p>
           </div>
           <p className="text-xs font-medium text-slate-600 leading-relaxed">
             Notifications include application submissions, reviews, and committee assignments.
           </p>
        </div>
        {/* Placeholder for more meta-info if needed */}
      </div>
    </div>
  );
}
