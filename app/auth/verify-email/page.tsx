"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { verifyEmailAction } from "@/app/auth/actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle2, XCircle, Mail, Clock } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";

const EXPIRY_MINUTES = 60;

function Countdown({ done }: { done: boolean }) {
  const [remaining, setRemaining] = useState(EXPIRY_MINUTES * 60);

  useEffect(() => {
    if (done) return;
    const interval = setInterval(() => {
      setRemaining((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [done]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;

  return (
    <div className="flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider mt-4">
      <Clock className="w-3.5 h-3.5 text-brand-startup-amber" />
      <span className={remaining > 300 ? "text-brand-deep-dark/50" : "text-red-500"}>
        Code expires in {mins}:{secs.toString().padStart(2, "0")}
      </span>
    </div>
  );
}

function VerifyEmailContent() {
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const handleVerify = useCallback(async (codeToVerify?: string) => {
    const code = codeToVerify || otp;
    if (code.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter a 6-digit verification code.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await verifyEmailAction(code);
      if (result.success) {
        setStatus("success");
        setMessage(result.message);
        toast({
          title: "Email Verified",
          description: result.message,
        });
      } else {
        setStatus("error");
        setMessage(result.message);
        toast({
          title: "Verification Failed",
          description: result.message,
        });
      }
    } catch (error) {
      setStatus("error");
      setMessage("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  }, [otp, toast]);

  useEffect(() => {
    const token = searchParams.get("token");
    if (token && token.length === 6 && status === "idle") {
      setOtp(token);
      handleVerify(token);
    }
  }, [searchParams, status, handleVerify]);

  return (
    <Card className="w-full max-w-[500px] mx-auto bg-white border-2 border-brand-startup-amber/10 rounded-[32px] shadow-[0_20px_60px_-15px_rgba(232,168,68,0.08)] relative overflow-hidden sm:p-2">
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-startup-amber/5 rounded-bl-[100px] -mr-8 -mt-8 pointer-events-none" />
      <CardHeader className="space-y-3 px-6 pt-8 sm:px-8 text-center pb-6 relative z-10">
        <div className="w-16 h-16 bg-brand-startup-amber/10 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-brand-startup-amber/20 shadow-lg shadow-brand-startup-amber/20">
          <Mail className="w-8 h-8 text-brand-startup-amber" />
        </div>
        <CardTitle className="text-3xl sm:text-4xl font-black tracking-tighter text-brand-deep-dark">
          Verify <span className="text-brand-startup-amber">Email</span>
        </CardTitle>
        <CardDescription className="text-brand-deep-dark/60 text-base font-medium px-2">
          Enter the 6-digit code sent to{" "}
          {searchParams.get("email") ? (
            <strong className="text-brand-deep-dark">{searchParams.get("email")}</strong>
          ) : (
            "your email address"
          )}
        </CardDescription>
        <Countdown done={status === "success"} />
      </CardHeader>

      <CardContent className="px-6 pb-8 sm:px-8 relative z-10">
        {status === "idle" || status === "error" ? (
          <div className="flex flex-col space-y-5">
            <Input
              type="text"
              placeholder="000 000"
              maxLength={6}
              value={otp}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, "");
                setOtp(value);
                if (value.length === 6) {
                  handleVerify(value);
                }
              }}
              className="text-3xl font-bold tracking-[0.5em] text-center h-16 rounded-xl border-brand-startup-amber/20 focus-visible:ring-brand-startup-amber bg-slate-50/50 shadow-sm transition-all"
              autoFocus
            />

            {status === "error" && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-center gap-3">
                <XCircle className="h-5 w-5 shrink-0" />
                <p className="text-sm font-medium">{message}</p>
              </div>
            )}

            <Button
              onClick={() => handleVerify(otp)}
              disabled={isSubmitting || otp.length !== 6}
              className="w-full h-12 bg-brand-startup-amber hover:bg-brand-startup-amber/90 text-white font-black uppercase tracking-widest rounded-xl shadow-xl shadow-brand-startup-amber/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verify Email"}
            </Button>

            <p className="text-xs text-center text-brand-deep-dark/40 font-medium">
              Didn't receive the code? Check your spam folder.
            </p>

            <div className="pt-2 text-center">
              <Link
                href="/auth/sign-in"
                className="text-xs font-black uppercase tracking-widest text-brand-deep-dark/40 hover:text-brand-startup-amber transition-colors"
              >
                ← Back to Login
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-6 py-4">
            <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center border border-green-200 shadow-lg shadow-green-100">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-black tracking-tighter text-brand-deep-dark">
                Account <span className="text-green-600">Verified!</span>
              </h3>
              <p className="text-brand-deep-dark/60 font-medium text-sm">{message}</p>
            </div>
            <Button asChild className="w-full h-12 bg-brand-startup-amber hover:bg-brand-startup-amber/90 text-white font-black uppercase tracking-widest rounded-xl shadow-xl shadow-brand-startup-amber/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
              <Link href="/auth/sign-in">Continue to Login</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
