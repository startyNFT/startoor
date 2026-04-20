"use client";

// ---------------------------------------------------------------------------
// Campaign Dashboard — warm editorial ops view.
//
// All math is derived client-side from the synthetic dataset in
// `/src/lib/data/campaigns.ts`. Filters apply to every section. Filter state
// is persisted to localStorage.
// ---------------------------------------------------------------------------

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Download, Layers, Minus } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  CAMPAIGNS,
  CHANNEL_META,
  DASHBOARD_TODAY,
  OBJECTIVE_LABEL,
  STATUS_META,
  type Campaign,
  type CampaignStatus,
  type Channel,
  type DailyPoint,
  type Objective,
} from "@/lib/data/campaigns";
import {
  ChannelShareBars,
  RoasCacChart,
  Sparkline,
  StackedSpendChart,
  type RoasCacPoint,
  type StackedPoint,
} from "./charts";
import { CampaignsTable, ChannelChip, type CampaignRow } from "./campaigns-table";

// ---------------------------------------------------------------------------
// Filter state
// ---------------------------------------------------------------------------

type RangeKey = "7d" | "30d" | "90d" | "custom";

type FilterState = {
  range: RangeKey;
  customStart: string; // only used when range === 'custom'
  customEnd: string;
  channels: Channel[]; // empty means "all"
  statuses: CampaignStatus[]; // empty means "all"
  objective: Objective | "all";
  chartMode: "stacked" | "total";
};

const ALL_CHANNELS: Channel[] = [
  "google",
  "meta",
  "tiktok",
  "linkedin",
  "youtube",
  "email",
];
const ALL_STATUSES: CampaignStatus[] = [
  "active",
  "paused",
  "ended",
  "learning",
];

const DEFAULT_FILTERS: FilterState = {
  range: "30d",
  customStart: "",
  customEnd: DASHBOARD_TODAY,
  channels: [],
  statuses: [],
  objective: "all",
  chartMode: "stacked",
};

const STORAGE_KEY = "startoor_campaign_dashboard_v1";

// ---------------------------------------------------------------------------
// Date helpers (work off DASHBOARD_TODAY so the dataset is stable)
// ---------------------------------------------------------------------------

