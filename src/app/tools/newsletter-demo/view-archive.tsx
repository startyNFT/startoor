"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Clock, Search, X } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  ISSUES,
  ISSUE_COUNT_BY_TAG,
  TAG_LABELS,
  TAGS_IN_ORDER,
  type Tag,
} from "@/lib/data/newsletter-mock";

type NavigateFn = (next: {
  view?: "landing" | "archive" | "issue" | "subscribe" | "about";
  id?: string | null;
}) => void;

function formatDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function groupByYearMonth(issues: typeof ISSUES) {
  const groups = new Map<string, typeof ISSUES>();
  for (const issue of issues) {
    const d = new Date(issue.date + "T00:00:00");
    const key = `${d.getFullYear()} · ${d.toLocaleDateString("en-US", {
      month: "long",
    })}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(issue);
  }
  return Array.from(groups.entries());
}

export function ArchiveView({ onNavigate }: { onNavigate: NavigateFn }) {
  const [tagFilter, setTagFilter] = useState<Tag | "all">("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...ISSUES]
      .sort((a, b) => b.number - a.number)
      .filter((i) => (tagFilter === "all" ? true : i.tag === tagFilter))
      .filter((i) =>
        !q
          ? true
          : i.title.toLowerCase().includes(q) ||
            i.deck.toLowerCase().includes(q) ||
            i.excerpt.toLowerCase().includes(q) ||
            String(i.number).includes(q),
      );
  }, [tagFilter, query]);

  const grouped = useMemo(() => groupByYearMonth(filtered), [filtered]);
  const totalReadMin = filtered.reduce((acc, i) => acc + i.readTimeMin, 0);

  return (
    <section className="bg-paper">
      <div className="mx-auto max-w-6xl px-6 pt-16 pb-10 md:px-10 md:pt-20">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-end">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.26em] text-clay">
              The archive
            </span>
            <h1 className="mt-3 font-display text-[44px] leading-[0.98] tracking-tight text-ink md:text-[64px]">
              Every issue,
              <br />
              <span className="italic text-forest">neatly catalogued.</span>
            </h1>
          </div>
          <p className="max-w-md font-sans text-[15px] leading-[1.7] text-ink-soft">
            {ISSUES.length} issues, {totalReadMin.toLocaleString()} minutes of
            reading, arranged from most recent to first. Filter by tag, search
            the full text, or wander.
          </p>
        </div>

        {/* Filter bar */}
        <div className="mt-10 flex flex-col gap-6 border-y border-hairline py-5 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <FilterChip
              label="All"
              count={ISSUES.length}
              active={tagFilter === "all"}
              onClick={() => setTagFilter("all")}
            />
            {TAGS_IN_ORDER.map((t) => (
              <FilterChip
                key={t}
                label={TAG_LABELS[t]}
                count={ISSUE_COUNT_BY_TAG[t]}
                active={tagFilter === t}
                onClick={() => setTagFilter(t)}
              />
            ))}
          </div>

          <label className="relative flex min-w-0 items-center gap-2 md:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search titles, decks, text…"
              className="w-full border border-hairline bg-bone py-2.5 pl-9 pr-8 font-sans text-[14px] placeholder:text-stone-light focus:border-ink focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-stone hover:text-ink"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </label>
        </div>
      </div>

      {/* Issue list */}
      <div className="mx-auto max-w-6xl px-6 pb-24 md:px-10">
        {filtered.length === 0 ? (
          <div className="border border-hairline bg-bone px-8 py-16 text-center">
            <p className="font-display text-[22px] italic text-ink">
              No issues matched.
            </p>
            <p className="mt-3 font-sans text-[14px] leading-[1.7] text-ink-soft">
              Try a different tag or clear the search.
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setTagFilter("all");
              }}
              className="mt-5 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-ink hover:text-clay"
            >
              Reset filters
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          grouped.map(([monthKey, items]) => (
            <div key={monthKey} className="mt-12 first:mt-0">
              <div className="sticky top-44 z-10 -mx-6 border-b border-hairline bg-paper/95 px-6 py-3 backdrop-blur-sm md:-mx-10 md:px-10">
                <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-stone">
                  {monthKey} · {items.length} issue
                  {items.length === 1 ? "" : "s"}
                </p>
              </div>

              <ul className="divide-y divide-hairline">
                {items.map((i) => (
                  <li key={i.id}>
                    <button
                      type="button"
                      onClick={() => onNavigate({ view: "issue", id: i.id })}
                      className="group grid w-full min-w-0 grid-cols-[auto_1fr_auto] items-baseline gap-4 py-7 text-left md:grid-cols-[auto_1fr_auto_auto] md:gap-6"
                    >
                      <span className="font-mono text-[22px] font-medium leading-none tabular-nums text-stone group-hover:text-clay md:text-[28px]">
                        № {String(i.number).padStart(3, "0")}
                      </span>
                      <span className="min-w-0">
                        <span className="block font-display text-[22px] leading-[1.1] tracking-tight text-ink group-hover:text-clay md:text-[26px]">
                          {i.title}
                        </span>
                        <span className="mt-1.5 block font-display text-[15px] italic leading-[1.45] text-ink-soft md:text-[16px]">
                          {i.deck}
                        </span>
                        <span className="mt-2 flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-stone md:hidden">
                          <span>{formatDate(i.date)}</span>
                          <span>·</span>
                          <span>{TAG_LABELS[i.tag]}</span>
                          <span>·</span>
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {i.readTimeMin} min
                          </span>
                        </span>
                      </span>
                      <span className="hidden items-center gap-1.5 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.2em] text-stone md:inline-flex">
                        <Clock className="h-3 w-3" />
                        {i.readTimeMin} min
                      </span>
                      <span className="hidden shrink-0 whitespace-nowrap rounded-full border border-hairline bg-bone px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-ink md:inline-block">
                        {TAG_LABELS[i.tag]}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function FilterChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] transition-colors",
        active
          ? "border-ink bg-ink text-bone"
          : "border-hairline bg-bone text-ink hover:border-ink",
      )}
    >
      <span>{label}</span>
      <span
        className={cn(
          "tabular-nums text-[10px]",
          active ? "text-bone/70" : "text-stone",
        )}
      >
        {count}
      </span>
    </button>
  );
}
