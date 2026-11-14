import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

/**
 * Optional, best-effort readable activity from a Blockscout-compatible
 * explorer. Aurora RPC remains the source of truth for balances and
 * transaction status. If the explorer is unreachable, we say so plainly
 * instead of inventing history.
 */
function headers() {
  return { accept: "application/json" };
}

function normaliseTxn(txn, address) {
  const own = String(address || "").toLowerCase();
  const from = String(txn.from?.hash || txn.from || "").toLowerCase() || null;
  const to = String(txn.to?.hash || txn.to || "").toLowerCase() || null;
  const value = txn.value !== null && txn.value !== undefined ? String(txn.value) : null;
  const status = txn.status === "ok" || txn.status === "success" ? "CONFIRMED" : txn.status === "error" ? "FAILED" : "PENDING";

  return {
    hash: txn.hash || txn.transaction_hash || null,
    from,
    to,
    direction: from === own ? "OUTGOING" : "INCOMING",
    valueWei: value,
    status,
    blockHeight: txn.block_number ? String(txn.block_number) : txn.block?.number ? String(txn.block.number) : null,
    timestamp: txn.timestamp || null,
    feeWei: txn.fee?.value ? String(txn.fee.value) : null,
    explorerUrl: txn.hash ? `${env.aurora.explorerUrl.replace(/\/$/, "")}/tx/${txn.hash}` : null,
  };
}

export async function getAccountActivity(address, { limit = 15 } = {}) {
  const base = env.aurora.activityUrl.replace(/\/$/, "");
  const url = `${base}/addresses/${encodeURIComponent(address)}/transactions?filter=to%20%7C%20from`;

  try {
    const response = await fetch(url, {
      headers: headers(),
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) {
      logger.warn("Aurora explorer request failed", { status: response.status });
      return {
        available: false,
        reason: `explorer_http_${response.status}`,
        notice: "The Aurora explorer could not be reached. Your confirmed transactions are still listed from SabiSafe's own verification.",
        txns: [],
      };
    }
    const payload = await response.json();
    const rows = Array.isArray(payload.items) ? payload.items : Array.isArray(payload) ? payload : [];
    return {
      available: true,
      txns: rows.slice(0, limit).map((txn) => normaliseTxn(txn, address)),
    };
  } catch (error) {
    logger.warn("Aurora explorer error", { reason: error?.message });
    return {
      available: false,
      reason: "explorer_unreachable",
      notice: "The Aurora explorer is not reachable from this server right now. Balances and transaction status still come directly from Aurora RPC.",
      txns: [],
    };
  }
}
