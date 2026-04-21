"use client";

import { useMemo } from "react";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  ACTIVE_USERS,
  ACTIVITY_FEED,
  COHORTS,
  CURRENT_CHURN,
  CURRENT_MRR_CENTS,
  CURRENT_NPS,
  MRR_HISTORY,
  PRIOR_MRR_CENTS,
  formatCount,
  formatDateTime,
  formatMoney,
  type Workspace,
} from "@/lib/data/saas-dashboard-mock";

export function OverviewView({ workspace }: { workspace: Workspace }) {
  const mrrDeltaPct =
    PRIOR_MRR_CENTS > 0
      ? ((CURRENT_MRR_CENTS - PRIOR_MRR_CENTS) / PRIOR_MRR_CENTS) * 100
      : 0;

  // Active-user delta vs 30d prior — estimate from MRR history.
  const usersPriorMonth = MRR_HISTORY[MRR_HISTORY.length - 2].activeUsers;
  const usersDeltaPct =
    usersPriorMonth > 0 ? ((ACTIVE_USERS - usersPriorMonth) / usersPriorMonth) * 100 : 0;

  // Churn delta — compare current month to 3mo avg prior.
  const priorChurnAvg =
    MRR_HISTORY.slice(-4, -1).reduce((s, m) => s + m.churnRate, 0) / 3;
  const churnDeltaPct =
    priorChurnAvg > 0 ? ((CURRENT_CHURN - priorChurnAvg) / priorChurnAvg) * 100 : 0;

  // NPS delta — vs 3mo avg.
  const priorNps =
    MRR_HISTORY.slice(-4, -1).reduce((s, m) => s + m.npsScore, 0) / 3;
  const npsDelta = CURRENT_NPS - priorNps;

  return (
    <div className="px-5 py-6 md:px-8 md:py-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-clay">
            Overview · last 30 days
          </p>
          <h2 className="mt-2 font-display text-[30px] leading-[1.05] tracking-tight text-ink md:text-[36px]">
            Here&apos;s how {workspace.name.split(" ")[0]} is performing.
          </h2>
        </div>
        <div className="flex items-center gap-2 rounded-sm border border-hairline bg-bone px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft">
          <span className="h-1.5 w-1.5 rounded-full bg-forest" />
          Up to date · 4 min ago
        </div>
      </div>

      {/* Tiles */}
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Tile
          label="MRR"
          value={formatMoney(CURRENT_MRR_CENTS)}
          deltaPct={mrrDeltaPct}
        />
        <Tile
          label="Active users"
          value={formatCount(ACTIVE_USERS)}
          deltaPct={usersDeltaPct}
        />
        <Tile
          label="Monthly churn"
          value={`${(CURRENT_CHURN * 100).toFixed(2)}%`}
          deltaPct={churnDeltaPct}
          invertTone
        />
        <Tile
          label="NPS"
          value={String(CURRENT_NPS)}
          deltaAbs={npsDelta}
        />
      </div>

      {/* Grid: growth chart + activity feed */}
      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
        <section className="overflow-hidden rounded-sm border border-hairline bg-warm-white">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-hairline-soft px-5 py-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-clay">
                Revenue composition
              </p>
              <h3 className="mt-1 font-display text-xl tracking-tight text-ink md:text-[22px]">
                12-month MRR, stacked.
              </h3>
            </div>
            <Legend
              items={[
                { label: "Net new", color: "#1F3A2F" },
                { label: "Expansion", color: "#9DB89F" },
                { label: "Existing", color: "#C5BFAF" },
              ]}
            />
          </div>
          <div className="p-5 md:p-6">
            <MrrStackedChart />
          </div>
        </section>

        <section className="overflow-hidden rounded-sm border border-hairline bg-warm-white">
          <div className="border-b border-hairline-soft px-5 py-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-clay">
              Recent activity
            </p>
            <h3 className="mt-1 font-display text-xl tracking-tight text-ink md:text-[22px]">
              The desk&apos;s notebook.
            </h3>
          </div>
          <ul className="divide-y divide-hairline-soft">
            {ACTIVITY_FEED.map((a) => (
              <li key={a.id} className="flex gap-3 px-5 py-3">
                <span
                  className={cn(
                    "mt-1.5 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full",
                    a.kind === "plan_change" && "bg-forest",
                    a.kind === "payment" && "bg-butter",
                    a.kind === "signup" && "bg-sage",
                    a.kind === "invite" && "bg-stone",
                    a.kind === "api_key" && "bg-clay",
                    a.kind === "export" && "bg-ink",
                    a.kind === "system" && "bg-stone-light",
                  )}
                />
                <div className="min-w-0 flex-1">
                  <p className="font-sans text-sm leading-snug text-ink">
                    <span className="font-medium">{a.actor}</span>{" "}
                    <span className="text-ink-soft">{a.description}</span>
                  </p>
                  <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-stone">
                    {formatDateTime(a.at)} · {a.kind.replace("_", " ")}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Cohort grid */}
      <section className="mt-8 overflow-hidden rounded-sm border border-hairline bg-warm-white">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-hairline-soft px-5 py-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-clay">
              Retention · by signup month
            </p>
            <h3 className="mt-1 font-display text-xl tracking-tight text-ink md:text-[22px]">
              Who&apos;s still here, six months later.
            </h3>
          </div>
          <p className="max-w-sm font-sans text-xs leading-snug text-ink-soft">
            Darker cells = stronger retention. Recent cohorts (bottom rows) haven&apos;t had
            time to mature yet.
          </p>
        </div>
        <div className="overflow-x-auto p-5 md:p-6">
          <CohortGrid />
        </div>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tile
// ---------------------------------------------------------------------------

function Tile({
  label,
  value,
  deltaPct,
  deltaAbs,
  invertTone,
}: {
  label: string;
  value: string;
  deltaPct?: number;
  deltaAbs?: number;
  invertTone?: boolean;
}) {
  const delta = deltaPct ?? deltaAbs ?? 0;
  const flat = Math.abs(delta) < 0.5;
  const up = delta >= 0;
  const good = invertTone ? !up : up;
  const tone = flat ? "text-stone" : good ? "text-forest" : "text-clay";
  const Icon = flat ? Minus : up ? ArrowUp : ArrowDown;
  const suffix = deltaPct !== undefined ? "%" : " pts";
  return (
    <div className="relative flex min-w-0 flex-col overflow-hidden rounded-sm border border-hairline bg-warm-white p-5">
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-clay">
        {label}
      </span>
      <p className="mt-3 min-w-0 font-display text-[22px] leading-[1.05] tracking-tight text-ink tabular-nums md:text-[26px]">
        {value}
      </p>
      <div className={cn("mt-3 inline-flex items-center gap-1 font-mono text-xs tabular-nums", tone)}>
        <Icon className="h-3 w-3" />
        <span>
          {flat ? "Flat" : `${Math.abs(delta).toFixed(1)}${suffix}`}
        </span>
        <span className="ml-1 text-stone">vs. prior period</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stacked MRR chart (SVG)
// ---------------------------------------------------------------------------

function MrrStackedChart() {
  const data = MRR_HISTORY;
  const width = 680;
  const height = 240;
  const pad = { top: 20, right: 24, bottom: 30, left: 56 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;

  const maxMrr = Math.max(...data.map((d) => d.mrrCents));
  const yScale = (v: number) => innerH - (v / maxMrr) * innerH;
  const barW = (innerW / data.length) * 0.72;
  const step = innerW / data.length;

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
    y: innerH - innerH * t,
    label: formatMoney(Math.round(maxMrr * t)),
  }));

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
      <g transform={`translate(${pad.left},${pad.top})`}>
        {/* Horizontal gridlines */}
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

        {/* Bars — stack existing + expansion + new */}
        {data.map((d, i) => {
          const x = i * step + (step - barW) / 2;
          const existing = d.mrrCents - d.newMrrCents - d.expansionMrrCents;
          const existingH = innerH - yScale(existing);
          const expansionH = innerH - yScale(existing + d.expansionMrrCents) - (innerH - yScale(existing));
          const newH = innerH - yScale(d.mrrCents) - (innerH - yScale(existing + d.expansionMrrCents));
          return (
            <g key={d.month}>
              {/* existing */}
              <rect
                x={x}
                y={yScale(existing)}
                width={barW}
                height={Math.max(0, existingH)}
                fill="#C5BFAF"
              />
              {/* expansion */}
              <rect
                x={x}
                y={yScale(existing + d.expansionMrrCents)}
                width={barW}
                height={Math.max(0, expansionH)}
                fill="#9DB89F"
              />
              {/* net new */}
              <rect
                x={x}
                y={yScale(d.mrrCents)}
                width={barW}
                height={Math.max(0, newH)}
                fill="#1F3A2F"
              />
              <text
                x={x + barW / 2}
                y={innerH + 16}
                textAnchor="middle"
                fontSize={9}
                fontFamily="var(--font-mono)"
                fill="#8F8B80"
                letterSpacing="0.1em"
              >
                {d.label.toUpperCase()}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}

function Legend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      {items.map((it) => (
        <span
          key={it.label}
          className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-stone"
        >
          <span
            className="inline-block h-2 w-2"
            style={{ background: it.color }}
          />
          <span className="text-ink">{it.label}</span>
        </span>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Cohort grid
// ---------------------------------------------------------------------------

function CohortGrid() {
  return (
    <table className="w-full min-w-[640px] border-separate border-spacing-1 text-left">
      <thead>
        <tr>
          <th className="pl-0 pr-3 text-left font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
            Cohort
          </th>
          <th className="pr-3 text-right font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
            Size
          </th>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <th
              key={i}
              className="px-0 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-stone"
            >
              M{i}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {COHORTS.map((c) => (
          <tr key={c.cohort}>
            <td className="pr-3 py-1 font-mono text-[11px] uppercase tracking-[0.16em] text-ink whitespace-nowrap">
              {c.cohort}
            </td>
            <td className="pr-3 py-1 text-right font-mono text-xs tabular-nums text-ink-soft">
              {c.size}
            </td>
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const v = c.retention[i];
              if (v === undefined) {
                return (
                  <td key={i} className="px-0">
                    <div className="h-8 w-full border border-dashed border-hairline" />
                  </td>
                );
              }
              const alpha = 0.12 + v * 0.75;
              return (
                <td key={i} className="px-0">
                  <div
                    className="flex h-8 w-full items-center justify-center font-mono text-[10px] tabular-nums"
                    style={{
                      background: `rgba(31,58,47,${alpha.toFixed(2)})`,
                      color: v > 0.55 ? "#FAF6ED" : "#1C1C1A",
                    }}
                  >
                    {(v * 100).toFixed(0)}%
                  </div>
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
