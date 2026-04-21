// ---------------------------------------------------------------------------
// SaaS Dashboard Starter — deterministic mock dataset.
//
// Everything here is generated from a seeded PRNG so tiles, charts and tables
// always tie out to the same numbers. Nothing in the demo talks to a server.
// ---------------------------------------------------------------------------

// ---------- tiny seeded PRNG (mulberry32) ----------
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function rand(): number {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SEED = 0xc0ffee;
const rand = mulberry32(SEED);

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(rand() * (max - min + 1)) + min;
}

// Fixed "today" for the demo so sparkline dates don't drift.
export const DASHBOARD_TODAY = "2026-04-16";

function isoAddDays(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------
// Workspaces
// ---------------------------------------------------------------------------

export type Workspace = {
  id: string;
  name: string;
  plan: "free" | "starter" | "growth" | "scale";
  domain: string;
  initials: string;
};

export const WORKSPACES: Workspace[] = [
  {
    id: "ws_oakbend",
    name: "Oakbend Studio",
    plan: "growth",
    domain: "oakbend.studio",
    initials: "OB",
  },
  {
    id: "ws_parallel",
    name: "Parallel Press",
    plan: "scale",
    domain: "parallelpress.co",
    initials: "PP",
  },
  {
    id: "ws_ridgeline",
    name: "Ridgeline Labs",
    plan: "starter",
    domain: "ridgeline.dev",
    initials: "RL",
  },
];

// ---------------------------------------------------------------------------
// Users (80)
// ---------------------------------------------------------------------------

export type Plan = "free" | "starter" | "growth" | "scale";
export type UserStatus = "active" | "invited" | "dormant" | "suspended";

export type User = {
  id: string;
  name: string;
  email: string;
  plan: Plan;
  status: UserStatus;
  lastActive: string; // ISO date
  joinedAt: string; // ISO date
  mrrCents: number; // what this user contributes
  workspaceId: string;
  role: "owner" | "admin" | "editor" | "viewer";
  seats: number;
  country: string;
};

const FIRST_NAMES = [
  "Ada", "Eli", "Mira", "Jonah", "Saoirse", "Theo", "Noa", "Kenji", "Harper",
  "Idris", "Leila", "Hiro", "Anya", "Silas", "Cora", "Dev", "Maren", "Oskar",
  "Ruth", "Tomas", "Wren", "Zahra", "Bex", "Clem", "Fen", "Gus", "Hana",
  "Ines", "Jade", "Kai", "Lior", "Mae", "Nico", "Owen", "Petra", "Quinn",
  "Rae", "Sana", "Tilda", "Uma", "Vidya", "Wade", "Xochi", "Yara", "Zia",
  "Bruno", "Cassia", "Dara", "Elif", "Frida", "Gio", "Hilde", "Imre", "Juno",
  "Kavi", "Lars", "Mila", "Niko", "Ollie", "Pia", "Rafe", "Suri", "Taj",
  "Uli", "Vesna", "Wolf", "Yuki", "Zed",
];

const LAST_NAMES = [
  "Park", "Oduya", "Hale", "Okafor", "Brandt", "Ruiz", "Singh", "Novak",
  "Chen", "Ibsen", "Costa", "Mwangi", "Yoon", "Petrov", "Sato", "Lindqvist",
  "Abara", "Reyes", "Iqbal", "Kovac", "Tan", "Nguyen", "Solberg", "Vidal",
  "Ashby", "Bauer", "Caro", "Diop", "Esen", "Fahri", "Groth", "Holt",
];

const DOMAINS = [
  "oakbend.studio", "parallelpress.co", "ridgeline.dev", "foldmail.io",
  "brightsidelabs.com", "lumenui.co", "acutepress.com", "glasshouseco.io",
];

const COUNTRIES = ["US", "DE", "JP", "UK", "CA", "FR", "AU", "NL", "SE", "BR"];

const PLAN_PRICE_CENTS: Record<Plan, number> = {
  free: 0,
  starter: 1900,
  growth: 4900,
  scale: 14900,
};

export const USERS: User[] = (() => {
  const list: User[] = [];
  const used = new Set<string>();
  // Distribution: ~55% active, ~10% invited, ~25% dormant, ~10% suspended.
  // Plan split: ~28% free, ~30% starter, ~30% growth, ~12% scale.
  for (let i = 0; i < 80; i++) {
    const first = FIRST_NAMES[(i * 7 + 3) % FIRST_NAMES.length];
    const last = LAST_NAMES[(i * 11 + 1) % LAST_NAMES.length];
    let base = `${first.toLowerCase()}.${last.toLowerCase()}`;
    let email = `${base}@${DOMAINS[i % DOMAINS.length]}`;
    let tries = 0;
    while (used.has(email) && tries < 10) {
      email = `${base}${tries + 1}@${DOMAINS[i % DOMAINS.length]}`;
      tries++;
    }
    used.add(email);

    const r = rand();
    const status: UserStatus =
      r < 0.55 ? "active" : r < 0.65 ? "invited" : r < 0.9 ? "dormant" : "suspended";

    const rp = rand();
    const plan: Plan =
      rp < 0.28 ? "free" : rp < 0.58 ? "starter" : rp < 0.88 ? "growth" : "scale";

    // last active: active users within 7 days, dormant 30-120d, invited n/a.
    let daysSinceActive: number;
    if (status === "active") daysSinceActive = randInt(0, 6);
    else if (status === "invited") daysSinceActive = randInt(14, 60);
    else if (status === "dormant") daysSinceActive = randInt(30, 120);
    else daysSinceActive = randInt(90, 300);

    const lastActive = isoAddDays(DASHBOARD_TODAY, -daysSinceActive);
    const joinedAt = isoAddDays(DASHBOARD_TODAY, -randInt(30, 720));
    const role: User["role"] =
      i === 0 ? "owner" : i < 6 ? "admin" : rand() < 0.6 ? "editor" : "viewer";
    const seats = plan === "scale" ? randInt(4, 12) : plan === "growth" ? randInt(2, 5) : 1;

    list.push({
      id: `usr_${String(i + 1).padStart(3, "0")}`,
      name: `${first} ${last}`,
      email,
      plan,
      status,
      lastActive,
      joinedAt,
      mrrCents: status === "suspended" ? 0 : PLAN_PRICE_CENTS[plan] * (plan === "scale" || plan === "growth" ? seats : 1),
      workspaceId: WORKSPACES[i % WORKSPACES.length].id,
      role,
      seats,
      country: COUNTRIES[(i * 3 + 2) % COUNTRIES.length],
    });
  }
  return list;
})();

// Derived user counts (what tiles quote).
export const ACTIVE_USERS = USERS.filter((u) => u.status === "active").length;
export const TOTAL_PAYING = USERS.filter(
  (u) => u.status !== "suspended" && u.plan !== "free",
).length;

// ---------------------------------------------------------------------------
// 12 months of MRR / users / churn
// ---------------------------------------------------------------------------

export type MonthlySnapshot = {
  month: string; // "2025-05"
  label: string; // "May"
  mrrCents: number;
  newMrrCents: number;
  expansionMrrCents: number;
  churnedMrrCents: number;
  netNewUsers: number;
  activeUsers: number;
  churnRate: number; // fraction
  npsScore: number;
};

export const MRR_HISTORY: MonthlySnapshot[] = (() => {
  // 12 months ending at current month (Apr 2026).
  // Walk backwards from today's MRR so the last bucket matches derived totals.
  const liveMrrCents = USERS.reduce((s, u) => s + u.mrrCents, 0);

  const months: { month: string; label: string }[] = [];
  const monthLabels = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  // Apr 2026 is the last bucket. Walk back 11 months.
  for (let i = 11; i >= 0; i--) {
    const year = 2026;
    const monthIdx = 3 - i; // Apr = 3
    const rawMonth = ((monthIdx % 12) + 12) % 12;
    const y = year + Math.floor(monthIdx / 12) - (monthIdx < 0 ? 1 : 0);
    months.push({
      month: `${y}-${String(rawMonth + 1).padStart(2, "0")}`,
      label: monthLabels[rawMonth],
    });
  }

  // Work backwards from liveMrrCents, each month ~6-11% smaller than current
  // with noise. This models steady growth.
  const history: MonthlySnapshot[] = [];
  let mrr = liveMrrCents;
  let users = ACTIVE_USERS;
  for (let i = months.length - 1; i >= 0; i--) {
    const m = months[i];
    // For now stash cur values; we'll walk backwards next.
    history.unshift({
      month: m.month,
      label: m.label,
      mrrCents: mrr,
      newMrrCents: 0,
      expansionMrrCents: 0,
      churnedMrrCents: 0,
      netNewUsers: 0,
      activeUsers: users,
      churnRate: 0,
      npsScore: 0,
    });
    // Step backwards
    const growth = 0.06 + rand() * 0.05; // 6-11%
    mrr = Math.round(mrr / (1 + growth));
    users = Math.max(20, Math.round(users / (1 + growth * 0.9)));
  }
  // Second pass — compute deltas.
  for (let i = 0; i < history.length; i++) {
    const cur = history[i];
    const prev = i > 0 ? history[i - 1] : null;
    if (prev) {
      const mrrDelta = cur.mrrCents - prev.mrrCents;
      const expansion = Math.round(mrrDelta * (0.15 + rand() * 0.1));
      const churn = Math.round(prev.mrrCents * (0.018 + rand() * 0.018));
      const newBiz = mrrDelta + churn - expansion;
      cur.newMrrCents = Math.max(0, newBiz);
      cur.expansionMrrCents = Math.max(0, expansion);
      cur.churnedMrrCents = Math.max(0, churn);
      cur.netNewUsers = cur.activeUsers - prev.activeUsers;
      cur.churnRate = churn / Math.max(1, prev.mrrCents);
    } else {
      cur.newMrrCents = Math.round(cur.mrrCents * 0.08);
      cur.expansionMrrCents = Math.round(cur.mrrCents * 0.02);
      cur.churnedMrrCents = Math.round(cur.mrrCents * 0.025);
      cur.netNewUsers = 0;
      cur.churnRate = 0.025;
    }
    cur.npsScore = Math.round(38 + rand() * 22); // 38-60
  }
  return history;
})();

export const CURRENT_MRR_CENTS = MRR_HISTORY[MRR_HISTORY.length - 1].mrrCents;
export const PRIOR_MRR_CENTS = MRR_HISTORY[MRR_HISTORY.length - 2].mrrCents;
export const CURRENT_CHURN = MRR_HISTORY[MRR_HISTORY.length - 1].churnRate;
export const CURRENT_NPS = MRR_HISTORY[MRR_HISTORY.length - 1].npsScore;

// ---------------------------------------------------------------------------
// Invoices (12 months)
// ---------------------------------------------------------------------------

export type InvoiceStatus = "paid" | "open" | "void" | "refunded";

export type Invoice = {
  id: string;
  number: string;
  issuedAt: string;
  periodStart: string;
  periodEnd: string;
  amountCents: number;
  status: InvoiceStatus;
  method: "card_visa_4242" | "card_mc_5534" | "ach_1089";
  description: string;
};

export const INVOICES: Invoice[] = MRR_HISTORY.map((m, i) => {
  const periodStart = `${m.month}-01`;
  const [y, mo] = m.month.split("-").map(Number);
  const lastDay = new Date(Date.UTC(y, mo, 0)).getUTCDate();
  const periodEnd = `${m.month}-${String(lastDay).padStart(2, "0")}`;
  const issuedAt = `${m.month}-${String(Math.min(lastDay, 1)).padStart(2, "0")}`;
  const seatAddon = Math.round(m.expansionMrrCents / 2);
  const amount = Math.round(m.mrrCents * 0.94) + seatAddon;
  // last month (current) is "open", all prior are paid.
  const isCurrent = i === MRR_HISTORY.length - 1;
  return {
    id: `in_${m.month.replace("-", "")}`,
    number: `INV-${String(2024100 + i).padStart(7, "0")}`,
    issuedAt,
    periodStart,
    periodEnd,
    amountCents: amount,
    status: isCurrent ? "open" : "paid",
    method: i % 5 === 0 ? "ach_1089" : i % 3 === 0 ? "card_mc_5534" : "card_visa_4242",
    description: `Growth plan · ${m.label} ${y}`,
  };
});

// ---------------------------------------------------------------------------
// Event types × 90 days
// ---------------------------------------------------------------------------

export type EventType =
  | "page_view"
  | "signup"
  | "login"
  | "api_call"
  | "export"
  | "checkout"
  | "invite_sent"
  | "webhook_fired";

export const EVENT_META: Record<EventType, { label: string; color: string }> = {
  page_view: { label: "Page view", color: "#1F3A2F" },
  signup: { label: "Signup", color: "#2D5240" },
  login: { label: "Login", color: "#C85A3F" },
  api_call: { label: "API call", color: "#D47963" },
  export: { label: "Export", color: "#E8C77F" },
  checkout: { label: "Checkout", color: "#9DB89F" },
  invite_sent: { label: "Invite sent", color: "#8F8B80" },
  webhook_fired: { label: "Webhook fired", color: "#B08A4F" },
};

export type DailyEventPoint = {
  date: string;
  counts: Record<EventType, number>;
  dau: number;
  wau: number;
  mau: number;
};

export const EVENT_HISTORY: DailyEventPoint[] = (() => {
  const days = 90;
  const pts: DailyEventPoint[] = [];
  // base intensity per event type (per-day average).
  const baseCounts: Record<EventType, number> = {
    page_view: 4200,
    signup: 18,
    login: 640,
    api_call: 9400,
    export: 42,
    checkout: 11,
    invite_sent: 9,
    webhook_fired: 1800,
  };
  // Growth factor: series ramps up over 90 days ~35%.
  for (let i = 0; i < days; i++) {
    const date = isoAddDays(DASHBOARD_TODAY, -(days - 1 - i));
    const day = new Date(date + "T00:00:00Z").getUTCDay();
    const weekend = day === 0 || day === 6 ? 0.55 : 1;
    const ramp = 0.75 + (i / (days - 1)) * 0.5;
    const counts = {} as Record<EventType, number>;
    for (const k of Object.keys(baseCounts) as EventType[]) {
      const jitter = 0.82 + rand() * 0.36;
      counts[k] = Math.max(0, Math.round(baseCounts[k] * weekend * ramp * jitter));
    }
    // DAU/WAU/MAU approximated from login volume.
    const dau = Math.round(counts.login * (0.25 + rand() * 0.08));
    pts.push({ date, counts, dau, wau: 0, mau: 0 });
  }
  // Second pass — rolling windows.
  for (let i = 0; i < pts.length; i++) {
    const start7 = Math.max(0, i - 6);
    const start30 = Math.max(0, i - 29);
    const uniq7 = pts.slice(start7, i + 1).reduce((s, p) => s + p.dau, 0);
    const uniq30 = pts.slice(start30, i + 1).reduce((s, p) => s + p.dau, 0);
    // Dedupe approximation — divide by average revisit rate.
    pts[i].wau = Math.round(uniq7 / 1.9);
    pts[i].mau = Math.round(uniq30 / 4.6);
  }
  return pts;
})();

export const EVENT_TOTALS_90D: Record<EventType, number> = (() => {
  const out = {} as Record<EventType, number>;
  for (const k of Object.keys(EVENT_META) as EventType[]) {
    out[k] = EVENT_HISTORY.reduce((s, p) => s + p.counts[k], 0);
  }
  return out;
})();

// ---------------------------------------------------------------------------
// Funnel
// ---------------------------------------------------------------------------

export type FunnelStep = {
  id: string;
  label: string;
  count: number;
};

export const FUNNEL_STEPS: FunnelStep[] = (() => {
  const visits = 84210;
  const signup = Math.round(visits * 0.183);
  const activated = Math.round(signup * 0.62);
  const subscribed = Math.round(activated * 0.44);
  const retained30 = Math.round(subscribed * 0.81);
  return [
    { id: "visit", label: "Landing visit", count: visits },
    { id: "signup", label: "Signup", count: signup },
    { id: "activated", label: "First value", count: activated },
    { id: "subscribed", label: "Subscribed", count: subscribed },
    { id: "retained", label: "Retained 30d", count: retained30 },
  ];
})();

// ---------------------------------------------------------------------------
// Cohort retention (last 8 months × 6 periods)
// ---------------------------------------------------------------------------

export type CohortRow = {
  cohort: string; // label
  size: number;
  retention: number[]; // length 6 — % retained by month 0..5
};

export const COHORTS: CohortRow[] = (() => {
  const rows: CohortRow[] = [];
  for (let i = 0; i < 8; i++) {
    const m = MRR_HISTORY[MRR_HISTORY.length - 8 + i];
    const size = Math.max(18, m.netNewUsers > 0 ? m.netNewUsers + 22 : 24 + Math.round(rand() * 20));
    const retention: number[] = [];
    const maxPeriods = 8 - i; // first cohort has full 6 periods, last has 1
    const periods = Math.min(6, maxPeriods);
    let pct = 1;
    for (let p = 0; p < periods; p++) {
      if (p === 0) {
        pct = 1;
      } else {
        const drop = 0.08 + rand() * 0.07;
        pct = Math.max(0.4, pct - drop);
      }
      retention.push(pct);
    }
    rows.push({
      cohort: `${m.label} ${m.month.slice(0, 4)}`,
      size,
      retention,
    });
  }
  return rows;
})();

// ---------------------------------------------------------------------------
// Activity feed
// ---------------------------------------------------------------------------

export type ActivityEntry = {
  id: string;
  at: string; // ISO
  actor: string;
  kind: "signup" | "plan_change" | "invite" | "payment" | "export" | "api_key" | "system";
  description: string;
};

export const ACTIVITY_FEED: ActivityEntry[] = [
  {
    id: "act_001",
    at: `${DASHBOARD_TODAY}T09:12:00Z`,
    actor: "Saoirse Park",
    kind: "plan_change",
    description: "upgraded Parallel Press from Growth → Scale.",
  },
  {
    id: "act_002",
    at: `${DASHBOARD_TODAY}T08:47:00Z`,
    actor: "System",
    kind: "payment",
    description: "Invoice INV-0024111 of $48,420.00 paid via card_visa_4242.",
  },
  {
    id: "act_003",
    at: `${DASHBOARD_TODAY}T07:51:00Z`,
    actor: "Ada Okafor",
    kind: "invite",
    description: "invited 3 teammates to Oakbend Studio.",
  },
  {
    id: "act_004",
    at: `${isoAddDays(DASHBOARD_TODAY, -1)}T22:08:00Z`,
    actor: "Kenji Sato",
    kind: "api_key",
    description: "rotated the production API key.",
  },
  {
    id: "act_005",
    at: `${isoAddDays(DASHBOARD_TODAY, -1)}T18:22:00Z`,
    actor: "Leila Abara",
    kind: "export",
    description: "exported 1,204 contacts to CSV.",
  },
  {
    id: "act_006",
    at: `${isoAddDays(DASHBOARD_TODAY, -1)}T16:40:00Z`,
    actor: "System",
    kind: "system",
    description: "webhook retry succeeded after 2 attempts.",
  },
  {
    id: "act_007",
    at: `${isoAddDays(DASHBOARD_TODAY, -1)}T12:05:00Z`,
    actor: "Noa Ibsen",
    kind: "signup",
    description: "joined via invite from Saoirse Park.",
  },
  {
    id: "act_008",
    at: `${isoAddDays(DASHBOARD_TODAY, -2)}T21:14:00Z`,
    actor: "Theo Ruiz",
    kind: "plan_change",
    description: "downgraded Ridgeline Labs to Starter.",
  },
];

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export type NotificationKind = "billing" | "system" | "team" | "security";

export type NotificationItem = {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  at: string; // ISO datetime
  unread: boolean;
};

export const NOTIFICATIONS: NotificationItem[] = [
  {
    id: "ntf_1",
    kind: "billing",
    title: "Invoice INV-0024111 issued",
    body: "Your April invoice is ready. Auto-pay will run tomorrow on card_visa_4242.",
    at: `${DASHBOARD_TODAY}T09:00:00Z`,
    unread: true,
  },
  {
    id: "ntf_2",
    kind: "security",
    title: "New login from Osaka",
    body: "Kenji Sato signed in from a new device. If this wasn't you, revoke the session.",
    at: `${isoAddDays(DASHBOARD_TODAY, -1)}T22:31:00Z`,
    unread: true,
  },
  {
    id: "ntf_3",
    kind: "team",
    title: "3 pending invites",
    body: "Teammates haven't accepted their invites yet — resend with one click.",
    at: `${isoAddDays(DASHBOARD_TODAY, -1)}T14:18:00Z`,
    unread: true,
  },
  {
    id: "ntf_4",
    kind: "system",
    title: "Webhook endpoint restored",
    body: "hooks.oakbend.studio/events is receiving deliveries again after a brief outage.",
    at: `${isoAddDays(DASHBOARD_TODAY, -1)}T11:04:00Z`,
    unread: false,
  },
  {
    id: "ntf_5",
    kind: "billing",
    title: "Seat usage at 82%",
    body: "Parallel Press is approaching the seat cap on Growth. Scale adds room.",
    at: `${isoAddDays(DASHBOARD_TODAY, -2)}T08:44:00Z`,
    unread: false,
  },
  {
    id: "ntf_6",
    kind: "system",
    title: "Quarterly digest ready",
    body: "Your Q1 performance summary is waiting in Analytics.",
    at: `${isoAddDays(DASHBOARD_TODAY, -3)}T07:15:00Z`,
    unread: false,
  },
];

// ---------------------------------------------------------------------------
// Billing / usage
// ---------------------------------------------------------------------------

export type UsageMeter = {
  label: string;
  used: number;
  cap: number;
  unit: string;
};

export const USAGE_METERS: UsageMeter[] = [
  { label: "API calls", used: 412_840, cap: 1_000_000, unit: "calls" },
  { label: "Seats", used: 11, cap: 15, unit: "seats" },
  { label: "Storage", used: 78.4, cap: 200, unit: "GB" },
  { label: "Webhook events", used: 24_118, cap: 100_000, unit: "events" },
];

export type PlanOption = {
  id: string;
  name: string;
  priceCents: number;
  cadence: string;
  bullets: string[];
  recommended?: boolean;
};

export const PLAN_OPTIONS: PlanOption[] = [
  {
    id: "starter",
    name: "Starter",
    priceCents: 1900,
    cadence: "month",
    bullets: ["3 seats", "25k API calls", "Community support"],
  },
  {
    id: "growth",
    name: "Growth",
    priceCents: 4900,
    cadence: "month",
    bullets: ["15 seats", "1M API calls", "Priority email", "Audit log"],
    recommended: true,
  },
  {
    id: "scale",
    name: "Scale",
    priceCents: 14900,
    cadence: "month",
    bullets: ["Unlimited seats", "10M API calls", "SSO + SAML", "Dedicated CSM"],
  },
];

export const CURRENT_PLAN_ID = "growth";

// ---------------------------------------------------------------------------
// Team + API keys + webhooks
// ---------------------------------------------------------------------------

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "editor" | "viewer";
  addedAt: string;
};

