"use client";

import { useMemo, useState } from "react";
import { AlertCircle, Calendar as CalendarIcon, Layers, X } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  type Pillar,
  PILLARS,
  PILLAR_COLORS,
  PILLAR_LABELS,
  PLATFORM_LABELS,
} from "@/lib/data/content-ideas";
import type { CalendarState, ScheduledPost } from "./calendar-app";
import { WEEKDAY_LABELS, type Weekday } from "./calendar-app";

type Mode = "weekday" | "pillar";

function weekdayFromISO(iso: string): Weekday {
  const d = new Date(iso + "T00:00:00");
  const map: Weekday[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  return map[d.getDay()];
}

function isoForWeekday(wd: Weekday, weekStart: "sun" | "mon"): string {
  // Build an ISO for the upcoming weekday (today or within 6 days).
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayWd = weekdayFromISO(
    new Date(today.getTime() - today.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 10),
  );
  const order: Weekday[] =
    weekStart === "mon"
      ? ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]
      : ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  const todayIdx = order.indexOf(todayWd);
  const targetIdx = order.indexOf(wd);
  const delta = (targetIdx - todayIdx + 7) % 7;
  const d = new Date(today);
  d.setDate(d.getDate() + delta);
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 10);
}

export function BatchingView({
  state,
  onUpdatePost,
  onDeletePost,
  onMovePost,
  onSetBatchingRule,
}: {
  state: CalendarState;
  onUpdatePost: (id: string, patch: Partial<ScheduledPost>) => void;
  onDeletePost: (id: string) => void;
  onMovePost: (id: string, dateISO: string) => void;
  onSetBatchingRule: (wd: Weekday, pillar: Pillar | null) => void;
}) {
  const [mode, setMode] = useState<Mode>("weekday");

  // Only upcoming posts matter for batching — show next 4 weeks.
  const cutoff = useMemo(() => {
    const today = new Date();
    const future = new Date(today);
    future.setDate(future.getDate() + 28);
    const tz = future.getTimezoneOffset() * 60000;
    return new Date(future.getTime() - tz).toISOString().slice(0, 10);
  }, []);

  const todayISOStr = useMemo(() => {
    const d = new Date();
    const tz = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tz).toISOString().slice(0, 10);
  }, []);

  const upcomingPosts = useMemo(
    () =>
      state.posts
        .filter(
          (p) => p.scheduledDate >= todayISOStr && p.scheduledDate <= cutoff,
        )
        .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate)),
    [state.posts, cutoff, todayISOStr],
  );

  return (
    <div className="pb-24">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-clay">
            Batching board
          </span>
          <p className="mt-1 font-display text-2xl leading-tight tracking-tight text-ink md:text-3xl">
            Group what belongs together.
          </p>
          <p className="mt-2 max-w-xl font-sans text-sm leading-relaxed text-ink-soft">
            Pull the next four weeks into columns. Group by weekday to find
            natural recording days, or by pillar to see where the balance is
            off. Drag posts between columns to move them.
          </p>
        </div>
        <div className="inline-flex items-center gap-1 rounded-full border border-hairline bg-bone p-1">
          <button
            onClick={() => setMode("weekday")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors",
              mode === "weekday" ? "bg-ink text-bone" : "text-ink-soft hover:text-ink",
            )}
          >
            <CalendarIcon className="h-3 w-3" />
            By weekday
          </button>
          <button
            onClick={() => setMode("pillar")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors",
              mode === "pillar" ? "bg-ink text-bone" : "text-ink-soft hover:text-ink",
            )}
          >
            <Layers className="h-3 w-3" />
            By pillar
          </button>
        </div>
      </div>

      {upcomingPosts.length === 0 ? (
        <div className="mt-10 rounded border border-dashed border-hairline bg-bone/60 px-8 py-16 text-center">
          <p className="font-display text-2xl leading-tight tracking-tight text-ink">
            Nothing scheduled in the next four weeks.
          </p>
          <p className="mt-2 max-w-md mx-auto font-sans text-sm leading-relaxed text-ink-soft">
            Head to the Calendar tab to add posts, or drop ideas in from the
            Library. They&apos;ll show up here for batching.
          </p>
        </div>
      ) : mode === "weekday" ? (
        <WeekdayBoard
          posts={upcomingPosts}
          rules={state.batchingRules}
          onSetRule={onSetBatchingRule}
          onMovePost={onMovePost}
          onUpdatePost={onUpdatePost}
          onDeletePost={onDeletePost}
          weekStart={state.weekStart}
        />
      ) : (
        <PillarBoard
          posts={upcomingPosts}
          onUpdatePost={onUpdatePost}
          onDeletePost={onDeletePost}
        />
      )}
    </div>
  );
}

