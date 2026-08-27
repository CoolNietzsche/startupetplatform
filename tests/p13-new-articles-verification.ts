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

console.log("\n========== P13 NEW ARTICLES (12, 15-18, 23, 26-27, 32, 35) ==========\n");

// ── Art. 12: Confidentiality ──
console.log("\n--- Art. 12: Confidentiality Obligations ---");
const confPath = path.join(process.cwd(), "lib/directive/confidentiality.ts");
assert(fs.existsSync(confPath), "confidentiality.ts exists");
const confContent = fs.readFileSync(confPath, "utf-8");
assertIncludes(confContent, "ConfidentialityLevel", "ConfidentialityLevel type");
assertIncludes(confContent, "DataCategory", "DataCategory type");
assertIncludes(confContent, "CONFIDENTIALITY_OBLIGATIONS", "Obligations defined");
assertIncludes(confContent, "Art. 12", "Directive ref");
assertIncludes(confContent, "canDisclose", "canDisclose access control");
assertIncludes(confContent, "computeRetentionExpiry", "Retention expiry computation");
assertIncludes(confContent, "RESTRICTED", "Highest confidentiality level");
assertIncludes(confContent, "PERSONAL", "Personal data category");
assertIncludes(confContent, "FINANCIAL", "Financial data category");
assertIncludes(confContent, "COMMERCIAL", "Commercial data category");

// ── Art. 15-18: Committee Procedures ──
console.log("\n--- Art. 15-18: Committee Procedures ---");
const cpPath = path.join(process.cwd(), "lib/directive/committee-procedures.ts");
assert(fs.existsSync(cpPath), "committee-procedures.ts exists");
const cpContent = fs.readFileSync(cpPath, "utf-8");
assertIncludes(cpContent, "CommitteeMeeting", "CommitteeMeeting type");
assertIncludes(cpContent, "MeetingDecision", "MeetingDecision type");
assertIncludes(cpContent, "VoteRecord", "VoteRecord type");
assertIncludes(cpContent, "MIN_ADVANCE_NOTICE_DAYS", "7-day advance notice");
assertIncludes(cpContent, "validateMeetingSchedule", "Meeting schedule validator");
assertIncludes(cpContent, "tallyVotes", "Vote tally function");
assertIncludes(cpContent, "requiresTwoThirdsMajority", "Two-thirds majority for suspension/revocation");

// ── Art. 23: Monitoring ──
console.log("\n--- Art. 23: Monitoring & Evaluation ---");
const monPath = path.join(process.cwd(), "lib/directive/monitoring.ts");
assert(fs.existsSync(monPath), "monitoring.ts exists");
const monContent = fs.readFileSync(monPath, "utf-8");
assertIncludes(monContent, "Inspection", "Inspection type");
assertIncludes(monContent, "Finding", "Finding type");
assertIncludes(monContent, "FindingSeverity", "Severity type");
assertIncludes(monContent, "computeNextInspectionDate", "Next inspection computation (12-month cycle)");
assertIncludes(monContent, "isInspectionOverdue", "Overdue check");
assertIncludes(monContent, "getInspectionPriority", "Priority based on findings");
assertIncludes(monContent, "computeComplianceScore", "Compliance score");

// ── Art. 26-27: Winding Up ──
console.log("\n--- Art. 26-27: Winding Up/Surrender ---");
const wuPath = path.join(process.cwd(), "lib/directive/winding-up.ts");
assert(fs.existsSync(wuPath), "winding-up.ts exists");
const wuContent = fs.readFileSync(wuPath, "utf-8");
assertIncludes(wuContent, "SurrenderRequest", "SurrenderRequest type");
assertIncludes(wuContent, "WindingUpReason", "WindingUpReason type");
assertIncludes(wuContent, "SURRENDER_REVIEW_DAYS", "45-day review period");
assertIncludes(wuContent, "computeReviewDeadline", "Review deadline");

// ── Art. 32: Transitional ──
console.log("\n--- Art. 32: Transitional Provisions ---");
const trPath = path.join(process.cwd(), "lib/directive/transitional.ts");
assert(fs.existsSync(trPath), "transitional.ts exists");
const trContent = fs.readFileSync(trPath, "utf-8");
assertIncludes(trContent, "TransitionalProvision", "TransitionalProvision type");
assertIncludes(trContent, "TransitionStatus", "TransitionStatus type");
assertIncludes(trContent, "TRANSITION_GRACE_DAYS", "180-day grace period");
assertIncludes(trContent, "computeTransitionDeadline", "Transition deadline computation");
assertIncludes(trContent, "canApplyTransition", "Transition eligibility check");

