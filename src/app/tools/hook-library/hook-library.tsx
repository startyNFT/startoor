"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Check,
  Copy,
  Download,
  HelpCircle,
  Keyboard,
  Search,
  Shuffle,
  Star,
  X,
} from "lucide-react";
import { cn } from "@/lib/cn";
import {
  type Hook,
  type HookLength,
  type HookPattern,
  type HookPlatform,
  type HookVertical,
  PATTERN_LABELS,
  PLATFORM_LABELS,
  VERTICAL_LABELS,
} from "@/lib/data/hooks";
import { SwipeMode } from "./swipe-mode";

const FAVORITES_KEY = "startoor_hook_favorites_v1";

type SortMode = "random" | "length" | "platform";

const PLATFORM_ORDER: HookPlatform[] = [
  "twitter",
  "linkedin",
  "youtube",
  "newsletter",
  "cold-email",
  "tiktok",
];

const PATTERN_ORDER: HookPattern[] = [
  "curiosity-gap",
  "contrarian",
  "stat-reveal",
  "specific-number",
  "callback-promise",
  "pattern-interrupt",
  "story-open",
  "false-consensus",
  "problem-declaration",
  "stakes-raise",
  "authority-stack",
  "concrete-image",
  "time-bound",
  "enemy-callout",
  "reversal",
];

const VERTICAL_ORDER: HookVertical[] = [
  "saas",
  "creator",
  "b2b",
  "dtc",
  "agency",
  "education",
  "fitness",
  "finance",
];

const LENGTH_ORDER: HookLength[] = ["short", "medium", "long"];

type Filters = {
  query: string;
  platforms: Set<HookPlatform>;
  patterns: Set<HookPattern>;
  vertical: HookVertical | "all";
  length: HookLength | "all";
  sort: SortMode;
  favoritesOnly: boolean;
};

function defaultFilters(): Filters {
  return {
    query: "",
    platforms: new Set<HookPlatform>(),
    patterns: new Set<HookPattern>(),
    vertical: "all",
    length: "all",
    sort: "random",
    favoritesOnly: false,
  };
}

