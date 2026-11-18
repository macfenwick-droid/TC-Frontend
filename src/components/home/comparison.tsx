import { Check, X } from "lucide-react";
import { Container } from "@/components/brand/container";
import { SectionHeading } from "@/components/brand/section-heading";

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
          ? "inline-grid size-8 place-items-center rounded-full bg-brand text-ink"
          : "inline-grid size-8 place-items-center rounded-full bg-white/10 text-white"
      }
    >
      <Check className="size-4" strokeWidth={3} aria-hidden="true" />
      <span className="sr-only">Yes</span>
    </span>
  ) : (
    <span className="inline-grid size-8 place-items-center rounded-full text-on-dark-muted/60">
      <X className="size-4" strokeWidth={2.6} aria-hidden="true" />
      <span className="sr-only">No</span>
    </span>
  );
}

export function Comparison() {
  return (
    <section className="bg-ink text-white">
      <Container className="flex flex-col gap-10 py-20 sm:py-24">
        <SectionHeading
          tone="dark"
          title="How We Compare"
          description="See why sellers prefer TicketCricket"
        />

        <div className="relative overflow-x-auto rounded-[28px] border border-white/10">
          <table className="w-full min-w-[560px] border-collapse text-left">
            <thead>
              <tr className="border-b border-white/10">
                <th scope="col" className="p-5 text-sm font-semibold text-on-dark-muted sm:p-6">
                  <span className="sr-only">Feature</span>
                </th>
                {columns.map((c, i) => (
                  <th key={c} scope="col" className="p-5 text-center sm:p-6">
                    {i === 0 ? (
                      <span className="inline-flex rounded-full bg-brand px-4 py-1.5 font-heading text-base font-extrabold text-ink">
                        {c}
                      </span>
                    ) : (
                      <span className="text-base font-semibold text-on-dark-muted">{c}</span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.feature} className="border-b border-white/10 last:border-0">
                  <th scope="row" className="p-5 text-[17px] font-semibold sm:p-6">
                    {r.feature}
                  </th>
                  {r.values.map((v, i) => (
                    <td key={columns[i]} className={i === 0 ? "bg-white/5 p-5 text-center sm:p-6" : "p-5 text-center sm:p-6"}>
                      <Mark yes={v} highlight={i === 0} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Container>
    </section>
  );
}
