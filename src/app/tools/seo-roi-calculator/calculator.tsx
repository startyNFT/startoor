"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { GitCompare, Link2, Printer, RotateCcw } from "lucide-react";
import { cn } from "@/lib/cn";

// ---------------------------------------------------------------------------
// Industry-composite organic CTR curve for positions 1–10.
// Source: blended FirstPageSage / Backlinko / AWR 2023-2024 studies. These
// numbers are a reasonable planning heuristic, not guarantees. CTR(1)=39.8%.
// Values are already in percent (divide by 100 for fraction).
// ---------------------------------------------------------------------------
const CTR_CURVE = [39.8, 18.7, 10.2, 7.2, 5.1, 4.4, 3.0, 2.1, 1.9, 1.6] as const;

const STORAGE_KEY = "startoor_seo_roi_v1";

const CURRENCIES = [
  { code: "USD", symbol: "$", locale: "en-US" },
  { code: "EUR", symbol: "€", locale: "en-IE" },
  { code: "GBP", symbol: "£", locale: "en-GB" },
  { code: "CAD", symbol: "C$", locale: "en-CA" },
  { code: "AUD", symbol: "A$", locale: "en-AU" },
] as const;

type Currency = (typeof CURRENCIES)[number]["code"];

type Inputs = {
  currentVisitors: number; // monthly organic visitors today
  keywordVolume: number; // target keyword monthly search volume
  targetPosition: number; // 1-10
  conversionPct: number; // visitor → lead %
  closeRatePct: number; // lead → deal %
  dealValue: number; // avg deal value in major units
  monthlySpend: number; // SEO spend per month
  horizon: number; // months
  currency: Currency;
  projectName: string;
  compareEnabled: boolean;
  comparePosition: number; // 1-10 second scenario
};

const DEFAULTS: Inputs = {
  currentVisitors: 2400,
  keywordVolume: 18000,
  targetPosition: 3,
  conversionPct: 2.4,
  closeRatePct: 22,
  dealValue: 3200,
  monthlySpend: 4000,
  horizon: 12,
  currency: "USD",
  projectName: "Target keyword · scenario A",
  compareEnabled: false,
  comparePosition: 7,
};

// URL param key map — short keys so the link isn't grotesque.
const URL_KEYS: Record<keyof Omit<Inputs, "projectName">, string> = {
  currentVisitors: "v",
  keywordVolume: "k",
  targetPosition: "p",
  conversionPct: "c",
  closeRatePct: "cr",
  dealValue: "d",
  monthlySpend: "s",
  horizon: "h",
  currency: "cur",
  compareEnabled: "cmp",
  comparePosition: "pb",
};

type InitialParams = {
  q?: string;
  v?: string;
  k?: string;
  p?: string;
  c?: string;
  cr?: string;
  d?: string;
  s?: string;
  h?: string;
  cur?: string;
  pb?: string;
  cmp?: string;
};

// ---------------------------------------------------------------------------
// Forecasting math
// ---------------------------------------------------------------------------

type MonthRow = {
  month: number; // 1..horizon
  traffic: number;
  leads: number;
  revenue: number;
  cumulativeRevenue: number;
  cumulativeSpend: number;
  roiPct: number; // (cumRev - cumSpend) / cumSpend * 100
};

/**
 * Sigmoid ramp from a start value to an end value across `horizon` months.
 * Shape chosen so month 1 still shows a gentle lift (no hockey-stick lie) and
 * month `horizon` reaches ~98% of the ceiling. `k` tunes steepness.
 */
function sigmoidRamp(start: number, end: number, month: number, horizon: number): number {
  const k = 1.15;
  // midpoint sits around 55% of horizon — realistic for a typical SEO build
  const midpoint = horizon * 0.55;
  const x = month - midpoint;
  const sig = 1 / (1 + Math.exp(-k * x));
  // normalize so month=1 starts near 0 and month=horizon ends near 1
  const sigStart = 1 / (1 + Math.exp(-k * (1 - midpoint)));
  const sigEnd = 1 / (1 + Math.exp(-k * (horizon - midpoint)));
  const norm = (sig - sigStart) / Math.max(sigEnd - sigStart, 0.0001);
  return start + (end - start) * Math.max(0, Math.min(1, norm));
}

function ctrFor(position: number): number {
  const idx = Math.max(1, Math.min(10, Math.round(position))) - 1;
  return CTR_CURVE[idx] / 100;
}

