"use client";

/* eslint-disable @typescript-eslint/no-explicit-any -- ESPN responses are untyped JSON */
/* eslint-disable @next/next/no-img-element -- team logos come from ESPN's CDN in many sizes */
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { RefreshCw, Search as SearchIcon } from "lucide-react";
import {
  LEAGUES,
  leagueOf,
  espn,
  parseSchedule,
  demand,
  streak,
  fmtTime,
  fmtDate,
  ago,
  money,
  ET,
  priceFrom,
  addCheck,
  type LeagueKey,
  type TeamLite,
  type Game,
  type Injury,
  type PriceCheck,
} from "@/lib/news";
import { cn } from "@/lib/utils";

/**
 * Port of the current site's News page (public part). The admin-only AI price outlook
 * stays on the admin site (D6).
 */

const LAST_KEY = "tc_last_team";
type Sel = { league: LeagueKey; id: string };

type Data = {
  sel: Sel;
  team: any;
  games: Game[];
  lastSeason: boolean;
  injuries: Injury[] | null;
  news: any[];
  tickets: { eventId: string; lowest: number | null; max: number | null; available: number | null; name: string } | null;
  checks: PriceCheck[];
  /** When this data was fetched; "upcoming" is measured from here. */
  loadedAt: number;
};

// Full class strings so Tailwind can see them.
const TONE = {
  up: { text: "text-link", bar: "bg-brand", pill: "bg-mint text-link" },
  down: { text: "text-[#9A3412]", bar: "bg-coral", pill: "bg-peach text-[#9A3412]" },
  flat: { text: "text-amber-fg", bar: "bg-yellow", pill: "bg-butter text-amber-fg" },
} as const;

const pillBase = "inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide uppercase";

