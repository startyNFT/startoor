"use client";

// ---------------------------------------------------------------------------
// Campaigns table — sortable, expandable rows with sparklines.
// Works off the already-filtered + already-windowed aggregates from the
// parent dashboard so column values line up with the rest of the page.
// ---------------------------------------------------------------------------

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  CHANNEL_META,
  STATUS_META,
  type Campaign,
  type Channel,
  type CampaignStatus,
  type DailyPoint,
} from "@/lib/data/campaigns";
import { Sparkline } from "./charts";

export type CampaignRow = {
  campaign: Campaign;
  windowSeries: DailyPoint[];
  impressions: number;
  clicks: number;
  costCents: number;
  conversions: number;
  revenueCents: number;
  roas: number;
  cpaCents: number; // 0 if conversions==0
  ctr: number;
};

type SortKey =
  | "name"
  | "channel"
  | "status"
  | "spend"
  | "revenue"
  | "roas"
  | "conversions"
  | "cpa";

type SortDir = "asc" | "desc";

export function CampaignsTable({ rows }: { rows: CampaignRow[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("spend");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const sorted = useMemo(() => {
    const copy = rows.slice();
    copy.sort((a, b) => {
      let av: number | string = 0;
      let bv: number | string = 0;
      switch (sortKey) {
        case "name":
          av = a.campaign.name.toLowerCase();
          bv = b.campaign.name.toLowerCase();
          break;
        case "channel":
          av = a.campaign.channel;
          bv = b.campaign.channel;
          break;
        case "status":
          av = a.campaign.status;
          bv = b.campaign.status;
          break;
        case "spend":
          av = a.costCents;
          bv = b.costCents;
          break;
        case "revenue":
          av = a.revenueCents;
          bv = b.revenueCents;
          break;
        case "roas":
          av = a.roas;
          bv = b.roas;
          break;
        case "conversions":
          av = a.conversions;
          bv = b.conversions;
          break;
        case "cpa":
          // Zero-CPA rows go last regardless of direction.
          av = a.cpaCents === 0 ? Infinity : a.cpaCents;
          bv = b.cpaCents === 0 ? Infinity : b.cpaCents;
          break;
      }
      if (typeof av === "string" && typeof bv === "string") {
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      const an = av as number;
      const bn = bv as number;
      return sortDir === "asc" ? an - bn : bn - an;
    });
    return copy;
  }, [rows, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      // numeric columns default desc, text columns default asc
      setSortDir(key === "name" || key === "channel" || key === "status" ? "asc" : "desc");
    }
  };

  return (
    <div className="overflow-x-auto border border-hairline bg-warm-white">
      <table className="w-full min-w-[1020px]">
        <thead>
          <tr className="border-b border-hairline bg-bone">
            <HeaderCell active={sortKey === "name"} dir={sortDir} onClick={() => toggleSort("name")} className="w-auto">
              Campaign
            </HeaderCell>
            <HeaderCell active={sortKey === "channel"} dir={sortDir} onClick={() => toggleSort("channel")} className="w-28">
              Channel
            </HeaderCell>
            <HeaderCell active={sortKey === "status"} dir={sortDir} onClick={() => toggleSort("status")} className="w-24">
              Status
            </HeaderCell>
            <HeaderCell active={sortKey === "spend"} dir={sortDir} onClick={() => toggleSort("spend")} className="w-32" align="right">
              Spend
            </HeaderCell>
            <HeaderCell active={sortKey === "revenue"} dir={sortDir} onClick={() => toggleSort("revenue")} className="w-32" align="right">
              Revenue
            </HeaderCell>
            <HeaderCell active={sortKey === "roas"} dir={sortDir} onClick={() => toggleSort("roas")} className="w-24" align="right">
              ROAS
            </HeaderCell>
            <HeaderCell active={sortKey === "conversions"} dir={sortDir} onClick={() => toggleSort("conversions")} className="w-28" align="right">
              Conv.
            </HeaderCell>
            <HeaderCell active={sortKey === "cpa"} dir={sortDir} onClick={() => toggleSort("cpa")} className="w-24" align="right">
              CPA
            </HeaderCell>
            <th className="w-10" />
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => (
            <Row
              key={row.campaign.id}
              row={row}
              expanded={expandedId === row.campaign.id}
              onToggle={() =>
                setExpandedId((cur) =>
                  cur === row.campaign.id ? null : row.campaign.id,
                )
              }
            />
          ))}
          {sorted.length === 0 && (
            <tr>
              <td colSpan={9} className="px-6 py-16 text-center">
                <p className="font-sans text-sm italic text-stone">
                  No campaigns match the current filters.
                </p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function HeaderCell({
  children,
  onClick,
  active,
  dir,
  className,
  align = "left",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  dir?: SortDir;
  className?: string;
  align?: "left" | "right";
}) {
  return (
    <th className={cn("px-4 py-3", align === "right" && "text-right", className)}>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.22em] transition-colors",
          active ? "text-ink" : "text-stone hover:text-ink",
          align === "right" && "flex-row-reverse",
        )}
      >
        {children}
        {active && (
          <span className="tabular-nums">{dir === "asc" ? "↑" : "↓"}</span>
        )}
      </button>
    </th>
  );
}

function Row({
  row,
  expanded,
  onToggle,
}: {
  row: CampaignRow;
  expanded: boolean;
  onToggle: () => void;
}) {
  const c = row.campaign;
  const chMeta = CHANNEL_META[c.channel];
  const stMeta = STATUS_META[c.status];

  const roasTone =
    row.roas >= 2 ? "text-forest" : row.roas >= 1 ? "text-ink" : "text-clay";

  const recent = row.windowSeries.slice(-30);
  const spendSpark = recent.map((p) => p.costCents);
  const convSpark = recent.map((p) => p.conversions);

  return (
    <>
      <tr
        className={cn(
          "group border-b border-hairline-soft transition-colors hover:bg-bone/60",
          expanded && "bg-bone",
        )}
      >
        <td className="px-4 py-3 align-top">
          <div className="flex min-w-0 items-start gap-3">
            <button
              type="button"
              onClick={onToggle}
              className={cn(
                "mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border transition-all",
                expanded
                  ? "border-ink bg-ink text-bone rotate-180"
                  : "border-hairline text-stone hover:border-ink hover:text-ink",
              )}
              aria-label={expanded ? "Collapse row" : "Expand row"}
            >
              <ChevronDown className="h-3 w-3" />
            </button>
            <div className="min-w-0">
              <p className="truncate font-sans text-sm text-ink">{c.name}</p>
              <p className="mt-0.5 truncate font-mono text-[10px] uppercase tracking-[0.18em] text-stone">
                {c.objective} · {c.id}
              </p>
            </div>
          </div>
        </td>
        <td className="px-4 py-3 align-top">
          <ChannelChip channel={c.channel} />
        </td>
        <td className="px-4 py-3 align-top">
          <StatusPill status={c.status} />
        </td>
        <td className="px-4 py-3 text-right align-top font-mono text-sm tabular-nums text-ink">
          ${Math.round(row.costCents / 100).toLocaleString("en-US")}
        </td>
        <td className="px-4 py-3 text-right align-top font-mono text-sm tabular-nums text-ink">
          ${Math.round(row.revenueCents / 100).toLocaleString("en-US")}
        </td>
        <td
          className={cn(
            "px-4 py-3 text-right align-top font-mono text-sm tabular-nums",
            roasTone,
          )}
        >
          {row.roas > 0 ? `${row.roas.toFixed(2)}x` : "—"}
        </td>
        <td className="px-4 py-3 text-right align-top font-mono text-sm tabular-nums text-ink">
          {row.conversions.toLocaleString("en-US")}
        </td>
        <td className="px-4 py-3 text-right align-top font-mono text-sm tabular-nums text-ink">
          {row.cpaCents > 0 ? `$${Math.round(row.cpaCents / 100)}` : "—"}
        </td>
        <td className="px-4 py-3 align-top">
          <div
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: chMeta.color, opacity: c.status === "active" ? 1 : 0.4 }}
            title={`${chMeta.label} · ${stMeta.label}`}
          />
        </td>
      </tr>
      {expanded && (
        <tr className="border-b border-hairline bg-bone">
          <td colSpan={9} className="px-6 py-6 md:px-10">
            <div className="grid gap-8 lg:grid-cols-2">
              <SparkPanel
                title="Spend · last 30 days"
                subtitle={`Total $${Math.round(spendSpark.reduce((s, v) => s + v, 0) / 100).toLocaleString("en-US")}`}
                values={spendSpark}
                color={chMeta.color}
                filled
                fmt={(v) => `$${Math.round(v / 100).toLocaleString("en-US")}`}
              />
              <SparkPanel
                title="Conversions · last 30 days"
                subtitle={`Total ${convSpark.reduce((s, v) => s + v, 0).toLocaleString("en-US")}`}
                values={convSpark}
                color="#1C1C1A"
                filled={false}
                fmt={(v) => v.toString()}
              />
            </div>
            <div className="mt-6 grid gap-4 border-t border-hairline pt-5 font-mono text-[11px] uppercase tracking-[0.18em] text-stone sm:grid-cols-4">
              <MetaItem label="Started" value={c.startDate} />
              <MetaItem label="Ended" value={c.endDate ?? "—"} />
              <MetaItem
                label="Daily budget"
                value={`$${Math.round(c.dailyBudgetCents / 100).toLocaleString("en-US")}`}
              />
              <MetaItem
                label="Impressions (window)"
                value={row.impressions.toLocaleString("en-US")}
              />
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function SparkPanel({
  title,
  subtitle,
  values,
  color,
  filled,
  fmt,
}: {
  title: string;
  subtitle: string;
  values: number[];
  color: string;
  filled: boolean;
  fmt: (v: number) => string;
}) {
  const max = values.length ? Math.max(...values) : 0;
  const maxIdx = values.indexOf(max);
  return (
    <div className="border border-hairline bg-warm-white p-5">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-clay">
            {title}
          </p>
          <p className="mt-1 font-display text-[22px] leading-none tracking-tight text-ink tabular-nums md:text-[26px]">
            {subtitle}
          </p>
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone">
          Peak · {fmt(max)}
          {maxIdx >= 0 && <span className="ml-1 text-ink">day {maxIdx + 1}</span>}
        </p>
      </div>
      <div className="mt-4">
        <Sparkline values={values} color={color} width={520} height={72} filled={filled} />
      </div>
    </div>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <dt className="text-stone">{label}</dt>
      <dd className="truncate font-sans text-xs normal-case tracking-normal text-ink">
        {value}
      </dd>
    </div>
  );
}

export function ChannelChip({ channel }: { channel: Channel }) {
  const meta = CHANNEL_META[channel];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em]"
      style={{
        borderColor: meta.color,
        color: meta.color,
        backgroundColor: `${meta.color}10`,
      }}
    >
      <span
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{ background: meta.color }}
      />
      {meta.label}
    </span>
  );
}

export function StatusPill({ status }: { status: CampaignStatus }) {
  const meta = STATUS_META[status];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-paper px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink">
      <span
        className={cn(
          "inline-block h-1.5 w-1.5 rounded-full",
          status === "learning" && "animate-pulse",
        )}
        style={{ background: meta.dot }}
      />
      {meta.label}
    </span>
  );
}
