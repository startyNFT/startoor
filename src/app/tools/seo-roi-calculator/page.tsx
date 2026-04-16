import type { Metadata } from "next";
import Link from "next/link";
import { Calculator } from "./calculator";

export const metadata: Metadata = {
  title: "SEO ROI Calculator · Try it",
  description:
    "A quiet, honest forecasting tool for search marketers. Model the 12-month payoff of ranking a single keyword — before you pitch the spend.",
};

type PageProps = {
  searchParams: Promise<{
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
  }>;
};

export default async function SeoRoiCalculatorPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <div className="relative">
      {/* Intro header */}
      <header className="relative border-b border-hairline bg-paper print:hidden">
        <div className="mx-auto max-w-7xl px-6 pt-16 pb-14 md:px-10 md:pt-20 md:pb-16">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-end">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-clay">
                Try it · SEO ROI Calculator
              </span>
              <h1 className="mt-3 font-display text-5xl leading-[0.95] tracking-tight text-ink md:text-6xl lg:text-[5.5rem]">
                Before you pitch
                <br />
                <span className="italic text-forest">the spend,</span>
                <br />
                model the payoff.
              </h1>
              <p className="mt-8 max-w-xl font-sans text-lg leading-relaxed text-ink-soft">
                A quiet, honest forecasting tool. Plug in a keyword, a position,
                a close rate — get a 12-month ramp, payback month, and a share
                link you can send to a skeptical founder.
              </p>
            </div>
            <aside className="hidden max-w-sm lg:block">
              <div className="space-y-5 border-t border-hairline pt-6 font-sans text-sm leading-relaxed text-ink-soft">
                <p>
                  Uses a published industry CTR curve for positions 1–10, a
                  sigmoid ramp so month one doesn&apos;t lie to you, and a clean
                  revenue / spend overlay so the breakeven is unmistakable.
                </p>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone">
                  Part of ·{" "}
                  <Link
                    href="/products/seo-roi-calculator"
                    className="text-ink hover:text-clay"
                  >
                    Startoor · SEO ROI Calculator
                  </Link>
                </p>
              </div>
            </aside>
          </div>
        </div>
        <div className="paper-grain absolute inset-0 pointer-events-none" />
      </header>

      <Calculator initialParams={params} />
    </div>
  );
}
