import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sell on Startoor",
  description:
    "Become a maker on Startoor. Ship AI-built products to a curated audience. Keep 90%. Get featured.",
};

const PERKS = [
  {
    n: "01",
    title: "Keep 90%.",
    body: "We take 10% — less than App Store, less than Gumroad Premium. The people making the work keep the money from the work.",
  },
  {
    n: "02",
    title: "Get curated.",
    body: "Every maker gets at least one featured slot per quarter. We run weekly editorials. The audience we bring is the point.",
  },
  {
    n: "03",
    title: "Own your page.",
    body: "You get a maker profile, analytics, an email list you own, and direct buyer contact. No algorithm between you and your customers.",
  },
  {
    n: "04",
    title: "Ship on your terms.",
    body: "No minimum catalog. No approval queue for updates. Once approved, you ship what you want, when you want.",
  },
];

const FAQS = [
  {
    q: "What counts as an AI-built product?",
    a: "Something you made with heavy assistance from AI tooling — Claude Code, Cursor, Lovable, Bolt, Replit Agents. Not AI-generated slop shoveled into a PDF.",
  },
  {
    q: "What does Startoor actually review?",
    a: "We install it. We run it. We check the README is honest. We verify you can support it. Approvals take 5 days.",
  },
  {
    q: "Can I sell updates or services alongside?",
    a: "Services are coming in v2. For v1, products are one-time purchases with a year of updates included.",
  },
  {
    q: "What file formats do you host?",
    a: "Code repos (public or private), Chrome extensions, static sites, Figma files, Notion templates, PDFs. Anything buyers can use immediately.",
  },
];

export default function SellPage() {
  return (
    <>
      {/* Hero */}
      <section className="border-t border-hairline bg-forest text-bone">
        <div className="mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-36">
          <div className="grid gap-14 md:grid-cols-[1.1fr_0.9fr] md:gap-20">
            <div>
              <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-butter">
                For makers
              </span>
              <h1 className="mt-6 font-display text-5xl leading-[0.92] tracking-tight text-bone md:text-7xl lg:text-[92px]">
                Your best work
                <br />
                <span className="italic">deserves a better</span>
                <br />
                storefront.
              </h1>
              <div className="mt-12 flex flex-wrap gap-3">
                <Link
                  href="/sell/apply"
                  className="group inline-flex items-center gap-2 rounded-full bg-bone px-7 py-3.5 font-sans text-sm text-ink transition-colors hover:bg-butter"
                >
                  Apply to sell
                  <span className="transition-transform group-hover:translate-x-0.5">→</span>
                </Link>
                <Link
                  href="#how-it-works"
                  className="inline-flex items-center gap-2 rounded-full border border-bone/30 px-7 py-3.5 font-sans text-sm text-bone transition-colors hover:border-butter"
                >
                  How it works
                </Link>
              </div>
            </div>
            <div className="flex flex-col items-start justify-end gap-8 text-bone/80">
              <p className="font-display text-2xl leading-[1.35] md:text-3xl">
                &ldquo;Gumroad looks like Gumroad. Linktree looks like
                Linktree. Your storefront should look like you.&rdquo;
              </p>
              <div className="grid w-full grid-cols-2 gap-10 border-t border-bone/20 pt-8 text-bone">
                <Stat label="Makers earn" value="90%" />
                <Stat label="Review time" value="5 days" />
                <Stat label="Listing fee" value="$0" />
                <Stat label="Platform commission" value="10%" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Perks */}
      <section id="how-it-works" className="mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32">
        <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-clay">
          Why Startoor
        </span>
        <h2 className="mt-4 max-w-2xl font-display text-4xl leading-[0.95] tracking-tight text-ink md:text-6xl">
          A storefront that respects
          <br />
          your <span className="italic text-forest">actual work.</span>
        </h2>
        <div className="mt-16 grid gap-px overflow-hidden border border-hairline bg-hairline md:grid-cols-2">
          {PERKS.map((perk) => (
            <div key={perk.n} className="bg-paper p-10">
              <span className="font-display text-4xl leading-none tracking-tight text-clay">
                {perk.n}
              </span>
              <h3 className="mt-6 font-display text-2xl leading-tight tracking-tight text-ink">
                {perk.title}
              </h3>
              <p className="mt-3 max-w-sm font-sans text-base leading-relaxed text-ink-soft">
                {perk.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-hairline bg-bone">
        <div className="mx-auto max-w-4xl px-6 py-24 md:px-10 md:py-32">
          <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-clay">
            Questions we actually get
          </span>
          <h2 className="mt-4 font-display text-4xl leading-tight tracking-tight text-ink md:text-5xl">
            FAQ.
          </h2>
          <div className="mt-12 divide-y divide-hairline border-t border-hairline">
            {FAQS.map((faq) => (
              <details
                key={faq.q}
                className="group py-7"
              >
                <summary className="flex cursor-pointer list-none items-start justify-between gap-6 text-left">
                  <h3 className="font-display text-xl leading-tight tracking-tight text-ink md:text-2xl">
                    {faq.q}
                  </h3>
                  <span className="mt-1 font-mono text-lg text-stone transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-4 max-w-2xl font-sans text-base leading-relaxed text-ink-soft">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>

          <div className="mt-16 flex flex-col items-start gap-6 border-t border-hairline pt-12">
            <p className="font-display text-3xl leading-tight tracking-tight text-ink md:text-4xl">
              Ready to list your first product?
            </p>
            <Link
              href="/sell/apply"
              className="group inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 font-sans text-sm text-bone transition-colors hover:bg-forest"
            >
              Apply to sell
              <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-display text-4xl leading-none tracking-tight text-bone">
        {value}
      </p>
      <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-bone/60">
        {label}
      </p>
    </div>
  );
}
