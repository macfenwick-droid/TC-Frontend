import { describe, expect, it } from "vitest";
import { safeRedirect } from "@/lib/safe-redirect";

describe("safeRedirect", () => {
  it("keeps same-site paths", () => {
    expect(safeRedirect("/active-sales")).toBe("/active-sales");
    expect(safeRedirect("/sell?x=1")).toBe("/sell?x=1");
  });
  it("rejects other origins and junk", () => {
    for (const bad of [null, "", "https://evil.com", "//evil.com", "/\\evil.com", "javascript:alert(1)"]) {
      expect(safeRedirect(bad)).toBe("/");
    }
  });
});
