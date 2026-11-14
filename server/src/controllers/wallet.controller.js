import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../utils/errors.js";
import { badRequest, notFound } from "../utils/errors.js";
import { isValidEvmAddress, isZeroAddress } from "../utils/amounts.js";
import { getAccount, getLatestBlock, explorerAccountUrl } from "../services/auroraRpc.js";
import { getAccountActivity } from "../services/activity.js";
import { env } from "../config/env.js";

const connectSchema = z.object({
  // Validated in the controller so the user gets a clear EVM-address message.
  accountId: z.string().trim().min(1).max(80),
  network: z.enum(["AURORA_TESTNET", "AURORA_MAINNET"]).optional(),
});

export const schemas = { connectSchema };

function normaliseAddress(value) {
  return String(value || "").trim().toLowerCase();
}

export const connectWallet = asyncHandler(async (req, res) => {
  const accountId = normaliseAddress(req.body.accountId);
  if (!isValidEvmAddress(accountId)) {
    throw badRequest("That does not look like an EVM wallet address. It should start with 0x and have 40 characters after it.", [
      { field: "accountId", message: "Invalid EVM address format." },
    ]);
  }
  if (isZeroAddress(accountId)) {
    throw badRequest("That is the empty address. Open your wallet and copy your own address again.");
  }

  const account = await getAccount(accountId);
  if (account.isContract) {
    throw badRequest("That address belongs to a contract, not a wallet. Connect a wallet address you control.");
  }

  const existing = await prisma.walletConnection.findFirst({
    where: { userId: req.userId, accountId, network: "AURORA_TESTNET" },
  });

  const wallet = existing
    ? await prisma.walletConnection.update({
        where: { id: existing.id },
        data: { lastSeenAt: new Date() },
      })
    : await prisma.walletConnection.create({
        data: { userId: req.userId, accountId, network: "AURORA_TESTNET" },
      });

  res.status(201).json({
    wallet: {
      address: wallet.accountId,
      accountId: wallet.accountId,
      network: wallet.network,
      chainId: env.aurora.chainId,
      connectedAt: wallet.connectedAt,
      balanceWei: account.balanceWei,
      nonce: account.nonce,
      explorerUrl: explorerAccountUrl(accountId),
      verifiedAt: new Date().toISOString(),
    },
  });
});

export const getWallet = asyncHandler(async (req, res) => {
  const wallet = await prisma.walletConnection.findFirst({
    where: { userId: req.userId },
    orderBy: { lastSeenAt: "desc" },
  });
  if (!wallet) return res.json({ wallet: null });

  let chain = null;
  try {
    const [account, block] = await Promise.all([getAccount(wallet.accountId), getLatestBlock().catch(() => null)]);
    chain = {
      exists: account.exists,
      balanceWei: account.balanceWei,
      nonce: account.nonce,
      isContract: account.isContract,
      blockHeight: block?.height ?? null,
    };
  } catch {
    chain = { exists: null, balanceWei: null, unavailable: true };
  }

  await prisma.walletConnection.update({ where: { id: wallet.id }, data: { lastSeenAt: new Date() } });

  res.json({
    wallet: {
      address: wallet.accountId,
      accountId: wallet.accountId,
      network: wallet.network,
      chainId: env.aurora.chainId,
      connectedAt: wallet.connectedAt,
      explorerUrl: explorerAccountUrl(wallet.accountId),
      faucetUrl: env.aurora.faucetUrl,
      chain,
      verifiedAt: chain?.unavailable ? null : new Date().toISOString(),
    },
  });
});

export const disconnectWallet = asyncHandler(async (req, res) => {
  await prisma.walletConnection.deleteMany({ where: { userId: req.userId } });
  res.json({ ok: true });
});

export const getWalletActivity = asyncHandler(async (req, res) => {
  const wallet = await prisma.walletConnection.findFirst({
    where: { userId: req.userId },
    orderBy: { lastSeenAt: "desc" },
  });
  if (!wallet) throw notFound("Connect an Aurora wallet first to see activity.");

  const activity = await getAccountActivity(wallet.accountId, { limit: 15 });
  res.json({
    address: wallet.accountId,
    accountId: wallet.accountId,
    ...activity,
    network: wallet.network,
    explorerUrl: explorerAccountUrl(wallet.accountId),
  });
});
