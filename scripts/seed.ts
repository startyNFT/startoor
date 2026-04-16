import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { db } from "../src/lib/db";
import {
  categories,
  makers,
  products,
  reviews,
} from "../src/lib/schema";

async function reset() {
  await db.delete(reviews);
  await db.delete(products);
  await db.delete(makers);
  await db.delete(categories);
  console.log("  Cleared existing catalog");
}

async function seedCategories() {
  const rows = await db
    .insert(categories)
    .values([
      {
        slug: "starter-kits",
        name: "Starter Kits",
        description:
          "Opinionated starting points for new projects — auth, billing, UI wired from day one.",
        icon: "package",
        sortOrder: 1,
      },
      {
        slug: "content-tools",
        name: "Content Tools",
        description:
          "Calendars, swipe files, and hook libraries for shipping without staring at a blank page.",
        icon: "pen",
        sortOrder: 2,
      },
      {
        slug: "creator-tools",
        name: "Creator Tools",
        description:
          "Portfolio pages, link hubs, and landing page templates for people who make things.",
        icon: "spark",
        sortOrder: 3,
      },
      {
        slug: "productivity",
        name: "Productivity",
        description: "Daily work tools built for solo founders and small teams.",
        icon: "clock",
        sortOrder: 4,
      },
      {
        slug: "developer-tools",
        name: "Developer Tools",
        description:
          "Calculators, explorers, and utilities for the people who ship code.",
        icon: "terminal",
        sortOrder: 5,
      },
      {
        slug: "marketing",
        name: "Marketing",
        description:
          "Ad swipe files, campaign dashboards, and audience tools for indie marketing teams.",
        icon: "megaphone",
        sortOrder: 6,
      },
    ])
    .returning();
  console.log(`  Inserted ${rows.length} categories`);
  return Object.fromEntries(rows.map((r) => [r.slug, r]));
}

async function seedMakers() {
  const rows = await db
    .insert(makers)
    .values([
      {
        slug: "mina-kwon",
        displayName: "Mina Kwon",
        bio: "Former design systems lead turned indie builder. I ship tools I wish existed. Currently obsessed with streaming UI.",
        website: "https://minakwon.studio",
        twitter: "@minakwon",
        avatarUrl:
          "https://api.dicebear.com/9.x/notionists/svg?seed=mina&backgroundColor=e8c77f",
        location: "Toronto, Canada",
        verified: true,
      },
      {
        slug: "diego-alvarez",
        displayName: "Diego Álvarez",
        bio: "Backend engineer who got tired of rebuilding dashboards every quarter. I make production-ready starters so you don't have to.",
        website: "https://diego.build",
        twitter: "@diegobuilds",
        avatarUrl:
          "https://api.dicebear.com/9.x/notionists/svg?seed=diego&backgroundColor=9db89f",
        location: "Medellín, Colombia",
        verified: true,
      },
      {
        slug: "sora-tanaka",
        displayName: "Sora Tanaka",
        bio: "Writer-engineer. I build tools for words. Published two novels before switching to product work.",
        website: "https://sora.jp",
        twitter: "@sorawrites",
        avatarUrl:
          "https://api.dicebear.com/9.x/notionists/svg?seed=sora&backgroundColor=d47963",
        location: "Kyoto, Japan",
        verified: true,
      },
      {
        slug: "robin-chen",
        displayName: "Robin Chen",
        bio: "Interface designer focused on creative tooling. Previously at Framer, now solo.",
        website: "https://robinchen.design",
        twitter: "@robinchen",
        avatarUrl:
          "https://api.dicebear.com/9.x/notionists/svg?seed=robin&backgroundColor=3d6b53",
        location: "Taipei, Taiwan",
      },
      {
        slug: "luca-romano",
        displayName: "Luca Romano",
        bio: "Freelancer since 2018. Everything I sell, I use on my own clients first. Invoice Maker was born out of frustration.",
        website: "https://luca.studio",
        twitter: "@lucabuilds",
        avatarUrl:
          "https://api.dicebear.com/9.x/notionists/svg?seed=luca&backgroundColor=c85a3f",
        location: "Milan, Italy",
        verified: true,
      },
      {
        slug: "naima-haidari",
        displayName: "Naima Haidari",
        bio: "Growth marketer for 8 years, builder for 2. I turn the spreadsheets marketers keep passing around into real products.",
        website: "https://naima.hq",
        twitter: "@naimaghq",
        avatarUrl:
          "https://api.dicebear.com/9.x/notionists/svg?seed=naima&backgroundColor=b8b3a7",
        location: "Berlin, Germany",
      },
      {
        slug: "priya-deshpande",
        displayName: "Priya Deshpande",
        bio: "Full-stack engineer, ex-Razorpay. I ship boilerplates that don't need to be rewritten on day 30.",
        website: "https://priya.dev",
        twitter: "@priyadesh",
        avatarUrl:
          "https://api.dicebear.com/9.x/notionists/svg?seed=priya&backgroundColor=1f3a2f",
        location: "Bangalore, India",
        verified: true,
      },
      {
        slug: "emmi-saarinen",
        displayName: "Emmi Saarinen",
        bio: "Designer/developer. I think link-in-bios should be beautiful. Running Kit Labs out of a cabin in Finland.",
        website: "https://emmi.design",
        twitter: "@emmisaarinen",
        avatarUrl:
          "https://api.dicebear.com/9.x/notionists/svg?seed=emmi&backgroundColor=e8c77f",
        location: "Helsinki, Finland",
      },
    ])
    .returning();
  console.log(`  Inserted ${rows.length} makers`);
  return Object.fromEntries(rows.map((r) => [r.slug, r]));
}

