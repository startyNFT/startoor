"use client";

import { useEffect, useMemo, useState, type RefObject } from "react";
import { toast } from "sonner";
import {
  Bookmark,
  BookmarkCheck,
  CalendarPlus,
  PlusCircle,
  Search,
  Shuffle,
  X,
} from "lucide-react";
import { cn } from "@/lib/cn";
import {
  type ContentIdea,
  type Difficulty,
  type Format,
  type Pillar,
  type Platform,
  DIFFICULTIES,
  DIFFICULTY_LABELS,
  FORMAT_LABELS,
  PILLAR_COLORS,
  PILLAR_LABELS,
  PILLARS,
  PLATFORM_LABELS,
  PLATFORMS,
} from "@/lib/data/content-ideas";

function useDebounced<T>(value: T, delay = 180): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return v;
}

function todayISO(): string {
  const d = new Date();
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 10);
}

function addDaysISO(iso: string, days: number): string {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + days);
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 10);
}

type FormatFilter = Format | "all";

export function LibraryView({
  ideas,
  pinned,
  onTogglePinned,
  onAddToToday,
  onAddToDate,
  searchInputRef,
}: {
  ideas: ContentIdea[];
  pinned: string[];
  onTogglePinned: (ideaId: string) => void;
  onAddToToday: (idea: ContentIdea) => void;
  onAddToDate: (idea: ContentIdea, dateISO: string) => void;
  searchInputRef: RefObject<HTMLInputElement | null>;
}) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounced(query, 180);
  const [platforms, setPlatforms] = useState<Set<Platform>>(new Set());
  const [pillarsSel, setPillarsSel] = useState<Set<Pillar>>(new Set());
  const [formatSel, setFormatSel] = useState<FormatFilter>("all");
  const [difficultySel, setDifficultySel] = useState<Set<Difficulty>>(new Set());
  const [pinnedOnly, setPinnedOnly] = useState(false);
  const [scheduling, setScheduling] = useState<ContentIdea | null>(null);

  const filtered = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    return ideas.filter((idea) => {
      if (pinnedOnly && !pinned.includes(idea.id)) return false;
      if (platforms.size > 0 && !platforms.has(idea.platform)) return false;
      if (pillarsSel.size > 0 && !pillarsSel.has(idea.pillar)) return false;
      if (formatSel !== "all" && idea.format !== formatSel) return false;
      if (difficultySel.size > 0 && !difficultySel.has(idea.difficulty)) return false;
      if (q) {
        const hay = `${idea.title} ${idea.hook_idea ?? ""} ${idea.cta_idea ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [ideas, debouncedQuery, pinned, pinnedOnly, platforms, pillarsSel, formatSel, difficultySel]);

  const togglePlatform = (p: Platform) => {
    setPlatforms((s) => {
      const n = new Set(s);
      if (n.has(p)) n.delete(p);
      else n.add(p);
      return n;
    });
  };
  const togglePillar = (p: Pillar) => {
    setPillarsSel((s) => {
      const n = new Set(s);
      if (n.has(p)) n.delete(p);
      else n.add(p);
      return n;
    });
  };
  const toggleDifficulty = (d: Difficulty) => {
    setDifficultySel((s) => {
      const n = new Set(s);
      if (n.has(d)) n.delete(d);
      else n.add(d);
      return n;
    });
  };

  const activeFilterCount =
    platforms.size + pillarsSel.size + difficultySel.size + (formatSel !== "all" ? 1 : 0) + (pinnedOnly ? 1 : 0);

  const clearFilters = () => {
    setPlatforms(new Set());
    setPillarsSel(new Set());
    setFormatSel("all");
    setDifficultySel(new Set());
    setPinnedOnly(false);
  };

  const shuffleShow = () => {
    // Pick a random filtered idea and scroll to its card.
    if (filtered.length === 0) {
      toast.error("No ideas match your filters.");
      return;
    }
    const idea = filtered[Math.floor(Math.random() * filtered.length)];
    const el = document.getElementById(`idea-card-${idea.id}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("ring-2", "ring-clay");
      setTimeout(() => el.classList.remove("ring-2", "ring-clay"), 1200);
    }
  };

  return (
    <div className="relative">
      {/* Controls */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-3">
          <label className="relative flex min-w-0 flex-1 items-center">
            <Search className="pointer-events-none absolute left-4 h-4 w-4 text-stone" />
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search 400 ideas — try 'dashboard', 'pricing', or {competitor}…"
              className="h-11 w-full min-w-0 rounded-full border border-hairline bg-bone pl-11 pr-10 font-sans text-sm text-ink placeholder:text-stone-light focus:border-ink focus:outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 flex h-6 w-6 items-center justify-center rounded-full text-stone hover:bg-paper hover:text-ink"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </label>
          <button
            onClick={shuffleShow}
            className="inline-flex h-11 items-center gap-2 rounded-full border border-hairline bg-bone px-4 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft transition-colors hover:border-ink hover:text-ink"
          >
            <Shuffle className="h-3.5 w-3.5" />
            Surprise me
          </button>
          <button
            onClick={() => setPinnedOnly((v) => !v)}
            className={cn(
              "inline-flex h-11 items-center gap-2 rounded-full border px-4 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors",
              pinnedOnly
                ? "border-clay bg-clay/10 text-clay"
                : "border-hairline bg-bone text-ink-soft hover:border-ink hover:text-ink",
            )}
          >
            {pinnedOnly ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
            Pinned {pinnedOnly && pinned.length > 0 ? `· ${pinned.length}` : ""}
          </button>
        </div>

        {/* Chip rows */}
        <div className="mt-5 space-y-3">
          <ChipRow label="Platform">
            {PLATFORMS.map((p) => (
              <Chip
                key={p}
                active={platforms.has(p)}
                onClick={() => togglePlatform(p)}
                label={PLATFORM_LABELS[p]}
              />
            ))}
          </ChipRow>

          <ChipRow label="Pillar">
            {PILLARS.map((p) => (
              <Chip
                key={p}
                active={pillarsSel.has(p)}
                onClick={() => togglePillar(p)}
                label={PILLAR_LABELS[p]}
                color={PILLAR_COLORS[p]}
              />
            ))}
          </ChipRow>

          <ChipRow label="Difficulty">
            {DIFFICULTIES.map((d) => (
              <Chip
                key={d}
                active={difficultySel.has(d)}
                onClick={() => toggleDifficulty(d)}
                label={DIFFICULTY_LABELS[d]}
              />
            ))}
          </ChipRow>
        </div>

        <div className="mt-5 flex items-baseline justify-between gap-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone tabular-nums">
            {filtered.length} of {ideas.length} ideas
            {activeFilterCount > 0 && (
              <>
                {" "}
                <span className="mx-1 text-stone-light">·</span>{" "}
                <button
                  onClick={clearFilters}
                  className="text-clay underline-offset-2 hover:underline"
                >
                  clear {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""}
                </button>
              </>
            )}
          </p>
        </div>
      </div>

      {/* Cards grid */}
      {filtered.length === 0 ? (
        <div className="rounded border border-dashed border-hairline bg-bone/50 px-8 py-16 text-center">
          <p className="font-display text-2xl leading-tight tracking-tight text-ink">
            Nothing matches — yet.
          </p>
          <p className="mt-2 font-sans text-sm text-ink-soft">
            Try widening the filters or clearing the search.
          </p>
        </div>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((idea) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              isPinned={pinned.includes(idea.id)}
              onTogglePinned={onTogglePinned}
              onAddToToday={onAddToToday}
              onSchedule={(i) => setScheduling(i)}
            />
          ))}
        </ul>
      )}

      {/* Schedule drawer */}
      {scheduling && (
        <ScheduleModal
          idea={scheduling}
          onClose={() => setScheduling(null)}
          onConfirm={(dateISO) => {
            onAddToDate(scheduling, dateISO);
            setScheduling(null);
          }}
        />
      )}
    </div>
  );
}

function ChipRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 min-w-[60px] font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
        {label}
      </span>
      <div className="flex min-w-0 flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  label,
  color,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  color?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-sans text-xs transition-colors",
        active
          ? "border-ink bg-ink text-bone"
          : "border-hairline bg-bone text-ink-soft hover:border-ink hover:text-ink",
      )}
    >
      {color && (
        <span
          className="inline-block h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: color }}
        />
      )}
      <span>{label}</span>
    </button>
  );
}

function IdeaCard({
  idea,
  isPinned,
  onTogglePinned,
  onAddToToday,
  onSchedule,
}: {
  idea: ContentIdea;
  isPinned: boolean;
  onTogglePinned: (id: string) => void;
  onAddToToday: (idea: ContentIdea) => void;
  onSchedule: (idea: ContentIdea) => void;
}) {
  const color = PILLAR_COLORS[idea.pillar];
  return (
    <li
      id={`idea-card-${idea.id}`}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("application/x-idea-id", idea.id);
        e.dataTransfer.effectAllowed = "copy";
      }}
      className="group relative flex h-full flex-col rounded border border-hairline bg-bone p-5 transition-all hover:-translate-y-0.5 hover:border-ink hover:shadow-warm-sm"
    >
      {/* Top meta row */}
      <div className="flex min-w-0 items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className="inline-block h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ backgroundColor: color }}
          />
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone">
            {PLATFORM_LABELS[idea.platform]}
          </span>
          <span className="text-stone-light">·</span>
          <span
            className="truncate font-mono text-[10px] uppercase tracking-[0.18em]"
            style={{ color }}
          >
            {PILLAR_LABELS[idea.pillar]}
          </span>
        </div>
        <button
          onClick={() => onTogglePinned(idea.id)}
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors",
            isPinned
              ? "text-clay"
              : "text-stone-light opacity-0 hover:text-clay group-hover:opacity-100",
          )}
          aria-label={isPinned ? "Unpin" : "Pin"}
        >
          {isPinned ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
        </button>
      </div>

      {/* Title */}
      <p className="mt-3 min-w-0 font-display text-base leading-snug tracking-tight text-ink md:text-[17px]">
        {idea.title}
      </p>

      {/* Hook / CTA */}
      {(idea.hook_idea || idea.cta_idea) && (
        <dl className="mt-4 space-y-2 border-t border-hairline-soft pt-3">
          {idea.hook_idea && (
            <div className="flex min-w-0 gap-2">
              <dt className="shrink-0 font-mono text-[9px] uppercase tracking-[0.22em] text-stone">
                Hook
              </dt>
              <dd className="min-w-0 font-sans text-xs italic leading-relaxed text-ink-soft">
                {idea.hook_idea}
              </dd>
            </div>
          )}
          {idea.cta_idea && (
            <div className="flex min-w-0 gap-2">
              <dt className="shrink-0 font-mono text-[9px] uppercase tracking-[0.22em] text-stone">
                CTA
              </dt>
              <dd className="min-w-0 font-sans text-xs leading-relaxed text-ink-soft">
                {idea.cta_idea}
              </dd>
            </div>
          )}
        </dl>
      )}

      <div className="mt-5 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-stone">
          <span className="truncate">{FORMAT_LABELS[idea.format]}</span>
          <span className="text-stone-light">·</span>
          <span>{DIFFICULTY_LABELS[idea.difficulty].split(" ")[0]}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onAddToToday(idea)}
            className="inline-flex items-center gap-1 rounded-full border border-hairline px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft transition-colors hover:border-forest hover:text-forest"
            title="Add to today"
          >
            <PlusCircle className="h-3 w-3" />
            Today
          </button>
          <button
            onClick={() => onSchedule(idea)}
            className="inline-flex items-center gap-1 rounded-full border border-hairline px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft transition-colors hover:border-ink hover:text-ink"
            title="Pick a date"
          >
            <CalendarPlus className="h-3 w-3" />
            Schedule
          </button>
        </div>
      </div>
    </li>
  );
}

