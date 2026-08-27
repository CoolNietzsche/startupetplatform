"use client";

import { useState } from "react";
import { forgotPasswordAction } from "@/app/auth/actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [resultMessage, setResultMessage] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await forgotPasswordAction(email);
      if (result.success) {
        setSubmitted(true);
        setResultMessage(result.message || "");
        toast({
          title: "Request Sent",
          description: result.message,
        });
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
       toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-[500px] mx-auto bg-white border-2 border-brand-startup-amber/10 rounded-[32px] shadow-[0_20px_60px_-15px_rgba(232,168,68,0.08)] relative overflow-hidden sm:p-2">
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-startup-amber/5 rounded-bl-[100px] -mr-8 -mt-8 pointer-events-none" />
      <CardHeader className="space-y-3 px-6 pt-8 sm:px-8 text-center pb-6 relative z-10">
        <div className="w-16 h-16 bg-brand-startup-amber/10 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-brand-startup-amber/20 shadow-lg shadow-brand-startup-amber/20">
            <Mail className="w-8 h-8 text-brand-startup-amber" />
        </div>
        <CardTitle className="text-3xl sm:text-4xl font-black tracking-tighter text-brand-deep-dark">
          Reset <span className="text-brand-startup-amber">Access</span>
        </CardTitle>
        <CardDescription className="text-brand-deep-dark/60 text-base font-medium px-2">
          Enter your email address to receive a secure password reset link.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6 pb-8 sm:px-8 relative z-10">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="flex flex-col space-y-4 w-full">
              <div className="space-y-2 text-left">
                <label className="font-bold text-brand-deep-dark uppercase tracking-widest text-xs">Email Address</label>
                <Input
                  type="email"
                  placeholder="name@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="h-12 rounded-xl border-brand-startup-amber/20 focus-visible:ring-brand-startup-amber bg-slate-50/50 shadow-sm px-4 font-medium text-brand-deep-dark"
                />
              </div>
              <Button type="submit" className="w-full h-12 bg-brand-startup-amber hover:bg-brand-startup-amber/90 text-white font-black uppercase tracking-widest rounded-xl shadow-xl shadow-brand-startup-amber/20 transition-all hover:scale-[1.02] active:scale-[0.98] mt-4" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Send Reset Link"}
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-4 py-4">
              <p className="text-brand-deep-dark font-black tracking-tighter text-2xl">Check your inbox</p>
              <p className="text-brand-deep-dark/60 font-medium text-sm whitespace-pre-wrap">
                {resultMessage}
              </p>
              <Button variant="outline" onClick={() => setSubmitted(false)} className="w-full h-12 font-bold uppercase tracking-widest border-2 border-brand-startup-amber/20 text-brand-startup-amber hover:bg-brand-startup-amber/5 rounded-xl hover:text-brand-startup-amber mt-4 transition-colors bg-transparent">
                Try a different email
              </Button>
            </div>
          )}
          
          <div className="pt-8 text-center mt-6">
            <Link 
              href="/auth/sign-in" 
              className="inline-flex items-center text-xs font-black uppercase tracking-widest text-brand-deep-dark/40 hover:text-brand-startup-amber transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Secure Login
            </Link>
          </div>
        </CardContent>
    </Card>
  );
}
