"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle, Clock } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";

type ExistingApplicationResponse = {
  success: boolean;
  error?: string;
  data?: {
    id: string;
    builderId: string;
    status: "draft" | "pending" | "approved" | "rejected";
    workflowStatus: string;
    certified: boolean;
    canEdit: boolean;
    name: string;
    type: string;
    location: string | null;
    address: string | null;
    city: string | null;
    region: string | null;
    contactName: string | null;
    contactEmail: string | null;
    contactPhone: string | null;
    website: string | null;
    services: string[];
    description: string | null;
    serviceDescription: string | null;
    impactDescription: string | null;
    established: number | null;
    yearsOfOperation: number | null;
    capacity: number | null;
    businessLicenseFileId: string | null;
    taxRegistrationFileId: string | null;
    businessLicenseFileName: string | null;
    taxRegistrationFileName: string | null;
    createdAt: string;
    updatedAt: string;
  } | null;
};

type SubmissionMode = "draft" | "submit";

// Client Component since it uses React hooks
function EcosystemBuilderApplicationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get("mode") === "edit";
  const editApplicationId = searchParams.get("applicationId");
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [lastSubmissionMode, setLastSubmissionMode] = useState<SubmissionMode>("submit");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [businessLicenseFile, setBusinessLicenseFile] = useState<File | null>(null);
  const [taxRegistrationFile, setTaxRegistrationFile] = useState<File | null>(null);
  const [existingBusinessLicenseId, setExistingBusinessLicenseId] = useState<string | null>(null);
  const [existingTaxRegistrationId, setExistingTaxRegistrationId] = useState<string | null>(null);
  const [existingBusinessLicenseName, setExistingBusinessLicenseName] = useState<string | null>(null);
  const [existingTaxRegistrationName, setExistingTaxRegistrationName] = useState<string | null>(null);
  const [documentError, setDocumentError] = useState<string | null>(null);

  const [isLoadingData, setIsLoadingData] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [existingApplicationStatus, setExistingApplicationStatus] = useState<string | null>(null);

  useEffect(() => {
    if (isSubmitted) {
      const timer = setTimeout(() => {
        router.push("/ecosystem-builder/application");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isSubmitted, router]);

  const phoneRegex = /^\+?[0-9\s\-()]{10,20}$/;

  const formSchema = z.object({
    // Basic Information
    name: z
      .string()
      .trim()
      .min(2, { message: "Organization name must be at least 2 characters." })
      .max(100, { message: "Organization name must be 100 characters or less." }),
    type: z.enum(["COWORKING", "INCUBATOR", "ACCELERATOR", "INVESTOR", "TRAINING", "OTHER"]),
    websiteUrl: z
      .string()
      .trim()
      .refine((value) => {
        if (!value) return true;
        try {
          const normalized = value.startsWith("http://") || value.startsWith("https://") ? value : `https://${value}`;
          new URL(normalized);
          return true;
        } catch {
          return false;
        }
      }, { message: "Please enter a valid website URL." }),
    description: z
      .string()
      .trim()
      .min(30, { message: "Description must be at least 30 characters." })
      .max(500, { message: "Description must be 500 characters or less." }),

    // Location Details
    address: z
      .string()
      .trim()
      .min(5, { message: "Address must be at least 5 characters." })
      .max(200, { message: "Address must be 200 characters or less." }),
    city: z
      .string()
      .trim()
      .min(2, { message: "City must be at least 2 characters." })
      .max(80, { message: "City must be 80 characters or less." }),
    region: z
      .string()
      .trim()
      .min(2, { message: "Region must be at least 2 characters." })
      .max(80, { message: "Region must be 80 characters or less." }),

    // Contact Information
    contactName: z
      .string()
      .trim()
      .min(2, { message: "Contact name must be at least 2 characters." })
      .max(100, { message: "Contact name must be 100 characters or less." }),
    contactEmail: z.string().trim().email({ message: "Please enter a valid email address." }),
    contactPhone: z
      .string()
      .trim()
      .regex(phoneRegex, { message: "Please enter a valid phone number." }),

    // Services
    services: z.array(z.string()).nonempty({ message: "Please select at least one service." }),
    serviceDescription: z
      .string()
      .trim()
      .min(30, { message: "Service description must be at least 30 characters." })
      .max(1000, { message: "Service description must be 1000 characters or less." }),

    // Impact
    yearsOfOperation: z.coerce
      .number({ message: "Please enter years of operation." })
      .int({ message: "Years of operation must be a whole number." })
      .min(0, { message: "Years of operation cannot be negative." })
      .max(200, { message: "Years of operation looks too high." }),
    startupsSupported: z.coerce
      .number({ message: "Please enter number of startups supported." })
      .int({ message: "Startups supported must be a whole number." })
      .min(0, { message: "Startups supported cannot be negative." })
      .max(100000, { message: "Startups supported looks too high." }),
    impactDescription: z
      .string()
      .trim()
      .min(50, { message: "Impact description must be at least 50 characters." })
      .max(1000, { message: "Impact description must be 1000 characters or less." }),

    // Agreement
    termsAgreed: z.boolean().refine((value) => value, {
      message: "You must agree to the terms and conditions.",
    }),
  });

  type FormValues = z.infer<typeof formSchema>;

  const stepFieldMap: Record<number, (keyof FormValues)[]> = {
    1: ["name", "type", "websiteUrl", "description"],
    2: ["address", "city", "region"],
    3: ["contactName", "contactEmail", "contactPhone"],
    4: ["services", "serviceDescription", "yearsOfOperation", "startupsSupported", "impactDescription"],
    5: [], // Document uploads handled via separate state
    6: ["termsAgreed"],
  };

  const defaultValues = {
    name: "",
    type: undefined,
    websiteUrl: "",
    description: "",
    address: "",
    city: "",
    region: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    services: [],
    serviceDescription: "",
    yearsOfOperation: undefined,
    startupsSupported: undefined,
    impactDescription: "",
    termsAgreed: false,
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    shouldUnregister: false,
  });

  const { reset } = form;
  const reviewValues = form.watch();

  useEffect(() => {
    setMounted(true);

    if (!isEditMode) {
      reset(defaultValues);
      setExistingApplicationStatus(null);
      setExistingBusinessLicenseId(null);
      setExistingTaxRegistrationId(null);
      setExistingBusinessLicenseName(null);
      setExistingTaxRegistrationName(null);
      setSubmitError(null);
      setIsLoadingData(false);
      return;
    }

    async function fetchExistingApplication() {
      try {
        const applicationId = searchParams.get("applicationId");
        const endpoint = applicationId
          ? `/api/ecosystem-builder/apply?applicationId=${encodeURIComponent(applicationId)}`
          : "/api/ecosystem-builder/apply";
        const response = await fetch(endpoint);
        const result = await response.json() as ExistingApplicationResponse;
        if (!response.ok) {
          setSubmitError(result.error || "Failed to load application.");
          return;
        }

        if (result.success && result.data) {
          const app = result.data;
          setExistingApplicationStatus(app.workflowStatus);

          if (!app.canEdit) {
            setSubmitError("This application can no longer be edited.");
            router.replace("/ecosystem-builder/application");
            return;
          }

          const validType = ["COWORKING", "INCUBATOR", "ACCELERATOR", "INVESTOR", "TRAINING", "OTHER"].includes(app.type)
            ? app.type
            : "OTHER";

          reset({
            name: app.name || "",
            type: validType as any,
            websiteUrl: app.website || "",
            description: app.description || "",
            address: app.address || "",
            city: app.city || app.location || "",
            region: app.region || "",
            contactName: app.contactName || "",
            contactEmail: app.contactEmail || "",
            contactPhone: app.contactPhone || "",
            services: Array.isArray(app.services) ? app.services : [],
            serviceDescription: app.serviceDescription || "",
            yearsOfOperation: app.yearsOfOperation ?? undefined,
            startupsSupported: app.capacity ?? undefined,
            impactDescription: app.impactDescription || "",
            termsAgreed: true,
          });

          // Set existing file data
          if (app.businessLicenseFileId) {
            setExistingBusinessLicenseId(app.businessLicenseFileId);
            setExistingBusinessLicenseName(app.businessLicenseFileName);
          }
          if (app.taxRegistrationFileId) {
            setExistingTaxRegistrationId(app.taxRegistrationFileId);
            setExistingTaxRegistrationName(app.taxRegistrationFileName);
          }
        } else {
          setSubmitError("No editable application found.");
          router.replace("/ecosystem-builder/application");
        }
      } catch (error) {
        console.error("Failed to fetch existing application:", error);
        setSubmitError("Failed to load existing application.");
      } finally {
        setIsLoadingData(false);
      }
    }
    void fetchExistingApplication();
  }, [reset, isEditMode, searchParams, router]);

  const uploadFile = async (file: File, category: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", category);
    const res = await fetch("/api/files/upload", {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error("File upload failed");
    const data = await res.json();
    return data.id;
  };

  const submitApplication = async (values: Partial<z.infer<typeof formSchema>>, submissionMode: SubmissionMode) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setLastSubmissionMode(submissionMode);

    try {
      let finalBusinessLicenseId = existingBusinessLicenseId;
      let finalTaxRegistrationId = existingTaxRegistrationId;

      if (submissionMode === "submit" && !businessLicenseFile && !existingBusinessLicenseId) {
        setSubmitError("Please upload your business license document.");
        setIsSubmitting(false);
        return;
      }

      if (submissionMode === "submit" && !taxRegistrationFile && !existingTaxRegistrationId) {
        setSubmitError("Please upload your tax registration document.");
        setIsSubmitting(false);
        return;
      }

      if (submissionMode === "submit") {
        if (businessLicenseFile) {
          finalBusinessLicenseId = await uploadFile(businessLicenseFile, "BUSINESS_LICENSE");
        }

        if (taxRegistrationFile) {
          finalTaxRegistrationId = await uploadFile(taxRegistrationFile, "TAX_REGISTRATION");
        }
      }

      const finalValues = {
        ...values,
        applicationId: isEditMode ? editApplicationId ?? undefined : undefined,
        businessLicenseFileId: finalBusinessLicenseId,
        taxRegistrationFileId: finalTaxRegistrationId,
        submissionMode,
      };

      const response = await fetch("/api/ecosystem-builder/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(finalValues),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (result?.details && typeof result.details === "object") {
          for (const [key, messages] of Object.entries(result.details as Record<string, string[]>)) {
            if (Array.isArray(messages) && messages[0]) {
              form.setError(key as keyof z.infer<typeof formSchema>, {
                type: "server",
                message: messages[0],
              });
            }
          }
        }

        setSubmitError(result?.error || "Failed to submit application. Please try again.");
        return;
      }

      setIsSubmitted(true);
    } catch {
      setSubmitError("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await submitApplication(values, "submit");
  };

  const onSaveDraft = form.handleSubmit(async (values) => {
    await submitApplication(values, "draft");
  });

  const nextStep = async () => {
    const fields = stepFieldMap[currentStep] || [];
    let isStepValid = true;

    if (fields.length > 0) {
      isStepValid = await form.trigger(fields, { shouldFocus: true });
    }

    if (currentStep === 5) {
      const hasBusinessLicense = businessLicenseFile || existingBusinessLicenseId;
      const hasTaxRegistration = taxRegistrationFile || existingTaxRegistrationId;

      if (!hasBusinessLicense || !hasTaxRegistration) {
        setDocumentError("Both business license and tax registration files are required.");
        isStepValid = false;
      } else {
        setDocumentError(null);
      }
    }

    if (isStepValid && currentStep < 6) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const services = [
    { id: "coworking", label: "Coworking Space" },
    { id: "mentorship", label: "Mentorship" },
    { id: "funding", label: "Funding" },
    { id: "networking", label: "Networking Events" },
    { id: "training", label: "Training & Workshops" },
    { id: "legal", label: "Legal Support" },
    { id: "marketing", label: "Marketing Support" },
    { id: "technical", label: "Technical Support" },
  ];

  if (!mounted || isLoadingData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white gap-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-brand-mint-teal/10 border-t-brand-mint-teal rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-brand-deep-dark rounded-xl" />
          </div>
        </div>
        <div className="text-center space-y-1">
          <p className="text-[10px] font-black text-brand-deep-dark uppercase tracking-[0.3em] animate-pulse">Initializing Terminal</p>
          <p className="text-[10px] font-bold text-brand-deep-dark/40 uppercase tracking-widest">Establishing Institutional Context</p>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-xl w-full text-center space-y-8">
          <div className="relative inline-block">
            <div className="w-24 h-24 bg-brand-mint-teal/10 rounded-[2.5rem] flex items-center justify-center mx-auto border-2 border-brand-mint-teal shadow-2xl shadow-brand-mint-teal/20">
              <CheckCircle className="h-12 w-12 text-brand-mint-teal" />
            </div>
            <div className="absolute -top-2 -right-2 p-2 bg-brand-startup-amber rounded-full shadow-lg">
              <div className="w-3 h-3 bg-brand-deep-dark rounded-full animate-pulse" />
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl font-black text-brand-mint-teal tracking-tighter">
              {lastSubmissionMode === "draft" ? "Dossier Archived" : "Institutional Application Certified"}
            </h1>
            <p className="text-brand-deep-dark/60 font-bold uppercase tracking-widest text-xs max-w-md mx-auto leading-relaxed">
              {lastSubmissionMode === "draft"
                ? "Your registration draft has been securely archived in the administrative registry. You may continue the process at any time."
                : "Your application has been logged into the NSLP terminal and is now awaiting institutional review by the board of evaluators."}
            </p>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="rounded-full bg-brand-mint-teal text-white hover:bg-brand-mint-teal/90 font-black px-8 h-14 shadow-xl shadow-brand-mint-teal/20 border-2 border-brand-mint-teal">
              <Link href="/ecosystem-builder/application">
                Dossier Status Hub <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="ghost" asChild size="lg" className="rounded-full text-brand-mint-teal font-black hover:bg-brand-mint-teal/5 h-14">
              <Link href="/ecosystem-builder">Institutional Home</Link>
            </Button>
          </div>

          <div className="pt-12 border-t border-slate-100">
            <p className="text-[10px] font-black text-brand-mint-teal uppercase tracking-[0.4em]">StartupET NSLP Administrative Terminal</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-5">
      {/* Premium Sticky Header */}
      <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200 shadow-sm backdrop-blur-md bg-white">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full hover:bg-slate-100">
              <ArrowLeft className="h-5 w-5 text-slate-600" />
            </Button>
            <div className="flex items-center gap-3">
              <h1 className="text-xl md:text-2xl font-black text-brand-deep-dark leading-none whitespace-nowrap">
                Ecosystem Builder <span className="text-brand-startup-amber">Application</span>
              </h1>
              <div className="h-4 w-1 bg-brand-mint-teal rounded-full" />
              <p className="text-[10px] sm:text-xs text-brand-deep-dark/60 font-bold uppercase whitespace-nowrap">
                Step <span className="text-brand-mint-teal">{currentStep}</span> of 6
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="rounded-full border-2 border-brand-mint-teal text-brand-mint-teal font-bold hover:bg-brand-mint-teal hover:text-white transition-all shadow-sm px-6 h-10"
            >
              Cancel
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto py-12 px-4">
        {isEditMode && existingApplicationStatus ? (
          <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-brand-mint-teal/5 border border-brand-mint-teal/20 rounded-full">
            <div className="w-2 h-2 rounded-full bg-brand-mint-teal animate-pulse" />
            <p className="text-xs font-bold text-brand-deep-dark uppercase tracking-tight">
              Reviewing: <span className="text-brand-mint-teal">{existingApplicationStatus.replace(/_/g, " ")}</span>
            </p>
          </div>
        ) : null}

        <div className="mb-5">
          <div className="flex justify-between items-center relative gap-4">
            {/* Progress Line */}
            <div className="absolute top-5 left-0 w-full h-[2px] bg-slate-100 -z-10" />
            <div
              className="absolute top-5 left-0 h-[2px] bg-brand-mint-teal transition-all duration-500 ease-in-out -z-10"
              style={{ width: `${((currentStep - 1) / 5) * 100}%` }}
            />

            {[
              { num: 1, label: "Identity" },
              { num: 2, label: "Location" },
              { num: 3, label: "Contact" },
              { num: 4, label: "Services" },
              { num: 5, label: "Legal" },
              { num: 6, label: "Review" }
            ].map((step) => (
              <div key={step.num} className="flex flex-col items-center gap-2">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-black transition-all duration-300 border-2 ${step.num === currentStep
                    ? "border-brand-startup-amber bg-brand-startup-amber text-brand-deep-dark shadow-lg shadow-brand-startup-amber/20 scale-110"
                    : step.num < currentStep
                      ? "border-brand-mint-teal bg-brand-mint-teal text-white"
                      : "border-slate-200 bg-white text-slate-400"
                    }`}
                >
                  {step.num < currentStep ? (
                    <CheckCircle className="h-6 w-6" />
                  ) : (
                    step.num
                  )}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest ${step.num === currentStep ? "text-brand-startup-amber" : step.num < currentStep ? "text-brand-mint-teal" : "text-slate-400"}`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden min-h-[600px] flex flex-col">
              <div className="p-4 md:p-8 flex-1">
                <div className="mb-8">
                  <h3 className="text-2xl font-black text-brand-deep-dark">
                    {currentStep === 1 && "Organization Identity"}
                    {currentStep === 2 && "Institutional Location"}
                    {currentStep === 3 && "Administrative Contact"}
                    {currentStep === 4 && "Services & Operations"}
                    {currentStep === 5 && "Verification Documents"}
                    {currentStep === 6 && "Final Review & Submission"}
                  </h3>
                </div>
                <div className="space-y-6">
                  {/* Step 1: Basic Information */}
                  {currentStep === 1 && (
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Organization Name <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your organization name" {...field} className="border-brand-mint-teal/40 focus-visible:ring-brand-mint-teal rounded-xl h-11 bg-white shadow-sm" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Organization Type <span className="text-red-500">*</span></FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="border-brand-mint-teal/40 focus:ring-brand-mint-teal rounded-xl h-11 bg-white shadow-sm">
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-white border border-brand-mint-teal shadow-xl shadow-brand-mint-teal/10 z-[100] text-brand-deep-dark">
                                <SelectItem value="COWORKING" className="font-bold focus:bg-brand-mint-teal/10 focus:text-brand-mint-teal">Coworking Space</SelectItem>
                                <SelectItem value="INCUBATOR" className="font-bold focus:bg-brand-mint-teal/10 focus:text-brand-mint-teal">Incubator</SelectItem>
                                <SelectItem value="ACCELERATOR" className="font-bold focus:bg-brand-mint-teal/10 focus:text-brand-mint-teal">Accelerator</SelectItem>
                                <SelectItem value="INVESTOR" className="font-bold focus:bg-brand-mint-teal/10 focus:text-brand-mint-teal">Investor/VC</SelectItem>
                                <SelectItem value="TRAINING" className="font-bold focus:bg-brand-mint-teal/10 focus:text-brand-mint-teal">Training Institution</SelectItem>
                                <SelectItem value="OTHER" className="font-bold focus:bg-brand-mint-teal/10 focus:text-brand-mint-teal">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="websiteUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Website URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://www.example.com" {...field} className="border-brand-mint-teal/40 focus-visible:ring-brand-mint-teal rounded-xl h-11 bg-white shadow-sm" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex justify-between items-center">
                              <FormLabel>Detailed Institutional Profile <span className="text-red-500">*</span></FormLabel>
                              <span className={`text-[10px] font-black uppercase tracking-widest ${(field.value?.length || 0) > 500 ? "text-red-500" : "text-brand-mint-teal/40"}`}>
                                {(field.value?.length || 0)} / 500
                              </span>
                            </div>
                            <FormControl>
                              <Textarea
                                placeholder="Briefly describe your organization and its mission"
                                className="min-h-[120px] border-brand-mint-teal/40 focus-visible:ring-brand-mint-teal rounded-2xl bg-white shadow-sm"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {/* Step 2: Location Details */}
                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Street Address <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your street address" {...field} className="border-brand-mint-teal/40 focus-visible:ring-brand-mint-teal rounded-xl h-11 bg-white shadow-sm" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your city" {...field} className="border-brand-mint-teal/40 focus-visible:ring-brand-mint-teal rounded-xl h-11 bg-white shadow-sm" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="region"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Region <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your region" {...field} className="border-brand-mint-teal/40 focus-visible:ring-brand-mint-teal rounded-xl h-11 bg-white shadow-sm" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {/* Step 3: Contact Information */}
                  {currentStep === 3 && (
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="contactName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Person&apos;s Name <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                              <Input placeholder="Enter the primary contact's name" {...field} className="border-brand-mint-teal/40 focus-visible:ring-brand-mint-teal rounded-xl h-11 bg-white shadow-sm" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="contactEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Email <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="Enter contact email address" {...field} className="border-brand-mint-teal/40 focus-visible:ring-brand-mint-teal rounded-xl h-11 bg-white shadow-sm" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="contactPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Phone Number <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                              <Input placeholder="Enter contact phone number" {...field} className="border-brand-mint-teal/40 focus-visible:ring-brand-mint-teal rounded-xl h-11 bg-white shadow-sm" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {/* Step 4: Services & Impact */}
                  {currentStep === 4 && (
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-black text-brand-deep-dark">Registry Services</h3>
                        <FormField
                          control={form.control}
                          name="services"
                          render={({ field }) => (
                            <FormItem>
                              <div className="grid grid-cols-2 gap-4">
                                {services.map((service) => (
                                  <FormItem
                                    key={service.id}
                                    className="flex flex-row items-center space-x-3 space-y-0 p-3 rounded-xl border border-brand-mint-teal/10 bg-brand-mint-teal/5 transition-all hover:border-brand-mint-teal/30"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(service.id)}
                                        onCheckedChange={(checked) => {
                                          const current = field.value || [];
                                          return checked
                                            ? field.onChange([...current, service.id])
                                            : field.onChange(
                                              current.filter(
                                                (value) => value !== service.id
                                              )
                                            );
                                        }}
                                        className="border-brand-mint-teal data-[state=checked]:bg-brand-mint-teal data-[state=checked]:text-white"
                                      />
                                    </FormControl>
                                    <FormLabel className="font-bold text-xs text-brand-deep-dark cursor-pointer flex-1">
                                      {service.label}
                                    </FormLabel>
                                  </FormItem>
                                ))}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="serviceDescription"
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex justify-between items-center">
                                <FormLabel>Operational Mandate <span className="text-red-500">*</span></FormLabel>
                                <span className={`text-[10px] font-black uppercase tracking-widest ${(field.value?.length || 0) > 1000 ? "text-red-500" : "text-brand-mint-teal/40"}`}>
                                  {(field.value?.length || 0)} / 1000
                                </span>
                              </div>
                              <FormControl>
                                <Textarea
                                  placeholder="Describe your organization's primary support mechanisms..."
                                  className="min-h-[120px] border-brand-mint-teal/40 focus-visible:ring-brand-mint-teal rounded-2xl bg-white shadow-sm"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-lg font-black text-brand-deep-dark">Track Record & Institutional Impact</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="yearsOfOperation"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Years of Operation <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="0"
                                    placeholder="0"
                                    className="border-brand-mint-teal/40 focus-visible:ring-brand-mint-teal rounded-xl h-11 bg-white shadow-sm"
                                    value={field.value ?? ""}
                                    onChange={field.onChange}
                                    onBlur={field.onBlur}
                                    name={field.name}
                                    ref={field.ref}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="startupsSupported"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Entities Supported <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="0"
                                    placeholder="0"
                                    className="border-brand-mint-teal/40 focus-visible:ring-brand-mint-teal rounded-xl h-11 bg-white shadow-sm"
                                    value={field.value ?? ""}
                                    onChange={field.onChange}
                                    onBlur={field.onBlur}
                                    name={field.name}
                                    ref={field.ref}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={form.control}
                          name="impactDescription"
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex justify-between items-center">
                                <FormLabel>Impact Assessment <span className="text-red-500">*</span></FormLabel>
                                <span className={`text-[10px] font-black uppercase tracking-widest ${(field.value?.length || 0) > 1000 ? "text-red-500" : "text-brand-mint-teal/40"}`}>
                                  {(field.value?.length || 0)} / 1000
                                </span>
                              </div>
                              <FormControl>
                                <Textarea
                                  placeholder="Detail your contributions to the startup ecosystem..."
                                  className="min-h-[120px] border-brand-mint-teal/40 focus-visible:ring-brand-mint-teal rounded-2xl bg-white shadow-sm"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}

                  {currentStep === 5 && (
                    <div className="space-y-6">
                      {documentError && (
                        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                          {documentError}
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="businessLicense" className="font-bold text-brand-deep-dark">Business License Document <span className="text-red-500">*</span></Label>
                        <Input
                          id="businessLicense"
                          type="file"
                          accept=".pdf"
                          onChange={(e) => {
                            const file = e.target.files ? e.target.files[0] : null;
                            setBusinessLicenseFile(file);
                            if (file) setDocumentError(null);
                          }}
                        />
                        <p className="text-[10px] font-bold text-brand-deep-dark/60 uppercase tracking-tight italic">
                          {businessLicenseFile
                            ? `File queue: ${businessLicenseFile.name}`
                            : existingBusinessLicenseId
                              ? `Verified: ${existingBusinessLicenseName || "document.pdf"} (upload to replace)`
                              : "No file selected"}
                        </p>
                      </div>

                      <div className="space-y-2 pt-4">
                        <Label htmlFor="taxRegistration" className="font-bold text-brand-deep-dark">Tax Registration Document (TIN) <span className="text-red-500">*</span></Label>
                        <Input
                          id="taxRegistration"
                          type="file"
                          accept=".pdf"
                          onChange={(e) => {
                            const file = e.target.files ? e.target.files[0] : null;
                            setTaxRegistrationFile(file);
                            if (file) setDocumentError(null);
                          }}
                        />
                        <p className="text-[10px] font-bold text-brand-deep-dark/60 uppercase tracking-tight italic">
                          {taxRegistrationFile
                            ? `File queue: ${taxRegistrationFile.name}`
                            : existingTaxRegistrationId
                              ? `Verified: ${existingTaxRegistrationName || "tin-document.pdf"} (upload to replace)`
                              : "No file selected"}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Step 6: Review & Submit */}
                  {currentStep === 6 && (
                    <div className="space-y-6">
                      <div className="p-6 rounded-[2rem] bg-slate-50/50 border border-slate-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-1">
                            <h3 className="text-sm font-black text-brand-deep-dark uppercase tracking-tight leading-none">Organization Identity</h3>
                            <p className="text-base font-black text-brand-deep-dark">{reviewValues.name || "--"}</p>
                            <p className="text-xs font-bold text-brand-deep-dark/60 uppercase">{reviewValues.type || "--"}</p>
                          </div>
                          <div className="space-y-1">
                            <h3 className="text-sm font-black text-brand-deep-dark uppercase tracking-tight leading-none">Institutional Presence</h3>
                            <p className="text-base font-black text-brand-deep-dark">{(reviewValues.city || "--")}, {(reviewValues.region || "--")}</p>
                            <p className="text-xs font-bold text-brand-deep-dark/60 truncate">{reviewValues.websiteUrl || "No website provided"}</p>
                          </div>
                          <div className="space-y-1">
                            <h3 className="text-sm font-black text-brand-deep-dark uppercase tracking-tight leading-none">Administrative Liaison</h3>
                            <p className="text-base font-black text-brand-deep-dark">{reviewValues.contactName || "--"}</p>
                            <p className="text-xs font-bold text-brand-deep-dark/60">
                              {reviewValues.contactEmail || "no email"} | {reviewValues.contactPhone || "no phone"}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <h3 className="text-sm font-black text-brand-deep-dark uppercase tracking-tight leading-none">Operational Track Record</h3>
                            <p className="text-base font-black text-brand-deep-dark">{reviewValues.yearsOfOperation ?? 0} Years Active</p>
                            <p className="text-xs font-bold text-brand-deep-dark/60">{reviewValues.startupsSupported ?? 0} Entities Supported</p>
                          </div>
                        </div>

                        {/* Narrative Sections */}
                        <div className="mt-8 space-y-6">
                          <div className="space-y-2">
                            <h3 className="text-sm font-black text-brand-deep-dark uppercase tracking-tight leading-none">Service Portfolio</h3>
                            <div className="flex flex-wrap gap-2 pt-1">
                              {reviewValues.services?.map((s) => (
                                <span key={s} className="px-3 py-1 bg-brand-mint-teal/10 text-brand-mint-teal rounded-full text-[10px] font-black uppercase tracking-widest border border-brand-mint-teal/20">
                                  {services.find(svc => svc.id === s)?.label || s}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-3 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
                              <h3 className="text-sm font-black text-brand-deep-dark uppercase tracking-tight leading-none">Detailed Institutional Profile</h3>
                              <p className="text-sm text-brand-deep-dark/80 leading-relaxed font-medium italic">{reviewValues.description || "No description provided."}</p>
                            </div>
                            <div className="space-y-3 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
                              <h3 className="text-sm font-black text-brand-deep-dark uppercase tracking-tight leading-none">Operational Mandate Delivery</h3>
                              <p className="text-sm text-brand-deep-dark/80 leading-relaxed font-medium italic">{reviewValues.serviceDescription || "No mandate details provided."}</p>
                            </div>
                            <div className="space-y-3 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
                              <h3 className="text-sm font-black text-brand-deep-dark uppercase tracking-tight leading-none">Impact Assessment Report</h3>
                              <p className="text-sm text-brand-deep-dark/80 leading-relaxed font-medium italic">{reviewValues.impactDescription || "No impact assessment provided."}</p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-slate-200">
                          <h3 className="text-sm font-black text-brand-deep-dark uppercase tracking-tight mb-4">Verification Artifacts</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                              <div className="p-2 bg-brand-mint-teal/10 rounded-lg text-brand-mint-teal">
                                <CheckCircle className="h-4 w-4" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-[10px] font-black text-brand-deep-dark uppercase tracking-tight">Business License</p>
                                <p className="text-[10px] text-brand-deep-dark/60 font-bold truncate">{businessLicenseFile?.name || existingBusinessLicenseName || "Not Provided"}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                              <div className="p-2 bg-brand-mint-teal/10 rounded-lg text-brand-mint-teal">
                                <CheckCircle className="h-4 w-4" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-[10px] font-black text-brand-deep-dark uppercase tracking-tight">Tax Identification</p>
                                <p className="text-[10px] text-brand-deep-dark/60 font-bold truncate">{taxRegistrationFile?.name || existingTaxRegistrationName || "Not Provided"}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <FormField
                        control={form.control}
                        name="termsAgreed"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-4 space-y-0 p-6 rounded-2xl border-2 border-brand-mint-teal/10 bg-brand-mint-teal/5 mt-12">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                className="w-6 h-6 border-brand-mint-teal data-[state=checked]:bg-brand-mint-teal data-[state=checked]:text-white rounded-lg"
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1">
                              <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-mint-teal">
                                Official Confirmation
                              </FormLabel>
                              <p className="text-xs font-bold text-brand-deep-dark/80 leading-relaxed uppercase tracking-tight">
                                I certify that this dossier represents the official record of the organization and all artifacts are legally authentic.
                              </p>
                            </div>
                          </FormItem>
                        )}
                      />

                      {submitError && (
                        <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-xs font-bold animate-shake">
                          {submitError}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="p-4 md:p-8 bg-slate-50 border-t border-slate-200 flex justify-between items-center group-last:rounded-b-[2.5rem]">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    className="rounded-full border-2 border-brand-mint-teal text-brand-mint-teal font-bold hover:bg-brand-mint-teal/5"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                  </Button>
                )}
                {currentStep < 6 ? (
                  <Button
                    type="button"
                    className="ml-auto rounded-full bg-brand-mint-teal hover:bg-brand-mint-teal/90 text-white font-bold px-8 h-12 shadow-lg shadow-brand-mint-teal/20"
                    onClick={() => void nextStep()}
                  >
                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <div className="ml-auto flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-full border-2 border-slate-200 font-bold hover:bg-slate-50 px-8 h-12"
                      onClick={() => void onSaveDraft()}
                      disabled={isSubmitting}
                    >
                      {isSubmitting && lastSubmissionMode === "draft" ? "Saving..." : "Save Draft"}
                    </Button>
                    <Button
                      type="submit"
                      className="rounded-full bg-brand-startup-amber hover:bg-brand-startup-amber/90 text-brand-deep-dark font-black px-10 h-12 shadow-lg shadow-brand-startup-amber/20 transition-all active:scale-95"
                      disabled={isSubmitting}
                    >
                      {isSubmitting && lastSubmissionMode === "submit" ? "Certifying..." : "Confirm & Submit"}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </form>
        </Form>
      </main>
    </div>
  );
}

export default function EcosystemBuilderApplication() {
  return (
    <Suspense fallback={<div>Loading application form...</div>}>
      <EcosystemBuilderApplicationContent />
    </Suspense>
  );
}
