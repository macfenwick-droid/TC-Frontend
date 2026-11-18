import { TrendingDown } from "lucide-react";
import { Container } from "@/components/brand/container";
import { Glow } from "@/components/brand/glow";
import { Cta } from "@/components/brand/cta";
import { Eyebrow } from "@/components/brand/eyebrow";

// Chart data and copy from the current site's ValueChart section.
const SVG_W = 580;
const SVG_H = 210;
const PAD_LEFT = 52;
const PAD_RIGHT = 24;
const PAD_TOP = 24;
const PAD_BOTTOM = 40;
const CHART_W = SVG_W - PAD_LEFT - PAD_RIGHT;
const CHART_H = SVG_H - PAD_TOP - PAD_BOTTOM;

type Zone = "safe" | "caution" | "danger";

const data: { label: string; shortLabel: string; value: number; zone: Zone }[] = [
  { label: "1 Month", shortLabel: "1 mo", value: 100, zone: "safe" },
  { label: "2 Weeks", shortLabel: "2 wk", value: 85, zone: "safe" },
  { label: "1 Week", shortLabel: "1 wk", value: 70, zone: "caution" },
  { label: "3 Days", shortLabel: "3 d", value: 50, zone: "caution" },
  { label: "Day Of", shortLabel: "Day", value: 22, zone: "danger" },
  { label: "After", shortLabel: "After", value: 0, zone: "danger" },
];

// Fill = dot colour, text = darker shade that stays readable on white.
const zoneColor: Record<Zone, { fill: string; text: string }> = {
  safe: { fill: "#2BD47D", text: "#047857" },
  caution: { fill: "#FFC530", text: "#8A5A00" },
  danger: { fill: "#FF6A45", text: "#9A3412" },
};

const toY = (v: number) => PAD_TOP + ((100 - v) / 100) * CHART_H;
const toX = (i: number) => PAD_LEFT + (i / (data.length - 1)) * CHART_W;
const pts = data.map((d, i) => ({ ...d, x: toX(i), y: toY(d.value) }));

