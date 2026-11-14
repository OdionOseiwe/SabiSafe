import { useState } from "react";
import { ChevronDown, ExternalLink, Fingerprint, Lock, ShieldCheck, ShieldAlert, Sparkles } from "lucide-react";
import { Badge } from "./ui";
import { formatDate } from "../lib/format";

function CheckRow({ check }) {
  return (
    <li className="flex items-start gap-2.5">
      <span
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
          check.passed ? "bg-leaf text-white" : "bg-gold text-[#5c3c05]"
        }`}
        aria-hidden="true"
      >
        {check.passed ? "✓" : "!"}
      </span>
      <span className="min-w-0">
        <span className="block text-[0.88rem] font-semibold text-ink">{check.label}</span>
        {check.detail ? <span className="mt-0.5 block text-[0.82rem] leading-relaxed text-muted">{check.detail}</span> : null}
      </span>
    </li>
  );
}

export function VerificationPanel({ verification, compact = false, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen || !compact);
  if (!verification) return null;

  const verified = Boolean(verification.verified);
  const checks = Array.isArray(verification.checks) ? verification.checks : [];
  const signature =
    verification.signatureKind === "provider_tee"
      ? "signed by the model TEE"
      : verification.signatureKind === "gateway"
        ? "signed by the NEAR AI gateway TEE"
        : null;

  if (compact) {
    return (
      <div className="mt-2">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.72rem] font-semibold ${
            verified ? "border-leaf/25 bg-mint text-forest" : "border-gold/50 bg-gold-soft text-[#7a4f0a]"
          }`}
          aria-expanded={open}
        >
          {verified ? <ShieldCheck className="h-3.5 w-3.5" /> : <ShieldAlert className="h-3.5 w-3.5" />}
          {verified ? "Verified private AI" : "Not verified"}
          <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        {open ? <VerificationBody verification={verification} /> : null}
      </div>
    );
  }

  return (
    <section
      className={`overflow-hidden rounded-2xl border ${
        verified ? "border-leaf/25 bg-mint/70" : "border-gold/50 bg-gold-soft/80"
      }`}
      aria-label="AI verification details"
    >
      <div className="flex items-start gap-3 p-4">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            verified ? "bg-leaf text-white" : "bg-gold text-[#5c3c05]"
          }`}
        >
          {verified ? <ShieldCheck className="h-5 w-5" /> : <ShieldAlert className="h-5 w-5" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[0.98rem] font-semibold text-ink">
              {verified ? "Verified private AI" : "This answer is not verified"}
            </h3>
            <Badge tone={verified ? "green" : "gold"}>{verification.privacyTier || "NEAR AI Cloud"}</Badge>
          </div>
          <p className="mt-1 text-[0.88rem] leading-relaxed text-forest/90">
            {verified
              ? "We checked the digital proof that this answer was processed inside a sealed NEAR AI computer. Nobody at NEAR AI could read your question."
              : verification.message || "The cryptographic proof could not be checked, so we are not claiming this answer is verified."}
          </p>
          {verified ? (
            <p className="mt-2 text-[0.8rem] leading-relaxed text-muted">
              {verification.modelLabel || verification.model || "Private model"}
              {signature ? ` · ${signature}` : ""}
              {verification.checkedAt ? ` · ${formatDate(verification.checkedAt, { hour: "2-digit", minute: "2-digit" })}` : ""}
            </p>
          ) : null}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between border-t border-ink/5 px-4 py-2.5 text-left text-[0.8rem] font-semibold text-forest hover:bg-black/[0.03]"
        aria-expanded={open}
      >
        <span>What we checked</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open ? <VerificationBody verification={verification} /> : null}
    </section>
  );
}

function VerificationBody({ verification }) {
  const checks = Array.isArray(verification.checks) ? verification.checks : [];
  return (
    <div className="border-t border-ink/5 bg-paper/70 px-4 py-3">
      {checks.length ? (
        <ul className="space-y-3">
          {checks.map((check) => (
            <CheckRow key={check.key || check.label} check={check} />
          ))}
        </ul>
      ) : (
        <p className="text-[0.85rem] text-muted">No checks were returned.</p>
      )}

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[0.75rem] text-muted">
        {verification.signatureKind ? (
          <span className="inline-flex items-center gap-1">
            <Fingerprint className="h-3.5 w-3.5" /> Signature: {verification.signatureKind}
          </span>
        ) : null}
        {verification.nonce ? <span className="font-mono">challenge: {verification.nonce}</span> : null}
        {verification.e2ee ? (
          <span className="inline-flex items-center gap-1">
            <Lock className="h-3.5 w-3.5" /> End-to-end encrypted
          </span>
        ) : null}
        {verification.model ? (
          <span className="inline-flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5" /> {verification.model}
          </span>
        ) : null}
      </div>

      <p className="mt-3 rounded-lg bg-cream px-3 py-2 text-[0.76rem] leading-relaxed text-muted">
        {verification.note ||
          "This proves where the answer was processed, not that it is factually correct. It is not financial advice."}
      </p>
      <a
        href="https://docs.near.ai/cloud/verification"
        target="_blank"
        rel="noreferrer noopener"
        className="mt-2 inline-flex items-center gap-1 text-[0.76rem] font-semibold text-leaf hover:underline"
      >
        How NEAR AI verification works <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  );
}
