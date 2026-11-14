import { Link } from "react-router-dom";
import { ShieldCheck, Sparkles, Wallet } from "lucide-react";
import { LogoMark } from "../brand/Logo";

export function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen bg-cream lg:grid lg:grid-cols-[0.92fr_1.08fr]">
      <aside className="relative hidden overflow-hidden bg-forest px-10 py-12 text-cream lg:flex lg:flex-col lg:justify-between">
        <div className="grain absolute inset-0 opacity-70" aria-hidden="true" />
        <div className="relative">
          <Link to="/" className="inline-flex items-center gap-3" aria-label="SabiSafe home">
            <LogoMark className="h-11 w-11" />
            <span>
              <span className="block font-display text-[1.35rem] font-semibold text-cream">SabiSafe</span>
              <span className="mt-0.5 block text-[0.62rem] font-bold uppercase tracking-[0.22em] text-cream/60">
                Money made clear
              </span>
            </span>
          </Link>

          <h2 className="mt-16 max-w-md text-[2.6rem] font-semibold leading-[1.08]">
            A calmer way to learn money.
          </h2>
          <p className="mt-4 max-w-md text-[1rem] leading-relaxed text-cream/75">
            Private answers, plain words, and real practice on Aurora testnet. No recovery phrases, no pressure, no
            pretending.
          </p>

          <ul className="mt-10 space-y-4">
            {[
              { icon: ShieldCheck, title: "Verified private AI", body: "We check the TEE proof before calling an answer verified." },
              { icon: Wallet, title: "You approve every payment", body: "Your wallet signs. SabiSafe never holds your keys." },
              { icon: Sparkles, title: "Built for beginners", body: "Big text, voice support, and a Pidgin option." },
            ].map((item) => (
              <li key={item.title} className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cream/10 text-gold">
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span>
                  <span className="block font-semibold">{item.title}</span>
                  <span className="mt-0.5 block text-[0.85rem] leading-relaxed text-cream/65">{item.body}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative mt-10 text-[0.75rem] leading-relaxed text-cream/50">
          Aurora testnet only. We will never ask for your recovery phrase, private key, OTP, or PIN.
        </p>
      </aside>

      <main className="flex min-h-screen flex-col px-5 py-8 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between lg:hidden">
          <Link to="/" className="inline-flex items-center gap-2.5" aria-label="SabiSafe home">
            <LogoMark className="h-10 w-10" />
            <span className="font-display text-[1.3rem] font-semibold text-ink">SabiSafe</span>
          </Link>
          <span className="rounded-full border border-gold/40 bg-gold-soft px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-wide text-[#8a5a10]">
            Testnet
          </span>
        </div>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          <div>
            <h1 className="text-[2rem] font-semibold leading-tight text-ink">{title}</h1>
            {subtitle ? <p className="mt-2 text-[0.95rem] leading-relaxed text-muted">{subtitle}</p> : null}
          </div>
          <div className="mt-7">{children}</div>
          {footer ? <div className="mt-7 text-center text-[0.9rem] text-muted">{footer}</div> : null}
        </div>

        <p className="mx-auto w-full max-w-md text-center text-[0.72rem] leading-relaxed text-muted">
          SabiSafe is a learning and practice tool, not a bank or financial adviser.
        </p>
      </main>
    </div>
  );
}
