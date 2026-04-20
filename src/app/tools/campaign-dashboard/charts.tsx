"use client";

// ---------------------------------------------------------------------------
// Hand-rolled SVG charts for the campaign dashboard.
//
// Everything is typed, deterministic, and uses only SVG primitives. No chart
// libraries. Palette is the warm editorial token map from globals.css.
// ---------------------------------------------------------------------------

import { useMemo, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import type { Channel, DailyPoint } from "@/lib/data/campaigns";
import { CHANNEL_META } from "@/lib/data/campaigns";

// ---------------------------------------------------------------------------
// Stacked spend chart — stacked per-channel area OR single total line.
// ---------------------------------------------------------------------------

export type StackedPoint = {
  date: string;
  total: number; // cents
  byChannel: Record<Channel, number>;
};

export function StackedSpendChart({
  points,
  mode,
  visibleChannels,
}: {
  points: StackedPoint[];
  mode: "stacked" | "total";
  visibleChannels: Set<Channel>;
}) {
  const W = 980;
  const H = 300;
  const pad = { top: 22, right: 24, bottom: 30, left: 72 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;

  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const n = points.length;

  const { max, series } = useMemo(() => {
    const visible = (Object.keys(CHANNEL_META) as Channel[]).filter((c) =>
      visibleChannels.has(c),
    );

    if (mode === "total") {
      let m = 0;
      const vals = points.map((p) => {
        let v = 0;
        for (const c of visible) v += p.byChannel[c] ?? 0;
        if (v > m) m = v;
        return v;
      });
      return { max: m, series: [{ channel: null as null, values: vals }] };
    }

    // Stacked: each channel's cumulative "top" line per day.
    const stacks: { channel: Channel; values: number[] }[] = visible.map(
      (c) => ({ channel: c, values: new Array(n).fill(0) }),
    );
    const running = new Array(n).fill(0);
    for (const stack of stacks) {
      for (let i = 0; i < n; i++) {
        running[i] += points[i].byChannel[stack.channel] ?? 0;
        stack.values[i] = running[i];
      }
    }
    const m = running.length ? Math.max(...running) : 0;
    return { max: m, series: stacks };
  }, [points, mode, visibleChannels, n]);

  if (n === 0) return null;

  const xScale = (i: number) =>
    n === 1 ? chartW / 2 : (i / (n - 1)) * chartW;
  const yScale = (v: number) =>
    chartH - (v / Math.max(1, max)) * chartH;

  const handleMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const loc = pt.matrixTransform(ctm.inverse());
    const x = loc.x - pad.left;
    if (x < 0 || x > chartW) {
      setHoverIdx(null);
      return;
    }
    const idx = Math.round((x / chartW) * (n - 1));
    setHoverIdx(Math.max(0, Math.min(n - 1, idx)));
  };

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * max);
  const fmtMoney = (c: number) => {
    if (c === 0) return "$0";
    if (c >= 100_000_00) return `$${Math.round(c / 100_000_0) / 10}M`;
    if (c >= 1_000_00) return `$${Math.round(c / 100_000)}k`;
    return `$${Math.round(c / 100)}`;
  };

  const activePoint = hoverIdx !== null ? points[hoverIdx] : null;

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="block h-auto w-full select-none"
        onMouseMove={handleMove}
        onMouseLeave={() => setHoverIdx(null)}
        role="img"
        aria-label="Daily spend, last 90 days"
      >
        <g transform={`translate(${pad.left},${pad.top})`}>
          {/* Gridlines + y labels */}
          {yTicks.map((t, i) => (
            <g key={i}>
              <line
                x1={0}
                x2={chartW}
                y1={yScale(t)}
                y2={yScale(t)}
                stroke="rgba(28,28,26,0.08)"
                strokeWidth={1}
              />
              <text
                x={-10}
                y={yScale(t)}
                textAnchor="end"
                dominantBaseline="middle"
                fontFamily="var(--font-mono)"
                fontSize={10}
                letterSpacing="0.08em"
                fill="#8F8B80"
                className="tabular-nums"
              >
                {fmtMoney(t)}
              </text>
            </g>
          ))}

          {/* Stacked areas (back to front) */}
          {mode === "stacked" &&
            series.map((s, i) => {
              if (!s.channel) return null;
              const color = CHANNEL_META[s.channel].color;
              const prev =
                i > 0 ? series[i - 1].values : new Array(n).fill(0);
              const top = s.values.map((v, idx) => `${xScale(idx)},${yScale(v)}`);
              const bottom = prev
                .map((v, idx) => `${xScale(idx)},${yScale(v)}`)
                .reverse();
              const path = `M${top.join(" L")} L${bottom.join(" L")} Z`;
              return (
                <path
                  key={s.channel}
                  d={path}
                  fill={color}
                  fillOpacity={0.78}
                  stroke={color}
                  strokeWidth={0.5}
                  strokeOpacity={0.3}
                />
              );
            })}

          {/* Total line mode */}
          {mode === "total" &&
            series.map((s) => {
              const linePath = s.values
                .map((v, i) => `${i === 0 ? "M" : "L"}${xScale(i)},${yScale(v)}`)
                .join(" ");
              const areaPath = `${linePath} L${xScale(n - 1)},${chartH} L${xScale(0)},${chartH} Z`;
              return (
                <g key="total">
                  <defs>
                    <linearGradient id="totalGrad" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#1F3A2F" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#1F3A2F" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d={areaPath} fill="url(#totalGrad)" />
                  <path
                    d={linePath}
                    fill="none"
                    stroke="#1F3A2F"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
              );
            })}

          {/* X ticks — week-ish spacing */}
          {points.map((p, i) => {
            const step = Math.max(1, Math.ceil(n / 8));
            if (i !== 0 && i !== n - 1 && i % step !== 0) return null;
            const d = new Date(p.date);
            const label = d.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });
            return (
              <g key={p.date}>
                <line
                  x1={xScale(i)}
                  x2={xScale(i)}
                  y1={chartH}
                  y2={chartH + 4}
                  stroke="rgba(28,28,26,0.22)"
                  strokeWidth={1}
                />
                <text
                  x={xScale(i)}
                  y={chartH + 18}
                  textAnchor="middle"
                  fontFamily="var(--font-mono)"
                  fontSize={10}
                  letterSpacing="0.1em"
                  fill="#8F8B80"
                >
                  {label}
                </text>
              </g>
            );
          })}

          {/* Crosshair */}
          {hoverIdx !== null && (
            <line
              x1={xScale(hoverIdx)}
              x2={xScale(hoverIdx)}
              y1={0}
              y2={chartH}
              stroke="#1C1C1A"
              strokeWidth={1}
              opacity={0.4}
            />
          )}
        </g>
      </svg>

      {activePoint && hoverIdx !== null && (
        <div
          className="pointer-events-none absolute top-3 max-w-[17rem] rounded-sm border border-hairline bg-bone/95 px-3 py-2.5 shadow-warm-sm backdrop-blur-sm"
          style={{
            left: `calc(${(pad.left + xScale(hoverIdx)) * 100 / W}% + 12px)`,
            transform:
              hoverIdx > n * 0.72 ? "translateX(-100%) translateX(-24px)" : undefined,
          }}
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-clay">
            {new Date(activePoint.date).toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </p>
          <p className="mt-1 font-display text-[20px] tabular-nums leading-none tracking-tight text-ink">
            ${new Intl.NumberFormat("en-US").format(Math.round(activePoint.total / 100))}
          </p>
          <dl className="mt-2 space-y-1 font-sans text-[11px] text-ink-soft">
            {(Object.keys(CHANNEL_META) as Channel[])
              .filter((c) => visibleChannels.has(c))
              .map((c) => {
                const v = activePoint.byChannel[c] ?? 0;
                if (v === 0) return null;
                return (
                  <div
                    key={c}
                    className="flex min-w-0 items-center justify-between gap-3"
                  >
                    <span className="flex min-w-0 items-center gap-1.5 text-stone">
                      <span
                        className="inline-block h-2 w-2 flex-shrink-0 rounded-sm"
                        style={{ background: CHANNEL_META[c].color }}
                      />
                      <span className="truncate">{CHANNEL_META[c].label}</span>
                    </span>
                    <span className="font-mono tabular-nums text-ink">
                      ${Math.round(v / 100).toLocaleString("en-US")}
                    </span>
                  </div>
                );
              })}
          </dl>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ROAS + CAC dual-line chart.
// ---------------------------------------------------------------------------

export type RoasCacPoint = {
  date: string;
  roas: number; // revenue / cost
  cac: number; // cost per conversion in cents (0 if no conv)
};

export function RoasCacChart({ points }: { points: RoasCacPoint[] }) {
  const W = 980;
  const H = 260;
  const pad = { top: 22, right: 72, bottom: 30, left: 62 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;

  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const n = points.length;

  const { maxRoas, maxCac } = useMemo(() => {
    let r = 1;
    let c = 1;
    for (const p of points) {
      if (p.roas > r) r = p.roas;
      if (p.cac > c) c = p.cac;
    }
    // pad maxes up 20% for headroom
    return { maxRoas: r * 1.2, maxCac: c * 1.2 };
  }, [points]);

  if (n === 0) return null;

  const xScale = (i: number) =>
    n === 1 ? chartW / 2 : (i / (n - 1)) * chartW;
  const yLeft = (v: number) => chartH - (v / maxRoas) * chartH;
  const yRight = (v: number) => chartH - (v / maxCac) * chartH;

  const roasPath = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${xScale(i)},${yLeft(p.roas)}`)
    .join(" ");
  const cacPath = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${xScale(i)},${yRight(p.cac)}`)
    .join(" ");

  const handleMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const loc = pt.matrixTransform(ctm.inverse());
    const x = loc.x - pad.left;
    if (x < 0 || x > chartW) return setHoverIdx(null);
    const idx = Math.round((x / chartW) * (n - 1));
    setHoverIdx(Math.max(0, Math.min(n - 1, idx)));
  };

  const lticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * maxRoas);
  const rticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * maxCac);

  const active = hoverIdx !== null ? points[hoverIdx] : null;

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="block h-auto w-full select-none"
        onMouseMove={handleMove}
        onMouseLeave={() => setHoverIdx(null)}
        role="img"
        aria-label="ROAS and CAC over time"
      >
        <g transform={`translate(${pad.left},${pad.top})`}>
          {/* Gridlines (left axis, ROAS) */}
          {lticks.map((t, i) => (
            <g key={`l${i}`}>
              <line
                x1={0}
                x2={chartW}
                y1={yLeft(t)}
                y2={yLeft(t)}
                stroke="rgba(28,28,26,0.06)"
                strokeWidth={1}
              />
              <text
                x={-10}
                y={yLeft(t)}
                textAnchor="end"
                dominantBaseline="middle"
                fontFamily="var(--font-mono)"
                fontSize={10}
                letterSpacing="0.08em"
                fill="#1F3A2F"
                className="tabular-nums"
              >
                {t.toFixed(1)}x
              </text>
            </g>
          ))}
          {/* Right axis labels, CAC */}
          {rticks.map((t, i) => (
            <text
              key={`r${i}`}
              x={chartW + 12}
              y={yRight(t)}
              textAnchor="start"
              dominantBaseline="middle"
              fontFamily="var(--font-mono)"
              fontSize={10}
              letterSpacing="0.08em"
              fill="#C85A3F"
              className="tabular-nums"
            >
              ${Math.round(t / 100).toLocaleString("en-US")}
            </text>
          ))}

          {/* 1x ROAS line — profitability threshold */}
          <line
            x1={0}
            x2={chartW}
            y1={yLeft(1)}
            y2={yLeft(1)}
            stroke="#1F3A2F"
            strokeWidth={1}
            strokeDasharray="1 3"
            opacity={0.4}
          />

          <path
            d={roasPath}
            fill="none"
            stroke="#1F3A2F"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={cacPath}
            fill="none"
            stroke="#C85A3F"
            strokeWidth={1.8}
            strokeDasharray="4 4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* X ticks */}
          {points.map((p, i) => {
            const step = Math.max(1, Math.ceil(n / 8));
            if (i !== 0 && i !== n - 1 && i % step !== 0) return null;
            const d = new Date(p.date);
            const label = d.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });
            return (
              <text
                key={p.date}
                x={xScale(i)}
                y={chartH + 18}
                textAnchor="middle"
                fontFamily="var(--font-mono)"
                fontSize={10}
                letterSpacing="0.1em"
                fill="#8F8B80"
              >
                {label}
              </text>
            );
          })}

          {hoverIdx !== null && (
            <>
              <line
                x1={xScale(hoverIdx)}
                x2={xScale(hoverIdx)}
                y1={0}
                y2={chartH}
                stroke="#1C1C1A"
                strokeWidth={1}
                opacity={0.35}
              />
              <circle
                cx={xScale(hoverIdx)}
                cy={yLeft(points[hoverIdx].roas)}
                r={4}
                fill="#1F3A2F"
                stroke="#FAF6ED"
                strokeWidth={2}
              />
              <circle
                cx={xScale(hoverIdx)}
                cy={yRight(points[hoverIdx].cac)}
                r={4}
                fill="#C85A3F"
                stroke="#FAF6ED"
                strokeWidth={2}
              />
            </>
          )}
        </g>
      </svg>

      {active && hoverIdx !== null && (
        <div
          className="pointer-events-none absolute top-3 max-w-[15rem] rounded-sm border border-hairline bg-bone/95 px-3 py-2.5 shadow-warm-sm backdrop-blur-sm"
          style={{
            left: `calc(${(pad.left + xScale(hoverIdx)) * 100 / W}% + 12px)`,
            transform:
              hoverIdx > n * 0.7 ? "translateX(-100%) translateX(-24px)" : undefined,
          }}
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-clay">
            {new Date(active.date).toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </p>
          <dl className="mt-2 space-y-1 font-sans text-[11px]">
            <div className="flex items-center justify-between gap-3">
              <dt className="flex items-center gap-1.5 text-stone">
                <span className="inline-block h-2 w-2 rounded-sm bg-forest" />
                <span>ROAS</span>
              </dt>
              <dd className="font-mono tabular-nums text-ink">
                {active.roas.toFixed(2)}x
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="flex items-center gap-1.5 text-stone">
                <span
                  className="inline-block h-2 w-2"
                  style={{
                    border: "1px dashed #C85A3F",
                  }}
                />
                <span>CAC</span>
              </dt>
              <dd className="font-mono tabular-nums text-ink">
                $
                {active.cac > 0
                  ? (active.cac / 100).toLocaleString("en-US", {
                      maximumFractionDigits: 0,
                    })
                  : "—"}
              </dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sparkline — tiny inline SVG, no axes.
// ---------------------------------------------------------------------------

export function Sparkline({
  values,
  color = "#1F3A2F",
  height = 28,
  width = 110,
  filled = false,
}: {
  values: number[];
  color?: string;
  height?: number;
  width?: number;
  filled?: boolean;
}) {
  const n = values.length;
  if (n === 0) {
    return (
      <svg width={width} height={height} aria-hidden="true">
        <line
          x1={0}
          x2={width}
          y1={height / 2}
          y2={height / 2}
          stroke="rgba(28,28,26,0.15)"
          strokeDasharray="2 3"
        />
      </svg>
    );
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(max - min, 1);
  const xScale = (i: number) =>
    n === 1 ? width / 2 : (i / (n - 1)) * width;
  const yScale = (v: number) => height - ((v - min) / range) * (height - 4) - 2;

  const path = values
    .map((v, i) => `${i === 0 ? "M" : "L"}${xScale(i)},${yScale(v)}`)
    .join(" ");
  const area = `${path} L${xScale(n - 1)},${height} L${xScale(0)},${height} Z`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
      className="block"
    >
      {filled && <path d={area} fill={color} fillOpacity={0.14} />}
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={xScale(n - 1)}
        cy={yScale(values[n - 1])}
        r={1.8}
        fill={color}
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Channel share bars — paired "spend vs revenue" share.
// ---------------------------------------------------------------------------

export function ChannelShareBars({
  rows,
}: {
  rows: Array<{
    channel: Channel;
    spendShare: number; // 0..1
    revenueShare: number; // 0..1
    roas: number;
    spendCents: number;
    revenueCents: number;
  }>;
}) {
  return (
    <div className="space-y-5">
      {rows.map((r) => {
        const meta = CHANNEL_META[r.channel];
        return (
          <div key={r.channel} className="min-w-0">
            <div className="flex items-baseline justify-between gap-4">
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className="inline-block h-2 w-2 flex-shrink-0 rounded-sm"
                  style={{ background: meta.color }}
                />
                <span className="truncate font-sans text-sm text-ink">
                  {meta.label}
                </span>
              </div>
              <div className="flex flex-shrink-0 items-baseline gap-3 font-mono text-xs tabular-nums">
                <span
                  className={cn(
                    r.roas >= 1 ? "text-forest" : "text-clay",
                  )}
                >
                  {r.roas.toFixed(2)}x
                </span>
                <span className="text-stone">ROAS</span>
              </div>
            </div>
            <div className="mt-2 space-y-1">
              <BarPair
                label="Spend"
                pct={r.spendShare}
                color={meta.color}
                value={`$${Math.round(r.spendCents / 100).toLocaleString("en-US")}`}
                filled
              />
              <BarPair
                label="Revenue"
                pct={r.revenueShare}
                color={meta.color}
                value={`$${Math.round(r.revenueCents / 100).toLocaleString("en-US")}`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BarPair({
  label,
  pct,
  color,
  value,
  filled,
}: {
  label: string;
  pct: number;
  color: string;
  value: string;
  filled?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-16 flex-shrink-0 font-mono text-[10px] uppercase tracking-[0.18em] text-stone">
        {label}
      </span>
      <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-bone">
        <div
          className="absolute inset-y-0 left-0"
          style={{
            width: `${Math.max(0.5, Math.min(100, pct * 100))}%`,
            background: filled ? color : "transparent",
            border: filled ? "none" : `1.5px solid ${color}`,
            borderRadius: 999,
          }}
        />
      </div>
      <span className="w-20 flex-shrink-0 text-right font-mono text-xs tabular-nums text-ink">
        {value}
      </span>
    </div>
  );
}
