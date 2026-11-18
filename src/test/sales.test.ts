import { describe, expect, it } from "vitest";
import { defaultPayoutMethod, formatCountdown, formatDate, formatEventDateTime, formatSeats, getTransferEmail } from "@/lib/sales";

describe("sales helpers", () => {
  it("reads event dates as local calendar dates (no off-by-one day)", () => {
    expect(formatDate("2026-11-30")).toBe("Nov 30, 2026");
    expect(formatEventDateTime("2026-11-30", "13:05:00")).toBe("Nov 30, 2026 · 13:05");
    expect(formatDate(null)).toBe("");
    expect(formatDate("not a date")).toBe("");
  });

  it("sends AXS transfers to the AXS inbox, everything else to general@", () => {
    expect(getTransferEmail("AXS")).toBe("nudgeneo@gmail.com");
    expect(getTransferEmail("axs")).toBe("nudgeneo@gmail.com");
    expect(getTransferEmail("Ticketmaster")).toBe("general@ticketcricket.co");
    expect(getTransferEmail(null)).toBe("general@ticketcricket.co");
  });

  it("formats seat numbers in any shape the backend stores", () => {
    expect(formatSeats(["5", "6"])).toBe("5, 6");
    expect(formatSeats({ a: 1, b: 2 })).toBe("1, 2");
    expect(formatSeats("5-8")).toBe("5-8");
    expect(formatSeats(null)).toBe("");
  });

  it("counts down to valid_until", () => {
    expect(formatCountdown(65_000, 0)).toBe("1:05");
    expect(formatCountdown(3_725_000, 0)).toBe("1:02:05");
    expect(formatCountdown(1000, 1000)).toBe("Expired");
  });

  it("picks the default payout method, else the first", () => {
    const a = { id: 1, user_id: "u", company: "PayPal", account: "a", is_default: false };
    const b = { ...a, id: 2, company: "Venmo", is_default: true };
    expect(defaultPayoutMethod([a, b])?.id).toBe(2);
    expect(defaultPayoutMethod([a])?.id).toBe(1);
    expect(defaultPayoutMethod([])).toBeNull();
  });
});