export const TEAM_MEMBERS: TeamMember[] = [
  { id: "mem_1", name: "Ada Okafor", email: "ada@oakbend.studio", role: "owner", addedAt: "2024-06-18" },
  { id: "mem_2", name: "Saoirse Park", email: "saoirse@oakbend.studio", role: "admin", addedAt: "2024-09-02" },
  { id: "mem_3", name: "Kenji Sato", email: "kenji@oakbend.studio", role: "admin", addedAt: "2025-01-14" },
  { id: "mem_4", name: "Leila Abara", email: "leila@oakbend.studio", role: "editor", addedAt: "2025-04-27" },
  { id: "mem_5", name: "Noa Ibsen", email: "noa@oakbend.studio", role: "editor", addedAt: "2025-08-12" },
  { id: "mem_6", name: "Theo Ruiz", email: "theo@oakbend.studio", role: "viewer", addedAt: "2026-01-30" },
];

export type ApiKey = {
  id: string;
  label: string;
  prefix: string; // visible
  secret: string; // masked in UI
  createdAt: string;
  lastUsedAt: string;
  scopes: string[];
};

export const API_KEYS: ApiKey[] = [
  {
    id: "key_1",
    label: "Production",
    prefix: "sk_live_7f2a",
    secret: "sk_live_7f2a_9K3qXb8NcR4MvYtLpEwHgAdSfZj",
    createdAt: "2024-11-04",
    lastUsedAt: `${DASHBOARD_TODAY}T09:12:00Z`,
    scopes: ["read:all", "write:all", "webhook:manage"],
  },
  {
    id: "key_2",
    label: "Staging",
    prefix: "sk_test_4c11",
    secret: "sk_test_4c11_wPq2kRnY6bXhJmVoD3uFeLsAtZi",
    createdAt: "2025-03-20",
    lastUsedAt: `${isoAddDays(DASHBOARD_TODAY, -2)}T17:44:00Z`,
    scopes: ["read:all", "write:all"],
  },
  {
    id: "key_3",
    label: "Analytics read-only",
    prefix: "sk_live_a9d0",
    secret: "sk_live_a9d0_Th5vBcMxLnKqYwEr2uGfJhPdRs7",
    createdAt: "2025-10-09",
    lastUsedAt: `${isoAddDays(DASHBOARD_TODAY, -7)}T06:02:00Z`,
    scopes: ["read:analytics", "read:users"],
  },
];

