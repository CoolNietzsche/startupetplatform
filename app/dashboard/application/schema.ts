import { z } from "zod";

// ---------------------------------------------------------------------------
// Founder schema
// ---------------------------------------------------------------------------

export const founderSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  nationalIdNumber: z.string().regex(/^\d{16}$/, "National ID must be exactly 16 digits"),
  numberOfShares: z.string().min(1, "Number of shares is required"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  phone: z.string().optional().default(""),
  role: z.string().optional().default(""),
});

// ---------------------------------------------------------------------------
// Per-step schemas (used for client-side step validation)
// ---------------------------------------------------------------------------

export const businessStepSchema = z.object({
  startupName: z.string().min(1, "Startup name is required"),
  businessRegNumber: z.string().optional().default(""),
  tinNumber: z.string().optional().default(""),
  numberOfEmployees: z.string().min(1, "Number of employees is required"),
  industry: z.string().min(1, "Industry is required"),
  stage: z.string().min(1, "Company stage is required"),
  businessEmail: z
    .string()
    .min(1, "Business email is required")
    .email("Invalid email"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  // Optional business fields
  foundingDate: z.string().optional().default(""),
  website: z.string().optional().default(""),
  altEmail: z.string().optional().default(""),
  capital: z.string().optional().default(""),
});

export function computeFounderSharePct(totalShares: string, founders: { numberOfShares?: string }[]): number {
  const total = Number(totalShares) || 0;
  if (total === 0) return 0;
  const allocated = founders.reduce((sum, f) => sum + (Number(f.numberOfShares) || 0), 0);
  return Math.round((allocated / total) * 100);
}

export const founderStepSchema = z
  .object({
    totalShares: z.string().min(1, "Total shares is required"),
    sharePrice: z.string().min(1, "Share price is required"),
    founders: z.array(founderSchema).min(1, "At least one founder is required"),
  })
  .refine(
    (data) => {
      const total = Number(data.totalShares) || 0;
      const allocated = data.founders.reduce(
        (sum, f) => sum + (Number(f.numberOfShares) || 0),
        0,
      );
      return total >= allocated;
    },
    {
      message: "Founder shares cannot exceed total shares",
      path: ["totalShares"],
    },
  )
  .refine(
    (data) => computeFounderSharePct(data.totalShares, data.founders) >= 25,
    {
      message: "Founding team must hold at least 25% of total shares (መመሪያ Art. 22)",
      path: ["founders"],
    },
  );

export const MIN_NARRATIVE_CHARS = 50;
export const MIN_OPTIONAL_CHARS = 25;

export const detailsStepSchema = z.object({
  businessDescription: z.string().min(MIN_NARRATIVE_CHARS, `Business description requires at least ${MIN_NARRATIVE_CHARS} characters`),
  problemStatement: z.string().min(MIN_NARRATIVE_CHARS, `Problem statement requires at least ${MIN_NARRATIVE_CHARS} characters`),
  solution: z.string().min(MIN_NARRATIVE_CHARS, `Solution requires at least ${MIN_NARRATIVE_CHARS} characters`),
  innovationDescription: z.string().min(MIN_NARRATIVE_CHARS, `Innovation description requires at least ${MIN_NARRATIVE_CHARS} characters`),
  targetMarket: z.string().min(MIN_NARRATIVE_CHARS, `Target market requires at least ${MIN_NARRATIVE_CHARS} characters`),
  competitiveAdvantage: z.string().min(MIN_NARRATIVE_CHARS, `Competitive advantage requires at least ${MIN_NARRATIVE_CHARS} characters`),
  scalabilityPlan: z.string().min(MIN_NARRATIVE_CHARS, `Scalability plan requires at least ${MIN_NARRATIVE_CHARS} characters`),
  traction: z.string().optional().default(""),
  riskAssessment: z.string().optional().default(""),
});

export const financialStepSchema = z.object({
  revenue: z.string().optional().default(""),
  funding: z.string().optional().default(""),
  fundingSources: z.string().optional().default(""),
  investmentNeeded: z.string().optional().default(""),
  useOfFunds: z.string().optional().default(""),
});

// Required documents: a file counts as present if it's already stored
// (an *FileId string from a prior upload) or freshly selected in this
// session (a File object staged for upload on submit). Financial
// statements are intentionally excluded — the UI marks them optional.
function hasStagedOrStoredFile(
  data: Record<string, any>,
  storedIdField: string,
  ...pendingFileFields: string[]
): boolean {
  if (typeof data[storedIdField] === "string" && data[storedIdField].length > 0) {
    return true;
  }
  return pendingFileFields.some((field) => data[field] instanceof File);
}

export function validateDocumentsStep(data: Record<string, any>): StepErrors {
  const errors: StepErrors = {};
  if (!hasStagedOrStoredFile(data, "businessLicenseFileId", "businessRegistrationFile", "businessRegistration")) {
    errors.businessLicenseFileId = "Business registration certificate is required";
  }
  if (!hasStagedOrStoredFile(data, "articlesOfIncorpFileId", "articlesOfIncorporationFile")) {
    errors.articlesOfIncorpFileId = "Articles of incorporation is required";
  }
  if (!hasStagedOrStoredFile(data, "pitchDeckFileId", "pitchDeck")) {
    errors.pitchDeckFileId = "Pitch deck is required";
  }
  return errors;
}

// ---------------------------------------------------------------------------
// Full application schema (used for server-side validation before DB write)
// ---------------------------------------------------------------------------

const optStr = z
  .union([z.string(), z.null()])
  .optional()
  .transform((v) => v ?? "");

export const applicationSubmitSchema = z
  .object({
    // Business Information
    startupName: z.string().min(1, "Startup name is required"),
    businessRegNumber: optStr,
    tinNumber: optStr,
    numberOfEmployees: z.string().min(1, "Number of employees is required"),
    industry: z.string().min(1, "Industry is required"),
    stage: z.enum(["INITIAL", "POST_INITIAL", "SCALE_EXIT"], { message: "Select a valid lifecycle stage (Initial, Post-Initial, or Scale & Exit)" }),
    businessEmail: z
      .string()
      .min(1, "Business email is required")
      .email("Invalid email"),
    phoneNumber: z.string().min(1, "Phone number is required"),
    foundingDate: optStr,
    website: optStr,
    altEmail: optStr,
    capital: optStr,

    // Share Information
    totalShares: z.string().min(1, "Total shares is required"),
    sharePrice: z.string().min(1, "Share price is required"),

    // Founders
    founders: z.array(founderSchema).min(1, "At least one founder is required"),

    // Business Details
    businessDescription: z.string().min(1, "Business description is required"),
    problemStatement: z.string().min(1, "Problem statement is required"),
    solution: z.string().min(1, "Solution is required"),
    innovationDescription: z
      .string()
      .min(1, "Innovation description is required"),
    targetMarket: z.string().min(1, "Target market is required"),
    competitiveAdvantage: z
      .string()
      .min(1, "Competitive advantage is required"),
    scalabilityPlan: z.string().min(1, "Scalability plan is required"),
    traction: optStr,
    riskAssessment: optStr,

    // Financial (all optional)
    revenue: optStr,
    funding: optStr,
    fundingSources: optStr,
    investmentNeeded: optStr,
    useOfFunds: optStr,

    // Required supporting documents (financial statements are optional)
    businessLicenseFileId: z.string().min(1, "Business registration certificate is required"),
    articlesOfIncorpFileId: z.string().min(1, "Articles of incorporation is required"),
    pitchDeckFileId: z.string().min(1, "Pitch deck is required"),
    financialsFileId: optStr,

    // Status
    status: z.string().optional().default("PENDING"),
  })
  .passthrough()
  .refine(
    (data) => {
      const total = Number(data.totalShares) || 0;
      const allocated = data.founders.reduce(
        (sum, f) => sum + (Number(f.numberOfShares) || 0),
        0,
      );
      return total >= allocated;
    },
    {
      message: "Founder shares cannot exceed total shares",
      path: ["totalShares"],
    },
  )
  .refine(
    (data) => computeFounderSharePct(data.totalShares, data.founders) >= 25,
    {
      message: "Founding team must hold at least 25% of total shares (መመሪያ Art. 22)",
      path: ["founders"],
    },
  );

// Draft schema is lenient — only requires an optional status override
export const applicationDraftSchema = z
  .object({
    startupName: optStr,
    businessRegNumber: optStr,
    tinNumber: optStr,
    numberOfEmployees: optStr,
    industry: optStr,
    stage: optStr,
    businessEmail: optStr,
    phoneNumber: optStr,
    foundingDate: optStr,
    website: optStr,
    altEmail: optStr,
    capital: optStr,
    totalShares: optStr,
    sharePrice: optStr,
    founders: z.array(founderSchema.partial()).optional().default([]),
    businessDescription: optStr,
    problemStatement: optStr,
    solution: optStr,
    innovationDescription: optStr,
    targetMarket: optStr,
    competitiveAdvantage: optStr,
    scalabilityPlan: optStr,
    traction: optStr,
    riskAssessment: optStr,
    revenue: optStr,
    funding: optStr,
    fundingSources: optStr,
    investmentNeeded: optStr,
    useOfFunds: optStr,
    status: z.string().optional().default("DRAFT"),
    id: z.string().optional(),
  })
  .passthrough();

// ---------------------------------------------------------------------------
// Helper: validate a single step and return field-level errors
// ---------------------------------------------------------------------------

export type StepErrors = Record<string, string>;

export function validateStep(
  step: string,
  data: Record<string, any>,
): StepErrors {
  let result: z.SafeParseReturnType<any, any>;

  switch (step) {
    case "business":
      result = businessStepSchema.safeParse(data);
      break;
    case "founder":
      result = founderStepSchema.safeParse(data);
      break;
    case "details":
      result = detailsStepSchema.safeParse(data);
      break;
    case "financial":
      result = financialStepSchema.safeParse(data);
      break;
    case "documents":
      return validateDocumentsStep(data);
    default:
      return {};
  }

  if (result.success) return {};

  const errors: StepErrors = {};
  for (const issue of result.error.issues) {
    const key = issue.path.join(".");
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
}
