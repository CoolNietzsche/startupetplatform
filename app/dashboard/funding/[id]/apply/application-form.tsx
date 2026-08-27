"use client";

import React from "react";
import { 
  Tabs, 
  TabsContent 
} from "@/components/ui/tabs";
import { 
  ArrowRight, 
  Building, 
  FileText, 
  CheckCircle,
  GraduationCap,
  AlertCircle
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";

type CompanyFormProps = {
  initialData: Record<string, any>;
  onSave: (data: Record<string, any>) => void;
};

type ProjectDetailsFormProps = {
  initialData: Record<string, any>;
  onBack: () => void;
  onSave: (data: Record<string, any>) => void;
};

type DocumentsFormProps = {
  initialData: Record<string, any>;
  onBack: () => void;
  onSave: (data: Record<string, any>) => void;
  isSubmitting?: boolean;
};

// Form schemas
const companyFormSchema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  registrationNumber: z.string().min(2, "Registration number is required"),
  foundingDate: z.string().min(2, "Founding date is required"),
  companySize: z.string().min(1, "Company size is required"),
  website: z.string().optional(),
  address: z.string().min(2, "Address is required"),
  city: z.string().min(2, "City is required"),
  contactName: z.string().min(2, "Contact name is required"),
  contactEmail: z.string().email("Invalid email address"),
  contactPhone: z.string().min(9, "Valid phone number is required"),
});

const projectFormSchema = z.object({
  projectTitle: z.string().min(2, "Project title is required"),
  projectDescription: z.string().min(10, "Project description is required"),
  sector: z.string().min(1, "Sector is required"),
  impactArea: z.string().min(1, "Impact area is required"),
  fundingAmount: z.string().min(1, "Funding amount is required"),
  timeline: z.string().min(1, "Timeline is required"),
  teamSize: z.string().min(1, "Team size is required"),
  previousFunding: z.string().min(1, "Previous funding information is required"),
  challenge: z.string().min(10, "Challenge description is required"),
  solution: z.string().min(10, "Solution description is required"),
});

const documentsFormSchema = z.object({
  businessPlan: z.any().optional(),
  financialProjections: z.any().optional(),
  teamCV: z.any().optional(),
  presentationDeck: z.any().optional(),
  proofOfRegistration: z.any().refine((files) => files?.length > 0, "Proof of registration is required"),
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: "You must accept the terms and conditions" }),
  }),
});

