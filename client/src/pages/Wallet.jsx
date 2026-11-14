import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowDownToLine,
  ArrowUpRight,
  CheckCircle2,
  Copy,
  Droplets,
  ExternalLink,
  LogOut,
  RefreshCw,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { Alert, Badge, Button, Card, CopyButton, PageLoader, Spinner } from "../components/ui";
import { useWallet } from "../context/WalletContext";
import { useConfig } from "../context/ConfigContext";
import { WalletSetupGuide } from "../components/WalletSetupGuide";
import { useToast } from "../context/ToastContext";
import { endpoints, errorMessage } from "../lib/api";
import { formatEth, relativeDate, shortAddress } from "../lib/format";

export default function WalletPage() {
  const { wallet, loading, connecting, connect, disconnect, refresh } = useWallet();
  const { config } = useConfig();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activity, setActivity] = useState(null);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityError, setActivityError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const loadActivity = useCallback(async () => {
    if (!wallet) return;
    setActivityLoading(true);
    setActivityError("");
    try {
      const { data } = await endpoints.walletActivity();
      setActivity(data);
    } catch (err) {
      setActivityError(errorMessage(err, "Activity could not be loaded."));
    } finally {
      setActivityLoading(false);
    }
  }, [wallet]);

  useEffect(() => {
    loadActivity();
  }, [loadActivity]);

  async function refreshAll() {
    setRefreshing(true);
    try {
      await refresh();
      await loadActivity();
      toast("Balance rechecked on Aurora testnet.", "success");
    } catch (err) {
      toast(errorMessage(err, "The balance could not be refreshed."), "error");
    } finally {
      setRefreshing(false);
    }
  }

  if (loading) return <PageLoader label="Checking your wallet…" />;

  if (!wallet) {
    return (
      <div className="space-y-5">
        <PageHeader
          eyebrow="Your own wallet"
          title="Connect an Aurora testnet wallet"
          description="SabiSafe links to your wallet. It never holds your money or sees your keys."
        />
        <WalletSetupGuide
          faucetUrl={config?.faucetUrl || "https://aurora.dev/faucet"}
          connecting={connecting}
          onConnect={() => connect().catch(() => {})}
        />

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { title: "Your keys stay yours", body: "We never ask for a private key or recovery phrase. If any site does, leave." },
            { title: "Every balance is checked", body: "We read your balance directly from Aurora, never from a guess." },
            { title: "Testnet only", body: "The coins here have no real value. This is a safe place to practise." },
          ].map((item) => (
            <Card key={item.title} className="p-4">
              <p className="text-[0.9rem] font-semibold text-ink">{item.title}</p>
              <p className="mt-1 text-[0.83rem] leading-relaxed text-muted">{item.body}</p>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const chain = wallet.chain || {};
  const balanceWei = chain.balanceWei;
  const unavailable = chain.unavailable || !chain.exists;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={`${wallet.network} · connected`}
        title="Your testnet wallet"
        description="Balances come from Aurora RPC. Activity is enriched by the Aurora explorer when available."
        actions={
          <Button variant="secondary" size="sm" onClick={refreshAll} loading={refreshing} icon={RefreshCw}>
            Refresh
          </Button>
        }
      />

      {unavailable ? (
        <Alert tone="warning" title="Balance temporarily unavailable">
          SabiSafe could not read this address from Aurora just now. It may be a network delay or the address may not be
          funded yet. Try Refresh, then check the explorer.
        </Alert>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="overflow-hidden">
          <div className="bg-forest px-6 py-6 text-cream">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-gold">Available balance</p>
                <p className="mt-2 font-display text-[2.6rem] font-semibold leading-none">
                  {unavailable ? "—" : formatEth(balanceWei, 6)}
                  <span className="ml-2 font-sans text-[1rem] font-semibold text-cream/70">ETH</span>
                </p>
                <p className="mt-2 flex items-center gap-1.5 text-[0.78rem] text-cream/70">
                  {unavailable ? (
                    "Not verified right now"
                  ) : (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 text-gold" /> Checked on Aurora
                      {chain.blockHeight ? ` · block ${chain.blockHeight}` : ""}
                    </>
                  )}
                </p>
              </div>
              <Badge tone="dark" className="border-cream/20 bg-cream/10 text-cream">
                {wallet.network}
              </Badge>
            </div>

            <div className="mt-5 rounded-xl border border-cream/15 bg-cream/5 px-3.5 py-2.5">
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-cream/50">Wallet address</p>
              <p className="mt-1 break-all font-mono text-[0.86rem] text-cream">{wallet.address}</p>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                to="/send"
                className="inline-flex items-center gap-2 rounded-full bg-cream px-4 py-2.5 text-[0.88rem] font-semibold text-forest hover:bg-white"
              >
                <ArrowUpRight className="h-4 w-4" /> Send
              </Link>
              <Link
                to="/receive"
                className="inline-flex items-center gap-2 rounded-full border border-cream/25 px-4 py-2.5 text-[0.88rem] font-semibold text-cream hover:bg-cream/10"
              >
                <ArrowDownToLine className="h-4 w-4" /> Receive
              </Link>
              <a
                href={wallet.explorerUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-2 rounded-full border border-cream/25 px-4 py-2.5 text-[0.88rem] font-semibold text-cream hover:bg-cream/10"
              >
                Explorer <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
          <div className="grid gap-3 p-4 sm:grid-cols-2">
            <CopyButton value={wallet.address} label="Copy address" variant="secondary" size="md" className="w-full" />
            <a
              href={wallet.faucetUrl || config?.faucetUrl || "https://aurora.dev/faucet"}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-line bg-paper px-5 py-2.5 text-[0.95rem] font-semibold text-ink hover:border-leaf"
            >
              <Droplets className="h-4 w-4" /> Testnet faucet
            </a>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-muted">Connection details</p>
            <dl className="mt-2 space-y-2 text-[0.86rem]">
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Network</dt>
                <dd className="font-semibold text-ink">Aurora testnet</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Address</dt>
                <dd className="font-mono text-ink" title={wallet.address}>
                  {shortAddress(wallet.address, 10, 6)}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Connected</dt>
                <dd className="text-ink">{relativeDate(wallet.connectedAt)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Gas token</dt>
                <dd className="text-ink">ETH</dd>
              </div>
            </dl>
            <p className="mt-3 text-[0.75rem] leading-relaxed text-muted">
              Gas is paid in ETH. A small amount stays available for the network fee, and that is normal.
            </p>
          </Card>

          <Card className="p-5">
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-muted">Wallet safety</p>
            <ul className="mt-2 space-y-2 text-[0.83rem] leading-relaxed text-muted">
              <li>• Disconnecting here does not close your wallet account.</li>
              <li>• Never paste a recovery phrase into SabiSafe.</li>
              <li>• Approve payments only after reading the wallet screen.</li>
            </ul>
            <Button
              variant="danger"
              size="sm"
              className="mt-4 w-full"
              icon={LogOut}
              onClick={() => {
                disconnect();
                navigate("/wallet");
              }}
            >
              Disconnect wallet
            </Button>
          </Card>
        </div>
      </div>

      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-muted">Readable activity</p>
            <h2 className="mt-1 flex items-center gap-2 text-[1.15rem] font-semibold text-ink">
              <Activity className="h-5 w-5 text-leaf" /> Recent onchain activity
            </h2>
          </div>
          <Button variant="ghost" size="sm" onClick={loadActivity} loading={activityLoading} icon={RefreshCw}>
            Reload
          </Button>
        </div>

        {activityError ? (
          <p className="mt-3 rounded-xl bg-clay-soft px-3 py-2 text-[0.83rem] text-[#7a2f16]">{activityError}</p>
        ) : activityLoading ? (
          <div className="mt-4">
            <Spinner label="Reading chain activity…" />
          </div>
        ) : activity?.available && activity.txns?.length ? (
          <ul className="mt-3 divide-y divide-line">
            {activity.txns.map((txn) => (
              <li key={txn.hash} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-[0.86rem] font-medium text-ink">
                    {txn.direction === "OUTGOING" ? "Sent to" : "Received from"}{" "}
                    <span className="font-mono">{shortAddress(txn.direction === "OUTGOING" ? txn.to : txn.from, 10, 6)}</span>
                  </p>
                  <p className="text-[0.72rem] text-muted">{relativeDate(txn.timestamp)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[0.85rem] font-semibold text-ink">{formatEth(txn.valueWei)} ETH</span>
                  {txn.explorerUrl ? (
                    <a
                      href={txn.explorerUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-leaf hover:underline"
                      aria-label="Open in explorer"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        ) : activity?.available === false ? (
          <p className="mt-3 rounded-xl bg-cream px-3 py-2 text-[0.83rem] leading-relaxed text-muted">
            The Aurora explorer activity feed is unavailable right now. Your balance and any transaction you check
            directly on Aurora RPC still work. This does not affect payments.
          </p>
        ) : (
          <p className="mt-3 rounded-xl bg-cream px-3 py-2 text-[0.83rem] leading-relaxed text-muted">
            No readable activity yet. Once a transaction is confirmed, it appears here and in History.
          </p>
        )}
        <p className="mt-3 text-[0.72rem] leading-relaxed text-muted">
          The Aurora explorer is only an enrichment layer. Aurora RPC remains the source of truth for balances and
          transaction status.
        </p>
      </Card>
    </div>
  );
}
