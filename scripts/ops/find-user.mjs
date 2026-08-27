// Usage: node find-user.mjs <email>
// Full detail on one user, including their applications. Password hash omitted.
import { prisma } from "./_db.mjs";

const email = process.argv[2];
if (!email) {
  console.error("Usage: node find-user.mjs <email>");
  process.exit(1);
}

const user = await prisma.user.findUnique({
  where: { email },
  include: {
    applications: {
      select: { id: true, status: true, startupName: true, createdAt: true },
    },
  },
});

if (!user) {
  console.log(`No user found with email ${email}`);
} else {
  const { password, ...safe } = user;
  console.log(JSON.stringify(safe, null, 2));
}

await prisma.$disconnect();
