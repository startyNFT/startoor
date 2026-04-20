// ---------------------------------------------------------------------------
// Campaign Dashboard — synthetic mock data
//
// 20 campaigns across 6 channels and 5 objectives. Each carries 90 days of
// daily metrics. Designed to *tell stories* in the dashboard:
//
//   • Two campaigns show clear CAC creep over the last 30 days (rising cost
//     per acquisition while ROAS drifts down).
//   • One anomaly day — March 31 spike across sale-objective campaigns (a
//     fictional "Spring Sale" weekend push), followed by a Monday hangover.
//   • One campaign is in first-7-days learning with sparse, erratic numbers.
//   • A handful of losing campaigns (ROAS < 1) to keep the picture honest.
//   • A handful of winners (ROAS > 3) with steady hockey-stick growth.
//
// All monetary values are in cents. All dates are ISO "YYYY-MM-DD".
// The dataset is generated deterministically from a seed so the dashboard is
// stable between renders and reloads — no runtime randomness.
// ---------------------------------------------------------------------------

export type Channel =
  | "google"
  | "meta"
  | "tiktok"
  | "linkedin"
  | "youtube"
  | "email";

export type Objective =
  | "awareness"
  | "traffic"
  | "leads"
  | "sales"
  | "retention";

export type CampaignStatus = "active" | "paused" | "ended" | "learning";

export type DailyPoint = {
  date: string; // YYYY-MM-DD
  impressions: number;
  clicks: number;
  costCents: number;
  conversions: number;
  revenueCents: number;
};

export type Campaign = {
  id: string;
  name: string;
  channel: Channel;
  objective: Objective;
  status: CampaignStatus;
  startDate: string;
  endDate: string | null;
  dailyBudgetCents: number;
  totalSpentCents: number;
  series: DailyPoint[];
};

// ---------------------------------------------------------------------------
// Channel + status metadata — used by the dashboard UI.
// ---------------------------------------------------------------------------

export const CHANNEL_META: Record<
  Channel,
  { label: string; color: string; accent: string }
> = {
  google: { label: "Google", color: "#1F3A2F", accent: "#2D5240" },
  meta: { label: "Meta", color: "#C85A3F", accent: "#D47963" },
  tiktok: { label: "TikTok", color: "#B08A4F", accent: "#CBA772" },
  linkedin: { label: "LinkedIn", color: "#3B5D7E", accent: "#5A7FA3" },
  youtube: { label: "YouTube", color: "#9D4B3E", accent: "#B96A5E" },
  email: { label: "Email", color: "#9DB89F", accent: "#B8CDBA" },
};

export const OBJECTIVE_LABEL: Record<Objective, string> = {
  awareness: "Awareness",
  traffic: "Traffic",
  leads: "Leads",
  sales: "Sales",
  retention: "Retention",
};

export const STATUS_META: Record<
  CampaignStatus,
  { label: string; dot: string; tint: string }
> = {
  active: { label: "Active", dot: "#1F3A2F", tint: "#1F3A2F" },
  paused: { label: "Paused", dot: "#8F8B80", tint: "#8F8B80" },
  ended: { label: "Ended", dot: "#2E2E2B", tint: "#2E2E2B" },
  learning: { label: "Learning", dot: "#E8C77F", tint: "#E8C77F" },
};

// ---------------------------------------------------------------------------
// Seeded deterministic PRNG. Mulberry32 — small, fast, good enough for mocks.
// ---------------------------------------------------------------------------

