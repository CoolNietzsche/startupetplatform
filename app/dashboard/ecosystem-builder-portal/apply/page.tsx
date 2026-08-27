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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle, Upload } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { DetailedStepIndicator } from "../../application/components/DetailedStepIndicator";
import { AlertCircle, Loader2 } from "lucide-react";
import EthiopianDatePicker from "react-ethiopian-datepicker";

const STEPS = [
  { id: "basic", name: "Basic Info" },
  { id: "location", name: "Location" },
  { id: "contact", name: "Contact" },
  { id: "services", name: "Services" },
  { id: "review", name: "Review" },
];

const STEP_ID_TO_NUM: Record<string, number> = {
  basic: 1,
  location: 2,
  contact: 3,
  services: 4,
  review: 5,
};

const NUM_TO_STEP_ID: Record<number, string> = {
  1: "basic",
  2: "location",
  3: "contact",
  4: "services",
  5: "review",
};

// Client Component since it uses React hooks
export default function EcosystemBuilderApplication() {
  const [currentStepId, setCurrentStepId] = useState("basic");
  const currentStep = STEP_ID_TO_NUM[currentStepId];
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const router = useRouter(); // Error: useRouter not imported

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
      .max(500, { message: "Service description must be 500 characters or less." }),

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
    foundationDate: z.string().optional(),
  });

  type FormValues = z.infer<typeof formSchema>;

  const stepFieldMap: Record<number, (keyof FormValues)[]> = {
    1: ["name", "type", "websiteUrl", "description"],
    2: ["address", "city", "region"],
    3: ["contactName", "contactEmail", "contactPhone"],
    4: ["services", "serviceDescription", "yearsOfOperation", "startupsSupported", "impactDescription"],
    5: ["termsAgreed"],
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
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
      foundationDate: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);

    // Here you would submit the data to your API

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const nextStep = async () => {
    const fields = stepFieldMap[currentStep];
    const isStepValid = await form.trigger(fields, { shouldFocus: true });

    if (isStepValid && currentStep < 5) {
      setCurrentStepId(NUM_TO_STEP_ID[currentStep + 1]);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStepId(NUM_TO_STEP_ID[currentStep - 1]);
      window.scrollTo({ top: 0, behavior: "smooth" });
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

  if (isSubmitted) {
    return (
      <div className="container max-w-3xl py-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-2xl">Application Submitted</CardTitle>
            <CardDescription className="text-center">
              Thank you for applying to become a verified ecosystem builder.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <p>Your application has been received and is now under review.</p>
              <p className="text-sm text-muted-foreground">
                Our team will review your application within 5-7 business days.
                You will receive an email notification once the review is complete.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button asChild>
              <Link href="/dashboard/ecosystem-builder-portal">Return to Dashboard</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Premium Sticky Header */}
      <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200 shadow-sm backdrop-blur-md bg-white/90">
        <div className="max-w-7xl mx-auto px-4 h-24 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full hover:bg-slate-100">
              <ArrowLeft className="h-5 w-5 text-slate-600" />
            </Button>
            <div className="flex items-center gap-3">
              <h1 className="text-xl md:text-2xl font-black text-brand-deep-dark leading-none whitespace-nowrap">
                New <span className="text-brand-startup-amber">Ecosystem Application</span>
              </h1>
              <div className="h-4 w-1 bg-brand-mint-teal rounded-full" />
              <p className="text-[10px] sm:text-xs text-brand-deep-dark/60 font-bold uppercase whitespace-nowrap">
                Step <span className="text-brand-mint-teal">{currentStep}</span> of {STEPS.length}
              </p>
            </div>
          </div>

          <div className="hidden lg:block flex-1 max-w-3xl ml-12">
            <DetailedStepIndicator steps={STEPS} currentStep={currentStepId} />
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
        {/* Mobile Indicator */}
        <div className="lg:hidden border-t border-slate-100 py-3">
          <DetailedStepIndicator steps={STEPS} currentStep={currentStepId} />
        </div>
      </header>

      <main className="max-w-5xl mx-auto py-12 px-4">

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden min-h-[600px] flex flex-col">
              <div className="p-4 md:p-8 flex-1">
                <div className="mb-8">
                  <h3 className="text-2xl font-black text-brand-deep-dark">
                    {currentStep === 1 && "Basic Information"}
                    {currentStep === 2 && "Location Details"}
                    {currentStep === 3 && "Contact Information"}
                    {currentStep === 4 && "Services & Impact"}
                    {currentStep === 5 && "Review & Submit"}
                  </h3>
                  <p className="text-brand-deep-dark/60 font-medium text-sm">
                    {currentStep === 1 && "Tell us about your organization's core details."}
                    {currentStep === 2 && "Where is your primary headquarters located?"}
                    {currentStep === 3 && "Who is the primary point of contact for this application?"}
                    {currentStep === 4 && "Highlight your contributions to the startup ecosystem."}
                    {currentStep === 5 && "Final review of your application data."}
                  </p>
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
                            <FormLabel className="font-bold text-brand-deep-dark">Organization Name <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your organization name" {...field} className="border-brand-mint-teal/40 focus-visible:ring-brand-mint-teal rounded-xl h-11" />
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
                            <FormLabel className="font-bold text-brand-deep-dark">Organization Type <span className="text-red-500">*</span></FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="border-brand-mint-teal/40 focus:ring-brand-mint-teal rounded-xl h-11">
                                  <SelectValue placeholder="Select organization type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="COWORKING">Coworking Space</SelectItem>
                                <SelectItem value="INCUBATOR">Incubator</SelectItem>
                                <SelectItem value="ACCELERATOR">Accelerator</SelectItem>
                                <SelectItem value="INVESTOR">Investor/VC</SelectItem>
                                <SelectItem value="TRAINING">Training Institution</SelectItem>
                                <SelectItem value="OTHER">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="space-y-2">
                        <FormLabel className="font-bold text-brand-deep-dark">Foundation Date</FormLabel>
                        <EthiopianDatePicker
                          value={form.getValues("foundationDate") ? new Date(form.getValues("foundationDate")!) : null}
                          onChange={(d: Date | null) => {
                            const value = d ? d.toISOString().split("T")[0] : "";
                            form.setValue("foundationDate", value);
                          }}
                          customization={{
                            colors: {
                              primary: "#11838d", // brand-mint-teal
                              accent: "#f59e0b", // brand-startup-amber
                              background: "#ffffff",
                              border: "#e2e8f0",
                            }
                          }}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="websiteUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-bold text-brand-deep-dark">Website URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://www.example.com" {...field} className="border-brand-mint-teal/40 focus-visible:ring-brand-mint-teal rounded-xl h-11" />
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
                            <FormLabel className="font-bold text-brand-deep-dark">Organization Description <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Briefly describe your organization and its mission"
                                className="min-h-[120px] border-brand-mint-teal/40 focus-visible:ring-brand-mint-teal rounded-2xl"
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
                            <FormLabel className="font-bold text-brand-deep-dark">Street Address <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your street address" {...field} className="border-brand-mint-teal/40 focus-visible:ring-brand-mint-teal rounded-xl h-11" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-bold text-brand-deep-dark">City <span className="text-red-500">*</span></FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your city" {...field} className="border-brand-mint-teal/40 focus-visible:ring-brand-mint-teal rounded-xl h-11" />
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
                              <FormLabel className="font-bold text-brand-deep-dark">Region <span className="text-red-500">*</span></FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your region" {...field} className="border-brand-mint-teal/40 focus-visible:ring-brand-mint-teal rounded-xl h-11" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="p-6 border-2 border-dashed border-brand-mint-teal/20 rounded-2xl bg-brand-mint-teal/5">
                        <h3 className="font-bold text-brand-deep-dark mb-2">Upload Supporting Documents</h3>
                        <p className="text-[11px] font-bold uppercase tracking-tight text-brand-deep-dark/40 mb-4">
                          Please upload proof of physical location (such as a lease agreement or utility bill)
                        </p>
                        <div className="flex flex-col items-center justify-center py-8">
                          <div className="h-12 w-12 rounded-2xl bg-brand-mint-teal/10 flex items-center justify-center text-brand-mint-teal mb-3">
                            <Upload className="h-6 w-6" />
                          </div>
                          <p className="text-sm font-bold text-brand-deep-dark mb-1">Select files or drag and drop</p>
                          <p className="text-[10px] font-black text-brand-mint-teal uppercase tracking-widest mb-4">PDF, JPG, or PNG (max 5MB)</p>
                          <Button size="sm" variant="outline" type="button" className="rounded-xl border-brand-mint-teal text-brand-mint-teal font-bold px-6">
                            Choose Document
                          </Button>
                        </div>
                      </div>
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
                            <FormLabel className="font-bold text-brand-deep-dark">Contact Person&apos;s Name <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                              <Input placeholder="Full legal name" {...field} className="border-brand-mint-teal/40 focus-visible:ring-brand-mint-teal rounded-xl h-11" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="contactEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-bold text-brand-deep-dark">Contact Email <span className="text-red-500">*</span></FormLabel>
                              <FormControl>
                                <Input placeholder="email@address.com" type="email" {...field} className="border-brand-mint-teal/40 focus-visible:ring-brand-mint-teal rounded-xl h-11" />
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
                              <FormLabel className="font-bold text-brand-deep-dark">Contact Phone <span className="text-red-500">*</span></FormLabel>
                              <FormControl>
                                <Input placeholder="+251 ..." {...field} className="border-brand-mint-teal/40 focus-visible:ring-brand-mint-teal rounded-xl h-11" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="p-6 border-2 border-dashed border-brand-mint-teal/20 rounded-2xl bg-brand-mint-teal/5">
                        <h3 className="font-bold text-brand-deep-dark mb-2">Official Documentation</h3>
                        <p className="text-[11px] font-bold uppercase tracking-tight text-brand-deep-dark/40 mb-4">
                          Please upload official registration documents, business license, or any other proof of legal status.
                        </p>
                        <div className="flex flex-col items-center justify-center py-8">
                          <div className="h-12 w-12 rounded-2xl bg-brand-mint-teal/10 flex items-center justify-center text-brand-mint-teal mb-3">
                            <Upload className="h-6 w-6" />
                          </div>
                          <p className="text-sm font-bold text-brand-deep-dark mb-1">Select files or drag and drop</p>
                          <p className="text-[10px] font-black text-brand-mint-teal uppercase tracking-widest mb-4">PDF, JPG, or PNG (max 5MB)</p>
                          <Button size="sm" variant="outline" type="button" className="rounded-xl border-brand-mint-teal text-brand-mint-teal font-bold px-6">
                            Upload Document
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Services & Impact */}
                  {currentStep === 4 && (
                    <div className="space-y-6">
                      <FormField
                        control={form.control}
                        name="services"
                        render={() => (
                          <FormItem>
                            <div className="mb-4">
                              <FormLabel className="text-base">Services Offered</FormLabel>
                              <FormDescription>
                                Select all services that your organization provides to startups
                              </FormDescription>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              {services.map((service) => (
                                <FormField
                                  key={service.id}
                                  control={form.control}
                                  name="services"
                                  render={({ field }) => {
                                    return (
                                      <FormItem
                                        key={service.id}
                                        className="flex flex-row items-start space-x-3 space-y-0"
                                      >
                                        <FormControl>
                                          <Checkbox
                                            checked={field.value?.includes(service.id)}
                                            onCheckedChange={(checked) => {
                                              return checked
                                                ? field.onChange([...field.value, service.id])
                                                : field.onChange(
                                                  field.value?.filter(
                                                    (value) => value !== service.id
                                                  )
                                                )
                                            }}
                                          />
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                          {service.label}
                                        </FormLabel>
                                      </FormItem>
                                    )
                                  }}
                                />
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
                            <FormLabel className="font-bold text-brand-deep-dark">Detailed Service Description <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Please elaborate on your support programs..."
                                className="min-h-[120px] border-brand-mint-teal/40 focus-visible:ring-brand-mint-teal rounded-2xl"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="yearsOfOperation"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-bold text-brand-deep-dark">Years in Operation <span className="text-red-500">*</span></FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. 3" type="number" {...field} className="border-brand-mint-teal/40 focus-visible:ring-brand-mint-teal rounded-xl h-11" />
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
                              <FormLabel className="font-bold text-brand-deep-dark">Startups Supported <span className="text-red-500">*</span></FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. 25" type="number" {...field} className="border-brand-mint-teal/40 focus-visible:ring-brand-mint-teal rounded-xl h-11" />
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
                            <FormLabel className="font-bold text-brand-deep-dark">Ecosystem Impact Description <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Describe how your organization is improving the Ethiopian startup landscape..."
                                className="min-h-[120px] border-brand-mint-teal/40 focus-visible:ring-brand-mint-teal rounded-2xl"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription className="text-[11px] font-bold uppercase tracking-tight text-brand-deep-dark/40">
                              Provide specific examples, metrics, or success stories that demonstrate your impact.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="p-6 border-2 border-dashed border-brand-mint-teal/20 rounded-2xl bg-brand-mint-teal/5">
                        <h3 className="font-bold text-brand-deep-dark mb-2">Impact Evidence</h3>
                        <p className="text-[11px] font-bold uppercase tracking-tight text-brand-deep-dark/40 mb-4">
                          Please upload documentation, case studies, or other evidence supporting your impact claims.
                        </p>
                        <div className="flex flex-col items-center justify-center py-8">
                          <div className="h-12 w-12 rounded-2xl bg-brand-mint-teal/10 flex items-center justify-center text-brand-mint-teal mb-3">
                            <Upload className="h-6 w-6" />
                          </div>
                          <p className="text-sm font-bold text-brand-deep-dark mb-1">Select files or drag and drop</p>
                          <p className="text-[10px] font-black text-brand-mint-teal uppercase tracking-widest mb-4">PDF, JPG, or PNG (max 5MB)</p>
                          <Button size="sm" variant="outline" type="button" className="rounded-xl border-brand-mint-teal text-brand-mint-teal font-bold px-6">
                            Upload Evidence
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 5: Review & Submit */}
                  {currentStep === 5 && (
                    <div className="space-y-6">
                      <div className="rounded-md border">
                        <div className="p-4 bg-muted/50">
                          <h3 className="font-semibold">Basic Information</h3>
                        </div>
                        <div className="p-4 space-y-2">
                          <div className="grid grid-cols-3 gap-2">
                            <div className="text-sm font-medium">Organization Name</div>
                            <div className="text-sm col-span-2">{form.getValues("name") || "Not provided"}</div>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="text-sm font-medium">Organization Type</div>
                            <div className="text-sm col-span-2">
                              {form.getValues("type") === "COWORKING" && "Coworking Space"}
                              {form.getValues("type") === "INCUBATOR" && "Incubator"}
                              {form.getValues("type") === "ACCELERATOR" && "Accelerator"}
                              {form.getValues("type") === "INVESTOR" && "Investor/VC"}
                              {form.getValues("type") === "TRAINING" && "Training Institution"}
                              {form.getValues("type") === "OTHER" && "Other"}
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="text-sm font-medium">Website</div>
                            <div className="text-sm col-span-2">{form.getValues("websiteUrl") || "Not provided"}</div>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="text-sm font-medium">Description</div>
                            <div className="text-sm col-span-2">{form.getValues("description") || "Not provided"}</div>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-md border">
                        <div className="p-4 bg-muted/50">
                          <h3 className="font-semibold">Location & Contact</h3>
                        </div>
                        <div className="p-4 space-y-2">
                          <div className="grid grid-cols-3 gap-2">
                            <div className="text-sm font-medium">Address</div>
                            <div className="text-sm col-span-2">
                              {form.getValues("address")}, {form.getValues("city")}, {form.getValues("region")}
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="text-sm font-medium">Contact Person</div>
                            <div className="text-sm col-span-2">{form.getValues("contactName") || "Not provided"}</div>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="text-sm font-medium">Email</div>
                            <div className="text-sm col-span-2">{form.getValues("contactEmail") || "Not provided"}</div>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="text-sm font-medium">Phone</div>
                            <div className="text-sm col-span-2">{form.getValues("contactPhone") || "Not provided"}</div>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-md border">
                        <div className="p-4 bg-muted/50">
                          <h3 className="font-semibold">Services & Impact</h3>
                        </div>
                        <div className="p-4 space-y-4">
                          <div className="grid grid-cols-3 gap-2">
                            <div className="text-sm font-medium">Services Offered</div>
                            <div className="text-sm col-span-2">
                              <div className="flex flex-wrap gap-2">
                                {form.getValues("services").map((serviceId) => {
                                  const service = services.find((s) => s.id === serviceId);
                                  return service ? (
                                    <span
                                      key={serviceId}
                                      className="px-2 py-1 bg-muted text-xs rounded-md"
                                    >
                                      {service.label}
                                    </span>
                                  ) : null;
                                })}
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="text-sm font-medium">Service Description</div>
                            <div className="text-sm col-span-2">{form.getValues("serviceDescription") || "Not provided"}</div>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="text-sm font-medium">Years in Operation</div>
                            <div className="text-sm col-span-2">{form.getValues("yearsOfOperation") || "Not provided"}</div>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="text-sm font-medium">Startups Supported</div>
                            <div className="text-sm col-span-2">{form.getValues("startupsSupported") || "Not provided"}</div>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="text-sm font-medium">Impact Description</div>
                            <div className="text-sm col-span-2">{form.getValues("impactDescription") || "Not provided"}</div>
                          </div>
                        </div>
                      </div>

                      <FormField
                        control={form.control}
                        name="termsAgreed"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-2xl border-2 border-brand-mint-teal/10 bg-brand-mint-teal/5 p-6 mt-8">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="border-brand-mint-teal data-[state=checked]:bg-brand-mint-teal"
                              />
                            </FormControl>
                            <div className="space-y-1.5 leading-none">
                              <FormLabel className="text-brand-deep-dark font-black text-xs uppercase tracking-tight cursor-pointer">
                                I verify that all information provided is accurate and complete
                              </FormLabel>
                              <p className="text-[11px] font-bold text-brand-deep-dark/60 leading-relaxed uppercase tracking-widest">
                                By clicking this, you agree to the regulatory{" "}
                                <Link href="/terms-of-use" target="_blank" rel="noopener noreferrer" className="underline text-brand-startup-amber">
                                  Terms of Service
                                </Link>{" "}
                                and{" "}
                                <Link href="/terms-of-use#privacy" target="_blank" rel="noopener noreferrer" className="underline text-brand-startup-amber">
                                  Privacy Policy
                                </Link>
                                .
                              </p>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-slate-50/50 p-8 flex items-center justify-between border-t border-slate-100">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={prevStep}
                    disabled={currentStep === 1 || isSubmitting}
                    className="font-black uppercase text-[10px] tracking-widest text-brand-deep-dark/40 hover:text-brand-deep-dark transition-colors px-8"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Previous Step
                  </Button>

                  {currentStep < 5 ? (
                    <Button
                      type="button"
                      onClick={() => void nextStep()}
                      disabled={isSubmitting}
                      className="bg-brand-mint-teal hover:bg-brand-mint-teal/90 text-white font-black uppercase text-[10px] tracking-widest px-10 rounded-xl h-14 shadow-lg shadow-brand-mint-teal/20 transition-all hover:shadow-xl hover:-translate-y-0.5"
                    >
                      Confirm & Next
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-brand-startup-amber hover:bg-brand-startup-amber/90 text-white font-black uppercase text-[10px] tracking-widest px-12 rounded-xl h-14 shadow-lg shadow-brand-startup-amber/20 transition-all hover:shadow-xl hover:-translate-y-0.5"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Saving Registry...
                        </>
                      ) : (
                        "Authorize Submission"
                      )}
                    </Button>
                  )}
                </div>
              </div>
          </form>
        </Form>
      </main>
    </div>
  );
}
