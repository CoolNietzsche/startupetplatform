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
  XSquare,
  History,
  Activity,
  Zap,
  ShieldAlert,
  ArrowRight,
  Clock,
  Terminal,
  Server,
  Database,
  Lock,
  Loader2,
  Settings,
  MoreVertical
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
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
  CardDescription, 
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

export default function SuperAdminNotificationsPage() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "unread" | "read">("all");
  const [markingAll, setMarkingAll] = useState(false);
  const isStakeholder = session?.user?.role === 'STAKEHOLDER';

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

  const handleToggleRead = async (id: string, currentStatus: boolean) => {
    if (currentStatus) return;

    const result = await markNotificationAsRead(id);
    if (result.success) {
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
    }
  };

  const handleMarkAllRead = async () => {
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
      case 'error': return <ShieldAlert className="h-5 w-5 text-rose-500" />;
      default: return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 py-8 px-4 animate-in fade-in duration-700">
      {/* Root Identification */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-slate-200 pb-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-xl shadow-slate-900/10">
                <Activity className="h-6 w-6 text-rose-500" />
             </div>
             <div className="flex flex-col">
                <p className="text-[10px] font-black italic text-slate-400 uppercase tracking-[0.4em] leading-none mb-1">
                  {isStakeholder ? "Institutional Alert Vector" : "Global System Monitoring"}
                </p>
                <h1 className="text-4xl font-black tracking-tighter text-slate-900 leading-none">
                  {isStakeholder ? "Notification Hub" : "Kernel Alerts Feed"}
                </h1>
             </div>
          </div>
          <p className="text-slate-500 font-medium text-lg max-w-2xl leading-relaxed mt-4">
             {isStakeholder 
               ? "Stay informed about organizational updates, application requests, and announcements relevant to your institution."
               : "Monitor system core functions, administrative overrides, and ecosystem-wide events with root-authority visibility."}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="outline" className="h-12 border-2 rounded-2xl font-black text-xs uppercase tracking-widest px-8 shadow-sm transition-all active:scale-95" onClick={fetchNotifications}>
             Sync Logs
          </Button>
          <Button 
            className="h-12 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest px-8 shadow-xl shadow-rose-600/20 transition-all active:scale-95 group"
            onClick={handleMarkAllRead}
            disabled={markingAll || notifications.every(n => n.isRead)}
          >
            {isStakeholder ? <CheckCheck className="mr-2 h-4 w-4" /> : <CheckCheck className="mr-2 h-4 w-4 transition-transform group-hover:scale-125" />}
            {isStakeholder ? "Clear All Notifications" : "Purge Unread Alert Queue"}
          </Button>
        </div>
      </div>

      {/* Grid of System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2rem] overflow-hidden group">
            <CardHeader className="pb-2">
               <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Monitor.Core</span>
                  <Server className="h-3.5 w-3.5 text-rose-500" />
               </div>
               <CardTitle className="text-3xl font-black tracking-tight mt-2">{notifications.length}</CardTitle>
               <CardDescription className="text-[10px] uppercase font-bold tracking-widest opacity-60">Log Entries</CardDescription>
            </CardHeader>
            <div className="h-1 w-full bg-slate-100 mt-2">
               <div className="h-full bg-rose-600 group-hover:w-full transition-all duration-1000" style={{ width: '40%' }} />
            </div>
          </Card>
          
          {!isStakeholder && (
            <>
              <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2rem] overflow-hidden group">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Alert.Queue</span>
                      <Zap className="h-3.5 w-3.5 text-amber-500" />
                  </div>
                  <CardTitle className="text-3xl font-black tracking-tight mt-2 text-rose-600">{notifications.filter(n => !n.isRead).length}</CardTitle>
                  <CardDescription className="text-[10px] uppercase font-bold tracking-widest opacity-60 font-black">Immediate Actions</CardDescription>
                </CardHeader>
                <div className="h-1 w-full bg-slate-100 mt-2">
                  <div className="h-full bg-amber-500 group-hover:w-full transition-all duration-1000" style={{ width: '65%' }} />
                </div>
              </Card>
              <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2rem] overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Security.Status</span>
                      <Lock className="h-3.5 w-3.5 text-emerald-500" />
                  </div>
                  <CardTitle className="text-3xl font-black tracking-tight mt-2 transition-transform hover:scale-105 duration-300">PROTECTED</CardTitle>
                  <CardDescription className="text-[10px] uppercase font-bold tracking-widest opacity-60">System Integrity: HIGH</CardDescription>
                </CardHeader>
                <div className="h-1 w-full bg-slate-100 mt-2">
                  <div className="h-full bg-emerald-500" style={{ width: '100%' }} />
                </div>
              </Card>
              <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2rem] overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Database.Sync</span>
                      <Database className="h-3.5 w-3.5 text-blue-500" />
                  </div>
                  <CardTitle className="text-3xl font-black tracking-tight mt-2">0.04ms</CardTitle>
                  <CardDescription className="text-[10px] uppercase font-bold tracking-widest opacity-60">Response Latency</CardDescription>
                </CardHeader>
                <div className="h-1 w-full bg-slate-100 mt-2 text-[#f8fafc]">
                  <div className="h-full bg-blue-500 w-[95%]" />
                </div>
              </Card>
            </>
          )}
        </div>

      {/* Control Tools */}
      <div className="bg-slate-950/5 p-3 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full group">
          <Terminal className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-rose-500 transition-colors" />
          <Input 
            placeholder={isStakeholder ? "Search notifications..." : "Query log parameters..."} 
            className="pl-14 h-16 border-none bg-transparent focus-visible:ring-0 text-xl placeholder:text-slate-300 font-bold tracking-tight"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex w-full md:w-auto bg-white p-2 rounded-[1.8rem] gap-1 shadow-sm border border-slate-100">
          {(["all", "unread", "read"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={cn(
                "flex-1 md:w-32 py-3 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all",
                activeFilter === filter 
                  ? "bg-slate-900 text-white shadow-xl shadow-slate-900/10" 
                  : "text-slate-400 hover:text-slate-700 hover:bg-slate-50"
              )}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* System Stream */}
      <div className="space-y-6">
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="bg-white p-10 rounded-[2.5rem] border-2 border-slate-50 flex gap-8">
               <Skeleton className="h-20 w-20 rounded-3xl" />
               <div className="space-y-4 flex-1">
                 <Skeleton className="h-8 w-1/3 rounded-xl" />
                 <Skeleton className="h-6 w-full rounded-xl" />
                 <Skeleton className="h-6 w-1/2 rounded-xl" />
               </div>
            </div>
          ))
        ) : filteredNotifications.length > 0 ? (
          <div className="grid gap-6">
            {filteredNotifications.map((notification) => (
              <div 
                key={notification.id}
                onClick={() => handleToggleRead(notification.id, notification.isRead)}
                className={cn(
                  "group relative bg-white border-2 p-10 rounded-[3rem] transition-all duration-500 cursor-pointer flex flex-col md:flex-row items-start md:items-center gap-10 overflow-hidden",
                  !notification.isRead 
                    ? "border-rose-100 shadow-2xl shadow-rose-900/5 hover:-translate-y-1.5 active:scale-[0.99]" 
                    : "border-slate-50 text-slate-400 shadow-sm opacity-80 hover:opacity-100"
                )}
              >
                {!notification.isRead && (
                   <div className="absolute top-0 left-0 w-2 h-full bg-rose-600" />
                )}
                
                <div className={cn(
                  "h-20 w-20 rounded-[2rem] flex items-center justify-center shrink-0 shadow-2xl transition-all group-hover:scale-110 group-hover:rotate-6 duration-700",
                  !notification.isRead ? "bg-slate-900 text-white shadow-slate-900/20" : "bg-slate-50 text-slate-300 shadow-none border border-slate-100"
                )}>
                  {getIcon(notification.type)}
                </div>

                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-4">
                     <span className={cn(
                       "text-[11px] font-black uppercase tracking-[0.3em] font-black",
                       !notification.isRead ? "text-rose-600" : "text-slate-400"
                     )}>
                        {isStakeholder ? "MESSAGE LOG" : "ENTRY LOG"} • ID-{notification.id.slice(0, 8)}
                     </span>
                     <Badge variant="outline" className={cn(
                       "rounded-full px-4 border-2 font-black text-[10px] tracking-widest",
                       !notification.isRead ? "border-rose-600 text-rose-600 bg-rose-50" : "border-slate-200 text-slate-400"
                     )}>
                        {notification.type.toUpperCase()}
                     </Badge>
                  </div>
                  
                  <h3 className={cn(
                    "text-2xl font-black tracking-tighter leading-none",
                    !notification.isRead ? "text-slate-950" : "text-slate-500"
                  )}>
                    {notification.title}
                  </h3>
                  
                  <p className={cn(
                    "text-lg leading-relaxed max-w-5xl",
                    !notification.isRead ? "text-slate-700 font-bold" : "text-slate-400 font-medium"
                  )}>
                    {notification.message}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-8 pt-6">
                    <div className="flex items-center gap-2.5 text-xs font-black text-slate-300 uppercase tracking-widest">
                       <History className="h-4 w-4" />
                       {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </div>
                    {notification.link && (
                      <Link 
                        href={notification.link}
                        className="flex items-center gap-2 text-xs font-black text-rose-600 uppercase tracking-[0.2em] group/link border-b-2 border-transparent hover:border-rose-600 transition-all"
                      >
                        {isStakeholder ? "View Details" : "Override & Access"}
                        <ArrowRight className="h-4 w-4 group-hover/link:translate-x-2 transition-all transition-transform" />
                      </Link>
                    )}
                  </div>
                </div>

                <div className="hidden md:flex opacity-0 group-hover:opacity-100 transition-opacity">
                   <Button variant="ghost" size="icon" className="h-14 w-14 rounded-full hover:bg-rose-50 hover:text-rose-600 transition-all">
                      <MoreVertical className="h-6 w-6" />
                   </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-40 flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in zoom-in duration-1000">
             <div className="h-32 w-32 rounded-[2.5rem] bg-slate-50 flex items-center justify-center border-4 border-white shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-rose-600/5 group-hover:scale-150 transition-transform duration-1000" />
                <CheckCircle2 className="h-14 w-14 text-slate-200 group-hover:text-rose-500 transition-colors" />
             </div>
             <div>
               <h2 className="text-3xl font-black text-slate-900 tracking-tighter italic leading-none">Global Queues Empty</h2>
               <p className="text-slate-400 font-bold uppercase text-xs tracking-[0.4em] mt-3">All sectors operational • system stable</p>
             </div>
             <Button 
                className="px-12 h-14 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-slate-800 transition-all active:scale-95 border-b-4 border-slate-950"
                onClick={() => {setActiveFilter("all"); setSearchQuery("");}}
             >
                Reset Kernel Filter
             </Button>
          </div>
        )}
      </div>

      {/* Power Footer */}
      <div className="py-10 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-slate-100 mt-20">
         <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
               <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
               <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Core Status: Stable</span>
            </div>
            <div className="flex items-center gap-2">
               <div className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
               <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Network: Encrypted</span>
            </div>
         </div>
         
         <div className="flex items-center gap-4">
            <div className="bg-slate-100 px-4 py-2 rounded-xl border border-slate-200 hidden md:block">
               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Environment: </span>
               <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest font-black">Production.Mainnet</span>
            </div>
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest"> &copy; 2025 Root Console v2.1</p>
         </div>
      </div>
    </div>
  );
}
