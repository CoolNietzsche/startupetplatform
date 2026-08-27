import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });

export const VALID_ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "REGIONAL_ADMIN",
  "HUB_MANAGER",
  "MENTOR",
  "COMMITTEE",
  "ECOSYSTEM_BUILDER",
  "REVIEWER",
  "USER",
  "STAKEHOLDER",
];

export const VALID_APPLICATION_STATUSES = [
  "DRAFT",
  "PENDING",
  "UNDER_REVIEW",
  "REVIEWED",
  "ASSIGNED_TO_COMMITTEE",
  "IN_COMMITTEE_REVIEW",
  "COMMITTEE_REVIEW_SUBMITTED",
  "CERTIFIED",
  "REJECTED",
  "ROLLED_BACK",
  "CLARIFICATION_REQUESTED",
  "PAUSED",
  "EXPIRED",
  "SUSPENDED",
  "REVOKED",
];
