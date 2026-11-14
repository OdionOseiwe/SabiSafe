import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  History as HistoryIcon,
  RefreshCw,
  Search,
  ShieldCheck,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { TransactionRow } from "../components/TransactionRow";
import { Alert, Badge, Button, Card, EmptyState, Field, Input, PageLoader, Stat } from "../components/ui";
import { useWallet } from "../context/WalletContext";
import { useToast } from "../context/ToastContext";
import { endpoints, errorMessage } from "../lib/api";
import { formatEth } from "../lib/format";

export default function HistoryPage() {
  const { wallet } = useWallet();
  const { toast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [txHash, setTxHash] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState("");
  const [verification, setVerification] = useState(null);
  const [refreshingHash, setRefreshingHash] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data: payload } = await endpoints.transactions();
      setData(payload);
    } catch (err) {
      setError(errorMessage(err, "Your history could not be loaded."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function verify(event) {
    event.preventDefault();
    setVerifyError("");
    setVerification(null);
    const hash = txHash.trim();
    if (!/^0x[0-9a-fA-F]{64}$/.test(hash)) {
      setVerifyError("Paste the full transaction hash. It starts with 0x and has 64 characters after it.");
      return;
    }
    setVerifying(true);
    try {
      const { data: payload } = await endpoints.verifyTransaction(hash);
      setVerification(payload);
      setTxHash("");
      await load();
      toast(
        payload.transaction.status === "CONFIRMED"
          ? "That transaction is confirmed on chain and was added to your history."
          : payload.transaction.status === "FAILED"
            ? "The chain shows that transaction failed. No money moved."
            : "The transaction is on chain but still pending.",
        payload.transaction.status === "FAILED" ? "warning" : "success",
      );
    } catch (err) {
      setVerifyError(errorMessage(err, "That transaction could not be verified."));
    } finally {
      setVerifying(false);
    }
  }

  async function refresh(hash) {
    setRefreshingHash(hash);
    try {
      const { data: payload } = await endpoints.refreshTransaction(hash);
      setData((current) => ({
        ...current,
        transactions: current.transactions.map((item) => (item.hash === hash ? payload.transaction : item)),
      }));
      toast(`Status refreshed: ${payload.transaction.status.toLowerCase()}.`, "info");
      await load();
    } catch (err) {
      toast(errorMessage(err, "That status could not be refreshed."), "error");
    } finally {
      setRefreshingHash(null);
    }
  }

  if (loading && !data) return <PageLoader label="Reading your transaction history…" />;

  const transactions = data?.transactions || [];
  const summary = data?.summary || { count: 0, confirmed: 0, sentWei: "0", receivedWei: "0" };
  const pending = transactions.filter((item) => item.status === "PENDING").length;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Proof, not screenshots"
        title="Transaction history"
        description="Every row here was checked against Aurora RPC. A payment is only confirmed when the chain says so."
        actions={
          <Button variant="secondary" size="sm" onClick={load} loading={loading} icon={RefreshCw}>
            Refresh
          </Button>
        }
      />

      {error ? (
        <Alert tone="danger" title="We could not load your history">
          {error}{" "}
          <button type="button" onClick={load} className="font-semibold underline">
            Try again
          </button>
        </Alert>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Confirmed" value={summary.confirmed} hint={`${summary.count} recorded in total`} tone="green" />
        <Stat label="Sent" value={`${formatEth(summary.sentWei)} ETH`} hint="Confirmed outgoing only" />
        <Stat label="Received" value={`${formatEth(summary.receivedWei)} ETH`} hint="Confirmed incoming only" />
      </div>

      {pending > 0 ? (
        <Alert tone="warning" title={`${pending} payment${pending === 1 ? "" : "s"} still pending`}>
          Pending means the chain has not confirmed yet. Do not treat it as sent or received. Use Check status in a
          moment.
        </Alert>
      ) : null}

      <Card className="p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-mint text-leaf">
            <Search className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-[1.05rem] font-semibold text-ink">Check a transaction hash</h2>
            <p className="mt-0.5 text-[0.85rem] leading-relaxed text-muted">
              Paste a hash a sender gave you. SabiSafe reads Aurora directly. If the hash is not on chain, no money moved.
            </p>
            <form onSubmit={verify} className="mt-3 flex flex-col gap-2 sm:flex-row">
              <Input
                aria-label="Transaction hash"
                spellCheck={false}
                placeholder="e.g. 0x8f2a… (full hash)"
                value={txHash}
                onChange={(event) => setTxHash(event.target.value.trim())}
                disabled={verifying}
              />
              <Button type="submit" loading={verifying} disabled={!txHash.trim()} icon={ShieldCheck} className="shrink-0">
                Check status
              </Button>
            </form>
            {verifyError ? (
              <p className="mt-2 text-[0.83rem] font-medium text-clay" role="alert">
                {verifyError}
              </p>
            ) : null}
            {!wallet ? (
              <p className="mt-2 text-[0.78rem] text-muted">
                Connect your wallet first. SabiSafe only records transactions that involve your connected address.
              </p>
            ) : null}

            {verification ? (
              <div className="mt-3 rounded-xl border border-line bg-cream p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[0.86rem] font-semibold text-ink">Chain result: {verification.transaction.status}</p>
                  <Badge tone={verification.transaction.status === "CONFIRMED" ? "green" : verification.transaction.status === "FAILED" ? "clay" : "gold"}>
                    {verification.transaction.status}
                  </Badge>
                </div>
                <p className="mt-1 text-[0.8rem] text-muted">
                  {verification.chain?.confirmed
                    ? "The chain confirmed this transaction."
                    : verification.chain?.failed
                      ? "The chain rejected this transaction."
                      : "The chain has not finalised this transaction yet."}
                </p>
                {verification.transaction.explorerUrl ? (
                  <a
                    href={verification.transaction.explorerUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="mt-1 inline-block text-[0.8rem] font-semibold text-leaf hover:underline"
                  >
                    Open the explorer
                  </a>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="flex items-center gap-2 text-[1.1rem] font-semibold text-ink">
          <HistoryIcon className="h-5 w-5 text-leaf" /> Recorded payments
        </h2>

        {transactions.length ? (
          <ul className="mt-2 divide-y divide-line">
            {transactions.map((transaction) => (
              <li key={transaction.id}>
                <TransactionRow transaction={transaction} />
                <div className="flex flex-wrap items-center gap-2 pb-2 pl-13">
                  {transaction.status === "PENDING" ? (
                    <button
                      type="button"
                      onClick={() => refresh(transaction.hash)}
                      disabled={refreshingHash === transaction.hash}
                      className="inline-flex items-center gap-1 rounded-full border border-gold/50 bg-gold-soft px-2.5 py-1 text-[0.72rem] font-semibold text-[#8a5a10] disabled:opacity-60"
                    >
                      <Clock className="h-3 w-3" />
                      {refreshingHash === transaction.hash ? "Checking…" : "Check status"}
                    </button>
                  ) : null}
                  <span className="inline-flex items-center gap-1 text-[0.72rem] text-muted">
                    {transaction.direction === "OUTGOING" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownLeft className="h-3 w-3" />}
                    {transaction.source === "wallet" ? "Verified after wallet approval" : "Verified on Aurora RPC"}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={HistoryIcon}
            title="No payments recorded yet"
            description="Send or receive testnet ETH, then verify the hash. Only real chain results appear here."
            className="mt-3"
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Link
                  to="/receive"
                  className="inline-flex items-center gap-2 rounded-full bg-forest px-4 py-2.5 text-[0.85rem] font-semibold text-cream hover:bg-leaf"
                >
                  Receive money
                </Link>
                <Link
                  to="/send"
                  className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-4 py-2.5 text-[0.85rem] font-semibold text-ink hover:border-leaf"
                >
                  Send money
                </Link>
              </div>
            }
          />
        )}
      </Card>

      <div className="rounded-2xl border border-dashed border-line bg-cream/70 p-4">
        <Field label="A note on honesty" htmlFor="history-note">
          <p id="history-note" className="text-[0.82rem] leading-relaxed text-muted">
            SabiSafe never invents a transaction, a hash, or a balance. Rows are created only after a real wallet
            approval and an Aurora RPC check. If the chain cannot be reached, the app says so instead of guessing.
          </p>
        </Field>
      </div>
    </div>
  );
}
