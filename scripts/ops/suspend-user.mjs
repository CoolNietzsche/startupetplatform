// Usage: node suspend-user.mjs <email> [true|false]
// Omitting the second arg suspends (true). Pass false to lift a suspension.
import { prisma } from "./_db.mjs";

const [email, flag] = process.argv.slice(2);
if (!email) {
  console.error("Usage: node suspend-user.mjs <email> [true|false]");
  process.exit(1);
}

const isSuspended = flag === undefined ? true : flag.toLowerCase() !== "false";

try {
  const user = await prisma.user.update({
    where: { email },
    data: { isSuspended },
  });
  console.log(`${user.email} is now ${user.isSuspended ? "SUSPENDED" : "active"}`);
} catch (err) {
  if (err.code === "P2025") {
    console.error(`No user found with email ${email}`);
    process.exit(1);
  }
  throw err;
} finally {
  await prisma.$disconnect();
}
