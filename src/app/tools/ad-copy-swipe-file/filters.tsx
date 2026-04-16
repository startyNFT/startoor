"use client";

import { Download, Keyboard, Printer, Search, Shuffle, Star, X } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  type AdFunnelStage,
  type AdPattern,
  type AdPlatform,
  type AdVertical,
  FUNNEL_LABELS,
  PATTERN_LABELS,
  PLATFORM_LABELS,
  VERTICAL_LABELS,
} from "@/lib/data/ad-copy";

export type SortMode = "random" | "platform" | "length";

export const PLATFORM_ORDER: AdPlatform[] = [
  "facebook",
  "instagram",
  "tiktok",
  "youtube",
  "linkedin",
  "twitter",
  "google",
];

export const VERTICAL_ORDER: AdVertical[] = [
  "saas",
  "dtc",
  "info-product",
  "b2b",
  "local",
  "agency",
  "app",
  "fitness",
  "finance",
];

export const PATTERN_ORDER: AdPattern[] = [
  "hook-promise-proof",
  "problem-agitate-solve",
  "before-after",
  "transformation",
  "stat-reveal",
  "specificity-wins",
  "social-proof-stack",
  "authority-flex",
  "scarcity-urgency",
  "us-vs-them",
  "identity-call",
  "pattern-interrupt",
  "curiosity-gap",
  "contrarian-claim",
  "story-arc",
];

export const FUNNEL_ORDER: AdFunnelStage[] = ["cold", "warm", "retargeting"];

export type Filters = {
  query: string;
  platforms: Set<AdPlatform>;
  vertical: AdVertical | "all";
  pattern: AdPattern | "all";
  funnel: AdFunnelStage | "all";
  sort: SortMode;
  favoritesOnly: boolean;
};

export function defaultFilters(): Filters {
  return {
    query: "",
    platforms: new Set<AdPlatform>(),
    vertical: "all",
    pattern: "all",
    funnel: "all",
    sort: "random",
    favoritesOnly: false,
  };
}

