import { isAddress } from "viem";

const WEI_PER_ETH = 10n ** 18n;

/**
 * Validate an Aurora/Ethereum address. This checks the shape and, for
 * mixed-case input, the EIP-55 checksum. It does not prove the address
 * belongs to the person you think it does.
 */
export function isValidEvmAddress(value) {
  if (typeof value !== "string") return false;
  const address = value.trim();
  if (!/^0x[0-9a-fA-F]{40}$/.test(address)) return false;
  return isAddress(address);
}

export function isZeroAddress(value) {
  return String(value || "").trim().toLowerCase() === "0x0000000000000000000000000000000000000000";
}

/**
 * Convert a user-entered ETH amount to wei as an exact string.
 * Uses string math, never floating point.
 */
export function ethToWei(amount) {
  const raw = String(amount ?? "").trim().replace(/,/g, "");
  if (!/^\d+(\.\d{1,18})?$/.test(raw)) {
    throw new Error("Enter an amount like 0.001 using numbers only.");
  }
  const [whole, fraction = ""] = raw.split(".");
  const wei = BigInt(whole) * WEI_PER_ETH + BigInt(fraction.padEnd(18, "0"));
  if (wei <= 0n) throw new Error("The amount must be more than zero.");
  return wei.toString();
}

export function weiToEth(amountWei, maxDecimals = 6) {
  try {
    const value = BigInt(String(amountWei));
    const whole = value / WEI_PER_ETH;
    const fraction = (value % WEI_PER_ETH).toString().padStart(18, "0").slice(0, maxDecimals);
    const trimmed = fraction.replace(/0+$/, "");
    return trimmed ? `${whole}.${trimmed}` : whole.toString();
  } catch {
    return "0";
  }
}

export function formatEth(amountWei, maxDecimals = 6) {
  const eth = weiToEth(amountWei, maxDecimals);
  const [whole, fraction] = eth.split(".");
  const grouped = BigInt(whole).toLocaleString("en-NG");
  return fraction ? `${grouped}.${fraction}` : grouped;
}

export function compareWei(a, b) {
  const left = BigInt(String(a));
  const right = BigInt(String(b));
  return left === right ? 0 : left > right ? 1 : -1;
}

export { WEI_PER_ETH };