// ------- Weekday mode -------
function WeekdayBoard({
  posts,
  rules,
  onSetRule,
  onMovePost,
  onUpdatePost,
  onDeletePost,
  weekStart,
}: {
  posts: ScheduledPost[];
  rules: CalendarState["batchingRules"];
  onSetRule: (wd: Weekday, pillar: Pillar | null) => void;
  onMovePost: (id: string, dateISO: string) => void;
  onUpdatePost: (id: string, patch: Partial<ScheduledPost>) => void;
  onDeletePost: (id: string) => void;
  weekStart: "sun" | "mon";
}) {
  const orderedDays: Weekday[] =
    weekStart === "mon"
      ? ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]
      : ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

  const byWeekday: Record<Weekday, ScheduledPost[]> = {
    mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [],
  };
  for (const p of posts) {
    byWeekday[weekdayFromISO(p.scheduledDate)].push(p);
  }

  return (
    <div className="mt-8 grid gap-3 md:grid-cols-4 lg:grid-cols-7">
      {orderedDays.map((wd) => {
        const rule = rules[wd];
        const list = byWeekday[wd];
        return (
          <BoardColumn
            key={wd}
            title={WEEKDAY_LABELS[wd]}
            subtitle={rule ? `batch · ${PILLAR_LABELS[rule]}` : "no rule"}
            subtitleColor={rule ? PILLAR_COLORS[rule] : undefined}
            count={list.length}
            onDrop={(postId) => {
              const p = posts.find((x) => x.id === postId);
              if (!p) return;
              const dest = isoForWeekday(wd, weekStart);
              if (p.scheduledDate !== dest) onMovePost(postId, dest);
            }}
            ruleControl={
              <PillarRulePicker
                value={rule}
                onChange={(v) => onSetRule(wd, v)}
              />
            }
          >
            {list.length === 0 ? (
              <EmptyCol />
            ) : (
              list.map((p) => {
                const mismatch = rule && p.pillar !== rule;
                return (
                  <BatchCard
                    key={p.id}
                    post={p}
                    mismatch={Boolean(mismatch)}
                    mismatchHint={
                      mismatch
                        ? `Rule says ${PILLAR_LABELS[rule!]} on ${WEEKDAY_LABELS[wd]}`
                        : undefined
                    }
                    onUpdate={(patch) => onUpdatePost(p.id, patch)}
                    onDelete={() => onDeletePost(p.id)}
                  />
                );
              })
            )}
          </BoardColumn>
        );
      })}
    </div>
  );
}

