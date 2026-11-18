/* eslint-disable @typescript-eslint/no-explicit-any */
// Team news / stats logic: ESPN parsing + ticket-demand scoring. Framework-agnostic and
// testable apart from the UI (see the /news page). All ESPN/AI calls go through
// the backend proxies (/api/espn, /api/ai) because ESPN/DeepSeek block direct CORS.
import { universalApiBase } from "@/config/backend";

export type LeagueKey = "nfl" | "cfb" | "nba" | "nhl";
export const LEAGUES: { key: LeagueKey; sport: string; league: string; label: string }[] = [
  { key: "nfl", sport: "football", league: "nfl", label: "NFL" },
  { key: "cfb", sport: "football", league: "college-football", label: "College Football" },
  { key: "nba", sport: "basketball", league: "nba", label: "NBA" },
  { key: "nhl", sport: "hockey", league: "nhl", label: "NHL" },
];
export const leagueOf = (k: LeagueKey) => LEAGUES.find((l) => l.key === k)!;

// Browser: same-origin "/api" proxy (next.config.ts rewrites it to the backend).
// Server components (SSR/ISR of /news): the backend directly. See src/config/backend.ts.
/** Browser-only base, used by the /news page's AI summary call (`${API_BASE}/ai`). */
export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

export type TeamLite = { id: string; league: LeagueKey; name: string; short: string; abbr: string; logo?: string };

export async function espn(key: LeagueKey, resource: string, params: Record<string, string> = {}) {
  const l = leagueOf(key);
  const qs = new URLSearchParams({ sport: l.sport, league: l.league, resource, ...params });
  const r = await fetch(`${universalApiBase()}/espn?${qs}`);
  if (!r.ok) throw new Error(`ESPN returned status ${r.status}`);
  return r.json();
}

export type Game = {
  id: string;
  date: Date;
  completed: boolean;
  home: boolean;
  oppName: string;
  oppRank: number | null;
  oppRecord: string;
  usRank: number | null;
  usRecord: string;
  us: string;
  them: string;
  won: boolean | null;
  lowest: number | null;
  upset: boolean;
  bigWin: boolean;
};

const scoreOf = (s: any): string => (s == null ? "" : typeof s === "object" ? String(s.displayValue ?? s.value ?? "") : String(s));
const rankOf = (c: any): number | null => {
  const r = Number(c?.curatedRank?.current);
  return r && r <= 25 ? r : null;
};
export function rate(rec: string): { pct: number; games: number } {
  const p = (rec || "").split("-").map(Number);
  if (p.length < 2 || p.some(isNaN)) return { pct: 0, games: 0 };
  const games = p.reduce((a, b) => a + b, 0);
  return { pct: games ? (p[0] ?? 0) / games : 0, games };
}
export function priceFrom(t: any): number | null {
  if (!t) return null;
  if (t.startingPrice != null && !isNaN(Number(t.startingPrice))) return Number(t.startingPrice);
  const m = String(t.summary ?? "").match(/\$\s?([\d,]+(?:\.\d+)?)/);
  return m?.[1] ? Number(m[1].replace(/,/g, "")) : null;
}

export function parseSchedule(sched: any, teamId: string): Game[] {
  const out: Game[] = [];
  for (const ev of sched?.events ?? []) {
    const comp = ev.competitions?.[0];
    if (!comp) continue;
    const cs = comp.competitors ?? [];
    const me = cs.find((c: any) => String(c.id) === String(teamId));
    const opp = cs.find((c: any) => c !== me);
    if (!me || !opp) continue;
    const completed = !!comp.status?.type?.completed;
    const won = completed ? (me.winner === true ? true : opp.winner === true ? false : null) : null;
    const g: Game = {
      id: String(ev.id),
      date: new Date(ev.date ?? comp.date),
      completed,
      home: me.homeAway === "home",
      oppName: opp.team?.displayName ?? "TBD",
      oppRank: rankOf(opp),
      oppRecord: opp.record?.[0]?.displayValue ?? "",
      usRank: rankOf(me),
      usRecord: me.record?.[0]?.displayValue ?? "",
      us: scoreOf(me.score),
      them: scoreOf(opp.score),
      won,
      lowest: priceFrom(comp.tickets?.[0]),
      upset: false,
      bigWin: false,
    };
    if (won === false) {
      const o = rate(g.oppRecord), u = rate(g.usRecord);
      g.upset = (g.usRank != null && g.oppRank == null) || (o.games >= 3 && o.pct < 0.35 && u.pct >= 0.5);
    }
    if (won === true && g.oppRank != null && (g.usRank == null || g.oppRank < g.usRank)) g.bigWin = true;
    out.push(g);
  }
  return out.sort((a, b) => a.date.getTime() - b.date.getTime());
}

