import type { Metadata } from "next";
import Link from "next/link";
import { ApplyForm } from "./apply-form";

export const metadata: Metadata = {
  title: "Apply to sell",
  description: "Apply to become a maker on Startoor.",
};

export default function ApplyPage() {
  return (
    <div className="border-t border-hairline">
      <div className="mx-auto max-w-5xl px-6 py-20 md:px-10 md:py-28">
        <Link
          href="/sell"
          className="font-mono text-[11px] uppercase tracking-[0.24em] text-stone hover:text-ink"
        >
          ← Back
        </Link>
        <div className="mt-8 grid gap-12 md:grid-cols-[0.9fr_1.1fr] md:gap-20">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-clay">
              Apply to sell
            </span>
            <h1 className="mt-4 font-display text-5xl leading-[0.95] tracking-tight text-ink md:text-7xl">
              Tell us what
              <br />
              <span className="italic text-forest">you&apos;re shipping.</span>
            </h1>
            <p className="mt-8 max-w-sm font-sans text-base leading-relaxed text-ink-soft">
              A short form. We read every word. The more specific and honest
              you are, the faster we can say yes.
            </p>
            <div className="mt-10 border-l-2 border-clay pl-5 text-ink-soft">
              <p className="font-display text-lg leading-relaxed md:text-xl">
                &ldquo;We don&apos;t want slick decks. We want to see how you
                think about the thing you&apos;re selling.&rdquo;
              </p>
              <p className="mt-3 font-mono text-xs uppercase tracking-[0.2em] text-stone">
                — Startoor curation
              </p>
            </div>
          </div>
          <ApplyForm />
        </div>
      </div>
    </div>
  );
}
