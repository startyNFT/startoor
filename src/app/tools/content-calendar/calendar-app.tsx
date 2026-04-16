"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  BookmarkIcon,
  CalendarRange,
  Download,
  Grid3x3,
  Library,
  Printer,
  Sparkles,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/cn";
import {
  type ContentIdea,
  type Difficulty,
  type Format,
  type Pillar,
  type Platform,
  PILLAR_LABELS,
  PLATFORM_LABELS,
} from "@/lib/data/content-ideas";
import { LibraryView } from "./library-view";
import { CalendarView } from "./calendar-view";
import { BatchingView } from "./batching-view";

const STORAGE_KEY = "startoor_calendar_v1";

export type WeekStart = "sun" | "mon";
export type PostStatus = "draft" | "scheduled" | "published";

export type ScheduledPost = {
  id: string;
  ideaId?: string;
  title: string;
  platform: Platform;
  pillar: Pillar;
  format: Format;
  difficulty?: Difficulty;
  scheduledDate: string; // ISO yyyy-mm-dd
  status: PostStatus;
  notes: string;
  hookIdea?: string;
  ctaIdea?: string;
};

export type CalendarState = {
  startDate: string; // ISO yyyy-mm-dd for the first visible week
  posts: ScheduledPost[];
  pinned: string[]; // idea ids
  batchingRules: Partial<Record<Weekday, Pillar>>;
  weekStart: WeekStart;
};

export const WEEKDAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
export type Weekday = (typeof WEEKDAYS)[number];
export const WEEKDAY_LABELS: Record<Weekday, string> = {
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
  sun: "Sun",
};

type Tab = "library" | "calendar" | "batching";

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

function startOfWeekISO(iso: string, weekStart: WeekStart): string {
  const d = new Date(iso + "T00:00:00");
  const dow = d.getDay(); // 0=Sun
  const offset = weekStart === "sun" ? dow : (dow + 6) % 7;
  return addDaysISO(iso, -offset);
}

