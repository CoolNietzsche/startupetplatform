import { ALLOWED_MIME_BY_CATEGORY, MAX_FILE_SIZE_BYTES_BY_CATEGORY } from "@/lib/services/file/utils/mime-types";
import type { FileCategoryValue } from "@/types/file.types";
import { FileValidationError } from "@/lib/services/file/errors";

export function validateFileByCategory(file: File, category: FileCategoryValue): void {
  if (file.size <= 0) {
    throw new FileValidationError("File is required");
  }

  const maxSize = MAX_FILE_SIZE_BYTES_BY_CATEGORY[category];
  if (file.size > maxSize) {
    throw new FileValidationError(`File exceeds max size of ${Math.ceil(maxSize / (1024 * 1024))}MB`);
  }

  const allowedMimes = ALLOWED_MIME_BY_CATEGORY[category];
  if (allowedMimes.length > 0 && !allowedMimes.includes(file.type)) {
    throw new FileValidationError(`File type "${file.type}" is not allowed for category ${category}. Allowed types: ${allowedMimes.join(", ")}`);
  }
}
