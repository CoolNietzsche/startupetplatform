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

console.log("\n========== P6 QUORUM ENFORCEMENT (Art. 13/33.3) ==========\n");

console.log("\n--- Test 1: quorum.ts ---");
const qPath = path.join(process.cwd(), "lib/directive/quorum.ts");
assert(fs.existsSync(qPath), "quorum.ts exists");
const qContent = fs.readFileSync(qPath, "utf-8");
assertIncludes(qContent, "QuorumConfig", "QuorumConfig type");
assertIncludes(qContent, "minMembers: 3", "Standard min 3 members");
assertIncludes(qContent, "quorumPercentage: 50", "Standard quorum 50%");
assertIncludes(qContent, "approvalPercentage: 50", "Standard approval 50%");
assertIncludes(qContent, "minMembers: 5", "CAC min 5 members");
assertIncludes(qContent, "quorumPercentage: 60", "CAC quorum 60%");
assertIncludes(qContent, "approvalPercentage: 66", "CAC approval 66%");
assertIncludes(qContent, "Art. 13.1, 33.3(a)", "Standard directive ref");
assertIncludes(qContent, "Art. 33.3(b)", "CAC directive ref");
assertIncludes(qContent, "Art. 33.3(c)", "Emergency directive ref");
assertIncludes(qContent, "export function hasQuorum", "hasQuorum");
assertIncludes(qContent, "export function hasApproval", "hasApproval");
assertIncludes(qContent, "export function getRequiredPresent", "getRequiredPresent");
assertIncludes(qContent, "export function getRequiredApprovals", "getRequiredApprovals");
assertIncludes(qContent, "export function getQuorumConfig", "getQuorumConfig");

console.log(`\n══════════════════════════════════════`);
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log(`══════════════════════════════════════\n`);
process.exit(failed > 0 ? 1 : 0);