function Panel({ className = "", children }: { className?: string; children: ReactNode }) {
  return <section className={cn("rounded-[24px] border border-line bg-white p-5 sm:p-6", className)}>{children}</section>;
}
function PanelTitle({ children }: { children: ReactNode }) {
  return <h3 className="mb-4 text-lg font-extrabold">{children}</h3>;
}
function Lbl({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={cn("text-[11px] font-semibold tracking-wider text-muted-foreground uppercase", className)}>{children}</div>;
}

function readLastTeam(): Sel {
  let s: Sel = { league: "cfb", id: "213" };
  try {
    const v = JSON.parse(localStorage.getItem(LAST_KEY) || "null");
    if (v?.league && v?.id) s = v;
  } catch {
    /* ignore */
  }
  return s;
}

export function NewsDashboard() {
  const [teams, setTeams] = useState<TeamLite[]>([]);
  const [filter, setFilter] = useState<"all" | LeagueKey>("all");
  const [sel, setSel] = useState<Sel | null>(null);
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (s: Sel) => {
    setLoading(true);
    setError(null);
    try {
      localStorage.setItem(LAST_KEY, JSON.stringify(s));
    } catch {
      /* storage blocked */
    }
    try {
      const [t, sc, inj, nw] = await Promise.all([
        espn(s.league, `teams/${s.id}`),
        espn(s.league, `teams/${s.id}/schedule`),
        espn(s.league, "injuries").catch(() => null),
        espn(s.league, "news", { team: s.id }).catch(() => null),
      ]);
      const team = t.team;
      if (!team) throw new Error("ESPN has no data for this team");
      let games = parseSchedule(sc, s.id);
      let lastSeason = false;
      if (!games.some((g) => g.completed)) {
        const yr = Number(sc?.season?.year ?? sc?.requestedSeason?.year ?? new Date().getFullYear());
        try {
          const prev = await espn(s.league, `teams/${s.id}/schedule`, { season: String(yr - 1) });
          const pg = parseSchedule(prev, s.id).filter((g) => g.completed);
          if (pg.length) {
            games = [...pg, ...games];
            lastSeason = true;
          }
        } catch {
          /* ignore */
        }
      }
      let injuries: Injury[] | null = null;
      if (inj?.injuries?.length) {
        const grp = inj.injuries.find((g: any) => String(g.id) === s.id);
        injuries = (grp?.injuries ?? []).map((i: any) => ({
          name: i.athlete?.displayName ?? "",
          pos: i.athlete?.position?.abbreviation ?? "",
          status: i.status ?? "",
          type: i.details?.type ?? "",
          comment: i.shortComment ?? "",
        }));
      }
      const ne = team.nextEvent?.[0];
      const tk = ne?.competitions?.[0]?.tickets?.[0];
      let tickets: Data["tickets"] = null;
      let checks: PriceCheck[] = [];
      if (tk) {
        const lowest = priceFrom(tk);
        tickets = {
          eventId: String(ne.id),
          lowest,
          max: tk.maxPrice ?? null,
          available: tk.numberAvailable ?? null,
          name: ne.shortName ?? ne.name ?? "",
        };
        if (lowest != null) checks = addCheck({ time: new Date().toISOString(), eventId: String(ne.id), lowest });
      }
      setData({ sel: s, team, games, lastSeason, injuries, news: nw?.articles ?? [], tickets, checks, loadedAt: Date.now() });
    } catch (e: any) {
      setError(`Could not load data from ESPN. ${e?.message ?? ""} Please try Refresh.`);
    } finally {
      setLoading(false);
    }
  }, []);

  const pick = useCallback(
    (s: Sel) => {
      setSel(s);
      void load(s);
    },
    [load]
  );

  // First visit: last team from this browser (or the current site's default) + all team lists.
  useEffect(() => {
    let cancelled = false;
    const s = readLastTeam();
    queueMicrotask(() => {
      if (!cancelled) pick(s);
    });
    Promise.all(
      LEAGUES.map((l) =>
        espn(l.key, "teams")
          .then((j) =>
            (j?.sports?.[0]?.leagues?.[0]?.teams ?? []).map((x: any) => ({
              id: String(x.team.id),
              league: l.key,
              name: x.team.displayName ?? "",
              short: x.team.shortDisplayName ?? "",
              abbr: x.team.abbreviation ?? "",
              logo: x.team.logos?.[0]?.href,
            }))
          )
          .catch(() => [] as TeamLite[])
      )
    ).then((r) => {
      if (!cancelled) setTeams(r.flat());
    });
    return () => {
      cancelled = true;
    };
  }, [pick]);

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-[24px] border border-line bg-white p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          {([["all", "All"], ...LEAGUES.map((l) => [l.key, l.label])] as [string, string][]).map(([k, lbl]) => (
            <button
              key={k}
              type="button"
              aria-pressed={filter === k}
              onClick={() => setFilter(k as "all" | LeagueKey)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors",
                filter === k ? "border-ink bg-ink text-white" : "border-line bg-white hover:bg-mint"
              )}
            >
              {lbl}
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Search teams={teams} filter={filter} onPick={(t) => pick({ league: t.league, id: t.id })} />
          <button
            type="button"
            disabled={!sel || loading}
            onClick={() => sel && load(sel)}
            className="inline-flex h-11 items-center gap-2 rounded-full border-[1.5px] border-ink bg-white px-5 font-semibold transition-colors hover:bg-butter disabled:opacity-50"
          >
            <RefreshCw className={cn("size-4", loading && "animate-spin")} aria-hidden="true" />
            {loading ? "Loading…" : "Refresh"}
          </button>
        </div>
      </div>

      {error && (
        <div role="alert" className="rounded-2xl border border-coral/40 bg-peach p-3 text-sm text-[#9A3412]">
          {error}
        </div>
      )}
      {!data && loading && <p className="text-muted-foreground">Loading team…</p>}
      {data && <Dashboard data={data} />}
    </div>
  );
}

function Search({
  teams,
  filter,
  onPick,
}: {
  teams: TeamLite[];
  filter: "all" | LeagueKey;
  onPick: (t: TeamLite) => void;
}) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(0);
  const box = useRef<HTMLDivElement>(null);
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return [];
    return teams
      .filter(
        (t) =>
          (filter === "all" || t.league === filter) &&
          (t.name.toLowerCase().includes(s) || t.short.toLowerCase().includes(s) || t.abbr.toLowerCase() === s)
      )
      .slice(0, 10);
  }, [q, teams, filter]);
  const pick = (t: TeamLite) => {
    onPick(t);
    setQ("");
    setOpen(false);
  };
  return (
    <div ref={box} className="relative min-w-[220px] flex-1">
      <SearchIcon className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-subtle" aria-hidden="true" />
      <input
        aria-label="Search for a team"
        className="h-11 w-full rounded-full border-[1.5px] border-line bg-white pr-4 pl-10 outline-none placeholder:text-subtle focus:border-ink"
        placeholder={teams.length ? "Type a team name…" : "Loading team lists…"}
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
          setHi(0);
        }}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setHi((h) => Math.min(h + 1, list.length - 1));
          }
          if (e.key === "ArrowUp") {
            e.preventDefault();
            setHi((h) => Math.max(h - 1, 0));
          }
          if (e.key === "Enter" && list[hi]) pick(list[hi]);
        }}
      />
      {open && list.length > 0 && (
        <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-2xl border border-line bg-white shadow-[0_18px_32px_-16px_rgba(22,19,31,0.3)]">
          {list.map((t, i) => (
            <li key={t.league + t.id}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(t)}
                className={cn("flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm", i === hi && "bg-mint")}
              >
                {t.logo ? <img src={t.logo} alt="" className="size-6 object-contain" /> : <span className="size-6" />}
                <span className="flex-1">{t.name}</span>
                <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                  {leagueOf(t.league).label}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Dashboard({ data }: { data: Data }) {
  const { team, games, lastSeason, injuries, news, tickets, checks, sel, loadedAt: now } = data;
  const done = games.filter((g) => g.completed);
  const upcoming = games.filter((g) => !g.completed && g.date.getTime() > now - 6 * 3600e3).slice(0, 6);
  const items: any[] = team.record?.items ?? [];
  const rec = (type: string) => items.find((i) => i.type === type)?.summary ?? "—";
  const stat = (n: string) => items[0]?.stats?.find((s: any) => s.name === n)?.value;
  const rank = team.rank && team.rank <= 25 ? Number(team.rank) : null;
  const w = done.filter((g) => g.won === true).length;
  const l = done.filter((g) => g.won === false).length;
  const s = streak(done);
  const dm = demand({ done, lastSeason, rank, injuries: injuries ?? [], league: sel.league });
  const last8 = done.slice(-8);

  return (
    <div className="flex flex-col gap-5">
      <Panel>
        <div className="flex flex-wrap items-center gap-4">
          {team.logos?.[0]?.href && <img src={team.logos[0].href} alt="" className="size-16 object-contain sm:size-20" />}
          <div className="min-w-0 flex-1">
            <Lbl>{leagueOf(sel.league).label}</Lbl>
            <h2 className="text-3xl leading-tight font-extrabold sm:text-4xl">
              {rank ? `#${rank} ` : ""}
              {team.displayName}
            </h2>
            <p className="text-sm text-muted-foreground">{team.standingSummary}</p>
          </div>
          <div className="flex gap-1" title="Last 8 games, oldest first">
            {last8.map((g) => (
              <span
                key={g.id}
                className={cn(
                  "flex size-7 items-center justify-center rounded-lg text-xs font-bold tabular-nums",
                  g.won ? "bg-brand text-ink" : g.won === false ? "bg-coral text-white" : "bg-cream text-muted-foreground"
                )}
              >
                {g.won ? "W" : g.won === false ? "L" : "T"}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-4 sm:grid-cols-4 lg:grid-cols-8">
          <Stat label="Record" v={rec("total")} />
          <Stat label="Home" v={rec("home")} />
          <Stat label="Road" v={rec("road")} />
          <Stat label="Wins" v={String(w)} />
          <Stat label="Losses" v={String(l)} />
          <Stat label="Streak" v={s ? `${s > 0 ? "W" : "L"}${Math.abs(s)}` : "—"} />
          <Stat label="Avg pts for" v={stat("avgPointsFor") != null ? Number(stat("avgPointsFor")).toFixed(1) : "—"} />
          <Stat
            label="Avg pts against"
            v={stat("avgPointsAgainst") != null ? Number(stat("avgPointsAgainst")).toFixed(1) : "—"}
          />
        </div>
        {lastSeason && (
          <p className="mt-3 text-xs text-muted-foreground">
            No games finished this season yet. Results below are from last season.
          </p>
        )}
      </Panel>

      <div className="grid gap-5 lg:grid-cols-3">
        <Panel>
          <PanelTitle>Ticket demand signal</PanelTitle>
          <div className="flex items-end gap-3">
            <span className={cn("font-heading text-6xl leading-none font-extrabold tabular-nums", TONE[dm.tone].text)}>
              {dm.score}
            </span>
            <span className={cn(pillBase, "mb-1", TONE[dm.tone].pill)}>{dm.label}</span>
          </div>
          <div className="relative mt-3 h-2 rounded-full bg-cream">
            <div className={cn("absolute inset-y-0 left-0 rounded-full", TONE[dm.tone].bar)} style={{ width: `${dm.score}%` }} />
            <div className="absolute -inset-y-[3px] left-1/2 w-px bg-ink/40" />
          </div>
          <Lbl className="mt-4 mb-1">What is moving demand</Lbl>
          <ul className="flex flex-col gap-1 text-sm">
            {dm.drivers.length === 0 && <li className="text-muted-foreground">No strong signals. Score stays neutral.</li>}
            {dm.drivers.map((d, i) => (
              <li key={i} className="flex justify-between gap-2">
                <span>{d.label}</span>
                <span
                  className={cn(
                    "font-semibold tabular-nums",
                    d.pts > 0 ? "text-link" : d.pts < 0 ? "text-[#9A3412]" : ""
                  )}
                >
                  {d.pts > 0 ? "+" : ""}
                  {d.pts.toFixed(1)}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">
            This estimates buyer interest from team performance. It is not a market price.
          </p>
        </Panel>

        <Panel className="lg:col-span-2">
          <PanelTitle>
            Results{" "}
            {lastSeason && <span className={cn(pillBase, "ml-1 align-middle", TONE.flat.pill)}>last season</span>}
          </PanelTitle>
          {done.length === 0 ? (
            <p className="text-sm text-muted-foreground">No finished games yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm tabular-nums">
                <thead>
                  <tr className="text-left text-[11px] tracking-wider text-muted-foreground uppercase">
                    <th className="py-1 pr-2 font-semibold">Date</th>
                    <th className="pr-2 font-semibold">Opponent</th>
                    <th className="pr-2 font-semibold">Result</th>
                    <th className="font-semibold">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {done
                    .slice(-12)
                    .reverse()
                    .map((g) => (
                      <tr key={g.id} className="border-t border-line">
                        <td className="py-1.5 pr-2 whitespace-nowrap">{fmtDate(g.date)}</td>
                        <td className="pr-2">
                          {g.home ? "vs" : "at"} {g.oppRank ? <b>#{g.oppRank} </b> : ""}
                          {g.oppName}
                          {g.oppRecord && <span className="text-muted-foreground"> ({g.oppRecord})</span>}
                          {g.upset && <span className={cn(pillBase, "ml-2", TONE.down.pill)}>upset loss</span>}
                          {g.bigWin && <span className={cn(pillBase, "ml-2", TONE.up.pill)}>big win</span>}
                        </td>
                        <td
                          className={cn(
                            "pr-2 font-bold",
                            g.won ? "text-link" : g.won === false ? "text-[#9A3412]" : ""
                          )}
                        >
                          {g.won ? "W" : g.won === false ? "L" : "T"}
                        </td>
                        <td className="whitespace-nowrap">
                          {g.us}–{g.them}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <PricesCard tickets={tickets} checks={checks} />

        <Panel>
          <PanelTitle>Upcoming games</PanelTitle>
          {upcoming.length === 0 ? (
            <p className="text-sm text-muted-foreground">No upcoming games on ESPN.</p>
          ) : (
            <ul className="flex flex-col gap-2 text-sm">
              {upcoming.map((g) => (
                <li key={g.id} className="border-t border-line pt-2 first:border-0 first:pt-0">
                  <div className="flex justify-between gap-2">
                    <span className="font-medium">
                      {g.home ? "vs" : "at"} {g.oppRank ? `#${g.oppRank} ` : ""}
                      {g.oppName}
                    </span>
                    <span className={cn(pillBase, g.home ? TONE.up.pill : "bg-cream text-muted-foreground")}>
                      {g.home ? "Home" : "Away"}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground tabular-nums">
                    Your time: {fmtTime(g.date)} · ET: {fmtTime(g.date, ET)}
                  </div>
                  {g.lowest != null && (
                    <div className="text-xs tabular-nums">
                      Tickets from <b>{money(g.lowest)}</b>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel>
          <PanelTitle>Injuries</PanelTitle>
          {injuries == null ? (
            <p className="text-sm text-muted-foreground">ESPN does not publish an injury report for this league.</p>
          ) : injuries.length === 0 ? (
            <p className="text-sm text-muted-foreground">No injuries listed for this team.</p>
          ) : (
            <ul className="flex max-h-96 flex-col gap-2 overflow-y-auto text-sm">
              {injuries.map((i, k) => (
                <li key={k} className="border-t border-line pt-2 first:border-0 first:pt-0">
                  <div className="flex justify-between gap-2">
                    <span className="font-medium">
                      {i.name} <span className="text-muted-foreground">{i.pos}</span>
                    </span>
                    <span className={cn(pillBase, /out|reserve/i.test(i.status) ? TONE.down.pill : TONE.flat.pill)}>
                      {i.status}
                    </span>
                  </div>
                  {i.type && <div className="text-xs text-muted-foreground">{i.type}</div>}
                  {i.comment && <div className="text-xs">{i.comment}</div>}
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel>
          <PanelTitle>News</PanelTitle>
          {news.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent news.</p>
          ) : (
            <ul className="flex max-h-96 flex-col gap-3 overflow-y-auto text-sm">
              {news.map((a, k) => (
                <li key={k}>
                  <a
                    href={a.links?.web?.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block py-0.5 font-semibold hover:text-link hover:underline"
                  >
                    {a.headline}
                  </a>
                  {a.description && <p className="text-xs text-muted-foreground">{a.description}</p>}
                  {a.published && <Lbl className="mt-0.5">{ago(a.published)}</Lbl>}
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}

function Stat({ label, v }: { label: string; v: string }) {
  return (
    <div>
      <Lbl>{label}</Lbl>
      <div className="font-heading text-2xl font-extrabold tabular-nums">{v}</div>
    </div>
  );
}

function PricesCard({ tickets, checks }: { tickets: Data["tickets"]; checks: PriceCheck[] }) {
  const prev = checks.length >= 2 ? checks[checks.length - 2]!.lowest : null;
  const cur = checks.length ? checks[checks.length - 1]!.lowest : null;
  const diff = prev != null && cur != null ? cur - prev : null;
  return (
    <Panel>
      <PanelTitle>Listed prices</PanelTitle>
      {!tickets ? (
        <p className="text-sm text-muted-foreground">ESPN shows no listed prices for the next game.</p>
      ) : (
        <>
          <p className="mb-3 text-sm text-muted-foreground">Next game: {tickets.name}</p>
          <div className="grid grid-cols-3 gap-3">
            <Stat label="Lowest" v={money(tickets.lowest)} />
            <Stat label="Highest" v={money(tickets.max)} />
            <Stat
              label="Available"
              v={tickets.available != null ? Number(tickets.available).toLocaleString("en-US") : "—"}
            />
          </div>
          {diff != null && (
            <p className="mt-3 text-sm tabular-nums">
              Change since last check:{" "}
              <b className={diff > 0 ? "text-link" : diff < 0 ? "text-[#9A3412]" : ""}>
                {diff > 0 ? "+" : diff < 0 ? "−" : ""}
                {money(Math.abs(diff))}
              </b>
              <span className="text-muted-foreground"> ({checks.length} checks)</span>
            </p>
          )}
          {checks.length >= 2 && <Spark values={checks.map((c) => c.lowest)} />}
        </>
      )}
    </Panel>
  );
}

function Spark({ values }: { values: number[] }) {
  const v = values.slice(-30);
  const mn = Math.min(...v);
  const mx = Math.max(...v);
  const W = 240;
  const H = 40;
  const pts = v.map((x, i) => `${(i / (v.length - 1)) * W},${H - 4 - ((x - mn) / (mx - mn || 1)) * (H - 8)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 h-10 w-full text-link" preserveAspectRatio="none" aria-hidden="true">
      <polyline points={pts} fill="none" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
