-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "application";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "funding";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "user";

-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "application"."ApplicationStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "funding"."FundingCategory" AS ENUM ('GRANT', 'INVESTMENT', 'ACCELERATOR');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "funding"."InvestorType" AS ENUM ('ANGEL', 'VC', 'CORPORATE', 'ACCELERATOR', 'GOVERNMENT', 'OTHER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "funding"."InvestmentStage" AS ENUM ('SEED', 'SERIES_A', 'SERIES_B', 'SERIES_C', 'GROWTH', 'LATE_STAGE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "user"."UserRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'REVIEWER', 'MANAGER', 'SUPPORT', 'USER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "user"."CommitteeEntityType" AS ENUM ('STARTUP', 'ECOSYSTEM');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "user"."CommitteeStatus" AS ENUM ('ACTIVE', 'INACTIVE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "user"."CommitteeMemberRole" AS ENUM ('CHAIR', 'MEMBER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateTable
CREATE TABLE "application"."Application" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reviewerId" TEXT,
    "status" "application"."ApplicationStatus" NOT NULL DEFAULT 'DRAFT',
    "startupName" TEXT,
    "numberOfEmployees" INTEGER,
    "numberOfFounders" INTEGER,
    "foundingDate" TIMESTAMP(3),
    "industry" TEXT,
    "website" TEXT,
    "phoneNumber" TEXT,
    "email" TEXT,
    "alternateEmail" TEXT,
    "businessLicense" TEXT,
    "articleOfIncorporation" TEXT,
    "typeOfCompany" TEXT,
    "totalShares" DOUBLE PRECISION,
    "sharePrice" DOUBLE PRECISION,
    "vision" TEXT,
    "mission" TEXT,
    "productDescription" TEXT,
    "uniqueValueProposition" TEXT,
    "tin" TEXT,
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "problemStatement" TEXT,
    "solution" TEXT,
    "innovationDescription" TEXT,
    "targetMarket" TEXT,
    "competitiveAdvantage" TEXT,
    "scalabilityPlan" TEXT,
    "traction" TEXT,
    "riskAssessment" TEXT,
    "revenue" TEXT,
    "totalFundingRaised" TEXT,
    "investmentNeeded" TEXT,
    "useOfFunds" TEXT,
    "fundingSources" TEXT,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application"."ApplicationStatusHistory" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "status" "application"."ApplicationStatus" NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApplicationStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application"."Founder" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "fcn" TEXT,
    "noOfShares" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "role" TEXT,

    CONSTRAINT "Founder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application"."Certificate" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "blockchainHash" TEXT,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application"."Message" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "fromId" TEXT NOT NULL,
    "toId" TEXT NOT NULL,
    "messageContent" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "funding"."FundingOpportunity" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "organization" TEXT NOT NULL,
    "amount" TEXT,
    "deadline" TIMESTAMP(3),
    "eligibility" JSONB NOT NULL,
    "applicationUrl" TEXT NOT NULL,
    "category" "funding"."FundingCategory" NOT NULL,
    "region" JSONB NOT NULL,
    "sectors" JSONB,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "savedCount" INTEGER NOT NULL DEFAULT 0,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FundingOpportunity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "funding"."Investor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "funding"."InvestorType" NOT NULL,
    "description" TEXT,
    "logo" TEXT,
    "website" TEXT,
    "linkedIn" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "investmentThesis" TEXT,
    "minTicketSize" DOUBLE PRECISION,
    "maxTicketSize" DOUBLE PRECISION,
    "preferredStages" JSONB NOT NULL,
    "sectors" JSONB NOT NULL,
    "regions" JSONB NOT NULL,
    "portfolio" JSONB NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Investor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "funding"."Pitch" (
    "id" TEXT NOT NULL,
    "startupId" TEXT NOT NULL,
    "investorId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "attachments" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "response" TEXT,
    "responseDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pitch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "funding"."SavedOpportunity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "reminderDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedOpportunity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "funding"."OpportunityView" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OpportunityView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user"."Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user"."Permission" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "twoStepAuthEnabled" BOOLEAN NOT NULL DEFAULT false,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "user"."UserRole" NOT NULL DEFAULT 'USER',
    "customPermissions" JSONB,
    "address" TEXT,
    "phoneNumber" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "isSuspended" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user"."Committee" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "entityType" "user"."CommitteeEntityType" NOT NULL,
    "requiredApprovals" INTEGER NOT NULL DEFAULT 1,
    "status" "user"."CommitteeStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Committee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user"."CommitteeMember" (
    "id" TEXT NOT NULL,
    "committeeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "memberRole" "user"."CommitteeMemberRole" NOT NULL DEFAULT 'MEMBER',
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "removedAt" TIMESTAMP(3),

    CONSTRAINT "CommitteeMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user"."CommitteeCriterion" (
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
CREATE TABLE "user"."EcosystemBuilder" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "established" INTEGER,
    "capacity" INTEGER,
    "website" TEXT,
    "certified" BOOLEAN NOT NULL DEFAULT false,
    "services" JSONB NOT NULL,
    "description" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EcosystemBuilder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user"."NotificationPreferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "fundingAlerts" BOOLEAN NOT NULL DEFAULT true,
    "newsDigest" BOOLEAN NOT NULL DEFAULT true,
    "preferredSectors" JSONB,
    "preferredRegions" JSONB,
    "minFundingAmount" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationPreferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user"."VerificationToken" (
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT NOT NULL,
    "id" TEXT NOT NULL,

    CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user"."PasswordResetToken" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user"."_RoleToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_RoleToUser_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "user"."_RoleToPermission" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_RoleToPermission_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "Application_status_idx" ON "application"."Application"("status");

-- CreateIndex
CREATE INDEX "ApplicationStatusHistory_applicationId_idx" ON "application"."ApplicationStatusHistory"("applicationId");

-- CreateIndex
CREATE INDEX "Founder_applicationId_idx" ON "application"."Founder"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_applicationId_key" ON "application"."Certificate"("applicationId");

-- CreateIndex
CREATE INDEX "Certificate_applicationId_idx" ON "application"."Certificate"("applicationId");

-- CreateIndex
CREATE INDEX "Message_toId_idx" ON "application"."Message"("toId");

-- CreateIndex
CREATE INDEX "Message_applicationId_idx" ON "application"."Message"("applicationId");

-- CreateIndex
CREATE INDEX "Message_fromId_idx" ON "application"."Message"("fromId");

-- CreateIndex
CREATE INDEX "FundingOpportunity_deadline_idx" ON "funding"."FundingOpportunity"("deadline");

-- CreateIndex
CREATE INDEX "FundingOpportunity_category_idx" ON "funding"."FundingOpportunity"("category");

-- CreateIndex
CREATE INDEX "FundingOpportunity_viewCount_idx" ON "funding"."FundingOpportunity"("viewCount");

-- CreateIndex
CREATE INDEX "Investor_type_idx" ON "funding"."Investor"("type");

-- CreateIndex
CREATE INDEX "Investor_isVerified_idx" ON "funding"."Investor"("isVerified");

-- CreateIndex
CREATE INDEX "Investor_isActive_idx" ON "funding"."Investor"("isActive");

-- CreateIndex
CREATE INDEX "Pitch_startupId_idx" ON "funding"."Pitch"("startupId");

-- CreateIndex
CREATE INDEX "Pitch_investorId_idx" ON "funding"."Pitch"("investorId");

-- CreateIndex
CREATE INDEX "Pitch_status_idx" ON "funding"."Pitch"("status");

-- CreateIndex
CREATE INDEX "SavedOpportunity_userId_idx" ON "funding"."SavedOpportunity"("userId");

-- CreateIndex
CREATE INDEX "SavedOpportunity_opportunityId_idx" ON "funding"."SavedOpportunity"("opportunityId");

-- CreateIndex
CREATE UNIQUE INDEX "SavedOpportunity_userId_opportunityId_key" ON "funding"."SavedOpportunity"("userId", "opportunityId");

-- CreateIndex
CREATE INDEX "OpportunityView_userId_idx" ON "funding"."OpportunityView"("userId");

-- CreateIndex
CREATE INDEX "OpportunityView_opportunityId_idx" ON "funding"."OpportunityView"("opportunityId");

-- CreateIndex
CREATE INDEX "OpportunityView_viewedAt_idx" ON "funding"."OpportunityView"("viewedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "user"."Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_code_key" ON "user"."Permission"("code");

-- CreateIndex
CREATE INDEX "Permission_code_idx" ON "user"."Permission"("code");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "user"."User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "user"."User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "user"."User"("role");

-- CreateIndex
CREATE INDEX "User_firstName_idx" ON "user"."User"("firstName");

-- CreateIndex
CREATE INDEX "User_lastName_idx" ON "user"."User"("lastName");

-- CreateIndex
CREATE INDEX "User_phoneNumber_idx" ON "user"."User"("phoneNumber");

-- CreateIndex
CREATE INDEX "User_deletedAt_idx" ON "user"."User"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Committee_name_key" ON "user"."Committee"("name");

-- CreateIndex
CREATE INDEX "Committee_entityType_idx" ON "user"."Committee"("entityType");

-- CreateIndex
CREATE INDEX "Committee_status_idx" ON "user"."Committee"("status");

-- CreateIndex
CREATE INDEX "CommitteeMember_committeeId_idx" ON "user"."CommitteeMember"("committeeId");

-- CreateIndex
CREATE INDEX "CommitteeMember_userId_idx" ON "user"."CommitteeMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CommitteeMember_committeeId_userId_key" ON "user"."CommitteeMember"("committeeId", "userId");

-- CreateIndex
CREATE INDEX "CommitteeCriterion_committeeId_idx" ON "user"."CommitteeCriterion"("committeeId");

-- CreateIndex
CREATE UNIQUE INDEX "CommitteeCriterion_committeeId_name_key" ON "user"."CommitteeCriterion"("committeeId", "name");

-- CreateIndex
CREATE INDEX "EcosystemBuilder_name_idx" ON "user"."EcosystemBuilder"("name");

-- CreateIndex
CREATE INDEX "EcosystemBuilder_type_idx" ON "user"."EcosystemBuilder"("type");

-- CreateIndex
CREATE INDEX "EcosystemBuilder_location_idx" ON "user"."EcosystemBuilder"("location");

-- CreateIndex
CREATE INDEX "EcosystemBuilder_region_idx" ON "user"."EcosystemBuilder"("region");

-- CreateIndex
CREATE INDEX "EcosystemBuilder_certified_idx" ON "user"."EcosystemBuilder"("certified");

-- CreateIndex
CREATE INDEX "EcosystemBuilder_deletedAt_idx" ON "user"."EcosystemBuilder"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationPreferences_userId_key" ON "user"."NotificationPreferences"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "user"."VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_email_token_key" ON "user"."VerificationToken"("email", "token");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "user"."PasswordResetToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_email_token_key" ON "user"."PasswordResetToken"("email", "token");

-- CreateIndex
CREATE INDEX "_RoleToUser_B_index" ON "user"."_RoleToUser"("B");

-- CreateIndex
CREATE INDEX "_RoleToPermission_B_index" ON "user"."_RoleToPermission"("B");

-- AddForeignKey
ALTER TABLE "application"."Application" ADD CONSTRAINT "Application_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "user"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application"."Application" ADD CONSTRAINT "Application_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application"."ApplicationStatusHistory" ADD CONSTRAINT "ApplicationStatusHistory_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "application"."Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application"."Founder" ADD CONSTRAINT "Founder_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "application"."Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application"."Certificate" ADD CONSTRAINT "Certificate_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "application"."Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application"."Message" ADD CONSTRAINT "Message_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "application"."Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application"."Message" ADD CONSTRAINT "Message_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "user"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application"."Message" ADD CONSTRAINT "Message_toId_fkey" FOREIGN KEY ("toId") REFERENCES "user"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "funding"."Pitch" ADD CONSTRAINT "Pitch_investorId_fkey" FOREIGN KEY ("investorId") REFERENCES "funding"."Investor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "funding"."Pitch" ADD CONSTRAINT "Pitch_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "user"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "funding"."SavedOpportunity" ADD CONSTRAINT "SavedOpportunity_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "funding"."FundingOpportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "funding"."SavedOpportunity" ADD CONSTRAINT "SavedOpportunity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "funding"."OpportunityView" ADD CONSTRAINT "OpportunityView_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "funding"."FundingOpportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "funding"."OpportunityView" ADD CONSTRAINT "OpportunityView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user"."CommitteeMember" ADD CONSTRAINT "CommitteeMember_committeeId_fkey" FOREIGN KEY ("committeeId") REFERENCES "user"."Committee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user"."CommitteeMember" ADD CONSTRAINT "CommitteeMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user"."CommitteeCriterion" ADD CONSTRAINT "CommitteeCriterion_committeeId_fkey" FOREIGN KEY ("committeeId") REFERENCES "user"."Committee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user"."NotificationPreferences" ADD CONSTRAINT "NotificationPreferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user"."_RoleToUser" ADD CONSTRAINT "_RoleToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "user"."Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user"."_RoleToUser" ADD CONSTRAINT "_RoleToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "user"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user"."_RoleToPermission" ADD CONSTRAINT "_RoleToPermission_A_fkey" FOREIGN KEY ("A") REFERENCES "user"."Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user"."_RoleToPermission" ADD CONSTRAINT "_RoleToPermission_B_fkey" FOREIGN KEY ("B") REFERENCES "user"."Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

