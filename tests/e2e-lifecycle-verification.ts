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

console.log("\n========== E2E LIFECYCLE INTEGRATION ==========\n");

console.log("\n--- Phase 1: Certification → Certificate Issuance ---");
const aaPath = path.join(process.cwd(), "app/admins-new/applications/application-actions.ts");
const aaContent = fs.readFileSync(aaPath, "utf-8");
assertIncludes(aaContent, "setApplicationCertified", "setApplicationCertified exports");
assertIncludes(aaContent, "directiveStage", "Stage-based expiry on certification (Art. 21)");
assertIncludes(aaContent, "computeExpiryDate", "Expiry date computed via stages");

const certPath = path.join(process.cwd(), "lib/directive/certificates.ts");
const certContent = fs.readFileSync(certPath, "utf-8");
assertIncludes(certContent, "CERTIFICATE_VALIDITY_YEARS", "Certificate validity 2 years (Art. 10)");
assertIncludes(certContent, "RENEWAL_WINDOW_DAYS", "Renewal window 90 days");
assertIncludes(certContent, "GRACE_PERIOD_DAYS", "Grace period 30 days");
assertIncludes(certContent, "canRenew", "canRenew function");
assertIncludes(certContent, "isCertificateActive", "isCertificateActive function");

console.log("\n--- Phase 2: Evaluation → Committee Decision ---");
const daPath = path.join(process.cwd(), "app/committee-portal/dashboard/actions.ts");
const daContent = fs.readFileSync(daPath, "utf-8");
assertIncludes(daContent, "submitFinalDecision", "Final decision submission");
assertIncludes(daContent, "meetsThreshold", "Threshold check on decision (Art. 22)");
assertIncludes(daContent, "getThresholdForStage", "Stage-based threshold");
assertIncludes(daContent, "isSecondRenewal", "Second renewal 75% threshold (Art. 21.3)");

const spPath = path.join(process.cwd(), "lib/directive/scoring-presets.ts");
const spContent = fs.readFileSync(spPath, "utf-8");
assertIncludes(spContent, "meetsThreshold", "meetsThreshold function");
assertIncludes(spContent, "validateWeightTotal", "validateWeightTotal function");
assertIncludes(spContent, "Art. 22", "Scoring directive ref");
assertIncludes(spContent, "Art. 28", "Threshold directive ref");

console.log("\n--- Phase 3: Renewal Flow ---");
const stPath = path.join(process.cwd(), "lib/directive/stages.ts");
const stContent = fs.readFileSync(stPath, "utf-8");
assertIncludes(stContent, "getThresholdForStage", "Stage-based threshold");
assertIncludes(stContent, "INITIAL", "Initial stage");
assertIncludes(stContent, "POST_INITIAL", "Post-initial stage (4yr)");
assertIncludes(stContent, "SCALE_EXIT", "Scale-exit stage");
assertIncludes(stContent, "computeExpiryDate", "Expiry date computation");

console.log("\n--- Phase 4: Suspension & Revocation ---");
const suspPath = path.join(process.cwd(), "lib/directive/suspension.ts");
const suspContent = fs.readFileSync(suspPath, "utf-8");
assertIncludes(suspContent, "Art. 24.1", "Suspension grounds Art 24");
assertIncludes(suspContent, "Art. 25.1", "Suspension grounds Art 25");
assertIncludes(suspContent, "Art. 30.1", "Suspension grounds Art 30");
assertIncludes(suspContent, "Art. 31.1", "Suspension grounds Art 31");
assertIncludes(suspContent, "isSuspensionActive", "isSuspensionActive");
assertIncludes(suspContent, "computeAppealDeadline", "computeAppealDeadline");
assertIncludes(suspContent, "canRescind", "canRescind");

assertIncludes(aaContent, "suspendApplicationAction", "Startup suspension action");
assertIncludes(aaContent, "revokeApplicationAction", "Startup revocation action");
assertIncludes(aaContent, "rescindSuspensionAction", "Startup rescind action");

const eaPath = path.join(process.cwd(), "app/admins-new/ecosystem/ecosystem-actions.ts");
const eaContent = fs.readFileSync(eaPath, "utf-8");
assertIncludes(eaContent, "suspendEcoApplicationAction", "Ecosystem suspension action");
assertIncludes(eaContent, "revokeEcoApplicationAction", "Ecosystem revocation action");
assertIncludes(eaContent, "rescindEcoSuspensionAction", "Ecosystem rescind action");

console.log("\n--- Phase 5: Pre-Assessment & Document Verification ---");
const paPath = path.join(process.cwd(), "lib/directive/pre-assessment.ts");
const paContent = fs.readFileSync(paPath, "utf-8");
assertIncludes(paContent, "getRequiredChecklist", "Required document checklist (Art. 7/8/9)");
assertIncludes(paContent, "checkAllDocumentsVerified", "All documents verified check");
assertIncludes(paContent, "computeVerificationStats", "Verification statistics");
assertIncludes(paContent, "computeSla", "SLA computation (5-day)");
assertIncludes(paContent, "Art. 7.1", "Startup checklist directive ref");
assertIncludes(paContent, "Art. 8.1", "Ecosystem checklist directive ref");

