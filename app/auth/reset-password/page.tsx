"use client";

import React, { useState, Suspense, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { resetPasswordAction } from "@/app/auth/actions";
import { validateStrongPassword } from "@/lib/formSchema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Lock, Check, X, Eye, EyeOff } from "lucide-react";

function ResetPasswordContent() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();
  const { toast } = useToast();

  const passwordError = useMemo(() => password ? validateStrongPassword(password) : null, [password]);
  const doMatch = password && confirmPassword && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordError) {
      toast({ title: "Error", description: passwordError, variant: "destructive" });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match.", variant: "destructive" });
      return;
    }
    if (!token) {
      toast({ title: "Error", description: "Missing token.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const result = await resetPasswordAction(token, password);
      if (result.success) {
        toast({ title: "Success", description: result.message });
        router.push("/auth/sign-in");
      } else {
        toast({ title: "Error", description: result.message, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Something went wrong.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-[500px] mx-auto bg-white border-2 border-brand-startup-amber/10 rounded-[32px] shadow-[0_20px_60px_-15px_rgba(232,168,68,0.08)] relative overflow-hidden sm:p-2">
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-startup-amber/5 rounded-bl-[100px] -mr-8 -mt-8 pointer-events-none" />
      <CardHeader className="space-y-3 px-6 pt-8 sm:px-8 text-center pb-6 relative z-10">
        <div className="w-16 h-16 bg-brand-startup-amber/10 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-brand-startup-amber/20 shadow-lg shadow-brand-startup-amber/20">
            <Lock className="w-8 h-8 text-brand-startup-amber" />
        </div>
        <CardTitle className="text-3xl sm:text-4xl font-black tracking-tighter text-brand-deep-dark">
          New <span className="text-brand-startup-amber">Password</span>
        </CardTitle>
        <CardDescription className="text-brand-deep-dark/60 text-base font-medium px-2">
          Enter your new strong password below to secure your account.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="px-6 pb-8 sm:px-8 relative z-10">
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4 w-full">
          <div className="space-y-4 text-left">
            <div className="space-y-2">
              <label className="font-bold text-brand-deep-dark uppercase tracking-widest text-xs">New Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="h-12 rounded-xl border-brand-startup-amber/20 focus-visible:ring-brand-startup-amber bg-slate-50/50 shadow-sm px-4 pr-10 font-medium text-brand-deep-dark"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-deep-dark/40 hover:text-brand-deep-dark transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {password && (
                <div className="space-y-1 mt-2">
                  {[
                    { label: "At least 8 characters", test: password.length >= 8 },
                    { label: "Uppercase letter", test: /[A-Z]/.test(password) },
                    { label: "Lowercase letter", test: /[a-z]/.test(password) },
                    { label: "Number", test: /[0-9]/.test(password) },
                    { label: "Special character", test: /[^A-Za-z0-9]/.test(password) },
                  ].map((rule) => (
                    <div key={rule.label} className="flex items-center gap-2 text-xs">
                      {rule.test ? (
                        <Check className="w-3.5 h-3.5 text-green-500 shrink-0" />
                      ) : (
                        <X className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      )}
                      <span className={rule.test ? "text-green-600" : "text-red-500"}>{rule.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="font-bold text-brand-deep-dark uppercase tracking-widest text-xs">Confirm Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  className={`h-12 rounded-xl focus-visible:ring-brand-startup-amber bg-slate-50/50 shadow-sm px-4 pr-10 font-medium text-brand-deep-dark ${
                    confirmPassword ? (doMatch ? "border-green-400" : "border-red-400") : "border-brand-startup-amber/20"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-deep-dark/40 hover:text-brand-deep-dark transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword && (
                <p className={`text-xs ${doMatch ? "text-green-600" : "text-red-500"}`}>
                  {doMatch ? "Passwords match" : "Passwords do not match"}
                </p>
              )}
            </div>
          </div>
          
          <Button type="submit" className="w-full h-12 bg-brand-startup-amber hover:bg-brand-startup-amber/90 text-white font-black uppercase tracking-widest rounded-xl shadow-xl shadow-brand-startup-amber/20 transition-all hover:scale-[1.02] active:scale-[0.98] mt-6" disabled={loading || !!passwordError}>
            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Update Password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
