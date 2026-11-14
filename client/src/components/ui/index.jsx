import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Clipboard,
  Copy,
  Info,
  Loader2,
  X,
  XCircle,
} from "lucide-react";
import { useToast } from "../../context/ToastContext";

export function buttonStyles({ variant = "primary", size = "md", className = "" } = {}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-55 active:translate-y-px";
  const sizes = {
    sm: "px-3.5 py-2 text-[0.85rem]",
    md: "px-5 py-2.5 text-[0.95rem]",
    lg: "px-6 py-3.5 text-base",
  };
  const variants = {
    primary: "bg-forest text-cream shadow-soft hover:bg-leaf",
    secondary: "border border-line bg-paper text-ink hover:border-leaf hover:bg-cream",
    clay: "bg-clay text-white shadow-soft hover:brightness-95",
    ghost: "text-forest hover:bg-sand",
    danger: "border border-clay/30 bg-clay-soft text-clay hover:bg-clay hover:text-white",
    muted: "bg-sand text-ink hover:bg-line",
  };
  return `${base} ${sizes[size]} ${variants[variant]} ${className}`;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  icon: Icon,
  className = "",
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      className={buttonStyles({ variant, size, className })}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : Icon ? <Icon className="h-4 w-4" aria-hidden="true" /> : null}
      {children}
    </button>
  );
}

export function Card({ children, className = "", as: Tag = "div", ...props }) {
  return (
    <Tag className={`rounded-card border border-line bg-paper shadow-soft ${className}`} {...props}>
      {children}
    </Tag>
  );
}

export function SectionHeading({ eyebrow, title, description, action, className = "" }) {
  return (
    <div className={`flex flex-wrap items-end justify-between gap-4 ${className}`}>
      <div className="max-w-2xl">
        {eyebrow ? (
          <p className="mb-1.5 text-[0.7rem] font-bold uppercase tracking-[0.18em] text-clay">{eyebrow}</p>
        ) : null}
        <h2 className="text-2xl font-semibold text-ink md:text-[1.8rem]">{title}</h2>
        {description ? <p className="mt-1.5 text-[0.98rem] leading-relaxed text-muted">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Badge({ children, tone = "neutral", className = "", icon: Icon }) {
  const tones = {
    neutral: "border-line bg-cream text-muted",
    green: "border-leaf/20 bg-mint text-leaf",
    clay: "border-clay/25 bg-clay-soft text-clay",
    gold: "border-gold/40 bg-gold-soft text-[#8a5a10]",
    dark: "border-forest bg-forest text-cream",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.72rem] font-semibold uppercase tracking-wide ${tones[tone] || tones.neutral} ${className}`}
    >
      {Icon ? <Icon className="h-3.5 w-3.5" aria-hidden="true" /> : null}
      {children}
    </span>
  );
}

export function Field({ label, htmlFor, hint, error, children, className = "" }) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-[0.95rem] font-semibold text-ink">
        {label}
      </label>
      {children}
      {error ? (
        <p className="mt-1.5 text-[0.85rem] font-medium text-clay" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-[0.85rem] leading-relaxed text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

const inputBase =
  "w-full rounded-xl border border-line bg-white px-4 py-3 text-base text-ink placeholder:text-muted/60 transition-colors focus:border-leaf focus:outline-none focus:ring-4 focus:ring-leaf/10";

export function Input({ className = "", ...props }) {
  return <input className={`${inputBase} ${className}`} {...props} />;
}

export function Textarea({ className = "", rows = 4, ...props }) {
  return <textarea rows={rows} className={`${inputBase} resize-y ${className}`} {...props} />;
}

export function Select({ className = "", children, ...props }) {
  return (
    <select className={`${inputBase} appearance-none pr-10 ${className}`} {...props}>
      {children}
    </select>
  );
}

export function ProgressBar({ value = 0, max = 100, label, className = "" }) {
  const percent = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className={className}>
      {label ? (
        <div className="mb-1.5 flex items-baseline justify-between text-[0.85rem] font-medium text-muted">
          <span>{label}</span>
          <span aria-hidden="true">{percent}%</span>
        </div>
      ) : null}
      <div
        className="h-2.5 w-full overflow-hidden rounded-full bg-sand"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || "Progress"}
      >
        <div className="h-full rounded-full bg-leaf transition-all duration-500" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export function Spinner({ label = "Loading" }) {
  return (
    <span className="inline-flex items-center gap-2 text-muted" role="status">
      <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
      <span className="text-sm">{label}</span>
    </span>
  );
}

export function PageLoader({ label = "Getting things ready…" }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-muted">
      <Loader2 className="h-8 w-8 animate-spin text-leaf" aria-hidden="true" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}

export function Alert({ tone = "info", title, children, className = "", icon: Icon }) {
  const tones = {
    info: { box: "border-line bg-cream text-ink", icon: Info, iconColor: "text-leaf" },
    success: { box: "border-leaf/25 bg-mint text-forest", icon: CheckCircle2, iconColor: "text-leaf" },
    warning: { box: "border-gold/50 bg-gold-soft text-[#6f4708]", icon: AlertTriangle, iconColor: "text-[#a06a10]" },
    danger: { box: "border-clay/30 bg-clay-soft text-[#7a2f16]", icon: XCircle, iconColor: "text-clay" },
  };
  const config = tones[tone] || tones.info;
  const IconComponent = Icon || config.icon;
  return (
    <div className={`flex items-start gap-3 rounded-xl border p-4 ${config.box} ${className}`} role={tone === "danger" ? "alert" : undefined}>
      <IconComponent className={`mt-0.5 h-5 w-5 shrink-0 ${config.iconColor}`} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        {title ? <p className="font-semibold">{title}</p> : null}
        <div className={`text-[0.92rem] leading-relaxed ${title ? "mt-0.5" : ""}`}>{children}</div>
      </div>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action, className = "" }) {
  return (
    <div className={`flex flex-col items-center justify-center rounded-card border border-dashed border-line bg-cream/60 px-6 py-12 text-center ${className}`}>
      {Icon ? (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-paper text-leaf shadow-soft">
          <Icon className="h-7 w-7" aria-hidden="true" />
        </div>
      ) : null}
      <h3 className="text-lg font-semibold text-ink">{title}</h3>
      {description ? <p className="mt-1.5 max-w-md text-[0.92rem] leading-relaxed text-muted">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function Toggle({ checked, onChange, label, description, disabled = false }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-xl border border-line bg-white p-4 text-left transition-colors hover:border-leaf/50 disabled:opacity-60"
    >
      <span>
        <span className="block text-[0.95rem] font-semibold text-ink">{label}</span>
        {description ? <span className="mt-0.5 block text-[0.85rem] leading-relaxed text-muted">{description}</span> : null}
      </span>
      <span
        className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${checked ? "bg-leaf" : "bg-line"}`}
        aria-hidden="true"
      >
        <span
          className={`absolute h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`}
        />
      </span>
    </button>
  );
}

export function CopyButton({ value, label = "Copy", copiedLabel = "Copied", className = "", size = "sm", variant = "secondary" }) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast("Copied to your clipboard.", "success", { duration: 2500 });
      setTimeout(() => setCopied(false), 2200);
    } catch {
      toast("Your browser blocked copying. Please select the text and copy it yourself.", "warning");
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={copy}
      className={className}
      icon={copied ? Check : Copy}
      aria-label={`${label} ${value ? "text" : ""}`.trim()}
    >
      {copied ? copiedLabel : label}
    </Button>
  );
}

