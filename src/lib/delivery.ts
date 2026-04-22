export type DeliveryType = "repo" | "hosted" | "download";

export type DeliveryInfo = {
  type: DeliveryType;
  label: string;
  summary: string;
  items: string[];
  afterPurchase: string;
};

const REPO: Omit<DeliveryInfo, "items" | "summary"> = {
  type: "repo",
  label: "GitHub repo + ZIP",
  afterPurchase:
    "Right after checkout, you'll get an invite to a private GitHub repo plus a direct ZIP download link in your order email. MIT license — yours to modify, deploy, and ship.",
};

const HOSTED: Omit<DeliveryInfo, "items" | "summary"> = {
  type: "hosted",
  label: "Hosted on Startoor",
  afterPurchase:
    "You'll use it right here on startoor.vercel.app with your email. Your data stays in our database and is exportable at any time. No install, no deploy.",
};

const DOWNLOAD: Omit<DeliveryInfo, "items" | "summary"> = {
  type: "download",
  label: "CSV + Notion + PDF",
  afterPurchase:
    "Right after checkout, you'll get a download link in your order email with all files. Import to Notion, Airtable, or your tool of choice. Yours forever.",
};

export const DELIVERY: Record<string, DeliveryInfo> = {
  // ─── Code-repo products ─────────────────────────────────────────────────
  "saas-dashboard-starter": {
    ...REPO,
    summary:
      "A ready-to-deploy Next.js 16 admin panel. You get the source — deploy to Vercel in minutes.",
    items: [
      "Private GitHub repo (Next.js 16 + Tailwind v4 + Drizzle + Neon)",
      "ZIP mirror for offline access",
      "MRR / users / billing / analytics / settings pre-wired",
      "Seed script with 80 realistic mock users",
      "MIT license · year of updates",
    ],
  },
  "nextjs-auth-starter": {
    ...REPO,
    summary:
      "Next.js 16 + NextAuth / Clerk / Supabase starter. Four provider variants wired, post-auth dashboard, ready to deploy.",
    items: [
      "Private GitHub repo with all four provider setups",
      "Sign-in, sign-up, magic-link, OAuth flows",
      "Post-auth dashboard + profile / teams / API keys / billing panes",
      "Environment templates for each provider",
      "MIT license · year of updates",
    ],
  },
  "newsletter-starter": {
    ...REPO,
    summary:
      "A complete newsletter site in a repo. Swap the content, deploy in a weekend.",
    items: [
      "Private GitHub repo (Next.js 16 + Markdown)",
      "Landing · archive · issue reader · subscribe · about",
      "Custom markdown renderer with drop-caps",
      "24 real sample issues to study structure",
      "MIT license · year of updates",
    ],
  },
  "landing-page-templates": {
    ...REPO,
    summary:
      "10 production-ready landing pages in one repo. Pick one, swap copy, ship.",
    items: [
      "Private GitHub repo with 10 complete templates",
      "Each template is a self-contained page component",
      "SaaS · DTC · cohort · newsletter · agency · local · fitness · B2B · waitlist · jobs",
      "Copy the hero JSX for any template directly from the gallery",
      "MIT license · year of updates",
    ],
  },
  "chatbot-ui-kit": {
    ...REPO,
    summary:
      "Chat interface components — five distinct themes. BYO model provider.",
    items: [
      "Private GitHub repo with all 5 themes as components",
      "Editorial · Terminal · Soft · Classic · Minimalist",
      "Mock streaming harness + message-type gallery",
      "Copy-as-JSX / copy-as-HTML exporters",
      "MIT license · year of updates",
    ],
  },
  "api-playground": {
    ...REPO,
    summary:
      "A Postman-style REST playground as a self-contained Next.js component.",
    items: [
      "Private GitHub repo (Next.js 16 + TypeScript)",
      "Collections sidebar · request editor · response pane · environments",
      "cURL + fetch snippet export",
      "Seed data with permissive public APIs",
      "MIT license · year of updates",
    ],
  },
  "campaign-dashboard": {
    ...REPO,
    summary:
      "Marketing ops dashboard as source code. Plug in your real data feeds.",
    items: [
      "Private GitHub repo (Next.js 16 + TypeScript)",
      "Hand-rolled SVG charts — no chart-lib dependency",
      "Pacing strip · anomaly detection · campaigns table",
      "Deterministic mock-data generator you can replace with real feeds",
      "MIT license · year of updates",
    ],
  },
  "portfolio-builder": {
    ...REPO,
    summary:
      "A self-hostable portfolio builder. Three layouts, public pages, full source.",
    items: [
      "Private GitHub repo (Next.js 16 + Neon + Drizzle)",
      "Grid · Story · Editorial templates",
      "Email-gated editor + public page at /portfolio/[slug]",
      "Drop-in schema migration + seed script",
      "MIT license · year of updates",
    ],
  },

  // ─── Hosted products (used on Startoor, data in our DB) ─────────────────
  "invoice-maker": {
    ...HOSTED,
    summary:
      "Use the editor right here on Startoor. Your invoices save locally in your browser.",
    items: [
      "Instant access on startoor.vercel.app",
      "Browser-print to PDF · no watermark",
      "Autosave to localStorage — privacy-first",
      "Multi-currency, tax + discount, accent color",
      "Year of tool updates included",
    ],
  },
  "link-in-bio-maker": {
    ...HOSTED,
    summary:
      "Build and host your bio page on Startoor. Shareable URL included.",
    items: [
      "Email-gated editor on startoor.vercel.app",
      "Public page at startoor.vercel.app/bio/your-handle",
      "Four templates + full style controls",
      "Your data stays on our Neon Postgres · exportable any time",
      "Year of tool updates included",
    ],
  },
  "client-tracker": {
    ...HOSTED,
    summary:
      "Use the CRM right here on Startoor. Your client list and touchpoints live in our DB.",
    items: [
      "Email-gated access on startoor.vercel.app",
      "Unlimited clients · touchpoints · value tracking",
      "At-risk detection + due-this-week filters",
      "CSV export of your data any time",
      "Year of tool updates included",
    ],
  },
  "seo-roi-calculator": {
    ...HOSTED,
    summary:
      "Use the calculator right here. Every input autosaves and the shareable link lets clients see your scenario.",
    items: [
      "Instant access on startoor.vercel.app",
      "Autosave to localStorage",
      "Shareable URL encodes your scenario",
      "Print-to-PDF for client-ready one-pagers",
      "Year of tool updates included",
    ],
  },

  // ─── Static download products ────────────────────────────────────────────
  "hook-library": {
    ...DOWNLOAD,
    label: "CSV + Notion database",
    summary:
      "Download 700 annotated hooks. Import to Notion, Airtable, or paste into your tool of choice.",
    items: [
      "hooks.csv · 700 rows · platform / pattern / length / annotation",
      "Notion database template with pre-built views",
      "JSON export for developers",
      "Filter and swipe mode on Startoor while you pick",
      "Free · yours forever",
    ],
  },
  "content-calendar-kit": {
    ...DOWNLOAD,
    label: "Notion template + CSV + iCal",
    summary:
      "400 post ideas and a 90-day calendar template. Import to Notion or your calendar app.",
    items: [
      "ideas.csv · 400 ideas · platform / pillar / format / difficulty",
      "Notion calendar + idea-library template",
      "iCal feed for macOS / Google / Outlook calendars",
      "Browse + drag-to-schedule on Startoor while you plan",
      "Year of content updates included",
    ],
  },
  "ad-copy-swipe-file": {
    ...DOWNLOAD,
    label: "CSV + PDF + Notion",
    summary:
      "500 annotated ads across 7 platforms. PDF swipe-file for offline study.",
    items: [
      "ads.csv · 500 rows · platform / vertical / pattern / annotation",
      "Print-ready PDF swipe file — one ad per page",
      "Notion database with filter views",
      "Filter + favorites + detail view on Startoor",
      "Quarterly content refresh included",
    ],
  },
};

export function getDelivery(slug: string): DeliveryInfo | null {
  return DELIVERY[slug] ?? null;
}

export function deliveryBadgeLabel(type: DeliveryType): string {
  switch (type) {
    case "repo":
      return "GitHub repo";
    case "hosted":
      return "Hosted on Startoor";
    case "download":
      return "Digital download";
  }
}
