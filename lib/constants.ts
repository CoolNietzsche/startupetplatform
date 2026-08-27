import { PERMISSIONS, type PermissionCode } from "@/lib/auth/permission-codes";

export const APPLICATION_VIEW_PERMISSIONS: PermissionCode[] = [
  PERMISSIONS.OPS_APP_VIEW_ALL,
  PERMISSIONS.OPS_APP_REVIEW,
  PERMISSIONS.OPS_APP_DECISION,
] as const;

export const APPLICATION_MANAGE_PERMISSIONS: PermissionCode[] = [
  PERMISSIONS.OPS_APP_REVIEW,
  PERMISSIONS.OPS_APP_DECISION,
] as const;
