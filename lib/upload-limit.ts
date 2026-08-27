export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/gif",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
  "application/zip",
];

export function validateFileSize(file: { size: number }): string | null {
  if (file.size > MAX_FILE_SIZE) {
    return `File size exceeds the maximum allowed size of 10 MB.`;
  }
  return null;
}

export function validateFileType(file: { type: string }): string | null {
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return `File type "${file.type}" is not supported. Allowed: PDF, images, Word, Excel, CSV, ZIP.`;
  }
  return null;
}

export function validateFile(file: { size: number; type: string }): string | null {
  return validateFileSize(file) || validateFileType(file) || null;
}
