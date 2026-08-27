// Usage: node reset-password.mjs <email> <newPassword>
import { prisma } from "./_db.mjs";
import bcrypt from "bcryptjs";

const [email, newPassword] = process.argv.slice(2);
if (!email || !newPassword) {
  console.error("Usage: node reset-password.mjs <email> <newPassword>");
  process.exit(1);
}

const hashed = await bcrypt.hash(newPassword, 10);

try {
  const user = await prisma.user.update({
    where: { email },
    data: { password: hashed, loginAttempts: 0, lockedUntil: null },
  });
  console.log(`Password reset for ${user.email}`);
} catch (err) {
  if (err.code === "P2025") {
    console.error(`No user found with email ${email}`);
    process.exit(1);
  }
  throw err;
} finally {
  await prisma.$disconnect();
}
