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

console.log("\n========== P4 CAC OVERSIGHT (Art. 33/34) ==========\n");

console.log("\n--- Test 1: cac-oversight.ts ---");
const cacPath = path.join(process.cwd(), "lib/directive/cac-oversight.ts");
assert(fs.existsSync(cacPath), "cac-oversight.ts exists");
const cacContent = fs.readFileSync(cacPath, "utf-8");
assertIncludes(cacContent, "export function computeCacTermEnd", "computeCacTermEnd");
assertIncludes(cacContent, "export function isCacMemberExpired", "isCacMemberExpired");
assertIncludes(cacContent, "export function computeOverdueDays", "computeOverdueDays");
assertIncludes(cacContent, "export function computeAvgCompletionDays", "computeAvgCompletionDays");
assertIncludes(cacContent, "export function computePassRate", "computePassRate");
assertIncludes(cacContent, "export function getCommitteeHealthScore", "getCommitteeHealthScore");
assertIncludes(cacContent, "CAC_TERM_YEARS", "CAC term defined");
assertIncludes(cacContent, "CommitteePerformance", "CommitteePerformance type");
assertIncludes(cacContent, "CacMember", "CacMember type");

console.log(`\n══════════════════════════════════════`);
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log(`══════════════════════════════════════\n`);
process.exit(failed > 0 ? 1 : 0);
