"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, User, Users, Calendar, Building, GraduationCap, Briefcase, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";



// Step 1 validation schema
const personalDetailsSchema = z.object({
  fullName: z.string().min(3, "Full name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(9, "Valid phone number is required"),
  gender: z.string().optional(),
  city: z.string().min(2, "City is required"),
  organizationType: z.string().min(1, "Organization type is required"),
  organizationName: z.string().min(2, "Organization name is required"),
  jobTitle: z.string().min(2, "Job title is required")
});

// Step 2 validation schema (conditional on event type)
const eventSpecificSchema = z.object({
  attendanceType: z.string().min(1, "Please select attendance type"),
  dietaryRestrictions: z.string().optional(),
  expectations: z.string().optional(),
  howDidYouHear: z.string().min(1, "Please tell us how you heard about this event"),
  agreeToTerms: z.literal(true, {
    errorMap: () => ({ message: "You must agree to the terms and conditions" }),
  })
});

// For pitch events
const pitchDetailsSchema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  companyStage: z.string().min(1, "Company stage is required"),
  industry: z.string().min(1, "Industry is required"),
  pitchDescription: z.string().min(10, "Pitch description is required"),
  fundingNeeded: z.string().min(1, "Funding information is required"),
  teamSize: z.string().min(1, "Team size is required"),
  pitchDeck: z.string().optional()
});

type PersonalDetailsFormProps = {
  initialData: any;
  onSave: (data: any) => void;
  isSubmitting?: boolean;
}

type EventSpecificFormProps = {
  initialData: any;
  eventData: any;
  onBack: () => void;
  onSave: (data: any) => void;
  isSubmitting?: boolean;
}

type PitchDetailsFormProps = {
  initialData: any;
  onBack: () => void;
  onSave: (data: any) => void;
  isSubmitting?: boolean;
}

