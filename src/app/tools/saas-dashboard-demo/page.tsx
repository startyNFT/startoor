import type { Metadata } from "next";
import Link from "next/link";
import { DashboardApp, type DashboardView } from "./dashboard-app";

export const metadata: Metadata = {
  title: "SaaS Dashboard Starter · Preview",
  description:
    "A live preview of the admin panel that ships with Startoor's SaaS Dashboard Starter — populated with a seeded, deterministic mock dataset.",
};

type PageProps = {
  searchParams: Promise<{
    view?: string;
  }>;
};

const KNOWN_VIEWS: DashboardView[] = [
  "overview",
  "users",
  "billing",
  "analytics",
  "settings",
];

function coerceView(raw: string | undefined): DashboardView {
  if (raw && (KNOWN_VIEWS as string[]).includes(raw)) {
    return raw as DashboardView;
  }
  return "overview";
}

export default async function SaasDashboardDemoPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const view = coerceView(params.view);

  return (
    <div className="relative">
      {/* Intro header — same shape as other /tools intros */}
      <header className="relative border-b border-hairline bg-paper">
        <div className="mx-auto max-w-7xl px-6 pt-14 pb-10 md:px-10 md:pt-16 md:pb-12">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-end">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-clay">
                Preview · SaaS Dashboard Starter
              </span>
              <h1 className="mt-3 font-display text-5xl leading-[0.95] tracking-tight text-ink md:text-6xl lg:text-[4.75rem]">
                The admin panel
                <br />
                <span className="italic text-forest">you&apos;d rather</span>
                <br />
                ship on Monday.
              </h1>
              <p className="mt-8 max-w-xl font-sans text-lg leading-relaxed text-ink-soft">
                This is the starter, filled with seeded mock data. Click
                through the sidebar to see every view — overview, users,
                billing, analytics, settings. Edits persist locally so the demo
                feels alive.
              </p>
            </div>
            <aside className="hidden max-w-sm lg:block">
              <div className="space-y-5 border-t border-hairline pt-6 font-sans text-sm leading-relaxed text-ink-soft">
                <p>
                  80 seeded users, 12 months of MRR, 12 invoices, 8 event types
                  across 90 days, cohorts, funnels, notifications, API keys.
                  Numbers tie out.
                </p>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone">
                  Part of ·{" "}
                  <Link
                    href="/products/saas-dashboard-starter"
                    className="text-ink hover:text-clay"
                  >
                    Startoor · SaaS Dashboard Starter
                  </Link>
                </p>
              </div>
            </aside>
          </div>
        </div>
        <div className="paper-grain absolute inset-0 pointer-events-none" />
      </header>

      {/* Demo banner — thin strip above the app shell */}
      <div className="border-b border-hairline bg-butter/25">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-2.5 md:px-10">
          <p className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-ink">
            <span className="relative inline-flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-clay opacity-70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-clay" />
            </span>
            Demo · You&apos;re looking at the shipped starter filled with sample data
          </p>
          <Link
            href="/products/saas-dashboard-starter"
            className="inline-flex items-center gap-1.5 rounded-full border border-ink bg-ink px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-bone transition-colors hover:bg-forest"
          >
            Get the code
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>

      <DashboardApp initialView={view} />
    </div>
  );
}
