export const AURORA_CHAIN_ID = 1313161555;
export const AURORA_CHAIN_HEX = `0x${AURORA_CHAIN_ID.toString(16)}`;
export const AURORA_EXPLORER = "https://explorer.aurora.dev";
export const AURORA_FAUCET = "https://aurora.dev/faucet";

export const AURORA_CHAIN_PARAMS = {
  chainId: AURORA_CHAIN_HEX,
  chainName: "Aurora Testnet",
  nativeCurrency: { name: "Aurora ETH", symbol: "ETH", decimals: 18 },
  rpcUrls: ["https://testnet.aurora.dev"],
  blockExplorerUrls: [AURORA_EXPLORER],
};

export function hasInjectedWallet() {
  return typeof window !== "undefined" && Boolean(window.ethereum);
}

function injected() {
  if (!hasInjectedWallet()) {
    throw new Error("No browser wallet was found. Install MetaMask or another EVM wallet, then try again.");
  }
  return window.ethereum;
}

function normaliseAddress(value) {
  return String(value || "").trim().toLowerCase();
}

export function isUserRejection(error) {
  const code = Number(error?.code);
  const message = String(error?.message || "").toLowerCase();
  return code === 4001 || message.includes("reject") || message.includes("denied") || message.includes("cancel");
}

/** Ask the wallet to switch to Aurora testnet, adding it when the wallet does not know it yet. */
export async function ensureAuroraNetwork() {
  const ethereum = injected();
  try {
    await ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: AURORA_CHAIN_HEX }],
    });
  } catch (error) {
    if (Number(error?.code) === 4902) {
      await ethereum.request({
        method: "wallet_addEthereumChain",
        params: [AURORA_CHAIN_PARAMS],
      });
      return;
    }
    throw error;
  }
}

/** Open the wallet picker and return the first selected EVM account. */
export async function connectAuroraWallet() {
  const ethereum = injected();
  await ensureAuroraNetwork();
  const accounts = await ethereum.request({ method: "eth_requestAccounts" });
  if (!Array.isArray(accounts) || !accounts.length) {
    throw new Error("Your wallet did not share an address. Please try connecting again.");
  }
  return { address: normaliseAddress(accounts[0]) };
}

/** Restore a previous session without opening the wallet picker. */
export async function restoreAuroraWallet() {
  if (!hasInjectedWallet()) return null;
  try {
    const ethereum = injected();
    const chainId = await ethereum.request({ method: "eth_chainId" });
    if (String(chainId).toLowerCase() !== AURORA_CHAIN_HEX) {
      await ensureAuroraNetwork();
    }
    const accounts = await ethereum.request({ method: "eth_accounts" });
    if (!Array.isArray(accounts) || !accounts.length) return null;
    return { address: normaliseAddress(accounts[0]) };
  } catch {
    return null;
  }
}

/** Ask the wallet to forget this site. Not every wallet supports this. */
export async function forgetAuroraWallet() {
  if (!hasInjectedWallet()) return;
  try {
    await injected().request({
      method: "wallet_revokePermissions",
      params: [{ eth_accounts: {} }],
    });
  } catch {
    // The user may already have disconnected, or the wallet may not support it.
  }
}

/**
 * Send an exact ETH transfer. The wallet shows the final approval screen.
 * SabiSafe never sees a private key and never signs on the user's behalf.
 */
export async function signAndSendTransfer({ from, to, amountWei }) {
  const ethereum = injected();
  await ensureAuroraNetwork();
  const value = `0x${BigInt(String(amountWei)).toString(16)}`;
  const hash = await ethereum.request({
    method: "eth_sendTransaction",
    params: [{ from, to, value }],
  });
  if (!hash) {
    throw new Error("The wallet did not return a transaction hash, so we cannot confirm the payment.");
  }
  return { hash };
}

/** Call a non-payable contract method after the user approves it in their wallet. */
export async function signAndSendContractCall({ from, contractAddress, abi, functionName, args = [] }) {
  const ethereum = injected();
  await ensureAuroraNetwork();
  const { encodeFunctionData } = await import("viem");
  const data = encodeFunctionData({ abi, functionName, args });
  const hash = await ethereum.request({
    method: "eth_sendTransaction",
    params: [{ from, to: contractAddress, data }],
  });
  if (!hash) throw new Error("The wallet did not return a transaction hash.");
  return { hash };
}

/** Subscribe to account/network changes. Returns an unsubscribe function. */
export function watchWalletEvents({ onAccountsChanged, onChainChanged } = {}) {
  if (!hasInjectedWallet()) return () => {};
  const ethereum = window.ethereum;

  const accountsHandler = (accounts) => {
    onAccountsChanged?.(Array.isArray(accounts) ? accounts.map(normaliseAddress) : []);
  };
  const chainHandler = (chainId) => {
    onChainChanged?.(String(chainId).toLowerCase());
  };

  ethereum.on?.("accountsChanged", accountsHandler);
  ethereum.on?.("chainChanged", chainHandler);

  return () => {
    ethereum.removeListener?.("accountsChanged", accountsHandler);
    ethereum.removeListener?.("chainChanged", chainHandler);
  };
}
