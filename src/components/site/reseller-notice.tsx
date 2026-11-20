/**
 * Reseller disclosure required by Google Ads for ticket resellers: a clear, prominent
 * statement (top of every page, including ad landing pages) that TicketCricket is a
 * resale marketplace and not the primary ticket seller. Wording approved by the CEO.
 */
export const RESELLER_DISCLOSURE =
  "TicketCricket is an independent ticket resale marketplace. We are not the primary ticket seller and are not affiliated with any team, venue, or event organizer. Prices may be above face value.";

export function ResellerNotice() {
  return (
    <div className="border-b border-brand/25 bg-mint px-4 py-2 text-center text-xs leading-snug font-medium text-ink-2 sm:text-[13px]">
      <p>{RESELLER_DISCLOSURE}</p>
    </div>
  );
}
