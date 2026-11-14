import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export function PageHeader({ eyebrow, title, description, actions, backTo, backLabel = "Back" }) {
  return (
    <header className="mb-6 md:mb-8">
      {backTo ? (
        <Link
          to={backTo}
          className="mb-3 inline-flex items-center gap-1.5 text-[0.85rem] font-semibold text-leaf hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> {backLabel}
        </Link>
      ) : null}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-3xl">
          {eyebrow ? (
            <p className="mb-1.5 text-[0.7rem] font-bold uppercase tracking-[0.18em] text-clay">{eyebrow}</p>
          ) : null}
          <h1 className="text-[1.9rem] font-semibold leading-tight text-ink md:text-[2.35rem]">{title}</h1>
          {description ? <p className="mt-2 max-w-2xl text-[0.98rem] leading-relaxed text-muted">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </header>
  );
}
