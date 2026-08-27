// Usage: node list-users.mjs [role]
// Lists registered users, most recent first. Pass a role to filter
// (e.g. SUPER_ADMIN, ADMIN, USER) - see VALID_ROLES in _db.mjs.
import { prisma, VALID_ROLES } from "./_db.mjs";

const roleFilter = process.argv[2]?.toUpperCase();

if (roleFilter && !VALID_ROLES.includes(roleFilter)) {
  console.error(`Unknown role "${roleFilter}". Valid roles: ${VALID_ROLES.join(", ")}`);
  process.exit(1);
}

const users = await prisma.user.findMany({
  where: roleFilter ? { role: roleFilter } : undefined,
  orderBy: { createdAt: "desc" },
  select: {
    email: true,
    firstName: true,
    lastName: true,
    role: true,
    emailVerified: true,
    isSuspended: true,
    createdAt: true,
  },
});

console.log(`${users.length} user(s)${roleFilter ? ` with role ${roleFilter}` : ""}\n`);
for (const u of users) {
  const verified = u.emailVerified ? "verified  " : "unverified";
  const status = u.isSuspended ? "SUSPENDED" : "active   ";
  console.log(
    `${u.createdAt.toISOString().slice(0, 10)}  ${u.role.padEnd(18)} ${status} ${verified}  ${u.email}  (${u.firstName} ${u.lastName})`
  );
}

await prisma.$disconnect();
