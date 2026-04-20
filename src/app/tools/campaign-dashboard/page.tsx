import type { Metadata } from "next";
import Link from "next/link";
import { CampaignDashboard } from "./dashboard";

export const metadata: Metadata = {
  title: "Campaign Dashboard · Try it",
  description:
    "An operator's view of paid media. Pacing, ROAS, CAC creep, and the one weekend that printed — built for marketers who have to explain the spend.",
};

export default function CampaignDashboardPage() {
  return (
    <div className="relative">
      {/* Intro header */}
      <header className="relative border-b border-hairline bg-paper">
        <div className="mx-auto max-w-7xl px-6 pt-16 pb-14 md:px-10 md:pt-20 md:pb-16">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-end">
            <div className="min-w-0">
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-clay">
                Try it · Campaign Dashboard
              </span>
              <h1 className="mt-3 font-display text-5xl leading-[0.95] tracking-tight text-ink md:text-6xl lg:text-[5.5rem]">
                Where the money
                <br />
                <span className="italic text-forest">actually went</span>
                <br />
                this quarter.
              </h1>
              <p className="mt-8 max-w-xl font-sans text-lg leading-relaxed text-ink-soft">
                A 20-campaign ops view. Spend, ROAS, conversions, CAC creep,
                pacing, anomalies — all on one page, all hand-drawn in SVG.
                No blue SaaS gradients. No guesswork on what to look at first.
              </p>
            </div>
            <aside className="hidden max-w-sm lg:block">
              <div className="space-y-5 border-t border-hairline pt-6 font-sans text-sm leading-relaxed text-ink-soft">
                <p>
                  Filters travel through every tile, chart, and row.
                  &ldquo;Things to notice&rdquo; cards surface spikes, dips,
                  CAC creep, and new winners so you spend less time scrolling
                  and more time answering the one question every founder asks.
                </p>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone">
                  Part of ·{" "}
                  <Link
                    href="/products/campaign-dashboard"
                    className="text-ink hover:text-clay"
                  >
                    Startoor · Campaign Dashboard
                  </Link>
                </p>
              </div>
            </aside>
          </div>
        </div>
        <div className="paper-grain pointer-events-none absolute inset-0" />
      </header>

      <CampaignDashboard />
    </div>
  );
}
