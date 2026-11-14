import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  KeyRound,
  Lock,
  MessageSquareWarning,
  RefreshCw,
  ScanLine,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { Alert, Badge, Button, Card, PageLoader, Textarea } from "../components/ui";
import { endpoints, errorMessage } from "../lib/api";
import { useToast } from "../context/ToastContext";

const LEVEL_STYLES = {
  high_risk: { box: "border-clay/30 bg-clay-soft", text: "text-[#7a2f16]", icon: ShieldAlert, label: "Stop" },
  caution: { box: "border-gold/50 bg-gold-soft", text: "text-[#6f4708]", icon: AlertTriangle, label: "Caution" },
  info: { box: "border-leaf/20 bg-mint", text: "text-forest", icon: ShieldCheck, label: "Good to know" },
};

const FLAG_LABELS = {
  asks_for_secrets: "It asks for secret words or keys",
  upfront_fee: "It asks for a fee before you receive something",
  urgency: "It rushes you",
  short_link: "It contains a shortened or messaging link",
  too_good_to_be_true: "It promises guaranteed or huge profit",
};

export default function Safety() {
  const { toast } = useToast();
  const [tips, setTips] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scan, setScan] = useState(null);
  const [scanError, setScanError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await endpoints.safetyTips();
      setTips(data);
    } catch (err) {
      setError(errorMessage(err, "Safety tips could not be loaded."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function scanMessage(event) {
    event.preventDefault();
    setScanError("");
    if (message.trim().length < 3) {
      setScanError("Paste a message with at least a few words.");
      return;
    }
    setScanning(true);
    try {
      const { data } = await endpoints.scanMessage(message.trim());
      setScan(data);
    } catch (err) {
      setScanError(errorMessage(err, "The message could not be checked."));
    } finally {
      setScanning(false);
    }
  }

  if (loading && !tips) return <PageLoader label="Opening the Safety Centre…" />;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Safety Centre"
        title="Calm rules for a risky world"
        description="Most losses come from a shared secret, a rushed decision, or a link. These checks help you slow down before money moves."
        actions={
          <Button variant="secondary" size="sm" onClick={load} loading={loading} icon={RefreshCw}>
            Refresh tips
          </Button>
        }
      />

      {error ? (
        <Alert tone="danger" title="We could not load the safety tips">
          {error}{" "}
          <button type="button" onClick={load} className="font-semibold underline">
            Try again
          </button>
        </Alert>
      ) : null}

      <Card className="border-clay/25 bg-clay-soft/60 p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-clay text-white">
            <KeyRound className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-[1.1rem] font-semibold text-[#7a2f16]">We will never ask for your secrets</h2>
            <p className="mt-1 text-[0.9rem] leading-relaxed text-[#7a2f16]/85">
              Not your recovery phrase, private key, OTP, PIN, or password. No real support person will either. If
              someone asks, stop the conversation. SabiGuide also blocks those messages before they reach any AI model.
            </p>
          </div>
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <Card className="p-5">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-clay">Check a message</p>
              <h2 className="mt-1 flex items-center gap-2 text-[1.15rem] font-semibold text-ink">
                <ScanLine className="h-5 w-5 text-leaf" /> Is this message a scam?
              </h2>
            </div>
            <Badge tone="neutral">Pattern check</Badge>
          </div>
          <p className="mt-1.5 text-[0.88rem] leading-relaxed text-muted">
            Paste a suspicious message. Remove your own personal details first. This is a rule-based checker, not an AI
            judgement, and it cannot guarantee safety.
          </p>

          <form onSubmit={scanMessage} className="mt-4 space-y-3">
            {scanError ? <Alert tone="danger">{scanError}</Alert> : null}
            <Textarea
              aria-label="Message to check"
              rows={5}
              maxLength={4000}
              placeholder="Paste the message here…"
              value={message}
              onChange={(event) => {
                setMessage(event.target.value);
                setScan(null);
              }}
            />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[0.74rem] text-muted">{message.length}/4000 characters</p>
              <Button type="submit" loading={scanning} disabled={!message.trim()} icon={MessageSquareWarning}>
                Check this message
              </Button>
            </div>
          </form>

          {scan ? (
            <div className="mt-4 space-y-3">
              <div
                className={`rounded-2xl border p-4 ${
                  scan.flagged ? "border-clay/30 bg-clay-soft" : "border-leaf/25 bg-mint"
                }`}
              >
                <p className={`flex items-center gap-2 text-[0.95rem] font-semibold ${scan.flagged ? "text-[#7a2f16]" : "text-forest"}`}>
                  {scan.flagged ? <ShieldAlert className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
                  {scan.flagged ? "This message has warning signs" : "No common scam pattern found"}
                </p>
                <p className="mt-1 text-[0.86rem] leading-relaxed text-ink/80">{scan.advice}</p>
                {scan.flags?.length ? (
                  <ul className="mt-2 space-y-1.5">
                    {scan.flags.map((flag) => (
                      <li key={flag} className="flex items-start gap-2 text-[0.83rem] font-medium text-[#7a2f16]">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                        {FLAG_LABELS[flag] || flag.replace(/_/g, " ")}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
              <p className="text-[0.75rem] leading-relaxed text-muted">{scan.note}</p>
              <div className="rounded-xl border border-line bg-cream p-3">
                <p className="text-[0.82rem] font-semibold text-ink">What to do next</p>
                <ol className="mt-1.5 space-y-1.5 text-[0.82rem] leading-relaxed text-muted">
                  <li>1. Do not send money or click the link.</li>
                  <li>2. Do not share a recovery phrase, private key, OTP, or PIN.</li>
                  <li>3. Call a person you trust using a number you already have.</li>
                  <li>4. Report it to your bank or local authority if money was lost.</li>
                </ol>
              </div>
            </div>
          ) : null}
        </Card>

        <div className="space-y-4">
          {(tips?.tips || []).map((tip) => {
            const meta = LEVEL_STYLES[tip.level] || LEVEL_STYLES.info;
            const Icon = meta.icon;
            return (
              <Card key={tip.key} className={`border p-4 ${meta.box}`}>
                <div className="flex items-start gap-3">
                  <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${meta.text}`} />
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className={`text-[0.95rem] font-semibold ${meta.text}`}>{tip.title}</h3>
                      <span className={`rounded-full bg-white/60 px-2 py-0.5 text-[0.66rem] font-bold uppercase tracking-wide ${meta.text}`}>
                        {meta.label}
                      </span>
                    </div>
                    <p className="mt-1 text-[0.85rem] leading-relaxed text-ink/80">{tip.body}</p>
                  </div>
                </div>
              </Card>
            );
          })}
          {tips?.reminder ? (
            <p className="rounded-xl border border-dashed border-line bg-cream px-3.5 py-3 text-[0.8rem] leading-relaxed text-muted">
              {tips.reminder}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <Lock className="h-5 w-5 text-leaf" />
          <h3 className="mt-2 text-[0.98rem] font-semibold text-ink">If you shared a phrase</h3>
          <p className="mt-1 text-[0.83rem] leading-relaxed text-muted">
            Create a new wallet with a new phrase and move your funds immediately. Do not reuse the old phrase. Ask
            someone you trust to sit with you.
          </p>
        </Card>
        <Card className="p-5">
          <CheckCircle2 className="h-5 w-5 text-leaf" />
          <h3 className="mt-2 text-[0.98rem] font-semibold text-ink">If a payment looks wrong</h3>
          <p className="mt-1 text-[0.83rem] leading-relaxed text-muted">
            Ask for the transaction hash, check it in History or on the explorer, and compare the amount and recipient.
            A screenshot is not proof.
          </p>
        </Card>
        <Card className="p-5">
          <Sparkles className="h-5 w-5 text-leaf" />
          <h3 className="mt-2 text-[0.98rem] font-semibold text-ink">If you feel rushed</h3>
          <p className="mt-1 text-[0.83rem] leading-relaxed text-muted">
            Stop. Urgency is a tool scammers use to prevent a second opinion. A real emergency can survive a five-minute
            pause and a phone call.
          </p>
        </Card>
      </div>

      <Card className="p-4">
        <p className="text-[0.82rem] font-semibold text-ink">Learn more from official sources</p>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-[0.82rem]">
          <a
            href="https://doc.aurora.dev/"
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1 font-semibold text-leaf hover:underline"
          >
            Aurora documentation <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <a
            href="https://docs.near.ai/cloud/verification"
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1 font-semibold text-leaf hover:underline"
          >
            NEAR AI verification <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <a
            href="https://explorer.aurora.dev"
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1 font-semibold text-leaf hover:underline"
          >
            Testnet explorer <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </Card>
    </div>
  );
}
