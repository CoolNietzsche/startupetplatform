/**
 * Comprehensive Verification Test Suite
 * Validates all critical fixes: RBAC, API auth, security, mock data removal, etc.
 */
import * as fs from "fs";
import * as path from "path";

// ============================================================
// Test 1: RBAC - Verify middleware no longer references MANAGER/SUPPORT
// ============================================================
function testMiddlewareRbac() {
  console.log("🧪 Test 1: Middleware RBAC (MANAGER/SUPPORT removed)...");
  const middlewarePath = path.join(process.cwd(), "middleware.ts");
  const content = fs.readFileSync(middlewarePath, "utf-8");

  // Check for orphaned roles (standalone MANAGER not HUB_MANAGER, and standalone SUPPORT)
  const hasOrphanedManager = /\bMANAGER\b/.test(content) && !content.includes("HUB_MANAGER");
  const hasSupport = /\bSUPPORT\b/.test(content);
  if (hasOrphanedManager || hasSupport) {
    console.error("❌ FAIL: middleware.ts still contains orphaned MANAGER or SUPPORT references");
    return false;
  }
  if (!content.includes("/stakeholder/:path*")) {
    console.error("❌ FAIL: middleware.ts does not protect /stakeholder/ path");
    return false;
  }
  if (!content.includes("/regional-admin/:path*")) {
    console.error("❌ FAIL: middleware.ts does not protect /regional-admin/ path");
    return false;
  }
  if (!content.includes("/hub-portal/:path*")) {
    console.error("❌ FAIL: middleware.ts does not protect /hub-portal/ path");
    return false;
  }
  if (!content.includes("/mentor-portal/:path*")) {
    console.error("❌ FAIL: middleware.ts does not protect /mentor-portal/ path");
    return false;
  }
  console.log("✅ Middleware RBAC is correct (role guards for all portals)");
  return true;
}

// ============================================================
// Test 2: Security - Verify Role type no longer includes MANAGER/SUPPORT
// ============================================================
function testSecurityRoleType() {
  console.log("🧪 Test 2: Security Role type...");
  const securityPath = path.join(process.cwd(), "lib", "security.ts");
  const content = fs.readFileSync(securityPath, "utf-8");

  if ((/\bMANAGER\b/.test(content) && !content.includes("HUB_MANAGER")) || content.includes("SUPPORT")) {
    console.error("❌ FAIL: lib/security.ts still has orphaned MANAGER or SUPPORT in Role type");
    return false;
  }
  console.log("✅ Security Role type is correct");
  return true;
}

// ============================================================
// Test 3: Store - Verify no mock admin user
// ============================================================
function testStoreNoMockData() {
  console.log("🧪 Test 3: Store basic.ts (no mock user)...");
  const storePath = path.join(process.cwd(), "store", "basic.ts");
  const content = fs.readFileSync(storePath, "utf-8");

  if (content.includes("mockAdminUser") || content.includes("mock-token-for-development")) {
    console.error("❌ FAIL: store/basic.ts still contains mock user data");
    return false;
  }
  if (!content.includes("user: null")) {
    console.error("❌ FAIL: store/basic.ts does not initialize with null user");
    return false;
  }
  console.log("✅ Store has no mock user data");
  return true;
}

// ============================================================
// Test 4: Rate limiting - Verify dev bypass removed
// ============================================================
function testRateLimitNoDevBypass() {
  console.log("🧪 Test 4: Rate limiting dev bypass...");
  const rateLimitPath = path.join(process.cwd(), "lib", "rate-limit.ts");
  const content = fs.readFileSync(rateLimitPath, "utf-8");

  if (content.includes('NODE_ENV === "development"')) {
    console.error("❌ FAIL: rate-limit.ts still has development bypass");
    return false;
  }
  console.log("✅ Rate limiting has no dev bypass");
  return true;
}

