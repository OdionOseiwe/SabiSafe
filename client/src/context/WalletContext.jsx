import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { endpoints, errorMessage } from "../lib/api";
import {
  connectAuroraWallet,
  forgetAuroraWallet,
  isUserRejection,
  restoreAuroraWallet,
  watchWalletEvents,
} from "../lib/aurora";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setWallet(null);
      setLoading(false);
      return null;
    }
    try {
      const { data } = await endpoints.wallet();
      setWallet(data.wallet);
      return data.wallet;
    } catch {
      setWallet(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setWallet(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    refresh();
  }, [user, refresh]);

  const connect = useCallback(async () => {
    setConnecting(true);
    try {
      const { address } = await connectAuroraWallet();
      await endpoints.connectWallet(address);
      const next = await refresh();
      toast(`Wallet ${address.slice(0, 6)}…${address.slice(-4)} connected. Balance checked on Aurora testnet.`, "success");
      return next;
    } catch (error) {
      if (isUserRejection(error)) {
        toast("Wallet connection was cancelled. Nothing changed.", "info");
      } else {
        await forgetAuroraWallet();
        toast(errorMessage(error, "The wallet could not be connected."), "error");
      }
      throw error;
    } finally {
      setConnecting(false);
    }
  }, [refresh, toast]);

  const disconnect = useCallback(async () => {
    try {
      await forgetAuroraWallet();
      await endpoints.disconnectWallet();
      setWallet(null);
      toast("Wallet disconnected from SabiSafe.", "info");
    } catch (error) {
      toast(errorMessage(error, "Could not disconnect the wallet."), "error");
    }
  }, [toast]);

  // If the user switches account or network inside their wallet, re-check the
  // saved connection instead of silently showing a stale balance.
  useEffect(() => {
    if (!user) return undefined;
    return watchWalletEvents({
      onAccountsChanged: () => {
        refresh();
      },
      onChainChanged: () => {
        refresh();
      },
    });
  }, [user, refresh]);

  const value = useMemo(
    () => ({ wallet, loading, connecting, connect, disconnect, refresh }),
    [wallet, loading, connecting, connect, disconnect, refresh],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) throw new Error("useWallet must be used inside WalletProvider");
  return context;
}
