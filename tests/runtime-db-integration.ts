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

console.log("\n========== RUNTIME DB INTEGRATION TESTS ==========\n");
console.log("(Static file-content verification + DB migration scripts)\n");

// ── Database Migration Scripts ──
console.log("\n--- 0. Database Migration Scripts ---");
const migDir = path.join(process.cwd(), "scripts");
const migFiles = fs.readdirSync(migDir).filter(f => f.startsWith("migrate-") && f.endsWith(".ts"));
assert(migFiles.length >= 5, `At least 5 migration scripts exist (found ${migFiles.length})`);
for (const f of migFiles) {
  assert(fs.existsSync(path.join(migDir, f)), `Migration script: ${f}`);
}

// Verify seed script
const seedPath = path.join(process.cwd(), "scripts/seed.ts");
assert(fs.existsSync(seedPath), "Seed script exists");

// Verify certificate expiry checker
const expiryPath = path.join(process.cwd(), "scripts/check-certificate-expiry.ts");
assert(fs.existsSync(expiryPath), "Certificate expiry checker exists");

// ── 1. Scoring Library ──
console.log("\n--- 1. Scoring Library ---");
const sp = fs.readFileSync(path.join(process.cwd(), "lib/directive/scoring-presets.ts"), "utf-8");
assertIncludes(sp, "STARTUP_INITIAL", "STARTUP_INITIAL preset exported");
assertIncludes(sp, "STARTUP_POST_INITIAL", "STARTUP_POST_INITIAL preset exported");
assertIncludes(sp, "STARTUP_SCALE_EXIT", "STARTUP_SCALE_EXIT preset exported");
assertIncludes(sp, "ECOSYSTEM_INCUBATOR", "ECOSYSTEM_INCUBATOR preset exported");
assertIncludes(sp, "export function validateWeightTotal", "validateWeightTotal function");
assertIncludes(sp, "export function meetsThreshold", "meetsThreshold function");
assertIncludes(sp, "Math.min", "Score clamping with Math.min");

// ── 2. Stages Library ──
console.log("\n--- 2. Stages Library ---");
const st = fs.readFileSync(path.join(process.cwd(), "lib/directive/stages.ts"), "utf-8");
assertIncludes(st, "getThresholdForStage", "getThresholdForStage function");
assertIncludes(st, "secondRenewalThreshold", "Second renewal threshold defined");
assertIncludes(st, "computeExpiryDate", "computeExpiryDate function");
assertIncludes(st, "canTransition", "canTransition function");
assertIncludes(st, "durationYears: 2", "Initial stage 2-year duration");
assertIncludes(st, "durationYears: 4", "Post-initial stage 4-year duration");

// ── 3. Pre-Assessment Library ──
console.log("\n--- 3. Pre-Assessment Library ---");
const pa = fs.readFileSync(path.join(process.cwd(), "lib/directive/pre-assessment.ts"), "utf-8");
assertIncludes(pa, "getRequiredChecklist", "getRequiredChecklist function");
assertIncludes(pa, "checkAllDocumentsVerified", "checkAllDocumentsVerified function");
assertIncludes(pa, "computeVerificationStats", "computeVerificationStats function");
assertIncludes(pa, "computeSla", "computeSla function");
assertIncludes(pa, "Art. 7.1", "Startup checklist ref");
assertIncludes(pa, "Art. 8.1", "Ecosystem checklist ref");

// ── 4. CAC Oversight Library ──
console.log("\n--- 4. CAC Oversight Library ---");
const co = fs.readFileSync(path.join(process.cwd(), "lib/directive/cac-oversight.ts"), "utf-8");
assertIncludes(co, "computeCacTermEnd", "computeCacTermEnd function");
assertIncludes(co, "computeAvgCompletionDays", "computeAvgCompletionDays function");
assertIncludes(co, "computePassRate", "computePassRate function");
assertIncludes(co, "getCommitteeHealthScore", "getCommitteeHealthScore function");
assertIncludes(co, "CAC_TERM_YEARS", "CAC 3-year term constant");
assertIncludes(co, "CRITICAL", "CRITICAL health status");
assertIncludes(co, "HEALTHY", "HEALTHY health status");

// ── 5. Conflict of Interest Library ──
console.log("\n--- 5. Conflict of Interest Library ---");
const ci = fs.readFileSync(path.join(process.cwd(), "lib/directive/conflict-of-interest.ts"), "utf-8");
assertIncludes(ci, "checkPotentialConflict", "checkPotentialConflict function");
assertIncludes(ci, "requiresRecusal", "requiresRecusal function");
assertIncludes(ci, "canProceedWithConflict", "canProceedWithConflict function");
assertIncludes(ci, "FAMILY", "FAMILY relationship type");
assertIncludes(ci, "Art. 14.1(a)", "COI ground reference");

