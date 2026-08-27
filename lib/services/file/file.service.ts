import db from "@/lib/db";
import { getStorageAdapter } from "@/lib/services/file/storage";
import {
  buildStoredName,
  normalizeDirectory,
  sanitizeFileName,
} from "@/lib/services/file/utils/file-utils";
import { validateFileByCategory } from "@/lib/services/file/validators/file-validator";
import type {
  FileCategoryValue,
  FileUpdateInput,
  FileUploadInput,
  StorageProviderValue,
} from "@/types/file.types";

type FileRecord = {
  id: string;
  originalName: string;
  storedName: string;
  mimeType: string;
  size: number;
  storagePath: string;
  storageBucket: string | null;
  category: FileCategoryValue;
  provider: StorageProviderValue;
  entityType: string | null;
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  isPublic: boolean;
  isDeleted: boolean;
  deletedAt: Date | null;
  uploadedBy: string;
  createdAt: Date;
  updatedAt: Date;
};

function mapProviderForDb(provider?: string): StorageProviderValue {
  const normalized = (provider || "LOCAL").toUpperCase();
  if (normalized === "S3" || normalized === "VERCEL_BLOB") {
    return normalized;
  }
  return "LOCAL";
}

function toRecord(input: any): FileRecord {
  return {
    ...input,
    storageBucket: input.storageBucket ?? null,
    entityType: input.entityType ?? null,
    entityId: input.entityId ?? null,
    metadata: (input.metadata as Record<string, unknown> | null) ?? null,
  };
}

/** Typed shorthand that avoids repeating `(db as any)` everywhere */
const prismaFile = () => (db as any).file;
const prismaFileAccessLog = () => (db as any).fileAccessLog;

export class FileService {
  async uploadFile(input: FileUploadInput): Promise<FileRecord> {
    validateFileByCategory(input.file, input.category);

    const originalName = sanitizeFileName(input.file.name);
    const storedName = buildStoredName(originalName, crypto.randomUUID());
    const directory = normalizeDirectory(
      input.directory || input.category.toLowerCase(),
    );
    const storageAdapter = getStorageAdapter();

    const uploadResult = await storageAdapter.upload({
      file: input.file,
      directory,
      storedName,
    });

    const created = await prismaFile().create({
      data: {
        originalName,
        storedName,
        mimeType: input.file.type || "application/octet-stream",
        size: uploadResult.size,
        storagePath: uploadResult.storagePath,
        storageBucket: uploadResult.bucket,
        uploadedBy: input.uploadedBy,
        entityType: input.entityType || null,
        entityId: input.entityId || null,
        category: input.category,
        provider: mapProviderForDb(process.env.FILE_STORAGE_PROVIDER),
        metadata: input.metadata || null,
        isPublic: input.isPublic ?? false,
      },
    });

    return toRecord(created);
  }

  async uploadMultiple(files: FileUploadInput[]): Promise<FileRecord[]> {
    const results: FileRecord[] = [];
    for (const item of files) {
      results.push(await this.uploadFile(item));
    }
    return results;
  }

  async getFileById(id: string): Promise<FileRecord | null> {
    const file = await prismaFile().findFirst({
      where: { id, isDeleted: false },
    });
    return file ? toRecord(file) : null;
  }

  async getFilesByEntity(
    entityType: string,
    entityId: string,
  ): Promise<FileRecord[]> {
    const files = await prismaFile().findMany({
      where: { entityType, entityId, isDeleted: false },
      orderBy: { createdAt: "desc" },
    });
    return files.map(toRecord);
  }

  async updateFileMetadata(
    id: string,
    input: FileUpdateInput,
  ): Promise<FileRecord> {
    const updated = await prismaFile().update({
      where: { id },
      data: {
        ...(input.category ? { category: input.category } : {}),
        ...(input.metadata ? { metadata: input.metadata } : {}),
        ...(typeof input.isPublic === "boolean"
          ? { isPublic: input.isPublic }
          : {}),
      },
    });
    return toRecord(updated);
  }

  async softDeleteFile(id: string): Promise<void> {
    await prismaFile().update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() },
    });
  }

  async hardDeleteFile(id: string): Promise<void> {
    const existing = await prismaFile().findUnique({ where: { id } });
    if (!existing) return;

    const storageAdapter = getStorageAdapter();
    await storageAdapter.delete(existing.storagePath);
    await prismaFile().delete({ where: { id } });
  }

  async deleteFilesByEntity(
    entityType: string,
    entityId: string,
  ): Promise<void> {
    const files = await prismaFile().findMany({
      where: { entityType, entityId, isDeleted: false },
      select: { id: true },
    });

    for (const file of files) {
      await this.softDeleteFile(file.id);
    }
  }

  async getFileBuffer(
    id: string,
  ): Promise<{ file: FileRecord; data: Buffer } | null> {
    const file = await this.getFileById(id);
    if (!file) return null;

    const storageAdapter = getStorageAdapter();
    const data = await storageAdapter.read(file.storagePath);

    // Log access — swallow errors so a log failure doesn't break the download
    try {
      await prismaFileAccessLog().create({
        data: {
          fileId: id,
          userId: file.uploadedBy,
          action: "DOWNLOAD",
        },
      });
    } catch (logErr) {
      console.warn("[FileService] Could not write access log:", logErr);
    }

    return { file, data };
  }
}

export const fileService = new FileService();
