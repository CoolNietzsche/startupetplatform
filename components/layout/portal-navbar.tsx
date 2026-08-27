"use client";

import React from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  LogOut, 
  User, 
  Settings, 
  ChevronDown,
  Menu,
  LayoutDashboard
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { NotificationDropdown } from "@/components/layout/notification-dropdown";
import { cn } from "@/lib/utils";

export interface PortalNavbarProps {
  leftContent?: React.ReactNode;
  rightContent?: React.ReactNode;
  variant?: 'light' | 'dark' | 'transparent';
  className?: string;
  showNotifications?: boolean;
  onMenuToggle?: () => void;
}

export function PortalNavbar({
  leftContent,
  rightContent,
  variant = 'light',
  className,
  showNotifications = false,
  onMenuToggle,
}: PortalNavbarProps) {
  const { data: session } = useSession();
  const user = session?.user;
  const router = useRouter();

  const handleLogout = () => {
    signOut({ callbackUrl: "/auth/sign-in" });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const isDark = variant === 'dark';

  return (
    <header 
      className={cn(
        "h-14 flex items-center justify-between px-4 md:px-5 sticky top-0 z-20 transition-all duration-300",
        isDark 
          ? "bg-slate-900 border-b-[1.5px] border-slate-700 text-white" 
          : "bg-white border-b-[1.5px] border-slate-200 text-slate-800 shadow-[0_1px_4px_0_rgba(0,0,0,0.02),0_4px_12px_0_rgba(0,0,0,0.03)]",
        className
      )}
    >
      {/* Left side: hamburger + portal content */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {onMenuToggle && (
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn(
              "lg:hidden shrink-0 h-9 w-9 rounded-xl transition-all",
              isDark ? "hover:bg-slate-800 text-slate-300" : "hover:bg-slate-100 text-slate-600"
            )}
            onClick={onMenuToggle}
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        {/* Divider between hamburger and content */}
        {onMenuToggle && leftContent && (
          <div className={cn("h-5 w-px shrink-0 lg:hidden", isDark ? "bg-slate-700" : "bg-slate-200")} />
        )}

        <div className="flex items-center gap-3 min-w-0 overflow-hidden">
          {leftContent}
        </div>
      </div>

      {/* Right side: actions + user */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Optional right content (hidden on small screens) */}
        {rightContent && (
          <div className="hidden md:flex items-center gap-3">
            {rightContent}
          </div>
        )}

        {showNotifications && <NotificationDropdown />}

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className={cn(
                "relative h-11 flex items-center gap-2 pl-1.5 pr-2.5 rounded-2xl transition-all group border border-slate-200/50 shadow-sm",
                isDark ? "hover:bg-slate-800 border-slate-700" : "hover:bg-slate-50 bg-white"
              )}
            >
              {/* Avatar */}
              <Avatar className={cn("h-7 w-7 ring-2", isDark ? "ring-slate-700" : "ring-slate-200 ring-offset-1")}>
                {user?.image ? <AvatarImage src={user.image} alt={user?.name || ""} /> : null}
                <AvatarFallback className="bg-brand-mint-teal text-white font-black text-[10px]">
                  {user?.name ? getInitials(user.name) : "U"}
                </AvatarFallback>
              </Avatar>

              {/* Name + Role on md+ */}
              <div className="hidden md:flex flex-col items-start leading-none">
                <p className={cn("text-[12px] font-bold leading-tight truncate max-w-[100px]", isDark ? "text-white" : "text-slate-800")}>
                  {user?.name?.split(' ')[0] ?? 'User'}
                </p>
                <p className={cn("text-[10px] font-medium truncate max-w-[100px]", isDark ? "text-slate-400" : "text-slate-400")}>
                  {(session?.user as any)?.role?.replace(/_/g, ' ') ?? 'Member'}
                </p>
              </div>

              <ChevronDown className={cn(
                "h-3.5 w-3.5 transition-transform duration-200 group-data-[state=open]:rotate-180",
                isDark ? "text-slate-400" : "text-slate-400"
              )} />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent 
            align="end" 
            sideOffset={10}
            className={cn(
              "w-72 p-0 rounded-2xl shadow-2xl border overflow-hidden",
              isDark ? "bg-slate-900 border-slate-800 text-slate-200" : "bg-white border-slate-100"
            )}
          >
            {/* Profile Header Card */}
            <div className="relative px-4 py-5 overflow-hidden bg-gradient-to-br from-brand-deep-dark to-brand-mint-teal">
              {/* Decorative glow */}
              <div className="absolute top-0 right-0 h-24 w-24 bg-white/10 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />
              <div className="absolute bottom-0 left-0 h-16 w-16 bg-white/5 rounded-full blur-xl -ml-4 -mb-4 pointer-events-none" />

              <div className="relative flex items-center gap-3">
                {/* Avatar with online dot */}
                <div className="relative shrink-0">
                  <Avatar className="h-12 w-12 ring-2 ring-white/40 ring-offset-2 ring-offset-brand-mint-teal">
                    {user?.image ? <AvatarImage src={user.image} alt={user?.name || ""} /> : null}
                    <AvatarFallback className="bg-white/20 text-white font-black text-sm backdrop-blur-sm">
                      {user?.name ? getInitials(user.name) : "U"}
                    </AvatarFallback>
                  </Avatar>
                  {/* Online indicator */}
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-400 border-2 border-white block" />
                </div>

                {/* User info */}
                <div className="flex flex-col min-w-0 flex-1">
                  <p className="text-sm font-black text-white truncate leading-tight drop-shadow-sm">
                    {user?.name ?? 'User'}
                  </p>
                  <p className="text-[11px] text-white/70 truncate mt-0.5">
                    {user?.email}
                  </p>
                  {/* Role badge */}
                  <span className="inline-flex items-center gap-1 mt-1.5 self-start px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-wider border border-white/30 backdrop-blur-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                    {(session?.user as any)?.role?.replace(/_/g, ' ') ?? 'Member'}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className={cn("p-2", isDark ? "bg-slate-900" : "bg-white")}>
              <DropdownMenuLabel className={cn("px-2 pb-1 pt-1 text-[10px] font-black uppercase tracking-widest", isDark ? "text-slate-500" : "text-slate-400")}>
                Account
              </DropdownMenuLabel>

              <DropdownMenuItem onClick={() => router.push("/dashboard/settings")} className={cn(
                "cursor-pointer rounded-xl py-1.5 px-3 gap-3 mb-0.5 transition-colors group",
                isDark ? "focus:bg-slate-800" : "focus:bg-slate-50"
              )}>
                <div className={cn("p-1.5 rounded-lg shrink-0", isDark ? "bg-slate-700" : "bg-blue-50")}>
                  <User className="h-3.5 w-3.5 text-blue-500" />
                </div>
                <span className={cn("font-bold text-[13px]", isDark ? "text-slate-200" : "text-slate-700")}>My Profile</span>
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => router.push("/dashboard/settings")} className={cn(
                "cursor-pointer rounded-xl py-1.5 px-3 gap-3 transition-colors group",
                isDark ? "focus:bg-slate-800" : "focus:bg-slate-50"
              )}>
                <div className={cn("p-1.5 rounded-lg shrink-0", isDark ? "bg-slate-700" : "bg-violet-50")}>
                  <Settings className="h-3.5 w-3.5 text-violet-500" />
                </div>
                <span className={cn("font-bold text-[13px]", isDark ? "text-slate-200" : "text-slate-700")}>Settings</span>
              </DropdownMenuItem>
            </div>

            {/* Footer: Sign out */}
            <div className={cn("px-2 pb-2 pt-0", isDark ? "bg-slate-900" : "bg-white")}>
              <div className={cn("h-px mb-1.5", isDark ? "bg-slate-800" : "bg-slate-100")} />
              <DropdownMenuItem 
                onClick={handleLogout} 
                className="cursor-pointer rounded-xl py-1.5 px-3 gap-3 text-red-500 focus:text-red-600 focus:bg-red-50/80 transition-colors"
              >
                <div className="p-1.5 rounded-lg bg-red-50 shrink-0">
                  <LogOut className="h-3.5 w-3.5 text-red-500" />
                </div>
                <span className="font-bold text-[13px]">Sign Out</span>
              </DropdownMenuItem>
            </div>

          </DropdownMenuContent>

        </DropdownMenu>
      </div>
    </header>
  );
}
