import { Link } from "react-router-dom";
import { ArrowLeft, Compass } from "lucide-react";
import { LogoMark } from "../components/brand/Logo";
import { buttonStyles } from "../components/ui";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-4 text-center">
      <LogoMark className="h-14 w-14" />
      <p className="mt-5 text-[0.72rem] font-bold uppercase tracking-[0.2em] text-clay">Page not found</p>
      <h1 className="mt-2 max-w-md text-[2rem] font-semibold leading-tight text-ink">
        This page is not here, but your money is safe.
      </h1>
      <p className="mt-2 max-w-md text-[0.95rem] leading-relaxed text-muted">
        The link may be old or mistyped. Nothing was sent, and no wallet action happened.
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <Link to="/dashboard" className={buttonStyles({ size: "lg" })}>
          Go to my home page
        </Link>
        <Link to="/" className={buttonStyles({ variant: "secondary", size: "lg" })}>
          <ArrowLeft className="h-4 w-4" /> Back to start
        </Link>
      </div>
      <p className="mt-6 inline-flex items-center gap-1.5 text-[0.78rem] text-muted">
        <Compass className="h-4 w-4" /> SabiSafe · Aurora testnet
      </p>
    </div>
  );
}
