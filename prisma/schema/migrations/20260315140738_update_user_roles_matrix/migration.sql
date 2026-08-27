/*
  Warnings:

  - The values [SUBMITTED,ACCEPTED] on the enum `ApplicationStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [MANAGER,SUPPORT] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `rejectionReason` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the `Certificate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Committee` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CommitteeCriterion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CommitteeMember` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EcosystemBuilder` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Permission` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[builderId]` on the table `Investor` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `category` on the `FundingOpportunity` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "booking";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "certificate";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "committee";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "ecosystem";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "event";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "file";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "news";

-- CreateEnum
CREATE TYPE "application"."AssignmentStatus" AS ENUM ('ASSIGNED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "application"."EvaluationStatus" AS ENUM ('DRAFT', 'SUBMITTED');

-- CreateEnum
CREATE TYPE "application"."EvaluationResult" AS ENUM ('PASSED', 'FAILED');

-- CreateEnum
CREATE TYPE "certificate"."CertificateType" AS ENUM ('STARTUP', 'ECOSYSTEM');

-- CreateEnum
CREATE TYPE "committee"."CommitteeEntityType" AS ENUM ('STARTUP', 'ECOSYSTEM');

-- CreateEnum
CREATE TYPE "committee"."CommitteeStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "committee"."CommitteeMemberRole" AS ENUM ('CHAIR', 'MEMBER');

-- CreateEnum
CREATE TYPE "ecosystem"."EcoReviewStatus" AS ENUM ('DRAFT', 'SUBMITTED');

-- CreateEnum
CREATE TYPE "ecosystem"."EcoReviewRecommendation" AS ENUM ('APPROVE', 'REJECT', 'MORE_INFO');

-- CreateEnum
CREATE TYPE "ecosystem"."EcoApplicationStatus" AS ENUM ('DRAFT', 'PENDING', 'UNDER_REVIEW', 'REVIEWED', 'ASSIGNED_TO_COMMITTEE', 'IN_COMMITTEE_REVIEW', 'COMMITTEE_REVIEW_SUBMITTED', 'CERTIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "file"."FileCategory" AS ENUM ('BUSINESS_LICENSE', 'ARTICLES_OF_INCORPORATION', 'PITCH_DECK', 'FINANCIAL_STATEMENT', 'PROFILE_IMAGE', 'CERTIFICATE', 'INVESTOR_DOCUMENT', 'TAX_REGISTRATION', 'PUBLIC_ASSET', 'OTHER');

-- CreateEnum
CREATE TYPE "file"."StorageProvider" AS ENUM ('LOCAL', 'S3', 'VERCEL_BLOB');

-- CreateEnum
CREATE TYPE "file"."FileAccessType" AS ENUM ('VIEW', 'DOWNLOAD', 'DELETE');

-- AlterEnum
BEGIN;
CREATE TYPE "application"."ApplicationStatus_new" AS ENUM ('DRAFT', 'PENDING', 'UNDER_REVIEW', 'REVIEWED', 'ASSIGNED_TO_COMMITTEE', 'IN_COMMITTEE_REVIEW', 'COMMITTEE_REVIEW_SUBMITTED', 'CERTIFIED', 'REJECTED', 'ROLLED_BACK');
ALTER TABLE "application"."Application" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "application"."Application" ALTER COLUMN "status" TYPE "application"."ApplicationStatus_new" USING ("status"::text::"application"."ApplicationStatus_new");
ALTER TABLE "application"."ApplicationStatusHistory" ALTER COLUMN "status" TYPE "application"."ApplicationStatus_new" USING ("status"::text::"application"."ApplicationStatus_new");
ALTER TYPE "application"."ApplicationStatus" RENAME TO "ApplicationStatus_old";
ALTER TYPE "application"."ApplicationStatus_new" RENAME TO "ApplicationStatus";
DROP TYPE "application"."ApplicationStatus_old";
ALTER TABLE "application"."Application" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "user"."UserRole_new" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'COMMITTEE', 'ECOSYSTEM_BUILDER', 'REVIEWER', 'USER');
ALTER TABLE "user"."User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "user"."User" ALTER COLUMN "role" TYPE "user"."UserRole_new" USING ("role"::text::"user"."UserRole_new");
ALTER TYPE "user"."UserRole" RENAME TO "UserRole_old";
ALTER TYPE "user"."UserRole_new" RENAME TO "UserRole";
DROP TYPE "user"."UserRole_old";
ALTER TABLE "user"."User" ALTER COLUMN "role" SET DEFAULT 'USER';
COMMIT;

-- DropForeignKey
ALTER TABLE "application"."Certificate" DROP CONSTRAINT "Certificate_applicationId_fkey";

-- DropForeignKey
ALTER TABLE "user"."CommitteeCriterion" DROP CONSTRAINT "CommitteeCriterion_committeeId_fkey";

-- DropForeignKey
ALTER TABLE "user"."CommitteeMember" DROP CONSTRAINT "CommitteeMember_committeeId_fkey";

-- DropForeignKey
ALTER TABLE "user"."CommitteeMember" DROP CONSTRAINT "CommitteeMember_userId_fkey";

-- DropForeignKey
ALTER TABLE "user"."EcosystemBuilder" DROP CONSTRAINT "EcosystemBuilder_userId_fkey";

-- DropForeignKey
ALTER TABLE "user"."_RoleToPermission" DROP CONSTRAINT "_RoleToPermission_A_fkey";

-- AlterTable
ALTER TABLE "application"."Application" DROP COLUMN "rejectionReason",
ADD COLUMN     "articlesOfIncorpFileId" TEXT,
ADD COLUMN     "businessLicenseFileId" TEXT,
ADD COLUMN     "financialsFileId" TEXT,
ADD COLUMN     "pitchDeckFileId" TEXT,
ADD COLUMN     "reason" TEXT;

-- AlterTable
ALTER TABLE "funding"."FundingOpportunity" ADD COLUMN     "amountMax" DOUBLE PRECISION,
ADD COLUMN     "amountMin" DOUBLE PRECISION,
ADD COLUMN     "applicationProcess" JSONB,
ADD COLUMN     "creatorId" TEXT,
ADD COLUMN     "fundingUses" JSONB,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "longDescription" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'active',
ALTER COLUMN "applicationUrl" SET DEFAULT '#',
DROP COLUMN "category",
ADD COLUMN     "category" TEXT NOT NULL,
ALTER COLUMN "region" DROP NOT NULL;

-- AlterTable
ALTER TABLE "funding"."Investor" ADD COLUMN     "builderId" TEXT;

-- AlterTable
ALTER TABLE "user"."User" ALTER COLUMN "emailVerified" DROP NOT NULL,
ALTER COLUMN "emailVerified" DROP DEFAULT;

-- DropTable
DROP TABLE "application"."Certificate";

-- DropTable
DROP TABLE "user"."Committee";

-- DropTable
DROP TABLE "user"."CommitteeCriterion";

-- DropTable
DROP TABLE "user"."CommitteeMember";

-- DropTable
DROP TABLE "user"."EcosystemBuilder";

-- DropTable
DROP TABLE "user"."Permission";

-- DropEnum
DROP TYPE "user"."CommitteeEntityType";

-- DropEnum
DROP TYPE "user"."CommitteeMemberRole";

-- DropEnum
DROP TYPE "user"."CommitteeStatus";

-- CreateTable
CREATE TABLE "application"."Startup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "certificateId" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Startup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application"."ApplicationCommitteeAssignment" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "committeeId" TEXT NOT NULL,
    "status" "application"."AssignmentStatus" NOT NULL DEFAULT 'ASSIGNED',
    "assignedById" TEXT,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scheduledAt" TIMESTAMP(3),
    "meetingLink" TEXT,
    "location" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "chairMemberId" TEXT,

    CONSTRAINT "ApplicationCommitteeAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application"."ApplicationEvaluation" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "committeeId" TEXT NOT NULL,
    "evaluatorId" TEXT NOT NULL,
    "status" "application"."EvaluationStatus" NOT NULL DEFAULT 'DRAFT',
    "overallComment" TEXT,
    "totalScore" DOUBLE PRECISION,
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApplicationEvaluation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application"."ApplicationEvaluationScore" (
    "id" TEXT NOT NULL,
    "evaluationId" TEXT NOT NULL,
    "criterionId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "weightSnapshot" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApplicationEvaluationScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application"."ApplicationEvaluationAggregate" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "totalScore" DOUBLE PRECISION NOT NULL,
    "result" "application"."EvaluationResult" NOT NULL,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApplicationEvaluationAggregate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application"."ApplicationDocumentNote" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "evaluatorId" TEXT NOT NULL,
    "fileId" TEXT,
    "category" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApplicationDocumentNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking"."spaces" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "pricePerHour" DOUBLE PRECISION NOT NULL,
    "location" TEXT NOT NULL,
    "description" TEXT,
    "amenities" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'available',
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "spaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking"."bookings" (
    "id" TEXT NOT NULL,
    "spaceId" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "clientEmail" TEXT NOT NULL,
    "clientPhone" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "duration" DOUBLE PRECISION NOT NULL,
    "totalCost" DOUBLE PRECISION NOT NULL,
    "purpose" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificate"."Certificate" (
    "id" TEXT NOT NULL,
    "type" "certificate"."CertificateType" NOT NULL DEFAULT 'STARTUP',
    "certificateNumber" TEXT,
    "filePath" TEXT NOT NULL,
    "qrData" TEXT,
    "blockchainHash" TEXT,
    "applicationId" TEXT,
    "ecoApplicationId" TEXT,
    "issuedById" TEXT,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "committee"."Committee" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "entityType" "committee"."CommitteeEntityType" NOT NULL,
    "requiredApprovals" INTEGER NOT NULL DEFAULT 1,
    "status" "committee"."CommitteeStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Committee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "committee"."CommitteeMember" (
    "id" TEXT NOT NULL,
    "committeeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "memberRole" "committee"."CommitteeMemberRole" NOT NULL DEFAULT 'MEMBER',
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "removedAt" TIMESTAMP(3),

    CONSTRAINT "CommitteeMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "committee"."CommitteeCriterion" (
    "id" TEXT NOT NULL,
    "committeeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "weight" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommitteeCriterion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ecosystem"."EcosystemBuilder" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "established" INTEGER,
    "capacity" INTEGER,
    "website" TEXT,
    "certified" BOOLEAN NOT NULL DEFAULT false,
    "reviewed" BOOLEAN NOT NULL DEFAULT false,
    "services" JSONB NOT NULL,
    "description" TEXT,
    "address" TEXT,
    "city" TEXT,
    "contactName" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "serviceDescription" TEXT,
    "impactDescription" TEXT,
    "businessLicenseFileId" TEXT,
    "taxRegistrationFileId" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EcosystemBuilder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ecosystem"."EcoApplication" (
    "id" TEXT NOT NULL,
    "builderId" TEXT NOT NULL,
    "reviewerId" TEXT,
    "status" "ecosystem"."EcoApplicationStatus" NOT NULL DEFAULT 'DRAFT',
    "editingLocked" BOOLEAN NOT NULL DEFAULT false,
    "submittedAt" TIMESTAMP(3),
    "validatedAt" TIMESTAMP(3),
    "rejectedReason" TEXT,
    "rollbackReason" TEXT,
    "certificateId" TEXT,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "website" TEXT,
    "services" JSONB NOT NULL,
    "description" TEXT,
    "address" TEXT,
    "city" TEXT,
    "contactName" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "serviceDescription" TEXT,
    "impactDescription" TEXT,
    "established" INTEGER,
    "capacity" INTEGER,
    "businessLicenseFileId" TEXT,
    "taxRegistrationFileId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EcoApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ecosystem"."EcoApplicationStatusHistory" (
    "id" TEXT NOT NULL,
    "ecoApplicationId" TEXT NOT NULL,
    "fromStatus" "ecosystem"."EcoApplicationStatus",
    "toStatus" "ecosystem"."EcoApplicationStatus" NOT NULL,
    "changedById" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EcoApplicationStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ecosystem"."EcoCommitteeAssignment" (
    "id" TEXT NOT NULL,
    "ecoApplicationId" TEXT NOT NULL,
    "committeeId" TEXT NOT NULL,
    "assignedById" TEXT NOT NULL,
    "chairMemberId" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EcoCommitteeAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ecosystem"."EcoCommitteeReview" (
    "id" TEXT NOT NULL,
    "ecoApplicationId" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "status" "ecosystem"."EcoReviewStatus" NOT NULL DEFAULT 'DRAFT',
    "recommendation" "ecosystem"."EcoReviewRecommendation",
    "comment" TEXT,
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EcoCommitteeReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ecosystem"."EcoCommitteeReviewScore" (
    "id" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "criterionId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "weightSnapshot" INTEGER NOT NULL,
    "recommendation" "ecosystem"."EcoReviewRecommendation",
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EcoCommitteeReviewScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ecosystem"."EcoCommitteeDecision" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "chairMemberId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "finalDecision" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EcoCommitteeDecision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event"."events" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event"."attendees" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "checkInStatus" TEXT NOT NULL DEFAULT 'not-checked-in',

    CONSTRAINT "attendees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file"."File" (
    "id" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "storedName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "storagePath" TEXT NOT NULL,
    "storageBucket" TEXT,
    "uploadedBy" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "category" "file"."FileCategory" NOT NULL DEFAULT 'OTHER',
    "provider" "file"."StorageProvider" NOT NULL DEFAULT 'LOCAL',
    "metadata" JSONB,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "newsId" TEXT,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file"."FileVersion" (
    "id" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "uploadedBy" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "storedName" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FileVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file"."FileAccessLog" (
    "id" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" "file"."FileAccessType" NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "accessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FileAccessLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "funding"."FundingApplication" (
    "id" TEXT NOT NULL,
    "fundingOpportunityId" TEXT NOT NULL,
    "userId" TEXT,
    "companyName" TEXT NOT NULL,
    "registrationNumber" TEXT NOT NULL,
    "foundingDate" TEXT NOT NULL,
    "companySize" TEXT NOT NULL,
    "website" TEXT,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "applicantName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "projectTitle" TEXT NOT NULL,
    "projectDescription" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "impactArea" TEXT NOT NULL,
    "requestedAmount" DOUBLE PRECISION NOT NULL,
    "timeline" TEXT NOT NULL,
    "teamSize" TEXT NOT NULL,
    "previousFunding" TEXT,
    "challenge" TEXT,
    "solution" TEXT,
    "businessPlan" TEXT,
    "financialProjections" TEXT,
    "teamCV" TEXT,
    "presentationDeck" TEXT,
    "proofOfRegistration" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "submittedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FundingApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news"."news" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "featuredImageFileId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "publishedDate" TIMESTAMP(3),
    "views" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "news_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user"."PermissionRecord" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PermissionRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Startup_applicationId_key" ON "application"."Startup"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "Startup_userId_key" ON "application"."Startup"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Startup_certificateId_key" ON "application"."Startup"("certificateId");

-- CreateIndex
CREATE INDEX "ApplicationCommitteeAssignment_applicationId_idx" ON "application"."ApplicationCommitteeAssignment"("applicationId");

-- CreateIndex
CREATE INDEX "ApplicationCommitteeAssignment_committeeId_idx" ON "application"."ApplicationCommitteeAssignment"("committeeId");

-- CreateIndex
CREATE INDEX "ApplicationCommitteeAssignment_status_idx" ON "application"."ApplicationCommitteeAssignment"("status");

-- CreateIndex
CREATE INDEX "ApplicationEvaluation_applicationId_idx" ON "application"."ApplicationEvaluation"("applicationId");

-- CreateIndex
CREATE INDEX "ApplicationEvaluation_committeeId_idx" ON "application"."ApplicationEvaluation"("committeeId");

-- CreateIndex
CREATE UNIQUE INDEX "ApplicationEvaluation_assignmentId_evaluatorId_key" ON "application"."ApplicationEvaluation"("assignmentId", "evaluatorId");

-- CreateIndex
CREATE INDEX "ApplicationEvaluationScore_criterionId_idx" ON "application"."ApplicationEvaluationScore"("criterionId");

-- CreateIndex
CREATE UNIQUE INDEX "ApplicationEvaluationScore_evaluationId_criterionId_key" ON "application"."ApplicationEvaluationScore"("evaluationId", "criterionId");

-- CreateIndex
CREATE UNIQUE INDEX "ApplicationEvaluationAggregate_assignmentId_key" ON "application"."ApplicationEvaluationAggregate"("assignmentId");

-- CreateIndex
CREATE INDEX "ApplicationDocumentNote_applicationId_idx" ON "application"."ApplicationDocumentNote"("applicationId");

-- CreateIndex
CREATE INDEX "ApplicationDocumentNote_evaluatorId_idx" ON "application"."ApplicationDocumentNote"("evaluatorId");

-- CreateIndex
CREATE INDEX "ApplicationDocumentNote_fileId_idx" ON "application"."ApplicationDocumentNote"("fileId");

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_certificateNumber_key" ON "certificate"."Certificate"("certificateNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_applicationId_key" ON "certificate"."Certificate"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_ecoApplicationId_key" ON "certificate"."Certificate"("ecoApplicationId");

-- CreateIndex
CREATE INDEX "Certificate_applicationId_idx" ON "certificate"."Certificate"("applicationId");

-- CreateIndex
CREATE INDEX "Certificate_ecoApplicationId_idx" ON "certificate"."Certificate"("ecoApplicationId");

-- CreateIndex
CREATE INDEX "Certificate_issuedById_idx" ON "certificate"."Certificate"("issuedById");

-- CreateIndex
CREATE UNIQUE INDEX "Committee_name_key" ON "committee"."Committee"("name");

-- CreateIndex
CREATE INDEX "Committee_entityType_idx" ON "committee"."Committee"("entityType");

-- CreateIndex
CREATE INDEX "Committee_status_idx" ON "committee"."Committee"("status");

-- CreateIndex
CREATE INDEX "CommitteeMember_committeeId_idx" ON "committee"."CommitteeMember"("committeeId");

-- CreateIndex
CREATE INDEX "CommitteeMember_userId_idx" ON "committee"."CommitteeMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CommitteeMember_committeeId_userId_key" ON "committee"."CommitteeMember"("committeeId", "userId");

-- CreateIndex
CREATE INDEX "CommitteeCriterion_committeeId_idx" ON "committee"."CommitteeCriterion"("committeeId");

-- CreateIndex
CREATE UNIQUE INDEX "CommitteeCriterion_committeeId_name_key" ON "committee"."CommitteeCriterion"("committeeId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "EcosystemBuilder_userId_key" ON "ecosystem"."EcosystemBuilder"("userId");

-- CreateIndex
CREATE INDEX "EcosystemBuilder_name_idx" ON "ecosystem"."EcosystemBuilder"("name");

-- CreateIndex
CREATE INDEX "EcosystemBuilder_type_idx" ON "ecosystem"."EcosystemBuilder"("type");

-- CreateIndex
CREATE INDEX "EcosystemBuilder_location_idx" ON "ecosystem"."EcosystemBuilder"("location");

-- CreateIndex
CREATE INDEX "EcosystemBuilder_region_idx" ON "ecosystem"."EcosystemBuilder"("region");

-- CreateIndex
CREATE INDEX "EcosystemBuilder_certified_idx" ON "ecosystem"."EcosystemBuilder"("certified");

-- CreateIndex
CREATE INDEX "EcosystemBuilder_deletedAt_idx" ON "ecosystem"."EcosystemBuilder"("deletedAt");

-- CreateIndex
CREATE INDEX "EcoApplication_builderId_idx" ON "ecosystem"."EcoApplication"("builderId");

-- CreateIndex
CREATE INDEX "EcoApplication_status_idx" ON "ecosystem"."EcoApplication"("status");

-- CreateIndex
CREATE INDEX "EcoApplication_reviewerId_idx" ON "ecosystem"."EcoApplication"("reviewerId");

-- CreateIndex
CREATE INDEX "EcoApplicationStatusHistory_ecoApplicationId_idx" ON "ecosystem"."EcoApplicationStatusHistory"("ecoApplicationId");

-- CreateIndex
CREATE INDEX "EcoApplicationStatusHistory_changedById_idx" ON "ecosystem"."EcoApplicationStatusHistory"("changedById");

-- CreateIndex
CREATE INDEX "EcoCommitteeAssignment_committeeId_idx" ON "ecosystem"."EcoCommitteeAssignment"("committeeId");

-- CreateIndex
CREATE INDEX "EcoCommitteeAssignment_assignedById_idx" ON "ecosystem"."EcoCommitteeAssignment"("assignedById");

-- CreateIndex
CREATE UNIQUE INDEX "EcoCommitteeAssignment_ecoApplicationId_committeeId_key" ON "ecosystem"."EcoCommitteeAssignment"("ecoApplicationId", "committeeId");

-- CreateIndex
CREATE INDEX "EcoCommitteeReview_memberId_idx" ON "ecosystem"."EcoCommitteeReview"("memberId");

-- CreateIndex
CREATE INDEX "EcoCommitteeReview_ecoApplicationId_idx" ON "ecosystem"."EcoCommitteeReview"("ecoApplicationId");

-- CreateIndex
CREATE UNIQUE INDEX "EcoCommitteeReview_assignmentId_memberId_key" ON "ecosystem"."EcoCommitteeReview"("assignmentId", "memberId");

-- CreateIndex
CREATE INDEX "EcoCommitteeReviewScore_criterionId_idx" ON "ecosystem"."EcoCommitteeReviewScore"("criterionId");

-- CreateIndex
CREATE UNIQUE INDEX "EcoCommitteeReviewScore_reviewId_criterionId_key" ON "ecosystem"."EcoCommitteeReviewScore"("reviewId", "criterionId");

-- CreateIndex
CREATE UNIQUE INDEX "EcoCommitteeDecision_assignmentId_key" ON "ecosystem"."EcoCommitteeDecision"("assignmentId");

-- CreateIndex
CREATE INDEX "EcoCommitteeDecision_chairMemberId_idx" ON "ecosystem"."EcoCommitteeDecision"("chairMemberId");

-- CreateIndex
CREATE UNIQUE INDEX "File_storedName_key" ON "file"."File"("storedName");

-- CreateIndex
CREATE INDEX "File_uploadedBy_idx" ON "file"."File"("uploadedBy");

-- CreateIndex
CREATE INDEX "File_entityType_entityId_idx" ON "file"."File"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "File_category_idx" ON "file"."File"("category");

-- CreateIndex
CREATE INDEX "File_provider_idx" ON "file"."File"("provider");

-- CreateIndex
CREATE INDEX "File_isDeleted_idx" ON "file"."File"("isDeleted");

-- CreateIndex
CREATE INDEX "File_createdAt_idx" ON "file"."File"("createdAt");

-- CreateIndex
CREATE INDEX "FileVersion_fileId_idx" ON "file"."FileVersion"("fileId");

-- CreateIndex
CREATE INDEX "FileVersion_uploadedBy_idx" ON "file"."FileVersion"("uploadedBy");

-- CreateIndex
CREATE UNIQUE INDEX "FileVersion_fileId_version_key" ON "file"."FileVersion"("fileId", "version");

-- CreateIndex
CREATE INDEX "FileAccessLog_fileId_idx" ON "file"."FileAccessLog"("fileId");

-- CreateIndex
CREATE INDEX "FileAccessLog_userId_idx" ON "file"."FileAccessLog"("userId");

-- CreateIndex
CREATE INDEX "FileAccessLog_accessedAt_idx" ON "file"."FileAccessLog"("accessedAt");

-- CreateIndex
CREATE INDEX "FundingApplication_fundingOpportunityId_idx" ON "funding"."FundingApplication"("fundingOpportunityId");

-- CreateIndex
CREATE INDEX "FundingApplication_userId_idx" ON "funding"."FundingApplication"("userId");

-- CreateIndex
CREATE INDEX "FundingApplication_status_idx" ON "funding"."FundingApplication"("status");

-- CreateIndex
CREATE UNIQUE INDEX "news_slug_key" ON "news"."news"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "PermissionRecord_code_key" ON "user"."PermissionRecord"("code");

-- CreateIndex
CREATE INDEX "PermissionRecord_code_idx" ON "user"."PermissionRecord"("code");

-- CreateIndex
CREATE INDEX "Application_businessLicenseFileId_idx" ON "application"."Application"("businessLicenseFileId");

-- CreateIndex
CREATE INDEX "Application_articlesOfIncorpFileId_idx" ON "application"."Application"("articlesOfIncorpFileId");

-- CreateIndex
CREATE INDEX "Application_pitchDeckFileId_idx" ON "application"."Application"("pitchDeckFileId");

-- CreateIndex
CREATE INDEX "Application_financialsFileId_idx" ON "application"."Application"("financialsFileId");

-- CreateIndex
CREATE INDEX "FundingOpportunity_category_idx" ON "funding"."FundingOpportunity"("category");

-- CreateIndex
CREATE INDEX "FundingOpportunity_creatorId_idx" ON "funding"."FundingOpportunity"("creatorId");

-- CreateIndex
CREATE UNIQUE INDEX "Investor_builderId_key" ON "funding"."Investor"("builderId");

-- AddForeignKey
ALTER TABLE "application"."Application" ADD CONSTRAINT "Application_articlesOfIncorpFileId_fkey" FOREIGN KEY ("articlesOfIncorpFileId") REFERENCES "file"."File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application"."Application" ADD CONSTRAINT "Application_businessLicenseFileId_fkey" FOREIGN KEY ("businessLicenseFileId") REFERENCES "file"."File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application"."Application" ADD CONSTRAINT "Application_financialsFileId_fkey" FOREIGN KEY ("financialsFileId") REFERENCES "file"."File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application"."Application" ADD CONSTRAINT "Application_pitchDeckFileId_fkey" FOREIGN KEY ("pitchDeckFileId") REFERENCES "file"."File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application"."Startup" ADD CONSTRAINT "Startup_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "application"."Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application"."Startup" ADD CONSTRAINT "Startup_certificateId_fkey" FOREIGN KEY ("certificateId") REFERENCES "certificate"."Certificate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application"."Startup" ADD CONSTRAINT "Startup_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application"."ApplicationCommitteeAssignment" ADD CONSTRAINT "ApplicationCommitteeAssignment_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "application"."Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application"."ApplicationCommitteeAssignment" ADD CONSTRAINT "ApplicationCommitteeAssignment_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "user"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application"."ApplicationCommitteeAssignment" ADD CONSTRAINT "ApplicationCommitteeAssignment_chairMemberId_fkey" FOREIGN KEY ("chairMemberId") REFERENCES "committee"."CommitteeMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application"."ApplicationCommitteeAssignment" ADD CONSTRAINT "ApplicationCommitteeAssignment_committeeId_fkey" FOREIGN KEY ("committeeId") REFERENCES "committee"."Committee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application"."ApplicationEvaluation" ADD CONSTRAINT "ApplicationEvaluation_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "application"."Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application"."ApplicationEvaluation" ADD CONSTRAINT "ApplicationEvaluation_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "application"."ApplicationCommitteeAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application"."ApplicationEvaluation" ADD CONSTRAINT "ApplicationEvaluation_committeeId_fkey" FOREIGN KEY ("committeeId") REFERENCES "committee"."Committee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application"."ApplicationEvaluation" ADD CONSTRAINT "ApplicationEvaluation_evaluatorId_fkey" FOREIGN KEY ("evaluatorId") REFERENCES "user"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application"."ApplicationEvaluationScore" ADD CONSTRAINT "ApplicationEvaluationScore_criterionId_fkey" FOREIGN KEY ("criterionId") REFERENCES "committee"."CommitteeCriterion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application"."ApplicationEvaluationScore" ADD CONSTRAINT "ApplicationEvaluationScore_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES "application"."ApplicationEvaluation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application"."ApplicationEvaluationAggregate" ADD CONSTRAINT "ApplicationEvaluationAggregate_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "application"."ApplicationCommitteeAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application"."ApplicationDocumentNote" ADD CONSTRAINT "ApplicationDocumentNote_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "application"."Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application"."ApplicationDocumentNote" ADD CONSTRAINT "ApplicationDocumentNote_evaluatorId_fkey" FOREIGN KEY ("evaluatorId") REFERENCES "user"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application"."ApplicationDocumentNote" ADD CONSTRAINT "ApplicationDocumentNote_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "file"."File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking"."bookings" ADD CONSTRAINT "bookings_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "booking"."spaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificate"."Certificate" ADD CONSTRAINT "Certificate_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "application"."Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificate"."Certificate" ADD CONSTRAINT "Certificate_ecoApplicationId_fkey" FOREIGN KEY ("ecoApplicationId") REFERENCES "ecosystem"."EcoApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificate"."Certificate" ADD CONSTRAINT "Certificate_issuedById_fkey" FOREIGN KEY ("issuedById") REFERENCES "user"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "committee"."CommitteeMember" ADD CONSTRAINT "CommitteeMember_committeeId_fkey" FOREIGN KEY ("committeeId") REFERENCES "committee"."Committee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "committee"."CommitteeMember" ADD CONSTRAINT "CommitteeMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "committee"."CommitteeCriterion" ADD CONSTRAINT "CommitteeCriterion_committeeId_fkey" FOREIGN KEY ("committeeId") REFERENCES "committee"."Committee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ecosystem"."EcosystemBuilder" ADD CONSTRAINT "EcosystemBuilder_businessLicenseFileId_fkey" FOREIGN KEY ("businessLicenseFileId") REFERENCES "file"."File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ecosystem"."EcosystemBuilder" ADD CONSTRAINT "EcosystemBuilder_taxRegistrationFileId_fkey" FOREIGN KEY ("taxRegistrationFileId") REFERENCES "file"."File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ecosystem"."EcosystemBuilder" ADD CONSTRAINT "EcosystemBuilder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ecosystem"."EcoApplication" ADD CONSTRAINT "EcoApplication_builderId_fkey" FOREIGN KEY ("builderId") REFERENCES "ecosystem"."EcosystemBuilder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ecosystem"."EcoApplication" ADD CONSTRAINT "EcoApplication_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "user"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ecosystem"."EcoApplicationStatusHistory" ADD CONSTRAINT "EcoApplicationStatusHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "user"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ecosystem"."EcoApplicationStatusHistory" ADD CONSTRAINT "EcoApplicationStatusHistory_ecoApplicationId_fkey" FOREIGN KEY ("ecoApplicationId") REFERENCES "ecosystem"."EcoApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ecosystem"."EcoCommitteeAssignment" ADD CONSTRAINT "EcoCommitteeAssignment_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "user"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ecosystem"."EcoCommitteeAssignment" ADD CONSTRAINT "EcoCommitteeAssignment_chairMemberId_fkey" FOREIGN KEY ("chairMemberId") REFERENCES "committee"."CommitteeMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ecosystem"."EcoCommitteeAssignment" ADD CONSTRAINT "EcoCommitteeAssignment_committeeId_fkey" FOREIGN KEY ("committeeId") REFERENCES "committee"."Committee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ecosystem"."EcoCommitteeAssignment" ADD CONSTRAINT "EcoCommitteeAssignment_ecoApplicationId_fkey" FOREIGN KEY ("ecoApplicationId") REFERENCES "ecosystem"."EcoApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ecosystem"."EcoCommitteeReview" ADD CONSTRAINT "EcoCommitteeReview_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "ecosystem"."EcoCommitteeAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ecosystem"."EcoCommitteeReview" ADD CONSTRAINT "EcoCommitteeReview_ecoApplicationId_fkey" FOREIGN KEY ("ecoApplicationId") REFERENCES "ecosystem"."EcoApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ecosystem"."EcoCommitteeReview" ADD CONSTRAINT "EcoCommitteeReview_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "committee"."CommitteeMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ecosystem"."EcoCommitteeReviewScore" ADD CONSTRAINT "EcoCommitteeReviewScore_criterionId_fkey" FOREIGN KEY ("criterionId") REFERENCES "committee"."CommitteeCriterion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ecosystem"."EcoCommitteeReviewScore" ADD CONSTRAINT "EcoCommitteeReviewScore_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "ecosystem"."EcoCommitteeReview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ecosystem"."EcoCommitteeDecision" ADD CONSTRAINT "EcoCommitteeDecision_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "ecosystem"."EcoCommitteeAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ecosystem"."EcoCommitteeDecision" ADD CONSTRAINT "EcoCommitteeDecision_chairMemberId_fkey" FOREIGN KEY ("chairMemberId") REFERENCES "committee"."CommitteeMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event"."attendees" ADD CONSTRAINT "attendees_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "event"."events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file"."File" ADD CONSTRAINT "File_newsId_fkey" FOREIGN KEY ("newsId") REFERENCES "news"."news"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file"."File" ADD CONSTRAINT "File_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "user"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file"."FileVersion" ADD CONSTRAINT "FileVersion_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "file"."File"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file"."FileVersion" ADD CONSTRAINT "FileVersion_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "user"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file"."FileAccessLog" ADD CONSTRAINT "FileAccessLog_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "file"."File"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file"."FileAccessLog" ADD CONSTRAINT "FileAccessLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "funding"."FundingOpportunity" ADD CONSTRAINT "FundingOpportunity_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "ecosystem"."EcosystemBuilder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "funding"."Investor" ADD CONSTRAINT "Investor_builderId_fkey" FOREIGN KEY ("builderId") REFERENCES "ecosystem"."EcosystemBuilder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "funding"."FundingApplication" ADD CONSTRAINT "FundingApplication_fundingOpportunityId_fkey" FOREIGN KEY ("fundingOpportunityId") REFERENCES "funding"."FundingOpportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "funding"."FundingApplication" ADD CONSTRAINT "FundingApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news"."news" ADD CONSTRAINT "news_featuredImageFileId_fkey" FOREIGN KEY ("featuredImageFileId") REFERENCES "file"."File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user"."_RoleToPermission" ADD CONSTRAINT "_RoleToPermission_A_fkey" FOREIGN KEY ("A") REFERENCES "user"."PermissionRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;
