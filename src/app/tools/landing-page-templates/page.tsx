import type { Metadata } from "next";
import { Gallery } from "./gallery";
import { LANDING_TEMPLATES } from "@/lib/landing-templates";

export const metadata: Metadata = {
  title: "Landing Page Templates · Try it",
  description:
    "Ten fully-designed Next.js landing page templates — SaaS, DTC, cohort, newsletter, agency, local service, fitness, enterprise, waitlist, and jobs. Preview live, copy the hero JSX, ship tomorrow.",
};

type PageProps = {
  searchParams: Promise<{ industry?: string; style?: string; sort?: string }>;
};

export default async function LandingPageTemplatesPage({ searchParams }: PageProps) {
  await searchParams; // Next 16: must await even if unused

  const templates = LANDING_TEMPLATES;

  return (
    <div className="relative">
      <header className="relative border-b border-hairline bg-paper">
        <div className="mx-auto max-w-7xl px-6 pt-16 pb-14 md:px-10 md:pt-20 md:pb-16">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-end">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-clay">
                Try it · Landing Page Templates
              </span>
              <h1 className="mt-3 font-display text-5xl leading-[0.95] tracking-tight text-ink md:text-6xl lg:text-[5.5rem]">
                Ten pages
                <br />
                <span className="italic text-forest">you could ship</span>
                <br />
                tomorrow.
              </h1>
              <p className="mt-8 max-w-xl font-sans text-lg leading-relaxed text-ink-soft">
                Ten fully designed landing pages — not hero crops, not mood
                boards. Each one goes all the way to the footer and tries to
                earn its own voice. Preview live, copy the hero JSX, or keep
                the whole component and adapt.
              </p>
            </div>
            <aside className="hidden max-w-sm lg:block">
              <div className="space-y-5 border-t border-hairline pt-6 font-sans text-sm leading-relaxed text-ink-soft">
                <p>
                  Built across eight style directions — editorial, minimal,
                  bold, utilitarian, cinematic, warm, technical, and retro —
                  so you're not forced into one aesthetic. React, Tailwind,
                  zero external dependencies. Drop into any Next.js app.
                </p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-[10px] uppercase tracking-[0.18em] text-stone">
                  <span>10 templates</span>
                  <span className="tabular-nums">8 styles</span>
                  <span>10 industries</span>
                  <span className="tabular-nums">0 deps</span>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </header>

      <Gallery templates={templates} />
    </div>
  );
}
