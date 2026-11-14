import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../utils/errors.js";
import { badRequest } from "../utils/errors.js";
import { ethToWei, formatEth, isValidEvmAddress } from "../utils/amounts.js";
import { getAccount } from "../services/auroraRpc.js";
import { assessTransfer, SAFETY_TIPS, scanMessageForScam } from "../services/safety.js";

const preflightSchema = z.object({
  // Let the controller return a friendly risk assessment for a malformed
  // address instead of a generic schema error.
  recipient: z.string().trim().min(1).max(80),
  amountEth: z.string().trim().min(1).max(40),
});

export const preflight = asyncHandler(async (req, res) => {
  const { recipient, amountEth } = req.body;
  const address = recipient.trim().toLowerCase();

  if (!isValidEvmAddress(address)) {
    return res.json({
      assessment: assessTransfer({ recipient: address, amountEth, contacts: [], account: null }),
      balance: null,
    });
  }

  let amountWei;
  try {
    amountWei = ethToWei(amountEth);
  } catch (error) {
    throw badRequest(error.message);
  }

  const [wallet, contacts] = await Promise.all([
    prisma.walletConnection.findFirst({
      where: { userId: req.userId },
      orderBy: { lastSeenAt: "desc" },
    }),
    prisma.trustedContact.findMany({ where: { userId: req.userId } }),
  ]);

  if (!wallet) {
    throw badRequest("Connect your Aurora wallet before sending money.");
  }

  const [account, own] = await Promise.all([
    getAccount(address).catch(() => null),
    getAccount(wallet.accountId).catch(() => null),
  ]);

  const assessment = assessTransfer({
    recipient: address,
    amountEth,
    amountWei,
    contacts,
    ownAddress: wallet.accountId,
    account,
  });

  let balance = null;
  if (own) {
    const available = BigInt(own.balanceWei || "0");
    const requested = BigInt(amountWei);
    balance = {
      address: wallet.accountId,
      balanceWei: own.balanceWei,
      balanceEth: formatEth(own.balanceWei),
      requestedWei: amountWei,
      requestedEth: formatEth(amountWei),
      // Keep a small buffer because gas is paid in ETH.
      sufficient: available > requested,
      availableAfterWei: available > requested ? (available - requested).toString() : "0",
    };
  }

  if (balance && !balance.sufficient) {
    assessment.reasons.push({
      code: "INSUFFICIENT_BALANCE",
      level: "high_risk",
      title: "Not enough ETH in your wallet",
      message: `You have about ${balance.balanceEth} ETH, but this payment needs ${balance.requestedEth} ETH plus the network fee.`,
      action: "Get more testnet ETH or lower the amount.",
    });
    assessment.level = "high_risk";
    assessment.requiresExtraConfirmation = true;
    assessment.blocking = "This payment is larger than the balance we checked on chain.";
  }

  res.json({ assessment, balance, network: wallet.network });
});

const scanSchema = z.object({
  message: z.string().trim().min(3).max(4000),
});

export const schemas = { preflightSchema, scanSchema };

export const scanMessage = asyncHandler(async (req, res) => {
  const result = scanMessageForScam(req.body.message);
  res.json({
    ...result,
    note: "This is an automatic pattern check, not a guarantee. When in doubt, ask a person you trust.",
  });
});

export const getSafetyTips = asyncHandler(async (_req, res) => {
  res.json({
    tips: SAFETY_TIPS,
    reminder: "A valid wallet address only means the format is correct. It does not make the person honest.",
  });
});
