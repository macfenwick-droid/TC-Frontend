// findticker local_date is like "2026-10-30T19:00:00-04:00[America/New_York]".
// Same helpers as the current site's TicketForm.

export function parseLocal(local?: string | null): { date: string; time: string } {
  if (!local) return { date: "", time: "" };
  const m = local.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/);
  return { date: m?.[1] || "", time: m?.[2] || "" };
}

export function formatEventDate(local?: string | null): string {
  const { date, time } = parseLocal(local);
  if (!date) return "";
  const d = new Date(`${date}T${time || "00:00"}`);
  const opts: Intl.DateTimeFormatOptions = { weekday: "short", month: "short", day: "numeric", year: "numeric" };
  const datePart = d.toLocaleDateString("en-US", opts);
  return time ? `${datePart} • ${d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}` : datePart;
}
