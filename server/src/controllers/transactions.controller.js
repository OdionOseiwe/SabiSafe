import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { asyncHandler, AppError, badRequest, forbidden, notFound } from "../utils/errors.js";
import { getTransactionStatus, explorerTransactionUrl } from "../services/auroraRpc.js";
import { publicTransaction } from "./serializers.js";

const verifySchema = z.object({
  txHash: z.string().trim().regex(/^0x[0-9a-fA-F]{64}$/, "Enter a full 0x transaction hash."),
});

export const schemas = { verifySchema };

async function connectedWallet(userId) {
  const wallet = await prisma.walletConnection.findFirst({
    where: { userId },
    orderBy: { lastSeenAt: "desc" },
  });
  if (!wallet) {
    throw badRequest(
      "Connect your Aurora wallet before recording a payment. SabiSafe only records payments that it can check on chain.",
    );
  }
  return wallet;
}

async function verifyAndStore({ userId, txHash, wallet, source = "wallet" }) {
  const chain = await getTransactionStatus(txHash);

  if (!chain.found) {
    throw new AppError(
      404,
      "TRANSACTION_NOT_FOUND",
      "The transaction is not on chain yet. It can take a few seconds. Try checking again.",
      { retryable: true, chainReason: chain.reason },
    );
  }

  const from = String(chain.from || "").toLowerCase();
  const to = String(chain.to || "").toLowerCase();
  const own = wallet.accountId.toLowerCase();

  if (from !== own && to !== own) {
    throw forbidden("That transaction does not involve your connected wallet.");
  }

  const direction = from === own ? "OUTGOING" : "INCOMING";
  const status = chain.confirmed ? "CONFIRMED" : chain.failed ? "FAILED" : "PENDING";

  const existing = await prisma.transaction.findUnique({
    where: { userId_transactionHash: { userId, transactionHash: chain.hash || txHash } },
  });

  const data = {
    senderAddress: chain.from || wallet.accountId,
    recipientAddress: chain.to || "",
    amountWei: chain.valueWei || existing?.amountWei || "0",
    status,
    direction,
    blockHeight: chain.blockHeight,
    failureReason: chain.failure,
    verifiedAt: chain.confirmed || chain.failed ? new Date() : null,
    explorerUrl: explorerTransactionUrl(chain.hash || txHash),
    source,
  };

  const saved = existing
    ? await prisma.transaction.update({ where: { id: existing.id }, data })
    : await prisma.transaction.create({
        data: {
          userId,
          transactionHash: chain.hash || txHash,
          network: wallet.network,
          ...data,
        },
      });

  return { transaction: saved, chain };
}

export const verifyTransaction = asyncHandler(async (req, res) => {
  const wallet = await connectedWallet(req.userId);
  const { transaction, chain } = await verifyAndStore({
    userId: req.userId,
    txHash: req.body.txHash,
    wallet,
  });

  res.status(201).json({
    transaction: publicTransaction(transaction),
    chain: {
      confirmed: chain.confirmed,
      failed: chain.failed,
      pending: chain.pending,
      blockHeight: chain.blockHeight,
      valueWei: chain.valueWei,
      confirmations: chain.confirmations,
      gasUsed: chain.gasUsed,
      feeWei: chain.feeWei,
      timestamp: chain.timestamp,
    },
  });
});

export const refreshTransaction = asyncHandler(async (req, res) => {
  const wallet = await connectedWallet(req.userId);
  const existing = await prisma.transaction.findUnique({
    where: { userId_transactionHash: { userId: req.userId, transactionHash: req.params.hash } },
  });
  if (!existing) throw notFound("That transaction is not in your history.");

  const { transaction } = await verifyAndStore({
    userId: req.userId,
    txHash: req.params.hash,
    wallet,
    source: existing.source,
  });

  res.json({ transaction: publicTransaction(transaction) });
});

export const listTransactions = asyncHandler(async (req, res) => {
  const rows = await prisma.transaction.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  let sentWei = 0n;
  let receivedWei = 0n;
  for (const row of rows) {
    if (row.status !== "CONFIRMED") continue;
    try {
      if (row.direction === "OUTGOING") sentWei += BigInt(row.amountWei);
      else receivedWei += BigInt(row.amountWei);
    } catch {
      // Ignore malformed historical rows; never display a guessed total.
    }
  }

  res.json({
    transactions: rows.map(publicTransaction),
    summary: {
      count: rows.length,
      confirmed: rows.filter((row) => row.status === "CONFIRMED").length,
      sentWei: sentWei.toString(),
      receivedWei: receivedWei.toString(),
    },
  });
});
