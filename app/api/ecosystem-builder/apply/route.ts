import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import db from "@/lib/db/index";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notifyAllAdmins } from "@/lib/notifications";
import { fileService } from "@/lib/services/file";
import type { FileCategoryValue } from "@/types/file.types";

const ECO_BUILDER_FILE_ID_FIELDS: {
  field: "businessLicenseFileId" | "taxRegistrationFileId";
  category: FileCategoryValue;
}[] = [
  { field: "businessLicenseFileId", category: "BUSINESS_LICENSE" },
  { field: "taxRegistrationFileId", category: "TAX_REGISTRATION" },
];

// Guards against referencing another user's uploaded file (IDOR): every
// fileId in the payload must exist, match the expected document category,
// and be owned by the requesting user.
async function assertValidEcoBuilderFileRefs(
  data: Record<string, unknown>,
  userId: string,
): Promise<string | null> {
  for (const { field, category } of ECO_BUILDER_FILE_ID_FIELDS) {
    const fileId = data[field];
    if (!fileId || typeof fileId !== "string") continue;

    const file = await fileService.getFileById(fileId);
    if (!file || file.category !== category) {
      return `Invalid file reference for ${field}`;
    }
    if (file.uploadedBy !== userId) {
      return `You do not have access to the referenced file for ${field}`;
    }
  }
  return null;
}

const phoneRegex = /^\+?[0-9\s\-()]{10,20}$/;

const EDITABLE_STATUSES = ["DRAFT", "PENDING", "UNDER_REVIEW", "REVIEWED"] as const;

const submissionModeSchema = z.enum(["draft", "submit"]);
const optionalApplicationIdSchema = z.string().trim().min(1).optional();

function toEstablishedYear(yearsOfOperation: number): number {
  return Math.max(1900, new Date().getFullYear() - yearsOfOperation);
}

function toYearsOfOperation(established: number | null): number | null {
  if (!established) return null;
  return Math.max(0, new Date().getFullYear() - established);
}

function toPortalStatus(status: string, certified: boolean): "draft" | "pending" | "under_review" | "certified" | "rejected" {
  if (status === "DRAFT") return "draft";
  if (status === "PENDING") return "pending";
  if (certified || status === "CERTIFIED") return "certified";
  if (status === "REJECTED") return "rejected";
  return "under_review";
}

function canEditApplication(status: string, certified: boolean): boolean {
  return !certified && EDITABLE_STATUSES.includes(status as (typeof EDITABLE_STATUSES)[number]);
}

const ecosystemBuilderApplySchema = z.object({
  name: z.string().trim().min(2).max(100),
  type: z.enum(["COWORKING", "INCUBATOR", "ACCELERATOR", "INVESTOR", "TRAINING", "OTHER"]),
  websiteUrl: z
    .string()
    .trim()
    .refine((value) => {
      if (!value) return true;
      try {
        const normalized =
          value.startsWith("http://") || value.startsWith("https://")
            ? value
            : `https://${value}`;
        new URL(normalized);
        return true;
      } catch {
        return false;
      }
    }, "Please enter a valid website URL."),
  description: z.string().trim().min(30).max(500),
  address: z.string().trim().min(5).max(200),
  city: z.string().trim().min(2).max(80),
  region: z.string().trim().min(2).max(80),
  contactName: z.string().trim().min(2).max(100),
  contactEmail: z.string().trim().email(),
  contactPhone: z.string().trim().regex(phoneRegex, "Please enter a valid phone number."),
  services: z.array(z.string()).nonempty(),
  serviceDescription: z.string().trim().min(30).max(500),
  yearsOfOperation: z.coerce.number().int().min(0).max(200),
  startupsSupported: z.coerce.number().int().min(0).max(100000),
  impactDescription: z.string().trim().min(50).max(1000),
  businessLicenseFileId: z.string().trim().min(1, "Business license is required."),
  taxRegistrationFileId: z.string().trim().min(1, "Tax registration is required."),
  termsAgreed: z.literal(true),
});

