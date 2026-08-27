// Usage: node list-applications.mjs [status]
// Lists startup applications, most recent first. Pass a status to filter
// (e.g. CERTIFIED, UNDER_REVIEW) - see VALID_APPLICATION_STATUSES in _db.mjs.
import { prisma, VALID_APPLICATION_STATUSES } from "./_db.mjs";

const statusFilter = process.argv[2]?.toUpperCase();

if (statusFilter && !VALID_APPLICATION_STATUSES.includes(statusFilter)) {
  console.error(`Unknown status "${statusFilter}". Valid statuses: ${VALID_APPLICATION_STATUSES.join(", ")}`);
  process.exit(1);
}

const apps = await prisma.application.findMany({
  where: statusFilter ? { status: statusFilter } : undefined,
  orderBy: { createdAt: "desc" },
  select: {
    id: true,
    status: true,
    startupName: true,
    email: true,
    industry: true,
    createdAt: true,
    user: { select: { email: true } },
  },
});

console.log(`${apps.length} application(s)${statusFilter ? ` with status ${statusFilter}` : ""}\n`);
for (const a of apps) {
  const owner = a.user?.email ?? a.email ?? "(no email)";
  console.log(
    `${a.createdAt.toISOString().slice(0, 10)}  ${a.status.padEnd(26)} ${(a.startupName || "(unnamed)").padEnd(30)} ${owner}`
  );
}

await prisma.$disconnect();
