"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ArrowRight, File, FileText, Upload, Check, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";

// Form schema
const documentsFormSchema = z.object({
  businessRegistration: z.any().optional(),
  businessPlan: z.any().optional(),
  financialProjections: z.any().optional(),
  teamCVs: z.any().optional(),
  proofOfConcept: z.any().optional(),
  additionalDocuments: z.any().optional(),
});

// Simulated document upload
const simulateUpload = (file: File, onProgress: (progress: number) => void): Promise<string> => {
  return new Promise((resolve) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      onProgress(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          resolve(`https://example.com/uploads/${file.name}`);
        }, 500);
      }
    }, 300);
  });
};

interface DocumentsFormProps {
  initialData: any;
  onSave: (data: any) => void;
  onBack: () => void;
}

export function DocumentsForm({ initialData, onSave, onBack }: DocumentsFormProps) {
  const [uploads, setUploads] = useState<Record<string, { file: File | null; progress: number; status: string; url: string }>>({
    businessRegistration: { file: null, progress: 0, status: 'pending', url: '' },
    businessPlan: { file: null, progress: 0, status: 'pending', url: '' },
    financialProjections: { file: null, progress: 0, status: 'pending', url: '' },
    teamCVs: { file: null, progress: 0, status: 'pending', url: '' },
    proofOfConcept: { file: null, progress: 0, status: 'pending', url: '' },
    additionalDocuments: { file: null, progress: 0, status: 'pending', url: '' },
  });

  const form = useForm<z.infer<typeof documentsFormSchema>>({
    resolver: zodResolver(documentsFormSchema),
    defaultValues: initialData || {
      businessRegistration: undefined,
      businessPlan: undefined,
      financialProjections: undefined,
      teamCVs: undefined,
      proofOfConcept: undefined,
      additionalDocuments: undefined,
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploads((prev) => ({
      ...prev,
      [fieldName]: { ...prev[fieldName], file, status: 'uploading', progress: 0 },
    }));

    try {
      const url = await simulateUpload(file, (progress) => {
        setUploads((prev) => ({
          ...prev,
          [fieldName]: { ...prev[fieldName], progress },
        }));
      });

      setUploads((prev) => ({
        ...prev,
        [fieldName]: { ...prev[fieldName], status: 'complete', url },
      }));

      form.setValue(fieldName as any, url);
    } catch (error) {
      setUploads((prev) => ({
        ...prev,
        [fieldName]: { ...prev[fieldName], status: 'error', progress: 0 },
      }));
    }
  };

  const handleSubmit = (data: z.infer<typeof documentsFormSchema>) => {
    const uploadData = Object.entries(uploads).reduce((acc, [key, value]) => {
      if (value.status === 'complete') {
        acc[key] = {
          filename: value.file?.name || '',
          url: value.url,
          type: value.file?.type || '',
          size: value.file?.size || 0,
        };
      }
      return acc;
    }, {} as Record<string, any>);

    onSave(uploadData);
  };

  // Document requirements
  const documents = [
    {
      name: "businessRegistration",
      label: "Business Registration Certificate",
      description: "Official business registration document from Ethiopian authorities",
      required: true,
      accept: ".pdf,.jpg,.png",
    },
    {
      name: "businessPlan",
      label: "Business Plan",
      description: "Detailed business plan (max 10 pages)",
      required: true,
      accept: ".pdf,.doc,.docx",
    },
    {
      name: "financialProjections",
      label: "Financial Projections",
      description: "3-year financial forecast/projections",
      required: true,
      accept: ".pdf,.xlsx,.xls",
    },
    {
      name: "teamCVs",
      label: "Team CVs",
      description: "CVs of key team members (combined into a single document)",
      required: true,
      accept: ".pdf,.doc,.docx",
    },
    {
      name: "proofOfConcept",
      label: "Proof of Concept/MVP",
      description: "Screenshots, videos, or documentation of your prototype/MVP",
      required: true,
      accept: ".pdf,.jpg,.png,.mp4,.zip",
    },
    {
      name: "additionalDocuments",
      label: "Additional Documents",
      description: "Any other supporting documents (patents, awards, testimonials, etc.)",
      required: false,
      accept: ".pdf,.doc,.docx,.jpg,.png,.zip",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Required Documents</CardTitle>
        <CardDescription>
          Upload the following documents to support your funding application. 
          All files should be less than 10MB. Accepted formats include PDF, DOCX, XLSX, JPG, and PNG.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <CardContent className="space-y-6">
            {documents.map((doc) => (
              <div
                key={doc.name}
                className={`border rounded-lg p-4 ${
                  uploads[doc.name].status === 'complete'
                    ? 'border-green-200 bg-green-50'
                    : uploads[doc.name].status === 'error'
                    ? 'border-red-200 bg-red-50'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      uploads[doc.name].status === 'complete'
                        ? 'bg-green-100 text-green-600'
                        : uploads[doc.name].status === 'error'
                        ? 'bg-red-100 text-red-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium flex items-center">
                        {doc.label} 
                        {doc.required && <span className="text-red-500 ml-1">*</span>}
                        {uploads[doc.name].status === 'complete' && (
                          <span className="ml-2 text-green-600 inline-flex items-center">
                            <Check className="h-4 w-4 mr-1" /> Uploaded
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-500">{doc.description}</p>
                    </div>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name={doc.name as any}
                    render={({ field }) => (
                      <FormItem className="space-y-0">
                        <FormControl>
                          <div className="flex items-center">
                            <Input
                              type="file"
                              accept={doc.accept}
                              id={doc.name}
                              className="hidden"
                              onChange={(e) => handleFileChange(e, doc.name)}
                            />
                            <label
                              htmlFor={doc.name}
                              className={`cursor-pointer ${
                                uploads[doc.name].status === 'complete'
                                  ? 'bg-green-100 text-green-600 hover:bg-green-200'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              } px-3 py-1.5 rounded-md text-sm inline-flex items-center`}
                            >
                              {uploads[doc.name].status === 'complete' ? (
                                <>Reupload</>
                              ) : (
                                <>
                                  <Upload className="h-4 w-4 mr-1" />
                                  Upload
                                </>
                              )}
                            </label>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {uploads[doc.name].file && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <div className="flex items-center">
                        <File className="h-4 w-4 mr-1 text-gray-500" />
                        <span className="truncate max-w-xs">{uploads[doc.name].file.name}</span>
                      </div>
                      <span className="text-gray-500">
                        {Math.round(uploads[doc.name].file.size / 1024)} KB
                      </span>
                    </div>
                    
                    {uploads[doc.name].status === 'uploading' && (
                      <div className="space-y-1">
                        <Progress value={uploads[doc.name].progress} className="h-1" />
                        <span className="text-xs text-gray-500">
                          Uploading: {uploads[doc.name].progress}%
                        </span>
                      </div>
                    )}
                    
                    {uploads[doc.name].status === 'error' && (
                      <div className="text-xs text-red-500 flex items-center">
                        <X className="h-3 w-3 mr-1" />
                        Upload failed. Please try again.
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button 
              type="submit" 
              className="bg-green-600 hover:bg-green-700"
              disabled={Object.values(uploads).filter((u, i) => documents[i].required).some(u => u.status !== 'complete')}
            >
              Next Step
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
