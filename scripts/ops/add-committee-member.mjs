// Usage: node add-committee-member.mjs <committeeName> <email> [chair|member]
// Adds an existing (or newly created via create-user.mjs) user as a member
// of an EXISTING committee, replicating addCommitteeMember() in
// app/admins-new/committees/committee-actions.ts:
//   - upserts/connects the "COMMITTEE_MEMBER" Role
//   - bumps User.role from USER -> REVIEWER
//   - creates (or revives a removed) CommitteeMember row
// Defaults to "member"; pass "chair" to add as chair instead.
import { prisma } from "./_db.mjs";

const [committeeName, email, memberRoleArg = "member"] = process.argv.slice(2);

if (!committeeName || !email) {
  console.error("Usage: node add-committee-member.mjs <committeeName> <email> [chair|member]");
  process.exit(1);
}

const memberRole = memberRoleArg.toLowerCase();
if (!["chair", "member"].includes(memberRole)) {
  console.error(`Invalid member role "${memberRoleArg}". Must be "chair" or "member".`);
  process.exit(1);
}
const dbMemberRole = memberRole === "chair" ? "CHAIR" : "MEMBER";

const committee = await prisma.committee.findFirst({
  where: { name: { equals: committeeName, mode: "insensitive" } },
});
if (!committee) {
  console.error(`No committee found named "${committeeName}"`);
  process.exit(1);
}

const user = await prisma.user.findUnique({
  where: { email },
  select: { id: true, role: true, roles: { select: { id: true, name: true } } },
});
if (!user) {
  console.error(`No user found with email ${email}`);
  process.exit(1);
}

const COMMITTEE_ROLE_NAME = "COMMITTEE_MEMBER";

await prisma.$transaction(async (tx) => {
  const role = await tx.role.upsert({
    where: { name: COMMITTEE_ROLE_NAME },
    update: {},
    create: { name: COMMITTEE_ROLE_NAME, description: "Default role for committee membership" },
  });

  const alreadyHasRole = user.roles.some((r) => r.name === COMMITTEE_ROLE_NAME);

  await tx.user.update({
    where: { id: user.id },
    data: {
      ...(user.role === "USER" ? { role: "REVIEWER" } : {}),
      ...(alreadyHasRole ? {} : { roles: { connect: { id: role.id } } }),
    },
  });

  const existingMembership = await tx.committeeMember.findFirst({
    where: { committeeId: committee.id, userId: user.id },
  });

  if (existingMembership) {
    await tx.committeeMember.update({
      where: { id: existingMembership.id },
      data: { removedAt: null, memberRole: dbMemberRole },
    });
  } else {
    await tx.committeeMember.create({
      data: { committeeId: committee.id, userId: user.id, memberRole: dbMemberRole },
    });
  }
});

console.log(`Added ${email} to "${committee.name}" as ${dbMemberRole}`);

await prisma.$disconnect();
