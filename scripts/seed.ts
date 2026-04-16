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
          "Write, generate, and ship content without staring at a blank page.",
        icon: "pen",
        sortOrder: 2,
      },
      {
        slug: "creator-tools",
        name: "Creator Tools",
        description:
          "Portfolio pages, link hubs, and landing pages for people who make things.",
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
          "Ad copy, campaign tracking, and audience tools for indie marketing teams.",
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
        bio: "Former design systems lead turned indie builder. I ship tools I wish existed. Currently obsessed with streaming AI UX.",
        website: "https://minakwon.studio",
        twitter: "@minakwon",
        avatarUrl: "https://api.dicebear.com/9.x/notionists/svg?seed=mina&backgroundColor=e8c77f",
        location: "Toronto, Canada",
        verified: true,
      },
      {
        slug: "diego-alvarez",
        displayName: "Diego Álvarez",
        bio: "Backend engineer who got tired of rebuilding dashboards every quarter. I make production-ready starters so you don't have to.",
        website: "https://diego.build",
        twitter: "@diegobuilds",
        avatarUrl: "https://api.dicebear.com/9.x/notionists/svg?seed=diego&backgroundColor=9db89f",
        location: "Medellín, Colombia",
        verified: true,
      },
      {
        slug: "sora-tanaka",
        displayName: "Sora Tanaka",
        bio: "Writer-engineer. I build tools for words. Published two novels before switching to AI UX.",
        website: "https://sora.jp",
        twitter: "@sorawrites",
        avatarUrl: "https://api.dicebear.com/9.x/notionists/svg?seed=sora&backgroundColor=d47963",
        location: "Kyoto, Japan",
        verified: true,
      },
      {
        slug: "robin-chen",
        displayName: "Robin Chen",
        bio: "Interface designer focused on creative tooling. Previously at Framer, now solo.",
        website: "https://robinchen.design",
        twitter: "@robinchen",
        avatarUrl: "https://api.dicebear.com/9.x/notionists/svg?seed=robin&backgroundColor=3d6b53",
        location: "Taipei, Taiwan",
      },
      {
        slug: "luca-romano",
        displayName: "Luca Romano",
        bio: "Freelancer since 2018. Everything I sell, I use on my own clients first. Invoice Maker was born out of frustration.",
        website: "https://luca.studio",
        twitter: "@lucabuilds",
        avatarUrl: "https://api.dicebear.com/9.x/notionists/svg?seed=luca&backgroundColor=c85a3f",
        location: "Milan, Italy",
        verified: true,
      },
      {
        slug: "naima-haidari",
        displayName: "Naima Haidari",
        bio: "Growth marketer for 8 years, builder for 2. I build the spreadsheets I wish marketers stopped passing around.",
        website: "https://naima.hq",
        twitter: "@naimaghq",
        avatarUrl: "https://api.dicebear.com/9.x/notionists/svg?seed=naima&backgroundColor=b8b3a7",
        location: "Berlin, Germany",
      },
      {
        slug: "priya-deshpande",
        displayName: "Priya Deshpande",
        bio: "Full-stack engineer, ex-Razorpay. I ship boilerplates that don't need to be rewritten on day 30.",
        website: "https://priya.dev",
        twitter: "@priyadesh",
        avatarUrl: "https://api.dicebear.com/9.x/notionists/svg?seed=priya&backgroundColor=1f3a2f&backgroundType=solid",
        location: "Bangalore, India",
        verified: true,
      },
      {
        slug: "emmi-saarinen",
        displayName: "Emmi Saarinen",
        bio: "Designer/developer. I think link-in-bios should be beautiful. Running Kit Labs out of a cabin in Finland.",
        website: "https://emmi.design",
        twitter: "@emmisaarinen",
        avatarUrl: "https://api.dicebear.com/9.x/notionists/svg?seed=emmi&backgroundColor=e8c77f",
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

async function seedProducts(cats: Record<string, { id: string }>, mks: Record<string, { id: string }>) {
  const rows = await db
    .insert(products)
    .values([
      // Starter Kits
      {
        slug: "ai-chatbot-kit",
        title: "AI Chatbot Kit",
        tagline: "Production-ready chatbot for your product. Stream, cite, remember.",
        description:
          "A batteries-included chatbot you can drop into any Next.js project. Streaming responses, persistent conversations, source citation, rate limiting, and dark mode out of the box.",
        longDescription:
          "Built after shipping three chatbots at Series B startups. This is the distilled, opinionated version — the things that always needed to be built from scratch. Works with OpenAI, Anthropic, or any OpenAI-compatible endpoint. Includes a working admin dashboard for reviewing conversations and tuning prompts.",
        priceCents: 6900,
        makerId: mks["mina-kwon"].id,
        categoryId: cats["starter-kits"].id,
        coverImage: `https://picsum.photos/seed/ai-chatbot-kit-cover/1600/1000`,
        previewImages: previewImages("ai-chatbot-kit"),
        features: [
          "Streaming responses with token-by-token rendering",
          "Conversation persistence with pgvector embeddings",
          "Source citation with inline footnotes",
          "Rate limiting per-user, per-IP, per-endpoint",
          "Admin dashboard for prompt tuning",
          "Works with OpenAI, Anthropic, or any OAI-compatible API",
        ],
        demoOutputs: [
          {
            title: "Sample conversation",
            content:
              "User: What's the return policy?\n\nAssistant: Our return policy is 30 days from delivery for unused items. Refunds are processed within 5 business days. [[source: policies/returns.md]]",
          },
          {
            title: "Citation rendering",
            content:
              "The population of Tokyo is approximately 13.9 million [[source: demographics-2025.md]]. This represents a slight decline from the 2020 peak of 14.1 million.",
          },
        ],
        tags: ["chatbot", "ai", "nextjs", "streaming", "typescript"],
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
        slug: "ai-content-generator",
        title: "AI Content Generator",
        tagline: "Blog posts, tweets, and emails in your voice.",
        description:
          "Train it on your existing writing. Get drafts back that sound like you — not like ChatGPT default. Works across blog posts, tweet threads, LinkedIn posts, and email newsletters.",
        longDescription:
          "The default ChatGPT voice is everywhere. This tool takes 10–20 samples of your existing writing and generates drafts in your style. Stop editing out em-dashes. Start shipping content.",
        priceCents: 3900,
        makerId: mks["mina-kwon"].id,
        categoryId: cats["content-tools"].id,
        coverImage: `https://picsum.photos/seed/ai-content-generator-cover/1600/1000`,
        previewImages: previewImages("ai-content-generator"),
        features: [
          "Voice training from 10–20 samples",
          "Blog post outlines + full drafts",
          "Tweet thread generator with hook variants",
          "LinkedIn post generator with tone controls",
          "Email subject + body with A/B variants",
        ],
        demoOutputs: [
          {
            title: "Sample tweet (tone: sharp/direct)",
            content:
              "Every \"strategy deck\" I've seen shipped this year had three things in common:\n\n1. A quote from someone who didn't write it\n2. A chart that doesn't survive a simple question\n3. No kill criteria\n\nLead with what would make you stop.",
          },
          {
            title: "Sample blog hook (tone: warm/editorial)",
            content:
              "The best piece of marketing advice I got this year came from a barista. She didn't call it marketing. She said: \"If you can't explain what's on the menu in one breath, it's too long.\" Three months later, I rewrote our whole product page around that rule.",
          },
          {
            title: "Sample email subject variants",
            content:
              "A. We redesigned onboarding (the results)\nB. Our activation rate doubled — here's what we changed\nC. The 3 clicks we removed from onboarding\nD. How we got users to \"aha\" 40% faster",
          },
        ],
        tags: ["content", "ai", "writing", "marketing"],
        status: "published",
        featured: true,
      },
      {
        slug: "viral-post-builder",
        title: "Viral Post Builder",
        tagline: "Hook-first posts for X and LinkedIn.",
        description:
          "Every post starts with a hook. This tool generates 20 hook variants, scores them against virality signals, and helps you rewrite the body to match. No shortcuts — just better iteration.",
        longDescription:
          "Built by a solo writer who grew a LinkedIn following to 40k in 18 months. The secret isn't AI writing the post for you. It's running 20 versions of the hook and picking the one that reads like you on your best day.",
        priceCents: 2900,
        makerId: mks["sora-tanaka"].id,
        categoryId: cats["content-tools"].id,
        coverImage: `https://picsum.photos/seed/viral-post-builder-cover/1600/1000`,
        previewImages: previewImages("viral-post-builder"),
        features: [
          "20 hook variants per topic",
          "Virality signal scoring (contrarian, specific, tension)",
          "Body rewriter that matches your hook's tone",
          "Platform-specific formatting (X, LinkedIn, Threads)",
          "Personal archive of what worked for you",
        ],
        demoOutputs: [
          {
            title: "Hook variants for topic 'raising a small round'",
            content:
              "1. I raised $800k in 11 days. Here's what I wish I knew at day 0.\n2. 47 investor meetings. 3 yeses. The pattern was unexpected.\n3. The pitch deck I actually raised on was 7 slides. (The one I started with was 24.)\n4. Most founders optimize the wrong thing when raising a small round.\n5. 'No' usually means 'not yet'. Here's how to tell the difference.",
          },
        ],
        tags: ["content", "social", "x", "linkedin", "writing"],
        status: "published",
      },
      {
        slug: "newsletter-starter",
        title: "Newsletter Starter",
        tagline: "Substack without the lock-in. Own your list, own the look.",
        description:
          "A beautiful, self-hosted newsletter system. Paid subscriptions via Stripe. Custom domain from day one. AI-generated post summaries as intro hooks. Import your existing list with one CSV.",
        longDescription:
          "Substack is great until you have 10k subscribers and realize you don't own the relationship. This is the alternative — your list, your domain, your design. Works with any email provider, looks gorgeous by default.",
        priceCents: 5900,
        makerId: mks["luca-romano"].id,
        categoryId: cats["content-tools"].id,
        coverImage: `https://picsum.photos/seed/newsletter-starter-cover/1600/1000`,
        previewImages: previewImages("newsletter-starter"),
        features: [
          "Custom domain + Stripe subscriptions",
          "AI-generated post summaries as intro hooks",
          "CSV import from Substack/Mailchimp/Beehiiv",
          "Public archive with SEO-ready posts",
          "Member-only comments",
        ],
        tags: ["newsletter", "substack-alt", "email", "writing"],
        status: "published",
      },

      // Creator Tools
      {
        slug: "landing-page-generator",
        title: "Landing Page Generator",
        tagline: "Describe your product. Get a full landing page.",
        description:
          "Feed it a paragraph about your product. Get back a fully designed landing page with hero, features, testimonials, and pricing — with copy that doesn't sound like AI wrote it.",
        longDescription:
          "The secret is the prompt structure, not the model. I spent six months tuning the prompts so the output actually reads like real landing pages. Each generation includes five variations of the hero section so you pick your favorite and ship.",
        priceCents: 4900,
        makerId: mks["sora-tanaka"].id,
        categoryId: cats["creator-tools"].id,
        coverImage: `https://picsum.photos/seed/landing-page-generator-cover/1600/1000`,
        previewImages: previewImages("landing-page-generator"),
        features: [
          "5 hero variants per generation",
          "Feature grid with iconography",
          "Testimonial layout options",
          "Pricing table variants (simple, tiered, usage)",
          "Export as Next.js components or static HTML",
        ],
        demoOutputs: [
          {
            title: "Hero variant 1",
            content:
              "The calendar for people who do deep work.\n\nOne-line agenda. Block scheduling by energy level. No notifications. Built for makers, writers, and the people who schedule against their own rhythms — not their boss's.",
          },
          {
            title: "Hero variant 2",
            content:
              "Your calendar doesn't know you.\n\nIt doesn't know when you write best, when you code best, or when you hit the wall at 3pm. This one does. Energy-aware scheduling, finally.",
          },
          {
            title: "Hero variant 3",
            content:
              "Meetings at 10am. Writing at 3pm. Never again.\n\nAn opinionated calendar that blocks your deep work before anyone else can. For people who ship things, not people who schedule things.",
          },
        ],
        tags: ["landing-page", "marketing", "copywriting", "generator"],
        status: "published",
        featured: true,
      },
      {
        slug: "link-in-bio-maker",
        title: "Link-in-Bio Maker",
        tagline: "Link pages that don't look like everyone else's.",
        description:
          "Ten hand-designed link-page templates. Custom domain support. Analytics that actually tell you something. Free tier for creators starting out.",
        longDescription:
          "Linktree looks like Linktree. That's a problem when you're trying to build a brand. I designed 10 distinctive templates, all customizable, all fast. Your link-in-bio should be a billboard, not a placeholder.",
        priceCents: 1900,
        makerId: mks["emmi-saarinen"].id,
        categoryId: cats["creator-tools"].id,
        coverImage: `https://picsum.photos/seed/link-in-bio-maker-cover/1600/1000`,
        previewImages: previewImages("link-in-bio-maker"),
        features: [
          "10 hand-designed templates",
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
          "Send an invoice in 30 seconds. Recurring invoices for retainer clients. Auto-reminders on overdue. Tax-ready exports for your accountant. Works with Stripe, Wise, and bank transfer.",
        longDescription:
          "I built this for me after watching friends spend $240/year on QuickBooks just to send 6 invoices. This is the 6-invoice version. Fast, clean, and it doesn't try to sell you bookkeeping you don't need.",
        priceCents: 2900,
        makerId: mks["luca-romano"].id,
        categoryId: cats["productivity"].id,
        coverImage: `https://picsum.photos/seed/invoice-maker-cover/1600/1000`,
        previewImages: previewImages("invoice-maker"),
        features: [
          "30-second invoice creation",
          "Recurring invoices for retainer clients",
          "Auto-reminders at 7, 14, and 30 days",
          "Tax-ready CSV export",
          "Works with Stripe, Wise, and bank transfer",
          "Custom branding on every invoice",
        ],
        tags: ["invoicing", "freelance", "productivity"],
        status: "published",
      },
      {
        slug: "client-tracker",
        title: "Client Tracker",
        tagline: "A CRM that fits on a single screen.",
        description:
          "Every client, every project, every next-action — one view. Built for freelancers and solo consultants who got burned out on HubSpot's 14 dashboards.",
        longDescription:
          "I went from spreadsheet to Airtable to Notion to HubSpot and back. They were all either too little or too much. This is the shape in the middle. One table, three columns, fast keyboard navigation, and calendar sync.",
        priceCents: 3900,
        makerId: mks["emmi-saarinen"].id,
        categoryId: cats["productivity"].id,
        coverImage: `https://picsum.photos/seed/client-tracker-cover/1600/1000`,
        previewImages: previewImages("client-tracker"),
        features: [
          "Single-screen CRM view",
          "Keyboard-first navigation",
          "Calendar sync for next-actions",
          "CSV import from any tool",
          "Lightweight tasks per client",
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
          "Built after watching too many marketers pitch SEO as \"free\" and then spend $80k/year on it. This is the calculator that tells you whether your content flywheel is actually compounding — or whether you're just paying for vanity traffic.",
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
        slug: "ad-copy-generator",
        title: "Ad Copy Generator",
        tagline: "Platform-specific ad variations, not generic slop.",
        description:
          "Generates 30 ad copy variants across Meta, Google, LinkedIn, and TikTok — each tuned to the platform's native voice and character limits. Built by a growth marketer who got tired of editing ChatGPT output.",
        longDescription:
          "Most 'ad copy AI' tools give you the same 5 variations across every platform. That's not how ads work. This tool knows that a LinkedIn ad shouldn't read like a TikTok one, and generates accordingly.",
        priceCents: 3500,
        makerId: mks["naima-haidari"].id,
        categoryId: cats["marketing"].id,
        coverImage: `https://picsum.photos/seed/ad-copy-generator-cover/1600/1000`,
        previewImages: previewImages("ad-copy-generator"),
        features: [
          "Platform-specific variants (Meta, Google, LinkedIn, TikTok)",
          "Character limit enforcement per platform",
          "A/B hypothesis generator for each variant",
          "Brand voice training from 5 example ads",
          "Export to CSV for your ads manager",
        ],
        demoOutputs: [
          {
            title: "LinkedIn variant for 'AI expense tool'",
            content:
              "Finance teams are spending 11 hours per week chasing receipts. We built the tool that ends that. Integrates with your existing stack in under 30 minutes. 400+ CFOs have switched.",
          },
          {
            title: "TikTok variant (same product)",
            content:
              "POV: your CFO hasn't touched a receipt in 4 months. This is how. ↓ (seriously, show them this)",
          },
        ],
        tags: ["ads", "marketing", "copywriting", "ai"],
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
    "ai-chatbot-kit": [
      { name: "James Okafor", rating: 5, content: "Shipped to production in 3 hours. The streaming + citation combo is exactly what I wanted and hadn't figured out how to wire." },
      { name: "Elena Ruiz", rating: 5, content: "The admin dashboard for tuning prompts is the feature I didn't know I needed. Worth the price on its own." },
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
    "ai-content-generator": [
      { name: "Isla McKenzie", rating: 5, content: "The voice training actually works. My readers can't tell which posts I wrote vs. drafted here." },
      { name: "Ryan Booth", rating: 5, content: "I ship 3x more content now. Been subscribed for 4 months." },
      { name: "Clara Jeong", rating: 4, content: "The blog outline feature alone is worth it." },
    ],
    "viral-post-builder": [
      { name: "Tomás Ferreira", rating: 5, content: "Sora's hook methodology is the real product. The tool just makes it fast." },
      { name: "Nadia Al-Fassi", rating: 4, content: "Works well for X. LinkedIn generation is hit or miss." },
    ],
    "newsletter-starter": [
      { name: "Brendan Kim", rating: 5, content: "Migrated from Substack in a weekend. Own my list, own my brand. No regrets." },
      { name: "Fatima Zerhouni", rating: 5, content: "The AI summary hook feature gets opens up 18% in my testing." },
      { name: "Olivia Weiss", rating: 4, content: "Custom domain support was a game changer." },
    ],
    "landing-page-generator": [
      { name: "Priscilla Mendes", rating: 5, content: "Five hero variants is the killer feature. I always ship the third one, but I need to see all five to know." },
      { name: "Kenji Morrow", rating: 5, content: "The output doesn't sound like AI. That alone sets this apart." },
      { name: "Anya Volkov", rating: 5, content: "Launched 4 pages this month. Conversion is higher than my hand-written versions." },
      { name: "Mateo Silva", rating: 4, content: "Works best for B2B SaaS. Consumer products need a bit more tuning." },
    ],
    "link-in-bio-maker": [
      { name: "Ines García", rating: 5, content: "Finally a link-in-bio that looks like I designed it myself." },
      { name: "Oscar Lindqvist", rating: 4, content: "The editorial template is stunning." },
    ],
    "portfolio-builder": [
      { name: "Zoe Barrett", rating: 5, content: "Got three interviews from portfolios in a week. Worth every dollar." },
      { name: "Ravi Shankar", rating: 5, content: "The case study templates made me actually write up my work properly." },
      { name: "Marta Kowalski", rating: 4, content: "Beautiful out of the box." },
    ],
    "invoice-maker": [
      { name: "Tanner Blackwood", rating: 5, content: "I was paying $20/mo for software that did half of this. Switched and never looked back." },
      { name: "Keiko Sato", rating: 5, content: "Recurring invoices alone saved me 2 hours a month." },
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
    "ad-copy-generator": [
      { name: "Hector Palma", rating: 5, content: "The platform-specific tuning is the real differentiator. Other tools give me the same copy for LinkedIn and TikTok — that's not how ads work." },
      { name: "Sienna Beaumont", rating: 4, content: "Solid output. I still edit, but I'm editing less." },
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
