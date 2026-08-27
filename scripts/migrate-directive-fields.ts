import { Pool } from "pg";
import "dotenv/config";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const pool = new Pool({ connectionString });
  const client = await pool.connect();

  try {
    console.log("Running migration...");

    await client.query(`
      ALTER TABLE committee."Committee" 
      ADD COLUMN IF NOT EXISTS "passThreshold" INTEGER,
      ADD COLUMN IF NOT EXISTS "directivePreset" TEXT;
    `);
    console.log('✓ Added columns to committee."Committee"');

    await client.query(`
      ALTER TABLE committee."CommitteeCriterion"
      ADD COLUMN IF NOT EXISTS "directivePreset" TEXT,
      ADD COLUMN IF NOT EXISTS "directiveRef" TEXT;
    `);
    console.log('✓ Added columns to committee."CommitteeCriterion"');

    console.log("Migration completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
