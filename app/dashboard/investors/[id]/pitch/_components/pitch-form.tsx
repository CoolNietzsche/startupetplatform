'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
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
import { Investor, Pitch } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { FileUploader } from "@/components/ui/file-uploader";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/vnd.ms-powerpoint",
];

const pitchSchema = z.object({
    subject: z.string().min(1, "Subject is required"),
    message: z.string()
        .min(100, "Message must be at least 100 characters")
        .max(5000, "Message cannot exceed 5000 characters"),
    attachments: z
        .array(z.string())
        .min(1, "At least one attachment is required")
        .max(3, "Maximum 3 files allowed"),
});

type PitchFormValues = z.infer<typeof pitchSchema>;

interface PitchFormProps {
    investor: Investor;
    existingPitch?: Pitch;
}

export function PitchForm({ investor, existingPitch }: PitchFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<PitchFormValues>({
        resolver: zodResolver(pitchSchema),
        defaultValues: {
            subject: existingPitch?.subject || "",
            message: existingPitch?.message || "",
            attachments: existingPitch?.attachments || [],
        },
    });

    async function onSubmit(data: PitchFormValues) {
        try {
            setIsSubmitting(true);

            const response = await fetch("/api/pitches", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    investorId: investor.id,
                    ...data,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to submit pitch");
            }

            toast.success("Pitch submitted successfully");
            router.push("/dashboard/investors");
            router.refresh();
        } catch (error) {
            console.error("Error submitting pitch:", error);
            toast.error("Failed to submit pitch. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Subject</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Enter the subject of your pitch"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>
                                A clear and concise subject line for your pitch
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Message</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Write your pitch message here..."
                                    className="min-h-[200px]"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>
                                Include key information about your startup, traction, team,
                                and why you&apos;re a good fit for this investor
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="attachments"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Attachments</FormLabel>
                            <FormControl>
                                <FileUploader
                                    value={field.value}
                                    onChange={field.onChange}
                                    maxFiles={3}
                                    maxSize={MAX_FILE_SIZE}
                                    acceptedTypes={ACCEPTED_FILE_TYPES}
                                />
                            </FormControl>
                            <FormDescription>
                                Upload your pitch deck and other relevant documents (PDF,
                                PPT, PPTX). Maximum 3 files, 10MB each.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex items-center gap-4">
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Submitting..." : "Submit Pitch"}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                    >
                        Cancel
                    </Button>
                </div>
            </form>
        </Form>
    );
}
