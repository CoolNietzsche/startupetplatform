"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image"
import { MenuIcon, X, UserCircle2, LogIn, UserPlus, LayoutDashboard, LogOut } from "lucide-react";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { NotificationDropdown } from "@/components/layout/notification-dropdown";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function MainNavigation() {
  const [isOpen, setIsOpen] = React.useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const authenticated = status === "authenticated";

  // Handle resize for mobile menu
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Hide MainNavigation on portal routes (standardizing to use PortalNavbar)
  const isPortalRoute = pathname.startsWith('/super-admin') || 
                        pathname.startsWith('/admins-new') || 
                        pathname.startsWith('/dashboard') || 
                        pathname.startsWith('/committee-portal') || 
                        pathname.startsWith('/ecosystem-builder');

  if (isPortalRoute) return null;

  const getDashboardUrl = (role?: string) => {
    switch (role) {
      case "SUPER_ADMIN":
      case "STAKEHOLDER":
        return "/super-admin";
      case "ADMIN":
      case "MANAGER":
      case "SUPPORT":
        return "/admins-new";
      case "COMMITTEE":
      case "REVIEWER":
        return "/committee-portal/dashboard";
      case "ECOSYSTEM_BUILDER":
        return "/ecosystem-builder";
      default:
        return "/dashboard/home";
    }
  };

  const getUserInitials = () => {
    const firstName = (session?.user as any)?.firstName;
    const name = session?.user?.name;
    if (firstName) return firstName.charAt(0).toUpperCase();
    if (name) return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
    return 'U';
  };

  // Desktop auth actions
  const desktopAuthActions = authenticated ? (
    <div className="flex items-center gap-3">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-full p-1 hover:bg-slate-50 transition-all outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
            <Avatar className="h-8 w-8 ring-2 ring-slate-100 ring-offset-2">
              <AvatarFallback className="bg-primary text-white text-sm font-black italic">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={12} className="w-64 z-[100] premium-card p-2 border-none">
          <DropdownMenuLabel className="font-normal p-4">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-black tracking-tight text-slate-900 leading-none capitalize">
                {(session?.user as any)?.firstName || session?.user?.name || 'User'}
              </p>
              <p className="text-xs font-medium leading-none text-slate-500">
                {session?.user?.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-slate-100" />
          <div className="p-1">
            <DropdownMenuItem
              className="cursor-pointer rounded-lg font-bold py-3 focus:bg-slate-50 focus:text-primary"
              onClick={() => window.location.href = getDashboardUrl((session?.user as any)?.role)}
            >
              <LayoutDashboard className="mr-3 h-4 w-4" />
              <span>Go to Dashboard</span>
            </DropdownMenuItem>
          </div>
          <DropdownMenuSeparator className="bg-slate-100" />
          <div className="p-1">
            <DropdownMenuItem
              className="text-red-600 cursor-pointer rounded-lg font-bold py-3 focus:bg-red-50 focus:text-red-600"
              onClick={() => signOut({ callbackUrl: '/' })}
            >
              <LogOut className="mr-3 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  ) : (
    <div className="hidden md:flex md:items-center gap-3">
      <Button variant="ghost" asChild className="font-bold text-slate-300 hover:text-white hover:bg-slate-800">
        <Link href="/auth/sign-in">
          Sign in
        </Link>
      </Button>
      <Button asChild className="bg-primary hover:bg-primary/90 font-bold px-6 shadow-lg shadow-primary/20">
        <Link href="/auth/sign-up">
          Sign up
        </Link>
      </Button>
    </div>
  );

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-brand-dark text-white shadow-sm transition-all duration-300">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6 max-w-6xl mx-auto" data-component-name="MainNavigation">
        
        {/* Desktop Navigation - Only on home page for non-authenticated guests */}
        {!authenticated && pathname === '/' && (
          <div className="hidden md:flex items-center gap-8 ml-8">
            {["Funding", "Builders", "Startups", "Events", "News"].map((item) => (
              <Link
                key={item}
                href={`/#${item.toLowerCase()}`}
                className="group flex h-full items-center text-sm font-bold text-slate-300 transition-colors hover:text-white"
              >
                <span className="relative">
                  {item}
                  <span className="absolute -bottom-1 left-0 h-0.5 w-0 rounded-full bg-gradient-to-r from-primary to-brand-2-500 transition-all duration-300 group-hover:w-full" />
                </span>
              </Link>
            ))}
          </div>
        )}

        <div className="flex items-center gap-4">
          {desktopAuthActions}

          {/* Mobile menu toggle - Only for non-authenticated users */}
          {!authenticated && (
            <button
              onClick={toggleMenu}
              className="flex md:hidden text-slate-300 hover:text-white"
              aria-label="Toggle Menu"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <MenuIcon className="h-6 w-6" />
              )}
              <span className="sr-only">Toggle menu</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="border-t border-brand-1/20 bg-brand-dark md:hidden"
        >
          <div className="container py-4 px-4 space-y-4">
            {!authenticated && (
              <div className="flex flex-col gap-1 pb-4">
                {["Funding", "Builders", "Startups", "Events", "News"].map((item) => (
                  <Link
                    key={item}
                    href={`/#${item.toLowerCase()}`}
                    onClick={() => setIsOpen(false)}
                    className="py-4 px-2 text-slate-300 hover:text-white hover:bg-slate-900 rounded-xl font-bold transition-all text-lg"
                  >
                    {item}
                  </Link>
                ))}
              </div>
            )}

            <div className="pt-8 flex flex-col space-y-4 border-t border-slate-800 mt-auto">
              {authenticated ? (
                <Button className="w-full bg-primary h-12 rounded-xl font-bold shadow-lg shadow-primary/20" asChild>
                  <Link href={getDashboardUrl((session?.user as any)?.role)}>
                    Go to Dashboard
                  </Link>
                </Button>
              ) : (
                <>
                  <Button variant="outline" asChild className="w-full h-12 rounded-xl font-bold border-slate-700 text-white hover:bg-slate-800">
                    <Link href="/auth/sign-in">Sign In</Link>
                  </Button>
                  <Button asChild className="w-full bg-primary h-12 rounded-xl font-bold shadow-lg shadow-primary/20">
                    <Link href="/auth/sign-up">Get Started</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </header>
  );
}

