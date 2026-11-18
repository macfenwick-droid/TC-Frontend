import type { PayoutMethod } from "@/lib/api";

/** Venmo payouts carry a 3% surcharge (current site). */
export const VENMO_RATE = 0.97;

/**
 * "2026-10-30" (a calendar date) or a full ISO timestamp → "Oct 30, 2026".
 * Date-only strings are read as local dates; `new Date("2026-10-30")` is UTC midnight and
 * shows the previous day in US time zones (a bug in the current site).
 */
export function formatDate(value?: string | null): string {
  if (!value) return "";
  const d = new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value);
  return isNaN(d.getTime()) ? "" : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/** Event date plus "HH:MM" from the backend's "HH:MM:SS", like the current site. */
export function formatEventDateTime(date: string, time?: string | null): string {
  const label = formatDate(date);
  return time ? `${label} · ${time.slice(0, 5)}` : label;
}

/** Month / day for the calendar tile on order cards. */
export function eventDayParts(date: string): { month: string; day: string } | null {
  if (!/^\d{4}-\d{2}-\d{2}/.test(date)) return null;
  const d = new Date(`${date.slice(0, 10)}T00:00:00`);
  if (isNaN(d.getTime())) return null;
  return { month: d.toLocaleDateString("en-US", { month: "short" }), day: String(d.getDate()) };
}

export function formatSeats(seatNumbers: unknown): string {
  if (!seatNumbers) return "";
  if (Array.isArray(seatNumbers)) return seatNumbers.join(", ");
  if (typeof seatNumbers === "object") return Object.values(seatNumbers as Record<string, unknown>).join(", ");
  return String(seatNumbers);
}

export const money = (value: number) => `$${value.toFixed(2)}`;

/** Where sellers send tickets — same rule as the current site's Active Sales page. */
export function getTransferEmail(primarySite?: string | null): string {
  if ((primarySite || "").toLowerCase() === "axs") return "nudgeneo@gmail.com";
  return "general@ticketcricket.co";
}

/** The method payouts go to: the default one, else the first. */
export const defaultPayoutMethod = (methods?: PayoutMethod[] | null) =>
  methods?.find((m) => m.is_default) ?? methods?.[0] ?? null;

/** "1:05:09" / "4:09" until `until`; "Expired" once past (wording from the current site's timer). */
export function formatCountdown(until: number, now: number): string {
  const diff = until - now;
  if (diff <= 0) return "Expired";
  const total = Math.floor(diff / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}