const ecosystemBuilderDraftSchema = z.object({
  name: z.string().trim().optional(),
  type: z.enum(["COWORKING", "INCUBATOR", "ACCELERATOR", "INVESTOR", "TRAINING", "OTHER"]).optional(),
  websiteUrl: z
    .string()
    .trim()
    .optional()
    .refine((value) => {
      if (!value) return true;
      try {
        const normalized =
          value.startsWith("http://") || value.startsWith("https://")
            ? value
            : `https://${value}`;
        new URL(normalized);
        return true;
      } catch {
        return false;
      }
    }, "Please enter a valid website URL."),
  description: z.string().trim().optional(),
  address: z.string().trim().optional(),
  city: z.string().trim().optional(),
  region: z.string().trim().optional(),
  contactName: z.string().trim().optional(),
  contactEmail: z.string().trim().optional().refine((value) => !value || z.string().email().safeParse(value).success, "Please enter a valid email address."),
  contactPhone: z.string().trim().optional().refine((value) => !value || phoneRegex.test(value), "Please enter a valid phone number."),
  services: z.array(z.string()).optional(),
  serviceDescription: z.string().trim().optional(),
  yearsOfOperation: z.coerce.number().int().min(0).max(200).optional(),
  startupsSupported: z.coerce.number().int().min(0).max(100000).optional(),
  impactDescription: z.string().trim().optional(),
  businessLicenseFileId: z.string().trim().nullish(),
  taxRegistrationFileId: z.string().trim().nullish(),
  termsAgreed: z.boolean().optional(),
});

