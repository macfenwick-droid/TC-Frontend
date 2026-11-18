import { Check, X } from "lucide-react";
import { Container } from "@/components/brand/container";

// Same rows and values as the current site's Comparison table.
const columns = ["TicketCricket", "StubHub", "SeatGeek"] as const;
const rows: { feature: string; values: [boolean, boolean, boolean] }[] = [
  { feature: "Instant Offers", values: [true, false, false] },
  { feature: "Payout in Minutes", values: [true, false, false] },
  { feature: "Last-Minute Tickets", values: [true, true, true] },
  { feature: "Multiple Payout Options", values: [true, false, false] },
  { feature: "Real Human Support", values: [true, false, false] },
];

function Mark({ yes, highlight }: { yes: boolean; highlight?: boolean }) {
  return yes ? (
    <span
      className={
        highlight
          ? "inline-grid size-7 place-items-center rounded-full bg-brand text-ink"
          : "inline-grid size-7 place-items-center rounded-full border border-line bg-cream text-ink-2"
      }
    >
      <Check className="size-4" strokeWidth={3} aria-hidden="true" />
      <span className="sr-only">Yes</span>
    </span>
  ) : (
    <span className="inline-grid size-7 place-items-center rounded-full text-muted-foreground">
      <X className="size-4" strokeWidth={2.6} aria-hidden="true" />
      <span className="sr-only">No</span>
    </span>
  );
}

/**
 * Compact centered green card (same green as "The TicketCricket Way") with a white table.
 * One table at every width: fixed column widths keep all three sites visible on phones.
 */
export function Comparison() {
  return (
    <section>
      <Container className="py-14 sm:py-20">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 rounded-[28px] bg-brand px-3 py-10 text-center sm:gap-8 sm:rounded-[36px] sm:px-10 sm:py-12">
          <div className="flex flex-col items-center gap-2">
            <h2 className="text-3xl leading-[1.02] font-extrabold text-balance sm:text-[44px]">How We Compare</h2>
            <p className="text-base leading-relaxed text-ink-2 sm:text-lg">See why sellers prefer TicketCricket</p>
          </div>

          <div className="w-full max-w-2xl overflow-hidden rounded-[20px] bg-white text-left shadow-[0_30px_60px_-36px_rgba(22,19,31,0.45)]">
            <table className="w-full table-fixed border-collapse">
              <colgroup>
                <col />
                <col className="w-[92px] sm:w-[160px]" />
                <col className="w-[64px] sm:w-[110px]" />
                <col className="w-[64px] sm:w-[110px]" />
              </colgroup>
              <thead>
                <tr className="border-b border-line">
                  <th scope="col" className="py-3 pl-4 sm:pl-6">
                    <span className="sr-only">Feature</span>
                  </th>
                  {columns.map((c, i) => (
                    <th key={c} scope="col" className="px-1 py-3 text-center">
                      {i === 0 ? (
                        <span className="inline-flex rounded-full bg-ink px-2 py-1 font-heading text-[11px] font-extrabold text-white sm:px-3.5 sm:text-sm">
                          {c}
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-muted-foreground sm:text-sm">{c}</span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.feature} className="border-b border-line last:border-0">
                    <th scope="row" className="py-3 pr-2 pl-4 text-sm leading-snug font-bold sm:pl-6 sm:text-base">
                      {r.feature}
                    </th>
                    {r.values.map((v, i) => (
                      <td key={columns[i]} className={i === 0 ? "bg-mint/60 px-1 py-3 text-center" : "px-1 py-3 text-center"}>
                        <Mark yes={v} highlight={i === 0} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Container>
    </section>
  );
}
