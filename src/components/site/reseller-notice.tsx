/**
 * Reseller disclosure required by Google Ads for ticket resellers: a clear, prominent
 * statement (top of every page, including ad landing pages) that TicketCricket is a
 * reseller / secondary marketplace and not the primary ticket provider.
 */
export const RESELLER_DISCLOSURE =
  "TicketCricket is a ticket reseller and secondary marketplace, not the primary ticket provider. Prices may be higher or lower than face value.";

export function ResellerNotice() {
  return (
    <div className="bg-ink px-4 py-2 text-center text-xs leading-snug font-medium text-on-dark-muted sm:text-[13px]">
      <p>{RESELLER_DISCLOSURE}</p>
    </div>
  );
}