function normalizeOptionalString(value?: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeWebsite(url: string): string {
  const trimmed = url.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

function isSchemaMismatchError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : "";
  return (
    (error as { code?: string } | null)?.code === "P2022" ||
    (error as { code?: string } | null)?.code === "P2021" ||
    message.includes("The column `(not available)` does not exist in the current database") ||
    message.includes("The table `user.EcosystemBuilder` does not exist in the current database") ||
    message.includes("The table `user.EcoApplication` does not exist in the current database") ||
    message.includes("The table `user.EcoApplicationStatusHistory` does not exist in the current database") ||
    message.includes("Unknown argument `userId`") ||
    message.includes("Invalid input value for enum") ||
    message.includes("value for enum")
  );
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const submissionModeResult = submissionModeSchema.safeParse(body.submissionMode ?? "submit");
    const applicationIdResult = optionalApplicationIdSchema.safeParse(body.applicationId);

    if (!submissionModeResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: { submissionMode: ["Invalid submission mode."] },
        },
        { status: 400 },
      );
    }

    if (!applicationIdResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: { applicationId: ["Invalid application id."] },
        },
        { status: 400 },
      );
    }

    const submissionMode = submissionModeResult.data;
    const requestedApplicationId = applicationIdResult.data;
    const parsed = submissionMode === "draft"
      ? ecosystemBuilderDraftSchema.safeParse(body)
      : ecosystemBuilderApplySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const data = parsed.data;

    const fileRefError = await assertValidEcoBuilderFileRefs(data, session.user.id);
    if (fileRefError) {
      return NextResponse.json(
        { success: false, error: fileRefError },
        { status: 400 },
      );
    }

    const targetStatus = submissionMode === "draft" ? "DRAFT" : "PENDING";

    const existingBuilder = await db.ecosystemBuilder.findFirst({
      where: {
        userId: session.user.id,
      },
      include: {
        ecoApplications: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    const latestExistingApplication = existingBuilder?.ecoApplications[0] ?? null;
    const explicitExistingApplication = requestedApplicationId
      ? await db.ecoApplication.findFirst({
          where: {
            id: requestedApplicationId,
            builderId: existingBuilder?.id,
          },
        })
      : null;

    if (requestedApplicationId && !explicitExistingApplication) {
      return NextResponse.json(
        {
          success: false,
          error: "Application not found",
          message: "The selected application could not be found for your account.",
        },
        { status: 404 },
      );
    }

    const implicitDraftApplication =
      !requestedApplicationId && latestExistingApplication?.status === "DRAFT"
        ? latestExistingApplication
        : null;

    const targetExistingApplication = explicitExistingApplication ?? implicitDraftApplication;

    if (
      targetExistingApplication &&
      !canEditApplication(targetExistingApplication.status, existingBuilder?.certified ?? false)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Application cannot be edited",
          message: "This application can no longer be edited.",
        },
        { status: 409 },
      );
    }

    const builder = await db.ecosystemBuilder.upsert({
      where: {
        userId: session.user.id,
      },
      create: {
        userId: session.user.id,
        name: normalizeOptionalString(data.name) ?? "",
        type: data.type ?? "OTHER",
        location: normalizeOptionalString(data.city) ?? "",
        region: normalizeOptionalString(data.region) ?? "",
        website: normalizeOptionalString(data.websiteUrl) ? normalizeWebsite(data.websiteUrl as string) : null,
        certified: false,
        reviewed: false,
        established: typeof data.yearsOfOperation === "number" ? toEstablishedYear(data.yearsOfOperation) : null,
        capacity: data.startupsSupported ?? null,
        services: data.services ?? [],
        description: normalizeOptionalString(data.description),
        address: normalizeOptionalString(data.address),
        city: normalizeOptionalString(data.city),
        contactName: normalizeOptionalString(data.contactName),
        contactEmail: normalizeOptionalString(data.contactEmail),
        contactPhone: normalizeOptionalString(data.contactPhone),
        serviceDescription: normalizeOptionalString(data.serviceDescription),
        impactDescription: normalizeOptionalString(data.impactDescription),
        businessLicenseFileId: normalizeOptionalString(data.businessLicenseFileId),
        taxRegistrationFileId: normalizeOptionalString(data.taxRegistrationFileId),
      },
      update: {
        name: normalizeOptionalString(data.name) ?? "",
        type: data.type ?? "OTHER",
        location: normalizeOptionalString(data.city) ?? "",
        region: normalizeOptionalString(data.region) ?? "",
        website: normalizeOptionalString(data.websiteUrl) ? normalizeWebsite(data.websiteUrl as string) : null,
        established: typeof data.yearsOfOperation === "number" ? toEstablishedYear(data.yearsOfOperation) : null,
        capacity: data.startupsSupported ?? null,
        services: data.services ?? [],
        description: normalizeOptionalString(data.description),
        address: normalizeOptionalString(data.address),
        city: normalizeOptionalString(data.city),
        contactName: normalizeOptionalString(data.contactName),
        contactEmail: normalizeOptionalString(data.contactEmail),
        contactPhone: normalizeOptionalString(data.contactPhone),
        serviceDescription: normalizeOptionalString(data.serviceDescription),
        impactDescription: normalizeOptionalString(data.impactDescription),
        businessLicenseFileId: normalizeOptionalString(data.businessLicenseFileId),
        taxRegistrationFileId: normalizeOptionalString(data.taxRegistrationFileId),
        deletedAt: null,
      },
    });

    const latestApplication = targetExistingApplication;

    const application = latestApplication
      ? await db.ecoApplication.update({
          where: { id: latestApplication.id },
          data: {
            status: targetStatus,
            editingLocked: false,
            submittedAt:
              submissionMode === "submit"
                ? latestApplication.submittedAt ?? new Date()
                : null,
            validatedAt: null,
            rejectedReason: null,
            rollbackReason: null,
            name: normalizeOptionalString(data.name) ?? "",
            type: data.type ?? "OTHER",
            location: normalizeOptionalString(data.city) ?? "",
            region: normalizeOptionalString(data.region) ?? "",
            website: normalizeOptionalString(data.websiteUrl) ? normalizeWebsite(data.websiteUrl as string) : null,
            services: data.services ?? [],
            description: normalizeOptionalString(data.description),
            address: normalizeOptionalString(data.address),
            city: normalizeOptionalString(data.city),
            contactName: normalizeOptionalString(data.contactName),
            contactEmail: normalizeOptionalString(data.contactEmail),
            contactPhone: normalizeOptionalString(data.contactPhone),
            serviceDescription: normalizeOptionalString(data.serviceDescription),
            impactDescription: normalizeOptionalString(data.impactDescription),
            established: typeof data.yearsOfOperation === "number" ? toEstablishedYear(data.yearsOfOperation) : null,
            capacity: data.startupsSupported ?? null,
            businessLicenseFileId: normalizeOptionalString(data.businessLicenseFileId),
            taxRegistrationFileId: normalizeOptionalString(data.taxRegistrationFileId),
          },
        })
      : await db.ecoApplication.create({
          data: {
            builderId: builder.id,
            status: targetStatus,
            submittedAt: submissionMode === "submit" ? new Date() : null,
            editingLocked: false,
            name: normalizeOptionalString(data.name) ?? "",
            type: data.type ?? "OTHER",
            location: normalizeOptionalString(data.city) ?? "",
            region: normalizeOptionalString(data.region) ?? "",
            website: normalizeOptionalString(data.websiteUrl) ? normalizeWebsite(data.websiteUrl as string) : null,
            services: data.services ?? [],
            description: normalizeOptionalString(data.description),
            address: normalizeOptionalString(data.address),
            city: normalizeOptionalString(data.city),
            contactName: normalizeOptionalString(data.contactName),
            contactEmail: normalizeOptionalString(data.contactEmail),
            contactPhone: normalizeOptionalString(data.contactPhone),
            serviceDescription: normalizeOptionalString(data.serviceDescription),
            impactDescription: normalizeOptionalString(data.impactDescription),
            established: typeof data.yearsOfOperation === "number" ? toEstablishedYear(data.yearsOfOperation) : null,
            capacity: data.startupsSupported ?? null,
            businessLicenseFileId: normalizeOptionalString(data.businessLicenseFileId),
            taxRegistrationFileId: normalizeOptionalString(data.taxRegistrationFileId),
          },
        });

    await db.ecoApplicationStatusHistory.create({
      data: {
        ecoApplicationId: application.id,
        fromStatus: latestApplication?.status,
        toStatus: application.status,
        changedById: session.user.id,
        reason:
          submissionMode === "draft"
            ? latestApplication
              ? "Draft updated by ecosystem builder"
              : "Draft created by ecosystem builder"
            : latestApplication
              ? "Application updated by ecosystem builder"
              : "Application submitted by ecosystem builder",
      },
    });

    if (submissionMode === "submit") {
       await notifyAllAdmins({
         title: "New Ecosystem Application",
         message: `Action Required: A new Ecosystem Builder application for "${application.name}" has been officially submitted. It is now pending initial compliance review.`,
         type: "info",
         link: `/admins-new/ecosystem/review/${application.id}`,
       });
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          id: application.id,
          builderId: builder.id,
          workflowStatus: application.status,
        },
        message:
          submissionMode === "draft"
            ? "Draft saved successfully."
            : "Application submitted successfully.",
      },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("Unknown argument `userId`")) {
      return NextResponse.json(
        {
          success: false,
          error: "Server schema is out of date",
          message:
            "Prisma Client was generated before adding EcosystemBuilder.userId. This project uses the split Prisma schema folder, so run Prisma commands against `prisma/schema` instead of `prisma/schema/schema.prisma`, then restart.",
        },
        { status: 409 },
      );
    }

    if (isSchemaMismatchError(error)) {
      return NextResponse.json(
        {
          success: false,
          error: "Database schema is out of date",
          message:
            "The database is missing the ecosystem builder tables and/or the latest ecosystem application schema changes. This project uses the split Prisma schema folder, so sync `prisma/schema` to the database, then restart the dev server.",
        },
        { status: 409 },
      );
    }

    console.error("Ecosystem builder apply POST failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error",
      },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const requestedApplicationId = req.nextUrl.searchParams.get("applicationId");

    const builder = await db.ecosystemBuilder.findFirst({
      where: {
        userId: session.user.id,
        deletedAt: null,
      },
      orderBy: { createdAt: "desc" },
      include: {
        ecoApplications: requestedApplicationId
          ? {
              where: { id: requestedApplicationId },
              orderBy: { createdAt: "desc" },
              take: 1,
            }
          : {
              orderBy: { createdAt: "desc" },
              take: 1,
            },
      },
    });

    if (!builder) {
      return NextResponse.json({ success: true, data: null });
    }

    const latestApplication = builder.ecoApplications[0] ?? null;
    if (!latestApplication) {
      return NextResponse.json({ success: true, data: null });
    }
    const workflowStatus = latestApplication.status;
    const status = toPortalStatus(workflowStatus, builder.certified);

    // Fetch file names if they exist
    let businessLicenseFileName = null;
    let taxRegistrationFileName = null;

    if (latestApplication.businessLicenseFileId) {
      const file = await db.file.findUnique({
        where: { id: latestApplication.businessLicenseFileId },
        select: { originalName: true },
      });
      if (file) businessLicenseFileName = file.originalName;
    }

    if (latestApplication.taxRegistrationFileId) {
      const file = await db.file.findUnique({
        where: { id: latestApplication.taxRegistrationFileId },
        select: { originalName: true },
      });
      if (file) taxRegistrationFileName = file.originalName;
    }

    return NextResponse.json({
      success: true,
      data: {
        id: latestApplication.id,
        builderId: builder.id,
        status,
        workflowStatus,
        certified: builder.certified,
        canEdit: canEditApplication(workflowStatus, builder.certified),
        name: latestApplication.name,
        type: latestApplication.type,
        location: latestApplication.location,
        address: latestApplication.address,
        city: latestApplication.city,
        region: latestApplication.region,
        contactName: latestApplication.contactName,
        contactEmail: latestApplication.contactEmail,
        contactPhone: latestApplication.contactPhone,
        website: latestApplication.website,
        services: latestApplication.services,
        description: latestApplication.description,
        serviceDescription: latestApplication.serviceDescription,
        impactDescription: latestApplication.impactDescription,
        established: latestApplication.established,
        yearsOfOperation: toYearsOfOperation(latestApplication.established),
        capacity: latestApplication.capacity,
        businessLicenseFileId: latestApplication.businessLicenseFileId,
        taxRegistrationFileId: latestApplication.taxRegistrationFileId,
        businessLicenseFileName,
        taxRegistrationFileName,
        submittedAt: latestApplication.submittedAt,
        createdAt: latestApplication.createdAt,
        updatedAt: latestApplication.updatedAt,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("Unknown argument `userId`")) {
      return NextResponse.json(
        {
          success: false,
          error: "Server schema is out of date",
          message:
            "Prisma Client was generated before adding EcosystemBuilder.userId. Stop the dev server, run `pnpm prisma generate --schema prisma/schema/schema.prisma`, apply migrations, then restart.",
        },
        { status: 409 },
      );
    }

    if (isSchemaMismatchError(error)) {
      return NextResponse.json(
        {
          success: false,
          error: "Database schema is out of date",
          message:
            "The database is missing the ecosystem builder tables and/or the latest ecosystem application schema changes. Sync `prisma/schema/schema.prisma` to the database, then restart the dev server.",
        },
        { status: 409 },
      );
    }

    console.error("Ecosystem builder apply GET failed:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