export function Modal({ open, onClose, title, description, children, footer, size = "md" }) {
  useEffect(() => {
    if (!open) return undefined;
    function onKey(event) {
      if (event.key === "Escape") onClose?.();
    }
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;

  const sizes = { sm: "max-w-md", md: "max-w-xl", lg: "max-w-2xl" };

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-ink/45 p-3 backdrop-blur-sm sm:items-center sm:p-6">
      <div
        className={`max-h-[92vh] w-full ${sizes[size]} overflow-y-auto rounded-[1.75rem] border border-line bg-cream shadow-lift`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line bg-paper px-6 py-5">
          <div>
            <h2 className="text-xl font-semibold text-ink">{title}</h2>
            {description ? <p className="mt-1 text-[0.9rem] leading-relaxed text-muted">{description}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-muted transition-colors hover:bg-sand hover:text-ink"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer ? <div className="flex flex-wrap justify-end gap-3 border-t border-line bg-paper px-6 py-4">{footer}</div> : null}
      </div>
    </div>,
    document.body,
  );
}

export function IconButton({ label, children, className = "", ...props }) {
  return (
    <button
      type="button"
      aria-label={label}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-paper text-ink transition-colors hover:border-leaf hover:text-leaf ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Stat({ label, value, hint, tone = "default" }) {
  return (
    <div className={`rounded-2xl border p-4 ${tone === "green" ? "border-leaf/20 bg-mint" : "border-line bg-cream"}`}>
      <p className="text-[0.72rem] font-bold uppercase tracking-[0.14em] text-muted">{label}</p>
      <p className="mt-1 font-display text-2xl font-semibold text-ink">{value}</p>
      {hint ? <p className="mt-0.5 text-[0.82rem] leading-relaxed text-muted">{hint}</p> : null}
    </div>
  );
}

export function ClipboardNote({ children }) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-dashed border-line bg-cream px-3.5 py-2.5 text-[0.85rem] leading-relaxed text-muted">
      <Clipboard className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}
