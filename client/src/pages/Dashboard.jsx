import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowDownToLine,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { Alert, Badge, Button, Card, EmptyState, Input, PageLoader, ProgressBar, Stat } from "../components/ui";
import { TransactionRow } from "../components/TransactionRow";
import { useAuth } from "../context/AuthContext";
import { useWallet } from "../context/WalletContext";
import { useConfig } from "../context/ConfigContext";
import { endpoints, errorMessage } from "../lib/api";
import { formatEth, shortAddress } from "../lib/format";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function Dashboard() {
  const { user } = useAuth();
  const { wallet, loading: walletLoading, connecting, connect, refresh: refreshWallet } = useWallet();
  const { config } = useConfig();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [question, setQuestion] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data: payload } = await endpoints.dashboard();
      setData(payload);
    } catch (err) {
      setError(errorMessage(err, "We could not load your home page."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (wallet) load();
    // Refresh the onchain balance when a wallet is connected.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet?.address]);

  async function connectAndRefresh() {
    try {
      await connect();
      await Promise.all([load(), refreshWallet()]);
    } catch {
      // The toast already explains what happened.
    }
  }

  function ask(event) {
    event.preventDefault();
    const text = question.trim();
    navigate("/assistant", { state: text ? { prefill: text } : undefined });
  }

  if (loading && !data) return <PageLoader label="Preparing your home page…" />;

  const learning = data?.learning || { total: 0, completed: 0, nextLesson: null };
  const balanceWei = data?.wallet?.balance?.balanceWei;
  const balanceUnavailable = data?.wallet && (!balanceWei || data.wallet.balance?.unavailable);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Your practice space"
        title={`${greeting()}, ${user?.firstName}.`}
        description="Take it one step at a time. Ask a question, finish a short lesson, or check your testnet wallet."
        actions={
          <Button variant="secondary" onClick={load} icon={RefreshCw} loading={loading}>
            Refresh
          </Button>
        }
      />

      {error ? (
        <Alert tone="danger" title="We could not load everything">
          {error}{" "}
          <button type="button" onClick={load} className="font-semibold underline">
            Try again
          </button>
        </Alert>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="gold">Aurora Testnet</Badge>
        <Badge tone={config?.ai?.configured ? "green" : "neutral"} icon={Sparkles}>
          {config?.ai?.configured ? "NEAR AI private" : "SabiGuide built-in"}
        </Badge>
        <span className="text-[0.78rem] text-muted">No real money is used here.</span>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-5">
          {/* Ask Sabi */}
          <Card className="overflow-hidden">
            <div className="border-b border-line bg-forest px-5 py-5 text-cream">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-gold">Ask Sabi</p>
                  <h2 className="mt-1 text-[1.35rem] font-semibold">What would you like to understand?</h2>
                  <p className="mt-1 text-[0.85rem] leading-relaxed text-cream/70">
                    Private by default. Every verified answer shows the proof.
                  </p>
                </div>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cream/10 text-gold">
                  <Sparkles className="h-5 w-5" />
                </span>
              </div>
            </div>
            <form onSubmit={ask} className="space-y-3 p-5">
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  aria-label="Ask Sabi a question"
                  placeholder="e.g. What is a crypto wallet?"
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  maxLength={1500}
                />
                <Button type="submit" icon={ArrowRight} className="shrink-0">
                  Ask Sabi
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {["What is a wallet?", "How do I receive money?", "How can I spot a scam?"].map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => navigate("/assistant", { state: { prefill: prompt } })}
                    className="rounded-full border border-line bg-cream px-3 py-1.5 text-[0.78rem] font-medium text-ink transition-colors hover:border-leaf hover:text-leaf"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </form>
          </Card>

          {/* Learning */}
          <Card className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-clay">Learning Centre</p>
                <h2 className="mt-1 text-[1.25rem] font-semibold text-ink">
                  {learning.completed === 0 ? "Start with the basics" : learning.nextLesson ? "Your next lesson" : "All lessons complete"}
                </h2>
                <p className="mt-1 text-[0.9rem] leading-relaxed text-muted">
                  {learning.nextLesson
                    ? learning.nextLesson.title
                    : learning.total
                      ? "You have finished every lesson. Revisit any topic whenever you like."
                      : "Lessons will appear here once the seed data is loaded."}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-leaf" />
                <span className="text-[0.85rem] font-semibold text-ink">
                  {learning.completed}/{learning.total}
                </span>
              </div>
            </div>
            <ProgressBar
              className="mt-4"
              value={learning.completed}
              max={learning.total || 1}
              label="Lessons completed"
            />
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                to={learning.nextLesson ? `/learn/${learning.nextLesson.slug}` : "/learn"}
                className="inline-flex items-center gap-2 rounded-full bg-forest px-4 py-2.5 text-[0.88rem] font-semibold text-cream hover:bg-leaf"
              >
                {learning.completed === 0 ? "Open first lesson" : learning.nextLesson ? "Continue learning" : "Review lessons"}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/practice"
                className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-4 py-2.5 text-[0.88rem] font-semibold text-ink hover:border-leaf"
              >
                Practice tasks
              </Link>
            </div>
          </Card>

          {/* Quick actions */}
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { to: "/receive", title: "Receive money", body: "Share your address or a request link.", icon: ArrowDownToLine, tone: "bg-mint text-leaf" },
              { to: "/send", title: "Send money", body: "Review every risk before you approve.", icon: ArrowUpRight, tone: "bg-clay-soft text-clay" },
              { to: "/contacts", title: "Trusted contacts", body: "Save family addresses you check once.", icon: Users, tone: "bg-gold-soft text-[#8a5a10]" },
              { to: "/safety", title: "Safety Centre", body: "Check a message or read the red flags.", icon: ShieldCheck, tone: "bg-sand text-ink" },
            ].map((action) => (
              <Link
                key={action.to}
                to={action.to}
                className="group flex items-start gap-3 rounded-2xl border border-line bg-paper p-4 transition-colors hover:border-leaf"
              >
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${action.tone}`}>
                  <action.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-1 text-[0.92rem] font-semibold text-ink">
                    {action.title}
                    <ArrowRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                  </span>
                  <span className="mt-0.5 block text-[0.8rem] leading-relaxed text-muted">{action.body}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          {/* Wallet */}
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-muted">Testnet wallet</p>
              <Wallet className="h-5 w-5 text-leaf" />
            </div>
            {walletLoading ? (
              <div className="mt-3 h-10 w-32 animate-pulse rounded-lg bg-sand" aria-hidden="true" />
            ) : data?.wallet ? (
              <>
                <p className="mt-2 font-display text-[2rem] font-semibold leading-none text-ink">
                  {balanceUnavailable ? "—" : formatEth(balanceWei)}{" "}
                  <span className="text-[0.95rem] font-sans font-semibold text-muted">ETH</span>
                </p>
                <p className="mt-1.5 flex items-center gap-1.5 text-[0.76rem] text-leaf">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {balanceUnavailable
                    ? "Balance temporarily unavailable"
                    : `Checked on Aurora${data.wallet.balance?.blockHeight ? ` · block ${data.wallet.balance.blockHeight}` : ""}`}
                </p>
                <p className="mt-1 truncate font-mono text-[0.78rem] text-muted" title={data.wallet.address}>
                  {shortAddress(data.wallet.address, 12, 8)}
                </p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Link
                    to="/send"
                    className="rounded-xl bg-forest px-3 py-2 text-center text-[0.82rem] font-semibold text-cream hover:bg-leaf"
                  >
                    Send
                  </Link>
                  <Link
                    to="/receive"
                    className="rounded-xl border border-line bg-cream px-3 py-2 text-center text-[0.82rem] font-semibold text-ink hover:border-leaf"
                  >
                    Receive
                  </Link>
                </div>
              </>
            ) : (
              <>
                <p className="mt-2 text-[0.92rem] leading-relaxed text-muted">
                  Connect an Aurora testnet wallet to see your real balance and practise payments.
                </p>
                <Button className="mt-4 w-full" loading={connecting} onClick={connectAndRefresh}>
                  Connect wallet
                </Button>
                <Link
                  to="/wallet"
                  className="mt-2.5 block text-center text-[0.78rem] font-semibold text-leaf hover:underline"
                >
                  No wallet yet? See the 5-step setup guide
                </Link>
                <p className="mt-1.5 text-center text-[0.72rem] text-muted">Your keys stay in your wallet.</p>
              </>
            )}
          </Card>

          {/* Safety tip */}
          {data?.safetyTip ? (
            <Card className="border-gold/40 bg-gold-soft/60 p-5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[#8a5a10]" />
                <p className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-[#8a5a10]">Today's safety tip</p>
              </div>
              <h3 className="mt-2 text-[1.02rem] font-semibold text-ink">{data.safetyTip.title}</h3>
              <p className="mt-1 text-[0.85rem] leading-relaxed text-[#5c4a2a]">{data.safetyTip.body}</p>
              <Link to="/safety" className="mt-3 inline-flex items-center gap-1 text-[0.82rem] font-semibold text-[#7a4f0a] hover:underline">
                Open Safety Centre <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Card>
          ) : null}

          {/* Recent activity */}
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-[1.05rem] font-semibold text-ink">Recent activity</h2>
              <Link to="/history" className="text-[0.8rem] font-semibold text-leaf hover:underline">
                See all
              </Link>
            </div>
            {data?.transactions?.length ? (
              <div className="mt-2 divide-y divide-line">
                {data.transactions.slice(0, 4).map((transaction) => (
                  <TransactionRow key={transaction.id} transaction={transaction} />
                ))}
              </div>
            ) : (
              <div className="mt-3">
                <EmptyState
                  icon={ArrowUpRight}
                  title="No payments yet"
                  description="Once you send or receive testnet ETH, the real chain result appears here."
                  action={
                    <Link to="/receive" className="text-[0.85rem] font-semibold text-leaf hover:underline">
                      Start with a receive request
                    </Link>
                  }
                />
              </div>
            )}
          </Card>

          <div className="grid grid-cols-2 gap-3">
            <Stat label="Contacts" value={data?.contacts?.count ?? 0} hint="Saved addresses" />
            <Stat label="Practice" value={`${data?.practice?.completed ?? 0}/6`} hint="Tasks completed" tone="green" />
          </div>
        </div>
      </div>
    </div>
  );
}
