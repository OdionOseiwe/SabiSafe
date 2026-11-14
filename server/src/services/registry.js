import { env } from "../config/env.js";
import { callContract } from "./auroraRpc.js";
import { logger } from "../utils/logger.js";

/**
 * Trusted-recipient registry on Aurora.
 *
 * The contract is optional: without AURORA_REGISTRY_ADDRESS every call reports
 * "not configured" and the app falls back to local contacts only.
 */
export const REGISTRY_ABI = [
  {
    type: "function",
    name: "addTrusted",
    stateMutability: "nonpayable",
    inputs: [{ name: "account", type: "address" }],
    outputs: [],
  },
  {
    type: "function",
    name: "removeTrusted",
    stateMutability: "nonpayable",
    inputs: [{ name: "account", type: "address" }],
    outputs: [],
  },
  {
    type: "function",
    name: "isTrusted",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "account", type: "address" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "listTrusted",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "address[]" }],
  },
  {
    type: "function",
    name: "countTrusted",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "version",
    stateMutability: "pure",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
  },
];

export const REGISTRY_FUNCTIONS = {
  add: "addTrusted",
  remove: "removeTrusted",
  isTrusted: "isTrusted",
  list: "listTrusted",
};

export function isRegistryConfigured() {
  return Boolean(env.aurora.registryAddress);
}

export function registryAddress() {
  return env.aurora.registryAddress || null;
}

export async function isTrustedOnchain(ownerAddress, contactAddress) {
  if (!isRegistryConfigured()) {
    return { available: false, trusted: null, reason: "not_configured" };
  }
  try {
    const trusted = await callContract(env.aurora.registryAddress, REGISTRY_ABI, "isTrusted", [
      ownerAddress,
      contactAddress,
    ]);
    return { available: true, trusted: Boolean(trusted) };
  } catch (error) {
    logger.warn("Registry view failed", { reason: error?.message });
    return { available: false, trusted: null, reason: "unreachable" };
  }
}

export async function listTrustedOnchain(ownerAddress) {
  if (!isRegistryConfigured()) {
    return { available: false, accounts: [] };
  }
  try {
    const accounts = await callContract(env.aurora.registryAddress, REGISTRY_ABI, "listTrusted", [ownerAddress]);
    return { available: true, accounts: Array.isArray(accounts) ? accounts : [] };
  } catch (error) {
    logger.warn("Registry list failed", { reason: error?.message });
    return { available: false, accounts: [] };
  }
}

export async function registryVersion() {
  if (!isRegistryConfigured()) return { available: false, version: null };
  try {
    const version = await callContract(env.aurora.registryAddress, REGISTRY_ABI, "version", []);
    return { available: true, version: String(version) };
  } catch {
    return { available: false, version: null };
  }
}
