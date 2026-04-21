"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import {
  EVENT_HISTORY,
  EVENT_META,
  EVENT_TOTALS_90D,
  FUNNEL_STEPS,
  formatCount,
  type EventType,
} from "@/lib/data/saas-dashboard-mock";

type RangeKey = "7d" | "30d" | "90d";

const RANGE_DAYS: Record<RangeKey, number> = { "7d": 7, "30d": 30, "90d": 90 };

export function AnalyticsView() {
  const [range, setRange] = useState<RangeKey>("30d");
  const [selectedEvents, setSelectedEvents] = useState<Set<EventType>>(
    new Set(["page_view", "signup", "api_call"]),
  );

  const days = RANGE_DAYS[range];
  const windowData = useMemo(
    () => EVENT_HISTORY.slice(-days),
    [days],
  );

  const toggleEvent = (e: EventType) => {
    setSelectedEvents((s) => {
      const next = new Set(s);
      if (next.has(e)) {
        if (next.size > 1) next.delete(e); // keep at least one
      } else {
        next.add(e);
      }
      return next;
    });
  };

  return (
    <div className="px-5 py-6 md:px-8 md:py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-clay">
            Analytics · last {days} days
          </p>
          <h2 className="mt-2 font-display text-[30px] leading-[1.05] tracking-tight text-ink md:text-[36px]">
            How the product is actually used.
          </h2>
        </div>
        <div className="inline-flex items-center rounded-sm border border-hairline bg-bone p-0.5">
          {(["7d", "30d", "90d"] as RangeKey[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={cn(
                "rounded-sm px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors",
                range === r ? "bg-ink text-bone" : "text-ink-soft hover:text-ink",
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Event type filter chips */}
      <div className="mt-5 flex flex-wrap items-center gap-1.5">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone">
          Events:
        </span>
        {(Object.keys(EVENT_META) as EventType[]).map((e) => {
          const on = selectedEvents.has(e);
          return (
            <button
              key={e}
              type="button"
              onClick={() => toggleEvent(e)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em] transition-all",
                on
                  ? "border-ink text-ink"
                  : "border-hairline text-stone opacity-60 hover:opacity-100",
              )}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: EVENT_META[e].color, opacity: on ? 1 : 0.3 }}
              />
              {EVENT_META[e].label}
            </button>
          );
        })}
      </div>

      {/* Top-line event counts */}
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {(["page_view", "signup", "api_call", "checkout"] as EventType[]).map((e) => (
          <EventTile key={e} event={e} value={EVENT_TOTALS_90D[e]} />
        ))}
      </div>

      {/* Lines chart */}
      <section className="mt-8 overflow-hidden rounded-sm border border-hairline bg-warm-white">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-hairline-soft px-5 py-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-clay">
              Event volume · daily
            </p>
            <h3 className="mt-1 font-display text-xl tracking-tight text-ink md:text-[22px]">
              Lines per selected event type.
            </h3>
          </div>
        </div>
        <div className="p-5 md:p-6">
          <EventLinesChart
            data={windowData}
            selected={selectedEvents}
          />
        </div>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        {/* Funnel */}
        <section className="overflow-hidden rounded-sm border border-hairline bg-warm-white">
          <div className="border-b border-hairline-soft px-5 py-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-clay">
              Activation funnel
            </p>
            <h3 className="mt-1 font-display text-xl tracking-tight text-ink md:text-[22px]">
              Visit → value → subscription.
            </h3>
          </div>
          <div className="p-5 md:p-6">
            <Funnel />
          </div>
        </section>

        {/* DAU / WAU / MAU */}
        <section className="overflow-hidden rounded-sm border border-hairline bg-warm-white">
          <div className="border-b border-hairline-soft px-5 py-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-clay">
              Active users
            </p>
            <h3 className="mt-1 font-display text-xl tracking-tight text-ink md:text-[22px]">
              DAU / WAU / MAU.
            </h3>
          </div>
          <div className="p-5 md:p-6">
            <DwmChart data={windowData} />
            <div className="mt-4 grid grid-cols-3 gap-3 border-t border-hairline-soft pt-4">
              <UsersStat
                label="DAU"
                value={windowData[windowData.length - 1]?.dau ?? 0}
                color="#1F3A2F"
              />
              <UsersStat
                label="WAU"
                value={windowData[windowData.length - 1]?.wau ?? 0}
                color="#9DB89F"
              />
              <UsersStat
                label="MAU"
                value={windowData[windowData.length - 1]?.mau ?? 0}
                color="#C85A3F"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Event tile
// ---------------------------------------------------------------------------

function EventTile({ event, value }: { event: EventType; value: number }) {
  const meta = EVENT_META[event];
  return (
    <div className="relative flex min-w-0 flex-col overflow-hidden rounded-sm border border-hairline bg-warm-white p-5">
      <span
        className="font-mono text-[10px] uppercase tracking-[0.22em]"
        style={{ color: meta.color }}
      >
        {meta.label}
      </span>
      <p className="mt-3 min-w-0 font-display text-[22px] leading-[1.05] tracking-tight text-ink tabular-nums md:text-[26px]">
        {formatCount(value)}
      </p>
      <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-stone">
        total · 90 days
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Event lines chart (SVG)
// ---------------------------------------------------------------------------

function EventLinesChart({
  data,
  selected,
}: {
  data: typeof EVENT_HISTORY;
  selected: Set<EventType>;
}) {
  const width = 720;
  const height = 260;
  const pad = { top: 20, right: 40, bottom: 30, left: 52 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;

  if (data.length === 0) return null;

  // Normalize each event line to its own max so they can coexist.
  const events = Array.from(selected);
  const seriesMax: Record<string, number> = {};
  for (const e of events) {
    seriesMax[e] = Math.max(...data.map((d) => d.counts[e]));
  }
  const globalMax = Math.max(...events.map((e) => seriesMax[e] ?? 0));

  const xStep = innerW / Math.max(1, data.length - 1);

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
    y: innerH - innerH * t,
    label: formatCount(Math.round(globalMax * t)),
  }));

  const xLabels = [0, Math.floor(data.length / 2), data.length - 1].map((i) => ({
    x: i * xStep,
    label: data[i].date.slice(5),
  }));

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
      <g transform={`translate(${pad.left},${pad.top})`}>
        {yTicks.map((t, i) => (
          <g key={i}>
            <line
              x1={0}
              x2={innerW}
              y1={t.y}
              y2={t.y}
              stroke="rgba(28,28,26,0.06)"
              strokeWidth={1}
            />
            <text
              x={-10}
              y={t.y}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize={10}
              fontFamily="var(--font-mono)"
              fill="#8F8B80"
            >
              {t.label}
            </text>
          </g>
        ))}

        {xLabels.map((l, i) => (
          <text
            key={i}
            x={l.x}
            y={innerH + 18}
            textAnchor={i === 0 ? "start" : i === xLabels.length - 1 ? "end" : "middle"}
            fontSize={10}
            fontFamily="var(--font-mono)"
            fill="#8F8B80"
            letterSpacing="0.06em"
          >
            {l.label}
          </text>
        ))}

        {events.map((e) => {
          const path = data
            .map((d, i) => {
              const x = i * xStep;
              const y = innerH - (d.counts[e] / globalMax) * innerH;
              return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
            })
            .join(" ");
          return (
            <path
              key={e}
              d={path}
              fill="none"
              stroke={EVENT_META[e].color}
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          );
        })}
      </g>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Funnel
// ---------------------------------------------------------------------------

function Funnel() {
  const top = FUNNEL_STEPS[0].count;
  return (
    <ul className="space-y-2">
      {FUNNEL_STEPS.map((s, i) => {
        const widthPct = (s.count / top) * 100;
        const prev = i > 0 ? FUNNEL_STEPS[i - 1].count : null;
        const conversion = prev ? (s.count / prev) * 100 : 100;
        return (
          <li key={s.id}>
            <div className="flex items-baseline justify-between gap-2">
              <p className="font-sans text-sm text-ink">{s.label}</p>
              <p className="font-mono text-xs tabular-nums text-ink">
                {formatCount(s.count)}
                <span className="ml-2 text-stone">({((s.count / top) * 100).toFixed(1)}%)</span>
              </p>
            </div>
            <div className="mt-1 h-6 overflow-hidden rounded-sm bg-bone">
              <div
                className="h-full rounded-sm bg-forest transition-all"
                style={{ width: `${widthPct}%` }}
              />
            </div>
            {prev && (
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-stone">
                {conversion >= 50 ? (
                  <span className="text-forest">▲</span>
                ) : (
                  <span className="text-clay">▼</span>
                )}{" "}
                {conversion.toFixed(1)}% step conversion ·{" "}
                {formatCount(prev - s.count)} dropped off
              </p>
            )}
          </li>
        );
      })}
    </ul>
  );
}

// ---------------------------------------------------------------------------
// DAU / WAU / MAU chart
// ---------------------------------------------------------------------------

function DwmChart({ data }: { data: typeof EVENT_HISTORY }) {
  const width = 480;
  const height = 200;
  const pad = { top: 12, right: 12, bottom: 20, left: 44 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;

  if (data.length === 0) return null;
  const maxVal = Math.max(...data.map((d) => d.mau));
  const xStep = innerW / Math.max(1, data.length - 1);

  const line = (key: "dau" | "wau" | "mau") =>
    data
      .map((d, i) => {
        const x = i * xStep;
        const y = innerH - (d[key] / maxVal) * innerH;
        return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(" ");

  // For MAU, draw a filled area.
  const mauArea =
    data
      .map((d, i) => {
        const x = i * xStep;
        const y = innerH - (d.mau / maxVal) * innerH;
        return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(" ") +
    ` L${innerW.toFixed(2)},${innerH.toFixed(2)} L0,${innerH.toFixed(2)} Z`;

  const yTicks = [0, 0.5, 1].map((t) => ({
    y: innerH - innerH * t,
    label: formatCount(Math.round(maxVal * t)),
  }));

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
      <defs>
        <linearGradient id="mau-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C85A3F" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#C85A3F" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <g transform={`translate(${pad.left},${pad.top})`}>
        {yTicks.map((t, i) => (
          <g key={i}>
            <line
              x1={0}
              x2={innerW}
              y1={t.y}
              y2={t.y}
              stroke="rgba(28,28,26,0.06)"
              strokeWidth={1}
            />
            <text
              x={-8}
              y={t.y}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize={9}
              fontFamily="var(--font-mono)"
              fill="#8F8B80"
            >
              {t.label}
            </text>
          </g>
        ))}
        <path d={mauArea} fill="url(#mau-grad)" />
        <path d={line("mau")} fill="none" stroke="#C85A3F" strokeWidth={1.4} strokeDasharray="4 3" />
        <path d={line("wau")} fill="none" stroke="#9DB89F" strokeWidth={1.6} />
        <path d={line("dau")} fill="none" stroke="#1F3A2F" strokeWidth={1.8} />
      </g>
    </svg>
  );
}

function UsersStat({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div>
      <p
        className="font-mono text-[10px] uppercase tracking-[0.22em]"
        style={{ color }}
      >
        {label}
      </p>
      <p className="mt-1 font-display text-xl tracking-tight text-ink tabular-nums">
        {formatCount(value)}
      </p>
    </div>
  );
}
