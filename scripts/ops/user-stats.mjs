// Usage: node user-stats.mjs
// Quick headcount: totals, suspended/unverified counts, breakdown by role.
import { prisma } from "./_db.mjs";

const [byRole, total, suspended, unverified] = await Promise.all([
  prisma.user.groupBy({ by: ["role"], _count: true }),
  prisma.user.count(),
  prisma.user.count({ where: { isSuspended: true } }),
  prisma.user.count({ where: { emailVerified: false } }),
]);

console.log(`Total users: ${total}`);
console.log(`Suspended:   ${suspended}`);
console.log(`Unverified:  ${unverified}\n`);
console.log("By role:");
for (const row of byRole.sort((a, b) => b._count - a._count)) {
  console.log(`  ${row.role.padEnd(18)} ${row._count}`);
}

await prisma.$disconnect();
