import type { SellEvent } from "@/lib/api";

/**
 * Hands the event picked on /sell/search to the /sell form (the old app used router
 * state). Read once, then cleared, so back/refresh doesn't re-apply it.
 */
const KEY = "tc_sell_event";

export function stashSellEvent(ev: SellEvent) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(ev));
  } catch {
    /* storage blocked: the form just starts empty */
  }
}

export function takeSellEvent(): SellEvent | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    sessionStorage.removeItem(KEY);
    const ev = JSON.parse(raw) as SellEvent;
    return ev?.event_id ? ev : null;
  } catch {
    return null;
  }
}
