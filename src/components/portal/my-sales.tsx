"use client";

import { ShoppingBag } from "lucide-react";
import { StatusPill } from "@/components/brand/status-pill";
import { useTicketGroups } from "@/hooks/use-seller-data";
import type { TicketGroupStatus } from "@/lib/api";
import { PortalPageHeader } from "./page-header";
import { SaleCard } from "./sale-card";
import { EmptyState, ErrorState, LoadingState } from "./states";

const SALES_STATUSES: TicketGroupStatus[] = ["paid", "cancelled"];

/** /sales — port of the current site's My Sales page. */
export function MySales() {
  const sales = useTicketGroups(SALES_STATUSES);

  return (
    <>
      <PortalPageHeader title="My Sales" description="Completed and cancelled orders" />

      {sales.isPending ? (
        <LoadingState label="Loading your sales…" />
      ) : sales.isError ? (
        <ErrorState message={sales.error.message || "Failed to load sales"} />
      ) : sales.data.length === 0 ? (
        <EmptyState icon={ShoppingBag} title="No completed sales yet.">
          Your paid and cancelled orders will appear here.
        </EmptyState>
      ) : (
        <div className="flex flex-col gap-4">
          {sales.data.map((sale) => (
            <SaleCard key={sale.id} sale={sale} amountLabel="Payout" status={<StatusPill status={sale.status} />} />
          ))}
        </div>
      )}
    </>
  );
}
