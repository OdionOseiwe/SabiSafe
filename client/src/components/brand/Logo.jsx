import { Link } from "react-router-dom";

export function LogoMark({ className = "h-10 w-10" }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <rect width="48" height="48" rx="14" fill="#0F3D2E" />
      <path
        d="M24 9.5c6.4 2.6 10.4 7.9 10.4 14.1 0 8.3-5.6 13.4-10.4 15.9-4.8-2.5-10.4-7.6-10.4-15.9C13.6 17.4 17.6 12.1 24 9.5Z"
        fill="#DCECDF"
        opacity="0.18"
      />
      <path
        d="M24 12.5c4.6 2.4 7.6 6.4 7.6 11.1 0 5.9-3.9 9.9-7.6 12-3.7-2.1-7.6-6.1-7.6-12 0-4.7 3-8.7 7.6-11.1Z"
        fill="#DCECDF"
      />
      <path
        d="M24 30.5c-4.3-3.2-5.7-7.5-4.6-11.6 3.6 1 6.1 3.8 6.6 7.6.5-3.8 3-6.6 6.6-7.6 1.1 4.1-.3 8.4-4.6 11.6"
        stroke="#0F3D2E"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="36.5" cy="12.5" r="2.6" fill="#E6B34A" />
    </svg>
  );
}

export function Logo({ to = "/", compact = false, className = "" }) {
  return (
    <Link to={to} className={`inline-flex items-center gap-3 ${className}`} aria-label="SabiSafe home">
      <LogoMark className={compact ? "h-9 w-9" : "h-11 w-11"} />
      <span className="leading-none">
        <span
          className={`block font-display text-[1.35rem] font-semibold tracking-tight text-ink ${
            compact ? "hidden sm:block" : ""
          }`}
        >
          SabiSafe
        </span>
        {!compact ? (
          <span className="mt-1 block text-[0.66rem] font-bold uppercase tracking-[0.2em] text-muted">
            Money made clear
          </span>
        ) : null}
      </span>
    </Link>
  );
}