const ReviewStep = ({ formData, onBack, onSubmit, isSubmitting }: any) => {
  const { company, project, documents } = formData;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Building className="h-5 w-5 text-blue-600" />
            Company Summary
          </h3>
          <div className="bg-gray-50 p-4 rounded-lg space-y-2 border text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Name:</span> <span>{company.companyName}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Reg #:</span> <span>{company.registrationNumber}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Location:</span> <span>{company.city}, {company.address}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Contact:</span> <span>{company.contactName}</span></div>
          </div>
        </div>
        <div className="space-y-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-green-600" />
            Project Summary
          </h3>
          <div className="bg-gray-50 p-4 rounded-lg space-y-2 border text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Title:</span> <span>{project.projectTitle}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Amount:</span> <span className="font-bold text-green-700">${project.fundingAmount}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Sector:</span> <span>{project.sector}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Timeline:</span> <span>{project.timeline}</span></div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <FileText className="h-5 w-5 text-purple-600" />
          Documents Provided
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.keys(documents).filter(k => k !== 'termsAccepted').map(key => (
            <div key={key} className="flex items-center gap-2 p-3 bg-white border rounded-lg text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg flex gap-3 text-sm text-blue-800">
        <AlertCircle className="h-5 w-5 flex-shrink-0" />
        <p>Please ensure all information is correct. You will not be able to edit your application once it is submitted for review.</p>
      </div>

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          Back to Edit
        </Button>
        <Button 
          type="button" 
          onClick={onSubmit} 
          disabled={isSubmitting}
          className="bg-green-600 hover:bg-green-700 px-8"
        >
          {isSubmitting ? "Submitting..." : "Confirm & Submit Application"}
        </Button>
      </div>
    </div>
  );
};

// ... existing step components ...
const CompanyForm = ({ initialData, onSave }: CompanyFormProps) => {
  const { 
    register, 
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid } 
  } = useForm({
    resolver: zodResolver(companyFormSchema),
    defaultValues: initialData,
    mode: "onChange"
  });

  const onSubmit = (data: Record<string, any>) => {
    onSave(data);
  };
  
  // Register Select fields with React Hook Form
  React.useEffect(() => {
    register("companySize");
    
    // Set initial values from initialData if they exist
    if (initialData.companySize) {
      setValue("companySize", initialData.companySize);
    }
  }, [initialData, register, setValue]);
  
  // Watch company size to ensure form validation works
  const companySize = watch("companySize");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="companyName">Company Name <span className="text-red-500">*</span></Label>
          <Input id="companyName" {...register("companyName")} />
          {errors.companyName && (
            <p className="text-sm text-red-500">{errors.companyName.message as string}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="registrationNumber">Business Registration Number <span className="text-red-500">*</span></Label>
          <Input id="registrationNumber" {...register("registrationNumber")} />
          {errors.registrationNumber && (
            <p className="text-sm text-red-500">{errors.registrationNumber.message as string}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="foundingDate">Founding Date <span className="text-red-500">*</span></Label>
          <Input id="foundingDate" type="date" {...register("foundingDate")} />
          {errors.foundingDate && (
            <p className="text-sm text-red-500">{errors.foundingDate.message as string}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="companySize">Company Size <span className="text-red-500">*</span></Label>
          <Select 
            value={companySize || ""} 
            onValueChange={(value) => setValue("companySize", value, { shouldValidate: true })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select company size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1-5">1-5 employees</SelectItem>
              <SelectItem value="6-10">6-10 employees</SelectItem>
              <SelectItem value="11-25">11-25 employees</SelectItem>
              <SelectItem value="26-50">26-50 employees</SelectItem>
              <SelectItem value="51+">51+ employees</SelectItem>
            </SelectContent>
          </Select>
          {errors.companySize && (
            <p className="text-sm text-red-500">{errors.companySize.message as string}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="website">Website (Optional)</Label>
          <Input id="website" {...register("website")} />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="address">Address <span className="text-red-500">*</span></Label>
          <Input id="address" {...register("address")} />
          {errors.address && (
            <p className="text-sm text-red-500">{errors.address.message as string}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="city">City <span className="text-red-500">*</span></Label>
          <Input id="city" {...register("city")} />
          {errors.city && (
            <p className="text-sm text-red-500">{errors.city.message as string}</p>
          )}
        </div>
      </div>
      
      <div className="pt-4 border-t">
        <h3 className="text-lg font-medium mb-4">Primary Contact Information</h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="contactName">Full Name <span className="text-red-500">*</span></Label>
            <Input id="contactName" {...register("contactName")} />
            {errors.contactName && (
              <p className="text-sm text-red-500">{errors.contactName.message as string}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="contactEmail">Email <span className="text-red-500">*</span></Label>
            <Input id="contactEmail" type="email" {...register("contactEmail")} />
            {errors.contactEmail && (
              <p className="text-sm text-red-500">{errors.contactEmail.message as string}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="contactPhone">Phone Number <span className="text-red-500">*</span></Label>
            <Input id="contactPhone" {...register("contactPhone")} />
            {errors.contactPhone && (
              <p className="text-sm text-red-500">{errors.contactPhone.message as string}</p>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button type="submit" disabled={!isValid} className="bg-blue-600 hover:bg-blue-700">
          Next <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </form>
  );
};

const ProjectDetailsForm = ({ initialData, onBack, onSave }: ProjectDetailsFormProps) => {
  const { 
    register, 
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid } 
  } = useForm({
    resolver: zodResolver(projectFormSchema),
    defaultValues: initialData,
    mode: "onChange"
  });

  const onSubmit = (data: Record<string, any>) => {
    onSave(data);
  };
  
  // Register Select fields with React Hook Form
  React.useEffect(() => {
    register("sector");
    register("impactArea");
    register("fundingAmount");
    register("timeline");
    register("previousFunding");
    
    // Set initial values from initialData if they exist
    if (initialData.sector) setValue("sector", initialData.sector);
    if (initialData.impactArea) setValue("impactArea", initialData.impactArea);
    if (initialData.fundingAmount) setValue("fundingAmount", initialData.fundingAmount);
    if (initialData.timeline) setValue("timeline", initialData.timeline);
    if (initialData.previousFunding) setValue("previousFunding", initialData.previousFunding);
  }, [initialData, register, setValue]);
  
  // Watch fields to ensure form validation works
  const sector = watch("sector");
  const impactArea = watch("impactArea");
  const fundingAmount = watch("fundingAmount");
  const timeline = watch("timeline");
  const previousFunding = watch("previousFunding");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="projectTitle">Project Title <span className="text-red-500">*</span></Label>
          <Input id="projectTitle" {...register("projectTitle")} />
          {errors.projectTitle && (
            <p className="text-sm text-red-500">{errors.projectTitle.message as string}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="sector">Sector <span className="text-red-500">*</span></Label>
          <Select 
            value={sector || ""} 
            onValueChange={(value) => setValue("sector", value, { shouldValidate: true })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select sector" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="agriculture">Agriculture</SelectItem>
              <SelectItem value="education">Education</SelectItem>
              <SelectItem value="energy">Energy</SelectItem>
              <SelectItem value="fintech">Financial Technology</SelectItem>
              <SelectItem value="health">Healthcare</SelectItem>
              <SelectItem value="ecommerce">E-commerce</SelectItem>
              <SelectItem value="manufacturing">Manufacturing</SelectItem>
              <SelectItem value="tourism">Tourism</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          {errors.sector && (
            <p className="text-sm text-red-500">{errors.sector.message as string}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="impactArea">Primary Impact Area <span className="text-red-500">*</span></Label>
          <Select 
            value={impactArea || ""} 
            onValueChange={(value) => setValue("impactArea", value, { shouldValidate: true })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select impact area" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="job_creation">Job Creation</SelectItem>
              <SelectItem value="rural_development">Rural Development</SelectItem>
              <SelectItem value="gender_equality">Gender Equality</SelectItem>
              <SelectItem value="environmental">Environmental Sustainability</SelectItem>
              <SelectItem value="digital_inclusion">Digital Inclusion</SelectItem>
              <SelectItem value="financial_inclusion">Financial Inclusion</SelectItem>
              <SelectItem value="healthcare_access">Healthcare Access</SelectItem>
              <SelectItem value="education_access">Education Access</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          {errors.impactArea && (
            <p className="text-sm text-red-500">{errors.impactArea.message as string}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="fundingAmount">Requested Funding Amount (USD) <span className="text-red-500">*</span></Label>
          <Select 
            value={fundingAmount || ""} 
            onValueChange={(value) => setValue("fundingAmount", value, { shouldValidate: true })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select amount range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="<5000">Less than $5,000</SelectItem>
              <SelectItem value="5000-10000">$5,000 - $10,000</SelectItem>
              <SelectItem value="10001-25000">$10,001 - $25,000</SelectItem>
              <SelectItem value="25001-50000">$25,001 - $50,000</SelectItem>
              <SelectItem value="50001+">More than $50,000</SelectItem>
            </SelectContent>
          </Select>
          {errors.fundingAmount && (
            <p className="text-sm text-red-500">{errors.fundingAmount.message as string}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="timeline">Project Timeline <span className="text-red-500">*</span></Label>
          <Select 
            value={timeline || ""} 
            onValueChange={(value) => setValue("timeline", value, { shouldValidate: true })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select timeline" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="<6months">Less than 6 months</SelectItem>
              <SelectItem value="6-12months">6-12 months</SelectItem>
              <SelectItem value="1-2years">1-2 years</SelectItem>
              <SelectItem value="2+years">More than 2 years</SelectItem>
            </SelectContent>
          </Select>
          {errors.timeline && (
            <p className="text-sm text-red-500">{errors.timeline.message as string}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="teamSize">Project Team Size <span className="text-red-500">*</span></Label>
          <Input id="teamSize" {...register("teamSize")} />
          {errors.teamSize && (
            <p className="text-sm text-red-500">{errors.teamSize.message as string}</p>
          )}
        </div>
        
        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="previousFunding">Previous Funding Received <span className="text-red-500">*</span></Label>
          <RadioGroup defaultValue={previousFunding} onValueChange={(value) => setValue("previousFunding", value, { shouldValidate: true })} className="flex flex-col space-y-1">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="none" id="none" />
              <Label htmlFor="none">No previous funding</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="grant" id="grant" />
              <Label htmlFor="grant">Grant</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="investment" id="investment" />
              <Label htmlFor="investment">Investment</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="loan" id="loan" />
              <Label htmlFor="loan">Loan</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="multiple" id="multiple" />
              <Label htmlFor="multiple">Multiple sources</Label>
            </div>
          </RadioGroup>
          {errors.previousFunding && (
            <p className="text-sm text-red-500">{errors.previousFunding.message as string}</p>
          )}
        </div>
        
        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="projectDescription">Project Description <span className="text-red-500">*</span></Label>
          <Textarea 
            id="projectDescription" 
            {...register("projectDescription")}
            className="min-h-[100px]"
          />
          {errors.projectDescription && (
            <p className="text-sm text-red-500">{errors.projectDescription.message as string}</p>
          )}
        </div>
        
        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="challenge">Problem or Challenge Addressed <span className="text-red-500">*</span></Label>
          <Textarea 
            id="challenge" 
            {...register("challenge")}
            className="min-h-[100px]"
            placeholder="Describe the specific problem your project aims to solve"
          />
          {errors.challenge && (
            <p className="text-sm text-red-500">{errors.challenge.message as string}</p>
          )}
        </div>
        
        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="solution">Proposed Solution <span className="text-red-500">*</span></Label>
          <Textarea 
            id="solution" 
            {...register("solution")}
            className="min-h-[100px]"
            placeholder="Explain how your project will solve the problem"
          />
          {errors.solution && (
            <p className="text-sm text-red-500">{errors.solution.message as string}</p>
          )}
        </div>
      </div>
      
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" disabled={!isValid} className="bg-blue-600 hover:bg-blue-700">
          Next <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </form>
  );
};

const DocumentsForm = ({ initialData, onBack, onSave, isSubmitting }: DocumentsFormProps) => {
  const [uploads, setUploads] = React.useState<Record<string, { progress: number, status: 'pending' | 'uploading' | 'complete' | 'error', fileName?: string }>>({
    businessPlan: { progress: 0, status: 'pending' },
    financialProjections: { progress: 0, status: 'pending' },
    teamCV: { progress: 0, status: 'pending' },
    presentationDeck: { progress: 0, status: 'pending' },
    proofOfRegistration: { progress: 0, status: 'pending' },
  });

  const { 
    register, 
    handleSubmit,
    setValue,
    formState: { errors, isValid } 
  } = useForm({
    resolver: zodResolver(documentsFormSchema),
    defaultValues: initialData,
    mode: "onChange"
  });

  const simulateUpload = (fieldName: string, file: File) => {
    setUploads(prev => ({ ...prev, [fieldName]: { progress: 0, status: 'uploading', fileName: file.name } }));
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 30) + 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setUploads(prev => ({ ...prev, [fieldName]: { ...prev[fieldName], progress: 100, status: 'complete' } }));
        // Set a string value for the form
        setValue(fieldName, `uploads/${file.name}`, { shouldValidate: true });
      } else {
        setUploads(prev => ({ ...prev, [fieldName]: { ...prev[fieldName], progress } }));
      }
    }, 400);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (file) {
      simulateUpload(fieldName, file);
    }
  };

  const onSubmit = (data: Record<string, any>) => {
    onSave(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-6">
        {[
          { id: "businessPlan", label: "Business Plan (PDF, max 10MB)", desc: "Detailed business plan including market analysis (recommended)" },
          { id: "financialProjections", label: "Financial Projections (Excel/PDF, max 5MB)", desc: "3-5 year financial forecast (recommended)" },
          { id: "teamCV", label: "Team CVs (PDF, max 10MB)", desc: "Combined CV/resume of key team members (recommended)" },
          { id: "presentationDeck", label: "Presentation Deck (PDF, max 8MB)", desc: "Pitch presentation or slide deck (recommended)" },
          { id: "proofOfRegistration", label: "Proof of Business Registration *", desc: "Business registration certificate (required)", required: true },
        ].map((doc) => (
          <div key={doc.id} className="space-y-2 border p-4 rounded-lg bg-gray-50/50">
            <Label htmlFor={doc.id} className="font-semibold">{doc.label}</Label>
            <div className="flex items-center gap-4">
              <Input 
                id={doc.id} 
                type="file" 
                className="bg-white"
                onChange={(e) => onFileChange(e, doc.id)}
              />
              {uploads[doc.id].status === 'complete' && <CheckCircle className="text-green-500 h-6 w-6" />}
            </div>
            {uploads[doc.id].status === 'uploading' && (
              <div className="space-y-1">
                <Progress value={uploads[doc.id].progress} className="h-1" />
                <p className="text-xs text-blue-600">Uploading {uploads[doc.id].fileName}...</p>
              </div>
            )}
            <p className="text-xs text-gray-500">{doc.desc}</p>
            {errors[doc.id] && (
              <p className="text-sm text-red-500">{errors[doc.id]?.message as string}</p>
            )}
          </div>
        ))}
        
        <div className="pt-4 border-t">
          <div className="flex items-start space-x-2 mt-4">
            <input
              type="checkbox"
              id="termsAccepted"
              className="mt-1"
              {...register("termsAccepted")}
            />
            <Label htmlFor="termsAccepted" className="text-sm">
              I confirm that all information provided is accurate and complete. I understand that providing false information may result in disqualification. I agree to the <Link href="/terms-of-use" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">terms and conditions</Link> of this funding opportunity. <span className="text-red-500">*</span>
            </Label>
          </div>
          {errors.termsAccepted && (
            <p className="text-sm text-red-500 ml-6">{errors.termsAccepted.message as string}</p>
          )}
        </div>
      </div>
      
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" disabled={!isValid || isSubmitting} className="bg-green-600 hover:bg-green-700">
          {isSubmitting ? (
            <div className="flex items-center space-x-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" />
                <path d="M2 12l.01 0c0 4.418 3.582 8 8 8s8-3.582 8-8-3.582-8-8-8a8.003 8.003 0 0 0-.01 0z" />
              </svg>
              <span>Submitting...</span>
            </div>
          ) : (
            <span>Submit Application</span>
          )}
        </Button>
      </div>
    </form>
  );
};

interface FundingApplicationFormProps {
  fundingId?: string;
  onComplete?: (applicationData: Record<string, any>) => void;
  isSubmitting?: boolean;
}

const FundingApplicationForm = ({ fundingId, onComplete, isSubmitting }: FundingApplicationFormProps) => {
  const params = useParams();
  const router = useRouter();
  const id = fundingId || (params?.id as string) || '';
  
  const [activeStep, setActiveStep] = React.useState(0);
  const [progress, setProgress] = React.useState(33);
  const [submitted, setSubmitted] = React.useState(false);
  const [formData, setFormData] = React.useState({
    company: {},
    project: {},
    documents: {}
  });
  
  // Define these outside of conditionals or early returns
  const steps = [
    { id: "company", label: "Company", icon: Building },
    { id: "project", label: "Project", icon: GraduationCap },
    { id: "documents", label: "Documents", icon: FileText },
    { id: "review", label: "Review", icon: CheckCircle },
  ];

  // Reference generation logic should be outside of conditionals
  const generateReference = () => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const randomLetter = letters.charAt(Math.floor(Math.random() * letters.length));
    const timestamp = Date.now().toString().slice(-6);
    return `ETH-${randomLetter}${timestamp}`;
  };
  
  const refNumber = React.useMemo(() => generateReference(), []);
  
  const handleCompanyFormSave = (data: Record<string, any>) => {
    setFormData(prev => ({ ...prev, company: data }));
    setActiveStep(1);
    setProgress(66);
  };
  
  const handleProjectFormSave = (data: Record<string, any>) => {
    setFormData(prev => ({ ...prev, project: data }));
    setActiveStep(2);
    setProgress(100);
  };
  
  const handleDocumentsFormSave = (data: Record<string, any>) => {
    setFormData(prev => ({ ...prev, documents: data }));
    setActiveStep(3);
    setProgress(100);
  };

  const handleFinalSubmit = () => {
    // Prepare final data with application reference
    const finalData = {
      ...formData,
      applicationReference: refNumber,
      fundingId: id,
      status: "SUBMITTED",
      submissionDate: new Date().toISOString(),
    };
    
    // Call onComplete if provided
    if (onComplete) {
      onComplete(finalData);
    } else {
      setSubmitted(true);
      setTimeout(() => {
        router.push(`/dashboard/funding/my-applications?ref=${refNumber}`);
      }, 1000);
    }
  };
  
  // Now we can safely return based on conditions
  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-6">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-center">Application Submitted Successfully!</h2>
        <p className="text-center text-gray-600 max-w-md">
          Your application has been submitted. You will receive a confirmation email shortly.
        </p>
        <div className="animate-pulse mt-4">
          <p className="text-center text-gray-600">Redirecting to your applications...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between mb-2" data-component-name="FundingApplicationForm">
        {steps.map((step, index) => (
          <div key={step.id} className="flex flex-col items-center space-y-2">
            <div 
              className={`flex items-center justify-center w-10 h-10 rounded-full ${
                index < activeStep ? "bg-green-100 text-green-600 border-2 border-green-500" :
                index === activeStep ? "bg-green-100 text-green-600 border-2 border-green-500" :
                "bg-gray-100 text-gray-400"
              }`}
            >
              {index < activeStep ? (
                <CheckCircle className="h-5 w-5" />
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
            {activeStep === 0 && "Company Information"}
            {activeStep === 1 && "Project Details"}
            {activeStep === 2 && "Required Documents"}
            {activeStep === 3 && "Review & Submit"}
          </CardTitle>
          <CardDescription>
            {activeStep === 0 && "Provide information about your company or organization"}
            {activeStep === 1 && "Tell us more about your project and funding needs"}
            {activeStep === 2 && "Upload required documents to complete your application"}
            {activeStep === 3 && "Double check your information before final submission"}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeStep.toString()} className="w-full">
            <TabsContent value="0">
              <CompanyForm 
                initialData={formData.company} 
                onSave={handleCompanyFormSave} 
              />
            </TabsContent>
            
            <TabsContent value="1">
              <ProjectDetailsForm 
                initialData={formData.project}
                onBack={() => {
                  setActiveStep(0);
                  setProgress(33);
                }}
                onSave={handleProjectFormSave}
              />
            </TabsContent>
            
            <TabsContent value="2">
              <DocumentsForm 
                initialData={formData.documents}
                onBack={() => {
                  setActiveStep(1);
                  setProgress(66);
                }}
                onSave={handleDocumentsFormSave}
                isSubmitting={isSubmitting}
              />
            </TabsContent>

            <TabsContent value="3">
              <ReviewStep 
                formData={formData}
                onBack={() => {
                  setActiveStep(2);
                  setProgress(90);
                }}
                onSubmit={handleFinalSubmit}
                isSubmitting={isSubmitting}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter className="border-t pt-6 flex justify-between">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/funding/${id}`}>Cancel Application</Link>
          </Button>
          <div className="text-sm text-gray-500">
            Step {activeStep + 1} of {steps.length}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

export default FundingApplicationForm;
