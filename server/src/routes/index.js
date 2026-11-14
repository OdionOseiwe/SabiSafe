import { Router } from "express";
import { z } from "zod";

import { env, publicConfig } from "../config/env.js";
import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../utils/errors.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { authLimiter, aiLimiter, transactionLimiter } from "../middleware/rateLimit.js";
import { isNearAiConfigured } from "../services/nearAi.js";
import { isRegistryConfigured } from "../services/registry.js";

import * as auth from "../controllers/auth.controller.js";
import * as dashboard from "../controllers/dashboard.controller.js";
import * as lessons from "../controllers/lessons.controller.js";
import * as ai from "../controllers/ai.controller.js";
import * as wallet from "../controllers/wallet.controller.js";
import * as transactions from "../controllers/transactions.controller.js";
import * as contacts from "../controllers/contacts.controller.js";
import * as receiving from "../controllers/receiving.controller.js";
import * as safety from "../controllers/safety.controller.js";
import * as practice from "../controllers/practice.controller.js";

const router = Router();

router.get(
  "/health",
  asyncHandler(async (_req, res) => {
    let database = "unavailable";
    if (env.databaseUrl) {
      try {
        await prisma.$queryRaw`SELECT 1`;
        database = "ok";
      } catch {
        database = "error";
      }
    }
    res.json({
      status: database === "error" ? "degraded" : "ok",
      service: "sabisafe-api",
      time: new Date().toISOString(),
      database,
      ai: isNearAiConfigured() ? "near_ai" : "guide_fallback",
      registry: isRegistryConfigured() ? "configured" : "not_deployed",
      version: "1.0.0",
    });
  }),
);

router.get("/config", (_req, res) => {
  res.json({
    ...publicConfig,
    networkLabel: "Aurora Testnet",
    testnet: true,
    features: {
      aiChat: true,
      aiFallback: true,
      attestationPanel: true,
      walletConnect: true,
      onchainRegistry: isRegistryConfigured(),
      voice: true,
      practice: true,
    },
    limits: {
      aiMaxMessageLength: 1500,
      aiMaxOutputTokens: env.nearAi.maxOutputTokens,
    },
    safety: {
      largeAmountEth: env.safety.largeAmountEth,
      disclaimer:
        "SabiSafe checks formats and common scam patterns. It cannot prove a person is honest. Never share your recovery phrase.",
    },
  });
});

// ---- Auth ----
router.post("/auth/register", authLimiter, validate(auth.schemas.registerSchema), auth.register);
router.post("/auth/login", authLimiter, validate(auth.schemas.loginSchema), auth.login);
router.post("/auth/logout", auth.logout);
router.get("/auth/me", requireAuth, auth.me);

// ---- Profile ----
router.patch("/users/me", requireAuth, validate(auth.schemas.updateProfileSchema), auth.updateProfile);
router.post(
  "/users/me/password",
  requireAuth,
  authLimiter,
  validate(auth.schemas.passwordSchema),
  auth.changePassword,
);

// ---- Dashboard ----
router.get("/dashboard", requireAuth, dashboard.getDashboard);

// ---- Learning ----
router.get("/lessons", requireAuth, lessons.listLessons);
router.get("/lessons/:slug", requireAuth, lessons.getLesson);
router.post("/lessons/:slug/quiz", requireAuth, validate(lessons.schemas?.submitSchema || z.object({ answers: z.array(z.number()) })), lessons.submitQuiz);

// ---- AI ----
router.get("/ai/status", ai.getStatus);
router.get("/ai/attestation", requireAuth, aiLimiter, ai.getAttestation);
router.post("/ai/chat", requireAuth, aiLimiter, validate(ai.schemas.chatSchema), ai.chat);
router.get("/ai/conversations", requireAuth, ai.listConversations);
router.get("/ai/conversations/:id", requireAuth, ai.getConversation);
router.delete("/ai/conversations/:id", requireAuth, ai.deleteConversation);

// ---- Wallet ----
router.get("/wallet", requireAuth, wallet.getWallet);
router.post("/wallet/connect", requireAuth, transactionLimiter, validate(wallet.schemas.connectSchema), wallet.connectWallet);
router.delete("/wallet", requireAuth, wallet.disconnectWallet);
router.get("/wallet/activity", requireAuth, wallet.getWalletActivity);

// ---- Transactions ----
router.get("/transactions", requireAuth, transactions.listTransactions);
router.post(
  "/transactions/verify",
  requireAuth,
  transactionLimiter,
  validate(transactions.schemas.verifySchema),
  transactions.verifyTransaction,
);
router.post("/transactions/:hash/refresh", requireAuth, transactionLimiter, transactions.refreshTransaction);

// ---- Contacts ----
router.get("/contacts", requireAuth, contacts.listContacts);
router.post("/contacts", requireAuth, validate(contacts.schemas.createSchema), contacts.createContact);
router.patch(
  "/contacts/:id",
  requireAuth,
  validate(contacts.schemas.updateSchema),
  contacts.updateContact,
);
router.delete("/contacts/:id", requireAuth, contacts.deleteContact);
router.post("/contacts/:id/verify-registry", requireAuth, contacts.refreshOnchainStatus);
router.post(
  "/contacts/:id/confirm-onchain",
  requireAuth,
  validate(contacts.schemas.confirmSchema),
  contacts.confirmOnchainApproval,
);

// ---- Receiving ----
router.get("/receiving", requireAuth, receiving.listReceivingRequests);
router.post(
  "/receiving",
  requireAuth,
  validate(receiving.schemas.createSchema),
  receiving.createReceivingRequest,
);
router.patch(
  "/receiving/:id",
  requireAuth,
  validate(receiving.schemas.statusSchema),
  receiving.updateReceivingStatus,
);
router.get("/receiving/public/:id", receiving.getPublicReceivingRequest);

// ---- Safety ----
router.get("/safety/tips", requireAuth, safety.getSafetyTips);
router.post("/safety/preflight", requireAuth, transactionLimiter, validate(safety.schemas.preflightSchema), safety.preflight);
router.post("/safety/scan-message", requireAuth, validate(safety.schemas.scanSchema), safety.scanMessage);

// ---- Practice ----
router.get("/practice", requireAuth, practice.getPractice);
router.post("/practice/:key/complete", requireAuth, practice.completeExercise);

export default router;
