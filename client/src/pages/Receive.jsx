import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import {
  ArrowDownToLine,
  Copy,
  Droplets,
  ExternalLink,
  Link2,
  Plus,
  RefreshCw,
  Share2,
  Wallet as WalletIcon,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { Alert, Badge, Button, Card, CopyButton, EmptyState, Field, Input, PageLoader, Textarea } from "../components/ui";
import { useWallet } from "../context/WalletContext";
import { useConfig } from "../context/ConfigContext";
import { useToast } from "../context/ToastContext";
import { endpoints, errorMessage } from "../lib/api";
import { formatDate, formatEth, shortAddress } from "../lib/format";

export default function Receive() {
  const { wallet, loading, connecting, connect } = useWallet();
  const { config } = useConfig();
  const { toast } = useToast();
  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ payerName: "", amountEth: "", note: "" });

  const loadRequests = useCallback(async () => {
    setRequestsLoading(true);
    try {
      const { data } = await endpoints.receiving();
      setRequests(data.requests);
    } catch {
      // Requests are optional; the raw address still works.
      setRequests([]);
    } finally {
      setRequestsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (wallet) loadRequests();
  }, [wallet, loadRequests]);

  const receiveLink = wallet ? `${window.location.origin}/receive` : "";

  async function createRequest(event) {
    event.preventDefault();
    setError("");
    if (!form.payerName.trim()) {
      setError("Please enter the name of the person sending you money.");
      return;
    }
    setCreating(true);
    try {
      const { data } = await endpoints.createReceiving({
        payerName: form.payerName.trim(),
        amountEth: form.amountEth.trim(),
        note: form.note.trim(),
      });
      setRequests((current) => [data.request, ...current]);
      setForm({ payerName: "", amountEth: "", note: "" });
      setShowForm(false);
      toast("Request created. Share the link with the sender.", "success");
    } catch (err) {
      setError(errorMessage(err, "The request could not be created."));
    } finally {
      setCreating(false);
    }
  }

  async function share(request) {
    const url = request.shareUrl;
    try {
      if (navigator.share) {
        await navigator.share({
          title: "SabiSafe payment request",
          text: `${request.payerName}, please send ${request.amountWei ? `${formatEth(request.amountWei)} ETH` : "ETH"} to my Aurora testnet wallet.`,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast("Request link copied.", "success");
      }
    } catch {
      toast("Sharing was cancelled or blocked. You can copy the link instead.", "warning");
    }
  }

  const requestHistory = useMemo(
    () => [...requests].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [requests],
  );

  if (loading) return <PageLoader label="Checking your wallet…" />;

  if (!wallet) {
    return (
      <div className="space-y-5">
        <PageHeader
          eyebrow="Receive money"
          title="Connect a wallet to receive"
          description="You need an Aurora testnet address before anyone can send you money."
        />
        <Card className="p-6">
          <div className="mx-auto max-w-xl text-center">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-mint text-leaf">
              <WalletIcon className="h-8 w-8" />
            </span>
            <h2 className="mt-4 text-[1.35rem] font-semibold text-ink">First, connect your own wallet</h2>
            <p className="mt-2 text-[0.92rem] leading-relaxed text-muted">
              SabiSafe will show your public address and a QR code. It never asks for your recovery phrase.
            </p>
            <Button size="lg" className="mt-4" loading={connecting} onClick={() => connect().catch(() => {})}>
              Connect wallet
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Receive money"
        title="Share your address, safely"
        description="An address is public, like an account number. It is safe to share. Your recovery phrase is never shared."
        actions={
          <Button variant="secondary" size="sm" onClick={loadRequests} loading={requestsLoading} icon={RefreshCw}>
            Refresh requests
          </Button>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-muted">Your address</p>
              <p className="mt-1 text-[0.9rem] font-semibold text-ink">Scan or copy</p>
            </div>
            <Badge tone="green" icon={ArrowDownToLine}>
              {wallet.network}
            </Badge>
          </div>

          <div className="mt-4 flex justify-center rounded-2xl border border-line bg-white p-4">
            <QRCodeSVG
              value={wallet.address}
              size={190}
              level="M"
              marginSize={1}
              bgColor="#ffffff"
              fgColor="#0F3D2E"
              title={`Aurora address ${wallet.address}`}
            />
          </div>

          <div className="mt-4 rounded-xl border border-line bg-cream px-3.5 py-3">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-muted">Address</p>
            <p className="mt-1 break-all font-mono text-[0.88rem] text-ink">{wallet.address}</p>
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <CopyButton value={wallet.address} label="Copy address" size="md" className="w-full" />
            <a
              href={wallet.explorerUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-line bg-paper px-5 py-2.5 text-[0.95rem] font-semibold text-ink hover:border-leaf"
            >
              View on explorer <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          <div className="mt-4 flex items-start gap-2 rounded-xl border border-gold/40 bg-gold-soft px-3 py-2.5 text-[0.8rem] leading-relaxed text-[#6f4708]">
            <Droplets className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              The sender must use <strong>Aurora testnet</strong>. Testnet ETH has no real value. Ask them to send a
              small amount first.
            </span>
          </div>

          <p className="mt-3 text-center text-[0.72rem] text-muted">
            This address is {shortAddress(wallet.address, 12, 8)} · receiveLink {receiveLink.replace(/^https?:\/\//, "")}
          </p>
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-muted">Payment request</p>
                <h2 className="mt-1 flex items-center gap-2 text-[1.15rem] font-semibold text-ink">
                  <Link2 className="h-5 w-5 text-leaf" /> Help the sender get it right
                </h2>
              </div>
              <Button variant={showForm ? "ghost" : "secondary"} size="sm" onClick={() => setShowForm((value) => !value)} icon={Plus}>
                {showForm ? "Close" : "New request"}
              </Button>
            </div>
            <p className="mt-1.5 text-[0.88rem] leading-relaxed text-muted">
              A request shows the sender your name, address, and optional amount. It does not move any money, and the
              sender still approves the payment in their own wallet.
            </p>

            {showForm ? (
              <form onSubmit={createRequest} className="mt-4 space-y-3">
                {error ? <Alert tone="danger">{error}</Alert> : null}
                <Field label="Who is sending?" htmlFor="payerName">
                  <Input
                    id="payerName"
                    required
                    maxLength={80}
                    placeholder="e.g. My daughter Ngozi"
                    value={form.payerName}
                    onChange={(event) => setForm((current) => ({ ...current, payerName: event.target.value }))}
                  />
                </Field>
                <Field label="Amount in ETH (optional)" htmlFor="amountEth" hint="Leave empty if the sender should choose.">
                  <Input
                    id="amountEth"
                    inputMode="decimal"
                    placeholder="e.g. 0.5"
                    value={form.amountEth}
                    onChange={(event) => setForm((current) => ({ ...current, amountEth: event.target.value }))}
                  />
                </Field>
                <Field label="A short note (optional)" htmlFor="note">
                  <Textarea
                    id="note"
                    rows={2}
                    maxLength={280}
                    placeholder="What is this for?"
                    value={form.note}
                    onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
                  />
                </Field>
                <Button type="submit" loading={creating} icon={Link2}>
                  Create request
                </Button>
              </form>
            ) : null}
          </Card>

          <Card className="p-5">
            <h2 className="text-[1.05rem] font-semibold text-ink">Your requests</h2>
            {requestsLoading ? (
              <p className="mt-2 text-[0.85rem] text-muted">Loading requests…</p>
            ) : requestHistory.length ? (
              <ul className="mt-2 divide-y divide-line">
                {requestHistory.map((request) => (
                  <li key={request.id} className="py-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[0.9rem] font-semibold text-ink">
                          {request.payerName}
                          {request.amountWei ? (
                            <span className="ml-2 font-normal text-muted">{formatEth(request.amountWei)} ETH</span>
                          ) : (
                            <span className="ml-2 font-normal text-muted">Any amount</span>
                          )}
                        </p>
                        <p className="text-[0.74rem] text-muted">
                          {formatDate(request.createdAt)} · {request.status.toLowerCase()}
                        </p>
                        {request.note ? <p className="mt-1 text-[0.8rem] text-ink/80">{request.note}</p> : null}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => share(request)}
                          className="inline-flex items-center gap-1 rounded-full border border-line bg-paper px-2.5 py-1.5 text-[0.75rem] font-semibold text-ink hover:border-leaf"
                        >
                          <Share2 className="h-3.5 w-3.5" /> Share
                        </button>
                        <Link
                          to={`/receive/request/${request.id}`}
                          className="inline-flex items-center gap-1 rounded-full border border-line bg-cream px-2.5 py-1.5 text-[0.75rem] font-semibold text-leaf hover:border-leaf"
                        >
                          Open
                        </Link>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                icon={ArrowDownToLine}
                title="No requests yet"
                description="Create a request when someone needs a clear reminder of your address and amount."
                className="mt-3"
              />
            )}
          </Card>

          <p className="px-1 text-[0.75rem] leading-relaxed text-muted">
            Never share a recovery phrase, private key, OTP, or PIN with a sender. If someone says they need it to
            “complete the transfer”, it is a scam. Ask for the transaction hash instead.
          </p>
        </div>
      </div>

      <Card className="p-4">
        <p className="flex items-center gap-2 text-[0.85rem] text-muted">
          <Copy className="h-4 w-4 text-leaf" /> Tip: after the sender pays, open{" "}
          <Link to="/history" className="font-semibold text-leaf underline">
            History
          </Link>{" "}
          and check the chain. A screenshot is not proof.
        </p>
      </Card>
    </div>
  );
}