function mulberry32(seed: number) {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------------------
// The "today" anchor. We pin a synthetic "today" so the demo is stable across
// sessions — the most recent day in the dataset. The dashboard always reads
// its windows relative to this (not `new Date()`).
// ---------------------------------------------------------------------------

export const DASHBOARD_TODAY = "2026-04-15";
const SERIES_DAYS = 90;

function isoAddDays(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

function dayOfWeek(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay(); // 0 = Sunday
}

const START_DATE = isoAddDays(DASHBOARD_TODAY, -(SERIES_DAYS - 1));

// ---------------------------------------------------------------------------
// Campaign archetype generator
//
// Each archetype encodes how costs + conversions + revenue scale together,
// plus a drift function to express trends (CAC creep, ramp, steady, etc).
// ---------------------------------------------------------------------------

type Archetype = {
  baselineCost: number; // daily spend in cents, at midpoint
  ctr: number; // click-through rate 0..1
  cvr: number; // click→conversion rate 0..1
  aov: number; // avg order value in cents (or value-per-conversion for non-sales)
  noise: number; // 0..1 multiplicative daily noise magnitude
  drift: "flat" | "ramp-up" | "ramp-down" | "creep" | "decay" | "scaling";
  weekendMultiplier: number; // multiply spend on weekends
  rampStartDay?: number; // day-index where the campaign actually starts (learning)
  rampEndDay?: number; // day-index where the campaign ended
  saleBoostDays?: number[]; // absolute day indices with a fictional sale boost
  sparseEarly?: boolean; // erratic first-7-days behavior
};

function driftMultiplier(
  drift: Archetype["drift"],
  dayIdx: number,
  totalDays: number,
): { cost: number; cvr: number; aov: number } {
  const progress = dayIdx / Math.max(1, totalDays - 1); // 0..1
  switch (drift) {
    case "flat":
      return { cost: 1, cvr: 1, aov: 1 };
    case "ramp-up":
      // Spend grows, efficiency holds steady.
      return { cost: 0.55 + progress * 0.9, cvr: 0.9 + progress * 0.2, aov: 1 };
    case "ramp-down":
      return { cost: 1.4 - progress * 0.8, cvr: 1, aov: 1 };
    case "creep":
      // Classic CAC creep — spend holds, conversion rate slowly drops.
      return {
        cost: 0.95 + progress * 0.15,
        cvr: 1.15 - progress * 0.55, // material degradation
        aov: 1.0 - progress * 0.12,
      };
    case "decay":
      // A dying campaign: fewer conversions, same or more spend.
      return { cost: 1, cvr: 1.2 - progress * 0.8, aov: 0.95 };
    case "scaling":
      // Aggressive scale: spend doubles, efficiency slightly compresses.
      return {
        cost: 0.5 + progress * 1.3,
        cvr: 1.05 - progress * 0.15,
        aov: 1.02,
      };
  }
}

function generateSeries(arch: Archetype, seed: number): DailyPoint[] {
  const rng = mulberry32(seed);
  const rows: DailyPoint[] = [];
  const rampStart = arch.rampStartDay ?? 0;
  const rampEnd = arch.rampEndDay ?? SERIES_DAYS - 1;

  for (let i = 0; i < SERIES_DAYS; i++) {
    const iso = isoAddDays(START_DATE, i);

    // Before start or after end — zero row (campaign not running that day).
    if (i < rampStart || i > rampEnd) {
      rows.push({
        date: iso,
        impressions: 0,
        clicks: 0,
        costCents: 0,
        conversions: 0,
        revenueCents: 0,
      });
      continue;
    }

    // Relative day within the campaign's active window.
    const activeDay = i - rampStart;
    const activeLen = rampEnd - rampStart + 1;
    const drift = driftMultiplier(arch.drift, activeDay, activeLen);

    // Base daily noise: symmetric around 1.
    const baseNoise = 1 + (rng() * 2 - 1) * arch.noise;

    // Weekend modifier.
    const dow = dayOfWeek(iso);
    const weekend = dow === 0 || dow === 6 ? arch.weekendMultiplier : 1;

    // Early-learning jitter: first 7 days of active window are extra erratic.
    let learningNoise = 1;
    if (arch.sparseEarly && activeDay < 7) {
      // Occasionally zero (ad not approved, no delivery).
      if (rng() < 0.25) {
        rows.push({
          date: iso,
          impressions: 0,
          clicks: 0,
          costCents: 0,
          conversions: 0,
          revenueCents: 0,
        });
        continue;
      }
      learningNoise = 0.4 + rng() * 1.4;
    }

    // Sale-day boost.
    let saleBoost = 1;
    let saleConvBoost = 1;
    if (arch.saleBoostDays?.includes(i)) {
      saleBoost = 2.1 + rng() * 0.8;
      saleConvBoost = 2.8 + rng() * 1.2;
    }
    // Day after a sale day — hangover.
    if (arch.saleBoostDays?.includes(i - 1)) {
      saleBoost = 0.55 + rng() * 0.15;
      saleConvBoost = 0.5 + rng() * 0.2;
    }

    const costCents = Math.max(
      0,
      Math.round(
        arch.baselineCost *
          drift.cost *
          baseNoise *
          weekend *
          learningNoise *
          saleBoost,
      ),
    );

    // Impressions roughly scale with spend. CPM varies widely by channel:
    // LinkedIn B2B easily $50+, TikTok/Meta $8-15, Google Search (as CPC-
    // converted-to-CPM) $30-100. We pick a per-channel CPM below.
    // Note: in this synthetic model "arch.noise" is recycled indirectly —
    // the cpm factor is seeded by the same rng stream so everything stays
    // deterministic.
    const cpmBase =
      // Use ctr to imply channel-type cost: low CTR formats (YouTube
      // awareness, LinkedIn) → higher CPM; high CTR formats → lower CPM.
      // This is a rough heuristic, not a real model.
      arch.ctr < 0.005
        ? 5000 + rng() * 3000 // $50-$80 CPM (YouTube awareness, LI text ads)
        : arch.ctr < 0.015
          ? 3000 + rng() * 2000 // $30-$50 CPM (LinkedIn sponsored, YT shorts)
          : arch.ctr < 0.04
            ? 1400 + rng() * 900 // $14-$23 CPM (Meta, TikTok, non-brand Google)
            : 900 + rng() * 700; // $9-$16 CPM (brand search, retargeting, email)
    const impressions =
      costCents > 0
        ? Math.round((costCents / cpmBase) * 1000 * (0.85 + rng() * 0.3))
        : 0;

    const clicks = Math.round(impressions * arch.ctr * (0.9 + rng() * 0.2));

    const effCvr =
      arch.cvr * drift.cvr * saleConvBoost * (0.85 + rng() * 0.3) *
      (arch.sparseEarly && activeDay < 7 ? 0.5 + rng() * 1.2 : 1);
    const conversions = Math.max(0, Math.round(clicks * effCvr));

    const effAov =
      arch.aov * drift.aov * (0.9 + rng() * 0.2) * (saleBoost > 1.5 ? 0.92 : 1);
    const revenueCents = Math.max(0, Math.round(conversions * effAov));

    rows.push({
      date: iso,
      impressions,
      clicks,
      costCents,
      conversions,
      revenueCents,
    });
  }

  return rows;
}

// ---------------------------------------------------------------------------
// The 20 campaigns. Hand-composed so the dashboard tells a real story.
// Sale-day spike = day index 85 (about 5 days before "today" = Apr 10) for
// sales-objective campaigns. This is intentionally visible on the charts.
// ---------------------------------------------------------------------------

const SALE_WEEKEND = [85]; // Apr 10, 2026 — the fictional "Spring Sale" push.

type Spec = Omit<Campaign, "series" | "totalSpentCents"> & {
  archetype: Archetype;
  seed: number;
};

const SPECS: Spec[] = [
  // Note on units: all cents. $1 = 100. $100 = 10_000. $1000 = 100_000.
  // Daily spend ranges $20–$1,500 per day per campaign so that a 90-day ops
  // dashboard shows total spend in the $1M range — believable for a brand
  // doing real paid-media volume.

  {
    id: "cmp_01",
    name: "Spring Sale — Brand Search",
    channel: "google",
    objective: "sales",
    status: "active",
    startDate: START_DATE,
    endDate: null,
    dailyBudgetCents: 90_000, // $900/day budget
    archetype: {
      baselineCost: 82_000, // $820/day avg
      ctr: 0.082,
      cvr: 0.012, // 1.2% visit→purchase (realistic for branded)
      aov: 12_800, // $128 AOV
      noise: 0.14,
      drift: "flat",
      weekendMultiplier: 0.78,
      saleBoostDays: SALE_WEEKEND,
    },
    seed: 101,
  },
  {
    id: "cmp_02",
    name: "Performance Max — Evergreen",
    channel: "google",
    objective: "sales",
    status: "active",
    startDate: START_DATE,
    endDate: null,
    dailyBudgetCents: 110_000, // $1,100/day
    archetype: {
      baselineCost: 96_000, // $960/day
      ctr: 0.034,
      cvr: 0.026,
      aov: 11_400, // $114 AOV
      noise: 0.12,
      drift: "scaling",
      weekendMultiplier: 0.82,
      saleBoostDays: SALE_WEEKEND,
    },
    seed: 102,
  },
  {
    id: "cmp_03",
    name: "Non-Brand Conquest — US",
    channel: "google",
    objective: "sales",
    status: "active",
    startDate: START_DATE,
    endDate: null,
    dailyBudgetCents: 70_000, // $700/day
    archetype: {
      baselineCost: 62_000, // $620/day
      ctr: 0.028,
      cvr: 0.018,
      aov: 10_800, // $108 AOV
      // CAC creep #1 — spend holds, conversion rate degrading.
      drift: "creep",
      noise: 0.15,
      weekendMultiplier: 0.74,
      saleBoostDays: SALE_WEEKEND,
    },
    seed: 103,
  },
  {
    id: "cmp_04",
    name: "YouTube In-Stream — Brand Story",
    channel: "youtube",
    objective: "awareness",
    status: "active",
    startDate: START_DATE,
    endDate: null,
    dailyBudgetCents: 40_000, // $400/day
    archetype: {
      baselineCost: 36_000, // $360/day
      ctr: 0.004,
      cvr: 0.009,
      aov: 6_200, // $62 (awareness — view-through value proxy)
      noise: 0.18,
      drift: "flat",
      weekendMultiplier: 1.05,
    },
    seed: 104,
  },
  {
    id: "cmp_05",
    name: "Meta Advantage+ — Catalog",
    channel: "meta",
    objective: "sales",
    status: "active",
    startDate: START_DATE,
    endDate: null,
    dailyBudgetCents: 80_000, // $800/day
    archetype: {
      baselineCost: 72_000,
      ctr: 0.021,
      cvr: 0.034,
      aov: 8_400, // $84 AOV
      noise: 0.13,
      drift: "ramp-up",
      weekendMultiplier: 1.12,
      saleBoostDays: SALE_WEEKEND,
    },
    seed: 105,
  },
  {
    id: "cmp_06",
    name: "Meta Reels — Creator Testimonial",
    channel: "meta",
    objective: "traffic",
    status: "active",
    startDate: START_DATE,
    endDate: null,
    dailyBudgetCents: 32_000, // $320/day
    archetype: {
      baselineCost: 29_000,
      ctr: 0.038,
      cvr: 0.012,
      aov: 5_800, // $58 AOV
      noise: 0.22,
      // CAC creep #2 — creative fatigue.
      drift: "creep",
      weekendMultiplier: 1.18,
    },
    seed: 106,
  },
  {
    id: "cmp_07",
    name: "Meta Retargeting — 30d Cart",
    channel: "meta",
    objective: "retention",
    status: "active",
    startDate: START_DATE,
    endDate: null,
    dailyBudgetCents: 20_000, // $200/day
    archetype: {
      baselineCost: 18_000,
      ctr: 0.064,
      cvr: 0.022, // 2.2% cart-abandoner conversion
      aov: 7_200, // $72 AOV
      noise: 0.11,
      drift: "flat",
      weekendMultiplier: 0.95,
      saleBoostDays: SALE_WEEKEND,
    },
    seed: 107,
  },
  {
    id: "cmp_08",
    name: "TikTok Spark Ads — Unboxing",
    channel: "tiktok",
    objective: "traffic",
    status: "active",
    startDate: START_DATE,
    endDate: null,
    dailyBudgetCents: 26_000, // $260/day
    archetype: {
      baselineCost: 24_000,
      ctr: 0.042,
      cvr: 0.014,
      aov: 4_800, // $48 AOV
      noise: 0.2,
      drift: "ramp-up",
      weekendMultiplier: 1.25,
    },
    seed: 108,
  },
  {
    id: "cmp_09",
    name: "TikTok — Shop Launch",
    channel: "tiktok",
    objective: "sales",
    status: "learning",
    startDate: isoAddDays(DASHBOARD_TODAY, -6), // first 7 days, erratic
    endDate: null,
    dailyBudgetCents: 18_000, // $180/day
    archetype: {
      baselineCost: 15_000,
      ctr: 0.029,
      cvr: 0.019,
      aov: 5_200, // $52 AOV
      noise: 0.35,
      drift: "flat",
      weekendMultiplier: 1.2,
      rampStartDay: SERIES_DAYS - 7, // last 7 days only
      sparseEarly: true,
    },
    seed: 109,
  },
  {
    id: "cmp_10",
    name: "LinkedIn — SaaS Decision Makers",
    channel: "linkedin",
    objective: "leads",
    status: "active",
    startDate: START_DATE,
    endDate: null,
    dailyBudgetCents: 60_000, // $600/day
    archetype: {
      baselineCost: 54_000,
      ctr: 0.008,
      cvr: 0.042,
      aov: 4_800, // lead value $48
      noise: 0.16,
      drift: "flat",
      weekendMultiplier: 0.3, // B2B doesn't deliver weekends
    },
    seed: 110,
  },
  {
    id: "cmp_11",
    name: "LinkedIn — Whitepaper Gate",
    channel: "linkedin",
    objective: "leads",
    status: "active",
    startDate: START_DATE,
    endDate: null,
    dailyBudgetCents: 38_000, // $380/day
    archetype: {
      baselineCost: 34_000,
      ctr: 0.012,
      cvr: 0.056,
      aov: 3_900, // $39 lead value
      noise: 0.14,
      drift: "flat",
      weekendMultiplier: 0.32,
    },
    seed: 111,
  },
  {
    id: "cmp_12",
    name: "YouTube Shorts — Product Demo",
    channel: "youtube",
    objective: "awareness",
    status: "active",
    startDate: START_DATE,
    endDate: null,
    dailyBudgetCents: 22_000, // $220/day
    archetype: {
      baselineCost: 20_000,
      ctr: 0.012,
      cvr: 0.008,
      aov: 4_200, // $42
      noise: 0.19,
      drift: "flat",
      weekendMultiplier: 1.1,
    },
    seed: 112,
  },
  {
    id: "cmp_13",
    name: "Email — Winback 90d",
    channel: "email",
    objective: "retention",
    status: "active",
    startDate: START_DATE,
    endDate: null,
    dailyBudgetCents: 4_000, // $40/day (ESP + creative amortized)
    archetype: {
      baselineCost: 3_800,
      ctr: 0.11,
      cvr: 0.018, // 1.8% purchase off a winback click
      aov: 6_400, // $64 AOV
      noise: 0.1,
      drift: "flat",
      weekendMultiplier: 0.7,
      saleBoostDays: SALE_WEEKEND,
    },
    seed: 113,
  },
  {
    id: "cmp_14",
    name: "Email — Post-Purchase Flow",
    channel: "email",
    objective: "retention",
    status: "active",
    startDate: START_DATE,
    endDate: null,
    dailyBudgetCents: 2_500, // $25/day
    archetype: {
      baselineCost: 2_300,
      ctr: 0.18,
      cvr: 0.024, // 2.4% purchase off a post-purchase email click
      aov: 7_100, // $71 AOV
      noise: 0.09,
      drift: "flat",
      weekendMultiplier: 0.88,
    },
    seed: 114,
  },
  {
    id: "cmp_15",
    name: "Meta — Cold Prospecting LAL 2%",
    channel: "meta",
    objective: "sales",
    status: "paused",
    startDate: START_DATE,
    endDate: isoAddDays(DASHBOARD_TODAY, -18),
    dailyBudgetCents: 48_000, // $480/day
    archetype: {
      baselineCost: 44_000,
      ctr: 0.019,
      cvr: 0.018,
      aov: 7_800, // $78 AOV — a losing campaign (it's why it got paused)
      noise: 0.17,
      drift: "decay",
      weekendMultiplier: 1.04,
      rampEndDay: SERIES_DAYS - 19,
    },
    seed: 115,
  },
  {
    id: "cmp_16",
    name: "Google — Competitor Bidding",
    channel: "google",
    objective: "traffic",
    status: "paused",
    startDate: START_DATE,
    endDate: isoAddDays(DASHBOARD_TODAY, -12),
    dailyBudgetCents: 24_000, // $240/day
    archetype: {
      baselineCost: 22_000,
      ctr: 0.046,
      cvr: 0.012,
      aov: 5_400, // $54 — expensive clicks, few conversions — losing ROAS
      noise: 0.2,
      drift: "decay",
      weekendMultiplier: 0.8,
      rampEndDay: SERIES_DAYS - 13,
    },
    seed: 116,
  },
  {
    id: "cmp_17",
    name: "TikTok — Affiliate Seeding",
    channel: "tiktok",
    objective: "awareness",
    status: "ended",
    startDate: START_DATE,
    endDate: isoAddDays(DASHBOARD_TODAY, -30),
    dailyBudgetCents: 16_000, // $160/day
    archetype: {
      baselineCost: 14_000,
      ctr: 0.033,
      cvr: 0.006,
      aov: 3_900, // $39 — low ROAS awareness test
      noise: 0.22,
      drift: "flat",
      weekendMultiplier: 1.18,
      rampEndDay: SERIES_DAYS - 31,
    },
    seed: 117,
  },
  {
    id: "cmp_18",
    name: "YouTube — Holiday Masthead",
    channel: "youtube",
    objective: "awareness",
    status: "ended",
    startDate: START_DATE,
    endDate: isoAddDays(DASHBOARD_TODAY, -45),
    dailyBudgetCents: 92_000, // $920/day burst
    archetype: {
      baselineCost: 85_000,
      ctr: 0.003,
      cvr: 0.004,
      aov: 5_800, // $58 — awareness, low direct ROAS
      noise: 0.11,
      drift: "flat",
      weekendMultiplier: 1.02,
      rampEndDay: SERIES_DAYS - 46,
    },
    seed: 118,
  },
  {
    id: "cmp_19",
    name: "Google DSA — Long-Tail Catalog",
    channel: "google",
    objective: "traffic",
    status: "active",
    startDate: START_DATE,
    endDate: null,
    dailyBudgetCents: 16_000, // $160/day
    archetype: {
      baselineCost: 14_000,
      ctr: 0.026,
      cvr: 0.011,
      aov: 6_200, // $62
      noise: 0.16,
      drift: "ramp-up",
      weekendMultiplier: 0.78,
    },
    seed: 119,
  },
  {
    id: "cmp_20",
    name: "LinkedIn — Event Promotion",
    channel: "linkedin",
    objective: "awareness",
    status: "active",
    startDate: isoAddDays(DASHBOARD_TODAY, -21),
    endDate: null,
    dailyBudgetCents: 12_000, // $120/day
    archetype: {
      baselineCost: 10_800,
      ctr: 0.009,
      cvr: 0.022,
      aov: 2_800, // $28 event-signup value
      noise: 0.14,
      drift: "ramp-up",
      weekendMultiplier: 0.25,
      rampStartDay: SERIES_DAYS - 22,
    },
    seed: 120,
  },
];

// ---------------------------------------------------------------------------
// Build the final dataset. totalSpentCents is derived from the series so the
// aggregate math always adds up.
// ---------------------------------------------------------------------------

export const CAMPAIGNS: Campaign[] = SPECS.map((spec) => {
  const series = generateSeries(spec.archetype, spec.seed);
  const totalSpentCents = series.reduce((s, r) => s + r.costCents, 0);
  const { archetype: _a, seed: _s, ...rest } = spec;
  void _a;
  void _s;
  return {
    ...rest,
    series,
    totalSpentCents,
  };
});

// ---------------------------------------------------------------------------
// Convenience aggregates — used by the dashboard in multiple places.
// ---------------------------------------------------------------------------

export function sumWindow(
  series: DailyPoint[],
  fromIso: string,
  toIso: string,
): {
  impressions: number;
  clicks: number;
  costCents: number;
  conversions: number;
  revenueCents: number;
  days: number;
} {
  let impressions = 0,
    clicks = 0,
    costCents = 0,
    conversions = 0,
    revenueCents = 0,
    days = 0;
  for (const r of series) {
    if (r.date < fromIso || r.date > toIso) continue;
    impressions += r.impressions;
    clicks += r.clicks;
    costCents += r.costCents;
    conversions += r.conversions;
    revenueCents += r.revenueCents;
    days += 1;
  }
  return { impressions, clicks, costCents, conversions, revenueCents, days };
}
