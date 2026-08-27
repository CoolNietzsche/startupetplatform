import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  const client = await pool.connect();
  try {
    // Add columns to application table (startup)
    await client.query(`
      ALTER TABLE application."Application"
      ADD COLUMN IF NOT EXISTS "documentVerification" JSONB,
      ADD COLUMN IF NOT EXISTS "preAssessedAt" TIMESTAMP,
      ADD COLUMN IF NOT EXISTS "preAssessedById" TEXT;
    `);
    console.log("✅ Added documentVerification, preAssessedAt, preAssessedById to Application");

    // Add columns to eco application table
    await client.query(`
      ALTER TABLE ecosystem."EcoApplication"
      ADD COLUMN IF NOT EXISTS "documentVerification" JSONB,
      ADD COLUMN IF NOT EXISTS "preAssessedAt" TIMESTAMP,
      ADD COLUMN IF NOT EXISTS "preAssessedById" TEXT;
    `);
    console.log("✅ Added documentVerification, preAssessedAt, preAssessedById to EcoApplication");

    console.log("\n✅ Pre-assessment migration complete");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
