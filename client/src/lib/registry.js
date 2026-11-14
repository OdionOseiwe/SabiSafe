/**
 * Minimal ABI for the SabiSafeRegistry Solidity contract. It mirrors
 * server/src/services/registry.js. Keep the two in sync.
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
