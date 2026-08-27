import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  const client = await pool.connect();
  try {
    // Add directiveStage to application table
    await client.query(`
      ALTER TABLE application."Application"
      ADD COLUMN IF NOT EXISTS "directiveStage" TEXT;
    `);
    console.log("✅ Added directiveStage to Application");

    // Add directiveStage to startup table
    await client.query(`
      ALTER TABLE application."Startup"
      ADD COLUMN IF NOT EXISTS "directiveStage" TEXT;
    `);
    console.log("✅ Added directiveStage to Startup");

    console.log("\n✅ Stage migration complete");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
