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
  ArrowRight,
  Clock,
  Loader2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/lib/notifications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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

export default function StartupNotificationsPage() {
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
      case 'warning': return <AlertCircle className="h-5 w-5 text-amber-500" />;
      case 'error': return <XCircle className="h-5 w-5 text-rose-500" />;
      default: return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'success': return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-semibold px-2 py-0.5">Success</Badge>;
      case 'warning': return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] font-semibold px-2 py-0.5">Update</Badge>;
      case 'error': return <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 text-[10px] font-semibold px-2 py-0.5">Urgent</Badge>;
      default: return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-semibold px-2 py-0.5">Alert</Badge>;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 sm:px-6 py-4 sm:py-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-brand-deep-dark flex items-center gap-2 sm:gap-3">
            <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-brand-startup-amber shrink-0" />
            <span>Notifications</span>
            {unreadCount > 0 && (
              <span className="text-xs sm:text-sm font-semibold bg-brand-startup-amber/10 text-brand-startup-amber px-2 sm:px-3 py-0.5 rounded-full border border-brand-startup-amber/20 whitespace-nowrap">
                {unreadCount} new
              </span>
            )}
          </h1>

        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchNotifications}
            className="border-brand-startup-amber/20 text-brand-deep-dark hover:bg-brand-startup-amber/5 flex-1 sm:flex-initial"
          >
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={handleMarkAllRead}
            disabled={markingAll || unreadCount === 0}
            className="bg-brand-deep-dark hover:bg-brand-deep-dark/90 text-white flex-1 sm:flex-initial"
          >
            {markingAll ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <CheckCheck className="mr-1 h-4 w-4" />}
            <span className="hidden sm:inline">Mark All Read</span>
            <span className="sm:hidden">Mark Read</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notifications..."
            className="pl-10 h-10 border-brand-startup-amber/10 focus-visible:border-brand-startup-amber/30"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex bg-muted/50 rounded-lg p-1 gap-1 w-full sm:w-auto">
          {(["all", "unread", "read"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={cn(
                "flex-1 sm:flex-initial sm:px-4 py-2 text-xs font-semibold rounded-md transition-all capitalize",
                activeFilter === filter
                  ? "bg-white text-brand-deep-dark shadow-sm border border-brand-startup-amber/10"
                  : "text-muted-foreground hover:text-brand-deep-dark"
              )}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <Card key={i} className="border-2 border-brand-startup-amber/5 rounded-[20px] sm:rounded-[24px] p-4 sm:p-5">
              <div className="flex gap-3 sm:gap-4 items-center">
                <Skeleton className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-1/3 rounded" />
                  <Skeleton className="h-3 w-2/3 rounded" />
                </div>
              </div>
            </Card>
          ))
        ) : filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => handleToggleRead(notification.id, notification.isRead)}
              className={cn(
                "border-2 rounded-[20px] sm:rounded-[24px] p-4 sm:p-5 transition-all duration-200 cursor-pointer",
                !notification.isRead
                  ? "border-brand-startup-amber/20 bg-brand-startup-amber/[0.02]"
                  : "border-brand-startup-amber/5 bg-white hover:border-brand-startup-amber/10 hover:shadow-sm"
              )}
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <div className={cn(
                  "h-10 w-10 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center shrink-0",
                  !notification.isRead ? "bg-brand-startup-amber/10" : "bg-muted"
                )}>
                  {getIcon(notification.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                    <h3 className={cn(
                      "text-sm font-semibold truncate max-w-[200px] sm:max-w-none",
                      !notification.isRead ? "text-brand-deep-dark" : "text-muted-foreground"
                    )}>
                      {notification.title}
                    </h3>
                    {getTypeBadge(notification.type)}
                    {!notification.isRead && (
                      <span className="h-2 w-2 rounded-full bg-brand-startup-amber shrink-0" />
                    )}
                  </div>
                  <p className={cn(
                    "text-xs sm:text-sm leading-relaxed line-clamp-2 sm:line-clamp-none",
                    !notification.isRead ? "text-brand-deep-dark/80" : "text-muted-foreground"
                  )}>
                    {notification.message}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 shrink-0" />
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </span>
                    {notification.link && (
                      <Link
                        href={notification.link}
                        className="flex items-center gap-1 text-xs font-semibold text-brand-startup-amber hover:text-brand-startup-amber/80 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View details
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <Card className="border-2 border-brand-startup-amber/5 rounded-[24px] sm:rounded-[32px]">
            <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16 px-6 text-center">
              <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-brand-startup-amber/5 flex items-center justify-center mb-4">
                <Inbox className="h-6 w-6 sm:h-8 sm:w-8 text-brand-startup-amber/40" />
              </div>
              <CardTitle className="text-base sm:text-lg text-brand-deep-dark mb-1">All caught up</CardTitle>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-xs sm:max-w-sm">
                {searchQuery || activeFilter !== "all"
                  ? "No notifications match your current filters."
                  : "You don't have any notifications yet. They'll appear here when there's activity."}
              </p>
              {(searchQuery || activeFilter !== "all") && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 border-brand-startup-amber/20 text-brand-deep-dark"
                  onClick={() => { setActiveFilter("all"); setSearchQuery(""); }}
                >
                  Clear filters
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
