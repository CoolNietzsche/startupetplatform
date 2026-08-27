"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, ArrowRight } from "lucide-react";

// Form schema
const projectFormSchema = z.object({
  title: z.string().min(2, "Project title must be at least 2 characters"),
  summary: z.string().min(10, "Summary must be at least 10 characters"),
  objectives: z.string().min(10, "Objectives must be at least 10 characters"),
  problemStatement: z.string().min(10, "Problem statement must be at least 10 characters"),
  solution: z.string().min(10, "Solution must be at least 10 characters"),
  targetMarket: z.string().min(10, "Target market must be at least 10 characters"),
  competitiveAdvantage: z.string().min(10, "Competitive advantage must be at least 10 characters"),
  fundingAmount: z.string().min(1, "Funding amount is required"),
  fundingUsage: z.string().min(10, "Funding usage must be at least 10 characters"),
  currentProgress: z.string().min(1, "Current progress is required"),
  keyMilestones: z.string().min(10, "Key milestones must be at least 10 characters"),
  sustainabilityImpact: z.string().min(1, "Sustainability impact is required"),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: "You must accept the terms to proceed",
  }),
});

interface ProjectDetailsFormProps {
  initialData: any;
  onSave: (data: any) => void;
  onBack: () => void;
}

export function ProjectDetailsForm({ initialData, onSave, onBack }: ProjectDetailsFormProps) {
  const form = useForm<z.infer<typeof projectFormSchema>>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: initialData || {
      title: "",
      summary: "",
      objectives: "",
      problemStatement: "",
      solution: "",
      targetMarket: "",
      competitiveAdvantage: "",
      fundingAmount: "",
      fundingUsage: "",
      currentProgress: "",
      keyMilestones: "",
      sustainabilityImpact: "",
      acceptTerms: false,
    },
  });

  const handleSubmit = (data: z.infer<typeof projectFormSchema>) => {
    onSave(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Details</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Title*</FormLabel>
                  <FormControl>
                    <Input placeholder="Name of your innovation or project" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="summary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Summary*</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Briefly summarize your project or innovation (100-200 words)"
                      className="min-h-24"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="problemStatement"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Problem Statement*</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="What problem are you solving in Ethiopia?"
                        className="min-h-24"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="solution"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Proposed Solution*</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="How does your product/service solve this problem?"
                        className="min-h-24"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="objectives"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Objectives*</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What are the main objectives of your project?"
                      className="min-h-24"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="targetMarket"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Market*</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your target market in Ethiopia"
                        className="min-h-24"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="competitiveAdvantage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Competitive Advantage*</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="What makes your solution unique?"
                        className="min-h-24"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="fundingAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Requested Funding Amount (USD)*</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 25000" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter amount in USD (between 10,000 - 50,000)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currentProgress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Project Status*</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select current status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Concept">Concept Stage</SelectItem>
                        <SelectItem value="Prototype">Prototype Development</SelectItem>
                        <SelectItem value="MVP">Minimum Viable Product</SelectItem>
                        <SelectItem value="Beta">Beta Testing</SelectItem>
                        <SelectItem value="Market Entry">Market Entry</SelectItem>
                        <SelectItem value="Growth">Growth/Scaling Phase</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="fundingUsage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Funding Usage Plan*</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide a breakdown of how you plan to use the funding"
                      className="min-h-24"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="keyMilestones"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Key Milestones*</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="List the key milestones you aim to achieve with this funding"
                      className="min-h-24"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sustainabilityImpact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sustainability & Social Impact*</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select primary impact area" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Job Creation">Job Creation</SelectItem>
                      <SelectItem value="Food Security">Food Security</SelectItem>
                      <SelectItem value="Healthcare Access">Healthcare Access</SelectItem>
                      <SelectItem value="Education Access">Education Access</SelectItem>
                      <SelectItem value="Financial Inclusion">Financial Inclusion</SelectItem>
                      <SelectItem value="Clean Energy">Clean Energy</SelectItem>
                      <SelectItem value="Environmental Conservation">Environmental Conservation</SelectItem>
                      <SelectItem value="Gender Equality">Gender Equality</SelectItem>
                      <SelectItem value="Youth Empowerment">Youth Empowerment</SelectItem>
                      <SelectItem value="Rural Development">Rural Development</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="acceptTerms"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Terms and Conditions*
                    </FormLabel>
                    <FormDescription>
                      I certify that all information provided is accurate and complete. I understand that providing false information may result in disqualification and potential legal consequences.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
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
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              Next Step
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
