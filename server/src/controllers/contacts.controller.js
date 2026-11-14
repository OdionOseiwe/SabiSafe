import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { asyncHandler, badRequest, notFound } from "../utils/errors.js";
import { isValidEvmAddress, isZeroAddress } from "../utils/amounts.js";
import { getAccount, getTransactionStatus } from "../services/auroraRpc.js";
import { isTrustedOnchain, isRegistryConfigured } from "../services/registry.js";
import { env } from "../config/env.js";
import { publicContact } from "./serializers.js";

const relationship = z.enum([
  "SON",
  "DAUGHTER",
  "GRANDDAUGHTER",
  "GRANDSON",
  "SPOUSE",
  "SIBLING",
  "OTHER",
]);

const createSchema = z.object({
  name: z.string().trim().min(1, "Please enter a name.").max(80),
  relationship: relationship.default("OTHER"),
  // Validated in the controller so the user gets a clear EVM-address message.
  walletAddress: z.string().trim().min(1).max(80),
});

const updateSchema = z
  .object({
    name: z.string().trim().min(1).max(80).optional(),
    relationship: relationship.optional(),
  })
  .refine((value) => Object.keys(value).length > 0, { message: "Nothing to update." });

const confirmSchema = z.object({ txHash: z.string().trim().regex(/^0x[0-9a-fA-F]{64}$/) });

export const schemas = { createSchema, updateSchema, confirmSchema };

async function registryStatusFor(userId, contactAddress) {
  if (!isRegistryConfigured()) {
    return { status: "UNAVAILABLE", checkedAt: null };
  }
  const wallet = await prisma.walletConnection.findFirst({
    where: { userId },
    orderBy: { lastSeenAt: "desc" },
  });
  if (!wallet) return { status: "UNKNOWN", checkedAt: new Date() };

  const result = await isTrustedOnchain(wallet.accountId, contactAddress);
  if (!result.available) return { status: "UNKNOWN", checkedAt: new Date() };
  return { status: result.trusted ? "REGISTERED" : "NOT_REGISTERED", checkedAt: new Date() };
}

export const listContacts = asyncHandler(async (req, res) => {
  const contacts = await prisma.trustedContact.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: "desc" },
  });
  res.json({
    contacts: contacts.map(publicContact),
    registry: { configured: isRegistryConfigured(), address: env.aurora.registryAddress || null },
  });
});

export const createContact = asyncHandler(async (req, res) => {
  const { name, relationship: relation, walletAddress } = req.body;
  const address = walletAddress.trim().toLowerCase();
  if (!isValidEvmAddress(address)) {
    throw badRequest("That does not look like an EVM wallet address. It should start with 0x and have 40 characters after it.", [
      { field: "walletAddress", message: "Invalid EVM address format." },
    ]);
  }
  if (isZeroAddress(address)) {
    throw badRequest("That is the empty address, not a person's wallet. Ask them to copy their address again.");
  }

  const existing = await prisma.trustedContact.findFirst({
    where: { userId: req.userId, walletAddress: address },
  });
  if (existing) throw badRequest("This address is already in your trusted contacts.");

  const account = await getAccount(address).catch(() => null);
  if (account?.isContract) {
    throw badRequest("That address belongs to a contract, not a personal wallet. Save a wallet address instead.");
  }

  const onchain = await registryStatusFor(req.userId, address);

  const contact = await prisma.trustedContact.create({
    data: {
      userId: req.userId,
      name,
      relationship: relation,
      walletAddress: address,
      network: "AURORA_TESTNET",
      onchainStatus: onchain.status,
      onchainCheckedAt: onchain.checkedAt,
    },
  });

  res.status(201).json({ contact: publicContact(contact) });
});

export const updateContact = asyncHandler(async (req, res) => {
  const contact = await prisma.trustedContact.findFirst({
    where: { id: req.params.id, userId: req.userId },
  });
  if (!contact) throw notFound("That contact could not be found.");

  const updated = await prisma.trustedContact.update({
    where: { id: contact.id },
    data: req.body,
  });
  res.json({ contact: publicContact(updated) });
});

export const deleteContact = asyncHandler(async (req, res) => {
  const contact = await prisma.trustedContact.findFirst({
    where: { id: req.params.id, userId: req.userId },
  });
  if (!contact) throw notFound("That contact could not be found.");
  await prisma.trustedContact.delete({ where: { id: contact.id } });
  res.json({ ok: true });
});

export const refreshOnchainStatus = asyncHandler(async (req, res) => {
  const contact = await prisma.trustedContact.findFirst({
    where: { id: req.params.id, userId: req.userId },
  });
  if (!contact) throw notFound("That contact could not be found.");

  const onchain = await registryStatusFor(req.userId, contact.walletAddress);
  const updated = await prisma.trustedContact.update({
    where: { id: contact.id },
    data: { onchainStatus: onchain.status, onchainCheckedAt: onchain.checkedAt },
  });
  res.json({ contact: publicContact(updated) });
});

/**
 * After the user signs addTrusted in their wallet, verify the real transaction
 * on chain and re-read the registry before marking the contact approved.
 */
export const confirmOnchainApproval = asyncHandler(async (req, res) => {
  const contact = await prisma.trustedContact.findFirst({
    where: { id: req.params.id, userId: req.userId },
  });
  if (!contact) throw notFound("That contact could not be found.");
  if (!isRegistryConfigured()) throw badRequest("The onchain registry is not deployed yet.");

  const wallet = await prisma.walletConnection.findFirst({
    where: { userId: req.userId },
    orderBy: { lastSeenAt: "desc" },
  });
  if (!wallet) throw badRequest("Connect your Aurora wallet first.");

  const chain = await getTransactionStatus(req.body.txHash);
  if (!chain.found) throw badRequest("That transaction is not on chain yet. Try again in a moment.");
  if (!chain.confirmed) throw badRequest("That transaction did not succeed on chain.");
  if (String(chain.from || "").toLowerCase() !== String(wallet.accountId).toLowerCase()) {
    throw badRequest("That transaction was not signed by your connected wallet.");
  }
  if (String(chain.to || "").toLowerCase() !== String(env.aurora.registryAddress).toLowerCase()) {
    throw badRequest("That transaction was not sent to the SabiSafe registry contract.");
  }

  const onchain = await isTrustedOnchain(wallet.accountId, contact.walletAddress);
  if (!onchain.available) throw badRequest("The registry could not be read right now.");
  if (!onchain.trusted) {
    throw badRequest("The registry does not show this contact as approved yet. Wait a moment and check again.");
  }

  const updated = await prisma.trustedContact.update({
    where: { id: contact.id },
    data: { onchainStatus: "REGISTERED", onchainCheckedAt: new Date() },
  });
  res.json({ contact: publicContact(updated), registryVerified: true });
});