function buildForecast(inputs: Inputs, position: number): MonthRow[] {
  const {
    currentVisitors,
    keywordVolume,
    conversionPct,
    closeRatePct,
    dealValue,
    monthlySpend,
    horizon,
  } = inputs;

  const ceilingFromKeyword = Math.max(0, keywordVolume) * ctrFor(position);
  // the final-month traffic target = today's traffic + new keyword traffic
  const trafficCeiling = Math.max(0, currentVisitors) + ceilingFromKeyword;

  const rows: MonthRow[] = [];
  let cumRev = 0;
  let cumSpend = 0;
  const h = Math.max(1, Math.min(36, horizon));

  for (let m = 1; m <= h; m++) {
    const traffic = sigmoidRamp(
      Math.max(0, currentVisitors),
      trafficCeiling,
      m,
      h,
    );
    const leads = traffic * (Math.max(0, conversionPct) / 100);
    const closed = leads * (Math.max(0, closeRatePct) / 100);
    const revenue = closed * Math.max(0, dealValue);
    cumRev += revenue;
    cumSpend += Math.max(0, monthlySpend);
    const roiPct =
      cumSpend > 0 ? ((cumRev - cumSpend) / cumSpend) * 100 : 0;
    rows.push({
      month: m,
      traffic,
      leads,
      revenue,
      cumulativeRevenue: cumRev,
      cumulativeSpend: cumSpend,
      roiPct,
    });
  }
  return rows;
}

