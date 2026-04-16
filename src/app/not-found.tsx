import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-start justify-center px-6 py-20 md:px-10">
      <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-clay">
        404 · Nowhere
      </span>
      <h1 className="mt-6 font-display text-6xl leading-[0.92] tracking-tight text-ink md:text-[120px]">
        Not <span className="italic text-forest">here.</span>
      </h1>
      <p className="mt-8 max-w-lg font-sans text-lg leading-relaxed text-ink-soft">
        The page you&apos;re looking for has been moved, renamed, or never
        existed. Most things live in the catalog.
      </p>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/browse"
          className="group inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-sans text-sm text-bone transition-colors hover:bg-forest"
        >
          Browse catalog
          <span className="transition-transform group-hover:translate-x-0.5">→</span>
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-ink px-6 py-3 font-sans text-sm text-ink transition-colors hover:bg-ink hover:text-bone"
        >
          Back home
        </Link>
      </div>
    </div>
  );
}
