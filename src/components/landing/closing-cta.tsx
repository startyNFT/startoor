import Link from "next/link";

export function ClosingCta() {
  return (
    <section className="border-t border-hairline">
      <div className="mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32">
        <div className="grid gap-12 md:grid-cols-[1.1fr_0.9fr] md:gap-20">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-clay">
              For makers
            </span>
            <h2 className="mt-4 font-display text-4xl leading-[0.95] tracking-tight text-ink md:text-6xl">
              Ship something
              <br />
              <span className="italic text-forest">worth selling.</span>
              <br />
              We&apos;ll handle the storefront.
            </h2>
          </div>
          <div className="flex flex-col justify-end">
            <p className="max-w-md font-sans text-base leading-relaxed text-ink-soft">
              We take 10%. You keep 90% and your audience. Every maker gets a
              profile page, analytics, and promotion on our weekly editorial.
              Applications reviewed within 5 days.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/sell/apply"
                className="group inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 font-sans text-sm text-bone transition-colors hover:bg-forest"
              >
                Apply to sell
                <span className="transition-transform group-hover:translate-x-0.5">→</span>
              </Link>
              <Link
                href="/sell"
                className="inline-flex items-center gap-2 rounded-full border border-ink px-7 py-3.5 font-sans text-sm text-ink transition-colors hover:bg-ink hover:text-bone"
              >
                Read the pitch
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
