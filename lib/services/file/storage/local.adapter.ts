import fs from "fs/promises";
import path from "path";
import {
  type StorageAdapter,
  type UploadToStorageInput,
  type UploadToStorageResult,
} from "@/lib/services/file/storage/adapter.interface";
import { normalizeDirectory } from "@/lib/services/file/utils/file-utils";

// Resolve relative paths against cwd so ./storage/uploads works in dev & prod
const rawRoot =
  process.env.FILE_STORAGE_PATH ?? path.join(process.cwd(), "storage", "uploads");

const baseRoot = path.isAbsolute(rawRoot)
  ? rawRoot
  : path.resolve(process.cwd(), rawRoot);

export class LocalStorageAdapter implements StorageAdapter {
  async upload(input: UploadToStorageInput): Promise<UploadToStorageResult> {
    const directory = normalizeDirectory(input.directory);
    const destinationDir = path.join(baseRoot, directory);

    // Ensure directory exists (recursive: true is idempotent)
    await fs.mkdir(destinationDir, { recursive: true });

    const storagePath = path.join(destinationDir, input.storedName);
    const bytes = await input.file.arrayBuffer();
    await fs.writeFile(storagePath, Buffer.from(bytes));

    return {
      storagePath,
      bucket: null,
      size: input.file.size,
    };
  }

  async delete(storagePath: string): Promise<void> {
    await fs.rm(storagePath, { force: true });
  }

  async read(storagePath: string): Promise<Buffer> {
    return fs.readFile(storagePath);
  }

  getPublicUrl(storagePath: string): string {
    return storagePath;
  }
}