export type Injury = { name: string; pos: string; status: string; type: string; comment: string };
export type Driver = { label: string; pts: number };

export function demand(opts: {
  done: Game[];
  lastSeason: boolean;
  rank: number | null;
  injuries: Injury[];
  league: LeagueKey;
}): { score: number; drivers: Driver[]; label: string; tone: "up" | "down" | "flat" } {
  const { done, lastSeason, rank, injuries, league } = opts;
  const d: Driver[] = [];
  const w = done.filter((g) => g.won === true).length;
  const l = done.filter((g) => g.won === false).length;
  const n = done.length;
  if (n) {
    let v = (w / n - 0.5) * 36 * Math.min(1, n / 4);
    if (lastSeason) v /= 2;
    d.push({ label: `Season record ${w}-${l}${lastSeason ? " (last season, half weight)" : ""}`, pts: v });
  }
  const l5 = done.slice(-5);
  if (l5.length) {
    const ww = l5.filter((g) => g.won === true).length, ll = l5.filter((g) => g.won === false).length;
    d.push({ label: `Last ${l5.length} games: ${ww}-${ll}`, pts: (ww - ll) * 2.5 });
  }
  const s = streak(done);
  if (Math.abs(s) >= 2) d.push({ label: `${s > 0 ? "Winning" : "Losing"} streak of ${Math.abs(s)}`, pts: Math.sign(s) * Math.min(10, 2 * Math.abs(s)) });
  for (const g of done.slice(-3)) {
    if (g.upset) d.push({ label: `Upset loss to ${g.oppName}`, pts: -9 });
    if (g.bigWin) d.push({ label: `Big win over #${g.oppRank} ${g.oppName}`, pts: 7 });
  }
  if (rank != null && rank <= 25) d.push({ label: `Ranked #${rank}`, pts: rank <= 5 ? 10 : rank <= 10 ? 8 : 4 });
  const st = (i: Injury) => i.status.toLowerCase();
  const out = injuries.filter((i) => /out|injured reserve|\bir\b|suspen/.test(st(i)));
  const q = injuries.filter((i) => /questionable|doubtful|day-to-day/.test(st(i)));
  if (out.length) d.push({ label: `${out.length} player(s) out or on IR`, pts: -Math.min(8, out.length * 1.2) });
  if (q.length) d.push({ label: `${q.length} player(s) questionable / doubtful / day-to-day`, pts: -Math.min(4, q.length * 0.6) });
  const keyPos = league === "nhl" ? "G" : league === "nfl" || league === "cfb" ? "QB" : null;
  const key = keyPos && injuries.find((i) => i.pos === keyPos && /out|doubtful|injured reserve/.test(st(i)));
  if (key) d.push({ label: `Key player ${key.pos} ${key.name} is ${key.status}`, pts: -8 });
  const score = Math.round(Math.max(0, Math.min(100, 50 + d.reduce((a, b) => a + b.pts, 0))));
  const label = score >= 60 ? "Prices likely firming" : score <= 42 ? "Prices likely softening" : "Prices likely holding";
  return { score, drivers: d, label, tone: score >= 60 ? "up" : score <= 42 ? "down" : "flat" };
}

export function streak(done: Game[]): number {
  let s = 0;
  for (let i = done.length - 1; i >= 0; i--) {
    const w = done[i]?.won;
    if (w == null) break;
    if (s === 0) s = w ? 1 : -1;
    else if (w && s > 0) s++;
    else if (!w && s < 0) s--;
    else break;
  }
  return s;
}

export const ET = "America/New_York";
export function fmtTime(d: Date, tz?: string) {
  return d.toLocaleString("en-US", { timeZone: tz, weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}
export function fmtDate(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" });
}
export function ago(iso: string) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (isNaN(s)) return "";
  if (s < 3600) return `${Math.max(1, Math.round(s / 60))} min ago`;
  if (s < 86400) return `${Math.round(s / 3600)} h ago`;
  return `${Math.round(s / 86400)} days ago`;
}
export const money = (n: number | null | undefined) => (n == null || isNaN(Number(n)) ? "—" : `$${Math.round(Number(n)).toLocaleString("en-US")}`);

export type PriceCheck = { time: string; eventId: string; lowest: number };
const PK = "tc_price_checks";
export function readChecks(): PriceCheck[] {
  try { return JSON.parse(localStorage.getItem(PK) || "[]"); } catch { return []; }
}
export function addCheck(c: PriceCheck) {
  const all = [...readChecks(), c].slice(-600);
  localStorage.setItem(PK, JSON.stringify(all));
  return all.filter((x) => x.eventId === c.eventId);
}
