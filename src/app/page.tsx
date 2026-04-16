import Link from "next/link";

export default function LandingPage() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-32 md:px-10 md:py-40">
      <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-stone">
        Preview — launching soon
      </p>
      <h1 className="mt-6 font-display text-5xl leading-[0.95] tracking-tight text-ink md:text-7xl">
        A curated marketplace
        <br />
        for AI-built apps.
      </h1>
      <p className="mt-8 max-w-xl font-sans text-lg leading-relaxed text-ink-soft">
        Hand-picked starter kits, templates, and tools built with AI — ready to
        launch, priced fair, shipped by people who actually use them. Full
        catalog goes live shortly.
      </p>
      <div className="mt-12 flex gap-4">
        <Link
          href="/browse"
          className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-sans text-sm text-bone transition-colors hover:bg-forest"
        >
          Browse catalog <span>→</span>
        </Link>
        <Link
          href="/sell"
          className="inline-flex items-center gap-2 rounded-full border border-ink px-6 py-3 font-sans text-sm text-ink transition-colors hover:bg-ink hover:text-bone"
        >
          Become a maker
        </Link>
      </div>
    </section>
  );
}