// Stable seeded shuffle so "random" feels curated on first load.
function seededShuffle<T>(arr: T[], seed = 42): T[] {
  const out = [...arr];
  let s = seed;
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function HookLibrary({ hooks }: { hooks: Hook[] }) {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [swipeOpen, setSwipeOpen] = useState(false);
  const [swipeIndex, setSwipeIndex] = useState(0);
  const [helpOpen, setHelpOpen] = useState(false);
  const [shuffleSeed, setShuffleSeed] = useState(42);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate favorites.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(FAVORITES_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as string[];
        setFavorites(new Set(parsed));
      }
    } catch {}
    setHydrated(true);
  }, []);

  // Persist favorites.
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites]));
    } catch {}
  }, [favorites, hydrated]);

  // Debounce query.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(filters.query.trim().toLowerCase()), 180);
    return () => clearTimeout(t);
  }, [filters.query]);

  // Keyboard: "?" help, "/" focus search, "s" open swipe from results list
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (swipeOpen) return; // swipe-mode owns its keys
      const target = e.target as HTMLElement | null;
      const inField =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable);
      if (inField) {
        if (e.key === "Escape" && target?.tagName === "INPUT") {
          (target as HTMLInputElement).blur();
        }
        return;
      }
      if (e.key === "?" || (e.shiftKey && e.key === "/")) {
        e.preventDefault();
        setHelpOpen((v) => !v);
      } else if (e.key === "/") {
        e.preventDefault();
        const el = document.getElementById("hook-search");
        el?.focus();
      } else if (e.key === "s" || e.key === "S") {
        e.preventDefault();
        setSwipeIndex(0);
        setSwipeOpen(true);
      } else if (e.key === "Escape") {
        setHelpOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [swipeOpen]);

  const results = useMemo(() => {
    let out = hooks;

    if (debouncedQuery) {
      out = out.filter((h) => {
        return (
          h.hook.toLowerCase().includes(debouncedQuery) ||
          h.annotation.toLowerCase().includes(debouncedQuery) ||
          h.pattern.includes(debouncedQuery) ||
          h.platform.includes(debouncedQuery) ||
          (h.vertical ?? "").includes(debouncedQuery)
        );
      });
    }
    if (filters.platforms.size) {
      out = out.filter((h) => filters.platforms.has(h.platform));
    }
    if (filters.patterns.size) {
      out = out.filter((h) => filters.patterns.has(h.pattern));
    }
    if (filters.vertical !== "all") {
      out = out.filter((h) => h.vertical === filters.vertical);
    }
    if (filters.length !== "all") {
      out = out.filter((h) => h.length === filters.length);
    }
    if (filters.favoritesOnly) {
      out = out.filter((h) => favorites.has(h.id));
    }

    if (filters.sort === "random") {
      out = seededShuffle(out, shuffleSeed);
    } else if (filters.sort === "length") {
      const order: HookLength[] = ["short", "medium", "long"];
      out = [...out].sort(
        (a, b) => order.indexOf(a.length) - order.indexOf(b.length) || a.id.localeCompare(b.id),
      );
    } else if (filters.sort === "platform") {
      out = [...out].sort(
        (a, b) =>
          PLATFORM_ORDER.indexOf(a.platform) - PLATFORM_ORDER.indexOf(b.platform) ||
          a.id.localeCompare(b.id),
      );
    }

    return out;
  }, [
    hooks,
    debouncedQuery,
    filters.platforms,
    filters.patterns,
    filters.vertical,
    filters.length,
    filters.sort,
    filters.favoritesOnly,
    favorites,
    shuffleSeed,
  ]);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const copy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId((curr) => (curr === id ? null : curr)), 1200);
      toast.success("Copied", {
        description: text.length > 60 ? text.slice(0, 60) + "…" : text,
      });
    } catch {
      toast.error("Couldn't copy to clipboard");
    }
  };

  const togglePlatform = (p: HookPlatform) => {
    setFilters((f) => {
      const next = new Set(f.platforms);
      if (next.has(p)) next.delete(p);
      else next.add(p);
      return { ...f, platforms: next };
    });
  };
  const togglePattern = (p: HookPattern) => {
    setFilters((f) => {
      const next = new Set(f.patterns);
      if (next.has(p)) next.delete(p);
      else next.add(p);
      return { ...f, patterns: next };
    });
  };

  const clearAll = () => {
    setFilters(defaultFilters());
    toast.message("Filters cleared.");
  };

  const exportCsv = () => {
    const rows = [["id", "platform", "pattern", "vertical", "length", "hook", "annotation"]];
    for (const h of results) {
      rows.push([
        h.id,
        h.platform,
        h.pattern,
        h.vertical ?? "",
        h.length,
        csvEscape(h.hook),
        csvEscape(h.annotation),
      ]);
    }
    const csv = rows.map((r) => r.join(",")).join("\n");
    downloadBlob(csv, "text/csv;charset=utf-8", "startoor-hooks.csv");
    toast.success(`Exported ${results.length} hooks as CSV`);
  };

  const exportTxt = () => {
    const txt = results.map((h) => h.hook).join("\n");
    downloadBlob(txt, "text/plain;charset=utf-8", "startoor-hooks.txt");
    toast.success(`Exported ${results.length} hooks as .txt`);
  };

  const openSwipe = (startIndex = 0) => {
    if (!results.length) {
      toast.error("No hooks to swipe through. Loosen your filters.");
      return;
    }
    setSwipeIndex(startIndex);
    setSwipeOpen(true);
  };

  const countText = `${results.length.toLocaleString()} of ${hooks.length.toLocaleString()} hooks`;

  return (
    <div className="relative">
      {/* Sticky toolbar */}
      <div className="sticky top-14 z-30 border-b border-hairline bg-paper/95 backdrop-blur supports-[backdrop-filter]:bg-paper/80">
        <div className="mx-auto max-w-7xl px-6 py-4 md:px-10">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[220px]">
              <label htmlFor="hook-search" className="block font-mono text-[10px] uppercase tracking-[0.22em] text-stone">
                Search · press /
              </label>
              <div className="mt-1.5 flex items-center gap-2 border-b border-hairline focus-within:border-ink">
                <Search className="h-3.5 w-3.5 text-stone" strokeWidth={1.5} />
                <input
                  id="hook-search"
                  value={filters.query}
                  onChange={(e) => setFilters((f) => ({ ...f, query: e.target.value }))}
                  placeholder="words, patterns, platforms…"
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
                  setFilters((f) => ({ ...f, vertical: e.target.value as HookVertical | "all" }))
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
                Length
              </span>
              <select
                value={filters.length}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, length: e.target.value as HookLength | "all" }))
                }
                className="mt-1.5 border-b border-hairline bg-transparent py-2 font-sans text-sm text-ink focus:border-ink focus:outline-none"
              >
                <option value="all">Any length</option>
                {LENGTH_ORDER.map((l) => (
                  <option key={l} value={l}>
                    {l[0].toUpperCase() + l.slice(1)}
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
                <option value="length">By length</option>
                <option value="platform">By platform</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShuffleSeed((s) => s + 1)}
                className="group inline-flex items-center gap-2 rounded-full border border-hairline px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft transition-colors hover:border-ink hover:text-ink"
                aria-label="Reshuffle"
              >
                <Shuffle className="h-3 w-3 transition-transform group-hover:rotate-12" strokeWidth={1.5} />
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
                <Star className="h-3 w-3" strokeWidth={1.5} fill={filters.favoritesOnly ? "currentColor" : "none"} />
                Saved · {favorites.size}
              </button>
            </div>
          </div>

          {/* Chips row */}
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
          <div className="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-2">
            <span className="mr-1 font-mono text-[10px] uppercase tracking-[0.22em] text-stone">
              Pattern
            </span>
            {PATTERN_ORDER.map((p) => {
              const active = filters.patterns.has(p);
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => togglePattern(p)}
                  className={cn(
                    "rounded-full border px-2.5 py-1 font-sans text-xs transition-colors",
                    active
                      ? "border-forest bg-forest text-bone"
                      : "border-hairline text-ink-soft hover:border-forest hover:text-forest",
                  )}
                >
                  {PATTERN_LABELS[p]}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone tabular-nums">
                {countText}
              </span>
              {(filters.platforms.size ||
                filters.patterns.size ||
                filters.vertical !== "all" ||
                filters.length !== "all" ||
                filters.favoritesOnly ||
                filters.query) && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="font-mono text-[10px] uppercase tracking-[0.22em] text-clay hover:text-ink"
                >
                  Clear all
                </button>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => openSwipe(0)}
                className="group inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 font-sans text-sm text-bone transition-colors hover:bg-forest"
              >
                <span>Swipe mode</span>
                <span className="transition-transform group-hover:translate-x-0.5">→</span>
              </button>
              <button
                type="button"
                onClick={exportTxt}
                className="inline-flex items-center gap-1.5 rounded-full border border-hairline px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft transition-colors hover:border-ink hover:text-ink"
              >
                <Download className="h-3 w-3" strokeWidth={1.5} />
                .txt
              </button>
              <button
                type="button"
                onClick={exportCsv}
                className="inline-flex items-center gap-1.5 rounded-full border border-hairline px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft transition-colors hover:border-ink hover:text-ink"
              >
                <Download className="h-3 w-3" strokeWidth={1.5} />
                .csv
              </button>
              <button
                type="button"
                onClick={() => setHelpOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-full border border-hairline px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft transition-colors hover:border-ink hover:text-ink"
                aria-label="Keyboard shortcuts"
              >
                <Keyboard className="h-3 w-3" strokeWidth={1.5} />
                Shortcuts
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mx-auto max-w-7xl px-6 py-10 md:px-10 md:py-14">
        {results.length === 0 ? (
          <EmptyState onReset={clearAll} />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {results.map((hook, idx) => (
              <HookCard
                key={hook.id}
                hook={hook}
                index={idx}
                saved={favorites.has(hook.id)}
                copied={copiedId === hook.id}
                onCopy={() => copy(hook.hook, hook.id)}
                onToggleSave={() => toggleFavorite(hook.id)}
                onOpenSwipe={() => openSwipe(idx)}
              />
            ))}
          </div>
        )}
      </div>

      {helpOpen && <ShortcutsPanel onClose={() => setHelpOpen(false)} />}

      {swipeOpen && (
        <SwipeMode
          hooks={results}
          startIndex={Math.min(swipeIndex, Math.max(0, results.length - 1))}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          onCopy={copy}
          onClose={() => setSwipeOpen(false)}
        />
      )}
    </div>
  );
}

// ------------- Hook card -------------

function HookCard({
  hook,
  index,
  saved,
  copied,
  onCopy,
  onToggleSave,
  onOpenSwipe,
}: {
  hook: Hook;
  index: number;
  saved: boolean;
  copied: boolean;
  onCopy: () => void;
  onToggleSave: () => void;
  onOpenSwipe: () => void;
}) {
  const stampClass =
    index % 3 === 0 ? "" : index % 3 === 1 ? "stamp-rotate-1" : "stamp-rotate-3";

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden bg-bone p-6 shadow-warm-xs transition-shadow hover:shadow-warm-sm md:p-7",
        "before:absolute before:inset-x-0 before:top-0 before:h-[2px] before:bg-gradient-to-r",
        "before:from-hairline before:via-transparent before:to-transparent",
      )}
      style={{ animation: `fade-up 0.6s cubic-bezier(0.2, 0.7, 0.2, 1) backwards`, animationDelay: `${Math.min(index, 20) * 18}ms` }}
    >
      <div className={cn("flex items-center justify-between gap-3", stampClass)}>
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone">
          №{" "}
          <span className="tabular-nums">{hook.id.split("-")[1]}</span>
          {"  ·  "}
          <span className="text-clay">{PLATFORM_LABELS[hook.platform]}</span>
        </span>
        <button
          type="button"
          onClick={onToggleSave}
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-full transition-colors",
            saved ? "text-clay" : "text-stone hover:text-ink",
          )}
          aria-label={saved ? "Unsave" : "Save"}
        >
          <Star className="h-3.5 w-3.5" strokeWidth={1.5} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>

      <p className="mt-5 font-display text-[1.55rem] leading-[1.15] tracking-tight text-ink md:text-[1.7rem]">
        {hook.hook}
      </p>

      <p className="mt-5 border-t border-hairline-soft pt-4 font-display text-sm italic leading-relaxed text-stone">
        {hook.annotation}
      </p>

      <div className="mt-5 flex items-center justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.18em] text-stone">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span>{PATTERN_LABELS[hook.pattern]}</span>
          <span className="text-stone-light">·</span>
          <span>{hook.length}</span>
          {hook.vertical && (
            <>
              <span className="text-stone-light">·</span>
              <span>{VERTICAL_LABELS[hook.vertical]}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onOpenSwipe}
            className="rounded-full px-2 py-1 text-ink-soft transition-colors hover:bg-paper hover:text-ink"
            title="Open in swipe mode"
          >
            Focus
          </button>
          <button
            type="button"
            onClick={onCopy}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 transition-colors",
              copied
                ? "bg-forest text-bone"
                : "text-ink-soft hover:bg-paper hover:text-ink",
            )}
          >
            {copied ? (
              <>
                <Check className="h-3 w-3" strokeWidth={2} />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" strokeWidth={1.5} />
                Copy
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}

// ------------- Empty -------------

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="mx-auto max-w-xl py-20 text-center">
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-clay">
        Silence on the wire
      </span>
      <h2 className="mt-3 font-display text-4xl leading-[1.05] tracking-tight text-ink">
        Nothing matches that combination.
      </h2>
      <p className="mt-4 font-sans text-base leading-relaxed text-ink-soft">
        Try loosening one filter, or clear everything and browse. The library is
        700 hooks deep — there's a line in here for what you're writing.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2 font-sans text-sm text-bone transition-colors hover:bg-forest"
      >
        Clear filters
      </button>
    </div>
  );
}