// ── Art. 35: Appeals ──
console.log("\n--- Art. 35: Appeals Process ---");
const apPath = path.join(process.cwd(), "lib/directive/appeals.ts");
assert(fs.existsSync(apPath), "appeals.ts exists");
const apContent = fs.readFileSync(apPath, "utf-8");
assertIncludes(apContent, "Appeal", "Appeal type");
assertIncludes(apContent, "AppealStatus", "AppealStatus type");
assertIncludes(apContent, "AppealGround", "AppealGround type");
assertIncludes(apContent, "APPEAL_DEADLINE_DAYS", "30-day filing deadline");
assertIncludes(apContent, "APPEAL_REVIEW_DAYS", "60-day review period");
assertIncludes(apContent, "isAppealTimely", "Timeliness check");
assertIncludes(apContent, "getAppealStatus", "Status computation");

// ── Admin Pages ──
console.log("\n--- Admin Pages for New Articles ---");
const appealsPage = path.join(process.cwd(), "app/admins-new/appeals/page.tsx");
assert(fs.existsSync(appealsPage), "Appeals admin page exists");
assertIncludes(fs.readFileSync(appealsPage, "utf-8"), "decideAppeal", "Appeals page can decide appeals");

const monitoringPage = path.join(process.cwd(), "app/admins-new/monitoring/page.tsx");
assert(fs.existsSync(monitoringPage), "Monitoring admin page exists");
assertIncludes(fs.readFileSync(monitoringPage, "utf-8"), "logInspectionFinding", "Monitoring page logs findings");

// ── Prisma Schema ──
console.log("\n--- Prisma Directive Schema ---");
const directiveSchema = path.join(process.cwd(), "prisma/schema/directive.prisma");
assert(fs.existsSync(directiveSchema), "directive.prisma exists");
const dsContent = fs.readFileSync(directiveSchema, "utf-8");
assertIncludes(dsContent, "CallForApplication", "Calls table");
assertIncludes(dsContent, "Inspection", "Inspections table");
assertIncludes(dsContent, "InspectionFinding", "Findings table");
assertIncludes(dsContent, "Appeal", "Appeals table");
assertIncludes(dsContent, "TransitionalProvision", "Transitional provisions table");
assertIncludes(dsContent, "SurrenderRequest", "Surrender requests table");

// ── Sidebar ──
console.log("\n--- Sidebar Navigation ---");
const sidebarPath = path.join(process.cwd(), "app/admins-new/components/admin-sidebar.tsx");
const sidebarContent = fs.readFileSync(sidebarPath, "utf-8");
assertIncludes(sidebarContent, "Appeals", "Sidebar has Appeals");
assertIncludes(sidebarContent, "Monitoring", "Sidebar has Monitoring");

// ── Compliance Matrix ──
console.log("\n--- Compliance Matrix Updated ---");
const cmPath = path.join(process.cwd(), "lib/directive/compliance-matrix.ts");
const cmContent = fs.readFileSync(cmPath, "utf-8");
assertIncludes(cmContent, "Art. 12", "Art. 12 in compliance matrix");
assertIncludes(cmContent, "Art. 15", "Art. 15 in compliance matrix");
assertIncludes(cmContent, "Art. 16", "Art. 16 in compliance matrix");
assertIncludes(cmContent, "Art. 17", "Art. 17 in compliance matrix");
assertIncludes(cmContent, "Art. 18", "Art. 18 in compliance matrix");
assertIncludes(cmContent, "Art. 23", "Art. 23 in compliance matrix");
assertIncludes(cmContent, "Art. 26", "Art. 26 in compliance matrix");
assertIncludes(cmContent, "Art. 27", "Art. 27 in compliance matrix");
assertIncludes(cmContent, "Art. 32", "Art. 32 in compliance matrix");
assertIncludes(cmContent, "Art. 35", "Art. 35 in compliance matrix");
assertIncludes(cmContent, "P13", "New P13 priority section");

console.log(`\n══════════════════════════════════════`);
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log(`══════════════════════════════════════\n`);
process.exit(failed > 0 ? 1 : 0);