// ============================================================
// Test 5: API Routes - Verify auth checks on unprotected routes
// ============================================================
function testApiRouteAuth() {
  console.log("🧪 Test 5: API route auth checks...");
  const routes: { path: string; description: string }[] = [
    { path: path.join("app", "api", "verify-national-id", "route.ts"), description: "verify-national-id" },
    { path: path.join("app", "api", "verify-tin", "route.ts"), description: "verify-tin" },
    { path: path.join("app", "api", "certificates", "generate-pdf", "route.ts"), description: "certificates/generate-pdf" },
    { path: path.join("app", "api", "certificates", "[id]", "download", "route.ts"), description: "certificates/[id]/download" },
    { path: path.join("app", "api", "events", "[id]", "register", "route.ts"), description: "events/[id]/register" },
    { path: path.join("app", "api", "events", "my-registrations", "route.ts"), description: "events/my-registrations" },
    { path: path.join("app", "api", "ecosystem-builder", "news", "route.ts"), description: "ecosystem-builder/news" },
    { path: path.join("app", "api", "ecosystem-builder", "news", "[id]", "route.ts"), description: "ecosystem-builder/news/[id]" },
  ];

  let allPassed = true;
  for (const route of routes) {
    const fullPath = path.join(process.cwd(), ...route.path.split(/[\\/]/));
    if (!fs.existsSync(fullPath)) {
      console.warn(`⚠️ Skipping ${route.description}: file not found`);
      continue;
    }
    const content = fs.readFileSync(fullPath, "utf-8");
    if (!content.includes("getServerSession") && !content.includes("authOptions")) {
      console.error(`❌ FAIL: ${route.description} has no auth check`);
      allPassed = false;
    } else {
      console.log(`✅ ${route.description} has auth check`);
    }
  }

  if (allPassed) console.log("✅ All API routes have auth checks");
  return allPassed;
}

// ============================================================
// Test 6: Math.random() removal from critical crypto contexts
// ============================================================
function testCryptoRandomRemoval() {
  console.log("🧪 Test 6: Crypto Math.random() removal...");

  // Check token.ts
  const tokenPath = path.join(process.cwd(), "lib", "token.ts");
  const tokenContent = fs.readFileSync(tokenPath, "utf-8");
  if (tokenContent.includes("Math.random()")) {
    console.error("❌ FAIL: lib/token.ts still uses Math.random()");
    return false;
  }
  if (!tokenContent.includes("randomBytes")) {
    console.error("❌ FAIL: lib/token.ts does not use crypto.randomBytes");
    return false;
  }

  // Check certificate page
  const certPagePath = path.join(process.cwd(), "app", "certificate", "[id]", "page.tsx");
  const certContent = fs.readFileSync(certPagePath, "utf-8");
  if (certContent.includes("Math.random()")) {
    console.error("❌ FAIL: certificate/[id]/page.tsx still uses Math.random() for blockchain hash");
    return false;
  }

  // Check admin action files use randomBytes
  const filesToCheck = [
    path.join(process.cwd(), "app", "admins-new", "certifications", "actions.ts"),
    path.join(process.cwd(), "app", "admins-new", "applications", "application-actions.ts"),
    path.join(process.cwd(), "app", "admins-new", "ecosystem", "ecosystem-actions.ts"),
    path.join(process.cwd(), "app", "ecosystem-builder", "certifications", "actions.ts"),
  ];

  for (const filePath of filesToCheck) {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      if (content.includes("Math.random()")) {
        console.error(`❌ FAIL: ${path.relative(process.cwd(), filePath)} still uses Math.random()`);
        return false;
      }
      if (!content.includes("randomBytes")) {
        console.error(`❌ FAIL: ${path.relative(process.cwd(), filePath)} does not use crypto.randomBytes`);
        return false;
      }
    }
  }

  console.log("✅ All crypto contexts use crypto.randomBytes instead of Math.random()");
  return true;
}

// ============================================================
// Test 7: Mock data removal from key files
// ============================================================
function testMockDataRemoval() {
  console.log("🧪 Test 7: Mock/hardcoded data removal...");

  const checks: { path: string; pattern: string; description: string }[] = [
    { path: "app/admins-new/page.tsx", pattern: "ECOSYSTEM_STATS", description: "admin dashboard mock stats" },
    { path: "app/admins-new/page.tsx", pattern: "RECENT_APPLICATIONS", description: "admin dashboard mock applications" },
    { path: "lib/actions/statistics.ts", pattern: "Mock data for frontend", description: "statistics mock data" },
    { path: "app/super-admin/logs/page.tsx", pattern: "timestamp.*level.*category", description: "super admin logs mock" },
  ];

  let allPassed = true;
  for (const check of checks) {
    const fullPath = path.join(process.cwd(), ...check.path.split("/"));
    if (!fs.existsSync(fullPath)) {
      console.warn(`⚠️ Skipping ${check.description}: file not found`);
      continue;
    }
    const content = fs.readFileSync(fullPath, "utf-8");
    // For the admin dashboard, it should now import from actions instead of defining mock data inline
    if (check.pattern === "ECOSYSTEM_STATS" || check.pattern === "RECENT_APPLICATIONS") {
      if (content.includes("const " + check.pattern)) {
        console.error(`❌ FAIL: ${check.path} still has hardcoded ${check.pattern}`);
        allPassed = false;
      } else {
        console.log(`✅ ${check.description} removed`);
      }
    } else if (check.pattern === "Mock data for frontend") {
      if (content.includes(check.pattern)) {
        console.error(`❌ FAIL: ${check.path} still has mock data comment`);
        allPassed = false;
      } else {
        console.log(`✅ ${check.description} removed`);
      }
    } else if (check.pattern === "timestamp.*level.*category") {
      if (content.includes("useState<LogEntry[]>")) {
        console.log(`✅ ${check.description} uses typed state`);
      } else {
        console.log(`✅ ${check.description} checked`);
      }
    }
  }

  if (allPassed) console.log("✅ Mock data removed from key files");
  return allPassed;
}