function ScheduleModal({
  idea,
  onClose,
  onConfirm,
}: {
  idea: ContentIdea;
  onClose: () => void;
  onConfirm: (dateISO: string) => void;
}) {
  const [dateISO, setDateISO] = useState<string>(addDaysISO(todayISO(), 1));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-ink/40 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded border border-hairline bg-bone p-8 shadow-warm-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-stone transition-colors hover:bg-paper hover:text-ink"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-clay">
          Schedule
        </span>
        <p className="mt-2 min-w-0 font-display text-xl leading-snug tracking-tight text-ink">
          {idea.title}
        </p>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-stone">
          {PLATFORM_LABELS[idea.platform]} · {PILLAR_LABELS[idea.pillar]} ·{" "}
          {FORMAT_LABELS[idea.format]}
        </p>

        <label className="mt-6 block">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
            Date
          </span>
          <input
            type="date"
            value={dateISO}
            onChange={(e) => setDateISO(e.target.value)}
            className="mt-2 w-full border-b border-hairline bg-transparent py-2 font-sans text-sm text-ink focus:border-ink focus:outline-none"
          />
        </label>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-full border border-hairline px-4 py-2 font-sans text-sm text-ink-soft transition-colors hover:border-ink hover:text-ink"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(dateISO)}
            className="rounded-full bg-ink px-5 py-2 font-sans text-sm text-bone transition-colors hover:bg-forest"
          >
            Schedule it
          </button>
        </div>
      </div>
    </div>
  );
}
