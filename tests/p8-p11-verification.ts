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

console.log("\n========== P8-P11 DIRECTIVE VERIFICATION ==========\n");

// ── P8: Reports ──
console.log("\n--- P8: Reports (Art. 19.5/20.5/29.1) ---");
const rPath = path.join(process.cwd(), "lib/directive/reports.ts");
assert(fs.existsSync(rPath), "reports.ts exists");
const rContent = fs.readFileSync(rPath, "utf-8");
assertIncludes(rContent, "STARTUP_PROGRESS", "Startup progress report");
assertIncludes(rContent, "INCUBATION_PROGRESS", "Incubation progress report");
assertIncludes(rContent, "ECOSYSTEM_ANNUAL", "Ecosystem annual report");
assertIncludes(rContent, "Art. 19.5", "Startup progress directive ref");
assertIncludes(rContent, "Art. 20.5", "Incubation progress directive ref");
assertIncludes(rContent, "Art. 29.1", "Ecosystem annual directive ref");
assertIncludes(rContent, "QUARTERLY", "Quarterly frequency");
assertIncludes(rContent, "ANNUAL", "Annual frequency");
assertIncludes(rContent, "export function computeReportDueDate", "computeReportDueDate");
assertIncludes(rContent, "export function isReportOverdue", "isReportOverdue");
assertIncludes(rContent, "export function getReportStatus", "getReportStatus");

// ── P9: Certificates ──
console.log("\n--- P9: Certificates (Art. 10) ---");
const cPath = path.join(process.cwd(), "lib/directive/certificates.ts");
assert(fs.existsSync(cPath), "certificates.ts exists");
const cContent = fs.readFileSync(cPath, "utf-8");
assertIncludes(cContent, "CERTIFICATE_VALIDITY_YEARS", "Validity period defined");
assertIncludes(cContent, "RENEWAL_WINDOW_DAYS", "Renewal window defined");
assertIncludes(cContent, "GRACE_PERIOD_DAYS", "Grace period defined");
assertIncludes(cContent, "Art. 10", "Directive ref Art 10");
assertIncludes(cContent, "export function computeCertificateExpiry", "computeCertificateExpiry");
assertIncludes(cContent, "export function getCertificateValidity", "getCertificateValidity");
assertIncludes(cContent, "export function canRenew", "canRenew");
assertIncludes(cContent, "export function isCertificateActive", "isCertificateActive");

// ── P10: Calls ──
console.log("\n--- P10: Calls (Art. 6) ---");
const clPath = path.join(process.cwd(), "lib/directive/calls.ts");
assert(fs.existsSync(clPath), "calls.ts exists");
const clContent = fs.readFileSync(clPath, "utf-8");
assertIncludes(clContent, "CallStatus", "CallStatus type");
assertIncludes(clContent, "CallTarget", "CallTarget type");
assertIncludes(clContent, "MIN_APPLICATION_WINDOW_DAYS", "Minimum window defined");
assertIncludes(clContent, "Art. 6", "Directive ref Art 6");
assertIncludes(clContent, "export function isCallOpen", "isCallOpen");
assertIncludes(clContent, "export function getCallStatus", "getCallStatus");
assertIncludes(clContent, "export function getDaysRemaining", "getDaysRemaining");
assertIncludes(clContent, "export function validateApplicationWindow", "validateApplicationWindow");

// ── P11: Registry ──
console.log("\n--- P11: Registry (Art. 8/10) ---");
const regPath = path.join(process.cwd(), "lib/directive/registry.ts");
assert(fs.existsSync(regPath), "registry.ts exists");
const regContent = fs.readFileSync(regPath, "utf-8");
assertIncludes(regContent, "RegistryEntry", "RegistryEntry type");
assertIncludes(regContent, "RegistryStats", "RegistryStats type");
assertIncludes(regContent, "export function computeRegistryStats", "computeRegistryStats");
assertIncludes(regContent, "export function searchRegistry", "searchRegistry");
assertIncludes(regContent, "Art. 8, 10", "Directive ref");

// ── Integration: Ecosystem Actions ──
console.log("\n--- Integration: Ecosystem Action Exports ---");
const eaPath = path.join(process.cwd(), "app/admins-new/ecosystem/ecosystem-actions.ts");
if (fs.existsSync(eaPath)) {
  const eaContent = fs.readFileSync(eaPath, "utf-8");
  assertIncludes(eaContent, "suspendEcoApplicationAction", "Ecosystem: suspend action (Art. 24/25/30/31)");
  assertIncludes(eaContent, "revokeEcoApplicationAction", "Ecosystem: revoke action (Art. 24/25/30/31)");
  assertIncludes(eaContent, "rescindEcoSuspensionAction", "Ecosystem: rescind suspension action");
  assertIncludes(eaContent, "import", "ecosystem-actions.ts has imports");
} else {
  assert(false, "ecosystem-actions.ts exists");
}

// ── Integration: Quorum checks ──
console.log("\n--- Integration: Quorum in Assignment ---");
const aaPath = path.join(process.cwd(), "app/admins-new/applications/application-actions.ts");
if (fs.existsSync(aaPath)) {
  const aaContent2 = fs.readFileSync(aaPath, "utf-8");
  assertIncludes(aaContent2, "hasQuorum", "Application actions: quorum check (Art. 13.1)");
  assertIncludes(aaContent2, "getRequiredPresent", "Application actions: required present count");
} else {
  assert(false, "application-actions.ts exists");
}

// ── Integration: COI in Dashboard ──
console.log("\n--- Integration: COI in Review Flow ---");
const daPath = path.join(process.cwd(), "app/committee-portal/dashboard/actions.ts");
if (fs.existsSync(daPath)) {
  const daContent = fs.readFileSync(daPath, "utf-8");
  assertIncludes(daContent, "checkPotentialConflict", "Dashboard: COI check on review start (Art. 14.1)");
} else {
  assert(false, "dashboard/actions.ts exists");
}

// ── Integration: Second Renewal Threshold ──
console.log("\n--- Integration: Stage-based Threshold in Dashboard ---");
if (fs.existsSync(daPath)) {
  const daContent = fs.readFileSync(daPath, "utf-8");
  assertIncludes(daContent, "getThresholdForStage", "Dashboard: stage-based threshold for second renewal");
  assertIncludes(daContent, "isSecondRenewal", "Dashboard: second renewal detection (75%)");
} else {
  assert(false, "dashboard/actions.ts exists");
}

console.log(`\n══════════════════════════════════════`);
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log(`══════════════════════════════════════\n`);
process.exit(failed > 0 ? 1 : 0);
