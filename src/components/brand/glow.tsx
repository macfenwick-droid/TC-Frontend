import { cn } from "@/lib/utils";

const tones = {
  mint: "var(--tc-mint)",
  butter: "var(--tc-butter)",
  peach: "var(--tc-peach)",
  lilac: "var(--tc-lilac)",
  sky: "var(--tc-sky)",
} as const;

/**
 * Soft colour glow behind a section (the hero's blob look, carried down the page).
 * Must sit inside an `isolate` + `overflow-hidden` wrapper: it paints at -z-10 so it stays
 * behind the section's content, and can bleed across section edges.
 * A radial gradient instead of `filter: blur()`, so it costs nothing to paint.
 */
export function Glow({ tone, className }: { tone: keyof typeof tones; className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute -z-10 rounded-full", className)}
      style={{ background: `radial-gradient(closest-side, ${tones[tone]} 45%, transparent)` }}
    />
  );
}

/**
 * Page-wide backdrop for the inner pages: the home hero's mint glow top-right, then soft
 * tints down the page. Put it as a direct child of <main> (which is `relative isolate`);
 * solid sections (dark bands, white cards) simply paint over it. `long` adds two more
 * glows for tall pages.
 */
export function PageGlow({ long = false }: { long?: boolean }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <Glow tone="mint" className="-top-32 -right-40 size-[640px]" />
      <Glow tone="butter" className="top-[45%] -left-56 size-[600px] -translate-y-1/2" />
      {long && <Glow tone="sky" className="top-[28%] -right-56 size-[620px]" />}
      {long && <Glow tone="peach" className="top-[68%] -left-56 size-[600px]" />}
      <Glow tone="lilac" className="-right-48 -bottom-32 size-[580px]" />
    </div>
  );
}