const PersonalDetailsForm = ({ initialData, onSave, isSubmitting }: PersonalDetailsFormProps) => {
  const { 
    register, 
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid } 
  } = useForm({
    resolver: zodResolver(personalDetailsSchema),
    defaultValues: initialData,
    mode: "onChange"
  });
  
  // Register Select fields
  React.useEffect(() => {
    register("gender");
    register("organizationType");
    
    // Set initial values if they exist
    if (initialData.gender) setValue("gender", initialData.gender);
    if (initialData.organizationType) setValue("organizationType", initialData.organizationType);
  }, [register, setValue, initialData]);
  
  // Watch fields
  const gender = watch("gender");
  const organizationType = watch("organizationType");
  
  const onSubmit = (data: any) => {
    onSave(data);
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name <span className="text-red-500">*</span></Label>
          <Input id="fullName" {...register("fullName")} />
          {errors.fullName && (
            <p className="text-sm text-red-500">{errors.fullName.message as string}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
          <Input id="email" type="email" {...register("email")} />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message as string}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number <span className="text-red-500">*</span></Label>
          <Input id="phone" {...register("phone")} />
          {errors.phone && (
            <p className="text-sm text-red-500">{errors.phone.message as string}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <Select value={gender || ""} onValueChange={(value) => setValue("gender", value, { shouldValidate: true })}>
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
              <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="city">City <span className="text-red-500">*</span></Label>
          <Input id="city" {...register("city")} />
          {errors.city && (
            <p className="text-sm text-red-500">{errors.city.message as string}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="organizationType">Organization Type <span className="text-red-500">*</span></Label>
          <Select 
            value={organizationType || ""} 
            onValueChange={(value) => setValue("organizationType", value, { shouldValidate: true })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select organization type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="startup">Startup</SelectItem>
              <SelectItem value="established-company">Established Company</SelectItem>
              <SelectItem value="government">Government</SelectItem>
              <SelectItem value="ngo">NGO</SelectItem>
              <SelectItem value="educational">Educational Institution</SelectItem>
              <SelectItem value="investor">Investor</SelectItem>
              <SelectItem value="individual">Individual</SelectItem>
            </SelectContent>
          </Select>
          {errors.organizationType && (
            <p className="text-sm text-red-500">{errors.organizationType.message as string}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="organizationName">Organization Name <span className="text-red-500">*</span></Label>
          <Input id="organizationName" {...register("organizationName")} />
          {errors.organizationName && (
            <p className="text-sm text-red-500">{errors.organizationName.message as string}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="jobTitle">Job Title <span className="text-red-500">*</span></Label>
          <Input id="jobTitle" {...register("jobTitle")} />
          {errors.jobTitle && (
            <p className="text-sm text-red-500">{errors.jobTitle.message as string}</p>
          )}
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button type="submit" disabled={!isValid || isSubmitting} className="bg-blue-600 hover:bg-blue-700 min-w-[120px]">
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>Next <ArrowRight className="ml-2 h-4 w-4" /></>
          )}
        </Button>
      </div>
    </form>
  );
};

const EventSpecificForm = ({ initialData, eventData, onBack, onSave, isSubmitting }: EventSpecificFormProps) => {
  const { 
    register, 
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid } 
  } = useForm({
    resolver: zodResolver(eventSpecificSchema),
    defaultValues: initialData,
    mode: "onChange"
  });
  
  // Register fields
  React.useEffect(() => {
    register("attendanceType");
    register("howDidYouHear");
    
    // Set initial values if they exist
    if (initialData.attendanceType) setValue("attendanceType", initialData.attendanceType);
    if (initialData.howDidYouHear) setValue("howDidYouHear", initialData.howDidYouHear);
  }, [register, setValue, initialData]);
  
  // Watch fields
  const attendanceType = watch("attendanceType");
  const howDidYouHear = watch("howDidYouHear");
  const agreeToTerms = watch("agreeToTerms");
  
  const onSubmit = (data: any) => {
    onSave(data);
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="attendanceType">How will you attend? <span className="text-red-500">*</span></Label>
          <Select 
            value={attendanceType || ""} 
            onValueChange={(value) => setValue("attendanceType", value, { shouldValidate: true })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select attendance type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="in-person">In-person</SelectItem>
              {eventData.hasVirtualOption && <SelectItem value="virtual">Virtual</SelectItem>}
            </SelectContent>
          </Select>
          {errors.attendanceType && (
            <p className="text-sm text-red-500">{errors.attendanceType.message as string}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="dietaryRestrictions">Dietary Restrictions (if any)</Label>
          <Textarea 
            id="dietaryRestrictions" 
            {...register("dietaryRestrictions")} 
            placeholder="Please list any dietary restrictions or allergies"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="expectations">What do you hope to gain from this event?</Label>
          <Textarea 
            id="expectations" 
            {...register("expectations")} 
            placeholder="Share your expectations for this event"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="howDidYouHear">How did you hear about this event? <span className="text-red-500">*</span></Label>
          <Select 
            value={howDidYouHear || ""} 
            onValueChange={(value) => setValue("howDidYouHear", value, { shouldValidate: true })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="social-media">Social Media</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="website">Website</SelectItem>
              <SelectItem value="friend">Friend or Colleague</SelectItem>
              <SelectItem value="organization">Organization or Institution</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          {errors.howDidYouHear && (
            <p className="text-sm text-red-500">{errors.howDidYouHear.message as string}</p>
          )}
        </div>
        
        <div className="pt-6 border-t">
          <div className="flex items-start space-x-2">
            <Checkbox 
              id="agreeToTerms" 
              {...register("agreeToTerms")} 
              onCheckedChange={(checked) => {
                setValue("agreeToTerms", checked === true, { shouldValidate: true });
              }}
            />
            <Label htmlFor="agreeToTerms" className="text-sm">
              I agree to the event terms and conditions, including the privacy policy. I understand that my registration information will be shared with the event organizers. <span className="text-red-500">*</span>
            </Label>
          </div>
          {errors.agreeToTerms && (
            <p className="text-sm text-red-500 ml-6 mt-1">{errors.agreeToTerms.message as string}</p>
          )}
        </div>
      </div>
      
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
          Back
        </Button>
        <Button type="submit" disabled={!isValid || isSubmitting} className="bg-blue-600 hover:bg-blue-700 min-w-[150px]">
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              {eventData?.type === "pitch" ? "Next" : "Complete Registration"} 
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

const PitchDetailsForm = ({ initialData, onBack, onSave, isSubmitting }: PitchDetailsFormProps) => {
  const { 
    register, 
    handleSubmit,
    setValue,
    watch, 
    formState: { errors, isValid } 
  } = useForm({
    resolver: zodResolver(pitchDetailsSchema),
    defaultValues: initialData,
    mode: "onChange"
  });
  
  // Register fields
  React.useEffect(() => {
    register("companyStage");
    register("industry");
    register("fundingNeeded");
    
    // Set initial values if they exist
    if (initialData.companyStage) setValue("companyStage", initialData.companyStage);
    if (initialData.industry) setValue("industry", initialData.industry);
    if (initialData.fundingNeeded) setValue("fundingNeeded", initialData.fundingNeeded);
  }, [register, setValue, initialData]);
  
  // Watch fields
  const companyStage = watch("companyStage");
  const industry = watch("industry");
  const fundingNeeded = watch("fundingNeeded");
  
  const onSubmit = (data: any) => {
    onSave(data);
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name <span className="text-red-500">*</span></Label>
            <Input id="companyName" {...register("companyName")} />
            {errors.companyName && (
              <p className="text-sm text-red-500">{errors.companyName.message as string}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="companyStage">Company Stage <span className="text-red-500">*</span></Label>
            <Select 
              value={companyStage || ""} 
              onValueChange={(value) => setValue("companyStage", value, { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select company stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="idea">Idea Stage</SelectItem>
                <SelectItem value="mvp">MVP / Prototype</SelectItem>
                <SelectItem value="early-revenue">Early Revenue</SelectItem>
                <SelectItem value="growth">Growth Stage</SelectItem>
                <SelectItem value="scaling">Scaling</SelectItem>
              </SelectContent>
            </Select>
            {errors.companyStage && (
              <p className="text-sm text-red-500">{errors.companyStage.message as string}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="industry">Industry <span className="text-red-500">*</span></Label>
            <Select 
              value={industry || ""} 
              onValueChange={(value) => setValue("industry", value, { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="agriculture">Agriculture</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="energy">Energy</SelectItem>
                <SelectItem value="fintech">Financial Technology</SelectItem>
                <SelectItem value="healthcare">Healthcare</SelectItem>
                <SelectItem value="ecommerce">E-commerce</SelectItem>
                <SelectItem value="manufacturing">Manufacturing</SelectItem>
                <SelectItem value="logistics">Transportation & Logistics</SelectItem>
              </SelectContent>
            </Select>
            {errors.industry && (
              <p className="text-sm text-red-500">{errors.industry.message as string}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="teamSize">Team Size <span className="text-red-500">*</span></Label>
            <Input id="teamSize" {...register("teamSize")} />
            {errors.teamSize && (
              <p className="text-sm text-red-500">{errors.teamSize.message as string}</p>
            )}
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="fundingNeeded">Funding Needed <span className="text-red-500">*</span></Label>
            <Select 
              value={fundingNeeded || ""} 
              onValueChange={(value) => setValue("fundingNeeded", value, { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select funding range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="<5000">Less than $5,000</SelectItem>
                <SelectItem value="5000-25000">$5,000 - $25,000</SelectItem>
                <SelectItem value="25001-100000">$25,001 - $100,000</SelectItem>
                <SelectItem value="100001-500000">$100,001 - $500,000</SelectItem>
                <SelectItem value="500001+">More than $500,000</SelectItem>
              </SelectContent>
            </Select>
            {errors.fundingNeeded && (
              <p className="text-sm text-red-500">{errors.fundingNeeded.message as string}</p>
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="pitchDescription">Pitch Description <span className="text-red-500">*</span></Label>
          <Textarea 
            id="pitchDescription" 
            {...register("pitchDescription")} 
            className="min-h-[150px]"
            placeholder="Briefly describe your business idea or startup (problem, solution, target market, current traction)"
          />
          {errors.pitchDescription && (
            <p className="text-sm text-red-500">{errors.pitchDescription.message as string}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="pitchDeck">Pitch Deck (PDF, max 10MB)</Label>
          <Input id="pitchDeck" type="file" accept=".pdf" {...register("pitchDeck")} />
          <p className="text-xs text-gray-500">Upload your pitch deck (recommended but optional)</p>
        </div>
      </div>
      
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
          Back
        </Button>
        <Button type="submit" disabled={!isValid || isSubmitting} className="bg-green-600 hover:bg-green-700 min-w-[180px]">
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>Complete Registration <ArrowRight className="ml-2 h-4 w-4" /></>
          )}
        </Button>
      </div>
    </form>
  );
};

export default function EventRegistrationPage() {
  const [activeStep, setActiveStep] = React.useState(0);
  const [formData, setFormData] = React.useState<{
    personal: any;
    eventSpecific: any;
    pitchDetails?: any;
  }>({
    personal: {},
    eventSpecific: {},
    pitchDetails: {}
  });
  const [progress, setProgress] = React.useState(33);
  const [submitted, setSubmitted] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [confirmationCode, setConfirmationCode] = React.useState("");
  
  const params = useParams();
  const router = useRouter();
  const eventId = params?.id as string;
  
  const [event, setEvent] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchEvent() {
      if (!eventId) return;
      try {
        setIsLoading(true);
        const res = await fetch(`/api/events/${eventId}`);
        const data = await res.json();
        if (data.success) {
          setEvent(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch event:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchEvent();
  }, [eventId]);

  const steps = [
    { id: "personal", label: "Personal Details", icon: User },
    { id: "eventSpecific", label: "Event Details", icon: Calendar },
    ...(event?.type === "pitch" ? [{ id: "pitchDetails", label: "Pitch Details", icon: Briefcase }] : [])
  ];
  
  const totalSteps = steps.length;
  
  const handlePersonalFormSave = (data: any) => {
    setFormData(prev => ({ ...prev, personal: data }));
    setActiveStep(1);
    setProgress(event?.type === "pitch" ? 66 : 100);
  };
  
  const handleEventSpecificFormSave = (data: any) => {
    setFormData(prev => ({ ...prev, eventSpecific: data }));
    
    if (event?.type === "pitch") {
      setActiveStep(2);
      setProgress(100);
    } else {
      completeRegistration({ ...formData.personal, ...data });
    }
  };
  
  const handlePitchDetailsFormSave = (data: any) => {
    const combinedData = { ...formData.personal, ...formData.eventSpecific, ...data };
    setFormData(prev => ({ ...prev, pitchDetails: data }));
    completeRegistration(combinedData);
  };
  
  const completeRegistration = async (finalData: any) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/events/${eventId}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: finalData.fullName,
          email: finalData.email,
          phone: finalData.phone,
          company: finalData.organizationName,
          // Add other fields if needed, but schema only has these 4 core ones
        })
      });
      
      const result = await res.json();
      if (result.success) {
        setConfirmationCode(result.confirmationCode);
        setSubmitted(true);
        setTimeout(() => {
          router.push(`/dashboard/events/my-events?registered=true&code=${result.confirmationCode}`);
        }, 3000);
      } else {
        toast.error(result.error || "Registration failed");
      }
    } catch (error) {
      console.error("Registration submission error:", error);
      toast.error("An error occurred during registration. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="font-medium text-gray-500 animate-pulse">Initializing registration portal...</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-6 bg-white rounded-2xl shadow-sm border border-gray-100 mt-10">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center animate-bounce">
          <Check className="h-10 w-10 text-green-600" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Registration Confirmed!</h2>
          <p className="text-gray-500 max-w-md mx-auto">
            Your spot has been secured. Your confirmation code is:
          </p>
          <div className="bg-gray-50 border-2 border-dashed border-gray-200 p-4 rounded-xl mt-4 font-mono text-2xl font-bold text-blue-600 tracking-widest">
            {confirmationCode}
          </div>
        </div>
        <div className="pt-8 flex flex-col items-center space-y-4">
          <div className="flex items-center gap-2 text-sm text-gray-400">
             <Loader2 className="h-4 w-4 animate-spin" />
             <span>Redirecting to your events dashboard...</span>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Back button and title */}
      <div className="flex items-center">
        <Button variant="outline" size="icon" asChild className="mr-2">
          <Link href={`/dashboard/events/${eventId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-xl md:text-2xl font-bold">
          {event.requiresApplication ? "Apply for" : "Register for"}: {event.title}
        </h1>
      </div>
      
      {/* Step indicator */}
      <div className="flex justify-between mb-2">
        {steps.map((step, index) => (
          <div key={step.id} className="flex flex-col items-center space-y-2">
            <div 
              className={`flex items-center justify-center w-10 h-10 rounded-full ${
                index < activeStep ? "bg-green-100 text-green-600 border-2 border-green-500" :
                index === activeStep ? "bg-blue-100 text-blue-600 border-2 border-blue-500" :
                "bg-gray-100 text-gray-400"
              }`}
            >
              {index < activeStep ? (
                <Check className="h-5 w-5" />
              ) : (
                <step.icon className="h-5 w-5" />
              )}
            </div>
            <span className={`text-xs text-center ${
              index <= activeStep ? "font-medium" : "text-gray-500"
            }`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
      
      <Progress value={progress} className="h-2 mb-6" />
      
      <Card>
        <CardHeader>
          <CardTitle>
            {activeStep === 0 && "Personal Information"}
            {activeStep === 1 && "Event Details"}
            {activeStep === 2 && "Pitch Information"}
          </CardTitle>
          <CardDescription>
            {activeStep === 0 && "Please provide your personal and professional information"}
            {activeStep === 1 && `Tell us more about your participation in ${event.title}`}
            {activeStep === 2 && "Share details about your startup or business idea"}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeStep.toString()} className="w-full">
            <TabsContent value="0">
              <PersonalDetailsForm 
                initialData={formData.personal} 
                onSave={handlePersonalFormSave} 
                isSubmitting={isSubmitting}
              />
            </TabsContent>
            
            <TabsContent value="1">
              <EventSpecificForm 
                initialData={formData.eventSpecific}
                eventData={event}
                onBack={() => {
                  setActiveStep(0);
                  setProgress(33);
                }}
                onSave={handleEventSpecificFormSave}
                isSubmitting={isSubmitting}
              />
            </TabsContent>
            
            {event?.type === "pitch" && (
              <TabsContent value="2">
                <PitchDetailsForm 
                  initialData={formData.pitchDetails}
                  onBack={() => {
                    setActiveStep(1);
                    setProgress(66);
                  }}
                  onSave={handlePitchDetailsFormSave}
                  isSubmitting={isSubmitting}
                />
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
        
        <CardFooter className="border-t pt-6 flex justify-between">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/events/${eventId}`}>Cancel Registration</Link>
          </Button>
          <div className="text-sm text-gray-500">
            Step {activeStep + 1} of {totalSteps}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