function findPaybackMonth(rows: MonthRow[]): number | null {
  for (const r of rows) {
    if (r.cumulativeRevenue >= r.cumulativeSpend) return r.month;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Serialization (URL + localStorage)
// ---------------------------------------------------------------------------

function inputsToSearchParams(inputs: Inputs): URLSearchParams {
  const p = new URLSearchParams();
  p.set(URL_KEYS.currentVisitors, String(inputs.currentVisitors));
  p.set(URL_KEYS.keywordVolume, String(inputs.keywordVolume));
  p.set(URL_KEYS.targetPosition, String(inputs.targetPosition));
  p.set(URL_KEYS.conversionPct, String(inputs.conversionPct));
  p.set(URL_KEYS.closeRatePct, String(inputs.closeRatePct));
  p.set(URL_KEYS.dealValue, String(inputs.dealValue));
  p.set(URL_KEYS.monthlySpend, String(inputs.monthlySpend));
  p.set(URL_KEYS.horizon, String(inputs.horizon));
  p.set(URL_KEYS.currency, inputs.currency);
  if (inputs.compareEnabled) {
    p.set(URL_KEYS.compareEnabled, "1");
    p.set(URL_KEYS.comparePosition, String(inputs.comparePosition));
  }
  if (inputs.projectName && inputs.projectName !== DEFAULTS.projectName) {
    p.set("q", inputs.projectName);
  }
  return p;
}

function hydrateFromUrl(raw: InitialParams, base: Inputs): Inputs {
  const num = (v: string | undefined, fallback: number): number => {
    if (v === undefined) return fallback;
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  };
  const cur = (v: string | undefined): Currency => {
    if (v && CURRENCIES.some((c) => c.code === v)) return v as Currency;
    return base.currency;
  };
  const touched =
    raw.v !== undefined ||
    raw.k !== undefined ||
    raw.p !== undefined ||
    raw.c !== undefined ||
    raw.cr !== undefined ||
    raw.d !== undefined ||
    raw.s !== undefined ||
    raw.h !== undefined ||
    raw.cur !== undefined ||
    raw.cmp !== undefined ||
    raw.pb !== undefined ||
    raw.q !== undefined;

  if (!touched) return base;

  return {
    currentVisitors: Math.max(0, num(raw.v, base.currentVisitors)),
    keywordVolume: Math.max(0, num(raw.k, base.keywordVolume)),
    targetPosition: Math.max(1, Math.min(10, num(raw.p, base.targetPosition))),
    conversionPct: Math.max(0, num(raw.c, base.conversionPct)),
    closeRatePct: Math.max(0, num(raw.cr, base.closeRatePct)),
    dealValue: Math.max(0, num(raw.d, base.dealValue)),
    monthlySpend: Math.max(0, num(raw.s, base.monthlySpend)),
    horizon: Math.max(1, Math.min(36, num(raw.h, base.horizon))),
    currency: cur(raw.cur),
    compareEnabled: raw.cmp === "1",
    comparePosition: Math.max(1, Math.min(10, num(raw.pb, base.comparePosition))),
    projectName: raw.q || base.projectName,
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Calculator({ initialParams }: { initialParams: InitialParams }) {
  const [inputs, setInputs] = useState<Inputs>(() =>
    hydrateFromUrl(initialParams, DEFAULTS),
  );
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage ONLY if URL didn't already populate
  useEffect(() => {
    const urlTouched =
      initialParams.v !== undefined ||
      initialParams.k !== undefined ||
      initialParams.p !== undefined ||
      initialParams.c !== undefined ||
      initialParams.cr !== undefined ||
      initialParams.d !== undefined ||
      initialParams.s !== undefined ||
      initialParams.h !== undefined ||
      initialParams.cur !== undefined ||
      initialParams.cmp !== undefined ||
      initialParams.pb !== undefined ||
      initialParams.q !== undefined;

    if (!urlTouched) {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<Inputs>;
          setInputs((prev) => ({ ...prev, ...parsed }));
        }
      } catch {}
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist to localStorage
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(inputs));
    } catch {}
  }, [inputs, hydrated]);

  // Debounced URL sync
  useEffect(() => {
    if (!hydrated) return;
    const t = setTimeout(() => {
      const params = inputsToSearchParams(inputs);
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState(null, "", newUrl);
    }, 400);
    return () => clearTimeout(t);
  }, [inputs, hydrated]);

  // Forecast
  const rowsA = useMemo(
    () => buildForecast(inputs, inputs.targetPosition),
    [inputs],
  );
  const rowsB = useMemo(
    () => (inputs.compareEnabled ? buildForecast(inputs, inputs.comparePosition) : null),
    [inputs],
  );

  const summaryA = useMemo(() => summarize(rowsA), [rowsA]);
  const summaryB = useMemo(() => (rowsB ? summarize(rowsB) : null), [rowsB]);

  const cur = CURRENCIES.find((c) => c.code === inputs.currency) ?? CURRENCIES[0];
  const fmtMoney = useMemo(
    () =>
      new Intl.NumberFormat(cur.locale, {
        style: "currency",
        currency: cur.code,
        maximumFractionDigits: 0,
      }),
    [cur],
  );
  const fmtNum = useMemo(() => new Intl.NumberFormat(cur.locale), [cur]);

  const reset = () => {
    if (!confirm("Clear all inputs and start from defaults?")) return;
    setInputs(DEFAULTS);
    toast.success("Reset to defaults.");
  };

  const copyShareLink = async () => {
    try {
      const url = new URL(window.location.href);
      url.search = inputsToSearchParams(inputs).toString();
      await navigator.clipboard.writeText(url.toString());
      toast.success("Shareable link copied.");
    } catch {
      toast.error("Couldn't copy. You can still share the URL in your address bar.");
    }
  };

  const printPage = () => {
    toast.info("Opening print dialog — choose 'Save as PDF' for a clean export.");
    setTimeout(() => window.print(), 120);
  };

  const patch = (p: Partial<Inputs>) => setInputs((s) => ({ ...s, ...p }));

  return (
    <div className="print-wrapper">
      {/* Action bar — screen only */}
      <div className="border-b border-hairline bg-bone/70 print:hidden">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-4 md:px-10">
          <div className="min-w-0">
            <input
              type="text"
              value={inputs.projectName}
              onChange={(e) => patch({ projectName: e.target.value })}
              className="w-full max-w-lg truncate border-b border-transparent bg-transparent pb-0.5 font-display text-xl tracking-tight text-ink focus:border-ink focus:outline-none md:text-2xl"
              aria-label="Scenario name"
            />
            <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
              Autosaves to this device · shareable via URL
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={reset}
              className="inline-flex items-center gap-1.5 rounded-full border border-hairline px-4 py-2 font-sans text-sm text-ink-soft transition-colors hover:border-ink hover:text-ink"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
            <button
              onClick={copyShareLink}
              className="inline-flex items-center gap-1.5 rounded-full border border-hairline px-4 py-2 font-sans text-sm text-ink-soft transition-colors hover:border-ink hover:text-ink"
            >
              <Link2 className="h-3.5 w-3.5" />
              Copy link
            </button>
            <button
              onClick={printPage}
              className="group inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2 font-sans text-sm text-bone transition-colors hover:bg-forest"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Export PDF</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-10 md:px-10 md:py-14 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.15fr)] lg:gap-14 print:block print:p-0">
        {/* Editor */}
        <section className="print:hidden">
          <EditorSection title="The site today" number="01">
            <div className="grid gap-5 md:grid-cols-2">
              <NumberField
                label="Current organic visitors / month"
                value={inputs.currentVisitors}
                onChange={(v) => patch({ currentVisitors: v })}
                suffix="/mo"
              />
              <SelectField
                label="Currency"
                value={inputs.currency}
                options={CURRENCIES.map((c) => ({ value: c.code, label: c.code }))}
                onChange={(v) => patch({ currency: v as Currency })}
              />
            </div>
          </EditorSection>

          <EditorSection title="Target keyword" number="02">
            <div className="grid gap-5 md:grid-cols-2">
              <NumberField
                label="Monthly search volume"
                value={inputs.keywordVolume}
                onChange={(v) => patch({ keywordVolume: v })}
                suffix="/mo"
              />
              <PositionSlider
                label="Target ranking position"
                value={inputs.targetPosition}
                onChange={(v) => patch({ targetPosition: v })}
              />
            </div>
            <div className="mt-5 flex items-center gap-3 rounded-sm border border-hairline-soft bg-bone/50 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
              <span className="inline-block h-1 w-1 rounded-full bg-clay" />
              <span>
                CTR at position {inputs.targetPosition}{" "}
                <span className="text-ink tabular-nums">
                  {CTR_CURVE[inputs.targetPosition - 1].toFixed(1)}%
                </span>{" "}
                · industry composite
              </span>
            </div>
          </EditorSection>

          <EditorSection title="Funnel & unit economics" number="03">
            <div className="grid gap-5 md:grid-cols-2">
              <NumberField
                label="Visitor → lead conversion"
                value={inputs.conversionPct}
                onChange={(v) => patch({ conversionPct: v })}
                suffix="%"
                step={0.1}
              />
              <NumberField
                label="Lead → deal close rate"
                value={inputs.closeRatePct}
                onChange={(v) => patch({ closeRatePct: v })}
                suffix="%"
                step={1}
              />
              <NumberField
                label="Average deal value"
                value={inputs.dealValue}
                onChange={(v) => patch({ dealValue: v })}
                prefix={cur.symbol}
              />
              <NumberField
                label="Monthly SEO spend"
                value={inputs.monthlySpend}
                onChange={(v) => patch({ monthlySpend: v })}
                prefix={cur.symbol}
              />
            </div>
          </EditorSection>

          <EditorSection title="Horizon" number="04">
            <div className="grid gap-5 md:grid-cols-2">
              <NumberField
                label="Forecast months"
                value={inputs.horizon}
                onChange={(v) => patch({ horizon: Math.max(1, Math.min(36, Math.round(v))) })}
                suffix="mo"
                min={1}
                max={36}
              />
            </div>
          </EditorSection>

          <EditorSection title="Compare scenarios" number="05">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={inputs.compareEnabled}
                onChange={(e) => patch({ compareEnabled: e.target.checked })}
                className="mt-1 h-4 w-4 accent-forest"
              />
              <span className="block">
                <span className="flex items-center gap-2 font-sans text-sm text-ink">
                  <GitCompare className="h-3.5 w-3.5 text-clay" />
                  Overlay a second position on the chart
                </span>
                <span className="mt-1 block font-sans text-xs text-stone">
                  Useful when pitching: show what position 3 earns vs. what position 7 leaves on the table.
                </span>
              </span>
            </label>
            {inputs.compareEnabled && (
              <div className="mt-5 grid gap-5 rounded-sm border border-hairline-soft bg-bone/40 p-5 md:grid-cols-2">
                <PositionSlider
                  label="Comparison position"
                  value={inputs.comparePosition}
                  onChange={(v) => patch({ comparePosition: v })}
                  accent="#C85A3F"
                />
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
                  <span className="block">CTR delta</span>
                  <span className="mt-1.5 block font-display text-2xl tracking-tight text-ink tabular-nums">
                    {(
                      CTR_CURVE[inputs.targetPosition - 1] -
                      CTR_CURVE[inputs.comparePosition - 1]
                    ).toFixed(1)}
                    <span className="ml-1 text-sm text-stone">pp</span>
                  </span>
                </div>
              </div>
            )}
          </EditorSection>
        </section>

        {/* Report */}
        <section className="print-report">
          {/* Print-only masthead */}
          <header className="hidden print:mb-10 print:block">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-clay">
              SEO ROI Forecast
            </p>
            <h1 className="mt-2 font-display text-5xl leading-[0.95] tracking-tight text-ink">
              {inputs.projectName || "SEO scenario"}
            </h1>
            <p className="mt-3 font-sans text-sm text-ink-soft">
              Prepared{" "}
              {new Intl.DateTimeFormat("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              }).format(new Date())}{" "}
              · {inputs.horizon} month horizon · position {inputs.targetPosition}
              {inputs.compareEnabled ? ` vs ${inputs.comparePosition}` : ""}
            </p>
          </header>

          <ReportHeader />

          {/* Summary tiles */}
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            <Tile
              label={`M${inputs.horizon} MRR`}
              value={fmtMoney.format(summaryA.finalMonthRevenue)}
              caption={`≈ ${fmtNum.format(Math.round(summaryA.finalMonthTraffic))} visits`}
            />
            <Tile
              label="Total revenue"
              value={fmtMoney.format(summaryA.totalRevenue)}
              caption={`Over ${inputs.horizon} months`}
            />
            <Tile
              label="Payback"
              value={
                summaryA.paybackMonth
                  ? `Month ${summaryA.paybackMonth}`
                  : "Not in horizon"
              }
              caption={
                summaryA.paybackMonth
                  ? "Cumulative revenue crosses spend"
                  : "Extend horizon or cut spend"
              }
              tone={summaryA.paybackMonth ? "default" : "muted"}
            />
            <Tile
              label="Cumulative ROI"
              value={`${summaryA.finalRoi >= 0 ? "+" : ""}${summaryA.finalRoi.toFixed(0)}%`}
              caption={`Net ${fmtMoney.format(summaryA.totalRevenue - summaryA.totalSpend)}`}
              tone={summaryA.finalRoi >= 0 ? "positive" : "negative"}
            />
          </div>

          {/* Chart */}
          <div className="mt-8 overflow-hidden rounded-sm border border-hairline bg-warm-white">
            <ChartHeader
              inputs={inputs}
              summaryA={summaryA}
              summaryB={summaryB}
              formatMoney={(n) => fmtMoney.format(n)}
            />
            <div className="px-4 pb-6 pt-2 md:px-8 md:pb-8">
              <RevenueChart
                rowsA={rowsA}
                rowsB={rowsB ?? undefined}
                inputs={inputs}
                currency={cur}
              />
            </div>
          </div>

          {/* Month-by-month table */}
          <div className="mt-8 overflow-hidden rounded-sm border border-hairline bg-warm-white">
            <div className="flex items-baseline justify-between border-b border-hairline-soft px-4 py-3 md:px-6">
              <h3 className="font-display text-lg tracking-tight text-ink">
                Month-by-month
              </h3>
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone">
                Position {inputs.targetPosition}
              </span>
            </div>
            <MonthTable
              rows={rowsA}
              fmtMoney={fmtMoney}
              fmtNum={fmtNum}
              paybackMonth={summaryA.paybackMonth}
            />
          </div>

          {/* Footer note */}
          <p className="mt-6 max-w-2xl font-sans text-xs leading-relaxed text-stone">
            Traffic ramp is a sigmoid from today&apos;s baseline to
            (visitors + keyword volume × CTR at target position). CTR curve is
            an industry composite for organic results only — branded SERP
            features and zero-click queries may compress actual click-through.
            Treat this as a planning compass, not a guarantee.
          </p>
        </section>
      </div>

      <PrintStyles />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Summary helpers
// ---------------------------------------------------------------------------

type Summary = {
  finalMonthRevenue: number;
  finalMonthTraffic: number;
  totalRevenue: number;
  totalSpend: number;
  paybackMonth: number | null;
  finalRoi: number;
};

function summarize(rows: MonthRow[]): Summary {
  if (rows.length === 0) {
    return {
      finalMonthRevenue: 0,
      finalMonthTraffic: 0,
      totalRevenue: 0,
      totalSpend: 0,
      paybackMonth: null,
      finalRoi: 0,
    };
  }
  const last = rows[rows.length - 1];
  return {
    finalMonthRevenue: last.revenue,
    finalMonthTraffic: last.traffic,
    totalRevenue: last.cumulativeRevenue,
    totalSpend: last.cumulativeSpend,
    paybackMonth: findPaybackMonth(rows),
    finalRoi: last.roiPct,
  };
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function EditorSection({
  title,
  number,
  children,
}: {
  title: string;
  number: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10 border-t border-hairline pt-10 first:mt-4 first:border-t-0 first:pt-0">
      <h2 className="flex items-baseline gap-4">
        <span className="font-display text-4xl leading-none tracking-tight text-clay">
          {number}
        </span>
        <span className="font-display text-xl leading-none tracking-tight text-ink">
          {title}
        </span>
      </h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function NumberField({
  label,
  value,
  onChange,
  prefix,
  suffix,
  step = 1,
  min = 0,
  max,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
  suffix?: string;
  step?: number;
  min?: number;
  max?: number;
}) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone">
        {label}
      </span>
      <span className="mt-2 flex items-center gap-2 border-b border-hairline py-2 focus-within:border-ink">
        {prefix && (
          <span className="font-mono text-sm text-stone">{prefix}</span>
        )}
        <input
          type="number"
          value={Number.isFinite(value) ? value : 0}
          onChange={(e) => {
            const n = Number(e.target.value);
            onChange(Number.isFinite(n) ? n : 0);
          }}
          step={step}
          min={min}
          max={max}
          className="w-full bg-transparent text-right font-mono text-base tabular-nums text-ink focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        {suffix && (
          <span className="font-mono text-xs text-stone">{suffix}</span>
        )}
      </span>
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full border-b border-hairline bg-transparent py-2 font-sans text-sm text-ink focus:border-ink focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function PositionSlider({
  label,
  value,
  onChange,
  accent = "#1F3A2F",
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  accent?: string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone">
          {label}
        </span>
        <span
          className="font-display text-2xl leading-none tracking-tight tabular-nums"
          style={{ color: accent }}
        >
          #{value}
        </span>
      </div>
      <input
        type="range"
        min={1}
        max={10}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-3 w-full accent-[var(--pos-accent)]"
        style={{ ["--pos-accent" as string]: accent } as React.CSSProperties}
      />
      <div className="mt-1 flex justify-between font-mono text-[9px] uppercase tracking-[0.18em] text-stone-light">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={cn(
              "tabular-nums transition-colors hover:text-ink",
              value === n ? "text-ink" : undefined,
            )}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Report components
// ---------------------------------------------------------------------------

function ReportHeader() {
  return (
    <div className="flex items-baseline justify-between print:hidden">
      <div>
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-clay">
          The forecast
        </span>
        <h2 className="mt-2 font-display text-3xl leading-tight tracking-tight text-ink">
          Twelve months, in numbers you can defend.
        </h2>
      </div>
    </div>
  );
}

function Tile({
  label,
  value,
  caption,
  tone = "default",
}: {
  label: string;
  value: string;
  caption?: string;
  tone?: "default" | "positive" | "negative" | "muted";
}) {
  const toneClass =
    tone === "positive"
      ? "text-forest"
      : tone === "negative"
        ? "text-clay"
        : tone === "muted"
          ? "text-stone"
          : "text-ink";
  return (
    <div className="relative overflow-hidden rounded-sm border border-hairline bg-warm-white p-4 md:p-5">
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-clay">
        {label}
      </span>
      <p
        className={cn(
          "mt-3 font-display text-3xl leading-[0.95] tracking-tight tabular-nums md:text-4xl",
          toneClass,
        )}
      >
        {value}
      </p>
      {caption && (
        <p className="mt-2 font-sans text-xs leading-snug text-stone">{caption}</p>
      )}
    </div>
  );
}

function ChartHeader({
  inputs,
  summaryA,
  summaryB,
  formatMoney,
}: {
  inputs: Inputs;
  summaryA: Summary;
  summaryB: Summary | null;
  formatMoney: (n: number) => string;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-hairline-soft px-4 py-4 md:px-8 md:py-5">
      <div>
        <h3 className="font-display text-lg tracking-tight text-ink">
          Revenue vs. cumulative spend
        </h3>
        <p className="mt-1 font-sans text-xs text-stone">
          Area = monthly revenue. Dashed line = spend accumulating month over month.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
        <LegendSwatch color="#1F3A2F" label={`Position ${inputs.targetPosition}`} />
        {summaryB && (
          <LegendSwatch
            color="#C85A3F"
            label={`Position ${inputs.comparePosition}`}
            dashed
          />
        )}
        <LegendSwatch color="#8F8B80" label="Cumulative spend" line />
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone">
          Net{" "}
          <span className="tabular-nums text-ink">
            {formatMoney(summaryA.totalRevenue - summaryA.totalSpend)}
          </span>
        </span>
      </div>
    </div>
  );
}

function LegendSwatch({
  color,
  label,
  dashed,
  line,
}: {
  color: string;
  label: string;
  dashed?: boolean;
  line?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
      {line ? (
        <svg width="18" height="6" aria-hidden="true">
          <line
            x1="0"
            x2="18"
            y1="3"
            y2="3"
            stroke={color}
            strokeWidth="1.5"
            strokeDasharray={dashed ? "3 3" : undefined}
          />
        </svg>
      ) : (
        <span
          className="inline-block h-2.5 w-2.5 rounded-sm"
          style={{
            backgroundColor: dashed ? "transparent" : color,
            border: dashed ? `1.5px dashed ${color}` : "none",
          }}
        />
      )}
      <span className="text-ink">{label}</span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// Hand-rolled SVG chart
// ---------------------------------------------------------------------------

function RevenueChart({
  rowsA,
  rowsB,
  inputs,
  currency,
}: {
  rowsA: MonthRow[];
  rowsB?: MonthRow[];
  inputs: Inputs;
  currency: { code: string; symbol: string; locale: string };
}) {
  // Viewbox coords; responsive via preserveAspectRatio="none" handled below
  const W = 820;
  const H = 320;
  const pad = { top: 24, right: 36, bottom: 34, left: 64 };

  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;

  const monthCount = rowsA.length;
  if (monthCount === 0) {
    return (
      <div className="flex aspect-[3/1] items-center justify-center font-mono text-[10px] uppercase tracking-[0.22em] text-stone">
        No data yet.
      </div>
    );
  }

  // Y scale: max of revenue (A/B) and final cum spend
  const maxRev = Math.max(
    ...rowsA.map((r) => r.revenue),
    ...(rowsB ? rowsB.map((r) => r.revenue) : [0]),
    rowsA[rowsA.length - 1].cumulativeSpend,
    1,
  );
  const yScale = (v: number) => chartH - (v / maxRev) * chartH;

  const xScale = (month: number) =>
    monthCount === 1
      ? chartW / 2
      : ((month - 1) / (monthCount - 1)) * chartW;

  // --- Area path for revenue (series A) ---
  const areaPoints = rowsA
    .map((r, i) => `${i === 0 ? "M" : "L"}${xScale(r.month)},${yScale(r.revenue)}`)
    .join(" ");
  const areaPath = `${areaPoints} L${xScale(rowsA[rowsA.length - 1].month)},${chartH} L${xScale(
    rowsA[0].month,
  )},${chartH} Z`;
  const strokePath = areaPoints;

  // --- Compare series B stroke only ---
  const strokeB = rowsB
    ? rowsB
        .map(
          (r, i) => `${i === 0 ? "M" : "L"}${xScale(r.month)},${yScale(r.revenue)}`,
        )
        .join(" ")
    : null;

  // --- Cumulative spend line ---
  const spendPath = rowsA
    .map(
      (r, i) =>
        `${i === 0 ? "M" : "L"}${xScale(r.month)},${yScale(r.cumulativeSpend)}`,
    )
    .join(" ");

  // Find intersection for breakeven shaded band (approximate — use payback month)
  const paybackMonth = findPaybackMonth(rowsA);

  // Y-axis ticks (4)
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * maxRev);

  // Hover interactivity
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

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
    const frac = x / chartW;
    const idx = Math.round(frac * (monthCount - 1));
    setHoverIdx(Math.max(0, Math.min(monthCount - 1, idx)));
  };

  const handleLeave = () => setHoverIdx(null);

  const fmtMoney = new Intl.NumberFormat(currency.locale, {
    style: "currency",
    currency: currency.code,
    maximumFractionDigits: 0,
  });

  const active = hoverIdx !== null ? rowsA[hoverIdx] : null;
  const activeB = hoverIdx !== null && rowsB ? rowsB[hoverIdx] : null;

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="block h-auto w-full select-none"
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        role="img"
        aria-label="Revenue forecast chart"
      >
        <defs>
          <linearGradient id="revGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#1F3A2F" stopOpacity="0.26" />
            <stop offset="60%" stopColor="#1F3A2F" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#1F3A2F" stopOpacity="0" />
          </linearGradient>
          <pattern
            id="breakeven"
            width="8"
            height="8"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <line x1="0" y1="0" x2="0" y2="8" stroke="#E8C77F" strokeWidth="3" opacity="0.38" />
          </pattern>
        </defs>

        <g transform={`translate(${pad.left}, ${pad.top})`}>
          {/* Gridlines */}
          {ticks.map((t, i) => (
            <g key={i}>
              <line
                x1={0}
                x2={chartW}
                y1={yScale(t)}
                y2={yScale(t)}
                stroke="rgba(28, 28, 26, 0.08)"
                strokeWidth="1"
              />
              <text
                x={-10}
                y={yScale(t)}
                textAnchor="end"
                dominantBaseline="middle"
                fontFamily="var(--font-mono)"
                fontSize="10"
                letterSpacing="0.08em"
                fill="#8F8B80"
                className="tabular-nums"
              >
                {fmtMoney.format(t).replace(/\.00$/, "")}
              </text>
            </g>
          ))}

          {/* Breakeven shaded band — from payback month to end */}
          {paybackMonth && paybackMonth <= monthCount && (
            <rect
              x={xScale(paybackMonth)}
              y={0}
              width={chartW - xScale(paybackMonth)}
              height={chartH}
              fill="url(#breakeven)"
            />
          )}

          {/* Revenue area */}
          <path d={areaPath} fill="url(#revGradient)" />

          {/* Comparison stroke */}
          {strokeB && (
            <path
              d={strokeB}
              fill="none"
              stroke="#C85A3F"
              strokeWidth="1.5"
              strokeDasharray="5 4"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.9"
            />
          )}

          {/* Revenue stroke A */}
          <path
            d={strokePath}
            fill="none"
            stroke="#1F3A2F"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Cumulative spend line */}
          <path
            d={spendPath}
            fill="none"
            stroke="#8F8B80"
            strokeWidth="1.5"
            strokeDasharray="2 4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* X ticks */}
          {rowsA.map((r) => {
            const show =
              monthCount <= 12 ||
              r.month === 1 ||
              r.month === monthCount ||
              r.month % Math.ceil(monthCount / 8) === 0;
            if (!show) return null;
            return (
              <g key={r.month}>
                <line
                  x1={xScale(r.month)}
                  x2={xScale(r.month)}
                  y1={chartH}
                  y2={chartH + 4}
                  stroke="rgba(28, 28, 26, 0.25)"
                  strokeWidth="1"
                />
                <text
                  x={xScale(r.month)}
                  y={chartH + 18}
                  textAnchor="middle"
                  fontFamily="var(--font-mono)"
                  fontSize="10"
                  letterSpacing="0.12em"
                  fill="#8F8B80"
                >
                  M{r.month}
                </text>
              </g>
            );
          })}

          {/* Payback marker */}
          {paybackMonth && (
            <g>
              <line
                x1={xScale(paybackMonth)}
                x2={xScale(paybackMonth)}
                y1={0}
                y2={chartH}
                stroke="#C85A3F"
                strokeWidth="1"
                strokeDasharray="1 3"
              />
              <g transform={`translate(${xScale(paybackMonth)}, -6)`}>
                <rect
                  x={-34}
                  y={-14}
                  width={68}
                  height={18}
                  rx={2}
                  fill="#C85A3F"
                />
                <text
                  x={0}
                  y={-1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontFamily="var(--font-mono)"
                  fontSize="9"
                  letterSpacing="0.14em"
                  fill="#FAF6ED"
                >
                  PAYBACK M{paybackMonth}
                </text>
              </g>
            </g>
          )}

          {/* Hover crosshair */}
          {active && (
            <g>
              <line
                x1={xScale(active.month)}
                x2={xScale(active.month)}
                y1={0}
                y2={chartH}
                stroke="#1C1C1A"
                strokeWidth="1"
                opacity="0.35"
              />
              <circle
                cx={xScale(active.month)}
                cy={yScale(active.revenue)}
                r={5}
                fill="#1F3A2F"
                stroke="#FAF6ED"
                strokeWidth="2"
              />
              {activeB && (
                <circle
                  cx={xScale(activeB.month)}
                  cy={yScale(activeB.revenue)}
                  r={4}
                  fill="#C85A3F"
                  stroke="#FAF6ED"
                  strokeWidth="2"
                />
              )}
            </g>
          )}
        </g>
      </svg>

      {/* Hover tooltip */}
      {active && (
        <HoverTooltip
          row={active}
          rowB={activeB ?? undefined}
          currency={currency}
          inputs={inputs}
        />
      )}
    </div>
  );
}

function HoverTooltip({
  row,
  rowB,
  currency,
  inputs,
}: {
  row: MonthRow;
  rowB?: MonthRow;
  currency: { code: string; symbol: string; locale: string };
  inputs: Inputs;
}) {
  const fmtMoney = new Intl.NumberFormat(currency.locale, {
    style: "currency",
    currency: currency.code,
    maximumFractionDigits: 0,
  });
  const fmtNum = new Intl.NumberFormat(currency.locale);
  return (
    <div className="pointer-events-none absolute left-4 top-3 max-w-[17rem] rounded-sm border border-hairline bg-bone/95 px-3 py-2.5 shadow-warm-sm backdrop-blur-sm md:left-16">
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-clay">
        Month {row.month}
      </p>
      <dl className="mt-2 space-y-1 font-sans text-xs text-ink-soft">
        <TooltipRow
          label={`Position ${inputs.targetPosition} revenue`}
          value={fmtMoney.format(row.revenue)}
          dotColor="#1F3A2F"
        />
        {rowB && (
          <TooltipRow
            label={`Position ${inputs.comparePosition} revenue`}
            value={fmtMoney.format(rowB.revenue)}
            dotColor="#C85A3F"
            dashed
          />
        )}
        <TooltipRow label="Traffic" value={`${fmtNum.format(Math.round(row.traffic))} visits`} />
        <TooltipRow label="Leads" value={fmtNum.format(Math.round(row.leads))} />
        <TooltipRow
          label="ROI to date"
          value={`${row.roiPct >= 0 ? "+" : ""}${row.roiPct.toFixed(0)}%`}
        />
      </dl>
    </div>
  );
}

function TooltipRow({
  label,
  value,
  dotColor,
  dashed,
}: {
  label: string;
  value: string;
  dotColor?: string;
  dashed?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="flex items-center gap-1.5 text-stone">
        {dotColor && (
          <span
            className="inline-block h-2 w-2 rounded-sm"
            style={{
              backgroundColor: dashed ? "transparent" : dotColor,
              border: dashed ? `1px dashed ${dotColor}` : "none",
            }}
          />
        )}
        <span>{label}</span>
      </dt>
      <dd className="font-mono tabular-nums text-ink">{value}</dd>
    </div>
  );
}

function MonthTable({
  rows,
  fmtMoney,
  fmtNum,
  paybackMonth,
}: {
  rows: MonthRow[];
  fmtMoney: Intl.NumberFormat;
  fmtNum: Intl.NumberFormat;
  paybackMonth: number | null;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-hairline-soft">
            {["Mo", "Traffic", "Leads", "Revenue", "Cum. rev", "ROI"].map((h) => (
              <th
                key={h}
                className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.22em] text-stone md:px-6"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const isPayback = r.month === paybackMonth;
            return (
              <tr
                key={r.month}
                className={cn(
                  "border-b border-hairline-soft last:border-b-0 transition-colors",
                  isPayback ? "bg-butter/15" : "hover:bg-bone/50",
                )}
              >
                <td className="px-4 py-3 font-mono text-sm tabular-nums text-ink md:px-6">
                  <span className="inline-flex items-center gap-2">
                    <span>M{r.month}</span>
                    {isPayback && (
                      <span className="rounded-sm bg-clay px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.22em] text-bone">
                        Payback
                      </span>
                    )}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-sm tabular-nums text-ink-soft md:px-6">
                  {fmtNum.format(Math.round(r.traffic))}
                </td>
                <td className="px-4 py-3 font-mono text-sm tabular-nums text-ink-soft md:px-6">
                  {fmtNum.format(Math.round(r.leads))}
                </td>
                <td className="px-4 py-3 font-mono text-sm tabular-nums text-ink md:px-6">
                  {fmtMoney.format(r.revenue)}
                </td>
                <td className="px-4 py-3 font-mono text-sm tabular-nums text-ink md:px-6">
                  {fmtMoney.format(r.cumulativeRevenue)}
                </td>
                <td
                  className={cn(
                    "px-4 py-3 font-mono text-sm tabular-nums md:px-6",
                    r.roiPct >= 0 ? "text-forest" : "text-clay",
                  )}
                >
                  {r.roiPct >= 0 ? "+" : ""}
                  {r.roiPct.toFixed(0)}%
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Print styles — one-page clean report
// ---------------------------------------------------------------------------

function PrintStyles() {
  return (
    <style>{`
      @media print {
        @page { margin: 0.5in; size: letter; }
        body { background: white !important; }
        .print\\:hidden { display: none !important; }
        .print-wrapper { background: white; }
        .print-wrapper nav, .print-wrapper aside, .print-wrapper header.sticky { display: none !important; }
        .print-report { background: white !important; }
        .print-report table { font-size: 11px; }
        .print-report .shadow-warm-sm,
        .print-report .shadow-warm-md,
        .print-report .shadow-warm-lg { box-shadow: none !important; }
        /* Force tiles + chart + table to fit on a single page where possible */
        .print-report > * { break-inside: avoid; }
      }
      /* Hide the outer site nav when printing */
      @media print {
        body > * { visibility: hidden; }
        .print-wrapper, .print-wrapper * { visibility: visible; }
        .print-wrapper { position: absolute; left: 0; top: 0; right: 0; }
      }
    `}</style>
  );
}

