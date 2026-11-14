import { AlertTriangle, Check, Info, ShieldAlert, ShieldCheck, X } from "lucide-react";
import { Badge } from "./ui";

const LEVEL_META = {
  high_risk: {
    label: "Stop and check",
    box: "border-clay/30 bg-clay-soft",
    text: "text-[#7a2f16]",
    icon: ShieldAlert,
  },
  caution: {
    label: "Please check",
    box: "border-gold/50 bg-gold-soft",
    text: "text-[#6f4708]",
    icon: AlertTriangle,
  },
  info: {
    label: "Good to know",
    box: "border-leaf/20 bg-mint",
    text: "text-forest",
    icon: Info,
  },
};

export function SafetyAssessment({ assessment, compact = false }) {
  if (!assessment) return null;

  const reasons = Array.isArray(assessment.reasons) ? assessment.reasons : [];
  const checks = Array.isArray(assessment.checks) ? assessment.checks : [];
  const meta = LEVEL_META[assessment.level] || LEVEL_META.info;

  return (
    <section className={`rounded-2xl border p-4 ${meta.box}`} aria-label="Safety review">
      <div className="flex items-start gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/70 ${meta.text}`}>
          {assessment.level === "info" ? <ShieldCheck className="h-5 w-5" /> : <ShieldAlert className="h-5 w-5" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className={`font-semibold ${meta.text}`}>{assessment.headline}</h3>
            <Badge tone={assessment.level === "high_risk" ? "clay" : assessment.level === "caution" ? "gold" : "green"}>
              {meta.label}
            </Badge>
          </div>
          {reasons.length ? (
            <ul className="mt-3 space-y-3">
              {reasons.map((reason) => {
                const itemMeta = LEVEL_META[reason.level] || LEVEL_META.info;
                const Icon = itemMeta.icon;
                return (
                  <li key={`${reason.code}-${reason.title}`} className="flex items-start gap-2.5">
                    <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${itemMeta.text}`} aria-hidden="true" />
                    <div>
                      <p className={`text-[0.9rem] font-semibold ${itemMeta.text}`}>{reason.title}</p>
                      <p className="mt-0.5 text-[0.85rem] leading-relaxed text-ink/80">{reason.message}</p>
                      {reason.action ? (
                        <p className="mt-1 text-[0.8rem] font-semibold text-ink">{reason.action}</p>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-1.5 text-[0.88rem] leading-relaxed text-forest/90">
              Our automatic checks did not find a problem. You should still confirm the person and the address.
            </p>
          )}

          {assessment.blocking ? (
            <p className="mt-3 rounded-lg bg-white/70 px-3 py-2 text-[0.82rem] font-medium text-ink">
              {assessment.blocking}
            </p>
          ) : null}

          {!compact && checks.length ? (
            <details className="mt-3">
              <summary className="cursor-pointer text-[0.8rem] font-semibold text-ink/80">
                See all {checks.length} checks
              </summary>
              <ul className="mt-2 space-y-2">
                {checks.map((check) => (
                  <li key={check.key || check.label} className="flex items-start gap-2 text-[0.82rem]">
                    <span
                      className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                        check.passed ? "bg-leaf text-white" : "bg-white text-clay"
                      }`}
                      aria-hidden="true"
                    >
                      {check.passed ? <Check className="h-2.5 w-2.5" /> : <X className="h-2.5 w-2.5" />}
                    </span>
                    <span>
                      <span className="font-medium text-ink">{check.label}:</span>{" "}
                      <span className="text-muted">{check.detail}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </details>
          ) : null}

          {!compact ? (
            <p className="mt-3 text-[0.76rem] leading-relaxed text-ink/60">{assessment.disclaimer}</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
