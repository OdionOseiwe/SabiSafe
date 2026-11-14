-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Language" AS ENUM ('ENGLISH', 'PIDGIN');

-- CreateEnum
CREATE TYPE "ExperienceLevel" AS ENUM ('COMPLETE_BEGINNER', 'LITTLE_EXPERIENCE', 'EXPERIENCED');

-- CreateEnum
CREATE TYPE "AssistanceMode" AS ENUM ('TEXT', 'VOICE');

-- CreateEnum
CREATE TYPE "Network" AS ENUM ('TESTNET', 'MAINNET');

-- CreateEnum
CREATE TYPE "MessageRole" AS ENUM ('USER', 'ASSISTANT');

-- CreateEnum
CREATE TYPE "AiMode" AS ENUM ('NEAR_AI', 'GUIDE');

-- CreateEnum
CREATE TYPE "ConversationMode" AS ENUM ('EPHEMERAL', 'SAVED_REDACTED');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'CONFIRMED', 'FAILED');

-- CreateEnum
CREATE TYPE "TransactionDirection" AS ENUM ('INCOMING', 'OUTGOING');

-- CreateEnum
CREATE TYPE "ReceivingStatus" AS ENUM ('REQUESTED', 'SHARED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ContactRelationship" AS ENUM ('SON', 'DAUGHTER', 'GRANDDAUGHTER', 'GRANDSON', 'SPOUSE', 'SIBLING', 'OTHER');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "firstName" VARCHAR(80) NOT NULL,
    "email" VARCHAR(160) NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "preferredLanguage" "Language" NOT NULL DEFAULT 'ENGLISH',
    "experienceLevel" "ExperienceLevel" NOT NULL DEFAULT 'COMPLETE_BEGINNER',
    "assistanceMode" "AssistanceMode" NOT NULL DEFAULT 'TEXT',
    "saveAiHistory" BOOLEAN NOT NULL DEFAULT false,
    "onboardedAt" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningLesson" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(120) NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "quiz" JSONB NOT NULL,
    "visual" TEXT NOT NULL DEFAULT 'wallet',
    "difficulty" TEXT NOT NULL DEFAULT 'Beginner',
    "estimatedMinutes" INTEGER NOT NULL DEFAULT 5,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LearningLesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserLearningProgress" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "lessonId" UUID NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "quizScore" INTEGER,
    "answers" JSONB,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserLearningProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "mode" "ConversationMode" NOT NULL DEFAULT 'SAVED_REDACTED',
    "provider" TEXT NOT NULL DEFAULT 'near_ai',
    "model" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" UUID NOT NULL,
    "conversationId" UUID NOT NULL,
    "role" "MessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "aiMode" "AiMode",
    "model" TEXT,
    "signatureKind" TEXT,
    "attestedAt" TIMESTAMP(3),
    "e2ee" BOOLEAN,
    "redacted" BOOLEAN NOT NULL DEFAULT false,
    "verificationSummary" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WalletConnection" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "accountId" VARCHAR(64) NOT NULL,
    "network" "Network" NOT NULL DEFAULT 'TESTNET',
    "connectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WalletConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrustedContact" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "relationship" "ContactRelationship" NOT NULL DEFAULT 'OTHER',
    "walletAddress" VARCHAR(64) NOT NULL,
    "network" "Network" NOT NULL DEFAULT 'TESTNET',
    "onchainStatus" TEXT NOT NULL DEFAULT 'NOT_REGISTERED',
    "onchainCheckedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrustedContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "transactionHash" VARCHAR(64) NOT NULL,
    "senderAddress" VARCHAR(64) NOT NULL,
    "recipientAddress" VARCHAR(64) NOT NULL,
    "amountYocto" TEXT NOT NULL,
    "asset" VARCHAR(16) NOT NULL DEFAULT 'NEAR',
    "network" "Network" NOT NULL DEFAULT 'TESTNET',
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "direction" "TransactionDirection" NOT NULL,
    "blockHeight" TEXT,
    "failureReason" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "explorerUrl" TEXT,
    "source" TEXT NOT NULL DEFAULT 'wallet',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReceivingRequest" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "payerName" VARCHAR(80) NOT NULL,
    "recipientAddress" VARCHAR(64) NOT NULL,
    "asset" VARCHAR(16) NOT NULL DEFAULT 'NEAR',
    "amountYocto" TEXT,
    "network" "Network" NOT NULL DEFAULT 'TESTNET',
    "note" VARCHAR(280),
    "status" "ReceivingStatus" NOT NULL DEFAULT 'REQUESTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReceivingRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PracticeProgress" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "exerciseKey" VARCHAR(80) NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PracticeProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "LearningLesson_slug_key" ON "LearningLesson"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "LearningLesson_order_key" ON "LearningLesson"("order");

-- CreateIndex
CREATE INDEX "UserLearningProgress_userId_completed_idx" ON "UserLearningProgress"("userId", "completed");

-- CreateIndex
CREATE UNIQUE INDEX "UserLearningProgress_userId_lessonId_key" ON "UserLearningProgress"("userId", "lessonId");

-- CreateIndex
CREATE INDEX "Conversation_userId_updatedAt_idx" ON "Conversation"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "Message_conversationId_createdAt_idx" ON "Message"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "WalletConnection_userId_lastSeenAt_idx" ON "WalletConnection"("userId", "lastSeenAt");

-- CreateIndex
CREATE UNIQUE INDEX "WalletConnection_userId_accountId_network_key" ON "WalletConnection"("userId", "accountId", "network");

-- CreateIndex
CREATE INDEX "TrustedContact_userId_createdAt_idx" ON "TrustedContact"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "TrustedContact_userId_walletAddress_key" ON "TrustedContact"("userId", "walletAddress");

-- CreateIndex
CREATE INDEX "Transaction_userId_createdAt_idx" ON "Transaction"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Transaction_userId_status_idx" ON "Transaction"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_userId_transactionHash_key" ON "Transaction"("userId", "transactionHash");

-- CreateIndex
CREATE INDEX "ReceivingRequest_userId_createdAt_idx" ON "ReceivingRequest"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PracticeProgress_userId_exerciseKey_key" ON "PracticeProgress"("userId", "exerciseKey");

-- AddForeignKey
ALTER TABLE "UserLearningProgress" ADD CONSTRAINT "UserLearningProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLearningProgress" ADD CONSTRAINT "UserLearningProgress_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "LearningLesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletConnection" ADD CONSTRAINT "WalletConnection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrustedContact" ADD CONSTRAINT "TrustedContact_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReceivingRequest" ADD CONSTRAINT "ReceivingRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeProgress" ADD CONSTRAINT "PracticeProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

