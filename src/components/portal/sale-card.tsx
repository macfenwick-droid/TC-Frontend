import type { ReactNode } from "react";
import type { TicketGroup } from "@/lib/api";
import { eventDayParts, formatDate, formatEventDateTime, formatSeats, money } from "@/lib/sales";
import { cn } from "@/lib/utils";

/**
 * One order, as a card (design's portal) instead of the current site's table row.
 * Same fields: order #, submitted date, event, date/time, venue, qty/sec/row/seat,
 * offer or payout amount with per-ticket price, and status.
 */
export function SaleCard({
  sale,
  amountLabel,
  amountExtra,
  status,
  children,
}: {
  sale: TicketGroup;
  /** Column name from the current site: "Offer" (active) or "Payout" (my sales). */
  amountLabel: string;
  amountExtra?: ReactNode;
  status: ReactNode;
  /** Extra panel under the card body (e.g. transfer details). */
  children?: ReactNode;
}) {
  const day = eventDayParts(sale.event_date);
  const seats = formatSeats(sale.seat_numbers);
  const total = sale.latest_quote_total_price ? Number(sale.latest_quote_total_price) : null;
  const chips = [
    { k: "Qty", v: String(sale.quantity) },
    sale.section ? { k: "Sec", v: sale.section } : null,
    sale.row ? { k: "Row", v: sale.row } : null,
    seats ? { k: "Seat", v: seats } : null,
  ].filter((c): c is { k: string; v: string } => !!c);

  return (
    <article className="flex flex-col gap-5 rounded-[28px] border border-line bg-white p-5 sm:p-7">
      <div className="grid gap-5 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-start">
        {day && (
          <div
            aria-hidden="true"
            className="hidden w-16 flex-col items-center rounded-2xl bg-cream py-2 leading-none sm:flex"
          >
            <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">{day.month}</span>
            <span className="font-heading text-3xl font-extrabold">{day.day}</span>
          </div>
        )}

        <div className="flex min-w-0 flex-col gap-1.5">
          <p className="text-sm font-semibold text-muted-foreground">
            Order #{sale.ticket_group_id}
            {formatDate(sale.created_at) && <> · {formatDate(sale.created_at)}</>}
          </p>
          <h2 className="text-xl leading-tight font-bold sm:text-[22px]">{sale.event_name}</h2>
          <p className="text-[15px] text-muted-foreground">
            {formatEventDateTime(sale.event_date, sale.event_time)}
            {sale.venue && (
              <>
                {" "}
                · {sale.venue}
                {sale.state ? `, ${sale.state}` : ""}
              </>
            )}
          </p>
          <ul className="mt-1.5 flex flex-wrap gap-2" aria-label="Seats">
            {chips.map((c) => (
              <li key={c.k} className="rounded-full bg-cream px-3 py-1 text-sm">
                {c.k}: <b>{c.v}</b>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-row items-end justify-between gap-4 border-t border-line pt-4 sm:flex-col sm:items-end sm:border-0 sm:pt-0 sm:text-right">
          <div className="flex flex-col sm:items-end">
            <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">{amountLabel}</span>
            {total ? (
              <>
                <span className="font-heading text-[28px] leading-tight font-extrabold">{money(total)}</span>
                <span className="text-sm text-muted-foreground">{money(total / sale.quantity)} / ticket</span>
                {amountExtra}
              </>
            ) : (
              <span className="text-xl font-bold text-subtle">—</span>
            )}
          </div>
          <div className={cn("flex flex-col items-end gap-2")}>{status}</div>
        </div>
      </div>
      {children}
    </article>
  );
}
