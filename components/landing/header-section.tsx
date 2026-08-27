"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Rocket, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeaderSection({ dashboardUrl }: { dashboardUrl: string }) {
  const { data: session } = useSession();

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] h-16 backdrop-blur-3xl border-b border-brand-mint-teal/20 shadow-[0_15px_60px_hsl(var(--mint-teal)_/_0.05)]">
      <div className="container mx-auto h-full px-6 flex items-center justify-between">
        {/* Logo Left */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="h-11 w-11 bg-brand-mint-teal rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
            <Rocket className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-brand-mint-teal">
            Startup<span className="text-brand-startup-amber italic">ET</span>
          </span>
        </Link>

        {/* Menu Center */}
        <nav className="hidden lg:flex items-center gap-12">
          <Link href="/funding" className="group relative py-1">
            <span className="text-sm font-medium text-brand-deep-dark hover:text-brand-mint-teal transition-all duration-300">
              Funding
            </span>
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-brand-startup-amber group-hover:w-full transition-all duration-300 rounded-full" />
          </Link>
          <Link href="/startups" className="group relative py-1">
            <span className="text-sm font-medium text-brand-deep-dark hover:text-brand-mint-teal transition-all duration-300">
              Startups
            </span>
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-brand-startup-amber group-hover:w-full transition-all duration-300 rounded-full" />
          </Link>
          <Link href="/builders" className="group relative py-1">
            <span className="text-sm font-medium text-brand-deep-dark hover:text-brand-mint-teal transition-all duration-300">
              Builders
            </span>
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-brand-startup-amber group-hover:w-full transition-all duration-300 rounded-full" />
          </Link>
          <Link href="/news" className="group relative py-1">
            <span className="text-sm font-medium text-brand-deep-dark hover:text-brand-mint-teal transition-all duration-300">
              Highlights
            </span>
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-brand-startup-amber group-hover:w-full transition-all duration-300 rounded-full" />
          </Link>
        </nav>

        {/* Right Auth Section */}
        <div className="flex items-center gap-4">
          {session ? (
            <Button
              asChild
              className="bg-brand-mint-teal hover:bg-brand-mint-teal/90 text-white font-bold h-12 px-6 rounded-xl shadow-lg shadow-brand-mint-teal/20"
            >
              <Link href={dashboardUrl}>
                Go to Dashboard <ArrowUpRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" className="hidden sm:inline-flex text-brand-mint-teal font-bold hover:bg-brand-mint-teal/5">
                <Link href="/auth/sign-in">Log In</Link>
              </Button>
              <Button
                asChild
                className="bg-brand-startup-amber hover:bg-brand-startup-amber/90 text-white font-bold h-12 px-6 rounded-xl shadow-lg shadow-brand-startup-amber/20"
              >
                <Link href="/auth/sign-up">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
