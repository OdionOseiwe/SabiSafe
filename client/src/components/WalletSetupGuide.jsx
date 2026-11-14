import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Droplets,
  ExternalLink,
  Network,
  RefreshCw,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { Button, Card, CopyButton } from "./ui";
import { AURORA_CHAIN_PARAMS, ensureAuroraNetwork, hasInjectedWallet } from "../lib/aurora";

const STEPS = [
  {
    icon: Download,
    title: "Install a wallet app",
    body: "A wallet is a small app that holds your money and asks your permission before anything leaves it. MetaMask is the most common one and it is free.",
  },
  {
    icon: ShieldCheck,
    title: "Create the wallet and write down the recovery phrase",
    body: "Write the 12 words on paper and keep them offline. Anyone with those words can take your money. SabiSafe will never ask for them.",
  },
  {
    icon: Network,
    title: "Add the Aurora testnet network",
    body: "Your wallet starts on Ethereum. SabiSafe runs on Aurora testnet, so the wallet needs those network details once.",
  },
  {
    icon: Droplets,
    title: "Get free testnet ETH",
    body: "Testnet ETH is practice money with no real value. The faucet sends a little to your address so you can try a payment safely.",
  },
  {
    icon: Wallet,
    title: "Come back and connect",
    body: "Connect on this page. Your wallet shows the approval screen, and SabiSafe only receives your public 0x address.",
  },
];

function Step({ number, icon: Icon, title, body, children }) {
  return (
    <li className="flex gap-3.5">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-mint text-[0.82rem] font-bold text-forest">
        {number}
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 text-[0.95rem] font-semibold text-ink">
          <Icon className="h-4 w-4 text-leaf" aria-hidden="true" />
          {title}
        </p>
        <p className="mt-1 text-[0.86rem] leading-relaxed text-muted">{body}</p>
        {children ? <div className="mt-2.5">{children}</div> : null}
      </div>
    </li>
  );
}

export function WalletSetupGuide({ faucetUrl = "https://aurora.dev/faucet", onConnect, connecting = false }) {
  const [detected, setDetected] = useState(() => hasInjectedWallet());
  const [adding, setAdding] = useState(false);
  const [addMessage, setAddMessage] = useState("");

  function recheck() {
    setDetected(hasInjectedWallet());
  }

  async function addAurora() {
    setAdding(true);
    setAddMessage("");
    try {
      await ensureAuroraNetwork();
      setAddMessage("Aurora testnet is ready in your wallet.");
    } catch {
      setAddMessage("That did not finish. You can also add the network by hand using the details below.");
    } finally {
      setAdding(false);
    }
  }

  return (
    <Card className="p-6 md:p-8">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-mint text-leaf">
            <Wallet className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-muted">No wallet yet?</p>
            <h2 className="text-[1.25rem] font-semibold text-ink">SabiSafe will walk you through it</h2>
          </div>
        </div>

        <p className="mt-3 text-[0.9rem] leading-relaxed text-muted">
          You do not need to understand crypto first. Follow these five steps in order. SabiSafe cannot create a
          wallet for you, because only you should ever hold your keys — but every step is explained in plain words.
        </p>

        <div className="mt-4 flex items-start gap-2 rounded-xl border border-gold/40 bg-gold-soft/60 px-3.5 py-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#8a5a10]" aria-hidden="true" />
          <p className="text-[0.82rem] leading-relaxed text-[#5c4a2a]">
            Install only from <span className="font-semibold">metamask.io</span> by typing the address yourself. Search
            results and ads sometimes lead to fake copies. SabiSafe never asks for your recovery phrase, private key,
            OTP, PIN, or password.
          </p>
        </div>

        <ol className="mt-5 space-y-4">
          <Step number={1} icon={STEPS[0].icon} title={STEPS[0].title} body={STEPS[0].body}>
            <a
              href="https://metamask.io/download/"
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1.5 text-[0.84rem] font-semibold text-leaf hover:underline"
            >
              Open the official MetaMask download page <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <p className="mt-1 text-[0.76rem] text-muted">
              On a phone, use the MetaMask app and open SabiSafe inside its browser. On a computer, use the browser
              extension.
            </p>
          </Step>

          <Step number={2} icon={STEPS[1].icon} title={STEPS[1].title} body={STEPS[1].body} />

          <Step number={3} icon={STEPS[2].icon} title={STEPS[2].title} body={STEPS[2].body}>
            {detected ? (
              <div className="space-y-2">
                <Button size="sm" variant="secondary" loading={adding} onClick={addAurora} icon={Network}>
                  Add Aurora testnet to my wallet
                </Button>
                {addMessage ? <p className="text-[0.78rem] text-muted">{addMessage}</p> : null}
              </div>
            ) : null}

            <details className="mt-2 rounded-xl border border-line bg-cream px-3.5 py-2.5" open={!detected}>
              <summary className="cursor-pointer text-[0.82rem] font-semibold text-ink">
                Network details, if your wallet asks for them
              </summary>
              <dl className="mt-2.5 space-y-1.5 text-[0.8rem]">
                {[
                  ["Network name", AURORA_CHAIN_PARAMS.chainName],
                  ["RPC URL", AURORA_CHAIN_PARAMS.rpcUrls[0]],
                  ["Chain ID", "1313161555"],
                  ["Currency symbol", AURORA_CHAIN_PARAMS.nativeCurrency.symbol],
                  ["Block explorer", AURORA_CHAIN_PARAMS.blockExplorerUrls[0]],
                ].map(([label, value]) => (
                  <div key={label} className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <dt className="text-muted">{label}</dt>
                    <dd className="flex items-center gap-1.5">
                      <span className="break-all font-mono text-[0.76rem] text-ink">{value}</span>
                      <CopyButton value={value} label="Copy" size="sm" variant="ghost" />
                    </dd>
                  </div>
                ))}
              </dl>
            </details>
          </Step>

          <Step number={4} icon={STEPS[3].icon} title={STEPS[3].title} body={STEPS[3].body}>
            <a
              href={faucetUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1.5 text-[0.84rem] font-semibold text-leaf hover:underline"
            >
              Open the Aurora testnet faucet <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Step>

          <Step number={5} icon={STEPS[4].icon} title={STEPS[4].title} body={STEPS[4].body} />
        </ol>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button size="lg" loading={connecting} onClick={() => onConnect?.()} icon={Wallet}>
            {detected ? "Connect my wallet" : "I have installed it — connect"}
          </Button>
          <Button size="lg" variant="ghost" onClick={recheck} icon={RefreshCw}>
            Check for a wallet again
          </Button>
        </div>

        <p
          className={`mt-3 flex items-center gap-1.5 text-[0.78rem] ${
            detected ? "text-leaf" : "text-muted"
          }`}
          role="status"
        >
          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
          {detected
            ? "A browser wallet was detected. You can connect now."
            : "No browser wallet detected yet. After installing, reload this page or press “Check for a wallet again”."}
        </p>
      </div>
    </Card>
  );
}
