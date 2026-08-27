import * as fs from "fs";
import * as path from "path";

async function testSecurityUtilities() {
  console.log("Testing Security Utility Imports...");
  try {
    const security = await import("../lib/security");
    if (security.ensureAuthenticated && security.ensureAdmin && security.ensureRole) {
      console.log("Security utilities (Auth, Admin, Role) are properly exported.");
      return true;
    } else {
      throw new Error("Missing security exports");
    }
  } catch (error) {
    console.error("Security Utility Test FAILED:", error);
    return false;
  }
}

async function runTests() {
  console.log("Starting Automated Security Verification...");
  console.log("----------------------------------------------");

  const securityStatus = await testSecurityUtilities();

  console.log("----------------------------------------------");
  if (securityStatus) {
    console.log("ALL TESTS PASSED!");
    process.exit(0);
  } else {
    console.log("SOME TESTS FAILED. Please review the logs.");
    process.exit(1);
  }
}

runTests();
