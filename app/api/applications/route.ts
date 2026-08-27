import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { applicationSubmitSchema, applicationDraftSchema } from "@/app/dashboard/application/schema";
import { fileService } from "@/lib/services/file";
import { notifyAllAdmins } from "@/lib/notifications";
import { FileValidationError } from "@/lib/services/file/errors";
import type { FileCategoryValue } from "@/types/file.types";

const mapApplicationPayload = (data: any) => ({
  startupName: data.startupName || null,
  industry: data.industry || null,
  status: data.status || "DRAFT",
  numberOfEmployees: data.numberOfEmployees
    ? parseInt(data.numberOfEmployees, 10)
    : null,
  foundingDate: data.foundingDate ? new Date(data.foundingDate) : null,
  phoneNumber: data.phoneNumber || null,
  email: data.businessEmail || null,
  alternateEmail: data.altEmail || null,
  website: data.website || null,
  businessLicense: data.businessRegNumber || null,
  typeOfCompany: data.stage || null,
  directiveStage: data.stage || null,
  vision: data.capital || null,
  totalShares: data.totalShares ? parseFloat(data.totalShares) : null,
  sharePrice: data.sharePrice ? parseFloat(data.sharePrice) : null,
  productDescription: data.businessDescription || null,
  tin: data.tinNumber || null,
  problemStatement: data.problemStatement || null,
  solution: data.solution || null,
  innovationDescription: data.innovationDescription || null,
  targetMarket: data.targetMarket || null,
  competitiveAdvantage: data.competitiveAdvantage || null,
  scalabilityPlan: data.scalabilityPlan || null,
  traction: data.traction || null,
  riskAssessment: data.riskAssessment || null,
  revenue: data.revenue || null,
  totalFundingRaised: data.funding || null,
  investmentNeeded: data.investmentNeeded || null,
  useOfFunds: data.useOfFunds || null,
  fundingSources: data.fundingSources || null,
  businessLicenseFileId: data.businessLicenseFileId || null,
  articlesOfIncorpFileId: data.articlesOfIncorpFileId || null,
  pitchDeckFileId: data.pitchDeckFileId || null,
  financialsFileId: data.financialsFileId || null,
});

const mapFoundersPayload = (founders: any[] = []) =>
  founders.map((founder: any) => ({
    fullName: `${founder.firstName || ""} ${founder.lastName || ""}`.trim(),
    fcn: founder.nationalIdNumber || null,
    noOfShares: founder.numberOfShares
      ? parseFloat(founder.numberOfShares)
      : null,
    email: founder.email || null,
    phone: founder.phone || null,
    role: founder.role || null,
  }));

const APPLICATION_FILE_ID_FIELDS: {
  field: string;
  category: FileCategoryValue;
}[] = [
  { field: "businessLicenseFileId", category: "BUSINESS_LICENSE" },
  { field: "articlesOfIncorpFileId", category: "ARTICLES_OF_INCORPORATION" },
  { field: "pitchDeckFileId", category: "PITCH_DECK" },
  { field: "financialsFileId", category: "FINANCIAL_STATEMENT" },
];

// Guards against referencing another user's uploaded file (IDOR): every
// fileId in the payload must actually exist, match the expected document
// category for that field, and — unless the caller is an admin — be owned
// by the requesting user.
async function assertValidApplicationFileRefs(
  data: any,
  userId: string,
  isAdmin: boolean,
) {
  for (const { field, category } of APPLICATION_FILE_ID_FIELDS) {
    const fileId = data[field];
    if (!fileId) continue;

    const file = await fileService.getFileById(fileId);
    if (!file || file.category !== category) {
      throw new FileValidationError(
        `Invalid file reference for ${field}`,
      );
    }
    if (!isAdmin && file.uploadedBy !== userId) {
      throw new FileValidationError(
        `You do not have access to the referenced file for ${field}`,
      );
    }
  }
}