export type Webhook = {
  id: string;
  url: string;
  events: string[];
  active: boolean;
  lastDeliveryAt: string;
  lastStatus: "ok" | "failed";
};

export const WEBHOOKS: Webhook[] = [
  {
    id: "wh_1",
    url: "https://hooks.oakbend.studio/events",
    events: ["user.created", "subscription.updated", "invoice.paid"],
    active: true,
    lastDeliveryAt: `${DASHBOARD_TODAY}T08:11:00Z`,
    lastStatus: "ok",
  },
  {
    id: "wh_2",
    url: "https://analytics.parallelpress.co/ingest",
    events: ["event.tracked", "export.completed"],
    active: true,
    lastDeliveryAt: `${isoAddDays(DASHBOARD_TODAY, -1)}T21:40:00Z`,
    lastStatus: "ok",
  },
];

// ---------------------------------------------------------------------------
// Formatting helpers (re-used across views)
// ---------------------------------------------------------------------------

export function formatMoney(cents: number): string {
  if (cents === 0) return "$0";
  if (cents >= 1_000_000_00) return `$${(cents / 100_000_000).toFixed(2)}M`;
  if (cents >= 10_000_00) return `$${Math.round(cents / 100).toLocaleString("en-US")}`;
  if (cents >= 1_000_00) return `$${(cents / 100).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  return `$${(cents / 100).toFixed(2)}`;
}

export function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}k`;
  return n.toLocaleString("en-US");
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1)).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function daysAgo(iso: string): string {
  const then = new Date(iso.length === 10 ? iso + "T12:00:00Z" : iso);
  const now = new Date(DASHBOARD_TODAY + "T12:00:00Z");
  const diff = Math.round((now.getTime() - then.getTime()) / (24 * 60 * 60 * 1000));
  if (diff <= 0) return "today";
  if (diff === 1) return "yesterday";
  if (diff < 7) return `${diff}d ago`;
  if (diff < 30) return `${Math.round(diff / 7)}w ago`;
  if (diff < 365) return `${Math.round(diff / 30)}mo ago`;
  return `${Math.round(diff / 365)}y ago`;
}