function previewImages(seed: string): string[] {
  return [
    `https://picsum.photos/seed/${seed}-1/1400/900`,
    `https://picsum.photos/seed/${seed}-2/1400/900`,
    `https://picsum.photos/seed/${seed}-3/1400/900`,
  ];
}

async function seedProducts(
  cats: Record<string, { id: string }>,
  mks: Record<string, { id: string }>,
) {
  const rows = await db
    .insert(products)
    .values([
      // Starter Kits
      {
        slug: "chatbot-ui-kit",
        title: "Chatbot UI Kit",
        tagline: "A production chat interface you drop into any stack. Bring your own model.",
        description:
          "Beautiful, accessible chat UI — streaming, citations, composer with attachments, history pane, typing indicators. No vendor lock-in: point it at OpenAI, Anthropic, your own backend, or a local model. We make the interface. You bring the model.",
        longDescription:
          "Built after shipping chat surfaces at three Series B startups. This is the distilled, opinionated interface — keyboard-first, accessibility-complete, theme-tokenized. Works as a drop-in component, a full-page /chat route, or an embedded widget. Includes a thin admin dashboard (optional) for reviewing conversations from your own DB.",
        priceCents: 6900,
        makerId: mks["mina-kwon"].id,
        categoryId: cats["starter-kits"].id,
        coverImage: `https://picsum.photos/seed/chatbot-ui-kit-cover/1600/1000`,
        previewImages: previewImages("chatbot-ui-kit"),
        features: [
          "Drop-in React component + full page route + embeddable widget",
          "Streaming-ready rendering (ReadableStream or SSE)",
          "Message threading, citations, composer attachments",
          "Keyboard-first navigation (⌘K for new chat, arrow keys to scroll threads)",
          "Dark mode, token-themable",
          "Works with any provider — no API calls ship in the code",
          "Admin dashboard for reviewing your own conversation logs (optional)",
        ],
        demoOutputs: [
          {
            title: "What ships in the box",
            content:
              "· <Chat /> React component\n· /chat full-page route\n· <ChatWidget /> embeddable\n· ThreadList, MessageBubble, Composer subcomponents\n· Streaming renderer (SSE + ReadableStream)\n· Admin console for reviewing conversations\n· Dark/light themes, 8 color presets",
          },
          {
            title: "What does not ship",
            content:
              "· No API calls to any provider\n· No API keys to manage\n· No vendor SDKs baked in\n· You wire it to whatever backend you want — OpenAI, Anthropic, Ollama, your own LLM, or a retrieval system",
          },
        ],
        tags: ["chatbot", "ui-kit", "react", "nextjs", "typescript"],
        status: "published",
        featured: true,
      },
      {
        slug: "saas-dashboard-starter",
        title: "SaaS Dashboard Starter",
        tagline: "Auth, billing, admin, and analytics — wired on day one.",
        description:
          "Stop rebuilding the same 40 hours of setup every time you start a SaaS. This starter ships auth, Stripe subscriptions, a team/billing admin, user analytics, and a working onboarding flow.",
        longDescription:
          "I built three SaaS products in a year and kept reaching for the same starting blocks. So I turned them into one kit. Opinionated choices: Next.js App Router, Stripe subscriptions, Auth.js with magic link, Drizzle + Neon, Tremor charts. Skip the setup, start shipping features.",
        priceCents: 8900,
        makerId: mks["diego-alvarez"].id,
        categoryId: cats["starter-kits"].id,
        coverImage: `https://picsum.photos/seed/saas-dashboard-starter-cover/1600/1000`,
        previewImages: previewImages("saas-dashboard-starter"),
        features: [
          "Stripe subscriptions with upgrade/downgrade flows",
          "Multi-tenant teams with role-based access",
          "User analytics with Tremor charts",
          "Fully wired onboarding flow with progress tracking",
          "Magic link + OAuth (Google, GitHub)",
          "Email templates for welcome/invoice/password-reset",
        ],
        tags: ["saas", "stripe", "dashboard", "teams", "nextjs"],
        status: "published",
        featured: true,
      },
      {
        slug: "nextjs-auth-starter",
        title: "Next.js + Auth Starter",
        tagline: "A minimal auth starter that just works.",
        description:
          "Magic link sign-in, user profiles, teams, and organization switching — nothing else. Under 200 files. Under 30 minutes from clone to deploy.",
        longDescription:
          "The opposite of bloated boilerplate. Everything you need for a real app's auth layer, nothing you don't. Magic link via Resend, database sessions, Drizzle schema, typed server actions, production-ready email templates.",
        priceCents: 4900,
        makerId: mks["priya-deshpande"].id,
        categoryId: cats["starter-kits"].id,
        coverImage: `https://picsum.photos/seed/nextjs-auth-starter-cover/1600/1000`,
        previewImages: previewImages("nextjs-auth-starter"),
        features: [
          "Magic link via Resend",
          "Database sessions with Drizzle + Neon/Postgres",
          "Teams, invites, and org switching",
          "Typed server actions with zod validation",
          "Deployed to Vercel in one click",
        ],
        tags: ["auth", "nextjs", "minimal", "starter"],
        status: "published",
      },

      // Content Tools
      {
        slug: "content-calendar-kit",
        title: "Content Calendar Kit",
        tagline: "A 90-day editorial calendar and 400 post ideas, organized.",
        description:
          "A Notion-compatible content calendar system, 400 evergreen post ideas across 12 niches, and a weekly rhythm template that I used to publish consistently for 18 months without burning out.",
        longDescription:
          "Not AI-generated filler. Each of the 400 ideas is tagged by niche, format, and effort. The calendar includes a batching protocol, a repurposing workflow, and a tracking dashboard you can run in Notion or Google Sheets — your pick. Comes with a week-one walkthrough so you start publishing the day you buy it.",
        priceCents: 3900,
        makerId: mks["mina-kwon"].id,
        categoryId: cats["content-tools"].id,
        coverImage: `https://picsum.photos/seed/content-calendar-kit-cover/1600/1000`,
        previewImages: previewImages("content-calendar-kit"),
        features: [
          "400 post ideas across 12 niches, tagged by format + effort",
          "90-day editorial calendar template (Notion + Sheets versions)",
          "Batching + repurposing workflow",
          "Tracking dashboard (views, saves, conversions)",
          "Week-one walkthrough video",
        ],
        demoOutputs: [
          {
            title: "Sample idea cluster (niche: 'founder writing')",
            content:
              "· 'The bad call that saved us $200k' → long-form essay\n· 'Three signs your pricing is too low' → short thread\n· 'An email I almost didn't send' → lightweight post\n· 'The interview question I now lead with' → newsletter piece\n· 'How we killed our biggest feature' → case-study essay",
          },
          {
            title: "What's in the calendar",
            content:
              "Week 1: One long-form piece + two short posts + one repurpose\nWeek 2: Two medium pieces + one thread + one reshare\nWeek 3: One deep dive + four shorts\nWeek 4: Rest/review/plan — on purpose",
          },
        ],
        tags: ["content", "calendar", "notion", "sheets", "writing"],
        status: "published",
        featured: true,
      },
      {
        slug: "hook-library",
        title: "Hook Library",
        tagline: "700 opening lines that actually land. Searchable, swipable, yours.",
        description:
          "A hand-curated, tagged library of 700 hooks that outperform the bland 'n tips for…' format. Sortable by tone, platform, emotion, and angle. Use as a swipe file, export to your own tool, or paste into your content workflow.",
        longDescription:
          "Built by a writer who grew a LinkedIn following to 40k in 18 months. Each hook is tagged by what makes it work — specificity, contrarian framing, tension, named stakes. Export the entire thing to Notion, Airtable, or CSV. No subscription, no AI — just the accumulated shape of what works.",
        priceCents: 0,
        makerId: mks["sora-tanaka"].id,
        categoryId: cats["content-tools"].id,
        coverImage: `https://picsum.photos/seed/hook-library-cover/1600/1000`,
        previewImages: previewImages("hook-library"),
        features: [
          "700 hooks across 4 platforms (X, LinkedIn, Threads, newsletter)",
          "Tagged by tone, emotion, angle, and what-makes-it-work",
          "Searchable UI included + exportable as CSV / Notion / Airtable",
          "Author's notes on structural patterns",
          "Monthly additions for the first year",
        ],
        demoOutputs: [
          {
            title: "Sample hooks (angle: 'counter-consensus')",
            content:
              "· Most founders optimize the wrong thing when raising a small round.\n· Every 'strategy deck' I've seen shipped this year had three things in common.\n· The pitch deck I actually raised on was 7 slides. The one I started with was 24.\n· 'No' usually means 'not yet'. Here's how to tell the difference.\n· We shipped the bad version on purpose. Here's why it worked.",
          },
        ],
        tags: ["content", "social", "swipe-file", "writing"],
        status: "published",
      },
      {
        slug: "newsletter-starter",
        title: "Newsletter Starter",
        tagline: "Substack without the lock-in. Own your list, own the look.",
        description:
          "A beautiful, self-hosted newsletter system. Paid subscriptions via Stripe. Custom domain from day one. Import your existing list with one CSV. Your email, your audience, your design.",
        longDescription:
          "Substack is great until you have 10k subscribers and realize you don't own the relationship. This is the alternative — your list, your domain, your design. Works with any email provider, looks gorgeous by default.",
        priceCents: 5900,
        makerId: mks["luca-romano"].id,
        categoryId: cats["content-tools"].id,
        coverImage: `https://picsum.photos/seed/newsletter-starter-cover/1600/1000`,
        previewImages: previewImages("newsletter-starter"),
        features: [
          "Custom domain + Stripe subscriptions",
          "CSV import from Substack/Mailchimp/Beehiiv",
          "Public archive with SEO-ready posts",
          "Member-only comments",
          "Editorial templates for send-out emails",
        ],
        tags: ["newsletter", "substack-alt", "email", "writing"],
        status: "published",
      },

      // Creator Tools
      {
        slug: "landing-page-templates",
        title: "Landing Page Templates",
        tagline: "Ten production-ready Next.js landing page templates. Ship in an afternoon.",
        description:
          "Ten hand-designed, fully-coded landing page templates — not wireframes, shippable code. Next.js + Tailwind + TypeScript. Copy is swap-via-single-file. Dark mode built in. SEO metadata and OG image ready.",
        longDescription:
          "Every template was born from a real project I designed for a client. You get the source, the assets, the component library, and a Figma file if you want to redesign. No subscription. Updates for a year. Use on as many projects as you want.",
        priceCents: 4900,
        makerId: mks["sora-tanaka"].id,
        categoryId: cats["creator-tools"].id,
        coverImage: `https://picsum.photos/seed/landing-page-templates-cover/1600/1000`,
        previewImages: previewImages("landing-page-templates"),
        features: [
          "10 distinct templates (SaaS, indie app, agency, portfolio, marketplace, newsletter, book, course, event, open-source)",
          "Next.js + Tailwind + TypeScript",
          "Copy swap via single `content.ts` file",
          "Dark mode, mobile-first, SEO metadata",
          "Figma source included",
          "Updates for 12 months",
        ],
        demoOutputs: [
          {
            title: "Template examples (by category)",
            content:
              "· SaaS Pro — 5 variants · tiered pricing block · trust bar · testimonial carousel\n· Indie App — 4 variants · fair-pricing block · single testimonial · app store badges\n· Agency — 3 variants · case-study layout · team grid · project gallery\n· Marketplace — 4 variants · category grid · featured shelf · maker spotlight",
          },
        ],
        tags: ["landing-page", "templates", "nextjs", "tailwind"],
        status: "published",
        featured: true,
      },
      {
        slug: "link-in-bio-maker",
        title: "Link-in-Bio Maker",
        tagline: "Link pages that don't look like everyone else's.",
        description:
          "Four hand-designed link-page templates — Classic, Night, Editorial, Sunset. Custom domain support. Per-link analytics. Your page. Your look.",
        longDescription:
          "Linktree looks like Linktree. That's a problem when you're trying to build a brand. These four templates are distinctive, fast, and fully yours. Your link-in-bio should be a billboard, not a placeholder.",
        priceCents: 1900,
        makerId: mks["emmi-saarinen"].id,
        categoryId: cats["creator-tools"].id,
        coverImage: `https://picsum.photos/seed/link-in-bio-maker-cover/1600/1000`,
        previewImages: previewImages("link-in-bio-maker"),
        features: [
          "4 hand-designed templates (Classic / Night / Editorial / Sunset)",
          "Custom domain + SSL",
          "Per-link click analytics",
          "Drag-to-reorder editor",
          "Schedule links to appear/disappear",
        ],
        tags: ["link-in-bio", "creators", "minimal"],
        status: "published",
      },
      {
        slug: "portfolio-builder",
        title: "Portfolio Builder",
        tagline: "A portfolio that makes hiring managers pause.",
        description:
          "Three layouts: grid, story, editorial. Full project case studies with before/after, metrics, and process. Designed for people who want to get hired for quality work, not just work.",
        longDescription:
          "Hiring managers spend 8 seconds on a portfolio. This one makes them spend 80. Built after reviewing 200+ portfolios and realizing the ones that worked all had the same three things: a point of view, a proof of craft, and a clear story of how you think.",
        priceCents: 6900,
        makerId: mks["robin-chen"].id,
        categoryId: cats["creator-tools"].id,
        coverImage: `https://picsum.photos/seed/portfolio-builder-cover/1600/1000`,
        previewImages: previewImages("portfolio-builder"),
        features: [
          "Three portfolio layouts: grid, story, editorial",
          "Full case study templates with metrics",
          "Password-protected private projects",
          "Custom domain + SEO metadata",
          "Export to static HTML (no lock-in)",
        ],
        tags: ["portfolio", "design", "hiring"],
        status: "published",
      },

      // Productivity
      {
        slug: "invoice-maker",
        title: "Invoice Maker",
        tagline: "Freelance invoicing that doesn't suck.",
        description:
          "Send a beautifully typeset invoice in 30 seconds. Line items, tax, discounts, notes — all in one screen with a live preview. Export as PDF and send. Zero subscription. Zero accounts.",
        longDescription:
          "I built this for me after watching friends spend $240/year on QuickBooks just to send 6 invoices. This is the 6-invoice version. Fast, clean, and it doesn't try to sell you bookkeeping you don't need.",
        priceCents: 2900,
        makerId: mks["luca-romano"].id,
        categoryId: cats["productivity"].id,
        coverImage: `https://picsum.photos/seed/invoice-maker-cover/1600/1000`,
        previewImages: previewImages("invoice-maker"),
        features: [
          "Live preview as you type",
          "Line items with quantity, unit, rate",
          "Tax and discount handling",
          "Auto-calculated totals, tabular figures",
          "One-click PDF download",
          "Works offline, data never leaves your browser",
        ],
        tags: ["invoicing", "freelance", "productivity"],
        status: "published",
        featured: true,
      },
      {
        slug: "client-tracker",
        title: "Client Tracker",
        tagline: "A CRM that fits on a single screen.",
        description:
          "Every client, every project, every next action — one screen. Built for freelancers and solo consultants who got burned out on HubSpot's 14 dashboards.",
        longDescription:
          "I went from spreadsheet to Airtable to Notion to HubSpot and back. They were all either too little or too much. This is the shape in the middle. One table, clean columns, keyboard-first, and your data stays yours.",
        priceCents: 3900,
        makerId: mks["emmi-saarinen"].id,
        categoryId: cats["productivity"].id,
        coverImage: `https://picsum.photos/seed/client-tracker-cover/1600/1000`,
        previewImages: previewImages("client-tracker"),
        features: [
          "Single-screen CRM view",
          "Keyboard-first navigation (⌘K, tab, enter)",
          "Inline editing — click a cell, type, done",
          "Status pills with color tints",
          "Next-action and due-date columns",
          "Quick-add row via keyboard shortcut",
        ],
        tags: ["crm", "freelance", "productivity"],
        status: "published",
      },

      // Developer Tools
      {
        slug: "seo-roi-calculator",
        title: "SEO ROI Calculator",
        tagline: "The math on whether your content strategy is working.",
        description:
          "Input traffic, conversion rate, LTV. Output honest-to-god ROI on your SEO investment. Bring it to your next marketing review with confidence.",
        longDescription:
          "Built after watching too many marketers pitch SEO as 'free' and then spend $80k/year on it. This is the calculator that tells you whether your content flywheel is actually compounding — or whether you're just paying for vanity traffic.",
        priceCents: 1900,
        makerId: mks["naima-haidari"].id,
        categoryId: cats["developer-tools"].id,
        coverImage: `https://picsum.photos/seed/seo-roi-calculator-cover/1600/1000`,
        previewImages: previewImages("seo-roi-calculator"),
        features: [
          "Traffic + conversion + LTV inputs",
          "Monthly and annual ROI curves",
          "Breakeven timeline for content investment",
          "Embeddable in Notion or Google Docs",
          "Export to PDF for stakeholder reviews",
        ],
        tags: ["seo", "calculator", "marketing", "analytics"],
        status: "published",
      },
      {
        slug: "api-playground",
        title: "API Playground",
        tagline: "Postman, minus the account creation.",
        description:
          "A self-hosted REST + GraphQL playground. Keyboard-first. Workspace per project. Share collections via a single URL. No sign-in, no telemetry, just the tool.",
        longDescription:
          "I moved off Postman when they started gating everything behind an account. This is what I built to replace it — keyboard-driven, local-first, and good enough for 95% of what I used Postman for.",
        priceCents: 4900,
        makerId: mks["priya-deshpande"].id,
        categoryId: cats["developer-tools"].id,
        coverImage: `https://picsum.photos/seed/api-playground-cover/1600/1000`,
        previewImages: previewImages("api-playground"),
        features: [
          "REST and GraphQL support",
          "Keyboard-first navigation (command palette)",
          "Local-first, no account required",
          "Share collections via single URL",
          "Self-host in under 5 minutes",
        ],
        tags: ["api", "developer", "rest", "graphql"],
        status: "published",
      },

      // Marketing
      {
        slug: "ad-copy-swipe-file",
        title: "Ad Copy Swipe File",
        tagline: "500 ads across Meta, Google, LinkedIn, TikTok — with the anatomy of each.",
        description:
          "A hand-curated collection of the most effective ads from 2024–2026, broken down by hook, structure, and performance signals. Built by a growth marketer who reverse-engineered hundreds of high-spending campaigns so you don't have to.",
        longDescription:
          "Not scraped. Not automated. Each ad is captured, annotated, and tagged — what angle the hook is using, what body structure, what makes it scroll-stopping. Browse by vertical (SaaS, DTC, B2B, local), by platform, or by sentiment. Export the whole library to your own swipe tool.",
        priceCents: 3500,
        makerId: mks["naima-haidari"].id,
        categoryId: cats["marketing"].id,
        coverImage: `https://picsum.photos/seed/ad-copy-swipe-file-cover/1600/1000`,
        previewImages: previewImages("ad-copy-swipe-file"),
        features: [
          "500 ads across 4 platforms and 6 verticals",
          "Each ad annotated — hook type, body structure, stop-signal",
          "Searchable UI + exportable as CSV / Notion",
          "Updated quarterly for 12 months",
          "PDF field-guide on hook patterns included",
        ],
        demoOutputs: [
          {
            title: "Sample entry (LinkedIn, SaaS, B2B)",
            content:
              "Finance teams are spending 11 hours per week chasing receipts.\nWe built the tool that ends that.\nIntegrates with your existing stack in under 30 minutes. 400+ CFOs have switched.\n\n→ Annotated: specificity in hook (11 hours, 400 CFOs); tension in body (chasing receipts); low-friction close (under 30 minutes)",
          },
          {
            title: "Sample entry (TikTok, same product)",
            content:
              "POV: your CFO hasn't touched a receipt in 4 months. This is how. ↓ (seriously, show them this)\n\n→ Annotated: native POV format; implied outcome; soft CTA with permission frame",
          },
        ],
        tags: ["ads", "marketing", "swipe-file", "copywriting"],
        status: "published",
      },
      {
        slug: "campaign-dashboard",
        title: "Campaign Dashboard",
        tagline: "One view for every paid channel you run.",
        description:
          "Pulls data from Meta, Google, LinkedIn, TikTok, and Reddit into a single dashboard. Cost per result, ROAS, spend pacing, and anomaly alerts. Built for teams of one.",
        longDescription:
          "Every paid channel has its own dashboard. Running 4+ means tab-surfing all day. This consolidates them into one view with the 6 numbers you actually care about — and flags anomalies before your CFO does.",
        priceCents: 9900,
        makerId: mks["diego-alvarez"].id,
        categoryId: cats["marketing"].id,
        coverImage: `https://picsum.photos/seed/campaign-dashboard-cover/1600/1000`,
        previewImages: previewImages("campaign-dashboard"),
        features: [
          "Connects to Meta, Google, LinkedIn, TikTok, Reddit",
          "Unified cost-per-result and ROAS view",
          "Spend pacing with end-of-month projections",
          "Anomaly detection with Slack alerts",
          "Weekly auto-generated stakeholder reports",
        ],
        tags: ["marketing", "ads", "dashboard", "analytics"],
        status: "published",
        featured: true,
      },
    ])
    .returning();
  console.log(`  Inserted ${rows.length} products`);
  return rows;
}

