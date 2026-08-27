// Usage: node create-user.mjs <email> <password> [role] [firstName] [lastName]
// Defaults: role=USER, firstName=New, lastName=User.
// Creates the account directly (bcrypt-hashed, cost 10), emailVerified=true,
// onboardingCompleted=true. Does nothing if the email already exists.
import { prisma, VALID_ROLES } from "./_db.mjs";
import bcrypt from "bcryptjs";

const [email, password, role = "USER", firstName = "New", lastName = "User"] = process.argv.slice(2);

if (!email || !password) {
  console.error("Usage: node create-user.mjs <email> <password> [role] [firstName] [lastName]");
  console.error(`Valid roles: ${VALID_ROLES.join(", ")}`);
  process.exit(1);
}

const roleUpper = role.toUpperCase();
if (!VALID_ROLES.includes(roleUpper)) {
  console.error(`Unknown role "${role}". Valid roles: ${VALID_ROLES.join(", ")}`);
  process.exit(1);
}

const existing = await prisma.user.findUnique({ where: { email } });
if (existing) {
  console.log(`Already exists: ${existing.email} (${existing.role})`);
  process.exit(0);
}

const hashed = await bcrypt.hash(password, 10);
const user = await prisma.user.create({
  data: {
    email,
    password: hashed,
    firstName,
    lastName,
    role: roleUpper,
    emailVerified: true,
    onboardingCompleted: true,
  },
});

console.log(`Created: ${user.email} (${user.role}) id=${user.id}`);

await prisma.$disconnect();
