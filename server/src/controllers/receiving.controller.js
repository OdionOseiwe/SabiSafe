import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { asyncHandler, badRequest, notFound } from "../utils/errors.js";
import { ethToWei } from "../utils/amounts.js";
import { env } from "../config/env.js";
import { publicReceivingRequest } from "./serializers.js";

const createSchema = z.object({
  payerName: z.string().trim().min(1, "Who is sending you money?").max(80),
  amountEth: z.string().trim().max(40).optional().or(z.literal("")),
  note: z.string().trim().max(280).optional().or(z.literal("")),
});

const statusSchema = z.object({ status: z.enum(["SHARED", "CANCELLED"]) });

export const schemas = { createSchema, statusSchema };

function shareUrlFor(id) {
  return `${env.clientUrl.replace(/\/$/, "")}/receive/request/${id}`;
}

export const createReceivingRequest = asyncHandler(async (req, res) => {
  const wallet = await prisma.walletConnection.findFirst({
    where: { userId: req.userId },
    orderBy: { lastSeenAt: "desc" },
  });
  if (!wallet) {
    throw badRequest("Connect your Aurora wallet first so people know where to send the money.", [
      { field: "wallet", message: "No wallet connected." },
    ]);
  }

  let amountWei = null;
  if (req.body.amountEth) {
    try {
      amountWei = ethToWei(req.body.amountEth);
    } catch (error) {
      throw badRequest(error.message, [{ field: "amountEth", message: error.message }]);
    }
  }

  const request = await prisma.receivingRequest.create({
    data: {
      userId: req.userId,
      payerName: req.body.payerName,
      recipientAddress: wallet.accountId,
      amountWei,
      note: req.body.note || null,
      network: wallet.network,
    },
  });

  res.status(201).json({
    request: publicReceivingRequest(request, { shareUrl: shareUrlFor(request.id) }),
  });
});

export const listReceivingRequests = asyncHandler(async (req, res) => {
  const rows = await prisma.receivingRequest.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  res.json({
    requests: rows.map((row) => publicReceivingRequest(row, { shareUrl: shareUrlFor(row.id) })),
  });
});

export const updateReceivingStatus = asyncHandler(async (req, res) => {
  const request = await prisma.receivingRequest.findFirst({
    where: { id: req.params.id, userId: req.userId },
  });
  if (!request) throw notFound("That request could not be found.");
  if (!["SHARED", "CANCELLED"].includes(req.body.status)) {
    throw badRequest("Choose either SHARED or CANCELLED.");
  }

  const updated = await prisma.receivingRequest.update({
    where: { id: request.id },
    data: { status: req.body.status },
  });
  res.json({ request: publicReceivingRequest(updated, { shareUrl: shareUrlFor(updated.id) }) });
});

/**
 * Public, minimal view for someone who opened a shared request link.
 * No account data, email, or history is exposed.
 */
export const getPublicReceivingRequest = asyncHandler(async (req, res) => {
  const request = await prisma.receivingRequest.findUnique({
    where: { id: req.params.id },
    include: { user: { select: { firstName: true } } },
  });
  if (!request) throw notFound("That payment request could not be found.");

  res.json({
    request: {
      ...publicReceivingRequest(request),
      recipientName: request.user?.firstName || "A SabiSafe user",
      status: request.status,
    },
    network: request.network,
    chainId: env.aurora.chainId,
    faucetUrl: env.aurora.faucetUrl,
    notice:
      "SabiSafe only displays this request. Money is sent from your own wallet. Always check the address before you approve.",
  });
});