function isoAddDays(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

function formatDateLabel(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function rangeBounds(f: FilterState): { from: string; to: string; days: number } {
  const to = DASHBOARD_TODAY;
  if (f.range === "7d") return { from: isoAddDays(to, -6), to, days: 7 };
  if (f.range === "30d") return { from: isoAddDays(to, -29), to, days: 30 };
  if (f.range === "90d") return { from: isoAddDays(to, -89), to, days: 90 };
  // custom
  const start = f.customStart || isoAddDays(to, -29);
  const end = f.customEnd || to;
  const days =
    Math.max(
      1,
      Math.round(
        (Date.parse(end) - Date.parse(start)) / (24 * 60 * 60 * 1000),
      ) + 1,
    );
  return { from: start, to: end, days };
}

function filterCampaigns(f: FilterState): Campaign[] {
  return CAMPAIGNS.filter((c) => {
    if (f.channels.length > 0 && !f.channels.includes(c.channel)) return false;
    if (f.statuses.length > 0 && !f.statuses.includes(c.status)) return false;
    if (f.objective !== "all" && c.objective !== f.objective) return false;
    return true;
  });
}

function pointInWindow(p: DailyPoint, from: string, to: string) {
  return p.date >= from && p.date <= to;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export function CampaignDashboard() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<FilterState>;
        setFilters((prev) => ({ ...prev, ...parsed }));
      }
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
    } catch {}
  }, [filters, hydrated]);

  const bounds = useMemo(() => rangeBounds(filters), [filters]);
  const filteredCampaigns = useMemo(() => filterCampaigns(filters), [filters]);

  // Per-campaign window aggregates — used by top tiles, table, channel share.
  const campaignRows: CampaignRow[] = useMemo(() => {
    return filteredCampaigns.map((c) => {
      const windowSeries = c.series.filter((p) =>
        pointInWindow(p, bounds.from, bounds.to),
      );
      const sums = windowSeries.reduce(
        (acc, r) => {
          acc.impressions += r.impressions;
          acc.clicks += r.clicks;
          acc.costCents += r.costCents;
          acc.conversions += r.conversions;
          acc.revenueCents += r.revenueCents;
          return acc;
        },
        {
          impressions: 0,
          clicks: 0,
          costCents: 0,
          conversions: 0,
          revenueCents: 0,
        },
      );
      const roas = sums.costCents > 0 ? sums.revenueCents / sums.costCents : 0;
      const cpaCents =
        sums.conversions > 0 ? Math.round(sums.costCents / sums.conversions) : 0;
      const ctr = sums.impressions > 0 ? sums.clicks / sums.impressions : 0;
      return { campaign: c, windowSeries, ...sums, roas, cpaCents, ctr };
    });
  }, [filteredCampaigns, bounds.from, bounds.to]);

  // Daily aggregates for charts.
  const dailyAgg = useMemo(() => {
    // Collect every date in window from union of series.
    const dateMap = new Map<
      string,
      {
        date: string;
        costCents: number;
        revenueCents: number;
        conversions: number;
        byChannel: Record<Channel, number>;
      }
    >();
    for (const row of campaignRows) {
      for (const p of row.windowSeries) {
        let bucket = dateMap.get(p.date);
        if (!bucket) {
          bucket = {
            date: p.date,
            costCents: 0,
            revenueCents: 0,
            conversions: 0,
            byChannel: {
              google: 0,
              meta: 0,
              tiktok: 0,
              linkedin: 0,
              youtube: 0,
              email: 0,
            },
          };
          dateMap.set(p.date, bucket);
        }
        bucket.costCents += p.costCents;
        bucket.revenueCents += p.revenueCents;
        bucket.conversions += p.conversions;
        bucket.byChannel[row.campaign.channel] += p.costCents;
      }
    }
    return Array.from(dateMap.values()).sort((a, b) =>
      a.date < b.date ? -1 : a.date > b.date ? 1 : 0,
    );
  }, [campaignRows]);

  // Top-line summary with prior-period delta.
  const topSummary = useMemo(() => {
    const current = campaignRows.reduce(
      (acc, r) => {
        acc.spend += r.costCents;
        acc.revenue += r.revenueCents;
        acc.conversions += r.conversions;
        return acc;
      },
      { spend: 0, revenue: 0, conversions: 0 },
    );
    const roas = current.spend > 0 ? current.revenue / current.spend : 0;

    // 7d vs prior 7d delta, computed off the last 14 days of dailyAgg.
    const last14 = dailyAgg.slice(-14);
    const halfIdx = Math.max(0, last14.length - 7);
    const last7 = last14.slice(halfIdx);
    const prior7 = last14.slice(0, halfIdx);
    const sum = (rows: typeof dailyAgg, k: "costCents" | "revenueCents" | "conversions") =>
      rows.reduce((s, r) => s + r[k], 0);
    const deltaPct = (a: number, b: number) => {
      if (b === 0) return a > 0 ? 100 : 0;
      return ((a - b) / b) * 100;
    };
    const curSpend7 = sum(last7, "costCents");
    const priorSpend7 = sum(prior7, "costCents");
    const curRev7 = sum(last7, "revenueCents");
    const priorRev7 = sum(prior7, "revenueCents");
    const curConv7 = sum(last7, "conversions");
    const priorConv7 = sum(prior7, "conversions");

    const curRoas7 =
      curSpend7 > 0 ? curRev7 / curSpend7 : 0;
    const priorRoas7 =
      priorSpend7 > 0 ? priorRev7 / priorSpend7 : 0;

    return {
      spend: current.spend,
      revenue: current.revenue,
      conversions: current.conversions,
      roas,
      deltas: {
        spend: deltaPct(curSpend7, priorSpend7),
        revenue: deltaPct(curRev7, priorRev7),
        roas: priorRoas7 > 0
          ? ((curRoas7 - priorRoas7) / priorRoas7) * 100
          : 0,
        conversions: deltaPct(curConv7, priorConv7),
      },
    };
  }, [campaignRows, dailyAgg]);

  // Pacing — active campaigns only; compare spend-so-far vs expected-by-now-this-month.
  const pacingItems = useMemo(() => {
    // "Month" here is a 30-day rolling budget period ending today. We compute
    // expected spend = dailyBudget × days-elapsed-in-period, where days-elapsed
    // is derived from the campaign's startDate (clamped to 30d max).
    const today = DASHBOARD_TODAY;
    return filteredCampaigns
      .filter((c) => c.status === "active")
      .map((c) => {
        const periodStart = isoAddDays(today, -29);
        const effectiveStart = c.startDate > periodStart ? c.startDate : periodStart;
        const daysElapsed = Math.max(
          0,
          Math.min(
            30,
            Math.round(
              (Date.parse(today) - Date.parse(effectiveStart)) /
                (24 * 60 * 60 * 1000),
            ) + 1,
          ),
        );
        const expected = c.dailyBudgetCents * daysElapsed;
        const spent = c.series
          .filter((p) => p.date >= effectiveStart && p.date <= today)
          .reduce((s, r) => s + r.costCents, 0);
        const pacePct = expected > 0 ? (spent / expected) * 100 : 0;
        return {
          campaign: c,
          spent,
          expected,
          pacePct,
        };
      })
      .sort((a, b) => Math.abs(b.pacePct - 100) - Math.abs(a.pacePct - 100))
      .slice(0, 8);
  }, [filteredCampaigns]);

  // Anomaly cards — editorial-style "things to notice."
  const anomalies = useMemo(() => buildAnomalies(campaignRows), [campaignRows]);

  // Channel share
  const channelShare = useMemo(() => {
    const totalSpend = campaignRows.reduce((s, r) => s + r.costCents, 0);
    const totalRev = campaignRows.reduce((s, r) => s + r.revenueCents, 0);
    const byChannel = new Map<
      Channel,
      { spend: number; revenue: number }
    >();
    for (const r of campaignRows) {
      const cur = byChannel.get(r.campaign.channel) ?? { spend: 0, revenue: 0 };
      cur.spend += r.costCents;
      cur.revenue += r.revenueCents;
      byChannel.set(r.campaign.channel, cur);
    }
    return ALL_CHANNELS
      .map((ch) => {
        const v = byChannel.get(ch) ?? { spend: 0, revenue: 0 };
        return {
          channel: ch,
          spendShare: totalSpend > 0 ? v.spend / totalSpend : 0,
          revenueShare: totalRev > 0 ? v.revenue / totalRev : 0,
          roas: v.spend > 0 ? v.revenue / v.spend : 0,
          spendCents: v.spend,
          revenueCents: v.revenue,
        };
      })
      .filter((r) => r.spendCents > 0 || r.revenueCents > 0)
      .sort((a, b) => b.spendCents - a.spendCents);
  }, [campaignRows]);

  const stackedPoints: StackedPoint[] = useMemo(() => {
    return dailyAgg.map((d) => ({
      date: d.date,
      total: Object.values(d.byChannel).reduce((s, v) => s + v, 0),
      byChannel: d.byChannel,
    }));
  }, [dailyAgg]);

  const roasCacPoints: RoasCacPoint[] = useMemo(() => {
    return dailyAgg.map((d) => ({
      date: d.date,
      roas: d.costCents > 0 ? d.revenueCents / d.costCents : 0,
      cac:
        d.conversions > 0 ? Math.round(d.costCents / d.conversions) : 0,
    }));
  }, [dailyAgg]);

  const visibleChannels = useMemo(
    () =>
      new Set<Channel>(
        filters.channels.length > 0 ? filters.channels : ALL_CHANNELS,
      ),
    [filters.channels],
  );

  // ---------- actions ----------

  const patch = (p: Partial<FilterState>) =>
    setFilters((s) => ({ ...s, ...p }));

  const toggleChannel = (ch: Channel) => {
    setFilters((s) => ({
      ...s,
      channels: s.channels.includes(ch)
        ? s.channels.filter((c) => c !== ch)
        : [...s.channels, ch],
    }));
  };
  const toggleStatus = (st: CampaignStatus) => {
    setFilters((s) => ({
      ...s,
      statuses: s.statuses.includes(st)
        ? s.statuses.filter((x) => x !== st)
        : [...s.statuses, st],
    }));
  };

  const reset = () => {
    setFilters(DEFAULT_FILTERS);
    toast.success("Filters reset.");
  };

  const exportCsv = () => {
    const header = [
      "id",
      "name",
      "channel",
      "objective",
      "status",
      "spend_usd",
      "revenue_usd",
      "roas",
      "conversions",
      "cpa_usd",
      "impressions",
      "clicks",
      "ctr",
    ];
    const lines = [header.join(",")];
    for (const r of campaignRows) {
      lines.push(
        [
          r.campaign.id,
          `"${r.campaign.name.replace(/"/g, '""')}"`,
          r.campaign.channel,
          r.campaign.objective,
          r.campaign.status,
          (r.costCents / 100).toFixed(2),
          (r.revenueCents / 100).toFixed(2),
          r.roas.toFixed(3),
          r.conversions,
          r.cpaCents > 0 ? (r.cpaCents / 100).toFixed(2) : "",
          r.impressions,
          r.clicks,
          r.ctr.toFixed(4),
        ].join(","),
      );
    }
    // Summary tail
    lines.push("");
    lines.push(
      `"window","${bounds.from} to ${bounds.to}","days=${bounds.days}"`,
    );
    lines.push(
      `"totals","spend_usd=${(topSummary.spend / 100).toFixed(2)}","revenue_usd=${(topSummary.revenue / 100).toFixed(2)}","roas=${topSummary.roas.toFixed(3)}","conversions=${topSummary.conversions}"`,
    );

    const blob = new Blob([lines.join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `campaign-dashboard-${bounds.from}_to_${bounds.to}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("CSV exported.");
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div>
      {/* Sticky filter bar */}
      <FilterBar
        filters={filters}
        onRangeChange={(r) => patch({ range: r })}
        onCustomStart={(v) => patch({ range: "custom", customStart: v })}
        onCustomEnd={(v) => patch({ range: "custom", customEnd: v })}
        onToggleChannel={toggleChannel}
        onToggleStatus={toggleStatus}
        onObjective={(o) => patch({ objective: o })}
        onReset={reset}
        onExport={exportCsv}
        bounds={bounds}
        totalCampaigns={filteredCampaigns.length}
      />

      <div className="mx-auto max-w-7xl px-6 pb-20 pt-10 md:px-10 md:pt-12">
        {/* Top summary bar */}
        <section>
          <div className="flex items-baseline justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-clay">
                Last {bounds.days} days · {formatDateLabel(bounds.from)} → {formatDateLabel(bounds.to)}
              </p>
              <h2 className="mt-2 font-display text-3xl leading-[1.02] tracking-tight text-ink md:text-[40px]">
                {filteredCampaigns.length} campaigns on the board.
              </h2>
            </div>
            <p className="hidden font-mono text-[10px] uppercase tracking-[0.22em] text-stone md:block">
              Deltas vs. prior 7 days
            </p>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <SummaryTile
              label="Total spend"
              value={formatMoney(topSummary.spend)}
              delta={topSummary.deltas.spend}
              invertTone
            />
            <SummaryTile
              label="Total revenue"
              value={formatMoney(topSummary.revenue)}
              delta={topSummary.deltas.revenue}
            />
            <SummaryTile
              label="ROAS"
              value={`${topSummary.roas.toFixed(2)}x`}
              delta={topSummary.deltas.roas}
            />
            <SummaryTile
              label="Conversions"
              value={topSummary.conversions.toLocaleString("en-US")}
              delta={topSummary.deltas.conversions}
            />
          </div>
        </section>

        {/* Pacing strip */}
        <section className="mt-12">
          <SectionHeader
            eyebrow="Pacing · 30-day rolling"
            title="Are we burning budget the way we said we would?"
            subtitle={`Dot is ${pacingItems.length} active campaign${pacingItems.length === 1 ? "" : "s"} — spent vs. expected-by-today.`}
          />
          {pacingItems.length === 0 ? (
            <EmptyNote>No active campaigns in the current filter.</EmptyNote>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {pacingItems.map((p) => (
                <PacingRow
                  key={p.campaign.id}
                  name={p.campaign.name}
                  channel={p.campaign.channel}
                  spent={p.spent}
                  expected={p.expected}
                  pacePct={p.pacePct}
                />
              ))}
            </div>
          )}
        </section>

        {/* Stacked spend chart */}
        <section className="mt-14">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeader
              eyebrow="Daily spend"
              title="Where the budget actually went."
              subtitle={`${bounds.days} days — hover for the per-channel breakdown.`}
            />
            <div className="inline-flex rounded-full border border-hairline bg-bone p-0.5 font-mono text-[10px] uppercase tracking-[0.18em]">
              <ModeTab
                active={filters.chartMode === "stacked"}
                onClick={() => patch({ chartMode: "stacked" })}
              >
                <Layers className="h-3 w-3" /> Stacked
              </ModeTab>
              <ModeTab
                active={filters.chartMode === "total"}
                onClick={() => patch({ chartMode: "total" })}
              >
                Total line
              </ModeTab>
            </div>
          </div>
          <div className="mt-6 overflow-hidden border border-hairline bg-warm-white p-4 md:p-6">
            <StackedSpendChart
              points={stackedPoints}
              mode={filters.chartMode}
              visibleChannels={visibleChannels}
            />
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-hairline-soft pt-4">
              {ALL_CHANNELS.filter((ch) => visibleChannels.has(ch)).map(
                (ch) => (
                  <span
                    key={ch}
                    className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-stone"
                  >
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-sm"
                      style={{ background: CHANNEL_META[ch].color }}
                    />
                    <span className="text-ink">{CHANNEL_META[ch].label}</span>
                  </span>
                ),
              )}
            </div>
          </div>
        </section>

        {/* ROAS & CAC */}
        <section className="mt-14">
          <SectionHeader
            eyebrow="Efficiency · ROAS + CAC"
            title="Is the money getting lazier?"
            subtitle="Green is ROAS (left). Clay dashed is CAC (right). Dotted line at 1.0x ROAS — above it you make money, below it you don't."
          />
          <div className="mt-6 overflow-hidden border border-hairline bg-warm-white p-4 md:p-6">
            <RoasCacChart points={roasCacPoints} />
          </div>
        </section>

        {/* Anomaly tiles */}
        <section className="mt-14">
          <SectionHeader
            eyebrow="Things to notice"
            title="The desk's notes from this week."
          />
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-2">
            {anomalies.length === 0 && (
              <EmptyNote>No anomalies flagged in the current window.</EmptyNote>
            )}
            {anomalies.map((a, i) => (
              <AnomalyCard key={i} {...a} />
            ))}
          </div>
        </section>

        {/* Campaigns table */}
        <section className="mt-14">
          <SectionHeader
            eyebrow="The roster"
            title="Every campaign, sortable."
            subtitle="Click any row to open a 30-day sparkline view."
          />
          <div className="mt-6">
            <CampaignsTable rows={campaignRows} />
          </div>
        </section>

        {/* Channel breakdown */}
        <section className="mt-14">
          <SectionHeader
            eyebrow="Channel split"
            title="Spend vs. revenue share per channel."
            subtitle="Filled bar = share of spend. Outlined bar = share of revenue. The gap is where the money's actually working."
          />
          <div className="mt-6 border border-hairline bg-warm-white p-6 md:p-8">
            {channelShare.length === 0 ? (
              <EmptyNote>No channels in the current filter.</EmptyNote>
            ) : (
              <ChannelShareBars rows={channelShare} />
            )}
          </div>
        </section>

        <footer className="mt-16 border-t border-hairline pt-6 font-mono text-[10px] uppercase tracking-[0.22em] text-stone">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p>
              {filteredCampaigns.length} of {CAMPAIGNS.length} campaigns · window
              {" "}
              <span className="text-ink">{bounds.from} → {bounds.to}</span>
            </p>
            <p>
              Synthetic demo data · no live feeds · export with the CSV button
              above
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Filter bar — sticky beneath the tool chrome.
// ---------------------------------------------------------------------------

function FilterBar({
  filters,
  onRangeChange,
  onCustomStart,
  onCustomEnd,
  onToggleChannel,
  onToggleStatus,
  onObjective,
  onReset,
  onExport,
  bounds,
  totalCampaigns,
}: {
  filters: FilterState;
  onRangeChange: (r: RangeKey) => void;
  onCustomStart: (v: string) => void;
  onCustomEnd: (v: string) => void;
  onToggleChannel: (c: Channel) => void;
  onToggleStatus: (s: CampaignStatus) => void;
  onObjective: (o: Objective | "all") => void;
  onReset: () => void;
  onExport: () => void;
  bounds: { from: string; to: string; days: number };
  totalCampaigns: number;
}) {
  return (
    <div className="sticky top-[6.75rem] z-20 border-b border-hairline bg-paper/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-6 py-3 md:px-10">
        {/* Date range */}
        <div className="inline-flex items-center gap-1 rounded-full border border-hairline bg-bone p-0.5">
          {(["7d", "30d", "90d"] as RangeKey[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => onRangeChange(r)}
              className={cn(
                "rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors",
                filters.range === r
                  ? "bg-ink text-bone"
                  : "text-ink-soft hover:text-ink",
              )}
            >
              {r === "7d" ? "7 days" : r === "30d" ? "30 days" : "90 days"}
            </button>
          ))}
          <button
            type="button"
            onClick={() => onRangeChange("custom")}
            className={cn(
              "rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors",
              filters.range === "custom"
                ? "bg-ink text-bone"
                : "text-ink-soft hover:text-ink",
            )}
          >
            Custom
          </button>
        </div>

        {filters.range === "custom" && (
          <div className="inline-flex items-center gap-2 rounded-full border border-hairline bg-bone px-3 py-1 font-mono text-[11px] tabular-nums text-ink">
            <input
              type="date"
              value={filters.customStart || bounds.from}
              max={filters.customEnd || DASHBOARD_TODAY}
              onChange={(e) => onCustomStart(e.target.value)}
              className="bg-transparent focus:outline-none"
            />
            <span className="text-stone">→</span>
            <input
              type="date"
              value={filters.customEnd || DASHBOARD_TODAY}
              min={filters.customStart || undefined}
              max={DASHBOARD_TODAY}
              onChange={(e) => onCustomEnd(e.target.value)}
              className="bg-transparent focus:outline-none"
            />
          </div>
        )}

        <Divider />

        {/* Channel multi-select */}
        <div className="flex flex-wrap items-center gap-1.5">
          {ALL_CHANNELS.map((ch) => {
            const on =
              filters.channels.length === 0 || filters.channels.includes(ch);
            const meta = CHANNEL_META[ch];
            return (
              <button
                key={ch}
                type="button"
                onClick={() => onToggleChannel(ch)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em] transition-all",
                  on
                    ? "border-ink text-ink"
                    : "border-hairline text-stone opacity-60 hover:opacity-100",
                )}
                title={
                  filters.channels.length === 0
                    ? `Click to show only ${meta.label}`
                    : on
                      ? `Hide ${meta.label}`
                      : `Show ${meta.label}`
                }
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: meta.color, opacity: on ? 1 : 0.3 }}
                />
                {meta.label}
              </button>
            );
          })}
        </div>

        <Divider />

        {/* Status multi-select */}
        <div className="flex flex-wrap items-center gap-1.5">
          {ALL_STATUSES.map((st) => {
            const on =
              filters.statuses.length === 0 || filters.statuses.includes(st);
            return (
              <button
                key={st}
                type="button"
                onClick={() => onToggleStatus(st)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em] transition-all",
                  on
                    ? "border-ink text-ink"
                    : "border-hairline text-stone opacity-60 hover:opacity-100",
                )}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{
                    background: STATUS_META[st].dot,
                    opacity: on ? 1 : 0.3,
                  }}
                />
                {STATUS_META[st].label}
              </button>
            );
          })}
        </div>

        <Divider />

        {/* Objective */}
        <select
          value={filters.objective}
          onChange={(e) => onObjective(e.target.value as Objective | "all")}
          className="rounded-full border border-hairline bg-bone px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ink focus:border-ink focus:outline-none"
        >
          <option value="all">All objectives</option>
          {(Object.keys(OBJECTIVE_LABEL) as Objective[]).map((o) => (
            <option key={o} value={o}>
              {OBJECTIVE_LABEL[o]}
            </option>
          ))}
        </select>

        <div className="ml-auto flex items-center gap-2">
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.22em] text-stone md:inline">
            {totalCampaigns} campaign{totalCampaigns === 1 ? "" : "s"}
          </span>
          <button
            type="button"
            onClick={onReset}
            className="rounded-full border border-hairline px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft transition-colors hover:border-ink hover:text-ink"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={onExport}
            className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-bone transition-colors hover:bg-forest"
          >
            <Download className="h-3 w-3" />
            Export CSV
          </button>
        </div>
      </div>
    </div>
  );
}

function Divider() {
  return <span className="hidden h-4 w-px bg-hairline md:inline-block" />;
}

function ModeTab({
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
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 transition-colors",
        active
          ? "bg-ink text-bone"
          : "text-ink-soft hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Section header
// ---------------------------------------------------------------------------

function SectionHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-clay">
        {eyebrow}
      </p>
      <h2 className="mt-2 font-display text-2xl leading-[1.05] tracking-tight text-ink md:text-[28px]">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-2 max-w-2xl font-sans text-sm leading-relaxed text-ink-soft">
          {subtitle}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Summary tile
// ---------------------------------------------------------------------------

function SummaryTile({
  label,
  value,
  delta,
  invertTone,
}: {
  label: string;
  value: string;
  delta: number;
  invertTone?: boolean;
}) {
  const flat = Math.abs(delta) < 0.5;
  const up = delta >= 0;
  // For spend, "up" is costly — we invert the tone (up = clay, down = forest).
  const good = invertTone ? !up : up;
  const tone = flat
    ? "text-stone"
    : good
      ? "text-forest"
      : "text-clay";
  const Icon = flat ? Minus : up ? ArrowUp : ArrowDown;

  return (
    <div className="relative flex min-w-0 flex-col overflow-hidden border border-hairline bg-warm-white p-5">
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-clay">
        {label}
      </span>
      <p className="mt-3 font-display text-[22px] leading-[1.05] tracking-tight text-ink tabular-nums md:text-[26px]">
        {value}
      </p>
      <div
        className={cn(
          "mt-3 inline-flex items-center gap-1 font-mono text-xs tabular-nums",
          tone,
        )}
      >
        <Icon className="h-3 w-3" />
        <span>
          {flat
            ? "Flat"
            : `${Math.abs(delta).toFixed(1)}%`}
        </span>
        <span className="ml-1 text-stone">vs. prior 7d</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pacing row
// ---------------------------------------------------------------------------

function PacingRow({
  name,
  channel,
  spent,
  expected,
  pacePct,
}: {
  name: string;
  channel: Channel;
  spent: number;
  expected: number;
  pacePct: number;
}) {
  // Pacing semantics:
  //   95-105%  = on pace (forest)
  //   85-95 or 105-120 = watch (butter)
  //   < 85 or > 120 = off pace (clay)
  const absDelta = Math.abs(pacePct - 100);
  const tone =
    absDelta <= 5 ? "forest" : absDelta <= 20 ? "butter" : "clay";
  const dot =
    tone === "forest" ? "#1F3A2F" : tone === "butter" ? "#E8C77F" : "#C85A3F";
  const label =
    tone === "forest" ? "On pace" : tone === "butter" ? "Watch" : "Off pace";

  const barPct = Math.max(0, Math.min(140, pacePct));
  const meta = CHANNEL_META[channel];

  return (
    <div className="border border-hairline bg-warm-white p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full"
              style={{ background: dot }}
            />
            <span className="truncate font-sans text-sm text-ink">{name}</span>
          </div>
          <p className="mt-1 truncate font-mono text-[10px] uppercase tracking-[0.18em] text-stone">
            {meta.label} · {label}
          </p>
        </div>
        <p className="flex-shrink-0 text-right font-mono text-xs tabular-nums text-ink">
          {pacePct.toFixed(0)}%
        </p>
      </div>
      <div className="relative mt-3 h-1.5 overflow-hidden rounded-full bg-bone">
        {/* 100% mark */}
        <div
          className="absolute inset-y-0 w-px bg-hairline"
          style={{ left: `${(100 / 140) * 100}%` }}
        />
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${(barPct / 140) * 100}%`,
            background: dot,
            opacity: 0.85,
          }}
        />
      </div>
      <div className="mt-2 flex items-baseline justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.16em] text-stone">
        <span>
          <span className="text-ink tabular-nums">
            ${Math.round(spent / 100).toLocaleString("en-US")}
          </span>{" "}
          spent
        </span>
        <span>
          of{" "}
          <span className="text-ink tabular-nums">
            ${Math.round(expected / 100).toLocaleString("en-US")}
          </span>{" "}
          expected
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Anomaly detection + card
// ---------------------------------------------------------------------------

type Anomaly = {
  label: string;
  headline: string;
  body: string;
  tone: "good" | "bad" | "neutral";
  spark: number[];
  sparkColor: string;
  value?: string;
};

function buildAnomalies(rows: CampaignRow[]): Anomaly[] {
  if (rows.length === 0) return [];
  const out: Anomaly[] = [];

  // 1) Biggest spike day across the whole window.
  const dayMap = new Map<string, { cost: number; rev: number; conv: number }>();
  for (const r of rows) {
    for (const p of r.windowSeries) {
      const b = dayMap.get(p.date) ?? { cost: 0, rev: 0, conv: 0 };
      b.cost += p.costCents;
      b.rev += p.revenueCents;
      b.conv += p.conversions;
      dayMap.set(p.date, b);
    }
  }
  const days = Array.from(dayMap.entries())
    .map(([d, v]) => ({ date: d, ...v }))
    .sort((a, b) => (a.date < b.date ? -1 : 1));

  if (days.length > 3) {
    // Spike = day where revenue is >1.6x the rolling-7 average.
    const window = 7;
    let spikeIdx = -1;
    let spikeRatio = 0;
    for (let i = window; i < days.length; i++) {
      const slice = days.slice(i - window, i);
      const avg = slice.reduce((s, x) => s + x.rev, 0) / window;
      if (avg === 0) continue;
      const ratio = days[i].rev / avg;
      if (ratio > spikeRatio) {
        spikeRatio = ratio;
        spikeIdx = i;
      }
    }
    if (spikeIdx > 0 && spikeRatio > 1.6) {
      out.push({
        label: "Revenue spike",
        headline: `${formatDateLabel(days[spikeIdx].date)} printed ${spikeRatio.toFixed(1)}x the rolling-week average.`,
        body: "Best guess: a promo push or an anomaly. Worth checking the creative calendar and any external events that day.",
        tone: "good",
        spark: days.slice(Math.max(0, spikeIdx - 10), spikeIdx + 3).map((d) => d.rev),
        sparkColor: "#1F3A2F",
        value: `+${((spikeRatio - 1) * 100).toFixed(0)}%`,
      });
    }

    // Weekend/holiday dip: find the lowest day relative to surrounding week
    let dipIdx = -1;
    let dipRatio = Infinity;
    for (let i = window; i < days.length; i++) {
      const slice = days.slice(i - window, i);
      const avg = slice.reduce((s, x) => s + x.rev, 0) / window;
      if (avg === 0) continue;
      const ratio = days[i].rev / avg;
      if (ratio < dipRatio) {
        dipRatio = ratio;
        dipIdx = i;
      }
    }
    if (dipIdx > 0 && dipRatio < 0.55) {
      out.push({
        label: "Revenue dip",
        headline: `${formatDateLabel(days[dipIdx].date)} came in at ${(dipRatio * 100).toFixed(0)}% of the week-prior baseline.`,
        body: "Looks like a weekend pull-back or a delivery blip. If it repeats two weeks running, revisit pacing or day-parting.",
        tone: "bad",
        spark: days.slice(Math.max(0, dipIdx - 10), dipIdx + 3).map((d) => d.rev),
        sparkColor: "#C85A3F",
        value: `${((dipRatio - 1) * 100).toFixed(0)}%`,
      });
    }
  }

  // 2) Creep detection: active campaign whose CPA is materially worse in the
  //    last 14d vs the prior 14d (and spend volume is non-trivial).
  const creepers = rows
    .filter((r) => r.campaign.status === "active" && r.costCents > 50_000_00)
    .map((r) => {
      const full = r.windowSeries;
      if (full.length < 28) return null;
      const last = full.slice(-14);
      const prior = full.slice(-28, -14);
      const sumConv = (s: typeof full) => s.reduce((a, x) => a + x.conversions, 0);
      const sumCost = (s: typeof full) => s.reduce((a, x) => a + x.costCents, 0);
      const lConv = sumConv(last);
      const pConv = sumConv(prior);
      if (lConv === 0 || pConv === 0) return null;
      const lCpa = sumCost(last) / lConv;
      const pCpa = sumCost(prior) / pConv;
      const change = (lCpa - pCpa) / pCpa;
      return { row: r, change, lCpa, pCpa, spark: full.slice(-28).map((d) => {
        return d.conversions === 0 ? 0 : d.costCents / d.conversions;
      }) };
    })
    .filter((x): x is NonNullable<typeof x> => !!x && x.change > 0.2)
    .sort((a, b) => b.change - a.change)
    .slice(0, 1);

  for (const c of creepers) {
    out.push({
      label: "CAC creep detected",
      headline: `${c.row.campaign.name} is paying ${((c.change) * 100).toFixed(0)}% more per conversion than two weeks ago.`,
      body: `CPA drifted from $${Math.round(c.pCpa / 100)} to $${Math.round(c.lCpa / 100)}. Classic creative-fatigue signature — rotate assets before cutting spend.`,
      tone: "bad",
      spark: c.spark,
      sparkColor: "#C85A3F",
      value: `+${(c.change * 100).toFixed(0)}%`,
    });
  }

  // 3) New winners: campaigns launched in last 14d with ROAS > 1.3
  const newWinners = rows
    .filter((r) => {
      const start = r.campaign.startDate;
      const daysSince = Math.round(
        (Date.parse(DASHBOARD_TODAY) - Date.parse(start)) / (24 * 60 * 60 * 1000),
      );
      return daysSince <= 21 && r.roas > 1.3 && r.conversions >= 5;
    })
    .sort((a, b) => b.roas - a.roas)
    .slice(0, 1);

  for (const w of newWinners) {
    out.push({
      label: "New winner",
      headline: `${w.campaign.name} is printing ${w.roas.toFixed(2)}x in its first few weeks.`,
      body: "Keep the spend curve gentle — fresh campaigns that scale too hard tend to compress their own ROAS within 30 days.",
      tone: "good",
      spark: w.windowSeries.slice(-21).map((d) => d.revenueCents),
      sparkColor: "#1F3A2F",
      value: `${w.roas.toFixed(2)}x`,
    });
  }

  // 4) Over-pacing budget: any active campaign spending >115% of expected this period
  const overPacers = rows
    .filter((r) => r.campaign.status === "active")
    .map((r) => {
      const periodStart = isoAddDays(DASHBOARD_TODAY, -29);
      const effectiveStart =
        r.campaign.startDate > periodStart ? r.campaign.startDate : periodStart;
      const daysElapsed = Math.max(
        0,
        Math.min(
          30,
          Math.round(
            (Date.parse(DASHBOARD_TODAY) - Date.parse(effectiveStart)) /
              (24 * 60 * 60 * 1000),
          ) + 1,
        ),
      );
      const expected = r.campaign.dailyBudgetCents * daysElapsed;
      const spent = r.campaign.series
        .filter(
          (p) => p.date >= effectiveStart && p.date <= DASHBOARD_TODAY,
        )
        .reduce((s, x) => s + x.costCents, 0);
      const pacePct = expected > 0 ? (spent / expected) * 100 : 0;
      return { r, pacePct, spent, expected };
    })
    .filter((x) => x.pacePct > 115)
    .sort((a, b) => b.pacePct - a.pacePct)
    .slice(0, 1);

  for (const op of overPacers) {
    out.push({
      label: "Budget over-pacing",
      headline: `${op.r.campaign.name} is ${op.pacePct.toFixed(0)}% of its expected spend this period.`,
      body: "Auction costs probably climbed or the daily budget is set too low for current demand. Either lift the cap or dial back bids.",
      tone: "neutral",
      spark: op.r.windowSeries.slice(-21).map((d) => d.costCents),
      sparkColor: "#B08A4F",
      value: `${op.pacePct.toFixed(0)}%`,
    });
  }

  return out.slice(0, 4);
}

function AnomalyCard({ label, headline, body, tone, spark, sparkColor, value }: Anomaly) {
  const eyebrowColor =
    tone === "good" ? "text-forest" : tone === "bad" ? "text-clay" : "text-ink-soft";
  return (
    <article className="group relative flex min-w-0 flex-col overflow-hidden border border-hairline bg-warm-white p-6 transition-shadow hover:shadow-warm-sm">
      <div className="flex items-start justify-between gap-4">
        <p className={cn("font-mono text-[10px] uppercase tracking-[0.24em]", eyebrowColor)}>
          {label}
        </p>
        {value && (
          <span
            className={cn(
              "font-mono text-xs tabular-nums",
              tone === "good"
                ? "text-forest"
                : tone === "bad"
                  ? "text-clay"
                  : "text-ink-soft",
            )}
          >
            {value}
          </span>
        )}
      </div>
      <h3 className="mt-3 font-display text-xl leading-[1.15] tracking-tight text-ink md:text-[22px]">
        {headline}
      </h3>
      <p className="mt-3 font-sans text-sm leading-relaxed text-ink-soft">
        {body}
      </p>
      <div className="mt-5 pt-1">
        <Sparkline values={spark} color={sparkColor} width={320} height={32} filled />
      </div>
    </article>
  );
}

function EmptyNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-6 border border-dashed border-hairline bg-bone/40 p-8 text-center">
      <p className="font-sans text-sm italic text-stone">{children}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

function formatMoney(cents: number): string {
  if (cents === 0) return "$0";
  if (cents >= 10_000_000_00) {
    return `$${(cents / 100_000_000).toFixed(1)}M`;
  }
  if (cents >= 1_000_00) {
    return `$${Math.round(cents / 100).toLocaleString("en-US")}`;
  }
  return `$${(cents / 100).toFixed(2)}`;
}

// Re-export in case parent wants to compose
export { ChannelChip };
