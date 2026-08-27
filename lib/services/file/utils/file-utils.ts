import path from "path";

export function sanitizeFileName(input: string): string {
  const trimmed = input.trim();
  const normalized = trimmed
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return normalized || "file";
}

export function getFileExtension(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase();
  return ext.startsWith(".") ? ext : "";
}

export function buildStoredName(originalName: string, uniqueId: string): string {
  const ext = getFileExtension(originalName);
  return `${uniqueId}${ext}`;
}

export function normalizeDirectory(input?: string): string {
  if (!input) return "misc";
  return input.replace(/(^\/|\/$)/g, "").replace(/[^a-zA-Z0-9/_-]+/g, "-");
}