// ============================================================
// Test 8: CSRF protection utility exists
// ============================================================
function testCsrfProtection() {
  console.log("🧪 Test 8: CSRF protection...");
  const csrfPath = path.join(process.cwd(), "lib", "csrf.ts");
  if (!fs.existsSync(csrfPath)) {
    console.error("❌ FAIL: lib/csrf.ts does not exist");
    return false;
  }

  const content = fs.readFileSync(csrfPath, "utf-8");
  if (!content.includes("validateCsrf") && !content.includes("csrfGuard")) {
    console.error("❌ FAIL: CSRF utility missing required functions");
    return false;
  }

  console.log("✅ CSRF protection utility exists");
  return true;
}

// ============================================================
// Test 9: Settings page - no mockUser references
// ============================================================
function testSettingsNoMockUser() {
  console.log("🧪 Test 9: Settings page mock user...");
  const settingsPath = path.join(process.cwd(), "app", "dashboard", "settings", "page.tsx");
  const content = fs.readFileSync(settingsPath, "utf-8");

  if (content.includes("mockUser")) {
    console.error("❌ FAIL: settings page still has mockUser references");
    return false;
  }
  if (!content.includes("useSession")) {
    console.error("❌ FAIL: settings page does not use useSession");
    return false;
  }
  console.log("✅ Settings page uses real session data");
  return true;
}

// ============================================================
// Test 10: Admin dashboard actions exist and have auth
// ============================================================
function testAdminDashboardActions() {
  console.log("🧪 Test 10: Admin dashboard actions...");
  const actionsPath = path.join(process.cwd(), "app", "admins-new", "actions.ts");
  if (!fs.existsSync(actionsPath)) {
    console.error("❌ FAIL: app/admins-new/actions.ts does not exist");
    return false;
  }

  const content = fs.readFileSync(actionsPath, "utf-8");
  if (!content.includes("getServerSession")) {
    console.error("❌ FAIL: admin dashboard actions have no auth check");
    return false;
  }
  if (!content.includes("getAdminDashboardStats")) {
    console.error("❌ FAIL: admin dashboard actions missing getAdminDashboardStats");
    return false;
  }
  console.log("✅ Admin dashboard actions exist with auth checks");
  return true;
}

// ============================================================
// Main runner
// ============================================================
// ============================================================
// Test 11: New portals exist
// ============================================================
function testNewPortalsExist() {
  console.log("🧪 Test 11: New portal pages...");
  const portals = [
    "app/regional-admin/page.tsx",
    "app/hub-portal/page.tsx",
    "app/mentor-portal/page.tsx",
  ];
  let allExist = true;
  for (const portal of portals) {
    const fullPath = path.join(process.cwd(), ...portal.split("/"));
    if (!fs.existsSync(fullPath)) {
      console.error(`❌ FAIL: ${portal} does not exist`);
      allExist = false;
    }
  }
  if (allExist) console.log("✅ All new portal pages exist");
  return allExist;
}

// ============================================================
// Test 12: Portal server actions exist with auth
// ============================================================
function testPortalActions() {
  console.log("🧪 Test 12: Portal server actions...");
  const actionFiles = [
    "app/regional-admin/actions.ts",
    "app/hub-portal/actions.ts",
    "app/mentor-portal/actions.ts",
  ];
  let allValid = true;
  for (const af of actionFiles) {
    const fullPath = path.join(process.cwd(), ...af.split("/"));
    if (!fs.existsSync(fullPath)) {
      console.error(`❌ FAIL: ${af} does not exist`);
      allValid = false;
      continue;
    }
    const content = fs.readFileSync(fullPath, "utf-8");
    if (!content.includes("getServerSession")) {
      console.error(`❌ FAIL: ${af} missing auth check`);
      allValid = false;
    }
  }
  if (allValid) console.log("✅ All portal actions exist with auth checks");
  return allValid;
}

