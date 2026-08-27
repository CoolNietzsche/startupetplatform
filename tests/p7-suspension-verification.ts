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

console.log("\n========== P7 SUSPENSION & REVOCATION (Art. 24/25/30/31) ==========\n");

console.log("\n--- Test 1: suspension.ts ---");
const sPath = path.join(process.cwd(), "lib/directive/suspension.ts");
assert(fs.existsSync(sPath), "suspension.ts exists");
const sContent = fs.readFileSync(sPath, "utf-8");
assertIncludes(sContent, "SuspensionAction", "SuspensionAction type");
assertIncludes(sContent, "SuspensionGrounds", "SuspensionGrounds type");
assertIncludes(sContent, "SuspensionSeverity", "SuspensionSeverity type");
assertIncludes(sContent, "Art. 24.1", "Art 24 grounds");
assertIncludes(sContent, "Art. 25.1", "Art 25 grounds");
assertIncludes(sContent, "Art. 30.1", "Art 30 grounds");
assertIncludes(sContent, "Art. 31.1", "Art 31 grounds");
assertIncludes(sContent, "export function isSuspensionActive", "isSuspensionActive");
assertIncludes(sContent, "export function computeAppealDeadline", "computeAppealDeadline");
assertIncludes(sContent, "export function canRescind", "canRescind");

console.log("\n--- Test 2: Prisma Status Enums ---");
const appSchema = fs.readFileSync(path.join(process.cwd(), "prisma/schema/application.prisma"), "utf-8");
assertIncludes(appSchema, "SUSPENDED", "ApplicationStatus has SUSPENDED");
assertIncludes(appSchema, "REVOKED", "ApplicationStatus has REVOKED");
const ecoSchema = fs.readFileSync(path.join(process.cwd(), "prisma/schema/ecosystem.prisma"), "utf-8");
assertIncludes(ecoSchema, "SUSPENDED", "EcoApplicationStatus has SUSPENDED");
assertIncludes(ecoSchema, "REVOKED", "EcoApplicationStatus has REVOKED");

console.log("\n--- Test 3: Application Actions ---");
const aaPath = path.join(process.cwd(), "app/admins-new/applications/application-actions.ts");
const aaContent = fs.readFileSync(aaPath, "utf-8");
assertIncludes(aaContent, "suspendApplicationAction", "suspendApplicationAction exported");
assertIncludes(aaContent, "revokeApplicationAction", "revokeApplicationAction exported");
assertIncludes(aaContent, "rescindSuspensionAction", "rescindSuspensionAction exported");

console.log("\n--- Test 3b: Ecosystem Actions ---");
const eaPath = path.join(process.cwd(), "app/admins-new/ecosystem/ecosystem-actions.ts");
assert(fs.existsSync(eaPath), "ecosystem-actions.ts exists");
const eaContent = fs.readFileSync(eaPath, "utf-8");
assertIncludes(eaContent, "suspendEcoApplicationAction", "suspendEcoApplicationAction exported");
assertIncludes(eaContent, "revokeEcoApplicationAction", "revokeEcoApplicationAction exported");
assertIncludes(eaContent, "rescindEcoSuspensionAction", "rescindEcoSuspensionAction exported");
assertIncludes(eaContent, "SUSPENDED", "ecosystem-actions references SUSPENDED status");
assertIncludes(eaContent, "REVOKED", "ecosystem-actions references REVOKED status");

console.log("\n--- Test 4: Migration Script ---");
const migPath = path.join(process.cwd(), "scripts/migrate-suspension-statuses.ts");
assert(fs.existsSync(migPath), "migration script exists");
const migContent = fs.readFileSync(migPath, "utf-8");
assertIncludes(migContent, "SUSPENDED", "Migrates SUSPENDED");
assertIncludes(migContent, "REVOKED", "Migrates REVOKED");

console.log(`\n══════════════════════════════════════`);
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log(`══════════════════════════════════════\n`);
process.exit(failed > 0 ? 1 : 0);
