"use client";

import { Activity, CheckCircle } from "lucide-react";
import { Cta } from "@/components/brand/cta";
import { StatusPill } from "@/components/brand/status-pill";
import { usePayoutMethods, useTicketGroups } from "@/hooks/use-seller-data";
import type { TicketGroup, TicketGroupStatus } from "@/lib/api";
import { VENMO_RATE, defaultPayoutMethod, getTransferEmail, money } from "@/lib/sales";
import { CopyButton } from "./copy-button";
import { PortalPageHeader } from "./page-header";
import { SaleCard } from "./sale-card";
import { EmptyState, ErrorState, LoadingState } from "./states";

const ACTIVE_STATUSES: TicketGroupStatus[] = ["in_review", "offered", "awaiting_transfer", "awaiting_payout"];

/** /active-sales — port of the current site's Active Sales page (same data, copy and actions). */
export function ActiveSales() {
  const sales = useTicketGroups(ACTIVE_STATUSES);
  // Only used for the Venmo surcharge hint; a failure here never blocks the page.
  const payouts = usePayoutMethods();
  const isVenmo = defaultPayoutMethod(payouts.data)?.company === "Venmo";

  return (
    <>
      <PortalPageHeader
        title="Active Sales"
        description="In-progress ticket orders"
        action={
          <Cta href="/sell" size="sm" withArrow>
            Sell Tickets
          </Cta>
        }
      />

      {sales.isPending ? (
        <LoadingState label="Loading your active sales…" />
      ) : sales.isError ? (
        <ErrorState message={sales.error.message || "Failed to load active sales"} />
      ) : sales.data.length === 0 ? (
        <EmptyState icon={Activity} title="No active sales yet.">
          Submit tickets to get started.
        </EmptyState>
      ) : (
        <div className="flex flex-col gap-4">
          {sales.data.map((sale) => (
            <SaleCard
              key={sale.id}
              sale={sale}
              amountLabel="Offer"
              amountExtra={
                isVenmo && sale.latest_quote_total_price ? (
                  <span className="mt-1 text-sm font-semibold text-amber-fg">
                    ~{money(Number(sale.latest_quote_total_price) * VENMO_RATE)} after Venmo surcharge
                  </span>
                ) : null
              }
              status={<SaleStatus sale={sale} />}
            >
              {sale.status === "awaiting_transfer" && <TransferPanel sale={sale} />}
            </SaleCard>
          ))}
        </div>
      )}
    </>
  );
}

function SaleStatus({ sale }: { sale: TicketGroup }) {
  if (sale.status === "offered") {
    return (
      <Cta href={`/offer/${sale.ticket_group_id}`} size="sm" className="bg-brand text-ink hover:text-ink">
        <CheckCircle className="size-4" aria-hidden="true" />
        View Offer
      </Cta>
    );
  }
  return <StatusPill status={sale.status} />;
}

/** "Transfer to <email>" with a copy button — same addresses as the current site. */
function TransferPanel({ sale }: { sale: TicketGroup }) {
  const email = getTransferEmail(sale.primary_site);
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] bg-peach p-4 sm:px-5">
      <p className="min-w-0">
        <span className="block text-sm font-semibold">Transfer to</span>
        <a href={`mailto:${email}`} className="font-bold break-all text-link hover:underline">
          {email}
        </a>{" "}
        {sale.primary_site && <span className="text-sm text-muted-foreground">({sale.primary_site})</span>}
      </p>
      <CopyButton value={email} label={`Copy email address ${email}`} />
    </div>
  );
}
