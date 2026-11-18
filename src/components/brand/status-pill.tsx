import { Check, CheckCircle, Clock, RefreshCw, X, type LucideIcon } from "lucide-react";
import type { TicketGroupStatus } from "@/lib/api";
import { cn } from "@/lib/utils";

// Labels are the current site's wording (ActiveSales / Sales / Offer pages).
const STATUS: Record<TicketGroupStatus, { label: string; icon: LucideIcon; className: string }> = {
  in_review: { label: "In Review", icon: Clock, className: "bg-sky text-blue-fg" },
  offered: { label: "Offer Ready", icon: CheckCircle, className: "bg-butter text-amber-fg" },
  awaiting_transfer: { label: "Awaiting Transfer", icon: RefreshCw, className: "bg-peach text-ink" },
  awaiting_payout: { label: "Awaiting Payout", icon: Clock, className: "bg-mint text-link" },
  paid: { label: "Paid", icon: Check, className: "bg-brand text-ink" },
  cancelled: { label: "Cancelled", icon: X, className: "bg-muted text-destructive" },
};

export const statusLabel = (status: TicketGroupStatus) => STATUS[status]?.label ?? status;

export function StatusPill({ status, className }: { status: TicketGroupStatus; className?: string }) {
  const s = STATUS[status];
  if (!s) return null;
  const Icon = s.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold whitespace-nowrap",
        s.className,
        className
      )}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {s.label}
    </span>
  );
}
