// Light client-side check for US/Canada (+1 NANP) numbers — quick UX feedback only.
// The backend (libphonenumber) is the authority and re-validates every number.

export const digitsOnly = (s: string) => (s || "").replace(/\D/g, "");

/** True if `raw` looks like a valid 10-digit US/Canada number (optionally +1 prefixed). */
export function isLikelyUsCaPhone(raw: string): boolean {
  let d = digitsOnly(raw);
  if (d.length === 11 && d.startsWith("1")) d = d.slice(1);
  if (d.length !== 10) return false;
  // NANP: area code and central-office code can't start with 0 or 1.
  return /^[2-9]\d{2}[2-9]\d{6}$/.test(d);
}

/** Best-effort E.164 formatting for display; returns the input unchanged if not 10 digits. */
export function formatUsCaPhone(raw: string): string {
  let d = digitsOnly(raw);
  if (d.length === 11 && d.startsWith("1")) d = d.slice(1);
  return d.length === 10 ? `+1${d}` : raw;
}
