// Usage: node create-committee.mjs <name> <STARTUP|ECOSYSTEM> <chairEmail> [memberEmail...]
// Creates a Committee and wires up its members exactly like the "Create
// Committee" UI action does (app/admins-new/committees/committee-actions.ts):
//   - upserts a "COMMITTEE_MEMBER" Role and connects each member to it
//   - bumps a member's User.role from USER -> REVIEWER (leaves other roles alone)
//   - creates the CommitteeMember rows (first email = CHAIR, rest = MEMBER)
//
// Just setting User.role = "COMMITTEE" on an account does NOT make it show
// up anywhere in the app - committee assignment UIs query the Committee /
// CommitteeMember models, not the role enum.
import { prisma } from "./_db.mjs";

const [name, entityTypeArg, ...emails] = process.argv.slice(2);

if (!name || !entityTypeArg || emails.length === 0) {
  console.error("Usage: node create-committee.mjs <name> <STARTUP|ECOSYSTEM> <chairEmail> [memberEmail...]");
  process.exit(1);
}

const entityType = entityTypeArg.toUpperCase();
if (!["STARTUP", "ECOSYSTEM"].includes(entityType)) {
  console.error(`Invalid entity type "${entityTypeArg}". Must be STARTUP or ECOSYSTEM.`);
  process.exit(1);
}

const uniqueEmails = [...new Set(emails)];
if (uniqueEmails.length !== emails.length) {
  console.error("Duplicate emails are not allowed.");
  process.exit(1);
}

const users = await prisma.user.findMany({
  where: { email: { in: uniqueEmails } },
  select: { id: true, email: true, role: true, roles: { select: { id: true, name: true } } },
});

const missing = uniqueEmails.filter((e) => !users.some((u) => u.email === e));
if (missing.length > 0) {
  console.error(`No user found for: ${missing.join(", ")}`);
  process.exit(1);
}

const existing = await prisma.committee.findFirst({
  where: { name: { equals: name, mode: "insensitive" } },
});
if (existing) {
  console.log(`Committee "${name}" already exists (id=${existing.id}). Not creating a duplicate.`);
  process.exit(0);
}

const COMMITTEE_ROLE_NAME = "COMMITTEE_MEMBER";

const committee = await prisma.$transaction(async (tx) => {
  const role = await tx.role.upsert({
    where: { name: COMMITTEE_ROLE_NAME },
    update: {},
    create: { name: COMMITTEE_ROLE_NAME, description: "Default role for committee membership" },
  });

  const created = await tx.committee.create({
    data: {
      name,
      entityType,
      requiredApprovals: 1,
      status: "ACTIVE",
    },
  });

  for (const [index, email] of uniqueEmails.entries()) {
    const user = users.find((u) => u.email === email);
    const alreadyHasRole = user.roles.some((r) => r.name === COMMITTEE_ROLE_NAME);

    await tx.user.update({
      where: { id: user.id },
      data: {
        ...(user.role === "USER" ? { role: "REVIEWER" } : {}),
        ...(alreadyHasRole ? {} : { roles: { connect: { id: role.id } } }),
      },
    });

    await tx.committeeMember.create({
      data: {
        committeeId: created.id,
        userId: user.id,
        memberRole: index === 0 ? "CHAIR" : "MEMBER",
      },
    });
  }

  return created;
});

console.log(`Created committee: ${committee.name} (id=${committee.id}, entityType=${entityType})`);
console.log(`Chair: ${uniqueEmails[0]}`);
if (uniqueEmails.length > 1) {
  console.log(`Members: ${uniqueEmails.slice(1).join(", ")}`);
}

await prisma.$disconnect();
