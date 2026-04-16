const STEPS = [
  {
    n: "01",
    title: "Makers submit.",
    body: "Indie builders send us their AI-built products — apps, templates, tools. Real things they ship with and use daily.",
  },
  {
    n: "02",
    title: "We curate.",
    body: "Every product gets a hands-on review. We test it, run it, and only list it if it's genuinely good. No slop, no filler.",
  },
  {
    n: "03",
    title: "You buy once.",
    body: "One clean checkout. Download, deploy, run. No subscriptions you'll forget about. Updates for a year. Support from the maker.",
  },
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32">
      <div className="grid gap-12 md:grid-cols-[0.8fr_1.2fr] md:gap-20">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-clay">
            How it works
          </span>
          <h2 className="mt-4 font-display text-4xl leading-tight tracking-tight text-ink md:text-5xl">
            Three steps,
            <br />
            <span className="italic text-forest">nothing</span> hidden.
          </h2>
          <p className="mt-6 max-w-sm font-sans text-base leading-relaxed text-ink-soft">
            No algorithms. No fake social proof. No subscription traps. Just
            people building things, shipping them, and getting paid — with us
            doing the curation in the middle.
          </p>
        </div>
        <ol className="space-y-8">
          {STEPS.map((step, idx) => (
            <li
              key={step.n}
              className={`grid grid-cols-[auto_1fr] gap-6 ${idx !== 0 ? "border-t border-hairline pt-8" : ""}`}
            >
              <span className="font-display text-5xl leading-none tracking-tight text-clay">
                {step.n}
              </span>
              <div>
                <h3 className="font-display text-2xl leading-tight tracking-tight text-ink">
                  {step.title}
                </h3>
                <p className="mt-3 max-w-lg font-sans text-base leading-relaxed text-ink-soft">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
