import * as fs from "fs";
import * as path from "path";

let passed = 0;
let failed = 0;

function assert(condition: boolean, name: string) {
  if (condition) { passed++; console.log(`  ✅ ${name}`); }
  else { failed++; console.error(`  ❌ FAIL: ${name}`); }
}

function assertIncludes(content: string, substr: string, name: string) {
  assert(content.includes(substr), `${name} (contains "${substr}")`);
}

function assertImports(filePath: string, symbols: string[], name: string) {
  const content = fs.readFileSync(filePath, "utf-8");
  for (const s of symbols) {
    assertIncludes(content, s, `${name} imports ${s}`);
  }
}

function assertExports(filePath: string, symbols: string[], name: string) {
  const content = fs.readFileSync(filePath, "utf-8");
  for (const s of symbols) {
    assert(content.includes(`export async function ${s}`) || content.includes(`export const ${s}`) || content.includes(`export function ${s}`), `${name} exports ${s}`);
  }
}

function assertExists(filePath: string, name: string) {
  assert(fs.existsSync(filePath), `${name} exists`);
}

console.log("\n========== NSLP COMPLETE MODULE TESTS ==========\n");

// ── Schemas ──
console.log("\n--- Schema Validation ---");
const incContent = fs.readFileSync(path.join(process.cwd(), "prisma/schema/incubation.prisma"), "utf-8");
["MentorSession", "Asset", "AssetBooking", "MentorMatchRequest"].forEach(m => assertIncludes(incContent, `model ${m}`, `incubation schema has ${m}`));
assertIncludes(fs.readFileSync(path.join(process.cwd(), "prisma/schema/certificate.prisma"), "utf-8"), "expiresAt", "Certificate has expiresAt");

const userContent = fs.readFileSync(path.join(process.cwd(), "prisma/schema/user.prisma"), "utf-8");
["PasswordHistory", "EmailChangeRequest", "UserSession"].forEach(m => assertIncludes(userContent, `model ${m}`, `user schema has ${m}`));
assertIncludes(userContent, "lockedUntil", "User has lockedUntil");
assertIncludes(userContent, "loginAttempts", "User has loginAttempts");
assertIncludes(userContent, "exportLogs", "User has exportLogs relation");

const auditContent = fs.readFileSync(path.join(process.cwd(), "prisma/schema/audit.prisma"), "utf-8");
assertIncludes(auditContent, "ExportLog", "audit schema has ExportLog");
assertIncludes(auditContent, "retentionUntil", "AuditLog has retentionUntil");

const notifContent = fs.readFileSync(path.join(process.cwd(), "prisma/schema/notification.prisma"), "utf-8");
assertIncludes(notifContent, "NotificationTemplate", "notification schema has NotificationTemplate");

const appContent = fs.readFileSync(path.join(process.cwd(), "prisma/schema/application.prisma"), "utf-8");
assertIncludes(appContent, "model Appeal", "application schema has Appeal");

// ── Auth Hardening ──
console.log("\n--- Auth Hardening ---");
const shPath = path.join(process.cwd(), "lib/auth/security-hardening.ts");
assertExists(shPath, "security-hardening.ts");
assertExports(shPath, ["recordFailedLoginAttempt", "resetLoginAttempts", "isAccountLocked", "addPasswordToHistory", "isPasswordReused", "createEmailChangeRequest", "approveEmailChangeRequest", "rejectEmailChangeRequest", "getUserSessions", "terminateSession", "terminateOtherSessions"], "security-hardening");

const sessionsRoute = path.join(process.cwd(), "app/api/auth/sessions/route.ts");
assertExists(sessionsRoute, "sessions route exists");

const securitySettings = path.join(process.cwd(), "app/settings/security/page.tsx");
assertExists(securitySettings, "security settings page exists");

// ── Asset Register ──
console.log("\n--- Asset Register ---");
const assetActions = path.join(process.cwd(), "app/hub-portal/assets/actions.ts");
assertExists(assetActions, "assets actions");
assertExports(assetActions, ["getHubAssets", "createAsset", "updateAsset", "deleteAsset", "bookAsset", "approveBooking", "cancelBooking", "getAvailableAssets"], "assets actions");

const assetPage = path.join(process.cwd(), "app/hub-portal/assets/page.tsx");
assertExists(assetPage, "assets page");

// ── Mentor Matching ──
console.log("\n--- Mentor Matching ---");
const matchActions = path.join(process.cwd(), "app/mentor-portal/matching/actions.ts");
assertExists(matchActions, "matching actions");
assertExports(matchActions, ["requestMentorMatch", "respondToMatchRequest", "getPendingRequests", "getMyRequests", "getMentorDirectory", "searchMentors", "getStartupDirectory", "getAcademyDirectory", "getAcceleratorDirectory"], "matching actions");

