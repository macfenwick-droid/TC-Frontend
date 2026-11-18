"use client";

import { useSyncExternalStore } from "react";
import { Calendar, MapPin } from "lucide-react";
import { formatEventDate } from "@/lib/event-date";
import { money } from "@/lib/sales";
import { parseSubmission, readSubmissionRaw, type Submission } from "@/lib/submission";

// sessionStorage doesn't change while the page is open; parse once per stored string.
const noopSubscribe = () => () => {};
let cache: { raw: string | null; value: Submission | null } = { raw: null, value: null };
const getSnapshot = () => {
  const raw = readSubmissionRaw();
  if (raw !== cache.raw) cache = { raw, value: parseSubmission(raw) };
  return cache.value;
};
const getServerSnapshot = () => null;

const when = (date: string, time?: string) => formatEventDate(date ? `${date}T${time || "00:00"}` : "") || "—";
const place = (venue: string, state: string) => [venue, state].filter(Boolean).join(", ") || "—";

/** Thank You page: the details of the tickets just submitted (if this tab submitted them). */
export function SubmissionSummary() {
  const s = useSyncExternalStore(noopSubscribe, getSnapshot, getServerSnapshot);
  if (!s) return null;

  const seatRows =
    s.kind === "single"
      ? [
          { label: "Section", value: s.section },
          { label: "Row", value: s.row },
          { label: "Seats", value: s.seats || "—" },
          { label: "Quantity", value: `${s.quantity} ticket${s.quantity === 1 ? "" : "s"}` },
          { label: "Restricted View", value: s.restrictedView ? "Yes" : "No" },
          { label: "Primary Site", value: s.primarySite || "—" },
        ]
      : [
          { label: "Section", value: s.section },
          { label: "Row", value: s.row },
          { label: "Seats", value: s.seats || "—" },
          { label: "Quantity", value: `${s.quantity} ticket${s.quantity === 1 ? "" : "s"} per game` },
          { label: "Face Value", value: `${money(s.faceValue)} per ticket` },
          { label: "Games", value: String(s.games.length) },
        ];

  const orders = s.kind === "single" ? (s.orderId ? [s.orderId] : []) : s.orderIds;

  return (
    <section
      aria-labelledby="submission-heading"
      className="w-full animate-rise overflow-hidden rounded-[28px] border border-line bg-white text-left [animation-delay:0.2s]"
    >
      <header className="flex flex-col gap-1 p-6 sm:p-8">
        <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
          {s.kind === "single" ? "Event" : "Season Tickets"}
          {orders.length > 0 && <> · Order {orders.map((id) => `#${id}`).join(", ")}</>}
        </p>
        <h2 id="submission-heading" className="text-2xl leading-tight font-extrabold break-words sm:text-[28px]">
          {s.kind === "single" ? s.eventName : s.team}
        </h2>
        {s.kind === "single" && (
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-mint px-3 py-1.5 text-sm font-medium">
              <Calendar className="size-4 text-muted-foreground" aria-hidden="true" />
              {when(s.eventDate, s.eventTime)}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-mint px-3 py-1.5 text-sm font-medium">
              <MapPin className="size-4 text-muted-foreground" aria-hidden="true" />
              {place(s.venue, s.state)}
            </span>
          </div>
        )}
      </header>

      <dl className="grid grid-cols-2 gap-3 px-6 pb-6 sm:grid-cols-3 sm:px-8 sm:pb-8">
        {seatRows.map((item) => (
          <div key={item.label} className="rounded-[20px] border border-line p-4">
            <dt className="text-xs font-bold tracking-wider text-muted-foreground uppercase">{item.label}</dt>
            <dd className="mt-1 text-lg font-extrabold break-words">{item.value}</dd>
          </div>
        ))}
      </dl>

      {s.kind === "season" && s.games.length > 0 && (
        <div className="border-t border-line px-6 py-5 sm:px-8">
          <h3 className="mb-3 text-sm font-bold tracking-wider text-muted-foreground uppercase">Games submitted</h3>
          <ul className="flex flex-col divide-y divide-line">
            {s.games.map((g) => (
              <li key={`${g.name}-${g.date}`} className="flex flex-col gap-0.5 py-3">
                <span className="font-semibold">{g.name}</span>
                <span className="text-sm text-muted-foreground">
                  {when(g.date, g.time)} · {place(g.venue, g.state)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
