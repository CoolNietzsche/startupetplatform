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

function assertExports(filePath: string, symbols: string[], name: string) {
  const content = fs.readFileSync(filePath, "utf-8");
  for (const s of symbols) {
    assert(content.includes(`export async function ${s}`) || content.includes(`export const ${s}`) || content.includes(`export function ${s}`), `${name} exports ${s}`);
  }
}

console.log("\n========== P1 SCORING ENGINE VERIFICATION ==========\n");

// ── Test 1: Scoring Presets File ──
console.log("\n--- Test 1: scoring-presets.ts ---");
const presetsPath = path.join(process.cwd(), "lib/directive/scoring-presets.ts");
assert(fs.existsSync(presetsPath), "scoring-presets.ts exists");
const presetsContent = fs.readFileSync(presetsPath, "utf-8");

// Check SCORING_PRESETS record with all 8 presets
assertIncludes(presetsContent, "STARTUP_INITIAL", "STARTUP_INITIAL preset");
assertIncludes(presetsContent, "STARTUP_POST_INITIAL", "STARTUP_POST_INITIAL preset");
assertIncludes(presetsContent, "STARTUP_SCALE_EXIT", "STARTUP_SCALE_EXIT preset");
assertIncludes(presetsContent, "ECOSYSTEM_INCUBATOR", "ECOSYSTEM_INCUBATOR preset");
assertIncludes(presetsContent, "ECOSYSTEM_ACCELERATOR", "ECOSYSTEM_ACCELERATOR preset");
assertIncludes(presetsContent, "ECOSYSTEM_COWORKING", "ECOSYSTEM_COWORKING preset");
assertIncludes(presetsContent, "ECOSYSTEM_VENTURE_CAPITAL", "ECOSYSTEM_VENTURE_CAPITAL preset");
assertIncludes(presetsContent, "ECOSYSTEM_ANGEL_INVESTOR", "ECOSYSTEM_ANGEL_INVESTOR preset");

// Check utility functions
assertIncludes(presetsContent, "export function validateWeightTotal", "validateWeightTotal");
assertIncludes(presetsContent, "export function calculateTotalPercentage", "calculateTotalPercentage");
assertIncludes(presetsContent, "export function meetsThreshold", "meetsThreshold");

// Check pass thresholds
assertIncludes(presetsContent, "passThreshold: 70", "Startup Initial pass threshold 70%");
assertIncludes(presetsContent, "passThreshold: 80", "Startup Post-Initial pass threshold 80%");
assertIncludes(presetsContent, "passThreshold: 85", "Scale/Exit & Ecosystem pass threshold 85%");

// ── Test 2: Prisma Schema Changes ──
console.log("\n--- Test 2: Prisma Schema ---");
const committeeSchema = fs.readFileSync(path.join(process.cwd(), "prisma/schema/committee.prisma"), "utf-8");
assertIncludes(committeeSchema, "directivePreset", "CommitteeCriterion has directivePreset");
assertIncludes(committeeSchema, "directiveRef", "CommitteeCriterion has directiveRef");

// ── Test 3: Committee Actions ──
console.log("\n--- Test 3: committee-actions.ts ---");
const caPath = path.join(process.cwd(), "app/admins-new/committees/committee-actions.ts");
assert(fs.existsSync(caPath), "committee-actions.ts exists");
assertExports(caPath, [
  "loadDirectivePreset",
  "getAvailablePresets",
  "getCommitteeCriteria",
  "upsertCommitteeCriterion",
  "deleteCommitteeCriterion",
  "getCommittees"
], "committee-actions");

const caContent = fs.readFileSync(caPath, "utf-8");
assertIncludes(caContent, "existingCriterion.directivePreset", "Preset criteria edit protection");
assertIncludes(caContent, "loadDirectivePreset", "loadDirectivePreset implementation");

// ── Test 4: Dashboard Actions Scoring ──
console.log("\n--- Test 4: Dashboard actions.ts (scoring) ---");
const daPath = path.join(process.cwd(), "app/committee-portal/dashboard/actions.ts");
assert(fs.existsSync(daPath), "dashboard actions.ts exists");
const daContent = fs.readFileSync(daPath, "utf-8");
assertIncludes(daContent, "Math.min", "Score clamping exists");
assertIncludes(daContent, "passThreshold", "Pass threshold reference exists");
assertIncludes(daContent, "calculateTotalPercentage", "Uses calculateTotalPercentage");

// ── Test 5: Frontend Preset Locking ──
console.log("\n--- Test 5: Frontend preset locking ---");
const adcPath = path.join(process.cwd(), "app/committee-portal/assessments/components/assessment-details-client.tsx");
assert(fs.existsSync(adcPath), "assessment-details-client.tsx exists");
const adcContent = fs.readFileSync(adcPath, "utf-8");
assertIncludes(adcContent, "criteria.directiveRef", "Frontend checks directiveRef");
assertIncludes(adcContent, "Directive", "Directive badge shown on preset criteria");

// ══════════════════════════════════════
console.log(`\n══════════════════════════════════════`);
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log(`══════════════════════════════════════\n`);
process.exit(failed > 0 ? 1 : 0);
