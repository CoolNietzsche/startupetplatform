// Usage: node set-user-role.mjs <email> <role>
import { prisma, VALID_ROLES } from "./_db.mjs";

const [email, role] = process.argv.slice(2);
if (!email || !role) {
  console.error("Usage: node set-user-role.mjs <email> <role>");
  console.error(`Valid roles: ${VALID_ROLES.join(", ")}`);
  process.exit(1);
}

const roleUpper = role.toUpperCase();
if (!VALID_ROLES.includes(roleUpper)) {
  console.error(`Unknown role "${role}". Valid roles: ${VALID_ROLES.join(", ")}`);
  process.exit(1);
}

try {
  const user = await prisma.user.update({
    where: { email },
    data: { role: roleUpper },
  });
  console.log(`Updated: ${user.email} is now ${user.role}`);
} catch (err) {
  if (err.code === "P2025") {
    console.error(`No user found with email ${email}`);
    process.exit(1);
  }
  throw err;
} finally {
  await prisma.$disconnect();
}
