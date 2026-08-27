export const FILE_CATEGORIES = [
  "BUSINESS_LICENSE",
  "ARTICLES_OF_INCORPORATION",
  "PITCH_DECK",
  "FINANCIAL_STATEMENT",
  "PROFILE_IMAGE",
  "CERTIFICATE",
  "INVESTOR_DOCUMENT",
  "TAX_REGISTRATION",
  "PUBLIC_ASSET",
  "OTHER",
] as const;

export type FileCategoryValue = (typeof FILE_CATEGORIES)[number];

export const STORAGE_PROVIDERS = ["LOCAL", "S3", "VERCEL_BLOB"] as const;

export type StorageProviderValue = (typeof STORAGE_PROVIDERS)[number];

export type FileUploadInput = {
  file: File;
  uploadedBy: string;
  category: FileCategoryValue;
  entityType?: string;
  entityId?: string;
  directory?: string;
  metadata?: Record<string, unknown>;
  isPublic?: boolean;
};

export type FileUpdateInput = {
  category?: FileCategoryValue;
  metadata?: Record<string, unknown>;
  isPublic?: boolean;
};
