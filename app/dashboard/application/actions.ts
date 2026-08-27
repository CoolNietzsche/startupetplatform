import {
  ApplicationFormData,
  ApplicationRow,
  FounderFormData,
  FounderRow,
  defaultFounder,
} from "./types";

export type MappedFormData = Omit<
  ApplicationFormData,
  | "businessRegistrationFile"
  | "articlesOfIncorporationFile"
  | "businessRegistration"
  | "pitchDeck"
  | "financialStatements"
>;

// ---------------------------------------------------------------------------
// Mapping helpers (form ↔ DB shape conversions, no DB access)
// ---------------------------------------------------------------------------

export function mapDbToForm(row: ApplicationRow): MappedFormData {
  const founders: FounderFormData[] =
    row.founders && row.founders.length > 0
      ? row.founders.map((f: FounderRow) => {
          const nameParts = (f.fullName || "").split(" ");
          const firstName = nameParts[0] || "";
          const lastName = nameParts.slice(1).join(" ") || "";
          return {
            firstName,
            lastName,
            nationalIdNumber: f.fcn || "",
            numberOfShares: f.noOfShares?.toString() || "",
            email: f.email || "",
            phone: f.phone || "",
            role: f.role || "",
          };
        })
      : [{ ...defaultFounder }];

  const result = {
    startupName: row.startupName || "",
    businessRegNumber: row.businessLicense || "",
    tinNumber: row.tin || "",
    numberOfEmployees: row.numberOfEmployees?.toString() || "",
    foundingDate: row.foundingDate
      ? new Date(row.foundingDate).toISOString().split("T")[0]
      : "",
    industry: row.industry || "",
    stage: row.directiveStage || row.typeOfCompany || "",
    website: row.website || "",
    businessEmail: row.email || "",
    altEmail: row.alternateEmail || "",
    phoneNumber: row.phoneNumber || "",
    capital: row.vision || "",
    totalShares: row.totalShares?.toString() || "",
    sharePrice: row.sharePrice?.toString() || "",
    founders,
    businessDescription: row.productDescription || "",
    problemStatement: row.problemStatement || "",
    solution: row.solution || "",
    innovationDescription: row.innovationDescription || "",
    targetMarket: row.targetMarket || "",
    competitiveAdvantage: row.competitiveAdvantage || "",
    scalabilityPlan: row.scalabilityPlan || "",
    traction: row.traction || "",
    riskAssessment: row.riskAssessment || "",
    revenue: row.revenue || "",
    funding: row.totalFundingRaised || "",
    fundingSources: row.fundingSources || "",
    investmentNeeded: row.investmentNeeded || "",
    useOfFunds: row.useOfFunds || "",
    businessLicenseFileId: row.businessLicenseFileId || null,
    articlesOfIncorpFileId: row.articlesOfIncorpFileId || null,
    pitchDeckFileId: row.pitchDeckFileId || null,
    financialsFileId: row.financialsFileId || null,
  };

  return result;
}
