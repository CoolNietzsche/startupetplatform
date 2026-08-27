import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

/**
 * Certificate Expiry Checker
 * Checks all certificates approaching expiry and marks expired ones.
 * Run via: npx tsx --env-file=.env scripts/check-certificate-expiry.ts
 */
async function getAdminUserIds(): Promise<string[]> {
  try {
    const result = await pool.query(`SELECT id FROM "user"."User" WHERE role IN ('ADMIN', 'SUPER_ADMIN')`);
    return result.rows.map((r: any) => r.id);
  } catch { return []; }
}

async function notifyAdmins(title: string, message: string) {
  const adminIds = await getAdminUserIds();
  if (adminIds.length === 0) {
    console.warn("   ⚠️  No admin users found, skipping notification");
    return;
  }
  for (const userId of adminIds) {
    try {
      await pool.query(
        `INSERT INTO "notification"."Notification" (user_id, title, message, type, link)
         VALUES ($1, $2, $3, 'warning', '/admins-new/certifications')`,
        [userId, title, message]
      );
    } catch (err) {
      console.error(`   ❌ Failed to notify admin ${userId}:`, err);
    }
  }
}

async function main() {
  console.log("Checking certificate expiry...\n");

  // Find certificates expiring within the next 90 days (renewal window)
  const expiringSoon = await pool.query(`
    SELECT c.id, c.status, c.issued_at, c.expires_at, c.startup_id, c.eco_application_id,
           COALESCE(s.name, e.name) AS entity_name
    FROM "certificate"."Certificate" c
    LEFT JOIN "application"."Startup" s ON s.certificate_id = c.id
    LEFT JOIN "ecosystem"."EcoApplication" e ON e.id = c.eco_application_id
    WHERE c.status = 'ACTIVE'
      AND c.expires_at IS NOT NULL
      AND c.expires_at <= NOW() + INTERVAL '90 days'
    ORDER BY c.expires_at ASC
  `);

  if (expiringSoon.rows.length === 0) {
    console.log("No certificates expiring within 90 days.");
  } else {
    console.log(`Found ${expiringSoon.rows.length} certificate(s) expiring within 90 days:\n`);
    for (const cert of expiringSoon.rows) {
      const daysLeft = Math.ceil((new Date(cert.expires_at).getTime() - Date.now()) / 86400000);
      console.log(`  - ${cert.entity_name} (${cert.id.slice(0, 8)}...): expires ${new Date(cert.expires_at).toLocaleDateString()} (${daysLeft} days)`);
      await notifyAdmins("Certificate Expiring Soon", `Certificate for ${cert.entity_name} expires in ${daysLeft} days. Renew within the 90-day window (Art. 10).`);
    }
  }

  // Mark expired certificates
  const expired = await pool.query(`
    UPDATE "certificate"."Certificate"
    SET status = 'EXPIRED', updated_at = NOW()
    WHERE status = 'ACTIVE'
      AND expires_at IS NOT NULL
      AND expires_at < NOW()
    RETURNING id
  `);

  if (expired.rows.length > 0) {
    console.log(`\n✅ Marked ${expired.rows.length} certificate(s) as EXPIRED.`);
    for (const cert of expired.rows) {
      await notifyAdmins("Certificate Expired", `A certificate has expired and been marked EXPIRED.`);
    }
  } else {
    console.log("\nNo expired certificates to update.");
  }

  // Count active vs expired
  const counts = await pool.query(`
    SELECT status, COUNT(*)::int AS count
    FROM "certificate"."Certificate"
    GROUP BY status
    ORDER BY status
  `);

  console.log("\nCertificate status summary:");
  for (const row of counts.rows) {
    console.log(`  ${row.status}: ${row.count}`);
  }

  await pool.end();
}

main().catch((err) => {
  console.error("Error checking certificates:", err);
  process.exit(1);
});
