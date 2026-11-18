"use client";

import { useQuery } from "@tanstack/react-query";
import { api, type TicketGroupStatus } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

// Signed-in seller data. Queries wait for the session and don't retry, so a failure shows
// straight away (the API layer already refreshes an expired access token once).

export const sellerKeys = {
  ticketGroups: (statuses: TicketGroupStatus[]) => ["ticket-groups", ...statuses] as const,
  payoutMethods: ["payout-methods"] as const,
  quote: (ticketGroupId: number) => ["quote", ticketGroupId] as const,
};

export function useTicketGroups(statuses: TicketGroupStatus[]) {
  const { user } = useAuth();
  return useQuery({
    queryKey: sellerKeys.ticketGroups(statuses),
    queryFn: () => api.listTicketGroups(statuses),
    enabled: !!user,
    retry: false,
  });
}

export function usePayoutMethods() {
  const { user } = useAuth();
  return useQuery({
    queryKey: sellerKeys.payoutMethods,
    queryFn: api.listPayoutMethods,
    enabled: !!user,
    retry: false,
  });
}

export function useQuote(ticketGroupId: number) {
  const { user } = useAuth();
  return useQuery({
    queryKey: sellerKeys.quote(ticketGroupId),
    queryFn: () => api.getQuoteForTicketGroup(ticketGroupId),
    enabled: !!user && ticketGroupId > 0,
    retry: false,
  });
}
