import { Pool } from "pg";
import "dotenv/config";
import * as fs from "fs";
import * as path from "path";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  console.log("Seeding demo data...\n");

  // ── 1. Directive Libraries ──
  console.log("1. Verifying directive libraries exist...");
  const directiveDir = path.join(process.cwd(), "lib/directive");
  const files = fs.readdirSync(directiveDir).sort();
  console.log(`   ${files.length} directive libraries found: ${files.join(", ")}`);

  // ── 2. Check database connection ──
  console.log("\n2. Checking database connection...");
  const result = await pool.query("SELECT NOW() AS current_time");
  console.log(`   Connected. Server time: ${result.rows[0].current_time}`);

  // ── 3. Verify directive tables exist ──
  console.log("\n3. Verifying directive tables...");
  const tables = ["CallForApplication", "Inspection", "InspectionFinding", "DirectiveAppeal", "TransitionalProvision", "SurrenderRequest"];
  for (const table of tables) {
    const exists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'directive' AND table_name = $1
      )
    `, [table]);
    console.log(`   ${exists.rows[0].exists ? "✅" : "❌"} directive.${table}`);
  }

  // ── 4. Seed sample appeals ──
  console.log("\n4. Seeding sample appeals...");
  const sampleAppeals = [
    { entity_id: "sample-app-001", entity_type: "startup", grounds: "PROCEDURAL_ERROR", description: "Committee did not allow sufficient time for evidence presentation" },
    { entity_id: "sample-app-002", entity_type: "ecosystem", grounds: "MISAPPLICATION", description: "Scoring criteria were applied inconsistently across committee members" },
    { entity_id: "sample-app-003", entity_type: "startup", grounds: "NEW_EVIDENCE", description: "New financial statements show improved compliance" },
  ];
  for (const appeal of sampleAppeals) {
    await pool.query(
      `INSERT INTO "directive"."DirectiveAppeal" (entity_id, entity_type, grounds, description, status, filed_at, appeal_deadline)
       VALUES ($1, $2, $3, $4, 'PENDING', NOW(), NOW() + INTERVAL '30 days')
       ON CONFLICT DO NOTHING`,
      [appeal.entity_id, appeal.entity_type, appeal.grounds, appeal.description]
    );
  }
  console.log(`   Seeded ${sampleAppeals.length} sample appeals`);

  // ── 5. Seed sample inspection ──
  console.log("\n5. Seeding sample inspections...");
  const inspectionResult = await pool.query(
    `INSERT INTO "directive"."Inspection" (entity_id, entity_type, scheduled_at, status, inspector_id)
     VALUES ('sample-entity-001', 'startup', NOW() + INTERVAL '30 days', 'SCHEDULED', 'seed-system')
     ON CONFLICT DO NOTHING RETURNING id`
  );
  if (inspectionResult.rows.length > 0) {
    const inspectionId = inspectionResult.rows[0].id;
    await pool.query(
      `INSERT INTO "directive"."InspectionFinding" (inspection_id, description, severity, status, directive_ref)
       VALUES ($1, 'Missing quarterly report for Q2', 'MAJOR', 'OPEN', 'Art. 19.5')`,
      [inspectionId]
    );
    await pool.query(
      `INSERT INTO "directive"."InspectionFinding" (inspection_id, description, severity, status, directive_ref)
       VALUES ($1, 'Incubation records need updating', 'MINOR', 'OPEN', 'Art. 20.5')`,
      [inspectionId]
    );
    console.log(`   Seeded inspection with 2 findings`);
  }

  // ── 6. Seed sample transitional provisions ──
  console.log("\n6. Seeding sample transitional provisions...");
  await pool.query(
    `INSERT INTO "directive"."TransitionalProvision" (entity_id, entity_type, previous_designation, new_designation, transition_deadline, status)
     VALUES ('sample-trans-001', 'startup', 'LEGACY_STARTUP', 'INITIAL', NOW() + INTERVAL '180 days', 'ACTIVE')
     ON CONFLICT DO NOTHING`
  );
  console.log(`   Seeded 1 transitional provision`);

  // ── 7. Verify test files ──
  console.log("\n7. Verifying test files...");
  const testDir = path.join(process.cwd(), "tests");
  if (fs.existsSync(testDir)) {
    const testFiles = fs.readdirSync(testDir).filter(f => f.endsWith(".ts"));
    console.log(`   ${testFiles.length} test files: ${testFiles.join(", ")}`);
  }

  console.log("\n✅ Seed complete. Demo data ready.\n");
  await pool.end();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