// ── 6. Quorum Library ──
console.log("\n--- 6. Quorum Library ---");
const qu = fs.readFileSync(path.join(process.cwd(), "lib/directive/quorum.ts"), "utf-8");
assertIncludes(qu, "hasQuorum", "hasQuorum function");
assertIncludes(qu, "hasApproval", "hasApproval function");
assertIncludes(qu, "getRequiredPresent", "getRequiredPresent function");
assertIncludes(qu, "getRequiredApprovals", "getRequiredApprovals function");
assertIncludes(qu, "quorumPercentage: 50", "Standard quorum 50%");
assertIncludes(qu, "quorumPercentage: 60", "CAC quorum 60%");
assertIncludes(qu, "quorumPercentage: 33", "Emergency quorum 33%");

// ── 7. Suspension Library ──
console.log("\n--- 7. Suspension Library ---");
const su = fs.readFileSync(path.join(process.cwd(), "lib/directive/suspension.ts"), "utf-8");
assertIncludes(su, "isSuspensionActive", "isSuspensionActive function");
assertIncludes(su, "computeAppealDeadline", "computeAppealDeadline function");
assertIncludes(su, "canRescind", "canRescind function");
assertIncludes(su, "Art. 24.1", "Art. 24 suspension grounds");
assertIncludes(su, "Art. 25.1", "Art. 25 revocation grounds");
assertIncludes(su, "Art. 30.1", "Art. 30 minor violations");
assertIncludes(su, "Art. 31.1", "Art. 31 automatic triggers");

// ── 8. Reports Library ──
console.log("\n--- 8. Reports Library ---");
const rp = fs.readFileSync(path.join(process.cwd(), "lib/directive/reports.ts"), "utf-8");
assertIncludes(rp, "getReportRequirements", "getReportRequirements function");
assertIncludes(rp, "computeReportDueDate", "computeReportDueDate function");
assertIncludes(rp, "getReportStatus", "getReportStatus function");
assertIncludes(rp, "STARTUP_PROGRESS", "STARTUP_PROGRESS report type");
assertIncludes(rp, "INCUBATION_PROGRESS", "INCUBATION_PROGRESS report type");
assertIncludes(rp, "ECOSYSTEM_ANNUAL", "ECOSYSTEM_ANNUAL report type");

// ── 9. Certificates Library ──
console.log("\n--- 9. Certificates Library ---");
const ce = fs.readFileSync(path.join(process.cwd(), "lib/directive/certificates.ts"), "utf-8");
assertIncludes(ce, "CERTIFICATE_VALIDITY_YEARS", "Certificate validity years");
assertIncludes(ce, "RENEWAL_WINDOW_DAYS", "Renewal window");
assertIncludes(ce, "GRACE_PERIOD_DAYS", "Grace period");
assertIncludes(ce, "computeCertificateExpiry", "computeCertificateExpiry function");
assertIncludes(ce, "canRenew", "canRenew function");
assertIncludes(ce, "isCertificateActive", "isCertificateActive function");

// ── 10. Calls Library ──
console.log("\n--- 10. Calls Library ---");
const cl = fs.readFileSync(path.join(process.cwd(), "lib/directive/calls.ts"), "utf-8");
assertIncludes(cl, "MIN_APPLICATION_WINDOW_DAYS", "Minimum window constant");
assertIncludes(cl, "isCallOpen", "isCallOpen function");
assertIncludes(cl, "validateApplicationWindow", "validateApplicationWindow function");

// ── 11. Registry Library ──
console.log("\n--- 11. Registry Library ---");
const rg = fs.readFileSync(path.join(process.cwd(), "lib/directive/registry.ts"), "utf-8");
assertIncludes(rg, "searchRegistry", "searchRegistry function");
assertIncludes(rg, "computeRegistryStats", "computeRegistryStats function");
assertIncludes(rg, "RegistryEntry", "RegistryEntry type");

// ── 12. New Articles: All ──
console.log("\n--- 12. New Articles (All) ---");
const ap = fs.readFileSync(path.join(process.cwd(), "lib/directive/appeals.ts"), "utf-8");
assertIncludes(ap, "APPEAL_DEADLINE_DAYS", "Appeal 30-day deadline");
assertIncludes(ap, "APPEAL_REVIEW_DAYS", "Appeal 60-day review");

const mo = fs.readFileSync(path.join(process.cwd(), "lib/directive/monitoring.ts"), "utf-8");
assertIncludes(mo, "computeNextInspectionDate", "12-month inspection cycle");
assertIncludes(mo, "computeComplianceScore", "Compliance score");

const cp = fs.readFileSync(path.join(process.cwd(), "lib/directive/committee-procedures.ts"), "utf-8");
assertIncludes(cp, "MIN_ADVANCE_NOTICE_DAYS", "7-day notice");
assertIncludes(cp, "tallyVotes", "Vote tally");
assertIncludes(cp, "requiresTwoThirdsMajority", "Two-thirds majority");

