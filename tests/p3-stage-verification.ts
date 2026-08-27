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

console.log("\n========== P3 STAGE-BASED GROWTH LEVELS ==========\n");

// ── Test 1: Stages Library ──
console.log("\n--- Test 1: stages.ts ---");
const stagesPath = path.join(process.cwd(), "lib/directive/stages.ts");
assert(fs.existsSync(stagesPath), "stages.ts exists");
const stagesContent = fs.readFileSync(stagesPath, "utf-8");
assertIncludes(stagesContent, "INITIAL", "Stage INITIAL defined");
assertIncludes(stagesContent, "POST_INITIAL", "Stage POST_INITIAL defined");
assertIncludes(stagesContent, "SCALE_EXIT", "Stage SCALE_EXIT defined");
assertIncludes(stagesContent, "durationYears: 2", "Initial duration 2 years");
assertIncludes(stagesContent, "durationYears: 4", "Post-Initial duration 4 years");
assertIncludes(stagesContent, "passThreshold: 70", "Initial threshold 70%");
assertIncludes(stagesContent, "passThreshold: 80", "Post-Initial threshold 80%");
assertIncludes(stagesContent, "passThreshold: 85", "Scale-Exit threshold 85%");
assertIncludes(stagesContent, "secondRenewalThreshold: 75", "Second renewal threshold 75%");
assertIncludes(stagesContent, "Art. 21.1, 22.1", "Initial directive ref");
assertIncludes(stagesContent, "Art. 21.2, 22.2", "Post-Initial directive ref");
assertIncludes(stagesContent, "Art. 21.3, 22.3", "Scale-Exit directive ref");
assertIncludes(stagesContent, "export function getStageConfig", "getStageConfig exported");
assertIncludes(stagesContent, "export function getThresholdForStage", "getThresholdForStage exported");
assertIncludes(stagesContent, "export function computeExpiryDate", "computeExpiryDate exported");
assertIncludes(stagesContent, "export function isStageExpired", "isStageExpired exported");
assertIncludes(stagesContent, "export function getNextStage", "getNextStage exported");
assertIncludes(stagesContent, "export function canTransition", "canTransition exported");
assertIncludes(stagesContent, "export function getDefaultStageForApplicationType", "getDefaultStageForApplicationType");

// ── Test 2: Prisma Schema ──
console.log("\n--- Test 2: Prisma Schema ---");
const appSchema = fs.readFileSync(path.join(process.cwd(), "prisma/schema/application.prisma"), "utf-8");
assertIncludes(appSchema, "directiveStage", "Application has directiveStage");
assertIncludes(appSchema, "directiveStage", "Startup has directiveStage");

// ── Test 3: Certification flow reference ──
console.log("\n--- Test 3: Certification Action integration ---");
const aaPath = path.join(process.cwd(), "app/admins-new/applications/application-actions.ts");
const aaContent = fs.readFileSync(aaPath, "utf-8");
assertIncludes(aaContent, "directiveStage", "setApplicationCertified sets directiveStage");
assertIncludes(aaContent, "computeExpiryDate", "Uses computeExpiryDate for stage-based expiry");
assertIncludes(aaContent, "getDefaultStageForApplicationType", "Defaults stage from application type");

// ── Test 4: Migration Script ──
console.log("\n--- Test 4: Migration Script ---");
const migPath = path.join(process.cwd(), "scripts/migrate-stage-fields.ts");
assert(fs.existsSync(migPath), "migration script exists");
const migContent = fs.readFileSync(migPath, "utf-8");
assertIncludes(migContent, "directiveStage", "Migrates directiveStage");

// ══════════════════════════════════════
console.log(`\n══════════════════════════════════════`);
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log(`══════════════════════════════════════\n`);
process.exit(failed > 0 ? 1 : 0);