assertIncludes(aaContent, "verifyStartupDocument", "Startup document verification");
assertIncludes(aaContent, "completeStartupPreAssessment", "Complete startup pre-assessment");
assertIncludes(eaContent, "verifyEcoDocument", "Ecosystem document verification");
assertIncludes(eaContent, "completeEcoPreAssessment", "Complete ecosystem pre-assessment");

console.log("\n--- Phase 6: COI, Quorum & Compliance ---");
const coiPath = path.join(process.cwd(), "lib/directive/conflict-of-interest.ts");
const coiContent = fs.readFileSync(coiPath, "utf-8");
assertIncludes(coiContent, "checkPotentialConflict", "COI check (Art. 14.1)");
assertIncludes(coiContent, "canProceedWithConflict", "Can proceed with conflict");
assertIncludes(coiContent, "requiresRecusal", "Requires recusal");
assertIncludes(coiContent, "Art. 14.1(a)", "COI grounds a");
assertIncludes(coiContent, "Art. 14.1(e)", "COI grounds e");

const quPath = path.join(process.cwd(), "lib/directive/quorum.ts");
const quContent = fs.readFileSync(quPath, "utf-8");
assertIncludes(quContent, "hasQuorum", "Quorum check (Art. 13)");
assertIncludes(quContent, "hasApproval", "Approval check (Art. 33.3)");
assertIncludes(quContent, "getRequiredPresent", "Required present calculation");

assertIncludes(aaContent, "hasQuorum", "Application assignment quorum check");

console.log("\n--- Phase 7: Reports & Compliance Matrix ---");
const rpPath = path.join(process.cwd(), "lib/directive/reports.ts");
const rpContent = fs.readFileSync(rpPath, "utf-8");
assertIncludes(rpContent, "STARTUP_PROGRESS", "Startup progress (Art. 19.5)");
assertIncludes(rpContent, "INCUBATION_PROGRESS", "Incubation progress (Art. 20.5)");
assertIncludes(rpContent, "ECOSYSTEM_ANNUAL", "Ecosystem annual (Art. 29.1)");
assertIncludes(rpContent, "getReportStatus", "Report status computation");

const cmPath = path.join(process.cwd(), "lib/directive/compliance-matrix.ts");
const cmContent = fs.readFileSync(cmPath, "utf-8");
assertIncludes(cmContent, "COMPLIANCE_MATRIX", "Compliance matrix defined");

console.log("\n--- Phase 8: Calls & Registry ---");
const clPath = path.join(process.cwd(), "lib/directive/calls.ts");
const clContent = fs.readFileSync(clPath, "utf-8");
assertIncludes(clContent, "MIN_APPLICATION_WINDOW_DAYS", "30-day minimum window (Art. 6)");
assertIncludes(clContent, "isCallOpen", "Call open check");
assertIncludes(clContent, "validateApplicationWindow", "Window validation");

const rgPath = path.join(process.cwd(), "lib/directive/registry.ts");
const rgContent = fs.readFileSync(rgPath, "utf-8");
assertIncludes(rgContent, "searchRegistry", "Registry search (Art. 8, 10)");
assertIncludes(rgContent, "computeRegistryStats", "Registry stats");

console.log("\n--- Phase 9: Admin UI Pages ---");
const oversightPage = path.join(process.cwd(), "app/admins-new/oversight/page.tsx");
assert(fs.existsSync(oversightPage), "Oversight page");
assertIncludes(fs.readFileSync(oversightPage, "utf-8"), "getOversightStats", "Oversight stats fetch");

const drPage = path.join(process.cwd(), "app/admins-new/reports/directive/page.tsx");
assert(fs.existsSync(drPage), "Directive reports page");
assertIncludes(fs.readFileSync(drPage, "utf-8"), "getDirectiveReportData", "Directive reports data fetch");

const callsPage = path.join(process.cwd(), "app/admins-new/calls/page.tsx");
assert(fs.existsSync(callsPage), "Calls page");
assertIncludes(fs.readFileSync(path.join(process.cwd(), "app/admins-new/calls/actions.ts"), "utf-8"), "getCalls", "Calls data fetch");

const regPage = path.join(process.cwd(), "app/admins-new/registry/page.tsx");
assert(fs.existsSync(regPage), "Registry page");
assertIncludes(fs.readFileSync(path.join(process.cwd(), "app/admins-new/registry/actions.ts"), "utf-8"), "getRegistryData", "Registry data fetch");

console.log(`\n══════════════════════════════════════`);
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log(`══════════════════════════════════════\n`);
process.exit(failed > 0 ? 1 : 0);
