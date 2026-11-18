import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { cacheLife } from "next/cache";
import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";

export const alt = "TicketCricket — Sell Your Tickets. Get Paid Fast.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Cached so the card is built once at build time (file reads count as uncached data). */
async function logoDataUrl() {
  "use cache";
  cacheLife("max");
  const logo = await readFile(join(process.cwd(), "public", "logo.png"));
  return `data:image/png;base64,${logo.toString("base64")}`;
}

/** Default social card for every page (built once at build time). Copy from the home hero. */
export default async function OpengraphImage() {
  const logoSrc = await logoDataUrl();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#FFF9F1",
          color: "#16131F",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -120,
            top: -120,
            width: 560,
            height: 560,
            borderRadius: 9999,
            background: "#DCF7E8",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <img src={logoSrc} alt="" width={72} height={72} style={{ borderRadius: 16 }} />
          <div style={{ display: "flex", fontSize: 44, fontWeight: 700, letterSpacing: -1 }}>
            Ticket<span style={{ color: "#408C73" }}>Cricket</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 104, fontWeight: 800, lineHeight: 0.95, letterSpacing: -4 }}>
            <span>Sell Your Tickets.</span>
            <span style={{ display: "flex" }}>
              <span style={{ background: "#2BD47D", padding: "0 16px", borderRadius: 20 }}>Get Paid Fast.</span>
            </span>
          </div>
          <div style={{ fontSize: 32, color: "#5F5A6B" }}>Instant cash offers in minutes.</div>
        </div>
        <div style={{ display: "flex", fontSize: 24, color: "#5F5A6B" }}>{siteConfig.url.replace(/^https?:\/\//, "")}</div>
      </div>
    ),
    size
  );
}
