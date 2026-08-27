"use client";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { signInFormSchema } from "@/lib/formSchema";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useBasicStore } from "@/store/basic";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function SignIn() {
  const router = useRouter();
  const { toast } = useToast();
  const { setUser } = useBasicStore();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof signInFormSchema>>({
    mode: "onBlur",
    resolver: zodResolver(signInFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: z.infer<typeof signInFormSchema>) {
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (result?.error) {
        // Parse NextAuth generic errors into user-friendly messages
        let errorMessage = "Failed to sign in. Please try again.";
        const rawError = result.error;
        if (rawError === "CredentialsSignin" || rawError.includes("CredentialsSignin")) {
            errorMessage = "Invalid email or password. Please check your credentials.";
        } else if (rawError === "AccessDenied" || rawError.includes("AccessDenied")) {
            errorMessage = "You do not have permission to access this portal.";
        } else {
            // Strip out the generic 'Error: ' prefix NextAuth sometimes injects via the backend
            errorMessage = rawError.replace(/^Error:\s*/i, "");
            
            // Catch exact matches for the generic new strings we created in auth.ts
            if (errorMessage === "Invalid password") {
                errorMessage = "Invalid email or password. Please check your credentials.";
            }
        }

        toast({
          title: "Authentication Failed",
          description: errorMessage,
          variant: "destructive",
        });
        
        form.setError("root", { type: "server", message: errorMessage });
        form.setValue("password", "");
        // Do not throw an Error object here to prevent the messy Next.js stack trace overlay
        return; 
      }

      if (result?.ok) {
        toast({
          title: "Welcome back!",
          description: "Login successful.",
        });

        // Get the updated session to check the role
        const { getSession } = await import("next-auth/react");
        const session = await getSession();
        const userRole = (session?.user as any)?.role;

        // Dynamic Role-Based Redirection
        let redirectUrl = "/dashboard/home";
        if (userRole === "SUPER_ADMIN" || userRole === "ADMIN") {
          redirectUrl = "/admins-new";
        } else if (userRole === "REVIEWER" || userRole === "COMMITTEE") {
          redirectUrl = "/committee-portal/dashboard";
        } else if (userRole === "ECOSYSTEM_BUILDER") {
          redirectUrl = "/ecosystem-builder";
        }

        // Full-page navigation ensures the session cookie is sent and middleware runs
        window.location.href = redirectUrl;
      }
    } catch (err: any) {
      toast({
        title: "System Error",
        description: "An unexpected error occurred during login. Please try again.",
        variant: "destructive",
      });

      form.setValue("password", "");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-brand-deep-dark leading-tight mb-3">
        Welcome Back!
      </h1>
      <div className="mb-10 space-y-1.5">
        <p className="text-sm text-brand-deep-dark/60 font-medium leading-relaxed">
          Creating an account does not submit a startup application. Once
          your account is ready, sign in and start your application from
          your dashboard.
        </p>
        <p
          lang="am"
          className="text-sm text-brand-deep-dark/50 font-medium leading-relaxed"
        >
          አካውንት መፍጠር የስታርትአፕ ማመልከቻ ማስገባት አይደለም። መለያዎ ከተዘጋጀ በኋላ፣ ይግቡ እና
          ማመልከቻዎን ከዳሽቦርድዎ ይጀምሩ።
        </p>
      </div>

      <Form {...form}>
        <form
          onChange={() => form.clearErrors("root")}
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col space-y-6 w-full"
        >
          {form.formState.errors.root && (
            <div className="bg-[#D53E0F]/10 border-l-4 border-[#D53E0F] text-[#D53E0F] p-3 rounded-lg text-sm font-bold animate-in fade-in slide-in-from-top-2">
              {form.formState.errors.root.message}
            </div>
          )}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="email@example.com"
                    type="email"
                    disabled={loading}
                    className="h-11 rounded-none border-0 border-b-2 border-brand-deep-dark/15 bg-transparent px-0 shadow-none focus-visible:ring-0 focus-visible:border-brand-deep-dark font-medium text-brand-deep-dark placeholder:text-brand-deep-dark/30"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      placeholder="Password"
                      type={showPassword ? "text" : "password"}
                      disabled={loading}
                      className="h-11 rounded-none border-0 border-b-2 border-brand-deep-dark/15 bg-transparent px-0 pr-8 shadow-none focus-visible:ring-0 focus-visible:border-brand-deep-dark font-medium text-brand-deep-dark placeholder:text-brand-deep-dark/30"
                    />
                    <button
                      type="button"
                      className="absolute right-0 top-1/2 -translate-y-1/2 text-brand-deep-dark/40 hover:text-brand-mint-teal focus:outline-none transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full h-12 bg-brand-deep-dark hover:bg-black text-white font-bold rounded-full transition-all mt-4"
            disabled={loading}
          >
            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Login Now"}
          </Button>
        </form>
      </Form>

      <p className="mt-6 text-center text-sm text-brand-deep-dark/60 font-medium">
        Forgot password?{" "}
        <Link
          href="/auth/forgot-password"
          className="font-bold text-brand-deep-dark underline underline-offset-2 hover:text-brand-mint-teal transition-colors"
        >
          Click here
        </Link>
      </p>

      <p className="mt-3 text-center text-sm text-brand-deep-dark/60 font-medium">
        New to the ecosystem?{" "}
        <Link
          href="/auth/sign-up"
          className="font-bold text-brand-deep-dark underline underline-offset-2 hover:text-brand-mint-teal transition-colors"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
