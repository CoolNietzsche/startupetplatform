import db from "@/lib/db";

/**
 * Basic Database-backed Rate Limiter
 * Used to protect sensitive endpoints from brute-force and DoS.
 */
export async function rateLimit(key: string, limit: number, windowSeconds: number) {
  const now = new Date();
  const expireAt = new Date(now.getTime() + windowSeconds * 1000);

  try {
    // 1. Clean up expired records occasionally (simple cleanup strategy)
    // In a real high-traffic app, this would be a cron job.
    if (Math.random() < 0.1) {
       await db.rateLimit.deleteMany({
         where: { expireAt: { lt: now } }
       });
    }

    // 2. Fetch or create the rate limit record
    const record = await db.rateLimit.upsert({
      where: { key },
      create: {
        key,
        points: 1,
        expireAt,
      },
      update: {
        points: { increment: 1 },
      },
    });

    // 3. Check if expired
    if (record.expireAt < now) {
      // Reset if expired
      await db.rateLimit.update({
        where: { id: record.id },
        data: {
          points: 1,
          expireAt,
          updatedAt: now,
        },
      });
      return { success: true, remaining: limit - 1 };
    }

    const remaining = limit - record.points;
    if (remaining < 0) {
      return { success: false, remaining: 0 };
    }

    return { success: true, remaining };
  } catch (error) {
    console.error("[RateLimit] Error:", error);
    // Fail open in case of DB issues to avoid blocking legitimate users completely
    return { success: true, remaining: 1 };
  }
}
