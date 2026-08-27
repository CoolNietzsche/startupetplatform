'use client';

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect, Suspense } from "react";
import { signUpFormSchema } from "@/lib/formSchema";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { signUpAction } from "../actions";
import Link from "next/link";
import { Loader2, Eye, EyeOff, Check, X } from "lucide-react";


export default function SignUp() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>}>
            <SignUpContent />
        </Suspense>
    );
}

function SignUpContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const initialRole = searchParams.get('role') as "USER" | "ECOSYSTEM_BUILDER" | null;

    const form = useForm<z.infer<typeof signUpFormSchema>>({
        mode: "onChange",
        resolver: zodResolver(signUpFormSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            phoneNumber: "",
            role: initialRole || "USER",
            password: "",
            confirmPassword: "",
        }
    });

    const watchPassword = form.watch("password");

    useEffect(() => {
        if (initialRole && (initialRole === "USER" || initialRole === "ECOSYSTEM_BUILDER")) {
            form.setValue('role', initialRole);
        }
    }, [initialRole, form]);

    const onSubmit = async (values: z.infer<typeof signUpFormSchema>) => {
        setLoading(true);
        try {
            const result = await signUpAction(values);

            if (result.success) {
                toast({
                    title: "Registration Successful",
                    description: "Please check your email for the 6-digit verification code.",
                });
                // Redirect immediately to verification page with email in query
                router.push(`/auth/verify-email?email=${encodeURIComponent(values.email)}`);
            } else {
                toast({
                    title: "Registration Failed",
                    description: result.message,
                    variant: "destructive"
                });
            }
        } catch (err: any) {
            console.error("SignUp Error:", err);
            toast({
                title: "Error",
                description: "Something went wrong. Please try again.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const underlineInputClass = "h-11 rounded-none border-0 border-b-2 border-brand-deep-dark/15 bg-transparent px-0 shadow-none focus-visible:ring-0 focus-visible:border-brand-deep-dark font-medium text-brand-deep-dark placeholder:text-brand-deep-dark/30";

    return (
        <div className="w-full">
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-brand-deep-dark leading-tight mb-3">
                Create Account
            </h1>
            <p className="text-sm text-brand-deep-dark/60 font-medium leading-relaxed mb-10">
                Creating an account does not mean submitting a startup application. Once your account is ready, sign in and start your application from your dashboard.
            </p>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col space-y-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input {...field} placeholder="First name" disabled={loading} className={underlineInputClass} />
                                    </FormControl>
                                    <FormMessage className="text-[10px]" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="lastName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input {...field} placeholder="Last name" disabled={loading} className={underlineInputClass} />
                                    </FormControl>
                                    <FormMessage className="text-[10px]" />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="role"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Select value={field.value} onValueChange={field.onChange} disabled={loading}>
                                        <SelectTrigger className="h-11 rounded-none border-0 border-b-2 border-brand-deep-dark/15 bg-transparent px-0 shadow-none focus:ring-0 focus-visible:ring-0 focus:border-brand-deep-dark font-medium text-brand-deep-dark">
                                            <SelectValue placeholder="Account category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="USER">Startup (Individual/Company)</SelectItem>
                                            <SelectItem value="ECOSYSTEM_BUILDER">Ecosystem Builder</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage className="text-[10px]" />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input {...field} placeholder="Institutional email" type="email" disabled={loading} className={underlineInputClass} />
                                </FormControl>
                                <FormMessage className="text-[10px]" />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="phoneNumber"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input {...field} placeholder="+251 9XX XXX XXX" type="tel" disabled={loading} className={underlineInputClass} />
                                </FormControl>
                                <FormMessage className="text-[10px]" />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
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
                                            className={`${underlineInputClass} pr-8`}
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-0 top-1/2 -translate-y-1/2 text-brand-deep-dark/40 hover:text-brand-mint-teal focus:outline-none"
                                            onClick={() => setShowPassword(!showPassword)}
                                            tabIndex={-1}
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </FormControl>
                                <FormMessage className="text-[10px]" />
                                {watchPassword && (
                                    <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 mt-2">
                                        {[
                                            { label: "8+ characters", test: watchPassword.length >= 8 },
                                            { label: "Uppercase letter", test: /[A-Z]/.test(watchPassword) },
                                            { label: "Lowercase letter", test: /[a-z]/.test(watchPassword) },
                                            { label: "Number", test: /[0-9]/.test(watchPassword) },
                                            { label: "Special character", test: /[^A-Za-z0-9]/.test(watchPassword) },
                                        ].map((rule) => (
                                            <div key={rule.label} className="flex items-center gap-1.5 text-[10px]">
                                                {rule.test ? (
                                                    <Check className="w-3 h-3 text-green-500 shrink-0" />
                                                ) : (
                                                    <X className="w-3 h-3 text-red-400 shrink-0" />
                                                )}
                                                <span className={rule.test ? "text-green-600" : "text-red-500"}>{rule.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <div className="relative">
                                        <Input
                                            {...field}
                                            placeholder="Confirm password"
                                            type={showConfirmPassword ? "text" : "password"}
                                            disabled={loading}
                                            className={`${underlineInputClass} pr-8`}
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-0 top-1/2 -translate-y-1/2 text-brand-deep-dark/40 hover:text-brand-mint-teal focus:outline-none"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            tabIndex={-1}
                                        >
                                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </FormControl>
                                <FormMessage className="text-[10px]" />
                            </FormItem>
                        )}
                    />

                    <Button
                        type="submit"
                        className="w-full h-12 bg-brand-deep-dark hover:bg-black text-white font-bold rounded-full transition-all mt-2"
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Sign Up"}
                    </Button>
                </form>
            </Form>

            <p className="mt-6 text-center text-sm text-brand-deep-dark/60 font-medium">
                Already part of the ecosystem?{" "}
                <Link href="/auth/sign-in" className="font-bold text-brand-deep-dark underline underline-offset-2 hover:text-brand-mint-teal transition-colors">
                    Sign in here
                </Link>
            </p>
        </div>
    );
}