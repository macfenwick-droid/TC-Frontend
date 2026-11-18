"use client";

import { useId, useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { faqCategories, faqs } from "@/content/faqs";
import { cn } from "@/lib/utils";

const keyOf = (q: string) => q;

/**
 * Category sidebar (pills on mobile) + search + single-open accordion.
 * Every question and answer is in the HTML from the server, so crawlers see all of it;
 * filtering only toggles `hidden`.
 */
export function FaqBrowser() {
  const [category, setCategory] = useState(faqCategories[0]);
  const [query, setQuery] = useState("");
  // First question open by default, like the current site.
  const [open, setOpen] = useState<string | null>(keyOf(faqs[0].question));
  const baseId = useId();

  const q = query.trim().toLowerCase();
  const searching = q.length > 0;

  const visible = useMemo(() => {
    const set = new Set<string>();
    for (const f of faqs) {
      const match = searching
        ? f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q)
        : f.category === category;
      if (match) set.add(keyOf(f.question));
    }
    return set;
  }, [q, searching, category]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const f of faqs) c[f.category] = (c[f.category] ?? 0) + 1;
    return c;
  }, []);

  const pickCategory = (c: string) => {
    setCategory(c);
    setQuery("");
    setOpen(keyOf(faqs.find((f) => f.category === c)!.question));
  };

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-12">
      <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
        <label className="relative block">
          <span className="sr-only">Search questions</span>
          <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-subtle" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search questions"
            className="h-12 w-full rounded-full border-[1.5px] border-line bg-white pr-4 pl-11 text-base outline-none placeholder:text-subtle focus:border-ink"
          />
        </label>

        <nav aria-label="FAQ categories" className="-mx-4 overflow-x-auto px-4 lg:mx-0 lg:overflow-visible lg:px-0">
          <ul className="flex gap-2 lg:flex-col">
            {faqCategories.map((c) => {
              const active = !searching && c === category;
              return (
                <li key={c} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => pickCategory(c)}
                    aria-pressed={active}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 rounded-full px-4 py-2.5 text-left text-[15px] font-semibold whitespace-nowrap transition-colors lg:rounded-2xl lg:py-3",
                      active ? "bg-ink text-white" : "border border-line bg-white hover:bg-mint"
                    )}
                  >
                    {c}
                    <span
                      className={cn(
                        "grid min-w-6 place-items-center rounded-full px-1.5 text-xs font-bold",
                        active ? "bg-brand text-ink" : "bg-cream text-muted-foreground"
                      )}
                    >
                      {counts[c]}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1.5" aria-live="polite">
          <h2 className="text-3xl font-extrabold sm:text-4xl">{searching ? "Search results" : category}</h2>
          <p className="text-muted-foreground">
            {searching
              ? `${visible.size} ${visible.size === 1 ? "question matches" : "questions match"} “${query.trim()}”.`
              : `Everything you need to know about ${category.toLowerCase()}.`}
          </p>
        </div>

        <ul className="flex flex-col gap-3">
          {faqs.map((f, i) => {
            const k = keyOf(f.question);
            const isOpen = open === k;
            const btnId = `${baseId}-q${i}`;
            const panelId = `${baseId}-a${i}`;
            return (
              <li key={k} hidden={!visible.has(k)}>
                <div
                  className={cn(
                    "rounded-3xl border bg-white transition-colors",
                    isOpen ? "border-ink" : "border-line hover:border-subtle"
                  )}
                >
                  <h3 className="m-0">
                    <button
                      id={btnId}
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => setOpen(isOpen ? null : k)}
                      className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left font-heading text-lg leading-snug font-bold sm:px-6 sm:text-xl"
                    >
                      {f.question}
                      <span
                        className={cn(
                          "grid size-9 shrink-0 place-items-center rounded-full transition-[transform,background-color] duration-300",
                          isOpen ? "rotate-45 bg-brand" : "bg-cream"
                        )}
                      >
                        <Plus className="size-4" strokeWidth={2.6} aria-hidden="true" />
                      </span>
                    </button>
                  </h3>
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={btnId}
                    hidden={!isOpen}
                    className="px-5 pb-6 text-[17px] leading-relaxed text-ink-2 sm:px-6"
                  >
                    {f.answer}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {searching && visible.size === 0 && (
          <p className="rounded-3xl border border-dashed border-line bg-white p-6 text-muted-foreground">
            No questions match your search.
          </p>
        )}
      </div>
    </div>
  );
}
