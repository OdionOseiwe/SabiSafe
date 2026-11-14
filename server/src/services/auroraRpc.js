import { decodeFunctionResult, encodeFunctionData } from "viem";
import { env } from "../config/env.js";
import { upstream } from "../utils/errors.js";
import { logger } from "../utils/logger.js";

const RPC_TIMEOUT_MS = 20_000;
let rpcId = 0;

/**
 * Minimal Aurora (EVM) JSON-RPC client. Aurora RPC is the source of truth for
 * balances, transaction status, and registry reads. Blockscout is only used as
 * optional readable activity enrichment.
 */
async function rpc(method, params = []) {
  const body = { jsonrpc: "2.0", id: `sabisafe-${++rpcId}`, method, params };

  let response;
  try {
    response = await fetch(env.aurora.rpcUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(RPC_TIMEOUT_MS),
    });
  } catch (error) {
    logger.error("Aurora RPC request failed", { method, reason: error?.message });
    const failure = upstream("The Aurora network is not responding right now. Please try again in a moment.");
    failure.rpcName = "NETWORK_ERROR";
    throw failure;
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok || payload?.error) {
    logger.warn("Aurora RPC error", {
      method,
      status: response.status,
      code: payload?.error?.code,
      reason: payload?.error?.message,
    });
    const error = upstream("The Aurora network could not answer that request.");
    error.rpcName = payload?.error?.code ? String(payload.error.code) : "RPC_ERROR";
    error.rpcMessage = payload?.error?.message;
    throw error;
  }

  return payload?.result;
}

/** Fetch an address and its exact liquid balance in wei. */
export async function getAccount(address) {
  const [balanceHex, nonceHex, code] = await Promise.all([
    rpc("eth_getBalance", [address, "latest"]),
    rpc("eth_getTransactionCount", [address, "latest"]),
    rpc("eth_getCode", [address, "latest"]),
  ]);

  const balanceWei = BigInt(balanceHex ?? "0x0").toString();
  const nonce = Number(BigInt(nonceHex ?? "0x0"));
  const isContract = Boolean(code && code !== "0x");

  return {
    exists: BigInt(balanceWei) > 0n || nonce > 0 || isContract,
    address,
    balanceWei,
    nonce,
    isContract,
    codeHash: null,
  };
}

/** Current latest block number, used as a freshness stamp. */
export async function getLatestBlock() {
  const hex = await rpc("eth_blockNumber", []);
  return { height: BigInt(hex ?? "0x0").toString() };
}

/**
 * Look up a transaction directly on Aurora. Never trust a client-provided
 * status: the receipt decides whether the payment really succeeded.
 */
export async function getTransactionStatus(txHash) {
  if (!/^0x[0-9a-fA-F]{64}$/.test(String(txHash || ""))) {
    return { found: false, reason: "INVALID_HASH" };
  }

  const transaction = await rpc("eth_getTransactionByHash", [txHash]);
  if (!transaction) return { found: false, reason: "NOT_FOUND" };

  const receipt = await rpc("eth_getTransactionReceipt", [txHash]);
  const valueWei = BigInt(transaction.value ?? "0x0").toString();

  if (!receipt) {
    return {
      found: true,
      pending: true,
      confirmed: false,
      failed: false,
      hash: transaction.hash,
      from: String(transaction.from || "").toLowerCase(),
      to: transaction.to ? String(transaction.to).toLowerCase() : null,
      valueWei,
      blockHash: null,
      blockHeight: null,
      confirmations: 0,
      timestamp: null,
      gasUsed: null,
      feeWei: null,
    };
  }

  const [latestHex, block] = await Promise.all([
    rpc("eth_blockNumber", []),
    rpc("eth_getBlockByNumber", [receipt.blockNumber, false]).catch(() => null),
  ]);

  const latest = BigInt(latestHex ?? "0x0");
  const blockNumber = BigInt(receipt.blockNumber);
  const confirmations = latest >= blockNumber ? Number(latest - blockNumber + 1n) : 0;
  const succeeded = String(receipt.status).toLowerCase() === "0x1";
  const gasUsed = BigInt(receipt.gasUsed ?? "0x0");
  const gasPrice = BigInt(receipt.effectiveGasPrice ?? transaction.gasPrice ?? "0x0");

  return {
    found: true,
    pending: false,
    confirmed: succeeded && confirmations >= 1,
    failed: !succeeded,
    failure: succeeded ? null : "The transaction reverted on chain.",
    hash: transaction.hash,
    from: String(transaction.from || "").toLowerCase(),
    to: transaction.to ? String(transaction.to).toLowerCase() : null,
    valueWei,
    blockHash: receipt.blockHash || null,
    blockHeight: blockNumber.toString(),
    confirmations,
    timestamp: block?.timestamp ? new Date(Number(BigInt(block.timestamp)) * 1000).toISOString() : null,
    gasUsed: gasUsed.toString(),
    feeWei: (gasUsed * gasPrice).toString(),
  };
}

/**
 * Call a read-only contract method using an ABI. Used by the trusted-recipient
 * registry. Returns the decoded Solidity value.
 */
export async function callContract(address, abi, functionName, args = []) {
  const data = encodeFunctionData({ abi, functionName, args });
  const result = await rpc("eth_call", [{ to: address, data }, "latest"]);
  return decodeFunctionResult({ abi, functionName, data: result });
}

export function explorerTransactionUrl(txHash) {
  return `${env.aurora.explorerUrl.replace(/\/$/, "")}/tx/${txHash}`;
}

export function explorerAccountUrl(address) {
  return `${env.aurora.explorerUrl.replace(/\/$/, "")}/address/${address}`;
}