function weekdayFromISO(iso: string): Weekday {
  const d = new Date(iso + "T00:00:00");
  const dow = d.getDay();
  // 0=Sun, 1=Mon...
  const map: Weekday[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  return map[dow];
}

function createInitialState(): CalendarState {
  const today = todayISO();
  return {
    startDate: startOfWeekISO(today, "mon"),
    posts: [],
    pinned: [],
    batchingRules: {},
    weekStart: "mon",
  };
}

// Seed a realistic 30-day sample plan using a mix of ideas.
function buildSeedPlan(ideas: ContentIdea[], startDateISO: string): ScheduledPost[] {
  const today = startDateISO;
  // Pick one idea per platform + pillar combo, spread across 30 days.
  const shuffled = [...ideas].sort(() => Math.random() - 0.5);
  const picks: ContentIdea[] = [];
  const seen = new Set<string>();
  for (const idea of shuffled) {
    const key = `${idea.platform}-${idea.pillar}`;
    if (seen.has(key)) continue;
    seen.add(key);
    picks.push(idea);
    if (picks.length >= 20) break;
  }
  // Scatter across the next 30 days (skip some weekends so there's breathing room).
  const posts: ScheduledPost[] = [];
  let d = 1;
  for (const idea of picks) {
    // Give a little weekday lean
    while (d < 30) {
      const iso = addDaysISO(today, d);
      const wd = weekdayFromISO(iso);
      if (wd === "sat" || wd === "sun") {
        d += 1;
        continue;
      }
      break;
    }
    const iso = addDaysISO(today, Math.min(d, 29));
    posts.push({
      id: crypto.randomUUID(),
      ideaId: idea.id,
      title: idea.title,
      platform: idea.platform,
      pillar: idea.pillar,
      format: idea.format,
      difficulty: idea.difficulty,
      scheduledDate: iso,
      status: "draft",
      notes: "",
      hookIdea: idea.hook_idea,
      ctaIdea: idea.cta_idea,
    });
    d += Math.max(1, Math.floor(28 / picks.length));
  }
  return posts;
}

export function CalendarApp({ ideas }: { ideas: ContentIdea[] }) {
  const [tab, setTab] = useState<Tab>("calendar");
  const [state, setState] = useState<CalendarState>(createInitialState);
  const [hydrated, setHydrated] = useState(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Hydrate from localStorage.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<CalendarState>;
        setState({
          startDate:
            parsed.startDate ?? startOfWeekISO(todayISO(), parsed.weekStart ?? "mon"),
          posts: Array.isArray(parsed.posts) ? parsed.posts : [],
          pinned: Array.isArray(parsed.pinned) ? parsed.pinned : [],
          batchingRules: parsed.batchingRules ?? {},
          weekStart: parsed.weekStart ?? "mon",
        });
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  // Autosave.
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore quota errors */
    }
  }, [state, hydrated]);

  // ---------- actions ----------
  const addPost = useCallback((post: Omit<ScheduledPost, "id">) => {
    setState((s) => ({
      ...s,
      posts: [...s.posts, { ...post, id: crypto.randomUUID() }],
    }));
  }, []);

  const addPostFromIdea = useCallback(
    (idea: ContentIdea, dateISO: string) => {
      const post: Omit<ScheduledPost, "id"> = {
        ideaId: idea.id,
        title: idea.title,
        platform: idea.platform,
        pillar: idea.pillar,
        format: idea.format,
        difficulty: idea.difficulty,
        scheduledDate: dateISO,
        status: "draft",
        notes: "",
        hookIdea: idea.hook_idea,
        ctaIdea: idea.cta_idea,
      };
      addPost(post);
      const dateLabel = new Date(dateISO + "T00:00:00").toLocaleDateString(
        "en-US",
        { month: "short", day: "numeric" },
      );
      toast.success(`Added to ${dateLabel}`, {
        description: idea.title.length > 80 ? idea.title.slice(0, 80) + "…" : idea.title,
      });
    },
    [addPost],
  );

  const updatePost = useCallback((id: string, patch: Partial<ScheduledPost>) => {
    setState((s) => ({
      ...s,
      posts: s.posts.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }));
  }, []);

  const deletePost = useCallback((id: string) => {
    setState((s) => ({ ...s, posts: s.posts.filter((p) => p.id !== id) }));
  }, []);

  const movePost = useCallback((id: string, dateISO: string) => {
    setState((s) => ({
      ...s,
      posts: s.posts.map((p) =>
        p.id === id ? { ...p, scheduledDate: dateISO } : p,
      ),
    }));
  }, []);

  const togglePinned = useCallback((ideaId: string) => {
    setState((s) => {
      const isPinned = s.pinned.includes(ideaId);
      return {
        ...s,
        pinned: isPinned ? s.pinned.filter((id) => id !== ideaId) : [...s.pinned, ideaId],
      };
    });
  }, []);

  const setBatchingRule = useCallback((weekday: Weekday, pillar: Pillar | null) => {
    setState((s) => {
      const next = { ...s.batchingRules };
      if (pillar) next[weekday] = pillar;
      else delete next[weekday];
      return { ...s, batchingRules: next };
    });
  }, []);

  const setWeekStart = useCallback((weekStart: WeekStart) => {
    setState((s) => ({
      ...s,
      weekStart,
      startDate: startOfWeekISO(s.startDate, weekStart),
    }));
  }, []);

  const setStartDate = useCallback((iso: string) => {
    setState((s) => ({ ...s, startDate: startOfWeekISO(iso, s.weekStart) }));
  }, []);

  const seedPlan = useCallback(() => {
    if (state.posts.length > 0) {
      if (
        !confirm(
          "Replace your current plan with a fresh 30-day sample? Existing posts will be removed.",
        )
      ) {
        return;
      }
    }
    const posts = buildSeedPlan(ideas, todayISO());
    setState((s) => ({ ...s, posts }));
    toast.success("Seeded a 30-day sample plan.", {
      description: "Pillar spread across weekdays. Drag things around to make it yours.",
    });
  }, [ideas, state.posts.length]);

  const clearAll = useCallback(() => {
    if (!confirm("Clear all scheduled posts? This can't be undone.")) return;
    setState((s) => ({ ...s, posts: [] }));
    toast.success("Cleared the calendar.");
  }, []);

  // ---------- stats ----------
  const stats = useMemo(() => {
    const today = todayISO();
    const weekStart = startOfWeekISO(today, state.weekStart);
    const weekEnd = addDaysISO(weekStart, 6);
    const monthKey = today.slice(0, 7);

    let thisWeek = 0;
    let thisMonth = 0;
    const byPillar: Record<Pillar, number> = {
      teach: 0,
      story: 0,
      opinion: 0,
      "behind-the-scenes": 0,
      "case-study": 0,
      community: 0,
      product: 0,
      curate: 0,
    };
    for (const p of state.posts) {
      if (p.scheduledDate >= weekStart && p.scheduledDate <= weekEnd) thisWeek++;
      if (p.scheduledDate.startsWith(monthKey)) thisMonth++;
      byPillar[p.pillar]++;
    }
    // Gap days: how many of next 7 days have zero posts.
    let gaps = 0;
    for (let i = 0; i < 7; i++) {
      const iso = addDaysISO(today, i);
      if (!state.posts.some((p) => p.scheduledDate === iso)) gaps++;
    }
    const total = state.posts.length || 1;
    return { thisWeek, thisMonth, byPillar, gaps, total };
  }, [state.posts, state.weekStart]);

  // ---------- keyboard shortcuts ----------
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName?.toLowerCase();
      if (
        tag === "input" ||
        tag === "textarea" ||
        tag === "select" ||
        (e.target as HTMLElement | null)?.isContentEditable
      ) {
        // Only handle "Escape" while typing.
        return;
      }
      if (e.key === "1") {
        e.preventDefault();
        setTab("library");
      } else if (e.key === "2") {
        e.preventDefault();
        setTab("calendar");
      } else if (e.key === "3") {
        e.preventDefault();
        setTab("batching");
      } else if (e.key === "t" || e.key === "T") {
        e.preventDefault();
        setStartDate(todayISO());
      } else if (e.key === "ArrowLeft" && tab === "calendar") {
        e.preventDefault();
        setState((s) => ({ ...s, startDate: addDaysISO(s.startDate, -7) }));
      } else if (e.key === "ArrowRight" && tab === "calendar") {
        e.preventDefault();
        setState((s) => ({ ...s, startDate: addDaysISO(s.startDate, 7) }));
      } else if (e.key === "/") {
        e.preventDefault();
        setTab("library");
        setTimeout(() => searchInputRef.current?.focus(), 30);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tab, setStartDate]);

  // ---------- export helpers ----------
  const exportCSV = useCallback(() => {
    if (state.posts.length === 0) {
      toast.error("Nothing scheduled to export yet.");
      return;
    }
    const rows = [
      ["date", "platform", "pillar", "format", "status", "title", "notes"],
      ...state.posts
        .slice()
        .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate))
        .map((p) => [
          p.scheduledDate,
          PLATFORM_LABELS[p.platform],
          PILLAR_LABELS[p.pillar],
          p.format,
          p.status,
          p.title.replace(/"/g, '""'),
          (p.notes || "").replace(/"/g, '""').replace(/\n/g, " "),
        ]),
    ];
    const csv = rows
      .map((r) => r.map((c) => `"${c}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `startoor-calendar-${todayISO()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${state.posts.length} posts to CSV.`);
  }, [state.posts]);

  const exportICS = useCallback(() => {
    if (state.posts.length === 0) {
      toast.error("Nothing scheduled to export yet.");
      return;
    }
    const esc = (s: string) =>
      s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
    const toICSDate = (iso: string) => iso.replace(/-/g, "");

    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Startoor//Content Calendar Kit//EN",
      "CALSCALE:GREGORIAN",
    ];
    for (const p of state.posts) {
      const start = toICSDate(p.scheduledDate);
      const end = toICSDate(addDaysISO(p.scheduledDate, 1));
      const desc = [
        `Platform: ${PLATFORM_LABELS[p.platform]}`,
        `Pillar: ${PILLAR_LABELS[p.pillar]}`,
        `Format: ${p.format}`,
        `Status: ${p.status}`,
        p.notes ? `Notes: ${p.notes}` : null,
        p.hookIdea ? `Hook: ${p.hookIdea}` : null,
        p.ctaIdea ? `CTA: ${p.ctaIdea}` : null,
      ]
        .filter(Boolean)
        .join("\\n");
      lines.push(
        "BEGIN:VEVENT",
        `UID:${p.id}@startoor.vercel.app`,
        `DTSTAMP:${toICSDate(todayISO())}T000000Z`,
        `DTSTART;VALUE=DATE:${start}`,
        `DTEND;VALUE=DATE:${end}`,
        `SUMMARY:${esc(`[${PLATFORM_LABELS[p.platform]}] ${p.title}`)}`,
        `DESCRIPTION:${desc}`,
        "END:VEVENT",
      );
    }
    lines.push("END:VCALENDAR");

    const blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `startoor-calendar-${todayISO()}.ics`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${state.posts.length} posts to iCal.`);
  }, [state.posts]);

  const printCalendar = useCallback(() => {
    setTab("calendar");
    setTimeout(() => {
      window.print();
    }, 50);
  }, []);

  // ---------- render ----------
  if (!hydrated) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-16 md:px-10">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone">
          Loading your plan…
        </p>
      </div>
    );
  }

  return (
    <div className="pb-24 print:pb-0">
      {/* Sticky toolbar */}
      <div className="sticky top-28 z-20 border-b border-hairline bg-paper/95 backdrop-blur-md print:hidden">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-3 md:px-10">
          <nav className="inline-flex items-center gap-1 rounded-full border border-hairline bg-bone p-1">
            <TabButton active={tab === "library"} onClick={() => setTab("library")}>
              <Library className="h-3.5 w-3.5" />
              <span>Ideas</span>
              <Kbd>1</Kbd>
            </TabButton>
            <TabButton active={tab === "calendar"} onClick={() => setTab("calendar")}>
              <CalendarRange className="h-3.5 w-3.5" />
              <span>Calendar</span>
              <Kbd>2</Kbd>
            </TabButton>
            <TabButton active={tab === "batching"} onClick={() => setTab("batching")}>
              <Grid3x3 className="h-3.5 w-3.5" />
              <span>Batching</span>
              <Kbd>3</Kbd>
            </TabButton>
          </nav>

          <div className="flex flex-wrap items-center gap-2">
            {state.posts.length === 0 && (
              <button
                onClick={seedPlan}
                className="inline-flex items-center gap-1.5 rounded-full border border-clay/30 bg-clay/5 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-clay transition-colors hover:border-clay hover:bg-clay/10"
              >
                <Sparkles className="h-3 w-3" />
                Seed 30-day plan
              </button>
            )}
            <button
              onClick={exportCSV}
              className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-bone px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft transition-colors hover:border-ink hover:text-ink"
            >
              <Download className="h-3 w-3" />
              CSV
            </button>
            <button
              onClick={exportICS}
              className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-bone px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft transition-colors hover:border-ink hover:text-ink"
            >
              <Download className="h-3 w-3" />
              iCal
            </button>
            <button
              onClick={printCalendar}
              className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-bone px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft transition-colors hover:border-ink hover:text-ink"
              aria-label="Print calendar"
            >
              <Printer className="h-3 w-3" />
              Print
            </button>
            {state.posts.length > 0 && (
              <button
                onClick={clearAll}
                className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-bone px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-stone transition-colors hover:border-clay hover:text-clay"
                aria-label="Clear all"
              >
                <Trash2 className="h-3 w-3" />
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tab body */}
      <div className="mx-auto max-w-7xl px-6 pt-8 md:px-10 md:pt-10">
        {tab === "library" && (
          <LibraryView
            ideas={ideas}
            pinned={state.pinned}
            onTogglePinned={togglePinned}
            onAddToToday={(idea) => addPostFromIdea(idea, todayISO())}
            onAddToDate={addPostFromIdea}
            searchInputRef={searchInputRef}
          />
        )}

        {tab === "calendar" && (
          <CalendarView
            ideas={ideas}
            state={state}
            stats={stats}
            onSetStartDate={setStartDate}
            onSetWeekStart={setWeekStart}
            onAddPost={addPost}
            onAddFromIdea={addPostFromIdea}
            onUpdatePost={updatePost}
            onDeletePost={deletePost}
            onMovePost={movePost}
            onSeed={seedPlan}
          />
        )}

        {tab === "batching" && (
          <BatchingView
            state={state}
            onUpdatePost={updatePost}
            onDeletePost={deletePost}
            onMovePost={movePost}
            onSetBatchingRule={setBatchingRule}
          />
        )}
      </div>

      {tab === "library" && state.pinned.length > 0 && (
        <PinnedCount count={state.pinned.length} />
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors",
        active
          ? "bg-ink text-bone"
          : "text-ink-soft hover:bg-paper hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "ml-0.5 inline-flex h-4 items-center rounded px-1 font-mono text-[9px] leading-none",
        "border border-hairline bg-paper text-stone",
      )}
      aria-hidden
    >
      {children}
    </span>
  );
}

function PinnedCount({ count }: { count: number }) {
  return (
    <div className="fixed bottom-6 right-6 z-20 inline-flex items-center gap-2 rounded-full border border-hairline bg-bone px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft shadow-warm-sm print:hidden">
      <BookmarkIcon className="h-3 w-3 text-clay" />
      <span>{count} pinned</span>
    </div>
  );
}