const matchPage = path.join(process.cwd(), "app/mentor-portal/matching/page.tsx");
assertExists(matchPage, "matching page");

// ── Appeal Module ──
console.log("\n--- Appeal Module ---");
const appealActions = path.join(process.cwd(), "app/dashboard/appeals/actions.ts");
assertExists(appealActions, "appeal actions");
assertExports(appealActions, ["submitAppeal", "getMyAppeals", "respondToAppeal", "getPendingAppeals"], "appeal actions");

// ── Certificate Renewal ──
console.log("\n--- Certificate Renewal ---");
const renewPath = path.join(process.cwd(), "app/certificate/renew/[id]/page.tsx");
assertExists(renewPath, "renewal page");

// ── QR Verification ──
console.log("\n--- QR Verification ---");
const verifyPath = path.join(process.cwd(), "app/verify/[...slug]/page.tsx");
assertExists(verifyPath, "verify page");

// ── Notification Templates ──
console.log("\n--- Notification Templates ---");
const tmplActions = path.join(process.cwd(), "app/admins-new/settings/notifications/actions.ts");
assertExists(tmplActions, "template actions");
assertExports(tmplActions, ["getTemplates", "createTemplate", "updateTemplate", "deleteTemplate", "previewTemplate"], "template actions");

const tmplPage = path.join(process.cwd(), "app/admins-new/settings/notifications/page.tsx");
assertExists(tmplPage, "template page");

// ── Email Retry ──
console.log("\n--- Email Retry & Retention ---");
const retryPath = path.join(process.cwd(), "lib/email-retry.ts");
assertExists(retryPath, "email-retry");
assertExports(retryPath, ["sendWithRetry", "scheduleRetry"], "email-retry");

const retentionPath = path.join(process.cwd(), "lib/retention.ts");
assertExists(retentionPath, "retention");
assertExports(retentionPath, ["enforceRetentionPolicy", "runDailyMaintenance"], "retention");

// ── Previous Module Tests (unchanged) ──
console.log("\n--- Regional Admin Actions ---");
const raPath = path.join(process.cwd(), "app/regional-admin/actions.ts");
assertExports(raPath, ["getRegionalDashboardStats", "createHub", "deleteHub", "updateHubBranding", "createHubManager", "createMentor", "getRegionStartups", "assignStartupToHub"], "regional-admin/actions.ts");

console.log("\n--- Hub Portal Actions ---");
const hpPath = path.join(process.cwd(), "app/hub-portal/actions.ts");
assertExports(hpPath, ["getHubDashboardData", "createIncubationProgram", "assignMentor", "updateProgress", "getStartups", "enrollStartup"], "hub-portal/actions.ts");

console.log("\n--- Mentor Portal Actions ---");
const mpPath = path.join(process.cwd(), "app/mentor-portal/actions.ts");
assertExports(mpPath, ["getMentorDashboardData", "logMentorSession", "getMentorSessions"], "mentor-portal/actions.ts");

console.log("\n--- Expiry Module ---");
const expPath = path.join(process.cwd(), "lib/expiry.ts");
assertExports(expPath, ["checkExpiredCertificates", "checkUpcomingExpirations"], "lib/expiry.ts");

console.log("\n--- Reports Module ---");
const repPath = path.join(process.cwd(), "app/admins-new/reports/actions.ts");
assertExports(repPath, ["getAdminReportsData", "generateReportPdf"], "reports/actions.ts");

console.log("\n--- Export Module ---");
assertExists(path.join(process.cwd(), "lib/export.ts"), "lib/export.ts");

console.log("\n--- Hub Portal Pages ---");
assertExists(path.join(process.cwd(), "app/regional-admin/hubs/page.tsx"), "regional-admin/hubs page");
assertExists(path.join(process.cwd(), "app/regional-admin/startups/page.tsx"), "regional-admin/startups page");

console.log("\n--- Upload Limits ---");
assertExists(path.join(process.cwd(), "lib/upload-limit.ts"), "upload-limit.ts");
assertIncludes(fs.readFileSync(path.join(process.cwd(), "lib/upload-limit.ts"), "utf-8"), "MAX_FILE_SIZE", "upload-limit has MAX_FILE_SIZE");

console.log("\n--- Backup Script ---");
assertExists(path.join(process.cwd(), "scripts/backup.ps1"), "backup script exists");

// ══════════════════════════════════════
console.log(`\n══════════════════════════════════════`);
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log(`══════════════════════════════════════\n`);
process.exit(failed > 0 ? 1 : 0);
