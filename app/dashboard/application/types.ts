export interface FounderFormData {
  firstName: string;
  lastName: string;
  nationalIdNumber: string;
  numberOfShares: string;
  email: string;
  phone: string;
  role: string;
}

export interface ApplicationFormData {
  // Business Information
  startupName: string;
  businessRegNumber: string;
  tinNumber: string;
  numberOfEmployees: string;
  foundingDate: string;
  industry: string;
  stage: string;
  website: string;
  businessEmail: string;
  altEmail: string;
  phoneNumber: string;
  capital: string;

  // Share Information
  totalShares: string;
  sharePrice: string;

  // Founders
  founders: FounderFormData[];

  // Business Details
  businessDescription: string;
  problemStatement: string;
  solution: string;
  innovationDescription: string;
  targetMarket: string;
  competitiveAdvantage: string;
  scalabilityPlan: string;
  traction: string;
  riskAssessment: string;

  // Financial Information
  revenue: string;
  funding: string;
  fundingSources: string;
  investmentNeeded: string;
  useOfFunds: string;

  // Documents (not persisted to DB — file uploads handled separately)
  businessRegistrationFile: File | null;
  articlesOfIncorporationFile: File | null;
  businessRegistration: File | null;
  pitchDeck: File | null;
  financialStatements: File | null;
  businessLicenseFileId: string | null;
  articlesOfIncorpFileId: string | null;
  pitchDeckFileId: string | null;
  financialsFileId: string | null;
}

export const defaultFounder: FounderFormData = {
  firstName: "",
  lastName: "",
  nationalIdNumber: "",
  numberOfShares: "",
  email: "",
  phone: "",
  role: "",
};

export const defaultFormData: ApplicationFormData = {
  startupName: "",
  businessRegNumber: "",
  tinNumber: "",
  numberOfEmployees: "",
  foundingDate: "",
  industry: "",
  stage: "",
  website: "",
  businessEmail: "",
  altEmail: "",
  phoneNumber: "",
  capital: "",
  totalShares: "",
  sharePrice: "",
  founders: [{ ...defaultFounder }],
  businessDescription: "",
  problemStatement: "",
  solution: "",
  innovationDescription: "",
  targetMarket: "",
  competitiveAdvantage: "",
  scalabilityPlan: "",
  traction: "",
  riskAssessment: "",
  revenue: "",
  funding: "",
  fundingSources: "",
  investmentNeeded: "",
  useOfFunds: "",
  businessRegistrationFile: null,
  articlesOfIncorporationFile: null,
  businessRegistration: null,
  pitchDeck: null,
  financialStatements: null,
  businessLicenseFileId: null,
  articlesOfIncorpFileId: null,
  pitchDeckFileId: null,
  financialsFileId: null,
};

export interface ApplicationRow {
  id: string;
  status: string;
  startupName: string | null;
  industry: string | null;
  createdAt: string;
  updatedAt: string;
  numberOfEmployees: number | null;
  foundingDate: string | null;
  phoneNumber: string | null;
  email: string | null;
  alternateEmail: string | null;
  website: string | null;
  businessLicense: string | null;
  typeOfCompany: string | null;
  vision: string | null;
  totalShares: number | null;
  sharePrice: number | null;
  productDescription: string | null;
  tin: string | null;
  problemStatement: string | null;
  solution: string | null;
  innovationDescription: string | null;
  targetMarket: string | null;
  competitiveAdvantage: string | null;
  scalabilityPlan: string | null;
  traction: string | null;
  riskAssessment: string | null;
  revenue: string | null;
  totalFundingRaised: string | null;
  investmentNeeded: string | null;
  useOfFunds: string | null;
  fundingSources: string | null;
  businessLicenseFileId: string | null;
  articlesOfIncorpFileId: string | null;
  pitchDeckFileId: string | null;
  financialsFileId: string | null;
  founders: FounderRow[];
}

export interface FounderRow {
  id: string;
  fullName: string;
  fcn: string | null;
  noOfShares: number | null;
  email: string | null;
  phone: string | null;
  role: string | null;
}