function PillarRulePicker({
  value,
  onChange,
}: {
  value?: Pillar;
  onChange: (v: Pillar | null) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-paper px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.18em] text-ink-soft transition-colors hover:border-ink hover:text-ink"
      >
        {value ? (
          <>
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: PILLAR_COLORS[value] }}
            />
            Edit rule
          </>
        ) : (
          "Set rule"
        )}
      </button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded border border-hairline bg-bone p-2 shadow-warm-md">
            {PILLARS.map((p) => (
              <button
                key={p}
                onClick={() => {
                  onChange(p);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2 rounded px-2 py-1.5 text-left transition-colors hover:bg-paper",
                  value === p && "bg-paper",
                )}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: PILLAR_COLORS[p] }}
                />
                <span className="font-sans text-xs text-ink">
                  {PILLAR_LABELS[p]}
                </span>
              </button>
            ))}
            {value && (
              <button
                onClick={() => {
                  onChange(null);
                  setOpen(false);
                }}
                className="mt-1 flex w-full items-center gap-2 rounded border-t border-hairline-soft px-2 pt-2 pb-1 text-left font-mono text-[9px] uppercase tracking-[0.18em] text-stone hover:text-clay"
              >
                <X className="h-3 w-3" />
                Clear rule
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ------- Pillar mode -------
function PillarBoard({
  posts,
  onUpdatePost,
  onDeletePost,
}: {
  posts: ScheduledPost[];
  onUpdatePost: (id: string, patch: Partial<ScheduledPost>) => void;
  onDeletePost: (id: string) => void;
}) {
  const grouped: Record<Pillar, ScheduledPost[]> = {
    teach: [], story: [], opinion: [], "behind-the-scenes": [],
    "case-study": [], community: [], product: [], curate: [],
  };
  for (const p of posts) grouped[p.pillar].push(p);

  return (
    <div className="mt-8 grid gap-3 md:grid-cols-4">
      {PILLARS.map((pil) => {
        const list = grouped[pil];
        return (
          <BoardColumn
            key={pil}
            title={PILLAR_LABELS[pil]}
            subtitleColor={PILLAR_COLORS[pil]}
            count={list.length}
            onDrop={(postId) => {
              const p = posts.find((x) => x.id === postId);
              if (!p || p.pillar === pil) return;
              onUpdatePost(postId, { pillar: pil });
            }}
          >
            {list.length === 0 ? (
              <EmptyCol />
            ) : (
              list.map((p) => (
                <BatchCard
                  key={p.id}
                  post={p}
                  onUpdate={(patch) => onUpdatePost(p.id, patch)}
                  onDelete={() => onDeletePost(p.id)}
                />
              ))
            )}
          </BoardColumn>
        );
      })}
    </div>
  );
}

// ------- Shared pieces -------

function BoardColumn({
  title,
  subtitle,
  subtitleColor,
  count,
  onDrop,
  ruleControl,
  children,
}: {
  title: string;
  subtitle?: string;
  subtitleColor?: string;
  count: number;
  onDrop: (postId: string) => void;
  ruleControl?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setHover(true);
      }}
      onDragLeave={() => setHover(false)}
      onDrop={(e) => {
        e.preventDefault();
        setHover(false);
        const postId = e.dataTransfer.getData("application/x-post-id");
        if (postId) onDrop(postId);
      }}
      className={cn(
        "flex min-h-[200px] flex-col rounded border bg-bone/60 p-3 transition-colors",
        hover ? "border-forest bg-sage/10" : "border-hairline",
      )}
    >
      <div className="mb-3 flex min-w-0 items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            {subtitleColor && (
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: subtitleColor }}
              />
            )}
            <h3 className="font-display text-base leading-none tracking-tight text-ink">
              {title}
            </h3>
            <span className="ml-1 font-mono text-[10px] tabular-nums text-stone">
              {count}
            </span>
          </div>
          {subtitle && (
            <p
              className="mt-1 truncate font-mono text-[9px] uppercase tracking-[0.18em]"
              style={{ color: subtitleColor ?? undefined }}
            >
              {subtitle}
            </p>
          )}
        </div>
        {ruleControl}
      </div>
      <div className="flex min-w-0 flex-col gap-2">{children}</div>
    </div>
  );
}

function EmptyCol() {
  return (
    <div className="rounded border border-dashed border-hairline-soft bg-paper/40 px-3 py-6 text-center">
      <p className="font-sans text-xs italic text-stone-light">
        Drop posts here
      </p>
    </div>
  );
}

function BatchCard({
  post,
  mismatch,
  mismatchHint,
  onUpdate,
  onDelete,
}: {
  post: ScheduledPost;
  mismatch?: boolean;
  mismatchHint?: string;
  onUpdate: (patch: Partial<ScheduledPost>) => void;
  onDelete: () => void;
}) {
  const color = PILLAR_COLORS[post.pillar];
  const date = new Date(post.scheduledDate + "T00:00:00");
  const dateLabel = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <article
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("application/x-post-id", post.id);
        e.dataTransfer.effectAllowed = "move";
      }}
      className={cn(
        "group/card cursor-grab rounded border bg-paper p-3 transition-all hover:-translate-y-0.5 active:cursor-grabbing",
        mismatch ? "border-clay/50 bg-clay/5" : "border-hairline",
      )}
    >
      <div className="flex min-w-0 items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <span
            className="h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ backgroundColor: color }}
          />
          <span className="truncate font-mono text-[9px] uppercase tracking-[0.18em] text-stone">
            {PLATFORM_LABELS[post.platform]} · {dateLabel}
          </span>
        </div>
        <button
          onClick={onDelete}
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-stone-light opacity-0 transition-colors hover:bg-bone hover:text-clay group-hover/card:opacity-100"
          aria-label="Remove post"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
      <p className="mt-1.5 min-w-0 font-display text-[13px] leading-snug tracking-tight text-ink">
        {post.title}
      </p>
      {mismatch && mismatchHint && (
        <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-clay/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-clay">
          <AlertCircle className="h-2.5 w-2.5" />
          {mismatchHint}
        </p>
      )}
      <div className="mt-2 flex items-center gap-2">
        <select
          value={post.status}
          onChange={(e) =>
            onUpdate({
              status: e.target.value as ScheduledPost["status"],
            })
          }
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          className="border-b border-hairline bg-transparent py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-stone focus:border-ink focus:outline-none"
        >
          <option value="draft">Draft</option>
          <option value="scheduled">Scheduled</option>
          <option value="published">Published</option>
        </select>
      </div>
    </article>
  );
}