export function FiltersBar({
  filters,
  setFilters,
  favoritesCount,
  resultsCount,
  totalCount,
  onReshuffle,
  onClearAll,
  onExportCsv,
  onPrint,
  onOpenShortcuts,
}: {
  filters: Filters;
  setFilters: (updater: (f: Filters) => Filters) => void;
  favoritesCount: number;
  resultsCount: number;
  totalCount: number;
  onReshuffle: () => void;
  onClearAll: () => void;
  onExportCsv: () => void;
  onPrint: () => void;
  onOpenShortcuts: () => void;
}) {
  const togglePlatform = (p: AdPlatform) => {
    setFilters((f) => {
      const next = new Set(f.platforms);
      if (next.has(p)) next.delete(p);
      else next.add(p);
      return { ...f, platforms: next };
    });
  };

  const hasActiveFilter =
    filters.query ||
    filters.platforms.size > 0 ||
    filters.vertical !== "all" ||
    filters.pattern !== "all" ||
    filters.funnel !== "all" ||
    filters.favoritesOnly;

  return (
    <div className="sticky top-14 z-30 border-b border-hairline bg-paper/95 backdrop-blur supports-[backdrop-filter]:bg-paper/80 print:hidden">
      <div className="mx-auto max-w-7xl px-6 py-4 md:px-10">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[220px]">
            <label
              htmlFor="ad-search"
              className="block font-mono text-[10px] uppercase tracking-[0.22em] text-stone"
            >
              Search · press /
            </label>
            <div className="mt-1.5 flex items-center gap-2 border-b border-hairline focus-within:border-ink">
              <Search className="h-3.5 w-3.5 text-stone" strokeWidth={1.5} />
              <input
                id="ad-search"
                value={filters.query}
                onChange={(e) => setFilters((f) => ({ ...f, query: e.target.value }))}
                placeholder="headlines, brands, verbs…"
                className="w-full bg-transparent py-2 font-sans text-sm text-ink placeholder:text-stone-light focus:outline-none"
              />
              {filters.query && (
                <button
                  type="button"
                  onClick={() => setFilters((f) => ({ ...f, query: "" }))}
                  className="text-stone hover:text-ink"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          <div>
            <span className="block font-mono text-[10px] uppercase tracking-[0.22em] text-stone">
              Vertical
            </span>
            <select
              value={filters.vertical}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  vertical: e.target.value as AdVertical | "all",
                }))
              }
              className="mt-1.5 border-b border-hairline bg-transparent py-2 font-sans text-sm text-ink focus:border-ink focus:outline-none"
            >
              <option value="all">All verticals</option>
              {VERTICAL_ORDER.map((v) => (
                <option key={v} value={v}>
                  {VERTICAL_LABELS[v]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <span className="block font-mono text-[10px] uppercase tracking-[0.22em] text-stone">
              Pattern
            </span>
            <select
              value={filters.pattern}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  pattern: e.target.value as AdPattern | "all",
                }))
              }
              className="mt-1.5 border-b border-hairline bg-transparent py-2 font-sans text-sm text-ink focus:border-ink focus:outline-none"
            >
              <option value="all">Any pattern</option>
              {PATTERN_ORDER.map((p) => (
                <option key={p} value={p}>
                  {PATTERN_LABELS[p]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <span className="block font-mono text-[10px] uppercase tracking-[0.22em] text-stone">
              Sort
            </span>
            <select
              value={filters.sort}
              onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value as SortMode }))}
              className="mt-1.5 border-b border-hairline bg-transparent py-2 font-sans text-sm text-ink focus:border-ink focus:outline-none"
            >
              <option value="random">Random</option>
              <option value="platform">By platform</option>
              <option value="length">By length</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onReshuffle}
              className="group inline-flex items-center gap-2 rounded-full border border-hairline px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft transition-colors hover:border-ink hover:text-ink"
              aria-label="Reshuffle"
            >
              <Shuffle
                className="h-3 w-3 transition-transform group-hover:rotate-12"
                strokeWidth={1.5}
              />
              Shuffle
            </button>
            <button
              type="button"
              onClick={() => setFilters((f) => ({ ...f, favoritesOnly: !f.favoritesOnly }))}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors",
                filters.favoritesOnly
                  ? "border-clay bg-clay text-bone"
                  : "border-hairline text-ink-soft hover:border-ink hover:text-ink",
              )}
            >
              <Star
                className="h-3 w-3"
                strokeWidth={1.5}
                fill={filters.favoritesOnly ? "currentColor" : "none"}
              />
              Saved · {favoritesCount}
            </button>
          </div>
        </div>

        {/* Platform chips */}
        <div className="mt-4 flex flex-wrap items-center gap-x-1.5 gap-y-2">
          <span className="mr-1 font-mono text-[10px] uppercase tracking-[0.22em] text-stone">
            Platform
          </span>
          {PLATFORM_ORDER.map((p) => {
            const active = filters.platforms.has(p);
            return (
              <button
                key={p}
                type="button"
                onClick={() => togglePlatform(p)}
                className={cn(
                  "rounded-full border px-3 py-1 font-sans text-xs transition-colors",
                  active
                    ? "border-ink bg-ink text-bone"
                    : "border-hairline text-ink-soft hover:border-ink hover:text-ink",
                )}
              >
                {PLATFORM_LABELS[p]}
              </button>
            );
          })}
        </div>

        {/* Funnel pills */}
        <div className="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-2">
          <span className="mr-1 font-mono text-[10px] uppercase tracking-[0.22em] text-stone">
            Stage
          </span>
          <button
            type="button"
            onClick={() => setFilters((f) => ({ ...f, funnel: "all" }))}
            className={cn(
              "rounded-full border px-2.5 py-1 font-sans text-xs transition-colors",
              filters.funnel === "all"
                ? "border-forest bg-forest text-bone"
                : "border-hairline text-ink-soft hover:border-forest hover:text-forest",
            )}
          >
            All stages
          </button>
          {FUNNEL_ORDER.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilters((f) => ({ ...f, funnel: s }))}
              className={cn(
                "rounded-full border px-2.5 py-1 font-sans text-xs transition-colors",
                filters.funnel === s
                  ? "border-forest bg-forest text-bone"
                  : "border-hairline text-ink-soft hover:border-forest hover:text-forest",
              )}
            >
              {FUNNEL_LABELS[s]}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone tabular-nums">
              {resultsCount.toLocaleString()} of {totalCount.toLocaleString()} ads
            </span>
            {hasActiveFilter && (
              <button
                type="button"
                onClick={onClearAll}
                className="font-mono text-[10px] uppercase tracking-[0.22em] text-clay hover:text-ink"
              >
                Clear all
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onPrint}
              className="inline-flex items-center gap-1.5 rounded-full border border-hairline px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft transition-colors hover:border-ink hover:text-ink"
            >
              <Printer className="h-3 w-3" strokeWidth={1.5} />
              Print / PDF
            </button>
            <button
              type="button"
              onClick={onExportCsv}
              className="inline-flex items-center gap-1.5 rounded-full border border-hairline px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft transition-colors hover:border-ink hover:text-ink"
            >
              <Download className="h-3 w-3" strokeWidth={1.5} />
              .csv
            </button>
            <button
              type="button"
              onClick={onOpenShortcuts}
              className="inline-flex items-center gap-1.5 rounded-full border border-hairline px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft transition-colors hover:border-ink hover:text-ink"
              aria-label="Shortcuts"
            >
              <Keyboard className="h-3 w-3" strokeWidth={1.5} />
              Shortcuts
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
