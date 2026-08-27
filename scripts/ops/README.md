# Ops scripts

Small, reusable scripts for common questions/tasks against the production
database. Each one runs standalone inside the production `app` container
(so it has `@prisma/client`, `bcryptjs`, etc. already available) via the
`run-on-prod.sh` wrapper - no manual scp/docker-cp/cleanup dance needed.

Also works unmodified against a local dev DB: `node scripts/ops/list-users.mjs`.

## Usage

```bash
./scripts/ops/run-on-prod.sh <script-name> [args...]
```

Uses a normal interactive `ssh`/`scp` prompt by default. For non-interactive
use, export `NSLP_PROD_SSH_PASS` in your shell first (never hardcode it into
a file - see `OPERATIONS.md`, which is gitignored for that reason).

## Available scripts

| Script | Usage | What it does |
|---|---|---|
| `list-users.mjs` | `[role]` | List registered users, newest first. Optional role filter. |
| `user-stats.mjs` | | Headcount totals, suspended/unverified counts, breakdown by role. |
| `find-user.mjs` | `<email>` | Full detail on one user (incl. their applications), password omitted. |
| `create-user.mjs` | `<email> <password> [role] [firstName] [lastName]` | Create an account directly in the DB (bcrypt-hashed, email pre-verified). No-op if the email exists. |
| `set-user-role.mjs` | `<email> <role>` | Change a user's role. |
| `suspend-user.mjs` | `<email> [true\|false]` | Suspend (default) or unsuspend an account. |
| `reset-password.mjs` | `<email> <newPassword>` | Set a new password and clear any lockout. |
| `list-applications.mjs` | `[status]` | List startup applications, newest first. Optional status filter. |
| `create-sample-application.mjs` | `<startupName> <ownerEmail> [password]` | Create (or reuse) an owner user, then a sample PENDING startup Application + one Founder under it, for demoing/testing the review pipeline. |
| `create-committee.mjs` | `<name> <STARTUP\|ECOSYSTEM> <chairEmail> [memberEmail...]` | Create a Committee and wire up members exactly like the "Create Committee" UI (Role connect, USER->REVIEWER bump, CommitteeMember rows). First email is CHAIR, rest are MEMBER. Just setting `User.role = COMMITTEE` does **not** make a user show up anywhere - this is the actual missing piece for that. |
| `add-committee-member.mjs` | `<committeeName> <email> [chair\|member]` | Add a user to an *existing* committee (default role: member). Idempotent - re-running updates the role/revives a removed membership rather than erroring. |

Valid roles/statuses are enumerated in `_db.mjs` and each script validates
its input against them before touching the DB.

## Examples

```bash
./scripts/ops/run-on-prod.sh list-users.mjs
./scripts/ops/run-on-prod.sh list-users.mjs ADMIN
./scripts/ops/run-on-prod.sh user-stats.mjs
./scripts/ops/run-on-prod.sh find-user.mjs someone@startupethiopia.et
./scripts/ops/run-on-prod.sh create-user.mjs admin2@startupethiopia.et 'Startup@ET' ADMIN Jane Doe
./scripts/ops/run-on-prod.sh list-applications.mjs CERTIFIED
```

## Adding a new one

Import `{ prisma }` (and `VALID_ROLES`/`VALID_APPLICATION_STATUSES` if
relevant) from `./_db.mjs`, do the query, `console.log` something readable,
`await prisma.$disconnect()` at the end. Keep it a plain `.mjs` file (forces
ESM regardless of the app's own module settings) with no other local
imports - `run-on-prod.sh` only copies the target script plus `_db.mjs` to
the container, nothing else.