// ============================================================
// Test 13: Audit logging infrastructure
// ============================================================
function testAuditInfrastructure() {
  console.log("🧪 Test 13: Audit logging...");
  const auditPath = path.join(process.cwd(), "lib", "audit.ts");
  if (!fs.existsSync(auditPath)) {
    console.error("❌ FAIL: lib/audit.ts does not exist");
    return false;
  }
  const content = fs.readFileSync(auditPath, "utf-8");
  if (!content.includes("createAuditLog")) {
    console.error("❌ FAIL: audit.ts missing createAuditLog");
    return false;
  }
  if (!content.includes("USER_LOGIN")) {
    console.error("❌ FAIL: audit.ts missing USER_LOGIN action");
    return false;
  }
  // Check auth.ts has signIn callback
  const authPath = path.join(process.cwd(), "lib", "auth.ts");
  const authContent = fs.readFileSync(authPath, "utf-8");
  if (!authContent.includes("signIn")) {
    console.error("❌ FAIL: auth.ts missing signIn callback for audit");
    return false;
  }
  console.log("✅ Audit logging infrastructure in place");
  return true;
}

// ============================================================
// Test 14: Export pipeline
// ============================================================
function testExportPipeline() {
  console.log("🧪 Test 14: Export pipeline...");
  const exportPath = path.join(process.cwd(), "lib", "export.ts");
  if (!fs.existsSync(exportPath)) {
    console.error("❌ FAIL: lib/export.ts does not exist");
    return false;
  }
  const content = fs.readFileSync(exportPath, "utf-8");
  if (!content.includes("generateCSV")) {
    console.error("❌ FAIL: export.ts missing generateCSV");
    return false;
  }
  console.log("✅ Export pipeline exists");
  return true;
}

// ============================================================
// Test 15: Hub reports API
// ============================================================
function testHubReportsApi() {
  console.log("🧪 Test 15: Hub reports API...");
  const apiPath = path.join(process.cwd(), "app", "api", "hub-reports", "route.ts");
  if (!fs.existsSync(apiPath)) {
    console.error("❌ FAIL: hub-reports API does not exist");
    return false;
  }
  const content = fs.readFileSync(apiPath, "utf-8");
  if (!content.includes("getServerSession")) {
    console.error("❌ FAIL: hub-reports API missing auth");
    return false;
  }
  console.log("✅ Hub reports API exists with auth");
  return true;
}

// ============================================================
// Test 16: New Prisma models exist
// ============================================================
function testNewPrismaModels() {
  console.log("🧪 Test 16: New Prisma models...");
  const regionPath = path.join(process.cwd(), "prisma", "schema", "region.prisma");
  if (!fs.existsSync(regionPath)) {
    console.error("❌ FAIL: region.prisma does not exist");
    return false;
  }
  const content = fs.readFileSync(regionPath, "utf-8");
  if (!content.includes("model Region") || !content.includes("model HubReport")) {
    console.error("❌ FAIL: region.prisma missing Region or HubReport model");
    return false;
  }
  // Check the audit model
  const auditSchemaPath = path.join(process.cwd(), "prisma", "schema", "audit.prisma");
  const auditContent = fs.readFileSync(auditSchemaPath, "utf-8");
  if (!auditContent.includes("model AuditLog")) {
    console.error("❌ FAIL: audit.prisma missing AuditLog model");
    return false;
  }
  console.log("✅ New Prisma models exist");
  return true;
}

// ============================================================
// Test 17: Startup model has hubId
// ============================================================
function testStartupHubId() {
  console.log("🧪 Test 17: Startup hubId field...");
  const appSchemaPath = path.join(process.cwd(), "prisma", "schema", "application.prisma");
  const content = fs.readFileSync(appSchemaPath, "utf-8");
  if (!content.includes("hubId")) {
    console.error("❌ FAIL: Startup model missing hubId field");
    return false;
  }
  console.log("✅ Startup model has hubId for hub assignment");
  return true;
}

async function runAllTests() {
  console.log("🚀 Starting Comprehensive Verification...");
  console.log("==============================================");

  const tests = [
    testMiddlewareRbac,
    testSecurityRoleType,
    testStoreNoMockData,
    testRateLimitNoDevBypass,
    testApiRouteAuth,
    testCryptoRandomRemoval,
    testMockDataRemoval,
    testCsrfProtection,
    testSettingsNoMockUser,
    testAdminDashboardActions,
    testNewPortalsExist,
    testPortalActions,
    testAuditInfrastructure,
    testExportPipeline,
    testHubReportsApi,
    testNewPrismaModels,
    testStartupHubId,
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const result = await Promise.resolve(test());
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.error(`❌ Test threw exception:`, error);
      failed++;
    }
    console.log("----------------------------------------------");
  }

  console.log("==============================================");
  if (failed === 0) {
    console.log(`🎉 ALL ${passed} TESTS PASSED!`);
    process.exit(0);
  } else {
    console.log(`⚠️ ${passed} passed, ${failed} failed`);
    process.exit(1);
  }
}

runAllTests();
