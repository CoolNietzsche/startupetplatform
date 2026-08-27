import { Pool } from "pg";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

async function main() {
  const pool = new Pool({ connectionString });
  const client = await pool.connect();

  try {
    console.log("Migrating directive tables...");

    // Create schema
    await client.query(`CREATE SCHEMA IF NOT EXISTS "directive"`);
    console.log("  ✅ Schema 'directive' created");

    // CallForApplication
    await client.query(`
      CREATE TABLE IF NOT EXISTS "directive"."CallForApplication" (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        title TEXT NOT NULL,
        description TEXT,
        target_type TEXT DEFAULT 'both',
        status TEXT DEFAULT 'DRAFT',
        opens_at TIMESTAMP NOT NULL,
        closes_at TIMESTAMP NOT NULL,
        max_applications INTEGER,
        requirements JSONB,
        issued_by_id TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log("  ✅ CallForApplication");

    // Inspection
    await client.query(`
      CREATE TABLE IF NOT EXISTS "directive"."Inspection" (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        entity_id TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        scheduled_at TIMESTAMP NOT NULL,
        completed_at TIMESTAMP,
        status TEXT DEFAULT 'SCHEDULED',
        inspector_id TEXT NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log("  ✅ Inspection");

    // InspectionFinding
    await client.query(`
      CREATE TABLE IF NOT EXISTS "directive"."InspectionFinding" (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        inspection_id TEXT NOT NULL,
        description TEXT NOT NULL,
        severity TEXT DEFAULT 'MINOR',
        status TEXT DEFAULT 'OPEN',
        directive_ref TEXT,
        corrective_action TEXT,
        due_date TIMESTAMP,
        closed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log("  ✅ InspectionFinding");

    // Appeal
    await client.query(`
      CREATE TABLE IF NOT EXISTS "directive"."DirectiveAppeal" (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        entity_id TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        decision_id TEXT,
        grounds TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'PENDING',
        filed_at TIMESTAMP DEFAULT NOW(),
        appeal_deadline TIMESTAMP,
        decided_at TIMESTAMP,
        decided_by_id TEXT,
        decision_reason TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log("  ✅ DirectiveAppeal");

    // TransitionalProvision
    await client.query(`
      CREATE TABLE IF NOT EXISTS "directive"."TransitionalProvision" (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        entity_id TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        previous_designation TEXT NOT NULL,
        new_designation TEXT NOT NULL,
        transition_deadline TIMESTAMP NOT NULL,
        status TEXT DEFAULT 'ACTIVE',
        converted_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log("  ✅ TransitionalProvision");

    // SurrenderRequest
    await client.query(`
      CREATE TABLE IF NOT EXISTS "directive"."SurrenderRequest" (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        entity_id TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        reason TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'DRAFT',
        submitted_at TIMESTAMP DEFAULT NOW(),
        decided_at TIMESTAMP,
        certificate_revoked_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log("  ✅ SurrenderRequest");

    // Indexes
    await client.query(`CREATE INDEX IF NOT EXISTS idx_call_status ON "directive"."CallForApplication"(status)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_inspection_entity ON "directive"."Inspection"(entity_id, entity_type)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_finding_inspection ON "directive"."InspectionFinding"(inspection_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_appeal_entity ON "directive"."DirectiveAppeal"(entity_id, entity_type)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_appeal_status ON "directive"."DirectiveAppeal"(status)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_transition_entity ON "directive"."TransitionalProvision"(entity_id, entity_type)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_surrender_entity ON "directive"."SurrenderRequest"(entity_id, entity_type)`);
    console.log("  ✅ Indexes created");

    console.log("\nMigration complete: all directive tables created.");
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