// ------------- Shortcuts -------------

function ShortcutsPanel({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md overflow-hidden bg-bone shadow-warm-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-hairline px-6 py-4">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-clay">
              Cheat sheet
            </span>
            <h3 className="mt-1 font-display text-2xl leading-tight tracking-tight text-ink">
              Keyboard shortcuts
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-stone hover:bg-paper hover:text-ink"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <dl className="divide-y divide-hairline-soft px-6 py-2 font-sans text-sm">
          <Row k="/" v="Focus search" />
          <Row k="?" v="Toggle this panel" />
          <Row k="S" v="Enter swipe mode" />
          <Row k="← → or J / K" v="Previous / next (swipe)" />
          <Row k="Space" v="Save / unsave (swipe)" />
          <Row k="C" v="Copy current hook (swipe)" />
          <Row k="Esc" v="Close swipe / panel" />
        </dl>
        <div className="border-t border-hairline bg-paper px-6 py-3 font-mono text-[10px] uppercase tracking-[0.22em] text-stone">
          Favorites save to this browser · no sign-in
        </div>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between py-3">
      <dt>
        <kbd className="rounded border border-hairline bg-paper px-2 py-0.5 font-mono text-xs text-ink">
          {k}
        </kbd>
      </dt>
      <dd className="text-ink-soft">{v}</dd>
    </div>
  );
}

// ------------- Helpers -------------

function csvEscape(v: string): string {
  if (v.includes(",") || v.includes('"') || v.includes("\n")) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

function downloadBlob(contents: string, type: string, filename: string) {
  const blob = new Blob([contents], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
