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
  ChevronRight,
  Loader2,
  Building2,
  Zap,
  ArrowRight
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

export default function EcosystemNotificationsPage() {
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
      case 'success': return <CheckCircle2 className="h-5 w-5 text-blue-500" />;
      case 'warning': return <AlertCircle className="h-5 w-5 text-amber-500" />;
      case 'error': return <XCircle className="h-5 w-5 text-rose-500" />;
      default: return <Info className="h-5 w-5 text-slate-500" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-6 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
             <div className="bg-blue-600 h-2 w-2 rounded-full animate-ping" />
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600">Sync Status: Live</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-900 flex items-center gap-3">
             <Bell className="h-8 w-8 text-blue-600" />
             Notifications
          </h1>
          <p className="text-slate-500 font-medium max-w-lg">
             Manage your ecosystem builder activity, review application updates, and task assignments.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline"
            className="rounded-xl border-slate-200 font-bold"
            onClick={handleMarkAllAsRead}
            disabled={markingAll || notifications.every(n => n.isRead)}
          >
            {markingAll ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCheck className="mr-2 h-4 w-4" />}
            Clear All
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 px-1">Views</p>
            <div className="flex flex-col gap-1">
              {(["all", "unread", "read"] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={cn(
                    "flex items-center justify-between px-4 py-3 rounded-xl transition-all font-bold text-sm",
                    activeFilter === filter 
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                      : "text-slate-500 hover:bg-slate-100"
                  )}
                >
                  <span className="capitalize">{filter} Only</span>
                  {filter === 'all' && <Badge variant="outline" className="text-[10px] bg-white/20 border-white/30 text-white font-black">{notifications.length}</Badge>}
                  {filter === 'unread' && <Badge variant="outline" className={cn("text-[10px] font-black", activeFilter === 'unread' ? "bg-white/20 text-white" : "bg-blue-50 text-blue-600 border-blue-100")}>{notifications.filter(n => !n.isRead).length}</Badge>}
                </button>
              ))}
            </div>
          </div>

          <Card className="border-slate-100 bg-slate-50/50 p-6 rounded-3xl">
             <div className="flex items-center gap-3 mb-4">
                <Building2 className="h-5 w-5 text-blue-600" />
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-800">Ecosystem Hub</p>
             </div>
             <p className="text-xs leading-relaxed text-slate-500 font-medium">
                Your notifications are curated based on your ecosystem builder status and assigned programs.
             </p>
          </Card>
        </div>

        {/* Content Area */}
        <div className="md:col-span-3 space-y-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <Input 
              placeholder="Search through notifications..."
              className="h-12 pl-11 rounded-2xl border-slate-200 bg-white/50 focus:bg-white transition-all shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {loading ? (
             Array(4).fill(0).map((_, i) => (
               <Skeleton key={i} className="h-32 w-full rounded-[2rem]" />
             ))
          ) : filteredNotifications.length > 0 ? (
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={cn(
                    "group bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm hover:shadow-xl hover:shadow-blue-600/5 hover:-translate-y-0.5 transition-all duration-300",
                    !notification.isRead && "border-blue-100 ring-2 ring-blue-600/5 bg-gradient-to-br from-blue-50/20 via-white to-white"
                  )}
                >
                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className={cn(
                      "h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border transition-transform group-hover:rotate-6",
                      !notification.isRead ? "bg-white border-blue-100 text-blue-500" : "bg-slate-50 border-slate-100 text-slate-400"
                    )}>
                      {getIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 space-y-2">
                       <div className="flex flex-wrap items-center justify-between gap-2">
                          <h3 className={cn(
                            "text-lg font-black tracking-tight",
                            notification.isRead ? "text-slate-600" : "text-slate-900"
                          )}>
                            {notification.title}
                          </h3>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold text-slate-300 flex items-center gap-1.5 whitespace-nowrap">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                       </div>
                       
                       <p className={cn(
                         "text-sm leading-relaxed",
                         notification.isRead ? "text-slate-500 font-medium" : "text-slate-700 font-semibold"
                       )}>
                         {notification.message}
                       </p>

                       <div className="pt-3 flex items-center gap-4">
                          {notification.link && (
                            <Link 
                              href={notification.link}
                              className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 flex items-center gap-1.5 hover:gap-3 transition-all"
                            >
                              Explore Activity <ArrowRight className="h-3 w-3" />
                            </Link>
                          )}
                          {!notification.isRead && (
                            <button 
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900"
                            >
                              Acknowledge
                            </button>
                          )}
                       </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-24 flex flex-col items-center justify-center text-center space-y-4">
               <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center border-4 border-white shadow-xl">
                 <Inbox className="h-10 w-10 text-slate-200" />
               </div>
               <div>
                  <h3 className="text-xl font-black text-slate-900">Quiet for now</h3>
                  <p className="text-sm font-medium text-slate-400 mt-1 max-w-[240px]">
                    No notifications matching your current filters were found.
                  </p>
               </div>
               <Button 
                variant="outline" 
                className="rounded-xl px-8 h-10 font-bold uppercase text-[10px] tracking-widest border-2"
                onClick={() => {setActiveFilter("all"); setSearchQuery("");}}
               >
                 View All History
               </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
