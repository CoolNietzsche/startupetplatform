import type { FileCategoryValue } from "@/types/file.types";

const commonDocumentMimeTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "image/jpeg",
  "image/png",
  "image/webp",
  "text/csv",
  "text/plain",
  "application/rtf",
  "application/vnd.oasis.opendocument.text",
  "application/vnd.oasis.opendocument.spreadsheet",
  "application/zip",
  "application/x-zip-compressed",
];

const imageMimeTypes = ["image/jpeg", "image/png", "image/webp"];

export const ALLOWED_MIME_BY_CATEGORY: Record<FileCategoryValue, string[]> = {
  BUSINESS_LICENSE: commonDocumentMimeTypes,
  ARTICLES_OF_INCORPORATION: commonDocumentMimeTypes,
  PITCH_DECK: commonDocumentMimeTypes,
  FINANCIAL_STATEMENT: commonDocumentMimeTypes,
  PROFILE_IMAGE: imageMimeTypes,
  CERTIFICATE: ["application/pdf", ...imageMimeTypes],
  INVESTOR_DOCUMENT: commonDocumentMimeTypes,
  TAX_REGISTRATION: commonDocumentMimeTypes,
  PUBLIC_ASSET: imageMimeTypes,
  OTHER: [],
};

export const MAX_FILE_SIZE_BYTES_BY_CATEGORY: Record<
  FileCategoryValue,
  number
> = {
  BUSINESS_LICENSE: 20 * 1024 * 1024,
  ARTICLES_OF_INCORPORATION: 20 * 1024 * 1024,
  PITCH_DECK: 30 * 1024 * 1024,
  FINANCIAL_STATEMENT: 20 * 1024 * 1024,
  PROFILE_IMAGE: 5 * 1024 * 1024,
  CERTIFICATE: 10 * 1024 * 1024,
  INVESTOR_DOCUMENT: 20 * 1024 * 1024,
  TAX_REGISTRATION: 20 * 1024 * 1024,
  PUBLIC_ASSET: 50 * 1024 * 1024,
  OTHER: 20 * 1024 * 1024,
};
