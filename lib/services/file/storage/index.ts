import type { StorageAdapter } from "@/lib/services/file/storage/adapter.interface";
import { LocalStorageAdapter } from "@/lib/services/file/storage/local.adapter";

// Singleton instance — reset on hot-reload in development via globalThis
declare global {
  // eslint-disable-next-line no-var
  var __storageAdapter: StorageAdapter | undefined;
}

export function getStorageAdapter(): StorageAdapter {
  if (global.__storageAdapter) return global.__storageAdapter;

  const provider = (process.env.FILE_STORAGE_PROVIDER || "LOCAL").toUpperCase();

  let adapter: StorageAdapter;

  switch (provider) {
    case "S3":
    case "VERCEL_BLOB":
      throw new Error(
        `Storage provider ${provider} is not yet implemented. Use LOCAL for now.`,
      );
    default:
      adapter = new LocalStorageAdapter();
  }

  if (process.env.NODE_ENV !== "production") {
    global.__storageAdapter = adapter;
  }

  return adapter;
}
