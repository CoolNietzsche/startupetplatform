/**
 * All file-ID fields that live on the application form state.
 * These correspond to IDs of already-uploaded files stored in the DB.
 */
export type ApplicationFileField =
  | "businessLicenseFileId"
  | "articlesOfIncorpFileId"
  | "pitchDeckFileId"
  | "financialsFileId";
