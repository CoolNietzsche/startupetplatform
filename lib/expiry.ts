import db from "@/lib/db";
import { createAuditLog } from "@/lib/audit";
import { createNotification } from "@/lib/notifications";

export async function checkExpiredCertificates() {
  const now = new Date();

  const expired = await db.certificate.findMany({
    where: { status: "ACTIVE", expiresAt: { lte: now } },
    include: { startup: true },
  });

  for (const cert of expired) {
    await db.certificate.update({ where: { id: cert.id }, data: { status: "EXPIRED" } });
    await createAuditLog({ action: "CERTIFICATE_REVOKED", resource: cert.id, details: { reason: "expired", expiredAt: cert.expiresAt?.toISOString() } });

    if (cert.startup?.userId) {
      await createNotification({
        userId: cert.startup.userId,
        type: "warning",
        title: "Designation Expired",
        message: `Your startup designation (${cert.certificateNumber || cert.id}) has expired. Please renew to maintain your status.`,
        sendAsEmail: true,
      });
    }
  }

  return { expiredCount: expired.length };
}

export async function checkUpcomingExpirations() {
  const now = new Date();
  const in90Days = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
  const in60Days = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const windows = [
    { days: 90, deadline: in90Days },
    { days: 60, deadline: in60Days },
    { days: 30, deadline: in30Days },
  ];

  const results: { days: number; notified: number }[] = [];

  for (const w of windows) {
    const certs = await db.certificate.findMany({
      where: { status: "ACTIVE", expiresAt: { lte: w.deadline, gt: now } },
      include: { startup: true },
    });

    for (const cert of certs) {
      if (cert.startup?.userId) {
        await createNotification({
          userId: cert.startup.userId,
          type: "warning",
          title: `Designation Expiring in ${w.days} Days`,
          message: `Your startup designation (${cert.certificateNumber || cert.id}) will expire on ${cert.expiresAt?.toISOString().split("T")[0]}. Please renew before expiry.`,
          sendAsEmail: true,
        });
      }
    }

    results.push({ days: w.days, notified: certs.length });
  }

  return results;
}
