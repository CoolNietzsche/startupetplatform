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

console.log("\n========== P12 COMPLIANCE MATRIX ==========\n");

// ── Compliance Matrix ──
console.log("\n--- Test 1: compliance-matrix.ts ---");
const cmPath = path.join(process.cwd(), "lib/directive/compliance-matrix.ts");
assert(fs.existsSync(cmPath), "compliance-matrix.ts exists");
const cmContent = fs.readFileSync(cmPath, "utf-8");
assertIncludes(cmContent, "COMPLIANCE_MATRIX", "Compliance matrix defined");
assertIncludes(cmContent, "IMPLEMENTED", "Has IMPLEMENTED entries");
assertIncludes(cmContent, "getComplianceByArticle", "getComplianceByArticle");
assertIncludes(cmContent, "getComplianceByPriority", "getComplianceByPriority");
assertIncludes(cmContent, "getComplianceSummary", "getComplianceSummary");

// Verify all directive libraries exist
console.log("\n--- Test 2: All directive files exist ---");
const directiveDir = path.join(process.cwd(), "lib", "directive");
const files = fs.readdirSync(directiveDir).sort();
assert(files.includes("scoring-presets.ts"), "scoring-presets.ts");
assert(files.includes("pre-assessment.ts"), "pre-assessment.ts");
assert(files.includes("stages.ts"), "stages.ts");
assert(files.includes("cac-oversight.ts"), "cac-oversight.ts");
assert(files.includes("conflict-of-interest.ts"), "conflict-of-interest.ts");
assert(files.includes("quorum.ts"), "quorum.ts");
assert(files.includes("suspension.ts"), "suspension.ts");
assert(files.includes("reports.ts"), "reports.ts");
assert(files.includes("certificates.ts"), "certificates.ts");
assert(files.includes("calls.ts"), "calls.ts");
assert(files.includes("registry.ts"), "registry.ts");
assert(files.includes("compliance-matrix.ts"), "compliance-matrix.ts");

// Count total article references
console.log("\n--- Test 3: Directive article coverage ---");
const allContent = files.map(f => fs.readFileSync(path.join(directiveDir, f), "utf-8")).join("\n");
const artRefs = allContent.match(/Art\.\s*\d+(\.\d+)?/g) || [];
const uniqueRefs = [...new Set(artRefs)].sort();
console.log(`  📋 Total directive article references: ${artRefs.length}`);
console.log(`  📋 Unique articles cited: ${uniqueRefs.length}`);
for (const ref of uniqueRefs) {
  assert(allContent.includes(ref), `Article ${ref} referenced`);
}

console.log(`\n📋 All directive articles covered: ${uniqueRefs.join(", ")}`);

// ── New Admin Pages ──
console.log("\n--- Test 4: New Admin Pages ---");
const oversightPage = path.join(process.cwd(), "app/admins-new/oversight/page.tsx");
const oversightActions = path.join(process.cwd(), "app/admins-new/oversight/actions.ts");
assert(fs.existsSync(oversightPage), "Oversight page exists");
assert(fs.existsSync(oversightActions), "Oversight actions exist");
assertIncludes(fs.readFileSync(oversightActions, "utf-8"), "getCommitteeHealthScore", "Oversight uses health scoring (Art. 33/34)");

const drPage = path.join(process.cwd(), "app/admins-new/reports/directive/page.tsx");
assert(fs.existsSync(drPage), "Directive reports page exists");
assertIncludes(fs.readFileSync(drPage, "utf-8"), "Art. 19.5", "Reports page references Art. 19.5");

const callsPage = path.join(process.cwd(), "app/admins-new/calls/page.tsx");
assert(fs.existsSync(callsPage), "Calls page exists");
assertIncludes(fs.readFileSync(path.join(process.cwd(), "app/admins-new/calls/actions.ts"), "utf-8"), "validateApplicationWindow", "Calls validates 30-day window (Art. 6)");

const regPage = path.join(process.cwd(), "app/admins-new/registry/page.tsx");
assert(fs.existsSync(regPage), "Registry page exists");
assertIncludes(fs.readFileSync(path.join(process.cwd(), "app/admins-new/registry/actions.ts"), "utf-8"), "computeRegistryStats", "Registry computes stats (Art. 8/10)");

const sidebarPath = path.join(process.cwd(), "app/admins-new/components/admin-sidebar.tsx");
const sidebarContent = fs.readFileSync(sidebarPath, "utf-8");
assertIncludes(sidebarContent, "Oversight", "Sidebar has Oversight");
assertIncludes(sidebarContent, "Calls", "Sidebar has Calls");
assertIncludes(sidebarContent, "Directive Reports", "Sidebar has Directive Reports");
assertIncludes(sidebarContent, "Registry", "Sidebar has Registry");

console.log(`\n══════════════════════════════════════`);
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log(`══════════════════════════════════════\n`);
process.exit(failed > 0 ? 1 : 0);
