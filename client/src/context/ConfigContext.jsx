import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { endpoints } from "../lib/api";

const ConfigContext = createContext(null);

const FALLBACK = {
  network: "aurora-testnet",
  networkLabel: "Aurora Testnet",
  chainId: 1313161555,
  contractId: null,
  explorerUrl: "https://explorer.aurora.dev",
  faucetUrl: "https://aurora.dev/faucet",
  ai: { configured: false, provider: "NEAR AI Cloud", model: "z-ai/glm-5.3-flash" },
  features: { onchainRegistry: false },
  safety: { largeAmountEth: 0.01 },
};

export function ConfigProvider({ children }) {
  const [config, setConfig] = useState(FALLBACK);
  const [aiStatus, setAiStatus] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let alive = true;
    Promise.allSettled([endpoints.config(), endpoints.aiStatus()]).then((results) => {
      if (!alive) return;
      if (results[0].status === "fulfilled") {
        setConfig({ ...FALLBACK, ...results[0].value.data });
      }
      if (results[1].status === "fulfilled") {
        setAiStatus(results[1].value.data);
      }
      setLoaded(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  const value = useMemo(() => ({ config, aiStatus, setAiStatus, loaded }), [config, aiStatus, loaded]);
  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (!context) throw new Error("useConfig must be used inside ConfigProvider");
  return context;
}
