"use client";

import { useState, useSyncExternalStore } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Banknote, Calendar, Check, Clock, Loader2, MapPin, X } from "lucide-react";
import { Eyebrow } from "@/components/brand/eyebrow";
import { StatusPill } from "@/components/brand/status-pill";
import { errorMessage } from "@/components/auth/auth-ui";
import { LoadingState } from "@/components/portal/states";
import { sellerKeys, usePayoutMethods, useQuote } from "@/hooks/use-seller-data";
import { api } from "@/lib/api";
import { googleAds } from "@/lib/gtag";
import { VENMO_RATE, defaultPayoutMethod, formatCountdown, formatEventDateTime, formatSeats, money } from "@/lib/sales";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { OfferPayoutModal } from "./offer-payout-modal";

// Seconds clock for the countdown (no state updates in effects, same value on every read).
const subscribeSeconds = (cb: () => void) => {
  const id = setInterval(cb, 1000);
  return () => clearInterval(id);
};
const nowSeconds = () => Math.floor(Date.now() / 1000) * 1000;

/** /offer/:token — port of the current site's Offer page, plus the offer's `valid_until` countdown. */
export function OfferView() {
  const { token } = useParams<{ token: string }>();
  const ticketGroupId = Number(token) || 0;
  const router = useRouter();
  const queryClient = useQueryClient();
  const offer = useQuote(ticketGroupId);
  const payouts = usePayoutMethods();
  const [acting, setActing] = useState<"accept" | "reject" | null>(null);
  const [payoutOpen, setPayoutOpen] = useState(false);

  const data = offer.data;
  const tg = data?.ticket_group;
  const quote = data?.quote;
  const isVenmo = defaultPayoutMethod(payouts.data)?.company === "Venmo";

  const settle = () => queryClient.invalidateQueries({ queryKey: ["ticket-groups"] });

  const reject = async () => {
    if (!quote) return;
    try {
      setActing("reject");
      const resp = await api.rejectQuote(quote.id);
      queryClient.setQueryData(sellerKeys.quote(ticketGroupId), resp);
      void settle();
      toast({ title: "Offer rejected" });
      router.push("/sales");
    } catch (err) {
      toast({ title: "Could not reject offer", description: errorMessage(err, "Try again later."), variant: "destructive" });
    } finally {
      setActing(null);
    }
  };

  const accept = async () => {
    if (!quote) return;
    try {
      setPayoutOpen(false);
      setActing("accept");
      const resp = await api.acceptQuote(quote.id);
      queryClient.setQueryData(sellerKeys.quote(ticketGroupId), resp);
      void settle();
      googleAds.saleCompleted({ value: Number(quote.total_price), currency: "USD", transactionId: String(quote.id) });
      toast({ title: "Offer accepted" });
      router.push("/active-sales");
    } catch (err) {
      toast({ title: "Could not accept offer", description: errorMessage(err, "Try again later."), variant: "destructive" });
    } finally {
      setActing(null);
    }
  };

  return (
    <>
      <section className="bg-ink py-14 text-center text-white sm:py-16">
        <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4">
          <Eyebrow tone="dark">Your Offer</Eyebrow>
          <h1 className="text-[40px] leading-none font-extrabold sm:text-6xl">
            Review Your <span className="text-brand">Offer</span>
          </h1>
          <p className="text-lg text-on-dark-muted">Check the details below and accept or decline.</p>
        </div>
      </section>

      <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:py-12">
        {offer.isPending ? (
          <div className="rounded-[28px] border border-line bg-white p-10">
            <LoadingState label="Loading offer details…" />
          </div>
        ) : !data || !tg || !quote ? (
          <div className="flex flex-col items-center gap-2 rounded-[28px] border border-line bg-white p-12 text-center" role="alert">
            <p className="font-medium text-muted-foreground">No offer found for this ticket group.</p>
            {offer.isError && <p className="text-sm text-subtle">{offer.error.message}</p>}
          </div>
        ) : (
          <article className="overflow-hidden rounded-[32px] border border-line bg-white shadow-[0_30px_80px_-40px_rgba(20,24,38,0.35)]">
            <header className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start sm:justify-between sm:p-8">
              <div className="flex min-w-0 flex-col gap-1">
                <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase">Event</p>
                <h2 className="text-2xl leading-tight font-extrabold sm:text-[28px]">{tg.event_name}</h2>
              </div>
              <StatusPill status={tg.status} className="self-start" />
            </header>

            <div className="flex flex-wrap gap-2 px-6 sm:px-8">
              <span className="inline-flex items-center gap-2 rounded-full bg-cream px-3 py-1.5 text-sm font-medium">
                <Calendar className="size-4 text-muted-foreground" aria-hidden="true" />
                {formatEventDateTime(tg.event_date, tg.event_time) || "—"}
              </span>
              {(tg.venue || tg.state) && (
                <span className="inline-flex items-center gap-2 rounded-full bg-cream px-3 py-1.5 text-sm font-medium">
                  <MapPin className="size-4 text-muted-foreground" aria-hidden="true" />
                  {tg.venue ? `${tg.venue}${tg.state ? `, ${tg.state}` : ""}` : tg.state}
                </span>
              )}
            </div>

            <dl className="grid grid-cols-2 gap-3 p-6 sm:p-8">
              {[
                { label: "Order #", value: `#${tg.ticket_group_id}` },
                { label: "Quantity", value: `${tg.quantity} tickets` },
                {
                  label: "Seat Details",
                  value: `Sec ${tg.section || "—"}, Row ${tg.row || "—"}${formatSeats(tg.seat_numbers) ? ` · ${formatSeats(tg.seat_numbers)}` : ""}`,
                },
                { label: "Offer Status", value: quote.status, highlight: true },
              ].map((item) => (
                <div key={item.label} className="rounded-[20px] border border-line p-4">
                  <dt className="text-xs font-bold tracking-wider text-muted-foreground uppercase">{item.label}</dt>
                  <dd className={cn("mt-1 text-lg font-extrabold break-words", item.highlight && "text-amber-fg capitalize")}>
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="bg-ink p-6 text-white sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="inline-flex items-center gap-2 font-semibold text-on-dark-muted">
                  <Banknote className="size-5 text-brand" aria-hidden="true" />
                  Your Offer Breakdown
                </p>
                {tg.status === "offered" && quote.valid_until && <Countdown until={quote.valid_until} />}
              </div>
              <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-sm text-on-dark-muted">Per ticket</p>
                  <p className="text-2xl font-bold">{money(Number(quote.unit_price))}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-on-dark-muted">Total offer</p>
                  <p className="font-heading text-5xl font-extrabold text-brand">{money(Number(quote.total_price))}</p>
                  {isVenmo && (
                    <p className="mt-1 text-sm font-semibold text-yellow">
                      You&apos;ll receive {money(Number(quote.total_price) * VENMO_RATE)} via Venmo
                    </p>
                  )}
                </div>
              </div>
              {isVenmo ? (
                <p className="mt-5 flex items-start gap-2 rounded-2xl bg-ink-2 p-3 text-sm leading-relaxed text-yellow">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <span>
                    <b>Venmo 3% surcharge applies.</b> Your payout will be{" "}
                    <b>{money(Number(quote.total_price) * VENMO_RATE)}</b> instead of {money(Number(quote.total_price))}. To
                    receive the full amount, switch to PayPal in your payout settings.
                  </span>
                </p>
              ) : (
                <p className="mt-4 text-sm text-on-dark-muted">
                  0% seller fees for PayPal payments · Paid within 5 minutes of acceptance
                </p>
              )}
            </div>

            <div className="flex flex-col gap-3 p-6 sm:flex-row sm:p-8">
              <button
                type="button"
                onClick={() => setPayoutOpen(true)}
                disabled={acting !== null}
                className="inline-flex min-h-14 flex-1 items-center justify-center gap-2 rounded-full bg-brand text-lg font-extrabold text-ink shadow-[0_14px_30px_-14px_rgba(43,212,125,0.9)] transition-transform hover:-translate-y-0.5 disabled:opacity-60"
              >
                {acting === "accept" ? (
                  <>
                    <Loader2 className="size-5 animate-spin" aria-hidden="true" />
                    Accepting…
                  </>
                ) : (
                  <>
                    <Check className="size-6" aria-hidden="true" />
                    Accept Offer
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => void reject()}
                disabled={acting !== null}
                className="inline-flex min-h-14 flex-1 items-center justify-center gap-2 rounded-full border-[1.5px] border-line bg-white text-lg font-bold text-muted-foreground transition-colors hover:border-destructive hover:bg-peach hover:text-destructive disabled:opacity-60"
              >
                {acting === "reject" ? (
                  <>
                    <Loader2 className="size-5 animate-spin" aria-hidden="true" />
                    Declining…
                  </>
                ) : (
                  <>
                    <X className="size-6" aria-hidden="true" />
                    Decline
                  </>
                )}
              </button>
            </div>
          </article>
        )}
      </div>

      <OfferPayoutModal
        open={payoutOpen}
        onOpenChange={setPayoutOpen}
        onConfirm={() => void accept()}
        quoteTotal={quote ? Number(quote.total_price) : undefined}
      />
    </>
  );
}

/** Time left on the offer (`quote.valid_until`). */
function Countdown({ until }: { until: string }) {
  const now = useSyncExternalStore(subscribeSeconds, nowSeconds, () => 0);
  const end = new Date(until).getTime();
  if (!now || isNaN(end)) return null;
  const left = formatCountdown(end, now);
  const expired = left === "Expired";
  return (
    <p
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold tabular-nums",
        expired ? "bg-ink-2 text-on-dark-muted" : "bg-yellow text-ink"
      )}
    >
      <Clock className="size-4" aria-hidden="true" />
      {expired ? "Expired" : <>Expires in {left}</>}
    </p>
  );
}
