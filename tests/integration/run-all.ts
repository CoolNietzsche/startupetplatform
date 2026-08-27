import db from "@/lib/db";
import bcrypt from "bcryptjs";
import { v4 as uuid } from "uuid";

let passed = 0;
let failed = 0;
let testId = 0;

function assert(condition: boolean, msg: string) {
  testId++;
  if (condition) { passed++; console.log(`  ✅ [${testId}] ${msg}`); }
  else { failed++; console.error(`  ❌ [${testId}] FAIL: ${msg}`); }
}

async function main() {
  console.log("\n═══════════════════════════════════════════");
  console.log("  NSLP INTEGRATION TESTS (REAL DATABASE)");
  console.log("═══════════════════════════════════════════\n");

  // ── 1. CREATE TEST DATA ──
  console.log("--- Setup: Creating test data ---");
  const userId = `test-user-${uuid().slice(0,8)}`;
  const user = await db.user.create({
    data: { id: userId, email: `${userId}@test.com`, firstName: "Test", lastName: "User", password: await bcrypt.hash("Test123!", 10), role: "HUB_MANAGER" },
  });
  assert(!!user.id, "User created");

  const region = await db.region.create({ data: { name: `TestRegion-${uuid().slice(0,4)}`, code: `TR${uuid().slice(0,4)}` } });
  assert(!!region.id, "Region created");

  const hub = await db.hub.create({ data: { name: `TestHub-${uuid().slice(0,4)}`, region: region.code } });
  assert(!!hub.id, "Hub created");

  const startupUser = await db.user.create({
    data: { id: `test-startup-user-${uuid().slice(0,4)}`, email: `startup${uuid().slice(0,4)}@test.com`, firstName: "Startup", lastName: "Owner", password: await bcrypt.hash("Test123!", 10), role: "USER" },
  });
  assert(!!startupUser.id, "Startup user created");

  const app = await db.application.create({
    data: { userId: startupUser.id, startupName: "TestStartup", status: "CERTIFIED", industry: "Tech", productDescription: "A test startup" },
  });
  assert(!!app.id, "Application created");

  const certPre = await db.certificate.create({
    data: { type: "STARTUP", filePath: "/certs/pre.pdf", certificateNumber: `CERT-PRE-${uuid().slice(0,4)}`, applicationId: app.id, status: "ACTIVE", expiresAt: new Date(Date.now() + 365 * 86400000) },
  });
  assert(!!certPre.id, "Pre-certificate created");

  const startup = await db.startup.create({
    data: { id: `test-startup-${uuid().slice(0,4)}`, name: "TestStartup", applicationId: app.id, userId: startupUser.id, level: "PRE_CERTIFIED", certificateId: certPre.id, hubId: hub.id, sector: "Tech", region: region.code },
  });
  assert(!!startup.id, "Startup created");

  const mentorUser = await db.user.create({
    data: { id: `test-mentor-${uuid().slice(0,4)}`, email: `mentor${uuid().slice(0,4)}@test.com`, firstName: "Mentor", lastName: "Test", password: await bcrypt.hash("Test123!", 10), role: "MENTOR" },
  });
  await db.hub.update({ where: { id: hub.id }, data: { members: { connect: [{ id: mentorUser.id }] } } });
  assert(!!mentorUser.id, "Mentor user created");

  // ── 2. TEST MODULES ──
  console.log("\n--- Hub Portal: Incubation Program ---");
  const program = await db.incubationProgram.create({
    data: { hubId: hub.id, name: "Test Program", capacity: 20, assignedTrainer: "Trainer A" },
  });
  assert(!!program.id, "IncubationProgram created");
  assert(program.capacity === 20, "Program has capacity");
  assert(program.assignedTrainer === "Trainer A", "Program has assignedTrainer");

  console.log("\n--- Hub Portal: Enroll Startup ---");
  const progress = await db.incubationProgress.create({
    data: { programId: program.id, startupId: startup.id, stage: "ONBOARDING", progress: 0 },
  });
  assert(!!progress.id, "IncubationProgress created");
  assert(progress.stage === "ONBOARDING", "Progress stage is ONBOARDING");

  console.log("\n--- Mentor Portal: Session Logging ---");
  const sessionLog = await db.mentorSession.create({
    data: { mentorId: mentorUser.id, startupId: startup.id, date: new Date(), duration: 60, topicsCovered: "Business Model", outcomes: "Identified key metrics" },
  });
  assert(!!sessionLog.id, "MentorSession created");
  assert(sessionLog.duration === 60, "Session duration logged");
  assert(sessionLog.topicsCovered === "Business Model", "Topics covered logged");

  console.log("\n--- Auth Hardening: Login Attempts ---");
  await db.user.update({ where: { id: userId }, data: { loginAttempts: 3 } });
  const u1 = await db.user.findUnique({ where: { id: userId } });
  assert(u1?.loginAttempts === 3, "loginAttempts incremented");

  await db.user.update({ where: { id: userId }, data: { loginAttempts: 5, lockedUntil: new Date(Date.now() + 30 * 60 * 1000) } });
  const u2 = await db.user.findUnique({ where: { id: userId } });
  assert(u2?.lockedUntil !== null, "lockedUntil set after 5 attempts");

  console.log("\n--- Auth Hardening: Password History ---");
  const pwHash = await bcrypt.hash("OldPass123!", 10);
  const pwHist = await db.passwordHistory.create({ data: { userId, password: pwHash } });
  assert(!!pwHist.id, "PasswordHistory created");

  console.log("\n--- Auth Hardening: Email Change Request ---");
  const ecr = await db.emailChangeRequest.create({
    data: { userId, newEmail: "new@test.com", token: uuid(), expiresAt: new Date(Date.now() + 86400000) },
  });
  assert(!!ecr.id, "EmailChangeRequest created");
  assert(ecr.status === "PENDING", "EmailChangeRequest status is PENDING");

  console.log("\n--- Auth Hardening: User Session ---");
  const sess = await db.userSession.create({
    data: { userId, token: uuid(), userAgent: "test-agent", ipAddress: "127.0.0.1" },
  });
  assert(!!sess.id, "UserSession created");

  // ── 3. ASSET REGISTER ──
  console.log("\n--- Asset Register ---");
  const asset = await db.asset.create({
    data: { hubId: hub.id, name: "Laptop", type: "Equipment", quantity: 5, status: "AVAILABLE" },
  });
  assert(!!asset.id, "Asset created");
  assert(asset.status === "AVAILABLE", "Asset status AVAILABLE");

  const booking = await db.assetBooking.create({
    data: { assetId: asset.id, startupId: startup.id, startDate: new Date(), endDate: new Date(Date.now() + 86400000), status: "PENDING" },
  });
  assert(!!booking.id, "AssetBooking created");

  await db.assetBooking.update({ where: { id: booking.id }, data: { status: "APPROVED" } });
  const b2 = await db.assetBooking.findUnique({ where: { id: booking.id } });
  assert(b2?.status === "APPROVED", "Booking approved");

  // ── 4. MENTOR MATCHING ──
  console.log("\n--- Mentor Matching ---");
  const matchReq = await db.mentorMatchRequest.create({
    data: { startupId: startup.id, mentorId: mentorUser.id, message: "Please mentor us" },
  });
  assert(!!matchReq.id, "MentorMatchRequest created");
  assert(matchReq.status === "PENDING", "Match request status PENDING");

  await db.mentorMatchRequest.update({ where: { id: matchReq.id }, data: { status: "ACCEPTED" } });
  const m2 = await db.mentorMatchRequest.findUnique({ where: { id: matchReq.id } });
  assert(m2?.status === "ACCEPTED", "Match request accepted");

  // ── 5. APPEAL ──
  console.log("\n--- Appeal ---");
  const appeal = await db.appeal.create({
    data: { applicationId: app.id, reason: "Incorrect evaluation", details: "Our application meets all criteria" },
  });
  assert(!!appeal.id, "Appeal created");
  assert(appeal.status === "PENDING", "Appeal status PENDING");

  await db.appeal.update({ where: { id: appeal.id }, data: { status: "APPROVED", response: "Re-evaluation shows you qualify", respondedById: userId } });
  const a2 = await db.appeal.findUnique({ where: { id: appeal.id } });
  assert(a2?.status === "APPROVED", "Appeal approved");
  assert(a2?.respondedById === userId, "Appeal responded by correct user");

  // ── 6. CERTIFICATE + EXPIRY ──
  console.log("\n--- Certificate & Expiry ---");
  const app2 = await db.application.create({
    data: { userId: startupUser.id, startupName: "TestStartup2", status: "CERTIFIED", industry: "Tech" },
  });
  const cert = await db.certificate.create({
    data: { type: "STARTUP", filePath: "/certs/test.pdf", certificateNumber: `CERT-${uuid().slice(0,8)}`, applicationId: app2.id, status: "ACTIVE", expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
  });
  assert(!!cert.id, "Certificate created");
  assert(cert.expiresAt !== null, "Certificate has expiresAt");

  const cert2 = await db.certificate.create({
    data: { type: "STARTUP", filePath: "/certs/expired.pdf", certificateNumber: `CERT-EXP-${uuid().slice(0,4)}`, status: "ACTIVE", expiresAt: new Date(Date.now() - 1000) },
  });
  assert(!!cert2.id, "Expired certificate created");

  // ── 7. NOTIFICATION TEMPLATES ──
  console.log("\n--- Notification Templates ---");
  const tmpl = await db.notificationTemplate.create({
    data: { code: "WELCOME", name: "Welcome Email", subject: "Welcome {{name}}!", body: "Hello {{name}}, welcome to {{platform}}." },
  });
  assert(!!tmpl.id, "NotificationTemplate created");
  assert(tmpl.code === "WELCOME", "Template code set");

  // ── 8. EXPORT LOG ──
  console.log("\n--- Export Log ---");
  const exportLog = await db.exportLog.create({
    data: { userId, format: "PDF", filters: { timeRange: "2026" }, recordCount: 10 },
  });
  assert(!!exportLog.id, "ExportLog created");
  assert(exportLog.format === "PDF", "Export format logged");

  // ── 9. AUDIT LOG ──
  console.log("\n--- Audit Log (retention) ---");
  const audit = await db.auditLog.create({
    data: { userId, email: user.email, action: "TEST_INTEGRATION", resource: "test", retentionUntil: new Date(Date.now() + 365 * 5 * 24 * 60 * 60 * 1000) },
  });
  assert(!!audit.id, "AuditLog created");
  assert(audit.retentionUntil !== null, "AuditLog has retentionUntil");

  // ── 10. CLEANUP ──
  console.log("\n--- Cleanup: Removing test data ---");
  const models = [
    [sessionLog.id, "mentorSession"], [progress.id, "incubationProgress"], [program.id, "incubationProgram"],
    [booking.id, "assetBooking"], [asset.id, "asset"], [matchReq.id, "mentorMatchRequest"],
    [appeal.id, "appeal"], [cert.id, "certificate"], [cert2.id, "certificate"], [certPre.id, "certificate"],
    [tmpl.id, "notificationTemplate"], [exportLog.id, "exportLog"], [audit.id, "auditLog"],
    [startup.id, "startup"], [sess.id, "userSession"], [pwHist.id, "passwordHistory"], [ecr.id, "emailChangeRequest"],
    [app2.id, "application"], [app.id, "application"], [hub.id, "hub"], [region.id, "region"],
    [mentorUser.id, "user"], [startupUser.id, "user"], [user.id, "user"],
  ];
  for (const [id, model] of models) {
    try { await (db as any)[model].delete({ where: { id } }); } catch {}
  }
  console.log(`  Cleaned up ${models.length} records`);

  // ── RESULTS ──
  console.log(`\n═══════════════════════════════════════════`);
  console.log(`  RESULTS: ${passed} passed, ${failed} failed`);
  console.log(`═══════════════════════════════════════════\n`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(e => { console.error("FATAL:", e); process.exit(1); });
