import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  RefreshCw,
  ShieldCheck,
  Wallet as WalletIcon,
  XCircle,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { SafetyAssessment } from "../components/SafetyAssessment";
import { Alert, Badge, Button, Card, Field, Input, Modal, PageLoader, Select } from "../components/ui";
import { useWallet } from "../context/WalletContext";
import { useToast } from "../context/ToastContext";
import { endpoints, errorCode, errorMessage } from "../lib/api";
import { ethToWei, formatEth, isEvmAddress } from "../lib/format";
import { signAndSendTransfer } from "../lib/aurora";

function shortAccount(value) {
  if (!value) return "";
  return value.length > 26 ? `${value.slice(0, 14)}…${value.slice(-8)}` : value;
}

export default function Send() {
  const { wallet, loading, connecting, connect } = useWallet();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [contacts, setContacts] = useState([]);
  const [form, setForm] = useState({ contactId: "", recipient: "", amountEth: "" });
  const [preflight, setPreflight] = useState(null);
  const [checking, setChecking] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [pendingHash, setPendingHash] = useState(null);

  const loadContacts = useCallback(async () => {
    try {
      const { data } = await endpoints.contacts();
      setContacts(data.contacts);
    } catch {
      setContacts([]);
    }
  }, []);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  useEffect(() => {
    if (form.contactId) {
      const contact = contacts.find((item) => item.id === form.contactId);
      if (contact) setForm((current) => ({ ...current, recipient: contact.walletAddress }));
    }
  }, [form.contactId, contacts]);

  const selectedContact = useMemo(
    () => contacts.find((contact) => contact.walletAddress.toLowerCase() === form.recipient.trim().toLowerCase()) || null,
    [contacts, form.recipient],
  );

  const amountWei = useMemo(() => {
    try {
      return form.amountEth.trim() ? ethToWei(form.amountEth) : null;
    } catch {
      return null;
    }
  }, [form.amountEth]);

  const amountValid = Boolean(amountWei);
  const recipientValid = isEvmAddress(form.recipient);
  const canReview = recipientValid && amountValid && !checking;

  const blocked = Boolean(preflight?.assessment?.blocking) || preflight?.assessment?.level === "high_risk";
  const needsAcknowledgement = Boolean(preflight?.assessment?.requiresExtraConfirmation) && !blocked;
  const canApprove = Boolean(preflight) && !blocked && (!needsAcknowledgement || acknowledged);

  function resetReview() {
    setPreflight(null);
    setAcknowledged(false);
    setError("");
  }

  async function review() {
    setError("");
    if (!recipientValid) {
      setError("Enter the recipient's Aurora wallet address. It should start with 0x.");
      return;
    }
    if (!amountValid) {
      setError("Enter an amount greater than zero, using numbers only.");
      return;
    }
    setChecking(true);
    setAcknowledged(false);
    setResult(null);
    try {
      const { data } = await endpoints.preflight({
        recipient: form.recipient.trim(),
        amountEth: form.amountEth.trim(),
      });
      setPreflight(data);
      if (data.assessment?.level === "high_risk") {
        toast("Please read the warnings. This payment has a serious risk.", "warning");
      }
    } catch (err) {
      setError(errorMessage(err, "The safety check could not run."));
    } finally {
      setChecking(false);
    }
  }

  async function tryVerify(hash, attempts = 4) {
    let lastError = null;
    for (let index = 0; index < attempts; index += 1) {
      try {
        const { data } = await endpoints.verifyTransaction(hash);
        return { transaction: data.transaction, chain: data.chain };
      } catch (err) {
        lastError = err;
        if (errorCode(err) !== "TRANSACTION_NOT_FOUND") break;
        // The chain may still be finalising. Wait briefly, then check again.
        await new Promise((resolve) => setTimeout(resolve, 2500));
      }
    }
    return { pending: true, hash, error: lastError };
  }

  async function approveAndSend() {
    if (!canApprove) return;
    setError("");
    setSending(true);
    try {
      const { hash } = await signAndSendTransfer({
        from: wallet.address,
        to: form.recipient.trim().toLowerCase(),
        amountWei,
      });

      setPendingHash(hash);
      const outcome = await tryVerify(hash);

      if (outcome.transaction) {
        setResult({ transaction: outcome.transaction, chain: outcome.chain, hash });
        if (outcome.transaction.status === "CONFIRMED") {
          toast("Payment confirmed on Aurora testnet.", "success");
        } else if (outcome.transaction.status === "FAILED") {
          toast("The chain rejected this transaction. No money moved.", "error");
        } else {
          toast("Wallet approved it, but the chain has not confirmed yet.", "info");
        }
      } else {
        setResult({
          pending: true,
          hash,
          note:
            outcome.error?.response?.data?.error?.message ||
            "Your wallet approved the transaction, but it has not appeared on chain yet. It is not confirmed. Check History in a moment.",
        });
        toast("Wallet approved it, but it is not confirmed yet.", "info");
      }
    } catch (err) {
      const message = String(err?.message || "");
      if (/cancel|reject|closed|denied/i.test(message)) {
        setError("You cancelled the wallet approval. Nothing was sent.");
      } else {
        setError(errorMessage(err, message || "The payment could not be completed."));
      }
    } finally {
      setSending(false);
      setPendingHash(null);
    }
  }

  function sendAnother() {
    setForm({ contactId: "", recipient: "", amountEth: "" });
    setPreflight(null);
    setResult(null);
    setAcknowledged(false);
    setError("");
  }

  if (loading) return <PageLoader label="Checking your wallet…" />;

  if (!wallet) {
    return (
      <div className="space-y-5">
        <PageHeader eyebrow="Send money" title="Connect a wallet before sending" backTo="/dashboard" backLabel="Home" />
        <Card className="p-6">
          <div className="mx-auto max-w-xl text-center">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-mint text-leaf">
              <WalletIcon className="h-8 w-8" />
            </span>
            <h2 className="mt-4 text-[1.35rem] font-semibold text-ink">Your wallet makes the final decision</h2>
            <p className="mt-2 text-[0.92rem] leading-relaxed text-muted">
              SabiSafe prepares the payment and explains the risks. Your own wallet shows the final details and asks you
              to approve.
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
        eyebrow="Send money"
        title="Review carefully, then approve in your wallet"
        description="SabiSafe checks the address, the account, your balance, and common scam signals. It never signs for you."
        backTo="/dashboard"
        backLabel="Home"
        actions={<Badge tone="gold">Aurora testnet only</Badge>}
      />

      {error ? <Alert tone="danger" title="Please check this">{error}</Alert> : null}

      {result ? (
        <Card className={`overflow-hidden ${result.pending ? "border-gold/50" : result.transaction?.status === "CONFIRMED" ? "border-leaf/40" : "border-clay/40"}`}>
          <div className="p-5">
            <div className="flex items-start gap-3">
              <span
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                  result.pending
                    ? "bg-gold-soft text-[#8a5a10]"
                    : result.transaction?.status === "CONFIRMED"
                      ? "bg-mint text-leaf"
                      : "bg-clay-soft text-clay"
                }`}
              >
                {result.pending ? (
                  <Clock className="h-6 w-6" />
                ) : result.transaction?.status === "CONFIRMED" ? (
                  <CheckCircle2 className="h-6 w-6" />
                ) : (
                  <XCircle className="h-6 w-6" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-muted">Transaction result</p>
                <h2 className="mt-1 text-[1.35rem] font-semibold text-ink">
                  {result.pending
                    ? "Not confirmed yet"
                    : result.transaction?.status === "CONFIRMED"
                      ? "Confirmed on Aurora testnet"
                      : result.transaction?.status === "FAILED"
                        ? "The chain rejected this payment"
                        : "Pending confirmation"}
                </h2>
                <p className="mt-1 text-[0.9rem] leading-relaxed text-muted">
                  {result.pending
                    ? result.note
                    : result.transaction?.status === "FAILED"
                      ? "No money moved. A failed transaction can still use a small amount of gas."
                      : "The chain recorded this payment. The details below come from Aurora RPC, not from the app."}
                </p>

                <div className="mt-3 rounded-xl border border-line bg-cream px-3 py-2.5">
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-muted">Transaction hash</p>
                  <p className="mt-0.5 break-all font-mono text-[0.8rem] text-ink">{result.hash || result.transaction?.hash}</p>
                </div>

                {result.transaction ? (
                  <dl className="mt-3 grid gap-2 text-[0.85rem] sm:grid-cols-2">
                    <div>
                      <dt className="text-muted">Amount</dt>
                      <dd className="font-semibold text-ink">
                        {result.chain?.valueWei
                          ? `${formatEth(result.chain.valueWei)} ETH`
                          : "See explorer"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted">Status</dt>
                      <dd className="font-semibold text-ink">{result.transaction.status}</dd>
                    </div>
                    <div>
                      <dt className="text-muted">Block</dt>
                      <dd className="text-ink">{result.chain?.blockHeight || result.transaction.blockHeight || "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-muted">Recipient</dt>
                      <dd className="break-all font-mono text-[0.78rem] text-ink">{result.transaction.recipient}</dd>
                    </div>
                  </dl>
                ) : null}

                <div className="mt-4 flex flex-wrap gap-2">
                  {result.transaction?.explorerUrl ? (
                    <a
                      href={result.transaction.explorerUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-2 rounded-full bg-forest px-4 py-2.5 text-[0.88rem] font-semibold text-cream hover:bg-leaf"
                    >
                      Open explorer <ExternalLink className="h-4 w-4" />
                    </a>
                  ) : null}
                  <Button variant="secondary" onClick={sendAnother} icon={ArrowLeft}>
                    Send another
                  </Button>
                  <Button variant="ghost" onClick={() => navigate("/history")}>
                    View history
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <Card className="p-5">
          <h2 className="text-[1.15rem] font-semibold text-ink">Payment details</h2>
          <p className="mt-1 text-[0.88rem] leading-relaxed text-muted">
            Paste an address or choose a saved contact. Check the first and last characters aloud.
          </p>

          <div className="mt-4 space-y-4">
            {contacts.length ? (
              <Field label="Saved contact (optional)" htmlFor="contactId">
                <Select
                  id="contactId"
                  value={form.contactId}
                  onChange={(event) => {
                    setForm((current) => ({
                      ...current,
                      contactId: event.target.value,
                      recipient:
                        event.target.value === ""
                          ? ""
                          : contacts.find((contact) => contact.id === event.target.value)?.walletAddress || "",
                    }));
                    resetReview();
                  }}
                >
                  <option value="">Paste an address instead</option>
                  {contacts.map((contact) => (
                    <option key={contact.id} value={contact.id}>
                      {contact.name} — {shortAccount(contact.walletAddress)}
                    </option>
                  ))}
                </Select>
              </Field>
            ) : null}

            <Field
              label="Recipient address"
              htmlFor="recipient"
              hint={
                selectedContact
                  ? `Saved contact: ${selectedContact.name} (${selectedContact.relationship.toLowerCase()})`
                  : "Aurora addresses start with 0x and have 40 characters after it."
              }
            >
              <Input
                id="recipient"
                autoComplete="off"
                spellCheck={false}
                placeholder="e.g. 0x1234…abcd"
                value={form.recipient}
                onChange={(event) => {
                  setForm((current) => ({ ...current, recipient: event.target.value.trim(), contactId: "" }));
                  resetReview();
                }}
              />
            </Field>

            <Field label="Amount in ETH" htmlFor="amount" hint="The recipient gets this amount. A tiny network fee is extra.">
              <Input
                id="amount"
                inputMode="decimal"
                autoComplete="off"
                placeholder="e.g. 0.5"
                value={form.amountEth}
                onChange={(event) => {
                  setForm((current) => ({ ...current, amountEth: event.target.value }));
                  resetReview();
                }}
              />
            </Field>

            {wallet ? (
              <div className="rounded-xl border border-line bg-cream px-3.5 py-2.5">
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-muted">From</p>
                <p className="mt-0.5 break-all font-mono text-[0.82rem] text-ink">{wallet.address}</p>
              </div>
            ) : null}

            <Button
              size="lg"
              className="w-full"
              onClick={review}
              loading={checking}
              disabled={!canReview || sending}
              icon={ShieldCheck}
            >
              Review payment safely
            </Button>
            <p className="text-center text-[0.75rem] text-muted">
              This does not send anything yet. You will approve in your wallet next.
            </p>
          </div>
        </Card>

        <div className="space-y-4">
          {preflight ? (
            <>
              <SafetyAssessment assessment={preflight.assessment} />

              {preflight.balance ? (
                <Card className="p-4">
                  <p className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-muted">Balance check</p>
                  <div className="mt-2 flex items-baseline justify-between gap-3">
                    <span className="text-[0.88rem] text-muted">You have</span>
                    <span className="font-semibold text-ink">{preflight.balance.balanceEth} ETH</span>
                  </div>
                  <div className="mt-1 flex items-baseline justify-between gap-3">
                    <span className="text-[0.88rem] text-muted">This payment</span>
                    <span className="font-semibold text-ink">{preflight.balance.requestedEth} ETH</span>
                  </div>
                  <div className="mt-1 flex items-baseline justify-between gap-3">
                    <span className="text-[0.88rem] text-muted">Enough after fee buffer</span>
                    <span className={`font-semibold ${preflight.balance.sufficient ? "text-leaf" : "text-clay"}`}>
                      {preflight.balance.sufficient ? "Yes" : "No"}
                    </span>
                  </div>
                  <p className="mt-2 text-[0.74rem] leading-relaxed text-muted">
                    Balance read directly from Aurora testnet. A little ETH stays reserved for gas.
                  </p>
                </Card>
              ) : null}

              <Card className="p-4">
                <p className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-muted">Final steps</p>
                <ol className="mt-2 space-y-2 text-[0.85rem] leading-relaxed text-ink/85">
                  <li>1. Read every warning above.</li>
                  <li>2. Confirm the address with the person using a call or a message you already trust.</li>
                  <li>3. Approve in your own wallet. SabiSafe cannot approve for you.</li>
                  <li>4. Wait for the chain to confirm. Only then is it sent.</li>
                </ol>

                {needsAcknowledgement ? (
                  <label className="mt-3 flex cursor-pointer items-start gap-2.5 rounded-xl border border-gold/50 bg-gold-soft p-3">
                    <input
                      type="checkbox"
                      checked={acknowledged}
                      onChange={(event) => setAcknowledged(event.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-line text-leaf focus:ring-leaf"
                    />
                    <span className="text-[0.83rem] leading-relaxed text-[#6f4708]">
                      I have read the warnings and I still want to approve this payment in my wallet.
                    </span>
                  </label>
                ) : null}

                {blocked ? (
                  <div className="mt-3 rounded-xl border border-clay/30 bg-clay-soft px-3 py-2.5 text-[0.83rem] leading-relaxed text-[#7a2f16]">
                    SabiSafe will not continue while a serious warning is unresolved. Fix the address or amount first.
                  </div>
                ) : null}

                <Button
                  size="lg"
                  className="mt-3 w-full"
                  variant={blocked ? "muted" : "primary"}
                  disabled={!canApprove || sending}
                  loading={sending}
                  onClick={approveAndSend}
                  icon={ArrowUpRight}
                >
                  {sending ? "Waiting for your wallet…" : `Approve ${form.amountEth || ""} ETH in wallet`}
                </Button>
                {pendingHash ? (
                  <p className="mt-2 break-all text-center text-[0.72rem] text-muted">
                    Wallet returned {pendingHash}
                  </p>
                ) : null}
                <button
                  type="button"
                  onClick={resetReview}
                  className="mt-2 w-full text-center text-[0.78rem] font-semibold text-muted hover:text-ink"
                >
                  Change the details
                </button>
              </Card>
            </>
          ) : (
            <Card className="p-5">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-mint text-leaf">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-[1.05rem] font-semibold text-ink">What we will check</h2>
                  <ul className="mt-2 space-y-2 text-[0.85rem] leading-relaxed text-muted">
                    <li>• Whether the address format is valid.</li>
                    <li>• Whether the address has been used before.</li>
                    <li>• Whether it is a saved contact or a new recipient.</li>
                    <li>• Whether the amount is unusually large.</li>
                    <li>• Whether your balance covers the payment plus fees.</li>
                    <li>• Whether you are sending to yourself or a contract.</li>
                  </ul>
                  <p className="mt-3 text-[0.78rem] leading-relaxed text-muted">
                    These checks catch common mistakes. They cannot prove a person is honest.
                  </p>
                </div>
              </div>
            </Card>
          )}

          <div className="rounded-2xl border border-dashed border-line bg-cream/70 p-4">
            <p className="text-[0.82rem] font-semibold text-ink">Need to receive first?</p>
            <p className="mt-1 text-[0.8rem] leading-relaxed text-muted">
              Get free testnet ETH, or create a receive request for a family member.
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Link to="/receive" className="text-[0.8rem] font-semibold text-leaf hover:underline">
                Receive money
              </Link>
              <Link to="/contacts" className="text-[0.8rem] font-semibold text-leaf hover:underline">
                Manage contacts
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Modal open={Boolean(sending)} onClose={() => {}} title="Waiting for your wallet" description="Approve or cancel in the wallet window.">
        <div className="flex items-start gap-3">
          <RefreshCw className="mt-0.5 h-5 w-5 animate-spin text-leaf" />
          <div>
            <p className="text-[0.9rem] leading-relaxed text-ink">
              Your wallet is asking you to approve {form.amountEth || "the"} ETH to{" "}
              <span className="font-mono">{shortAccount(form.recipient)}</span>.
            </p>
            <p className="mt-2 text-[0.82rem] leading-relaxed text-muted">
              Read the details in your wallet. If anything looks different, cancel. SabiSafe will not claim success
              until the chain confirms.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
