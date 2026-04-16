"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Circle,
  Plus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "@/lib/cn";
import {
  type ContentIdea,
  type Format,
  type Pillar,
  type Platform,
  FORMAT_LABELS,
  FORMATS,
  PILLAR_COLORS,
  PILLAR_LABELS,
  PILLARS,
  PLATFORM_LABELS,
  PLATFORMS,
} from "@/lib/data/content-ideas";
import type { CalendarState, ScheduledPost, WeekStart } from "./calendar-app";

const WEEKS_TO_SHOW = 13;

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

function formatMonthYear(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function getDayNumber(iso: string): number {
  return parseInt(iso.slice(8, 10), 10);
}

function getMonthKey(iso: string): string {
  return iso.slice(0, 7);
}

function useMediaQuery(q: string): boolean {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia(q);
    const handler = () => setMatches(mql.matches);
    handler();
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [q]);
  return matches;
}

type CalendarStats = {
  thisWeek: number;
  thisMonth: number;
  byPillar: Record<Pillar, number>;
  gaps: number;
  total: number;
};

export function CalendarView({
  ideas,
  state,
  stats,
  onSetStartDate,
  onSetWeekStart,
  onAddPost,
  onAddFromIdea,
  onUpdatePost,
  onDeletePost,
  onMovePost,
  onSeed,
}: {
  ideas: ContentIdea[];
  state: CalendarState;
  stats: CalendarStats;
  onSetStartDate: (iso: string) => void;
  onSetWeekStart: (ws: WeekStart) => void;
  onAddPost: (post: Omit<ScheduledPost, "id">) => void;
  onAddFromIdea: (idea: ContentIdea, dateISO: string) => void;
  onUpdatePost: (id: string, patch: Partial<ScheduledPost>) => void;
  onDeletePost: (id: string) => void;
  onMovePost: (id: string, dateISO: string) => void;
  onSeed: () => void;
}) {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [addingAt, setAddingAt] = useState<string | null>(null);
  const [editing, setEditing] = useState<ScheduledPost | null>(null);
  const [expandedWeek, setExpandedWeek] = useState<number>(0);

  // Group posts by date for quick lookup.
  const postsByDate = useMemo(() => {
    const map: Record<string, ScheduledPost[]> = {};
    for (const p of state.posts) {
      (map[p.scheduledDate] ||= []).push(p);
    }
    return map;
  }, [state.posts]);

  // 13 weeks of days (7 * 13 = 91).
  const weeks: string[][] = useMemo(() => {
    const out: string[][] = [];
    for (let w = 0; w < WEEKS_TO_SHOW; w++) {
      const wk: string[] = [];
      for (let d = 0; d < 7; d++) {
        wk.push(addDaysISO(state.startDate, w * 7 + d));
      }
      out.push(wk);
    }
    return out;
  }, [state.startDate]);

  const weekDayLabels = useMemo(() => {
    const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return state.weekStart === "sun" ? labels : [...labels.slice(1), "Sun"];
  }, [state.weekStart]);

  const visibleRangeLabel = useMemo(() => {
    const first = state.startDate;
    const last = weeks[weeks.length - 1][6];
    return `${new Date(first + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${new Date(last + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
  }, [state.startDate, weeks]);

  // Mobile: only render one week at a time, with a selector.
  if (isMobile) {
    return (
      <div className="pb-24">
        <StatsRow state={state} stats={stats} />

        <div className="mt-6 mb-4 flex items-center justify-between gap-2">
          <button
            onClick={() => onSetStartDate(addDaysISO(state.startDate, -7))}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-hairline bg-bone text-ink-soft hover:border-ink hover:text-ink"
            aria-label="Previous week"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="text-center">
            <p className="font-display text-lg leading-tight tracking-tight text-ink">
              {visibleRangeLabel}
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
              13-week plan
            </p>
          </div>
          <button
            onClick={() => onSetStartDate(addDaysISO(state.startDate, 7))}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-hairline bg-bone text-ink-soft hover:border-ink hover:text-ink"
            aria-label="Next week"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-2">
          {weeks.map((wk, i) => (
            <MobileWeekAccordion
              key={wk[0]}
              days={wk}
              weekNumber={i + 1}
              expanded={i === expandedWeek}
              onToggle={() => setExpandedWeek(i === expandedWeek ? -1 : i)}
              postsByDate={postsByDate}
              onAddAt={setAddingAt}
              onEdit={setEditing}
            />
          ))}
        </div>

        {addingAt && (
          <AddPostModal
            dateISO={addingAt}
            ideas={ideas}
            onClose={() => setAddingAt(null)}
            onConfirm={(post) => {
              onAddPost(post);
              setAddingAt(null);
            }}
          />
        )}
        {editing && (
          <EditPostDrawer
            post={editing}
            onClose={() => setEditing(null)}
            onSave={(patch) => {
              onUpdatePost(editing.id, patch);
              setEditing(null);
            }}
            onDelete={() => {
              onDeletePost(editing.id);
              setEditing(null);
            }}
          />
        )}
      </div>
    );
  }

  // Desktop grid.
  return (
    <div className="pb-16 print:pb-0">
      <StatsRow state={state} stats={stats} />

      {/* Nav row */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSetStartDate(addDaysISO(state.startDate, -7))}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-hairline bg-bone text-ink-soft transition-colors hover:border-ink hover:text-ink"
            aria-label="Previous week"
            title="Previous week (←)"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => onSetStartDate(addDaysISO(state.startDate, 7))}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-hairline bg-bone text-ink-soft transition-colors hover:border-ink hover:text-ink"
            aria-label="Next week"
            title="Next week (→)"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => onSetStartDate(todayISO())}
            className="rounded-full border border-hairline bg-bone px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft transition-colors hover:border-ink hover:text-ink"
            title="Jump to today (T)"
          >
            Today
          </button>
          <p className="ml-3 font-display text-xl leading-tight tracking-tight text-ink">
            {visibleRangeLabel}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
            Week starts
          </span>
          <div className="inline-flex rounded-full border border-hairline bg-bone p-0.5">
            <button
              onClick={() => onSetWeekStart("sun")}
              className={cn(
                "rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors",
                state.weekStart === "sun"
                  ? "bg-ink text-bone"
                  : "text-ink-soft hover:text-ink",
              )}
            >
              Sun
            </button>
            <button
              onClick={() => onSetWeekStart("mon")}
              className={cn(
                "rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors",
                state.weekStart === "mon"
                  ? "bg-ink text-bone"
                  : "text-ink-soft hover:text-ink",
              )}
            >
              Mon
            </button>
          </div>
        </div>
      </div>

      {/* Empty state */}
      {state.posts.length === 0 && (
        <div className="mt-8 rounded border border-dashed border-hairline bg-bone/60 px-8 py-10 text-center print:hidden">
          <p className="font-display text-2xl leading-tight tracking-tight text-ink">
            A blank ninety days.
          </p>
          <p className="mt-2 max-w-md mx-auto font-sans text-sm leading-relaxed text-ink-soft">
            Click any day cell to add a post, drag ideas from the Library tab,
            or seed a realistic month to start from.
          </p>
          <button
            onClick={onSeed}
            className="mt-5 inline-flex items-center gap-2 rounded-full border border-clay bg-clay/5 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-clay transition-colors hover:bg-clay/10"
          >
            <Sparkles className="h-3 w-3" />
            Seed 30-day sample plan
          </button>
        </div>
      )}

      {/* Weekday header */}
      <div className="mt-6 grid grid-cols-[48px_repeat(7,minmax(0,1fr))] gap-px border-b border-hairline pb-2">
        <div />
        {weekDayLabels.map((label) => (
          <div
            key={label}
            className="text-center font-mono text-[10px] uppercase tracking-[0.22em] text-stone"
          >
            {label}
          </div>
        ))}
      </div>

      {/* Week rows */}
      <div className="mt-px divide-y divide-hairline-soft">
        {weeks.map((wk, weekIdx) => {
          const weekPosts = wk.reduce(
            (acc, d) => acc + (postsByDate[d]?.length ?? 0),
            0,
          );
          // Month transition: show header row if this week crosses a month boundary.
          const prevMonthKey = weekIdx === 0 ? null : getMonthKey(weeks[weekIdx - 1][0]);
          const currMonthKey = getMonthKey(wk[0]);
          const showMonthDivider =
            weekIdx === 0 || prevMonthKey !== currMonthKey;
          return (
            <div key={wk[0]}>
              {showMonthDivider && (
                <div className="grid grid-cols-[48px_repeat(7,minmax(0,1fr))] items-center gap-px pt-4 pb-1">
                  <div />
                  <div className="col-span-7 flex items-baseline gap-3">
                    <span className="font-display text-sm italic leading-none tracking-tight text-forest">
                      {formatMonthYear(wk[0])}
                    </span>
                    <span className="hairline flex-1" />
                  </div>
                </div>
              )}
              <div className="grid grid-cols-[48px_repeat(7,minmax(0,1fr))] gap-px min-h-[96px] md:min-h-[120px]">
                <div className="flex flex-col items-center justify-start pt-3 text-center">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone tabular-nums">
                    W{weekIdx + 1}
                  </span>
                  <span
                    className={cn(
                      "mt-1 font-mono text-[10px] tabular-nums",
                      weekPosts === 0 ? "text-stone-light" : "text-ink",
                    )}
                  >
                    {weekPosts}
                  </span>
                </div>
                {wk.map((iso) => (
                  <DayCell
                    key={iso}
                    iso={iso}
                    posts={postsByDate[iso] || []}
                    onAdd={() => setAddingAt(iso)}
                    onEdit={setEditing}
                    onDropIdea={(ideaId) => {
                      const idea = ideas.find((i) => i.id === ideaId);
                      if (idea) onAddFromIdea(idea, iso);
                    }}
                    onDropPost={(postId) => {
                      const post = state.posts.find((p) => p.id === postId);
                      if (post && post.scheduledDate !== iso) {
                        onMovePost(postId, iso);
                      }
                    }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add modal */}
      {addingAt && (
        <AddPostModal
          dateISO={addingAt}
          ideas={ideas}
          onClose={() => setAddingAt(null)}
          onConfirm={(post) => {
            onAddPost(post);
            setAddingAt(null);
          }}
        />
      )}
      {/* Edit drawer */}
      {editing && (
        <EditPostDrawer
          post={editing}
          onClose={() => setEditing(null)}
          onSave={(patch) => {
            onUpdatePost(editing.id, patch);
            setEditing(null);
          }}
          onDelete={() => {
            onDeletePost(editing.id);
            setEditing(null);
          }}
        />
      )}

      <CalendarPrintStyles />
    </div>
  );
}

function StatsRow({ state, stats }: { state: CalendarState; stats: CalendarStats }) {
  return (
    <section className="grid gap-3 md:grid-cols-4">
      <StatTile label="This week" value={stats.thisWeek} />
      <StatTile label="This month" value={stats.thisMonth} />
      <StatTile
        label="Gap days (next 7)"
        value={stats.gaps}
        accent={stats.gaps > 3 ? "clay" : undefined}
      />
      <PillarBar byPillar={stats.byPillar} total={state.posts.length} />
    </section>
  );
}

function StatTile({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: "clay" | "forest";
}) {
  return (
    <div className="flex min-w-0 items-baseline justify-between gap-3 rounded border border-hairline bg-bone px-5 py-4">
      <span className="min-w-0 font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
        {label}
      </span>
      <span
        className={cn(
          "min-w-0 font-display text-[22px] leading-none tracking-tight tabular-nums md:text-[26px]",
          accent === "clay" ? "text-clay" : "text-ink",
        )}
      >
        {value}
      </span>
    </div>
  );
}

function PillarBar({
  byPillar,
  total,
}: {
  byPillar: Record<Pillar, number>;
  total: number;
}) {
  const denom = Math.max(total, 1);
  return (
    <div className="flex min-w-0 flex-col justify-between gap-2 rounded border border-hairline bg-bone px-5 py-4">
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
        Pillar spread
      </span>
      {total === 0 ? (
        <p className="font-sans text-xs italic text-stone-light">
          No posts scheduled yet.
        </p>
      ) : (
        <>
          <div className="flex h-2 w-full overflow-hidden rounded-full bg-paper">
            {PILLARS.map((p) => {
              const n = byPillar[p];
              if (n === 0) return null;
              const pct = (n / denom) * 100;
              return (
                <span
                  key={p}
                  className="h-full"
                  style={{ width: `${pct}%`, backgroundColor: PILLAR_COLORS[p] }}
                  title={`${PILLAR_LABELS[p]}: ${n}`}
                />
              );
            })}
          </div>
          <div className="flex min-w-0 flex-wrap gap-x-3 gap-y-1 font-mono text-[9px] uppercase tracking-[0.16em] text-stone">
            {PILLARS.filter((p) => byPillar[p] > 0).map((p) => (
              <span key={p} className="inline-flex items-center gap-1.5">
                <span
                  className="inline-block h-1 w-1 rounded-full"
                  style={{ backgroundColor: PILLAR_COLORS[p] }}
                />
                {PILLAR_LABELS[p]} · <span className="tabular-nums">{byPillar[p]}</span>
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function DayCell({
  iso,
  posts,
  onAdd,
  onEdit,
  onDropIdea,
  onDropPost,
}: {
  iso: string;
  posts: ScheduledPost[];
  onAdd: () => void;
  onEdit: (p: ScheduledPost) => void;
  onDropIdea: (ideaId: string) => void;
  onDropPost: (postId: string) => void;
}) {
  const [hover, setHover] = useState(false);
  const today = todayISO();
  const isToday = iso === today;
  const isPast = iso < today;

  // Gap-day flag: no posts AND within next 7 days
  const daysFromToday = Math.floor(
    (new Date(iso + "T00:00:00").getTime() - new Date(today + "T00:00:00").getTime()) /
      (24 * 60 * 60 * 1000),
  );
  const isNearFuture = daysFromToday >= 0 && daysFromToday <= 7;
  const isGap = posts.length === 0 && isNearFuture && !isToday;

  return (
    <div
      onClick={(e) => {
        // Only trigger add if clicking the empty cell, not a pill
        if ((e.target as HTMLElement).dataset.addTrigger !== undefined) {
          onAdd();
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setHover(true);
      }}
      onDragLeave={() => setHover(false)}
      onDrop={(e) => {
        e.preventDefault();
        setHover(false);
        const ideaId = e.dataTransfer.getData("application/x-idea-id");
        const postId = e.dataTransfer.getData("application/x-post-id");
        if (ideaId) onDropIdea(ideaId);
        else if (postId) onDropPost(postId);
      }}
      className={cn(
        "group relative flex min-h-[96px] min-w-0 flex-col gap-1 rounded-sm border border-transparent p-2 transition-colors md:min-h-[120px]",
        hover && "border-forest bg-sage/10",
        isToday && "bg-clay/5 ring-1 ring-clay/40",
        isPast && !isToday && "opacity-55",
      )}
      data-add-trigger
    >
      <div className="flex items-center justify-between" data-add-trigger>
        <span
          className={cn(
            "font-mono text-xs tabular-nums md:text-sm",
            isToday ? "font-semibold text-clay" : "text-ink-soft",
          )}
          data-add-trigger
        >
          {getDayNumber(iso)}
        </span>
        {isGap && (
          <span
            className="h-1 w-1 rounded-full bg-stone-light"
            title="No posts scheduled this day"
          />
        )}
        {posts.length === 0 && !isPast && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAdd();
            }}
            className="flex h-5 w-5 items-center justify-center rounded-full text-stone-light opacity-0 transition-opacity hover:bg-paper hover:text-ink group-hover:opacity-100 print:hidden"
            aria-label="Add post"
          >
            <Plus className="h-3 w-3" />
          </button>
        )}
      </div>

      <div className="flex min-w-0 flex-col gap-1">
        {posts.slice(0, 4).map((p) => (
          <PostPill key={p.id} post={p} onClick={() => onEdit(p)} />
        ))}
        {posts.length > 4 && (
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-stone">
            +{posts.length - 4} more
          </span>
        )}
      </div>
    </div>
  );
}

function PostPill({
  post,
  onClick,
  compact,
}: {
  post: ScheduledPost;
  onClick?: () => void;
  compact?: boolean;
}) {
  const color = PILLAR_COLORS[post.pillar];
  const bg = `${color}14`; // ~8% alpha
  return (
    <button
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("application/x-post-id", post.id);
        e.dataTransfer.effectAllowed = "move";
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className={cn(
        "group/pill flex min-w-0 items-center gap-1.5 rounded-sm border px-1.5 py-1 text-left transition-colors",
        compact ? "py-0.5" : "",
      )}
      style={{
        backgroundColor: bg,
        borderColor: `${color}40`,
      }}
    >
      <span
        className="block h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span
        className={cn(
          "min-w-0 flex-1 truncate font-display leading-tight tracking-tight text-ink",
          compact ? "text-[11px]" : "text-xs md:text-[13px]",
        )}
      >
        {post.title}
      </span>
      {post.status === "scheduled" && (
        <Circle className="h-2 w-2 shrink-0" style={{ color }} />
      )}
      {post.status === "published" && (
        <svg
          className="h-2.5 w-2.5 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          strokeWidth={3}
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 12l6 6L20 6" />
        </svg>
      )}
    </button>
  );
}

function MobileWeekAccordion({
  days,
  weekNumber,
  expanded,
  onToggle,
  postsByDate,
  onAddAt,
  onEdit,
}: {
  days: string[];
  weekNumber: number;
  expanded: boolean;
  onToggle: () => void;
  postsByDate: Record<string, ScheduledPost[]>;
  onAddAt: (iso: string) => void;
  onEdit: (p: ScheduledPost) => void;
}) {
  const weekCount = days.reduce(
    (sum, d) => sum + (postsByDate[d]?.length ?? 0),
    0,
  );
  const label = `${new Date(days[0] + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${new Date(days[6] + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
  return (
    <div className="rounded border border-hairline bg-bone">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
            Week {weekNumber}
          </p>
          <p className="min-w-0 font-display text-sm tracking-tight text-ink">
            {label}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs tabular-nums text-ink-soft">
            {weekCount}
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-stone transition-transform",
              expanded && "rotate-180",
            )}
          />
        </div>
      </button>
      {expanded && (
        <div className="divide-y divide-hairline-soft">
          {days.map((iso) => {
            const posts = postsByDate[iso] || [];
            const isToday = iso === todayISO();
            return (
              <div
                key={iso}
                className={cn(
                  "px-4 py-3",
                  isToday && "bg-clay/5",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={cn(
                      "font-mono text-sm tabular-nums",
                      isToday ? "font-semibold text-clay" : "text-ink-soft",
                    )}
                  >
                    {new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <button
                    onClick={() => onAddAt(iso)}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-stone hover:bg-paper hover:text-ink"
                    aria-label="Add post"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                {posts.length > 0 && (
                  <div className="mt-2 flex flex-col gap-1.5">
                    {posts.map((p) => (
                      <PostPill key={p.id} post={p} onClick={() => onEdit(p)} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// --------- Modals & drawers ---------

function AddPostModal({
  dateISO,
  ideas,
  onClose,
  onConfirm,
}: {
  dateISO: string;
  ideas: ContentIdea[];
  onClose: () => void;
  onConfirm: (post: Omit<ScheduledPost, "id">) => void;
}) {
  const [title, setTitle] = useState("");
  const [platform, setPlatform] = useState<Platform>("twitter");
  const [pillar, setPillar] = useState<Pillar>("teach");
  const [format, setFormat] = useState<Format>("text");
  const [notes, setNotes] = useState("");
  const [ideaQuery, setIdeaQuery] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const dateLabel = new Date(dateISO + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const ideaMatches = useMemo(() => {
    if (!ideaQuery.trim()) return [];
    const q = ideaQuery.toLowerCase().trim();
    return ideas.filter((i) => i.title.toLowerCase().includes(q)).slice(0, 6);
  }, [ideaQuery, ideas]);

  const submit = () => {
    if (!title.trim()) return;
    onConfirm({
      title: title.trim(),
      platform,
      pillar,
      format,
      scheduledDate: dateISO,
      status: "draft",
      notes: notes.trim(),
    });
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-ink/40 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded border border-hairline bg-bone p-8 shadow-warm-lg"
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
          New post
        </span>
        <p className="mt-1 font-display text-lg leading-tight tracking-tight text-ink">
          {dateLabel}
        </p>

        <label className="mt-6 block">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
            Title
          </span>
          <input
            autoFocus
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setIdeaQuery(e.target.value);
            }}
            placeholder="What's the post about?"
            className="mt-2 w-full border-b border-hairline bg-transparent py-2 font-sans text-sm text-ink placeholder:text-stone-light focus:border-ink focus:outline-none"
          />
        </label>

        {ideaMatches.length > 0 && (
          <div className="mt-3 space-y-1 rounded border border-hairline-soft bg-paper/60 p-2">
            <p className="px-2 pt-1 font-mono text-[9px] uppercase tracking-[0.2em] text-stone">
              From the library
            </p>
            {ideaMatches.map((idea) => (
              <button
                key={idea.id}
                onClick={() => {
                  setTitle(idea.title);
                  setPlatform(idea.platform);
                  setPillar(idea.pillar);
                  setFormat(idea.format);
                  setIdeaQuery("");
                }}
                className="flex w-full min-w-0 items-center gap-2 rounded px-2 py-1.5 text-left transition-colors hover:bg-bone"
              >
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: PILLAR_COLORS[idea.pillar] }}
                />
                <span className="min-w-0 flex-1 truncate font-sans text-xs text-ink">
                  {idea.title}
                </span>
                <span className="shrink-0 font-mono text-[9px] uppercase tracking-[0.18em] text-stone">
                  {PLATFORM_LABELS[idea.platform]}
                </span>
              </button>
            ))}
          </div>
        )}

        <div className="mt-5 grid grid-cols-2 gap-4">
          <SelectLabel label="Platform">
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value as Platform)}
              className="w-full border-b border-hairline bg-transparent py-2 font-sans text-sm text-ink focus:border-ink focus:outline-none"
            >
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {PLATFORM_LABELS[p]}
                </option>
              ))}
            </select>
          </SelectLabel>
          <SelectLabel label="Pillar">
            <select
              value={pillar}
              onChange={(e) => setPillar(e.target.value as Pillar)}
              className="w-full border-b border-hairline bg-transparent py-2 font-sans text-sm text-ink focus:border-ink focus:outline-none"
            >
              {PILLARS.map((p) => (
                <option key={p} value={p}>
                  {PILLAR_LABELS[p]}
                </option>
              ))}
            </select>
          </SelectLabel>
          <SelectLabel label="Format">
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as Format)}
              className="w-full border-b border-hairline bg-transparent py-2 font-sans text-sm text-ink focus:border-ink focus:outline-none"
            >
              {FORMATS.map((f) => (
                <option key={f} value={f}>
                  {FORMAT_LABELS[f]}
                </option>
              ))}
            </select>
          </SelectLabel>
          <SelectLabel label="Date">
            <input
              type="date"
              value={dateISO}
              readOnly
              className="w-full border-b border-hairline bg-transparent py-2 font-sans text-sm text-ink"
            />
          </SelectLabel>
        </div>

        <label className="mt-5 block">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
            Notes
          </span>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional — hook angle, references, the thread structure…"
            className="mt-2 w-full resize-none border border-hairline bg-transparent p-3 font-sans text-sm leading-relaxed text-ink placeholder:text-stone-light focus:border-ink focus:outline-none"
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
            onClick={submit}
            disabled={!title.trim()}
            className="rounded-full bg-ink px-5 py-2 font-sans text-sm text-bone transition-colors hover:bg-forest disabled:opacity-40 disabled:hover:bg-ink"
          >
            Add to {new Date(dateISO + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </button>
        </div>
      </div>
    </div>
  );
}

function SelectLabel({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
        {label}
      </span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

function EditPostDrawer({
  post,
  onClose,
  onSave,
  onDelete,
}: {
  post: ScheduledPost;
  onClose: () => void;
  onSave: (patch: Partial<ScheduledPost>) => void;
  onDelete: () => void;
}) {
  const [draft, setDraft] = useState<ScheduledPost>(post);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-40 flex items-stretch justify-end bg-ink/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md overflow-y-auto border-l border-hairline bg-bone p-8 shadow-warm-lg"
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
          Edit post
        </span>

        <label className="mt-4 block">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
            Title
          </span>
          <textarea
            rows={2}
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            className="mt-2 w-full resize-none border-b border-hairline bg-transparent py-2 font-display text-lg leading-snug tracking-tight text-ink focus:border-ink focus:outline-none"
          />
        </label>

        <div className="mt-5 grid grid-cols-2 gap-4">
          <SelectLabel label="Date">
            <input
              type="date"
              value={draft.scheduledDate}
              onChange={(e) => setDraft({ ...draft, scheduledDate: e.target.value })}
              className="w-full border-b border-hairline bg-transparent py-2 font-sans text-sm text-ink focus:border-ink focus:outline-none"
            />
          </SelectLabel>
          <SelectLabel label="Status">
            <select
              value={draft.status}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  status: e.target.value as ScheduledPost["status"],
                })
              }
              className="w-full border-b border-hairline bg-transparent py-2 font-sans text-sm text-ink focus:border-ink focus:outline-none"
            >
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="published">Published</option>
            </select>
          </SelectLabel>
          <SelectLabel label="Platform">
            <select
              value={draft.platform}
              onChange={(e) =>
                setDraft({ ...draft, platform: e.target.value as Platform })
              }
              className="w-full border-b border-hairline bg-transparent py-2 font-sans text-sm text-ink focus:border-ink focus:outline-none"
            >
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {PLATFORM_LABELS[p]}
                </option>
              ))}
            </select>
          </SelectLabel>
          <SelectLabel label="Pillar">
            <select
              value={draft.pillar}
              onChange={(e) =>
                setDraft({ ...draft, pillar: e.target.value as Pillar })
              }
              className="w-full border-b border-hairline bg-transparent py-2 font-sans text-sm text-ink focus:border-ink focus:outline-none"
            >
              {PILLARS.map((p) => (
                <option key={p} value={p}>
                  {PILLAR_LABELS[p]}
                </option>
              ))}
            </select>
          </SelectLabel>
          <SelectLabel label="Format">
            <select
              value={draft.format}
              onChange={(e) => setDraft({ ...draft, format: e.target.value as Format })}
              className="w-full border-b border-hairline bg-transparent py-2 font-sans text-sm text-ink focus:border-ink focus:outline-none"
            >
              {FORMATS.map((f) => (
                <option key={f} value={f}>
                  {FORMAT_LABELS[f]}
                </option>
              ))}
            </select>
          </SelectLabel>
        </div>

        {draft.hookIdea && (
          <div className="mt-6 rounded border border-hairline-soft bg-paper/40 p-3">
            <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-stone">
              Hook idea
            </p>
            <p className="mt-1 font-sans text-xs italic leading-relaxed text-ink-soft">
              {draft.hookIdea}
            </p>
          </div>
        )}
        {draft.ctaIdea && (
          <div className="mt-3 rounded border border-hairline-soft bg-paper/40 p-3">
            <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-stone">
              CTA idea
            </p>
            <p className="mt-1 font-sans text-xs leading-relaxed text-ink-soft">
              {draft.ctaIdea}
            </p>
          </div>
        )}

        <label className="mt-6 block">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
            Notes
          </span>
          <textarea
            rows={4}
            value={draft.notes}
            onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
            className="mt-2 w-full resize-none border border-hairline bg-transparent p-3 font-sans text-sm leading-relaxed text-ink focus:border-ink focus:outline-none"
          />
        </label>

        <div className="mt-8 flex items-center justify-between gap-2">
          <button
            onClick={onDelete}
            className="inline-flex items-center gap-1.5 rounded-full border border-hairline px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-stone transition-colors hover:border-clay hover:text-clay"
          >
            <Trash2 className="h-3 w-3" />
            Delete
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-full border border-hairline px-4 py-2 font-sans text-sm text-ink-soft transition-colors hover:border-ink hover:text-ink"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(draft)}
              className="rounded-full bg-ink px-5 py-2 font-sans text-sm text-bone transition-colors hover:bg-forest"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CalendarPrintStyles() {
  return (
    <style>{`
      @media print {
        @page { margin: 0.5in; size: landscape; }
        body { background: white !important; }
        .print\\:hidden { display: none !important; }
        .print\\:pb-0 { padding-bottom: 0 !important; }
        header, nav, aside { display: none !important; }
      }
    `}</style>
  );
}
