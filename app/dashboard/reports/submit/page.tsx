"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { ChevronLeft, Clock, File, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

// Form schema for validation
const reportFormSchema = z.object({
  title: z.string().min(5, {
    message: "Report title must be at least 5 characters.",
  }),
  reportType: z.string({
    required_error: "Please select a report type.",
  }),
  period: z.string({
    required_error: "Please select the reporting period.",
  }),
  reportDate: z.date({
    required_error: "Please select a date.",
  }),
  programName: z.string().min(3, {
    message: "Program name is required.",
  }),
  summary: z.string().min(20, {
    message: "Summary must be at least 20 characters.",
  }),
  achievements: z.string().min(20, {
    message: "Please describe your achievements.",
  }),
  challenges: z.string(),
  nextSteps: z.string(),
  financialUpdate: z.string(),
  teamChanges: z.string(),
});

// Types for the report form
type ReportFormValues = z.infer<typeof reportFormSchema>;

// Mock data for program names
const userPrograms = [
  { id: "1", name: "AgriTech Innovation Challenge", type: "Competition" },
  { id: "2", name: "Women in Tech Accelerator", type: "Accelerator" },
  { id: "3", name: "Digital Ethiopia Growth Fund", type: "Funding" },
  { id: "4", name: "Youth Entrepreneurship Program", type: "Training" },
];

// Report types available
const reportTypes = [
  { id: "progress", name: "Progress Report" },
  { id: "milestone", name: "Milestone Completion" },
  { id: "financial", name: "Financial Update" },
  { id: "impact", name: "Impact Assessment" },
  { id: "final", name: "Final Report" },
];

// Report periods available
const reportPeriods = [
  { id: "monthly", name: "Monthly" },
  { id: "quarterly", name: "Quarterly" },
  { id: "midterm", name: "Mid-term" },
  { id: "final", name: "Final" },
  { id: "milestone", name: "Milestone Specific" },
];

export default function SubmitReportPage() {
  const [fileUploads, setFileUploads] = useState<{ name: string; size: string; progress: number }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Initialize the form with default values
  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      title: "",
      reportType: "",
      period: "",
      summary: "",
      achievements: "",
      challenges: "",
      nextSteps: "",
      financialUpdate: "",
      teamChanges: "",
    },
  });

  // Handle form submission
  function onSubmit(data: ReportFormValues) {
    setIsSubmitting(true);
    
    // Simulate API call to submit the report
    setTimeout(() => {
      setIsSubmitting(false);
      router.push("/dashboard/reports?success=true");
    }, 2000);
  }

  // Handle file selection
  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const fileSizeInMB = (file.size / 1024 / 1024).toFixed(2);
      
      // Add the file to the uploads array
      setFileUploads([...fileUploads, {
        name: file.name,
        size: `${fileSizeInMB} MB`,
        progress: 0
      }]);
      
      // Simulate upload progress
      const fileIndex = fileUploads.length;
      const interval = setInterval(() => {
        setFileUploads(current => {
          const updated = [...current];
          if (updated[fileIndex]) {
            if (updated[fileIndex].progress < 100) {
              updated[fileIndex] = {
                ...updated[fileIndex],
                progress: updated[fileIndex].progress + 10
              };
            } else {
              clearInterval(interval);
            }
          }
          return updated;
        });
      }, 300);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button 
          variant="outline" 
          size="sm" 
          className="mr-2"
          onClick={() => router.push("/dashboard/reports")}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Reports
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Submit Report</h1>
      </div>
      
      <Card className="max-w-4xl mx-auto border shadow-sm">
        <CardHeader className="bg-gray-50">
          <CardTitle>Program Progress Report</CardTitle>
          <CardDescription>
            Submit your regular progress report for funded programs, accelerators, or competitions.
            These reports help track your progress and provide visibility to program administrators.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Report Title</FormLabel>
                      <FormControl>
                        <Input placeholder="April 2025 Progress Report" {...field} />
                      </FormControl>
                      <FormDescription>
                        A clear title for your report
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="reportDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Report Date</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          className="h-10 w-full"
                          {...field}
                          value={field.value ? field.value.toISOString().split('T')[0] : ''}
                          onChange={(e) => {
                            field.onChange(e.target.value ? new Date(e.target.value) : undefined);
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        The date this report is being submitted
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="programName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Program Name</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a program" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {userPrograms.map((program) => (
                            <SelectItem key={program.id} value={program.name}>
                              {program.name} ({program.type})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        The program this report is for
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="reportType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Report Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select report type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {reportTypes.map((type) => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        The type of report you are submitting
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="period"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reporting Period</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select period" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {reportPeriods.map((period) => (
                            <SelectItem key={period.id} value={period.id}>
                              {period.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        The period this report covers
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <Separator />
              
              <FormField
                control={form.control}
                name="summary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Executive Summary</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Provide a brief summary of your progress during this reporting period..." 
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      A brief overview of your progress (250-500 words)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="achievements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Key Achievements</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="List your main achievements for this period..." 
                          className="min-h-[120px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Highlight your key milestones and achievements
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="challenges"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Challenges & Obstacles</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe any challenges you faced..." 
                          className="min-h-[120px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Openly share challenges to help program administrators assist you
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="nextSteps"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Next Steps</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Outline your planned next steps..." 
                          className="min-h-[120px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Share your planned activities for the next reporting period
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="financialUpdate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Financial Update</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Provide a summary of your financial status and fund utilization..." 
                          className="min-h-[120px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Summarize how program funds have been used
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="teamChanges"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team Updates</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Note any changes to your team structure or key personnel..." 
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Share information about team changes or new hires
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Supporting Documents</h3>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Input 
                        type="file" 
                        className="absolute inset-0 opacity-0 w-full cursor-pointer" 
                        onChange={handleFileSelect}
                      />
                      <Button type="button" variant="outline" className="gap-2">
                        <Upload className="h-4 w-4" />
                        <span>Upload Files</span>
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500">
                      Upload supporting documents (Max 10MB each)
                    </p>
                  </div>
                </div>
                
                {fileUploads.length > 0 && (
                  <div className="border rounded-md p-4 bg-gray-50">
                    <h4 className="text-sm font-medium mb-3">Uploaded Files</h4>
                    <div className="space-y-3">
                      {fileUploads.map((file, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <File className="h-5 w-5 text-gray-500" />
                          <div className="flex-1">
                            <div className="flex justify-between text-sm">
                              <span className="font-medium">{file.name}</span>
                              <span className="text-gray-500">{file.size}</span>
                            </div>
                            <Progress value={file.progress} className="h-1.5 mt-1" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => router.push("/dashboard/reports")}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Report"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
