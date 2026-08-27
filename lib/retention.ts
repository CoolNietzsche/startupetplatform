import db from "@/lib/db";
import { checkExpiredCertificates } from "@/lib/expiry";

export async function enforceRetentionPolicy() {
  const fiveYearsAgo = new Date();
  fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);

  const result = await db.auditLog.updateMany({
    where: {
      createdAt: { lt: fiveYearsAgo },
      retentionUntil: null,
    },
    data: {
      retentionUntil: fiveYearsAgo,
    },
  });

  return { markedCount: result.count };
}

export async function runDailyMaintenance() {
  const results: Record<string, any> = {};

  try {
    const retention = await enforceRetentionPolicy();
    results.retention = retention;
  } catch (error) {
    results.retention = { error: String(error) };
  }

  try {
    const expired = await checkExpiredCertificates();
    results.expiredCertificates = expired;
  } catch (error) {
    results.expiredCertificates = { error: String(error) };
  }

  return results;
}
