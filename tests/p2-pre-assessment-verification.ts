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

console.log("\n========== P2 PRE-ASSESSMENT WORKBENCH VERIFICATION ==========\n");

// ── Test 1: pre-assessment.ts library ──
console.log("\n--- Test 1: pre-assessment.ts ---");
const paPath = path.join(process.cwd(), "lib/directive/pre-assessment.ts");
assert(fs.existsSync(paPath), "pre-assessment.ts exists");
const paContent = fs.readFileSync(paPath, "utf-8");
assertIncludes(paContent, "export function getChecklist", "getChecklist");
assertIncludes(paContent, "export function getRequiredChecklist", "getRequiredChecklist");
assertIncludes(paContent, "export function checkAllDocumentsVerified", "checkAllDocumentsVerified");
assertIncludes(paContent, "export function computeVerificationStats", "computeVerificationStats");
assertIncludes(paContent, "export function computeSla", "computeSla");
assertIncludes(paContent, "export function isSlaBreached", "isSlaBreached");
// Checklist items
assertIncludes(paContent, "eco_business_license", "Business license checklist item");
assertIncludes(paContent, "eco_tax_registration", "Tax registration checklist item");
assertIncludes(paContent, "startup_business_license", "Startup business license");
assertIncludes(paContent, "Art. 7.1", "Startup directive ref Art. 7");
assertIncludes(paContent, "Art. 8.1", "Ecosystem directive ref Art. 8");

// ── Test 2: Prisma Schema ──
console.log("\n--- Test 2: Prisma Schema - documentVerification fields ---");
const appSchema = fs.readFileSync(path.join(process.cwd(), "prisma/schema/application.prisma"), "utf-8");
assertIncludes(appSchema, "documentVerification", "Application has documentVerification");
assertIncludes(appSchema, "preAssessedAt", "Application has preAssessedAt");
assertIncludes(appSchema, "preAssessedById", "Application has preAssessedById");
const ecoSchema = fs.readFileSync(path.join(process.cwd(), "prisma/schema/ecosystem.prisma"), "utf-8");
assertIncludes(ecoSchema, "documentVerification", "EcoApplication has documentVerification");
assertIncludes(ecoSchema, "preAssessedAt", "EcoApplication has preAssessedAt");
assertIncludes(ecoSchema, "preAssessedById", "EcoApplication has preAssessedById");

// ── Test 3: Ecosystem Actions ──
console.log("\n--- Test 3: Ecosystem Actions ---");
const eaPath = path.join(process.cwd(), "app/admins-new/ecosystem/ecosystem-actions.ts");
assertExports(eaPath, ["verifyEcoDocument", "completeEcoPreAssessment"], "ecosystem-actions exports");
const eaContent = fs.readFileSync(eaPath, "utf-8");
assertIncludes(eaContent, "checkAllDocumentsVerified", "Uses checkAllDocumentsVerified");
assertIncludes(eaContent, "documentVerification: existing", "Saves documentVerification");

// ── Test 4: Application Actions ──
console.log("\n--- Test 4: Application Actions (startup) ---");
const aaPath = path.join(process.cwd(), "app/admins-new/applications/application-actions.ts");
assertExports(aaPath, ["verifyStartupDocument", "completeStartupPreAssessment"], "application-actions exports");
const aaContent = fs.readFileSync(aaPath, "utf-8");
assertIncludes(aaContent, "checkAllDocumentsVerified", "Uses checkAllDocumentsVerified");
assertIncludes(aaContent, "documentVerification: existing", "Saves documentVerification");

// ── Test 5: Ecosystem Review Page UI ──
console.log("\n--- Test 5: Ecosystem Review Page UI ---");
const erpPath = path.join(process.cwd(), "app/admins-new/ecosystem/review/[id]/page.tsx");
assert(fs.existsSync(erpPath), "ecosystem review page exists");
const erpContent = fs.readFileSync(erpPath, "utf-8");
assertIncludes(erpContent, "verifyEcoDocument", "Imports verifyEcoDocument");
assertIncludes(erpContent, "completeEcoPreAssessment", "Imports completeEcoPreAssessment");
assertIncludes(erpContent, "computeSla", "Imports computeSla");
assertIncludes(erpContent, "getChecklist", "Imports getChecklist");
assertIncludes(erpContent, "completeEcoPreAssessment", "Complete Pre-Assessment button");
assertIncludes(erpContent, "SLA BREACHED", "SLA breach indicator");

// ── Test 6: Migration Script ──
console.log("\n--- Test 6: Migration Script ---");
const migPath = path.join(process.cwd(), "scripts/migrate-pre-assessment-fields.ts");
assert(fs.existsSync(migPath), "migration script exists");
const migContent = fs.readFileSync(migPath, "utf-8");
assertIncludes(migContent, "documentVerification", "Migrates documentVerification");
assertIncludes(migContent, "preAssessedAt", "Migrates preAssessedAt");
assertIncludes(migContent, "preAssessedById", "Migrates preAssessedById");
assertIncludes(migContent, "EcoApplication", "Migrates EcoApplication table");
assertIncludes(migContent, "Application", "Migrates Application table");

// ══════════════════════════════════════
console.log(`\n══════════════════════════════════════`);
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log(`══════════════════════════════════════\n`);
process.exit(failed > 0 ? 1 : 0);
