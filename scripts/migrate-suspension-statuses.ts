import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  const client = await pool.connect();
  try {
    // Add SUSPENDED and REVOKED to ApplicationStatus enum
    await client.query(`
      ALTER TYPE "application"."ApplicationStatus" ADD VALUE IF NOT EXISTS 'SUSPENDED';
    `);
    console.log("✅ Added SUSPENDED to ApplicationStatus");
    await client.query(`
      ALTER TYPE "application"."ApplicationStatus" ADD VALUE IF NOT EXISTS 'REVOKED';
    `);
    console.log("✅ Added REVOKED to ApplicationStatus");

    // Add SUSPENDED and REVOKED to EcoApplicationStatus enum
    await client.query(`
      ALTER TYPE "ecosystem"."EcoApplicationStatus" ADD VALUE IF NOT EXISTS 'SUSPENDED';
    `);
    console.log("✅ Added SUSPENDED to EcoApplicationStatus");
    await client.query(`
      ALTER TYPE "ecosystem"."EcoApplicationStatus" ADD VALUE IF NOT EXISTS 'REVOKED';
    `);
    console.log("✅ Added REVOKED to EcoApplicationStatus");

    console.log("\n✅ Suspension status migration complete");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
