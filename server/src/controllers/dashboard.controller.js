import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../utils/errors.js";
import { getAccount, getLatestBlock } from "../services/auroraRpc.js";
import { assessTransfer, SAFETY_TIPS } from "../services/safety.js";
import { publicContact, publicTransaction } from "./serializers.js";
import { isNearAiConfigured } from "../services/nearAi.js";
import { env } from "../config/env.js";

function safetyTipForToday() {
  const day = Math.floor(Date.now() / 86_400_000);
  return SAFETY_TIPS[day % SAFETY_TIPS.length];
}

export const getDashboard = asyncHandler(async (req, res) => {
  const [user, lessons, progress, wallet, transactions, contactCount, practiceDone] = await Promise.all([
    prisma.user.findUnique({ where: { id: req.userId } }),
    prisma.learningLesson.findMany({ orderBy: { order: "asc" } }),
    prisma.userLearningProgress.findMany({ where: { userId: req.userId } }),
    prisma.walletConnection.findFirst({
      where: { userId: req.userId },
      orderBy: { lastSeenAt: "desc" },
    }),
    prisma.transaction.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.trustedContact.count({ where: { userId: req.userId } }),
    prisma.practiceProgress.findMany({ where: { userId: req.userId }, select: { exerciseKey: true } }),
  ]);

  const completedIds = new Set(progress.filter((item) => item.completed).map((item) => item.lessonId));
  const nextLesson = lessons.find((lesson) => !completedIds.has(lesson.id)) || null;

  let balance = null;
  if (wallet) {
    try {
      const [account, block] = await Promise.all([getAccount(wallet.accountId), getLatestBlock().catch(() => null)]);
      balance = {
        address: wallet.accountId,
        accountId: wallet.accountId,
        exists: account.exists,
        balanceWei: account.balanceWei,
        nonce: account.nonce,
        blockHeight: block?.height ?? null,
      };
    } catch {
      balance = { address: wallet.accountId, accountId: wallet.accountId, exists: true, balanceWei: null, unavailable: true };
    }
  }

  res.json({
    user: { firstName: user.firstName, experienceLevel: user.experienceLevel, preferredLanguage: user.preferredLanguage },
    learning: {
      total: lessons.length,
      completed: completedIds.size,
      nextLesson: nextLesson
        ? { slug: nextLesson.slug, title: nextLesson.title, estimatedMinutes: nextLesson.estimatedMinutes }
        : null,
    },
    wallet: wallet
      ? {
          address: wallet.accountId,
          accountId: wallet.accountId,
          network: wallet.network,
          chainId: env.aurora.chainId,
          connectedAt: wallet.connectedAt,
          balance,
        }
      : null,
    transactions: transactions.map(publicTransaction),
    contacts: { count: contactCount },
    practice: { completed: practiceDone.length },
    ai: {
      configured: isNearAiConfigured(),
      provider: "NEAR AI Cloud",
      privateByDefault: true,
    },
    safetyTip: safetyTipForToday(),
    generatedAt: new Date().toISOString(),
  });
});
