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

console.log("\n========== P5 CONFLICT OF INTEREST (Art. 14/36) ==========\n");

console.log("\n--- Test 1: conflict-of-interest.ts ---");
const coiPath = path.join(process.cwd(), "lib/directive/conflict-of-interest.ts");
assert(fs.existsSync(coiPath), "conflict-of-interest.ts exists");
const coiContent = fs.readFileSync(coiPath, "utf-8");
assertIncludes(coiContent, "CoiDeclaration", "CoiDeclaration type");
assertIncludes(coiContent, "CoiRelationship", "CoiRelationship type");
assertIncludes(coiContent, "CoiCheckResult", "CoiCheckResult type");
assertIncludes(coiContent, "export function checkPotentialConflict", "checkPotentialConflict");
assertIncludes(coiContent, "export function canProceedWithConflict", "canProceedWithConflict");
assertIncludes(coiContent, "export function requiresRecusal", "requiresRecusal");
assertIncludes(coiContent, "export function getConflictDirectiveRef", "getConflictDirectiveRef");
assertIncludes(coiContent, "Art. 14.1", "Directive ref Art 14");
assertIncludes(coiContent, "RECUSED", "RECUSED resolution");
assertIncludes(coiContent, "OVERRULED", "OVERRULED resolution");

console.log(`\n══════════════════════════════════════`);
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log(`══════════════════════════════════════\n`);
process.exit(failed > 0 ? 1 : 0);
