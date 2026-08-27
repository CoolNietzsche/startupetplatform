/*
  Warnings:

  - You are about to drop the `Message` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `NotificationPreferences` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "communication";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "complaint";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "notification";

-- CreateEnum
CREATE TYPE "application"."ApplicationType" AS ENUM ('INITIAL', 'RENEWAL', 'AMENDMENT');

-- CreateEnum
CREATE TYPE "certificate"."CertificateStatus" AS ENUM ('ACTIVE', 'PAUSED', 'REVOKED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "communication"."ConversationType" AS ENUM ('GENERAL', 'CLARIFICATION', 'EVALUATION', 'SYSTEM_BROADCAST', 'DIRECT_MESSAGE');

-- CreateEnum
CREATE TYPE "communication"."ConversationStatus" AS ENUM ('OPEN', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "communication"."ParticipantRole" AS ENUM ('OWNER', 'MEMBER', 'OBSERVER');

-- CreateEnum
CREATE TYPE "communication"."MessageType" AS ENUM ('TEXT', 'DOCUMENT_REQUEST', 'SYSTEM_ALERT');

-- CreateEnum
CREATE TYPE "communication"."MessageStatus" AS ENUM ('SENT', 'DELIVERED', 'READ');

-- CreateEnum
CREATE TYPE "complaint"."ComplaintStatus" AS ENUM ('PENDING', 'IN_REVIEW', 'RESOLVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "complaint"."ComplaintType" AS ENUM ('PUBLIC', 'STARTUP', 'ECOSYSTEM_BUILDER');

-- CreateEnum
CREATE TYPE "complaint"."ComplaintCategory" AS ENUM ('STARTUP', 'ECOSYSTEM_BUILDER', 'PROCESS', 'GENERAL');

-- CreateEnum
CREATE TYPE "complaint"."AdminResolution" AS ENUM ('NONE', 'WARNING', 'SUSPENSION', 'LICENSE_REVOKED', 'RESOLVED_NO_ACTION');

-- CreateEnum
CREATE TYPE "communication"."FormalRequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "application"."ApplicationStatus" ADD VALUE 'CLARIFICATION_REQUESTED';
ALTER TYPE "application"."ApplicationStatus" ADD VALUE 'PAUSED';
ALTER TYPE "application"."ApplicationStatus" ADD VALUE 'EXPIRED';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ecosystem"."EcoApplicationStatus" ADD VALUE 'CLARIFICATION_REQUESTED';
ALTER TYPE "ecosystem"."EcoApplicationStatus" ADD VALUE 'PAUSED';
ALTER TYPE "ecosystem"."EcoApplicationStatus" ADD VALUE 'EXPIRED';

-- AlterEnum
ALTER TYPE "user"."UserRole" ADD VALUE 'STAKEHOLDER';

-- DropForeignKey
ALTER TABLE "application"."Message" DROP CONSTRAINT "Message_applicationId_fkey";

-- DropForeignKey
ALTER TABLE "application"."Message" DROP CONSTRAINT "Message_fromId_fkey";

-- DropForeignKey
ALTER TABLE "application"."Message" DROP CONSTRAINT "Message_toId_fkey";

-- DropForeignKey
ALTER TABLE "user"."NotificationPreferences" DROP CONSTRAINT "NotificationPreferences_userId_fkey";

-- AlterTable
ALTER TABLE "application"."Application" ADD COLUMN     "type" "application"."ApplicationType" NOT NULL DEFAULT 'INITIAL';

-- AlterTable
ALTER TABLE "certificate"."Certificate" ADD COLUMN     "isRenewed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "status" "certificate"."CertificateStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "user"."User" ADD COLUMN     "stakeholderId" TEXT;

-- DropTable
DROP TABLE "application"."Message";

-- DropTable
DROP TABLE "user"."NotificationPreferences";

-- CreateTable
CREATE TABLE "communication"."Conversation" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT,
    "ecoApplicationId" TEXT,
    "title" TEXT,
    "type" "communication"."ConversationType" NOT NULL DEFAULT 'GENERAL',
    "status" "communication"."ConversationStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "communication"."ConversationParticipant" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "communication"."ParticipantRole" NOT NULL DEFAULT 'MEMBER',
    "hasUnread" BOOLEAN NOT NULL DEFAULT false,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "isMuted" BOOLEAN NOT NULL DEFAULT false,
    "lastReadAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConversationParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "communication"."Message" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT,
    "content" TEXT NOT NULL,
    "messageType" "communication"."MessageType" NOT NULL DEFAULT 'TEXT',
    "status" "communication"."MessageStatus" NOT NULL DEFAULT 'SENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "communication"."MessageAttachment" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MessageAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "complaint"."Complaint" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "submitter_email" TEXT,
    "submitter_name" TEXT,
    "submitter_phone" TEXT,
    "submitter_ip" TEXT,
    "category" "complaint"."ComplaintCategory" NOT NULL DEFAULT 'GENERAL',
    "type" "complaint"."ComplaintType" NOT NULL DEFAULT 'PUBLIC',
    "startup_target_id" TEXT,
    "builder_target_id" TEXT,
    "application_id" TEXT,
    "eco_application_id" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "file_id" TEXT,
    "status" "complaint"."ComplaintStatus" NOT NULL DEFAULT 'PENDING',
    "action_taken" "complaint"."AdminResolution" NOT NULL DEFAULT 'NONE',
    "assigned_to_id" TEXT,
    "resolution_notes" TEXT,
    "tracking_code" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Complaint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "complaint"."ComplaintHistory" (
    "id" TEXT NOT NULL,
    "complaint_id" TEXT NOT NULL,
    "user_id" TEXT,
    "action" TEXT NOT NULL,
    "old_status" TEXT,
    "new_status" TEXT,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ComplaintHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ecosystem"."Stakeholder" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "website" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "region" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "portalAccess" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Stakeholder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "communication"."FormalRequest" (
    "id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" "communication"."FormalRequestStatus" NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "senderId" TEXT NOT NULL,
    "recipientStakeholderId" TEXT NOT NULL,
    "attachmentFileId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FormalRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification"."NotificationPreferences" (
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
CREATE TABLE "notification"."Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'info',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "link" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemConfig" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RateLimit" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "expireAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RateLimit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Conversation_applicationId_idx" ON "communication"."Conversation"("applicationId");

-- CreateIndex
CREATE INDEX "Conversation_ecoApplicationId_idx" ON "communication"."Conversation"("ecoApplicationId");

-- CreateIndex
CREATE INDEX "Conversation_type_idx" ON "communication"."Conversation"("type");

-- CreateIndex
CREATE INDEX "ConversationParticipant_userId_idx" ON "communication"."ConversationParticipant"("userId");

-- CreateIndex
CREATE INDEX "ConversationParticipant_conversationId_idx" ON "communication"."ConversationParticipant"("conversationId");

-- CreateIndex
CREATE INDEX "ConversationParticipant_updatedAt_idx" ON "communication"."ConversationParticipant"("updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ConversationParticipant_conversationId_userId_key" ON "communication"."ConversationParticipant"("conversationId", "userId");

-- CreateIndex
CREATE INDEX "Message_conversationId_idx" ON "communication"."Message"("conversationId");

-- CreateIndex
CREATE INDEX "Message_senderId_idx" ON "communication"."Message"("senderId");

-- CreateIndex
CREATE INDEX "Message_createdAt_idx" ON "communication"."Message"("createdAt");

-- CreateIndex
CREATE INDEX "Message_updatedAt_idx" ON "communication"."Message"("updatedAt");

-- CreateIndex
CREATE INDEX "MessageAttachment_messageId_idx" ON "communication"."MessageAttachment"("messageId");

-- CreateIndex
CREATE INDEX "MessageAttachment_fileId_idx" ON "communication"."MessageAttachment"("fileId");

-- CreateIndex
CREATE UNIQUE INDEX "Complaint_tracking_code_key" ON "complaint"."Complaint"("tracking_code");

-- CreateIndex
CREATE INDEX "Complaint_status_idx" ON "complaint"."Complaint"("status");

-- CreateIndex
CREATE INDEX "Complaint_type_idx" ON "complaint"."Complaint"("type");

-- CreateIndex
CREATE INDEX "Complaint_user_id_idx" ON "complaint"."Complaint"("user_id");

-- CreateIndex
CREATE INDEX "Complaint_startup_target_id_idx" ON "complaint"."Complaint"("startup_target_id");

-- CreateIndex
CREATE INDEX "Complaint_builder_target_id_idx" ON "complaint"."Complaint"("builder_target_id");

-- CreateIndex
CREATE INDEX "Complaint_tracking_code_idx" ON "complaint"."Complaint"("tracking_code");

-- CreateIndex
CREATE UNIQUE INDEX "Complaint_submitter_email_startup_target_id_key" ON "complaint"."Complaint"("submitter_email", "startup_target_id");

-- CreateIndex
CREATE UNIQUE INDEX "Complaint_submitter_email_builder_target_id_key" ON "complaint"."Complaint"("submitter_email", "builder_target_id");

-- CreateIndex
CREATE UNIQUE INDEX "FormalRequest_attachmentFileId_key" ON "communication"."FormalRequest"("attachmentFileId");

-- CreateIndex
CREATE INDEX "FormalRequest_senderId_idx" ON "communication"."FormalRequest"("senderId");

-- CreateIndex
CREATE INDEX "FormalRequest_recipientStakeholderId_idx" ON "communication"."FormalRequest"("recipientStakeholderId");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationPreferences_userId_key" ON "notification"."NotificationPreferences"("userId");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "notification"."Notification"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SystemConfig_key_key" ON "SystemConfig"("key");

-- CreateIndex
CREATE UNIQUE INDEX "RateLimit_key_key" ON "RateLimit"("key");

-- CreateIndex
CREATE INDEX "RateLimit_expireAt_idx" ON "RateLimit"("expireAt");

-- AddForeignKey
ALTER TABLE "communication"."Conversation" ADD CONSTRAINT "Conversation_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "application"."Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "communication"."Conversation" ADD CONSTRAINT "Conversation_ecoApplicationId_fkey" FOREIGN KEY ("ecoApplicationId") REFERENCES "ecosystem"."EcoApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "communication"."ConversationParticipant" ADD CONSTRAINT "ConversationParticipant_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "communication"."Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "communication"."ConversationParticipant" ADD CONSTRAINT "ConversationParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "communication"."Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "communication"."Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "communication"."Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "user"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "communication"."MessageAttachment" ADD CONSTRAINT "MessageAttachment_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "file"."File"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "communication"."MessageAttachment" ADD CONSTRAINT "MessageAttachment_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "communication"."Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaint"."Complaint" ADD CONSTRAINT "Complaint_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "application"."Application"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaint"."Complaint" ADD CONSTRAINT "Complaint_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "user"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaint"."Complaint" ADD CONSTRAINT "Complaint_builder_target_id_fkey" FOREIGN KEY ("builder_target_id") REFERENCES "ecosystem"."EcosystemBuilder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaint"."Complaint" ADD CONSTRAINT "Complaint_eco_application_id_fkey" FOREIGN KEY ("eco_application_id") REFERENCES "ecosystem"."EcoApplication"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaint"."Complaint" ADD CONSTRAINT "Complaint_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "file"."File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaint"."Complaint" ADD CONSTRAINT "Complaint_startup_target_id_fkey" FOREIGN KEY ("startup_target_id") REFERENCES "application"."Startup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaint"."Complaint" ADD CONSTRAINT "Complaint_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaint"."ComplaintHistory" ADD CONSTRAINT "ComplaintHistory_complaint_id_fkey" FOREIGN KEY ("complaint_id") REFERENCES "complaint"."Complaint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaint"."ComplaintHistory" ADD CONSTRAINT "ComplaintHistory_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "communication"."FormalRequest" ADD CONSTRAINT "FormalRequest_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "application"."Startup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "communication"."FormalRequest" ADD CONSTRAINT "FormalRequest_recipientStakeholderId_fkey" FOREIGN KEY ("recipientStakeholderId") REFERENCES "ecosystem"."Stakeholder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "communication"."FormalRequest" ADD CONSTRAINT "FormalRequest_attachmentFileId_fkey" FOREIGN KEY ("attachmentFileId") REFERENCES "file"."File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification"."NotificationPreferences" ADD CONSTRAINT "NotificationPreferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification"."Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user"."User" ADD CONSTRAINT "User_stakeholderId_fkey" FOREIGN KEY ("stakeholderId") REFERENCES "ecosystem"."Stakeholder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
