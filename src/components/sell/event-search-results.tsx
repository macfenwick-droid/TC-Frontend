"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Calendar, Loader2, MapPin, Search } from "lucide-react";
import { api, ApiError, type SellEvent } from "@/lib/api";
import { formatEventDate } from "@/lib/event-date";
import { stashSellEvent } from "@/lib/sell-handoff";
import { cn } from "@/lib/utils";
import { fieldClass } from "./form-bits";

/** Port of the current site's /sell/search: full findticker results, soonest first. */

const PAGE = 10;

function sortKey(e: SellEvent): string {
  return e.utc_date || e.local_date || "9999";
}

type Result = { term: string; events: SellEvent[]; error: string | null };

export function EventSearchResults() {
  const router = useRouter();
  const params = useSearchParams();
  const q = params.get("q") || "";
  const term = q.trim();

  const [query, setQuery] = useState(q);
  const [result, setResult] = useState<Result | null>(null);
  const [visible, setVisible] = useState(PAGE);

  useEffect(() => {
    if (term.length < 2) return;
    let cancelled = false;
    api
      .ticketPricingSearch(term)
      .then((r) => {
        if (cancelled) return;
        setResult({ term, events: [...r].sort((a, b) => sortKey(a).localeCompare(sortKey(b))), error: null });
        setVisible(PAGE);
      })
      .catch((err) => {
        if (cancelled) return;
        const error =
          err instanceof ApiError && err.status === 429
            ? err.message
            : err instanceof ApiError && err.status === 503
              ? "Event search is temporarily unavailable. Please try again shortly."
              : "Something went wrong searching events. Please try again.";
        setResult({ term, events: [], error });
      });
    return () => {
      cancelled = true;
    };
  }, [term]);

  // Loading = a valid term whose results haven't arrived yet.
  const loading = term.length >= 2 && result?.term !== term;
  const events = term.length < 2 ? [] : !loading ? (result?.events ?? null) : null;
  const error = !loading ? (result?.error ?? null) : null;

  const runSearch = () => {
    const t = query.trim();
    if (t.length < 2) return;
    router.push(`/sell/search?q=${encodeURIComponent(t)}`);
  };

  const pick = (ev: SellEvent) => {
    stashSellEvent(ev);
    router.push("/sell");
  };

  return (
    <div className="flex flex-col gap-6">
      <form
        role="search"
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          runSearch();
        }}
      >
        <label className="relative flex-1">
          <span className="sr-only">Search events</span>
          <Search className="pointer-events-none absolute top-1/2 left-4 mt-1 size-4 -translate-y-1/2 text-subtle" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search team, artist or event…"
            className={cn(fieldClass, "bg-white pl-10")}
          />
        </label>
        <button type="submit" className="mt-2 h-[52px] shrink-0 rounded-[14px] bg-ink px-6 font-bold text-white hover:bg-ink-2">
          Search
        </button>
      </form>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground" role="status">
          <Loader2 className="size-5 animate-spin" aria-hidden="true" /> Searching events…
        </div>
      )}

      {error && (
        <div role="alert" className="rounded-2xl border border-coral/40 bg-peach px-4 py-3 text-sm text-[#9A3412]">
          {error}
        </div>
      )}

      {!loading && !error && events && events.length === 0 && (
        <div className="py-12 text-center text-muted-foreground">
          <p className="mb-3">No events found{q ? ` for "${q}"` : ""}.</p>
          <p className="text-sm">
            Try team names (e.g. &quot;Cowboys Eagles&quot;), or{" "}
            <button type="button" onClick={() => router.push("/sell")} className="font-semibold text-link underline underline-offset-2">
              enter your event manually
            </button>
            .
          </p>
        </div>
      )}

      {!loading && !error && events && events.length > 0 && (
        <>
          <p className="text-xs text-muted-foreground">
            {events.length} event{events.length === 1 ? "" : "s"}, soonest first
          </p>
          <ul className="flex flex-col gap-2.5">
            {events.slice(0, visible).map((ev) => (
              <li key={ev.event_id}>
                <button
                  type="button"
                  onClick={() => pick(ev)}
                  className="group flex w-full items-center gap-4 rounded-2xl border border-line bg-white p-4 text-left transition-[border-color,transform] hover:-translate-y-0.5 hover:border-ink sm:p-5"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-heading text-lg font-bold">{ev.name}</span>
                    <span className="mt-1 flex items-center gap-1.5 text-sm text-ink-2">
                      <Calendar className="size-3.5 shrink-0" aria-hidden="true" />
                      {formatEventDate(ev.local_date) || "Date TBD"}
                    </span>
                    {(ev.venue || ev.city) && (
                      <span className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                        <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
                        {[ev.venue, ev.city].filter(Boolean).join(", ")}
                      </span>
                    )}
                  </span>
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-cream transition-colors group-hover:bg-brand">
                    <ArrowRight className="size-5" aria-hidden="true" />
                  </span>
                </button>
              </li>
            ))}
          </ul>

          {visible < events.length && (
            <div className="text-center">
              <button
                type="button"
                onClick={() => setVisible((v) => v + PAGE)}
                className="min-h-12 rounded-full border-[1.5px] border-ink bg-white px-6 font-bold hover:bg-butter"
              >
                Load more ({events.length - visible} more)
              </button>
            </div>
          )}
          {events.length >= 25 && visible >= events.length && (
            <p className="text-center text-xs text-muted-foreground">
              Showing the top 25 matches — refine your search to narrow it.
            </p>
          )}
        </>
      )}
    </div>
  );
}