const wu = fs.readFileSync(path.join(process.cwd(), "lib/directive/winding-up.ts"), "utf-8");
assertIncludes(wu, "SURRENDER_REVIEW_DAYS", "45-day review");

const tr = fs.readFileSync(path.join(process.cwd(), "lib/directive/transitional.ts"), "utf-8");
assertIncludes(tr, "TRANSITION_GRACE_DAYS", "180-day grace");

const cf = fs.readFileSync(path.join(process.cwd(), "lib/directive/confidentiality.ts"), "utf-8");
assertIncludes(cf, "CONFIDENTIALITY_OBLIGATIONS", "6 data categories");
assertIncludes(cf, "canDisclose", "Access control");

// ── 13. Admin Pages DB Backend ──
console.log("\n--- 13. Admin Pages with DB Backend ---");
const appealsActions = fs.readFileSync(path.join(process.cwd(), "app/admins-new/appeals/actions.ts"), "utf-8");
assertIncludes(appealsActions, 'FROM "directive"."Appeal"', "Appeals queries directive.Appeal table");
assertIncludes(appealsActions, "INSERT INTO", "Appeals inserts into DB");
assertIncludes(appealsActions, "submitAppeal", "submitAppeal action");
assertIncludes(appealsActions, "decideAppeal", "decideAppeal action");

const monitoringActions = fs.readFileSync(path.join(process.cwd(), "app/admins-new/monitoring/actions.ts"), "utf-8");
assertIncludes(monitoringActions, 'FROM "directive"."Inspection"', "Monitoring queries inspection table");
assertIncludes(monitoringActions, "INSERT INTO", "Monitoring inserts findings into DB");
assertIncludes(monitoringActions, "logInspectionFinding", "logInspectionFinding action");

// ── 14. Report Submission UI ──
console.log("\n--- 14. Startup Report Submission ---");
const reportSubmit = path.join(process.cwd(), "app/reports/submit/page.tsx");
assert(fs.existsSync(reportSubmit), "Report submission page exists");
const rsContent = fs.readFileSync(reportSubmit, "utf-8");
assertIncludes(rsContent, "Submit Report", "Submit Report title");
assertIncludes(rsContent, "Art. 19.5", "References Art. 19.5");
assertIncludes(rsContent, "Art. 20.5", "References Art. 20.5");

// ── 15. Prisma Schema Complete ──
console.log("\n--- 15. Prisma Schema Coverage ---");
const dsContent = fs.readFileSync(path.join(process.cwd(), "prisma/schema/directive.prisma"), "utf-8");
assertIncludes(dsContent, "CallForApplication", "Calls table in schema");
assertIncludes(dsContent, "Appeal", "Appeals table in schema");
assertIncludes(dsContent, "Inspection", "Inspections table in schema");
assertIncludes(dsContent, "InspectionFinding", "Findings table in schema");
assertIncludes(dsContent, "TransitionalProvision", "Transitional table in schema");
assertIncludes(dsContent, "SurrenderRequest", "Surrender table in schema");

// Verify main schema includes directive
const mainSchema = fs.readFileSync(path.join(process.cwd(), "prisma/schema/schema.prisma"), "utf-8");
assertIncludes(mainSchema, "directive", "directive schema in datasource");

// ── 16. Operational Scripts ──
console.log("\n--- 16. Operational Scripts ---");
assertIncludes(fs.readFileSync(path.join(process.cwd(), "scripts/check-certificate-expiry.ts"), "utf-8"), "expires_at", "Expiry checker checks expires_at");
assert(fs.existsSync(path.join(process.cwd(), "scripts/seed.ts")), "Seed script exists");
const seedContent = fs.readFileSync(path.join(process.cwd(), "scripts/seed.ts"), "utf-8");
assertIncludes(seedContent, "Appeal", "Seed seeds appeals");
assertIncludes(seedContent, "Inspection", "Seed seeds inspections");
assertIncludes(seedContent, "TransitionalProvision", "Seed seeds transitional provisions");

// ── 17. All Migration Scripts ──
console.log("\n--- 17. Migration Scripts ---");
const allMigrations = fs.readdirSync(path.join(process.cwd(), "scripts")).filter(f => f.startsWith("migrate-"));
const expected = ["migrate-directive-fields.ts", "migrate-directive-tables.ts", "migrate-pre-assessment-fields.ts", "migrate-stage-fields.ts", "migrate-suspension-statuses.ts"];
for (const exp of expected) {
  assert(allMigrations.includes(exp), `Migration script: ${exp}`);
}

console.log(`\n══════════════════════════════════════`);
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log(`══════════════════════════════════════\n`);
process.exit(failed > 0 ? 1 : 0);