// GET /api/applications - List applications for the current user with pagination
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = session.user.role?.toUpperCase();
    const isAdmin =
      role === "ADMIN" || role === "SUPER_ADMIN" || role === "REVIEWER";

    const { searchParams } = new URL(req.url);
    const pageParam = Number.parseInt(searchParams.get("page") || "1", 10);
    const pageSizeParam = Number.parseInt(
      searchParams.get("pageSize") || "10",
      10,
    );

    const page = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
    const pageSize = Number.isNaN(pageSizeParam)
      ? 3
      : Math.min(Math.max(pageSizeParam, 3), 100);

    const tab = searchParams.get("tab") || "all";
    const where: any = isAdmin ? {} : { userId: session.user.id };

    if (tab === "under_review") {
      where.status = {
        in: [
          "DRAFT",
          "PENDING",
          "UNDER_REVIEW",
          "REVIEWED",
          "ASSIGNED_TO_COMMITTEE",
          "IN_COMMITTEE_REVIEW",
          "COMMITTEE_REVIEW_SUBMITTED",
          "ROLLED_BACK",
        ],
      };
    } else if (tab === "completed") {
      where.status = { in: ["CERTIFIED", "REJECTED"] };
    } else if (tab === "certified") {
      where.status = "CERTIFIED";
    }

    const total = await prisma.application.count({ where });
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const currentPage = Math.min(page, totalPages);
    const skip = (currentPage - 1) * pageSize;

    const applications = await prisma.application.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
      include: {
        founders: true,
        businessLicenseFile: {
          select: { id: true, originalName: true, mimeType: true, size: true },
        },
        articlesOfIncorpFile: {
          select: { id: true, originalName: true, mimeType: true, size: true },
        },
        pitchDeckFile: {
          select: { id: true, originalName: true, mimeType: true, size: true },
        },
        financialsFile: {
          select: { id: true, originalName: true, mimeType: true, size: true },
        },
        certificate: {
          select: { id: true, certificateNumber: true, filePath: true },
        },
      },
    });

    return NextResponse.json({
      data: applications,
      meta: {
        page: currentPage,
        pageSize,
        total,
        totalPages,
        hasMore: currentPage < totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// Helper to handle application file uploads
async function handleApplicationUploads(
  formData: FormData,
  userId: string,
  applicationId?: string,
) {
  const uploadedIds: Record<string, string> = {};

  const mappings: {
    key: string;
    category: FileCategoryValue;
    idField: string;
  }[] = [
    {
      key: "businessRegistrationFile",
      category: "BUSINESS_LICENSE",
      idField: "businessLicenseFileId",
    },
    {
      key: "businessRegistration",
      category: "BUSINESS_LICENSE",
      idField: "businessLicenseFileId",
    },
    {
      key: "articlesOfIncorporationFile",
      category: "ARTICLES_OF_INCORPORATION",
      idField: "articlesOfIncorpFileId",
    },
    { key: "pitchDeck", category: "PITCH_DECK", idField: "pitchDeckFileId" },
    {
      key: "financialStatements",
      category: "FINANCIAL_STATEMENT",
      idField: "financialsFileId",
    },
  ];

  for (const { key, category, idField } of mappings) {
    const file = formData.get(key);
    if (file instanceof File && file.size > 0) {
      const uploaded = await fileService.uploadFile({
        file,
        uploadedBy: userId,
        category,
        entityType: "APPLICATION",
        entityId: applicationId,
      });
      uploadedIds[idField] = uploaded.id;
    }
  }

  return uploadedIds;
}

// POST /api/applications - Create a new application
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contentType = req.headers.get("content-type") || "";
    let data;
    let fileIds = {};

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const dataString = formData.get("data");
      if (typeof dataString === "string") {
        data = JSON.parse(dataString);
      } else {
        return NextResponse.json(
          { error: "No JSON payload found in form data" },
          { status: 400 },
        );
      }
      fileIds = await handleApplicationUploads(formData, session.user.id);
    } else {
      data = await req.json();
    }

    data = { ...data, ...fileIds };

    await assertValidApplicationFileRefs(data, session.user.id, false);

    // Full validation on submission; a lenient (but still typed/shaped) pass
    // for drafts so malformed data can't be persisted un-checked.
    const schema = data.status === "PENDING" ? applicationSubmitSchema : applicationDraftSchema;
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }
    data = parsed.data;

    const userExists = await prisma.user.findUnique({
      where: { id: session.user.id },
    });
    if (!userExists) {
      return NextResponse.json(
        { error: "User account not found" },
        { status: 404 },
      );
    }

    // Block creation if user already has an active application
    const activeStatuses = [
      "DRAFT", "PENDING", "UNDER_REVIEW", "REVIEWED",
      "ASSIGNED_TO_COMMITTEE", "IN_COMMITTEE_REVIEW",
      "COMMITTEE_REVIEW_SUBMITTED", "ROLLED_BACK",
      "CLARIFICATION_REQUESTED", "PAUSED",
    ];
    const existingActive = await prisma.application.findFirst({
      where: { userId: session.user.id, status: { in: activeStatuses } },
      select: { id: true, startupName: true, status: true },
    });
    if (existingActive) {
      return NextResponse.json(
        { error: `You already have an active application "${existingActive.startupName || 'Untitled'}" (${existingActive.status.replaceAll('_', ' ')}). Please complete or withdraw it before creating a new one.` },
        { status: 409 },
      );
    }

    const newApp = await prisma.application.create({
      data: {
        userId: session.user.id,
        ...mapApplicationPayload(data),
        founders: {
          create: mapFoundersPayload(data.founders),
        },
        ...(data.status === "PENDING"
          ? {
              statusHistory: {
                create: {
                  status: "PENDING",
                  comment: "Application submitted by applicant",
                },
              },
            }
          : {}),
      },
      include: { founders: true },
    });

    if (newApp.status === "PENDING") {
      await notifyAllAdmins({
        title: "New Startup Application",
        message: `Action Required: A new startup application for "${newApp.startupName}" has been officially submitted. It is now pending initial compliance review.`,
        type: "info",
        link: `/admins-new/applications/${newApp.id}`,
      });
    }

    return NextResponse.json(newApp, { status: 201 });
  } catch (error: any) {
    console.error("Error creating application:", error);
    if (error instanceof FileValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}

// PATCH /api/applications - Update status or fields (admin or applicant)
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contentType = req.headers.get("content-type") || "";
    let data;
    let fileIds = {};

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const dataString = formData.get("data");
      if (typeof dataString === "string") {
        data = JSON.parse(dataString);
      } else {
        return NextResponse.json(
          { error: "No JSON payload found in form data" },
          { status: 400 },
        );
      }
      fileIds = await handleApplicationUploads(
        formData,
        session.user.id,
        data.id,
      );
    } else {
      data = await req.json();
    }

    data = { ...data, ...fileIds };
    const { id } = data;

    if (!id) {
      return NextResponse.json(
        { error: "Application id is required" },
        { status: 400 },
      );
    }

    const role = session.user.role?.toUpperCase();
    const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN" || role === "REVIEWER";

    await assertValidApplicationFileRefs(data, session.user.id, isAdmin);

    // Full validation on submission; a lenient (but still typed/shaped) pass
    // for drafts so malformed data can't be persisted un-checked.
    const schema = data.status === "PENDING" ? applicationSubmitSchema : applicationDraftSchema;
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }
    data = parsed.data;

    const existingApplication = await prisma.application.findFirst({
      where: {
        id,
        // Only restrict to userId if not an admin
        ...(isAdmin ? {} : { userId: session.user.id }),
      },
      select: { id: true, status: true },
    });

    if (!existingApplication) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 },
      );
    }

    const shouldAddSubmittedHistory =
      data.status === "PENDING" && existingApplication.status !== "PENDING";

    const updated = await prisma.application.update({
      where: { id },
      data: {
        ...mapApplicationPayload(data),
        founders: {
          deleteMany: {},
          create: mapFoundersPayload(data.founders),
        },
        ...(shouldAddSubmittedHistory
          ? {
              statusHistory: {
                create: {
                  status: "PENDING",
                  comment: "Application submitted by applicant",
                },
              },
            }
          : {}),
      },
      include: { founders: true },
    });

    if (shouldAddSubmittedHistory) {
      await notifyAllAdmins({
        title: "New Startup Application",
        message: `Action Required: An updated startup application for "${updated.startupName}" has been re-submitted and requires review.`,
        type: "info",
        link: `/admins-new/applications/${updated.id}`,
      });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Error updating application:", error);
    if (error instanceof FileValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