async function seedReviews(productList: { id: string; slug: string }[]) {
  const reviewBank: Record<string, { name: string; rating: number; content: string }[]> = {
    "chatbot-ui-kit": [
      { name: "James Okafor", rating: 5, content: "Wired it to our own LLM in 3 hours. The streaming + citation combo is exactly what I wanted and hadn't figured out how to build." },
      { name: "Elena Ruiz", rating: 5, content: "The fact that it doesn't assume a provider is the killer feature. We swapped from OpenAI to Anthropic with no code change." },
      { name: "Marcus Thorne", rating: 4, content: "Rock solid. Docs could be more thorough but the code is clear enough to follow." },
    ],
    "saas-dashboard-starter": [
      { name: "Alex Rivera", rating: 5, content: "Stripe subscription setup alone saved me a week. The team invite flow is production-quality." },
      { name: "Samira Patel", rating: 5, content: "Finally a starter that doesn't feel like I need to rip out half the code on day one." },
      { name: "Dmitri Volkov", rating: 4, content: "Setup was smooth. The onboarding flow is a nice touch." },
      { name: "Luna Schulz", rating: 5, content: "Been using it for 3 months in production. Zero regrets." },
    ],
    "nextjs-auth-starter": [
      { name: "Zainab Hasan", rating: 5, content: "Minimal in the best way. I cloned, configured env vars, and deployed in 25 minutes." },
      { name: "Hiro Nakamura", rating: 4, content: "Exactly what I needed. No fluff." },
    ],
    "content-calendar-kit": [
      { name: "Isla McKenzie", rating: 5, content: "The batching workflow is the unlock. I publish 3x more content now and spend less time doing it." },
      { name: "Ryan Booth", rating: 5, content: "400 ideas tagged the way Mina tags them is worth the price on its own." },
      { name: "Clara Jeong", rating: 4, content: "The week-one walkthrough is a nice touch. Had me publishing on day two." },
    ],
    "hook-library": [
      { name: "Tomás Ferreira", rating: 5, content: "Sora's annotations on WHY each hook works are the real product. I've internalized the patterns." },
      { name: "Nadia Al-Fassi", rating: 5, content: "Export to Notion. Bulk apply tags. My own reference library is finally useful." },
      { name: "Priscilla Mendes", rating: 4, content: "700 hooks is borderline too many. But the search UI saves me." },
    ],
    "newsletter-starter": [
      { name: "Brendan Kim", rating: 5, content: "Migrated from Substack in a weekend. Own my list, own my brand. No regrets." },
      { name: "Fatima Zerhouni", rating: 5, content: "The editorial send template is the prettiest email I've ever sent." },
      { name: "Olivia Weiss", rating: 4, content: "Custom domain support was a game changer." },
    ],
    "landing-page-templates": [
      { name: "Priscilla Mendes", rating: 5, content: "The copy-swap file is brilliant. I shipped 3 client pages in a week." },
      { name: "Kenji Morrow", rating: 5, content: "Not marketing mockups. Actually production code. Big difference." },
      { name: "Anya Volkov", rating: 5, content: "Shipped 4 pages this month. Conversion is higher than my hand-written versions." },
      { name: "Mateo Silva", rating: 4, content: "Works best for B2B SaaS. Indie app templates are strong too." },
    ],
    "link-in-bio-maker": [
      { name: "Ines García", rating: 5, content: "Finally a link-in-bio that looks like I designed it myself." },
      { name: "Oscar Lindqvist", rating: 4, content: "The Editorial template is stunning." },
    ],
    "portfolio-builder": [
      { name: "Zoe Barrett", rating: 5, content: "Got three interviews from portfolios in a week. Worth every dollar." },
      { name: "Ravi Shankar", rating: 5, content: "The case study templates made me actually write up my work properly." },
      { name: "Marta Kowalski", rating: 4, content: "Beautiful out of the box." },
    ],
    "invoice-maker": [
      { name: "Tanner Blackwood", rating: 5, content: "I was paying $20/mo for software that did half of this. Switched and never looked back." },
      { name: "Keiko Sato", rating: 5, content: "The live preview as I type is the feature that sold me. Sending invoices is actually pleasant now." },
      { name: "Miguel Santos", rating: 4, content: "Clean, fast, does what it says." },
    ],
    "client-tracker": [
      { name: "Lara Meyer", rating: 5, content: "I came from Notion. This is everything I wanted Notion to be for client work." },
      { name: "Ollie Nguyen", rating: 4, content: "Simple and keyboard-driven. Exactly my pace." },
    ],
    "seo-roi-calculator": [
      { name: "Jordan Reyes", rating: 5, content: "Brought this to my last marketing review. The leadership team's reaction alone paid for it." },
      { name: "Vera Kostov", rating: 4, content: "Makes content investment decisions much less hand-wavy." },
    ],
    "api-playground": [
      { name: "Finn O'Donnell", rating: 5, content: "Moved off Postman. The keyboard palette is faster than anything I'd used." },
      { name: "Aasha Reddy", rating: 5, content: "Self-hosted in 4 minutes. Team's been on it for 2 months now." },
    ],
    "ad-copy-swipe-file": [
      { name: "Hector Palma", rating: 5, content: "The annotations on WHY each ad works are the unlock. I've stopped writing from scratch." },
      { name: "Sienna Beaumont", rating: 4, content: "Huge library, well-organized. Worth it for the TikTok section alone." },
    ],
    "campaign-dashboard": [
      { name: "Dominik Karadžić", rating: 5, content: "Running 5 channels. Went from 90 minutes of tab-surfing to one dashboard. Weekly auto-reports are gold." },
      { name: "Leila Abed", rating: 5, content: "The anomaly detection flagged a bid-strategy issue before my CFO noticed. Paid for itself that week." },
      { name: "Rafael Cardoso", rating: 4, content: "Setup took a bit. Worth it." },
    ],
  };

  const rows: (typeof reviews.$inferInsert)[] = [];
  for (const p of productList) {
    const bank = reviewBank[p.slug] || [];
    for (const r of bank) {
      rows.push({
        productId: p.id,
        reviewerName: r.name,
        rating: r.rating,
        content: r.content,
      });
    }
  }
  if (rows.length === 0) return;
  await db.insert(reviews).values(rows);
  console.log(`  Inserted ${rows.length} reviews`);
}

async function main() {
  console.log("Seeding Startoor catalog...");
  await reset();
  const cats = await seedCategories();
  const mks = await seedMakers();
  const products = await seedProducts(cats, mks);
  await seedReviews(products);
  console.log("✓ Done");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
