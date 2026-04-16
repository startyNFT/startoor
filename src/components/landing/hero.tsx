import Link from "next/link";
import { getProductStats } from "@/lib/queries";

export async function Hero() {
  const stats = await getProductStats();

  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 pt-20 pb-24 md:px-10 md:pt-28 md:pb-32">
        <div className="relative grid gap-16 md:grid-cols-[1.3fr_0.7fr] md:gap-10">
          <div>
            <div className="flex items-center gap-3 animate-fade-up" style={{ animationDelay: "40ms" }}>
              <span className="block h-[1px] w-10 bg-ink" />
              <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-stone">
                Est. 2026 · Curated weekly
              </span>
            </div>
            <h1
              className="mt-8 font-display text-[60px] leading-[0.92] tracking-[-0.02em] text-ink md:text-[88px] lg:text-[108px]"
            >
              <span className="block animate-fade-up" style={{ animationDelay: "120ms" }}>A curated</span>
              <span className="block animate-fade-up" style={{ animationDelay: "220ms" }}>
                marketplace <span className="italic text-forest">for</span>
              </span>
              <span className="block animate-fade-up" style={{ animationDelay: "320ms" }}>AI-built apps.</span>
            </h1>
            <p
              className="mt-10 max-w-xl font-sans text-lg leading-relaxed text-ink-soft md:text-xl animate-fade-up"
              style={{ animationDelay: "440ms" }}
            >
              Hand-picked starter kits, templates, and tools built with AI — shipped
              by makers who use them every day. Buy once. Use forever.
            </p>
            <div
              className="mt-12 flex flex-wrap gap-3 animate-fade-up"
              style={{ animationDelay: "540ms" }}
            >
              <Link
                href="/browse"
                className="group inline-flex items-center gap-3 rounded-full bg-ink px-7 py-3.5 font-sans text-sm text-bone transition-all hover:bg-forest"
              >
                <span>Browse the catalog</span>
                <span className="transition-transform group-hover:translate-x-0.5">→</span>
              </Link>
              <Link
                href="/sell"
                className="inline-flex items-center gap-2 rounded-full border border-ink px-7 py-3.5 font-sans text-sm text-ink transition-colors hover:bg-ink hover:text-bone"
              >
                Become a maker
              </Link>
            </div>
          </div>

          <div
            className="relative hidden flex-col justify-end md:flex animate-fade-up"
            style={{ animationDelay: "640ms" }}
          >
            <StatStack stats={stats} />
          </div>
        </div>

        <div className="mt-20 grid gap-8 border-t border-hairline pt-10 md:grid-cols-3 md:gap-14">
          {PILLARS.map((pillar) => (
            <div key={pillar.title}>
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-clay">
                {pillar.label}
              </span>
              <h3 className="mt-3 font-display text-xl leading-tight tracking-tight text-ink">
                {pillar.title}
              </h3>
              <p className="mt-3 font-sans text-sm leading-relaxed text-ink-soft">
                {pillar.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatStack({ stats }: { stats: Awaited<ReturnType<typeof getProductStats>> }) {
  return (
    <div className="ml-auto flex w-full max-w-sm flex-col items-end gap-8">
      <div className="relative w-full border border-hairline bg-bone p-8 stamp-rotate-1">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone">
          Catalog
        </span>
        <div className="mt-3 flex items-baseline justify-between gap-4">
          <span className="font-display text-5xl tracking-tight text-ink tabular-nums">
            {String(stats.products).padStart(2, "0")}
          </span>
          <span className="font-sans text-sm text-ink-soft">
            products live
          </span>
        </div>
        <div className="mt-6 hairline-soft flex items-baseline justify-between gap-3 pt-4">
          <span className="font-display text-2xl tracking-tight text-ink tabular-nums">
            {String(stats.makers).padStart(2, "0")}
          </span>
          <span className="font-sans text-xs text-ink-soft">
            makers, {stats.categories} categories
          </span>
        </div>
      </div>
      <div className="relative max-w-xs border border-hairline bg-forest p-7 stamp-rotate-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-bone/70">
          Promise
        </span>
        <p className="mt-4 font-display text-xl leading-tight tracking-tight text-bone">
          If it&apos;s on Startoor, a real person uses it to ship real work.
        </p>
      </div>
    </div>
  );
}

const PILLARS = [
  {
    label: "Curated",
    title: "Every listing is reviewed by hand.",
    body: "We don't accept AI-generated slop. Every product is used by a real maker, vetted by our team, and tested end-to-end.",
  },
  {
    label: "Fair",
    title: "One price. Yours forever.",
    body: "No subscriptions you forgot about. Buy the product once, get the source, updates included for a year.",
  },
  {
    label: "Makers first",
    title: "90% to the people who ship.",
    body: "Our commission is 10% — the lowest in the category. The people making the work keep the money from the work.",
  },
];
