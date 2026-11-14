import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { AlertTriangle, ArrowRight, CheckCircle2, Droplets, ExternalLink, ShieldCheck } from "lucide-react";
import { Logo } from "../components/brand/Logo";
import { Alert, Badge, Button, Card, CopyButton, PageLoader } from "../components/ui";
import { endpoints, errorMessage } from "../lib/api";
import { formatEth, formatDate } from "../lib/format";

export default function PublicReceiveRequest() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    endpoints
      .publicReceiving(id)
      .then(({ data: payload }) => {
        if (alive) setData(payload);
      })
      .catch((err) => {
        if (alive) setError(errorMessage(err, "That payment request could not be found."));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [id]);

  if (loading) return <PageLoader label="Opening the payment request…" />;

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream px-4">
        <Card className="w-full max-w-md p-6 text-center">
          <AlertTriangle className="mx-auto h-10 w-10 text-clay" />
          <h1 className="mt-3 text-xl font-semibold text-ink">Request not found</h1>
          <p className="mt-1.5 text-[0.9rem] leading-relaxed text-muted">{error}</p>
          <Link to="/" className="mt-4 inline-block font-semibold text-leaf hover:underline">
            Go to SabiSafe
          </Link>
        </Card>
      </div>
    );
  }

  const request = data.request;
  const explorer = `https://explorer.aurora.dev/address/${request.recipientAddress}`;

  return (
    <div className="min-h-screen bg-cream px-4 py-8">
      <div className="mx-auto max-w-lg">
        <div className="mb-5 flex items-center justify-between">
          <Logo />
          <Badge tone="gold">Aurora testnet</Badge>
        </div>

        <Card className="overflow-hidden">
          <div className="bg-forest px-6 py-6 text-cream">
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-gold">Payment request</p>
            <h1 className="mt-2 text-[1.6rem] font-semibold leading-tight">
              {request.recipientName} is asking for money
            </h1>
            <p className="mt-1 text-[0.9rem] text-cream/70">
              From {request.payerName} · {formatDate(request.createdAt)}
            </p>
          </div>

          <div className="p-5">
            <div className="rounded-2xl border border-line bg-white p-4 text-center">
              <p className="text-[0.72rem] font-bold uppercase tracking-[0.14em] text-muted">Amount</p>
              <p className="mt-1 font-display text-[2.2rem] font-semibold leading-none text-ink">
                {request.amountWei ? formatEth(request.amountWei) : "Any"}
                <span className="ml-1.5 font-sans text-[1rem] font-semibold text-muted">ETH</span>
              </p>
              {request.note ? <p className="mt-2 text-[0.87rem] leading-relaxed text-muted">{request.note}</p> : null}
            </div>

            <div className="mt-4 flex justify-center rounded-2xl border border-line bg-white p-4">
              <QRCodeSVG
                value={request.recipientAddress}
                size={180}
                level="M"
                marginSize={1}
                fgColor="#0F3D2E"
                title={`Aurora address ${request.recipientAddress}`}
              />
            </div>

            <div className="mt-4 rounded-xl border border-line bg-cream px-3.5 py-3">
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-muted">Send to this address</p>
              <p className="mt-1 break-all font-mono text-[0.86rem] text-ink">{request.recipientAddress}</p>
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <CopyButton value={request.recipientAddress} label="Copy address" size="md" className="w-full" />
              <a
                href={explorer}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-line bg-paper px-5 py-2.5 text-[0.92rem] font-semibold text-ink hover:border-leaf"
              >
                Check address <ExternalLink className="h-4 w-4" />
              </a>
            </div>

            <Alert tone="warning" className="mt-4" title="Send from your own wallet">
              SabiSafe only displays this request. It cannot move money. Open your wallet, paste the address, read the
              whole address, then approve. Testnet ETH have no real value.
            </Alert>

            <div className="mt-4 space-y-2 rounded-xl border border-line bg-paper p-3.5">
              {[
                "Check the first and last six characters with the person by phone.",
                "Send a small test amount first if this address is new to you.",
                "Never share a recovery phrase or private key. Nobody needs it to receive money.",
                "Only a confirmed transaction hash proves a payment happened.",
              ].map((item) => (
                <p key={item} className="flex items-start gap-2 text-[0.82rem] leading-relaxed text-ink/85">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-leaf" />
                  {item}
                </p>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
              <a
                href={data.faucetUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 text-[0.8rem] font-semibold text-leaf hover:underline"
              >
                <Droplets className="h-4 w-4" /> Need testnet ETH?
              </a>
              <span className="inline-flex items-center gap-1 text-[0.75rem] text-muted">
                <ShieldCheck className="h-3.5 w-3.5" /> {data.notice}
              </span>
            </div>
          </div>
        </Card>

        <div className="mt-5 text-center">
          <Link to="/" className="inline-flex items-center gap-1 text-[0.85rem] font-semibold text-forest hover:underline">
            Learn safe crypto with SabiSafe <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="mt-2 text-[0.72rem] leading-relaxed text-muted">
            SabiSafe will never ask for your recovery phrase, private key, OTP, or PIN.
          </p>
        </div>
      </div>
    </div>
  );
}
