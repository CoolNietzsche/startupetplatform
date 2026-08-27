export type UploadToStorageInput = {
  file: File;
  directory?: string;
  storedName: string;
};

export type UploadToStorageResult = {
  storagePath: string;
  bucket: string | null;
  size: number;
};

export interface StorageAdapter {
  upload(input: UploadToStorageInput): Promise<UploadToStorageResult>;
  delete(storagePath: string): Promise<void>;
  read(storagePath: string): Promise<Buffer>;
  getPublicUrl(storagePath: string): string;
}