function smoothPath(points: { x: number; y: number }[]) {
  let d = `M${points[0].x},${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cp1x = prev.x + (curr.x - prev.x) / 2.8;
    const cp2x = curr.x - (curr.x - prev.x) / 2.8;
    d += ` C${cp1x},${prev.y} ${cp2x},${curr.y} ${curr.x},${curr.y}`;
  }
  return d;
}

const linePath = smoothPath(pts);
const areaPath = `${linePath} L${pts[pts.length - 1].x},${PAD_TOP + CHART_H} L${pts[0].x},${PAD_TOP + CHART_H} Z`;

const insights: { title: string; body: string; zone: Zone; bg: string }[] = [
  { title: "Sell Early", body: "Full value retained", zone: "safe", bg: "bg-mint" },
  { title: "Selling Soon?", body: "Value dropping fast", zone: "caution", bg: "bg-butter" },
  { title: "Day-Of Risk", body: "Could become worthless", zone: "danger", bg: "bg-peach" },
];

const chartSummary = data.map((d) => `${d.label}: ${d.value}%`).join(", ");

export function ValueChart() {
  return (
    <section className="relative">
      <Glow tone="mint" className="top-24 -left-48 size-[620px]" />
      <Glow tone="peach" className="top-1/3 -right-48 size-[620px]" />
      <Container className="flex flex-col items-center gap-10 py-20 sm:py-24">
        <div className="flex max-w-2xl flex-col items-center gap-4 text-center">
          <Eyebrow tone="peach" className="text-[#9A3412]">
            <TrendingDown className="size-3.5" aria-hidden="true" />
            Time-Sensitive
          </Eyebrow>
          <h2 className="text-4xl leading-[1.02] font-extrabold text-balance sm:text-5xl">
            Your Tickets Lose Value Daily
          </h2>
          <p className="text-lg leading-relaxed text-muted-foreground">
            The longer you wait, the less your tickets are worth. Lock in your price today.
          </p>
        </div>

        <figure className="w-full max-w-4xl rounded-[28px] border border-line bg-white p-5 shadow-[0_30px_60px_-36px_rgba(22,19,31,0.3)] sm:p-8">
          <figcaption className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <span className="flex flex-col gap-0.5">
              <span className="font-heading text-lg font-extrabold">Ticket Value Over Time</span>
              <span className="text-sm text-muted-foreground">% of original face value retained</span>
            </span>
            <span className="flex items-center gap-4 text-xs font-semibold text-muted-foreground" aria-hidden="true">
              {(
                [
                  ["Good", "safe"],
                  ["Caution", "caution"],
                  ["Danger", "danger"],
                ] as const
              ).map(([label, zone]) => (
                <span key={label} className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full" style={{ background: zoneColor[zone].fill }} />
                  {label}
                </span>
              ))}
            </span>
          </figcaption>

          <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="block w-full" role="img" aria-label={`Ticket value over time. ${chartSummary}.`}>
            <defs>
              <linearGradient id="vc-line" gradientUnits="userSpaceOnUse" x1={PAD_LEFT} y1="0" x2={SVG_W - PAD_RIGHT} y2="0">
                <stop offset="0%" stopColor={zoneColor.safe.fill} />
                <stop offset="45%" stopColor={zoneColor.caution.fill} />
                <stop offset="100%" stopColor={zoneColor.danger.fill} />
              </linearGradient>
              <linearGradient id="vc-area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={zoneColor.safe.fill} stopOpacity="0.28" />
                <stop offset="50%" stopColor={zoneColor.caution.fill} stopOpacity="0.14" />
                <stop offset="100%" stopColor={zoneColor.danger.fill} stopOpacity="0.04" />
              </linearGradient>
            </defs>

            {[0, 50, 100].map((v) => (
              <g key={v}>
                <line x1={PAD_LEFT} y1={toY(v)} x2={SVG_W - PAD_RIGHT} y2={toY(v)} stroke="#EDE4D6" strokeWidth="1" strokeDasharray="4 4" />
                <text x={PAD_LEFT - 8} y={toY(v) + 4} textAnchor="end" fontSize="11" fill="#8C86A0">
                  {v}%
                </text>
              </g>
            ))}

            {/* Danger zone shading (last two points) */}
            <rect x={pts[4].x} y={PAD_TOP} width={pts[5].x - pts[4].x} height={CHART_H} fill="#FFE5DC" opacity="0.6" rx="4" />

            {/* "Act now" marker at the 3-day point */}
            <line x1={pts[3].x} y1={PAD_TOP - 8} x2={pts[3].x} y2={PAD_TOP + CHART_H + 4} stroke="#FFC530" strokeWidth="1.5" strokeDasharray="5 3" />
            <text x={pts[3].x + 6} y={PAD_TOP + 2} fontSize="9" fontWeight="700" fill="#8A5A00">
              ACT NOW
            </text>

            <path d={areaPath} fill="url(#vc-area)" />
            <path d={linePath} fill="none" stroke="url(#vc-line)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

            {pts.map((p) => (
              <g key={p.label}>
                <circle cx={p.x} cy={p.y} r="7" fill={zoneColor[p.zone].fill} opacity="0.25" />
                <circle cx={p.x} cy={p.y} r="4.5" fill={zoneColor[p.zone].fill} stroke="#16131F" strokeWidth="1.5" />
                {p.value > 0 && (
                  <text x={p.x} y={p.y - 12} textAnchor="middle" fontSize="11" fontWeight="700" fill={zoneColor[p.zone].text}>
                    {p.value}%
                  </text>
                )}
                <text x={p.x} y={SVG_H - 6} textAnchor="middle" fontSize="11" fill="#5F5A6B">
                  {p.shortLabel}
                </text>
              </g>
            ))}
          </svg>

          <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
            {insights.map((i) => (
              <div key={i.title} className={`rounded-2xl px-2 py-3 text-center sm:px-4 ${i.bg}`}>
                <p className="text-[11px] font-bold tracking-wide uppercase sm:text-xs" style={{ color: zoneColor[i.zone].text }}>
                  {i.title}
                </p>
                <p className="mt-0.5 text-xs text-ink-2">{i.body}</p>
              </div>
            ))}
          </div>
        </figure>

        <div className="flex flex-col items-center gap-5 text-center">
          <p className="font-medium text-muted-foreground">Don&apos;t let your tickets go to waste — get your offer now.</p>
          <Cta href="/sell" size="lg" withArrow>
            Lock In My Price
          </Cta>
        </div>
      </Container>
    </section>
  );
}
