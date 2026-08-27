import { z } from "zod";
import { FILE_CATEGORIES } from "@/types/file.types";

export const fileCategorySchema = z.enum(FILE_CATEGORIES);

export const genericFileSchema = z.object({
  file: z.instanceof(File).refine((f) => f.size > 0, "File is required"),
  category: fileCategorySchema,
  entityType: z.string().optional(),
  entityId: z.string().optional(),
  directory: z.string().optional(),
  isPublic: z.boolean().optional(),
  metadata: z.record(z.unknown()).optional(),
});
