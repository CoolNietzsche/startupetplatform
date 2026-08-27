'use client';

import * as React from 'react';
import { 
  Bell, 
  CheckCheck, 
  ExternalLink, 
  Info, 
  AlertCircle, 
  CheckCircle2, 
  XCircle,
  Inbox,
  ArrowRight,
  Clock,
  Zap
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { 
  getUserNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead 
} from '@/lib/notifications';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link: string | null;
  createdAt: string | Date;
}

export function NotificationDropdown() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  const fetchNotifications = React.useCallback(async () => {
    if (!session?.user?.id) return;
    
    setLoading(true);
    const result = await getUserNotifications((session.user as any).id);
    if (result.success) {
      setNotifications(result.data as any);
      setUnreadCount((result.data as any).filter((n: any) => !n.isRead).length);
    }
    setLoading(false);
  }, [session?.user?.id]);

  React.useEffect(() => {
    fetchNotifications();
    
    const connectSSE = () => {
      const eventSource = new EventSource("/api/notifications/stream");

      eventSource.addEventListener("notification", (event: any) => {
        try {
          const data = JSON.parse(event.data);
          setNotifications(prev => {
            if (prev.some(n => n.id === data.id)) return prev;
            return [data, ...prev];
          });
          setUnreadCount(prev => prev + 1);
        } catch (error) {
          console.error("[SSE Dropdown] Failed to parse message:", error);
        }
      });

      eventSource.onerror = () => {
        eventSource?.close();
        setTimeout(connectSSE, 5000);
      };

      return eventSource;
    };

    const es = connectSSE();
    return () => es?.close();
  }, [fetchNotifications]);

  React.useEffect(() => {
    const handleNotificationsRead = () => fetchNotifications();
    window.addEventListener('notifications-read', handleNotificationsRead);
    return () => window.removeEventListener('notifications-read', handleNotificationsRead);
  }, [fetchNotifications]);

  const handleMarkAllAsRead = async () => {
    if (!session?.user?.id) return;
    const result = await markAllNotificationsAsRead((session.user as any).id);
    if (result.success) {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await markNotificationAsRead(notification.id);
      setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    if (notification.link) router.push(notification.link);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <div className="p-2 bg-emerald-50 rounded-xl"><CheckCircle2 className="h-4 w-4 text-emerald-500" /></div>;
      case 'warning': return <div className="p-2 bg-brand-startup-amber/10 rounded-xl"><AlertCircle className="h-4 w-4 text-brand-startup-amber" /></div>;
      case 'error': return <div className="p-2 bg-rose-500/10 rounded-xl"><XCircle className="h-4 w-4 text-rose-500" /></div>;
      default: return <div className="p-2 bg-brand-mint-teal/10 rounded-xl"><Info className="h-4 w-4 text-brand-mint-teal" /></div>;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button 
          className="relative text-slate-500 hover:text-brand-mint-teal transition-all p-2 rounded-xl hover:bg-slate-100 outline-none group active:scale-95"
          title="Notifications"
        >
          <Bell size={20} className="group-hover:rotate-[15deg] transition-all" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-3.5 w-3.5 items-center justify-center">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500 text-[8px] font-black items-center justify-center text-white ring-1 ring-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        sideOffset={10}
        className="w-[92vw] sm:w-[380px] p-0 shadow-2xl border-slate-200 rounded-3xl overflow-hidden animate-in fade-in-0 zoom-in-95 bg-white"
      >
        {/* Compact Header */}
        <div className="p-4 bg-white border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base tracking-tight text-slate-900">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 bg-rose-500 text-white text-[9px] font-black rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 text-[9px] font-black uppercase tracking-wider text-brand-startup-amber hover:text-brand-startup-amber hover:bg-brand-startup-amber/5 px-2 rounded-lg"
                onClick={handleMarkAllAsRead}
              >
                Mark all read
              </Button>
            )}
          </div>
        </div>
        
        <div className="max-h-[380px] overflow-y-auto custom-scrollbar bg-white">
          {loading && notifications.length === 0 ? (
            <div className="p-10 text-center">
              <div className="animate-spin h-5 w-5 border-2 border-brand-mint-teal border-t-transparent rounded-full mx-auto" />
              <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase">Syncing...</p>
            </div>
          ) : notifications.length > 0 ? (
            <div className="">
              {notifications.map((notification) => (
                <DropdownMenuItem 
                  key={notification.id}
                  className={cn(
                    "flex flex-col items-start gap-1 p-3.5 cursor-pointer transition-all outline-none border-b border-slate-50 last:border-0",
                    !notification.isRead ? "bg-slate-50/50" : "bg-white"
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start justify-between w-full gap-3">
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 mt-0.5">{getIcon(notification.type)}</div>
                      <div className="flex flex-col min-w-0">
                        <span className={cn(
                          "text-[13px] tracking-tight leading-snug break-words",
                          !notification.isRead ? "text-slate-900 font-bold" : "text-slate-600 font-medium"
                        )}>
                          {notification.title}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                           <Clock className="h-2.5 w-2.5 text-slate-300" />
                           <span className="text-[9px] text-slate-400 font-bold uppercase">
                             {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                           </span>
                        </div>
                      </div>
                    </div>
                    {!notification.isRead && (
                      <div className="h-2 w-2 rounded-full bg-rose-500 shrink-0 mt-1.5 ring-2 ring-rose-500/20" />
                    )}
                  </div>
                  
                  <p className={cn(
                    "text-[12px] leading-relaxed mt-1.5 ml-10 pr-2",
                    !notification.isRead ? "text-slate-700 font-medium" : "text-slate-500"
                  )}>
                    {notification.message}
                  </p>
                  
                  {notification.link && (
                    <div className="mt-2 ml-10 text-[9px] font-black text-brand-startup-amber uppercase tracking-widest flex items-center gap-1 hover:underline">
                      View Details
                      <ArrowRight size={10} />
                    </div>
                  )}
                </DropdownMenuItem>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <Inbox className="h-8 w-8 text-slate-200 mb-2" />
              <p className="text-sm text-slate-900 font-bold">No notifications</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Everything is clear</p>
            </div>
          )}
        </div>
        
        <Link 
          href={
            pathname.startsWith('/admins-new') ? '/admins-new/notifications' :
            pathname.startsWith('/committee-portal') ? '/committee-portal/notifications' :
            pathname.startsWith('/ecosystem-builder') ? '/ecosystem-builder/notifications' :
            '/dashboard/notifications'
          } 
          className="block w-full border-t border-slate-100 mt-auto"
        >
          <div className="p-4 text-center bg-white hover:bg-slate-50 transition-all font-black text-[11px] uppercase tracking-[0.3em] text-brand-mint-teal">
            View All Audit Activity
          </div>
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
