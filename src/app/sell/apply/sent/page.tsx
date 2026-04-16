import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Application received",
  robots: { index: false, follow: false },
};

export default function ApplicationSentPage() {
  return (
    <div className="border-t border-hairline">
      <div className="mx-auto max-w-3xl px-6 py-24 text-center md:px-10 md:py-32">
        <div className="inline-flex items-center gap-3 border border-hairline bg-bone px-4 py-2">
          <span className="inline-block h-2 w-2 rounded-full bg-forest" />
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink">
            Application received
          </span>
        </div>
        <h1 className="mt-10 font-display text-5xl leading-[0.95] tracking-tight text-ink md:text-7xl">
          We&apos;ll be in touch,
          <br />
          <span className="italic text-forest">promise.</span>
        </h1>
        <p className="mx-auto mt-8 max-w-xl font-sans text-lg leading-relaxed text-ink-soft">
          We read every application by hand. Expect a reply within 5 days —
          usually faster. In the meantime, browse the catalog and see what
          good looks like on Startoor.
        </p>
        <div className="mt-14 flex flex-wrap justify-center gap-3">
          <Link
            href="/browse"
            className="group inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-sans text-sm text-bone transition-colors hover:bg-forest"
          >
            Browse catalog →
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-ink px-6 py-3 font-sans text-sm text-ink transition-colors hover:bg-ink hover:text-bone"
          >
            Back home
          </Link>
        </div>
      </div>
    </div>
  );
}
