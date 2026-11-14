import { ArrowDownLeft, ArrowUpRight, ExternalLink } from "lucide-react";
import { Badge } from "./ui";
import { formatEth, relativeDate, shortAddress, statusTone } from "../lib/format";

export function TransactionRow({ transaction, showExplorer = true }) {
  const outgoing = transaction.direction === "OUTGOING";
  const other = outgoing ? transaction.recipient : transaction.sender;
  const Icon = outgoing ? ArrowUpRight : ArrowDownLeft;

  return (
    <div className="flex items-start gap-3 py-3">
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          outgoing ? "bg-clay-soft text-clay" : "bg-mint text-leaf"
        }`}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3">
          <p className="truncate text-[0.92rem] font-semibold text-ink">
            {outgoing ? "Sent to" : "Received from"} {shortAddress(other, 10, 6)}
          </p>
          <p className={`text-[0.92rem] font-semibold ${outgoing ? "text-clay" : "text-leaf"}`}>
            {outgoing ? "−" : "+"}
            {formatEth(transaction.amountWei)} ETH
          </p>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <span className={`rounded-full border px-2 py-0.5 text-[0.66rem] font-bold uppercase tracking-wide ${statusTone(transaction.status)}`}>
            {transaction.status}
          </span>
          <span className="text-[0.75rem] text-muted">{relativeDate(transaction.createdAt)}</span>
          {transaction.blockHeight ? (
            <span className="text-[0.75rem] text-muted">block {transaction.blockHeight}</span>
          ) : null}
          {showExplorer && transaction.explorerUrl ? (
            <a
              href={transaction.explorerUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1 text-[0.75rem] font-semibold text-leaf hover:underline"
            >
              Explorer <ExternalLink className="h-3 w-3" />
            </a>
          ) : null}
        </div>
        {transaction.failureReason ? (
          <p className="mt-1 line-clamp-2 text-[0.75rem] text-clay">Reason: {transaction.failureReason}</p>
        ) : null}
      </div>
    </div>
  );
}

export function TransactionStatusBadge({ status }) {
  return <Badge tone={status === "CONFIRMED" ? "green" : status === "FAILED" ? "clay" : "gold"}>{status}</Badge>;
}
