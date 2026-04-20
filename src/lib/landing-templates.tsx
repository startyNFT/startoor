import type React from "react";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

export type TemplateIndustry =
  | "saas"
  | "dtc"
  | "course"
  | "newsletter"
  | "agency"
  | "local"
  | "fitness"
  | "b2b"
  | "waitlist"
  | "jobs";

export type TemplateStyle =
  | "editorial"
  | "minimal"
  | "bold"
  | "utilitarian"
  | "cinematic"
  | "warm"
  | "technical"
  | "retro";

export type LandingTemplate = {
  slug: string;
  name: string;
  industryLabel: string;
  industry: TemplateIndustry;
  styleTags: TemplateStyle[];
  heroSummary: string;
  description: string;
  accent: string; // rough palette label (for thumbnail chip)
  lovedCount: number;
  addedDays: number; // days ago, for "newest" sort
  Component: React.FC;
  heroSource: string; // JSX string copied by "copy hero JSX"
  fullSource: string; // full component string for "view source"
};

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

const seed = (slug: string, n: number, w: number, h: number) =>
  `https://picsum.photos/seed/${slug}-${n}/${w}/${h}`;

/* A tiny reusable dot-grid SVG data URL for decorative backgrounds */
const dotGrid =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'><circle cx='1' cy='1' r='1' fill='%230000000f'/></svg>\")";

/* -------------------------------------------------------------------------- */
/*  Template 1 — SaaS launch (AI dev tool)                                    */
/*  Visual language: Near-black, mono-forward, monochrome with one acid-lime  */
/*  accent. Type-forward, no gradients. Feels like Linear/Vercel energy.      */
/* -------------------------------------------------------------------------- */

const SaasLaunchTemplate: React.FC = () => {
  return (
    <div
      className="min-h-screen w-full font-sans text-[#E8E8E3]"
      style={{
        backgroundColor: "#0C0C0B",
        backgroundImage:
          "radial-gradient(circle at 85% 0%, rgba(206,255,44,0.08), transparent 40%)",
      }}
    >
      <nav className="flex items-center justify-between px-8 py-5 md:px-14">
        <div className="flex items-center gap-2">
          <div
            className="h-6 w-6"
            style={{
              background:
                "conic-gradient(from 210deg, #CEFF2C, #E8E8E3 40%, #0C0C0B 70%, #CEFF2C)",
              borderRadius: 2,
            }}
          />
          <span className="font-mono text-[13px] tracking-tight">halon.dev</span>
        </div>
        <div className="hidden gap-8 text-[13px] text-[#9A9A93] md:flex">
          <a>Product</a>
          <a>Docs</a>
          <a>Changelog</a>
          <a>Customers</a>
          <a>Pricing</a>
        </div>
        <div className="flex items-center gap-4">
          <a className="text-[13px] text-[#9A9A93]">Sign in</a>
          <a
            className="rounded-md bg-[#CEFF2C] px-3 py-1.5 text-[13px] font-medium"
            style={{ color: "#0C0C0B" }}
          >
            Start free
          </a>
        </div>
      </nav>

      <section className="px-8 pt-20 pb-28 md:px-14 md:pt-28 md:pb-36">
        <div className="mx-auto max-w-5xl">
          <div
            className="mb-8 inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[11px] tracking-tight"
            style={{ borderColor: "rgba(206,255,44,0.35)", color: "#CEFF2C" }}
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#CEFF2C]" />
            v2.4 — agents now run on branch previews
          </div>
          <h1 className="text-5xl leading-[0.98] font-semibold tracking-tight md:text-7xl">
            Ship code faster than
            <br />
            <span style={{ color: "#CEFF2C" }}>your CI can complain.</span>
          </h1>
          <p className="mt-8 max-w-xl text-[17px] leading-relaxed text-[#B5B5AD]">
            Halon is an autonomous dev agent that reviews your PRs, writes the
            missing tests, and merges the safe ones — all before your linter
            even wakes up.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <a
              className="rounded-md bg-[#CEFF2C] px-5 py-3 text-[14px] font-medium"
              style={{ color: "#0C0C0B" }}
            >
              Start free — no card
            </a>
            <a className="rounded-md border border-[#2A2A27] px-5 py-3 text-[14px] text-[#E8E8E3]">
              Book a 15-min demo
            </a>
            <span className="ml-2 font-mono text-[11px] text-[#6A6A63]">
              npm i -g halon · 38MB
            </span>
          </div>

          {/* Terminal */}
          <div
            className="mt-16 overflow-hidden rounded-xl border"
            style={{ borderColor: "#1D1D1B", backgroundColor: "#141412" }}
          >
            <div
              className="flex items-center gap-2 border-b px-4 py-2.5"
              style={{ borderColor: "#1D1D1B" }}
            >
              <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
              <span className="ml-4 font-mono text-[11px] text-[#6A6A63]">
                halon — review #2148
              </span>
            </div>
            <pre className="overflow-x-auto px-5 py-5 font-mono text-[12.5px] leading-relaxed">
{`$ halon review feat/checkout-v2
  ✓ 14 files analyzed in 2.1s
  ✓ 3 tests auto-written (cart, invoice, refund)
  ⚠ 1 potential race in useOrderStatus.ts:42
  ✦ merged: branch preview green
`}
            </pre>
          </div>
        </div>
      </section>

      {/* Feature rows */}
      <section className="border-t px-8 py-24 md:px-14" style={{ borderColor: "#1D1D1B" }}>
        <div className="mx-auto max-w-5xl">
          <p className="font-mono text-[11px] tracking-[0.18em] text-[#6A6A63] uppercase">
            Works where your team already lives
          </p>
          <h2 className="mt-4 text-3xl font-medium tracking-tight md:text-4xl">
            One agent. Every stack.
          </h2>
          <div className="mt-14 grid gap-10 md:grid-cols-3">
            {[
              {
                t: "PR review in 11 seconds",
                d: "Runs on every push. Catches the 90% of review nits a human would have asked about.",
                stat: "11s",
              },
              {
                t: "Auto-written tests",
                d: "Generates unit + integration tests for changed lines. You keep the copyright, not the chore.",
                stat: "82%",
              },
              {
                t: "Safe auto-merge",
                d: "Merges green, low-risk PRs (docs, deps, refactors) with opinionated guardrails.",
                stat: "3.1×",
              },
            ].map((f) => (
              <div key={f.t}>
                <div className="font-mono text-[22px] text-[#CEFF2C]">{f.stat}</div>
                <div className="mt-3 text-[16px] font-medium">{f.t}</div>
                <p className="mt-2 text-[14px] leading-relaxed text-[#9A9A93]">
                  {f.d}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Logos */}
      <section className="border-t px-8 py-14 md:px-14" style={{ borderColor: "#1D1D1B" }}>
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-12 gap-y-6 opacity-70">
          <span className="font-mono text-[12px] text-[#6A6A63]">Trusted by engineering at</span>
          {["LINEARPATH", "ATLAS/OS", "NORTHWIND", "MONOPOLE", "GRIDSTONE", "PARSEC"].map(
            (l) => (
              <span key={l} className="font-mono text-[13px] tracking-widest text-[#B5B5AD]">
                {l}
              </span>
            ),
          )}
        </div>
      </section>

      {/* Pricing */}
      <section className="border-t px-8 py-24 md:px-14" style={{ borderColor: "#1D1D1B" }}>
        <div className="mx-auto max-w-5xl">
          <h2 className="text-3xl font-medium tracking-tight md:text-4xl">
            Priced like a teammate, not a tax.
          </h2>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              { n: "Solo", p: "$0", d: "For your side projects.", feat: ["1 repo", "200 reviews/mo", "Community support"] },
              {
                n: "Team",
                p: "$24",
                d: "Per seat, per month.",
                feat: ["Unlimited repos", "Auto-merge", "SSO + audit log"],
                hot: true,
              },
              { n: "Company", p: "Talk", d: "For orgs with procurement.", feat: ["Self-hosted runner", "Dedicated CSM", "SOC2 pack"] },
            ].map((p) => (
              <div
                key={p.n}
                className="rounded-xl border p-6"
                style={{
                  borderColor: p.hot ? "#CEFF2C" : "#1D1D1B",
                  backgroundColor: p.hot ? "rgba(206,255,44,0.04)" : "transparent",
                }}
              >
                <div className="flex items-baseline justify-between">
                  <div className="text-[14px] font-medium tracking-tight">{p.n}</div>
                  {p.hot && (
                    <span
                      className="rounded-full px-2 py-0.5 font-mono text-[10px]"
                      style={{ backgroundColor: "#CEFF2C", color: "#0C0C0B" }}
                    >
                      most teams
                    </span>
                  )}
                </div>
                <div className="mt-4 font-display text-[42px] leading-none">{p.p}</div>
                <div className="mt-1 text-[13px] text-[#9A9A93]">{p.d}</div>
                <ul className="mt-6 space-y-2 text-[13.5px] text-[#B5B5AD]">
                  {p.feat.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <span style={{ color: "#CEFF2C" }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  className="mt-7 inline-block w-full rounded-md py-2 text-center text-[13px] font-medium"
                  style={{
                    backgroundColor: p.hot ? "#CEFF2C" : "transparent",
                    color: p.hot ? "#0C0C0B" : "#E8E8E3",
                    border: p.hot ? "none" : "1px solid #2A2A27",
                  }}
                >
                  {p.hot ? "Start 14-day trial" : "Choose plan"}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer
        className="border-t px-8 py-10 md:px-14"
        style={{ borderColor: "#1D1D1B", color: "#6A6A63" }}
      >
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 font-mono text-[11px]">
          <span>© Halon Labs · Built in Lisbon</span>
          <div className="flex gap-6">
            <a>Status · all green</a>
            <a>Security</a>
            <a>Terms</a>
            <a>Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*  Template 2 — DTC candle brand (editorial magazine)                        */
/* -------------------------------------------------------------------------- */

const DtcCandleTemplate: React.FC = () => {
  const bg = "#F3EEE3";
  const ink = "#2A2722";
  const accent = "#8A3B25";
  return (
    <div className="min-h-screen" style={{ backgroundColor: bg, color: ink }}>
      <nav className="flex items-center justify-between px-8 py-6 md:px-14">
        <span style={{ fontFamily: "var(--font-display)" }} className="text-[22px] italic">
          Mothlight
        </span>
        <div className="hidden gap-10 text-[12px] tracking-[0.22em] uppercase md:flex">
          <a>Candles</a>
          <a>Rituals</a>
          <a>Our makers</a>
          <a>Journal</a>
        </div>
        <div className="flex items-center gap-4 text-[12px] tracking-[0.22em] uppercase">
          <a>Account</a>
          <a className="relative">
            Bag
            <span
              className="absolute -top-2 -right-3 flex h-4 w-4 items-center justify-center rounded-full text-[10px]"
              style={{ backgroundColor: accent, color: bg }}
            >
              2
            </span>
          </a>
        </div>
      </nav>

      {/* Hero split */}
      <section className="grid gap-0 border-t md:grid-cols-[1fr_1.1fr]" style={{ borderColor: "rgba(42,39,34,0.15)" }}>
        <div className="flex flex-col justify-between px-8 py-16 md:px-14 md:py-20">
          <div>
            <p className="text-[11px] tracking-[0.28em] uppercase" style={{ color: accent }}>
              Issue nº 07 — Spring
            </p>
            <h1
              style={{ fontFamily: "var(--font-display)" }}
              className="mt-6 text-[56px] leading-[0.95] md:text-[88px]"
            >
              The candle
              <br />
              <span className="italic">you keep</span>
              <br />
              lighting.
            </h1>
            <p className="mt-8 max-w-md text-[15.5px] leading-[1.7]" style={{ color: "#5A5449" }}>
              Hand-poured in Brooklyn from single-origin coconut wax, tree-stump
              wicks, and absolutes a perfumer would quietly hoard. Seventy-two
              hours of a smaller, warmer room.
            </p>
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a
              className="rounded-full px-6 py-3 text-[13px] tracking-[0.18em] uppercase"
              style={{ backgroundColor: ink, color: bg }}
            >
              Shop the collection — $48
            </a>
            <a className="text-[13px] tracking-[0.18em] uppercase underline underline-offset-4">
              Read the issue
            </a>
          </div>
        </div>
        <div className="relative min-h-[520px]">
          <img
            src={seed("mothlight", 1, 1200, 1400)}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div
            className="absolute bottom-6 left-6 rounded-sm px-3 py-2 font-mono text-[10px] tracking-[0.2em] uppercase"
            style={{ backgroundColor: bg, color: ink }}
          >
            Photo — Elle Ogawa, March 2026
          </div>
        </div>
      </section>

      {/* Ingredients row */}
      <section className="border-t px-8 py-20 md:px-14" style={{ borderColor: "rgba(42,39,34,0.15)" }}>
        <div className="grid gap-10 md:grid-cols-[0.9fr_2fr]">
          <div>
            <p className="text-[11px] tracking-[0.28em] uppercase" style={{ color: accent }}>
              The formula
            </p>
            <h2
              style={{ fontFamily: "var(--font-display)" }}
              className="mt-3 text-[36px] leading-[1.05] md:text-[44px]"
            >
              Seven notes, no
              <br />
              <span className="italic">mystery tax.</span>
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-x-10 gap-y-8 md:grid-cols-3">
            {[
              { n: "01", t: "Coconut wax", d: "Single-origin, food-grade, zero paraffin." },
              { n: "02", t: "Bergamot", d: "Cold-pressed, Calabrian, 11% of blend." },
              { n: "03", t: "Rose absolute", d: "Grasse harvest, shared with a perfumer." },
              { n: "04", t: "Oud", d: "Sustainable cultivation, laos-sourced." },
              { n: "05", t: "Smoked vetiver", d: "Haitian roots, burnt over cedar." },
              { n: "06", t: "Tonka", d: "Sweetens the back, never the front." },
            ].map((i) => (
              <div key={i.n}>
                <p className="font-mono text-[11px]" style={{ color: accent }}>{i.n}</p>
                <p className="mt-2 text-[16px] italic" style={{ fontFamily: "var(--font-display)" }}>
                  {i.t}
                </p>
                <p className="mt-2 text-[13.5px] leading-[1.6]" style={{ color: "#5A5449" }}>
                  {i.d}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Review carousel */}
      <section
        className="border-t px-8 py-20 md:px-14"
        style={{ borderColor: "rgba(42,39,34,0.15)", backgroundColor: "#EBE3D2" }}
      >
        <div className="mx-auto max-w-5xl">
          <p className="text-[11px] tracking-[0.28em] uppercase" style={{ color: accent }}>
            From your inbox, redacted
          </p>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {[
              {
                q: "I bought one, then four more for friends who smelled it at my apartment.",
                a: "— Maria R., Queens",
              },
              {
                q: "Smells the way a library does after rain. I will keep re-buying this.",
                a: "— Joon H., San Francisco",
              },
              {
                q: "Finally a candle that doesn't announce itself. Just warms the room.",
                a: "— Dahlia W., Antwerp",
              },
            ].map((r, i) => (
              <figure key={i}>
                <blockquote
                  style={{ fontFamily: "var(--font-display)" }}
                  className="text-[22px] leading-[1.3] italic"
                >
                  “{r.q}”
                </blockquote>
                <figcaption className="mt-4 font-mono text-[11px] tracking-[0.2em] uppercase" style={{ color: "#5A5449" }}>
                  {r.a}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t px-8 py-20 md:px-14" style={{ borderColor: "rgba(42,39,34,0.15)" }}>
        <div className="mx-auto grid max-w-5xl gap-12 md:grid-cols-[1fr_1.4fr]">
          <h2
            style={{ fontFamily: "var(--font-display)" }}
            className="text-[36px] leading-[1.05]"
          >
            A short list of
            <br />
            <span className="italic">reasonable</span> questions.
          </h2>
          <dl className="divide-y" style={{ borderColor: "rgba(42,39,34,0.15)" }}>
            {[
              ["How long does one burn?", "72 hours. Trim the wick to a quarter inch and it'll reward you with 80."],
              ["Do you ship internationally?", "Yes — EU, UK, Japan and Australia. Free over $95."],
              ["Is this really a candle or a perfume?", "Both. We blend it with a perfumer, not a soap-maker."],
              ["Refill?", "Yes. $28. Your vessel stays yours."],
            ].map(([q, a]) => (
              <div key={q} className="grid grid-cols-[auto_1fr] gap-8 py-6">
                <span className="font-mono text-[11px]" style={{ color: accent }}>Q.</span>
                <div>
                  <dt className="text-[17px]" style={{ fontFamily: "var(--font-display)" }}>{q}</dt>
                  <dd className="mt-2 text-[14px] leading-[1.65]" style={{ color: "#5A5449" }}>{a}</dd>
                </div>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <footer
        className="border-t px-8 py-12 md:px-14"
        style={{ borderColor: "rgba(42,39,34,0.15)" }}
      >
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4">
          <span style={{ fontFamily: "var(--font-display)" }} className="text-[22px] italic">
            Mothlight
          </span>
          <span className="font-mono text-[11px] tracking-[0.2em] uppercase" style={{ color: "#5A5449" }}>
            77 Union Ave · Brooklyn NY · est 2024
          </span>
        </div>
      </footer>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*  Template 3 — Course / Cohort (warm editorial)                             */
/* -------------------------------------------------------------------------- */

const CohortCourseTemplate: React.FC = () => {
  const bg = "#F7F2E7";
  const ink = "#1C1C1A";
  const accent = "#1F3A2F";
  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: bg, color: ink }}>
      <nav className="flex items-center justify-between px-8 py-5 md:px-12">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full" style={{ backgroundColor: accent }} />
          <span style={{ fontFamily: "var(--font-display)" }} className="text-[20px]">
            The Practice
          </span>
        </div>
        <div className="hidden gap-8 text-[13px] md:flex">
          <a>Syllabus</a>
          <a>Instructor</a>
          <a>Alumni</a>
          <a>FAQ</a>
        </div>
        <a
          className="rounded-full px-4 py-2 text-[12px] font-medium tracking-wide"
          style={{ backgroundColor: ink, color: bg }}
        >
          Apply · cohort 09
        </a>
      </nav>

      <section className="px-8 pt-16 pb-20 md:px-12 md:pt-24 md:pb-28">
        <div className="mx-auto grid max-w-6xl gap-14 md:grid-cols-[1.5fr_1fr] md:items-end">
          <div>
            <p className="font-mono text-[11px] tracking-[0.22em] uppercase" style={{ color: accent }}>
              A 6-week cohort for working writers
            </p>
            <h1
              style={{ fontFamily: "var(--font-display)" }}
              className="mt-5 text-[52px] leading-[0.98] md:text-[84px]"
            >
              Write <span className="italic">like</span>
              <br />
              someone
              <br />
              is reading.
            </h1>
            <p className="mt-8 max-w-lg text-[16px] leading-[1.7]" style={{ color: "#4A463D" }}>
              Six weeks. Forty-eight writers. One editor who has seen your
              first page and didn't flinch. Live feedback on every piece.
              Starts June 3.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <a
                className="rounded-full px-6 py-3 text-[14px] font-medium"
                style={{ backgroundColor: accent, color: bg }}
              >
                Reserve a seat — $890
              </a>
              <span className="text-[13px]" style={{ color: "#4A463D" }}>
                9 of 48 seats left · rolling admission
              </span>
            </div>
          </div>
          <div className="relative">
            <div
              className="relative aspect-[4/5] overflow-hidden rounded-sm"
              style={{ boxShadow: "0 24px 48px rgba(28,28,26,0.18)" }}
            >
              <img
                src={seed("cohort", 2, 720, 900)}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            <div
              className="absolute -bottom-4 -left-4 rotate-[-1.4deg] rounded-sm px-4 py-3"
              style={{ backgroundColor: "#E8C77F" }}
            >
              <p className="font-mono text-[10px] tracking-[0.2em] uppercase">Instructor</p>
              <p style={{ fontFamily: "var(--font-display)" }} className="text-[18px] italic">
                Iris Holloway
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Syllabus */}
      <section className="border-t px-8 py-20 md:px-12" style={{ borderColor: "rgba(28,28,26,0.12)" }}>
        <div className="mx-auto max-w-6xl">
          <div className="flex items-end justify-between">
            <h2 style={{ fontFamily: "var(--font-display)" }} className="text-[36px] md:text-[48px]">
              The six weeks
            </h2>
            <span className="font-mono text-[11px] tracking-[0.2em] uppercase" style={{ color: accent }}>
              ~6 hrs / week
            </span>
          </div>
          <div className="mt-10 divide-y" style={{ borderColor: "rgba(28,28,26,0.12)" }}>
            {[
              { w: "Week 1", t: "Sentences", d: "Short, declarative, and only the ones that earn their place." },
              { w: "Week 2", t: "Voice", d: "Finding the voice you already have, and stopping it from apologizing." },
              { w: "Week 3", t: "Structure", d: "Essays, memos, and why a long thing is just many short things." },
              { w: "Week 4", t: "Editing", d: "Cut 30%. Then cut 10% more. Then put one of them back." },
              { w: "Week 5", t: "Distribution", d: "Who you write for, and how you get it in front of them honestly." },
              { w: "Week 6", t: "A final piece", d: "Publish under your own name. Defend it in class." },
            ].map((w) => (
              <div key={w.w} className="grid grid-cols-[auto_1fr_2fr] items-start gap-6 py-6">
                <span className="font-mono text-[11px] tracking-[0.2em] uppercase" style={{ color: accent }}>{w.w}</span>
                <span
                  style={{ fontFamily: "var(--font-display)" }}
                  className="text-[22px] italic"
                >
                  {w.t}
                </span>
                <span className="text-[14.5px] leading-[1.65]" style={{ color: "#4A463D" }}>
                  {w.d}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial wall */}
      <section
        className="border-t px-8 py-20 md:px-12"
        style={{ borderColor: "rgba(28,28,26,0.12)", backgroundColor: "#EFE7D3" }}
      >
        <div className="mx-auto max-w-6xl">
          <p className="font-mono text-[11px] tracking-[0.22em] uppercase" style={{ color: accent }}>
            From cohort 08
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              { q: "I stopped writing like a committee.", a: "Nina, product writer" },
              { q: "The first time a draft of mine got published at work.", a: "Kofi, researcher" },
              { q: "Iris told me to cut a paragraph I loved. She was right.", a: "Mei, founder" },
              { q: "My substack went from 80 to 2,400 during the cohort.", a: "Sam, essayist" },
              { q: "It's the only class I have ever re-taken. On purpose.", a: "Dev, designer" },
              { q: "Worth three books I was never going to read.", a: "Leila, PM" },
            ].map((t, i) => (
              <div key={i} className="border border-black/10 bg-white/60 p-5">
                <p style={{ fontFamily: "var(--font-display)" }} className="text-[17px] italic leading-[1.35]">
                  “{t.q}”
                </p>
                <p className="mt-4 font-mono text-[10.5px] tracking-[0.18em] uppercase" style={{ color: "#4A463D" }}>
                  {t.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="border-t px-8 py-20 md:px-12" style={{ borderColor: "rgba(28,28,26,0.12)" }}>
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2">
          {[
            {
              n: "Self-paced",
              p: "$390",
              d: "Lectures + readings + exercises, on your own clock.",
              feat: ["6 weeks of material", "Workbook PDFs", "Alumni library access"],
            },
            {
              n: "Cohort",
              p: "$890",
              d: "With Iris, live, plus the Tuesday group edit.",
              feat: ["48-person cohort", "Live feedback on 3 pieces", "Final reading + certificate"],
              hot: true,
            },
          ].map((p) => (
            <div
              key={p.n}
              className="rounded-sm border p-8"
              style={{
                borderColor: p.hot ? accent : "rgba(28,28,26,0.18)",
                backgroundColor: p.hot ? "#FAF6ED" : "transparent",
              }}
            >
              <p className="font-mono text-[11px] tracking-[0.2em] uppercase" style={{ color: p.hot ? accent : "#4A463D" }}>
                {p.n}
              </p>
              <div className="mt-4 flex items-end gap-2">
                <span style={{ fontFamily: "var(--font-display)" }} className="text-[44px] leading-none">
                  {p.p}
                </span>
                <span className="pb-1 font-mono text-[11px] tracking-[0.18em] uppercase" style={{ color: "#4A463D" }}>
                  one time
                </span>
              </div>
              <p className="mt-3 text-[14px]" style={{ color: "#4A463D" }}>
                {p.d}
              </p>
              <ul className="mt-6 space-y-2 text-[14px]">
                {p.feat.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span style={{ color: accent }}>—</span>
                    {f}
                  </li>
                ))}
              </ul>
              <a
                className="mt-7 inline-block rounded-full px-5 py-2 text-[13px]"
                style={{
                  backgroundColor: p.hot ? ink : "transparent",
                  color: p.hot ? bg : ink,
                  border: p.hot ? "none" : "1px solid rgba(28,28,26,0.35)",
                }}
              >
                {p.hot ? "Apply to cohort 09" : "Enroll self-paced"}
              </a>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t px-8 py-10 md:px-12" style={{ borderColor: "rgba(28,28,26,0.12)" }}>
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <span style={{ fontFamily: "var(--font-display)" }} className="text-[20px] italic">
            The Practice
          </span>
          <span className="font-mono text-[10.5px] tracking-[0.2em] uppercase" style={{ color: "#4A463D" }}>
            Est. 2022 · Independent, reader-funded
          </span>
        </div>
      </footer>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*  Template 4 — Newsletter (personality-driven)                              */
/* -------------------------------------------------------------------------- */

const NewsletterTemplate: React.FC = () => {
  const bg = "#FFF6E3";
  const ink = "#1B1A17";
  const accent = "#C54B2A";
  return (
    <div className="min-h-screen" style={{ backgroundColor: bg, color: ink }}>
      <nav className="flex items-center justify-between border-b px-8 py-4 md:px-12" style={{ borderColor: "rgba(27,26,23,0.12)" }}>
        <div className="flex items-center gap-3">
          <span
            style={{ fontFamily: "var(--font-display)" }}
            className="text-[22px] italic tracking-tight"
          >
            Bright Idiot
          </span>
          <span className="font-mono text-[10px] tracking-[0.22em] uppercase" style={{ color: accent }}>
            a weekly newsletter
          </span>
        </div>
        <div className="hidden gap-6 text-[13px] md:flex">
          <a>Archive</a>
          <a>About</a>
          <a>Subscribe</a>
        </div>
      </nav>

      <section className="px-8 pt-14 pb-20 md:px-12 md:pt-20 md:pb-28">
        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[1.35fr_1fr] md:items-end">
          <div>
            <p className="font-mono text-[11px] tracking-[0.22em] uppercase" style={{ color: accent }}>
              Issue 164 lands Sunday 7am
            </p>
            <h1
              style={{ fontFamily: "var(--font-display)" }}
              className="mt-4 text-[52px] leading-[0.96] md:text-[88px]"
            >
              Smart things,
              <br />
              explained by a
              <br />
              <span className="italic">bright idiot.</span>
            </h1>
            <p className="mt-7 max-w-lg text-[16px] leading-[1.7]" style={{ color: "#4A463D" }}>
              One long email every Sunday about whatever technology, media, or
              small cultural fire I could not get out of my head that week.
              38,214 readers including maybe your boss.
            </p>
            <form className="mt-9 flex max-w-md gap-2">
              <input
                defaultValue="your@email.com"
                className="flex-1 border bg-white/60 px-4 py-3 text-[14px] outline-none"
                style={{ borderColor: "rgba(27,26,23,0.25)" }}
              />
              <button
                type="button"
                className="px-5 py-3 text-[13px] font-medium tracking-wide"
                style={{ backgroundColor: ink, color: bg }}
              >
                Subscribe
              </button>
            </form>
            <p className="mt-3 font-mono text-[10.5px] tracking-[0.18em] uppercase" style={{ color: "#7A7468" }}>
              Free · no paywall · unsubscribe at the top of every email
            </p>
          </div>

          <div className="relative">
            <div
              className="relative ml-auto h-72 w-72 rotate-[-3deg] overflow-hidden rounded-sm md:h-[420px] md:w-[340px]"
              style={{ boxShadow: "0 22px 40px rgba(28,28,26,0.22)" }}
            >
              <img src={seed("newsletter", 3, 600, 760)} alt="" className="h-full w-full object-cover grayscale" />
            </div>
            <div
              className="absolute -left-4 top-6 rotate-[4deg] px-3 py-1.5 font-mono text-[10px] tracking-[0.2em] uppercase"
              style={{ backgroundColor: accent, color: bg }}
            >
              The author, allegedly
            </div>
          </div>
        </div>
      </section>

      {/* Notable subs */}
      <section className="border-t px-8 py-12 md:px-12" style={{ borderColor: "rgba(27,26,23,0.12)" }}>
        <div className="mx-auto max-w-6xl">
          <p className="font-mono text-[11px] tracking-[0.22em] uppercase" style={{ color: accent }}>
            Readers you might know
          </p>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {[
              { n: "Anand Giridharadas", t: "author, The Ink" },
              { n: "Casey Newton", t: "Platformer" },
              { n: "Rusty Foster", t: "Today in Tabs" },
            ].map((r) => (
              <div key={r.n} className="flex items-center gap-3">
                <div
                  className="h-12 w-12 rounded-full"
                  style={{
                    background:
                      "radial-gradient(circle at 30% 30%, #E8C77F, #C54B2A 70%)",
                  }}
                />
                <div>
                  <p style={{ fontFamily: "var(--font-display)" }} className="text-[17px] italic">
                    {r.n}
                  </p>
                  <p className="font-mono text-[10.5px] tracking-[0.18em] uppercase" style={{ color: "#7A7468" }}>
                    {r.t}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sample issue */}
      <section className="border-t px-8 py-20 md:px-12" style={{ borderColor: "rgba(27,26,23,0.12)" }}>
        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[1fr_1.6fr]">
          <div>
            <p className="font-mono text-[11px] tracking-[0.22em] uppercase" style={{ color: accent }}>
              A recent issue
            </p>
            <h2 style={{ fontFamily: "var(--font-display)" }} className="mt-3 text-[36px] leading-[1.05]">
              Issue 161 —<br />
              <span className="italic">The friend-group economy.</span>
            </h2>
            <p className="mt-4 text-[14px] leading-[1.7]" style={{ color: "#4A463D" }}>
              4,200 words. 18-min read. 9,300 opens so far.
            </p>
          </div>
          <article
            className="rounded-sm border bg-white/70 p-8 md:p-10"
            style={{ borderColor: "rgba(27,26,23,0.15)" }}
          >
            <p className="font-mono text-[11px] tracking-[0.18em] uppercase" style={{ color: accent }}>
              Bright Idiot / Issue 161 / Sun Apr 7
            </p>
            <h3 style={{ fontFamily: "var(--font-display)" }} className="mt-3 text-[28px] leading-[1.15]">
              My group chat is a media company, and I refuse to acknowledge it.
            </h3>
            <p className="mt-5 text-[15px] leading-[1.7]" style={{ color: "#2F2C27" }}>
              Eleven people I met, in some order, at the backs of weddings. A
              steady drip of links, hot takes, and voice notes in two dialects
              of sarcasm. We have a shared Notes doc for restaurants with the
              word "tasting" in the name. We have, it turns out, a brand. I
              cannot escape what we have built, but I can describe it — badly —
              for you …
            </p>
            <a className="mt-6 inline-block font-mono text-[12px] tracking-[0.2em] uppercase underline underline-offset-4" style={{ color: accent }}>
              Read the full issue →
            </a>
          </article>
        </div>
      </section>

      <footer className="border-t px-8 py-10 md:px-12" style={{ borderColor: "rgba(27,26,23,0.12)" }}>
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <span style={{ fontFamily: "var(--font-display)" }} className="text-[20px] italic">
            Bright Idiot
          </span>
          <span className="font-mono text-[10.5px] tracking-[0.2em] uppercase" style={{ color: "#7A7468" }}>
            Written by J. Marlowe · reader-supported since 2021
          </span>
        </div>
      </footer>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*  Template 5 — Agency / studio portfolio (bold, asymmetric)                 */
/* -------------------------------------------------------------------------- */

const AgencyStudioTemplate: React.FC = () => {
  const bg = "#EEEBE4";
  const ink = "#111110";
  const accent = "#FF4A1C";
  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: bg, color: ink }}>
      <nav className="flex items-center justify-between px-8 py-5 md:px-14">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-[12px] tracking-[0.22em] uppercase">Unit ∕</span>
          <span style={{ fontFamily: "var(--font-display)" }} className="text-[20px]">
            Practice
          </span>
        </div>
        <div className="hidden gap-10 text-[12px] tracking-[0.22em] uppercase md:flex">
          <a>Work</a>
          <a>About</a>
          <a>Writing</a>
          <a>Contact</a>
        </div>
      </nav>

      {/* Massive asymmetric hero */}
      <section className="relative px-8 pt-20 pb-32 md:px-14 md:pt-32 md:pb-40">
        <p className="font-mono text-[11px] tracking-[0.28em] uppercase" style={{ color: accent }}>
          Independent design studio · est 2019
        </p>
        <h1
          style={{ fontFamily: "var(--font-display)" }}
          className="mt-6 text-[72px] leading-[0.9] tracking-[-0.03em] md:text-[180px]"
        >
          Brands
          <br />
          <span style={{ color: accent }}>built</span> to
          <br />
          <span className="ml-[12%] italic">out-</span>
          <span className="ml-[4%] italic">last</span>
          <br />
          the round.
        </h1>
        <div className="mt-14 grid gap-6 md:grid-cols-[1.1fr_1fr]">
          <p className="max-w-lg text-[17px] leading-[1.6]" style={{ color: "#454540" }}>
            We're a five-person design practice in Brooklyn working on identity,
            product, and marketing systems for operator-led companies. Boring
            industries welcome. Good taste required.
          </p>
          <div
            className="flex flex-col items-start justify-end gap-2 border-l pl-6"
            style={{ borderColor: "rgba(17,17,16,0.2)" }}
          >
            <span className="font-mono text-[11px] tracking-[0.22em] uppercase" style={{ color: "#45453F" }}>
              Currently booking
            </span>
            <span style={{ fontFamily: "var(--font-display)" }} className="text-[28px] italic">
              Q3 2026 →
            </span>
            <a
              className="mt-3 rounded-full px-4 py-2 text-[12px] tracking-[0.18em] uppercase"
              style={{ backgroundColor: ink, color: bg }}
            >
              Start a project
            </a>
          </div>
        </div>
      </section>

      {/* Client ticker */}
      <section
        className="border-y px-8 py-4 md:px-14"
        style={{ borderColor: "rgba(17,17,16,0.2)", backgroundColor: ink, color: bg }}
      >
        <div className="flex flex-wrap items-center gap-x-10 gap-y-3">
          {[
            "STRIPE",
            "DEEL",
            "ATLAS/OS",
            "OFFLINE",
            "MIDORI",
            "NORTHWIND",
            "BREAK/FIX",
            "HAVEN",
            "PARADE",
            "KITCHEN",
          ].map((c) => (
            <span key={c} className="font-mono text-[13px] tracking-[0.22em]">
              {c}
            </span>
          ))}
        </div>
      </section>

      {/* Case snippets */}
      <section className="px-8 py-24 md:px-14">
        <div className="mb-12 flex items-end justify-between">
          <h2 style={{ fontFamily: "var(--font-display)" }} className="text-[40px] md:text-[56px]">
            Selected work
          </h2>
          <span className="font-mono text-[11px] tracking-[0.22em] uppercase" style={{ color: "#45453F" }}>
            2021 — 2026
          </span>
        </div>
        <div className="grid gap-10 md:grid-cols-[1.3fr_1fr]">
          <article
            className="relative overflow-hidden rounded-sm"
            style={{ backgroundColor: "#D2CEC2" }}
          >
            <img src={seed("agency", 4, 1100, 800)} alt="" className="h-[420px] w-full object-cover md:h-[560px]" />
            <div className="p-6 md:p-8">
              <p className="font-mono text-[11px] tracking-[0.22em] uppercase" style={{ color: accent }}>
                Identity · web · print
              </p>
              <h3 style={{ fontFamily: "var(--font-display)" }} className="mt-2 text-[32px] md:text-[44px] leading-[1]">
                Offline — a field manual for a smarter phone.
              </h3>
              <p className="mt-3 max-w-lg text-[14.5px] leading-[1.6]" style={{ color: "#45453F" }}>
                We rebuilt the system that carries Offline from launch to Series
                A — including the type, the packaging, and the awkward parent
                conversations.
              </p>
            </div>
          </article>
          <div className="flex flex-col gap-10">
            {[
              {
                t: "Atlas/OS — developer brand refresh",
                tag: "Identity · narrative",
              },
              {
                t: "Midori — beauty line launch",
                tag: "E-commerce · packaging",
              },
              {
                t: "Break/Fix — service playbook",
                tag: "Systems · print",
              },
            ].map((c, i) => (
              <a key={c.t} className="group block">
                <div className="relative overflow-hidden rounded-sm">
                  <img src={seed("agency-case", 10 + i, 800, 540)} alt="" className="h-60 w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" />
                </div>
                <p className="mt-3 font-mono text-[11px] tracking-[0.22em] uppercase" style={{ color: accent }}>
                  {c.tag}
                </p>
                <h4
                  style={{ fontFamily: "var(--font-display)" }}
                  className="mt-1 text-[22px] leading-[1.2]"
                >
                  {c.t}
                </h4>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section
        className="px-8 py-20 md:px-14"
        style={{ backgroundColor: ink, color: bg }}
      >
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="font-mono text-[11px] tracking-[0.22em] uppercase" style={{ color: accent }}>
              Contact
            </p>
            <h2
              style={{ fontFamily: "var(--font-display)" }}
              className="mt-4 text-[44px] leading-[1] md:text-[72px]"
            >
              Send a scrappy
              <br />
              <span className="italic">first email.</span>
            </h2>
            <p className="mt-4 max-w-md text-[15px] leading-[1.6]" style={{ color: "#B9B7B0" }}>
              We reply inside 48 hours during business days. Shorter emails get
              faster replies, always.
            </p>
          </div>
          <div className="flex flex-col justify-between gap-6">
            <div className="space-y-2">
              <p className="font-mono text-[11px] tracking-[0.22em] uppercase" style={{ color: "#B9B7B0" }}>
                Email
              </p>
              <a style={{ fontFamily: "var(--font-display)" }} className="text-[22px] italic underline underline-offset-4">
                hello@unit-practice.co
              </a>
            </div>
            <div className="space-y-2">
              <p className="font-mono text-[11px] tracking-[0.22em] uppercase" style={{ color: "#B9B7B0" }}>
                Studio
              </p>
              <p className="text-[14px]">
                68 Jay St, 4th floor — DUMBO, NY
              </p>
            </div>
            <a
              className="inline-block self-start rounded-full px-5 py-2.5 text-[13px] tracking-[0.18em] uppercase"
              style={{ backgroundColor: accent, color: "#111" }}
            >
              Start a project →
            </a>
          </div>
        </div>
      </section>

      <footer className="px-8 py-6 md:px-14" style={{ backgroundColor: ink, color: "#6E6D68", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-[11px] tracking-[0.2em] uppercase">
          <span>© Unit Practice 2026</span>
          <span>Five people · five fewer managers</span>
        </div>
      </footer>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*  Template 6 — Local service (neighborhood plumber, utilitarian warm)       */
/* -------------------------------------------------------------------------- */

const LocalServiceTemplate: React.FC = () => {
  const bg = "#FBF3E2";
  const ink = "#23201A";
  const accent = "#2F5E4E";
  const clay = "#C85A3F";
  return (
    <div className="min-h-screen" style={{ backgroundColor: bg, color: ink }}>
      {/* Top service bar */}
      <div
        className="flex flex-wrap items-center justify-between gap-3 px-6 py-2 text-[12px] md:px-10"
        style={{ backgroundColor: accent, color: "#F6EFDB" }}
      >
        <span className="font-mono tracking-wide">☎ 24/7 emergency · (718) 555-0198</span>
        <span className="font-mono tracking-wide">Mon–Sat 7a–7p · Sun on-call</span>
      </div>

      <nav className="flex items-center justify-between border-b px-6 py-4 md:px-10" style={{ borderColor: "rgba(35,32,26,0.15)" }}>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: clay, color: "#FBF3E2" }}>
            <span className="font-mono text-[14px] font-bold">H</span>
          </div>
          <div>
            <p style={{ fontFamily: "var(--font-display)" }} className="text-[18px] leading-none">Hollister & Sons</p>
            <p className="font-mono text-[10px] tracking-[0.22em] uppercase" style={{ color: "#6A6357" }}>
              Plumbing · Heat · Since 1987
            </p>
          </div>
        </div>
        <div className="hidden gap-7 text-[13px] md:flex">
          <a>Services</a>
          <a>Pricing</a>
          <a>Neighborhoods</a>
          <a>Reviews</a>
        </div>
        <a
          className="rounded-sm px-4 py-2 text-[12px] tracking-wide"
          style={{ backgroundColor: clay, color: "#FBF3E2" }}
        >
          Book a visit
        </a>
      </nav>

      <section className="px-6 pt-14 pb-20 md:px-10">
        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[1.2fr_1fr] md:items-center">
          <div>
            <p className="font-mono text-[11px] tracking-[0.22em] uppercase" style={{ color: clay }}>
              Serving Cobble Hill · Carroll Gardens · Park Slope
            </p>
            <h1
              style={{ fontFamily: "var(--font-display)" }}
              className="mt-4 text-[52px] leading-[1] md:text-[84px]"
            >
              The kind of plumber
              <br />
              your <span className="italic">grandmother</span>
              <br />
              still calls.
            </h1>
            <p className="mt-7 max-w-lg text-[16px] leading-[1.7]" style={{ color: "#45413A" }}>
              Three generations of Hollisters have been unclogging Brooklyn
              drains before your coffee gets cold. Flat-rate quotes, on-time
              techs, and we clean up the mess your last guy made.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                className="rounded-sm px-5 py-3 text-[14px] font-medium"
                style={{ backgroundColor: clay, color: "#FBF3E2" }}
              >
                Book next-day visit
              </a>
              <a
                className="rounded-sm border px-5 py-3 text-[14px]"
                style={{ borderColor: "rgba(35,32,26,0.3)" }}
              >
                Call (718) 555-0198
              </a>
            </div>
          </div>

          {/* Card — hours + address + photo */}
          <div
            className="relative rounded-sm p-5"
            style={{ backgroundColor: "#F2E9CF", boxShadow: "0 12px 28px rgba(35,32,26,0.12)" }}
          >
            <div className="overflow-hidden rounded-sm">
              <img src={seed("hollister", 5, 800, 520)} alt="" className="h-60 w-full object-cover" />
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div>
                <p className="font-mono text-[10px] tracking-[0.22em] uppercase" style={{ color: accent }}>Shop</p>
                <p style={{ fontFamily: "var(--font-display)" }} className="text-[18px] mt-1">
                  412 Smith Street
                </p>
                <p className="text-[13px]" style={{ color: "#45413A" }}>Brooklyn, NY 11231</p>
              </div>
              <div>
                <p className="font-mono text-[10px] tracking-[0.22em] uppercase" style={{ color: accent }}>Hours</p>
                <p style={{ fontFamily: "var(--font-display)" }} className="text-[18px] mt-1">
                  Mon – Sat
                </p>
                <p className="text-[13px]" style={{ color: "#45413A" }}>7a – 7p, Sun on-call</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services grid */}
      <section className="border-t px-6 py-20 md:px-10" style={{ borderColor: "rgba(35,32,26,0.15)" }}>
        <div className="mx-auto max-w-6xl">
          <h2 style={{ fontFamily: "var(--font-display)" }} className="text-[34px] md:text-[48px]">
            What we fix, what we cost.
          </h2>
          <div className="mt-10 grid gap-0 divide-y divide-x-0 overflow-hidden rounded-sm md:grid-cols-3 md:divide-x md:divide-y-0" style={{ borderTop: "1px solid rgba(35,32,26,0.2)", borderBottom: "1px solid rgba(35,32,26,0.2)" }}>
            {[
              { t: "Clogged drain", p: "from $149", d: "We snake, we camera it, we clean up." },
              { t: "Leaky faucet", p: "from $189", d: "Cartridge or valve, no-mess swap in under an hour." },
              { t: "Water heater", p: "from $1,200", d: "Install includes pan, pipes, 10-yr tank warranty." },
              { t: "Toilet install", p: "from $389", d: "Including haul-away of the old unit." },
              { t: "Boiler tune-up", p: "$239 / yr", d: "Annual check-up that keeps the heat honest." },
              { t: "Emergency callout", p: "$295 + work", d: "Any hour, any day. 45-min response in zone." },
            ].map((s) => (
              <div key={s.t} className="p-6" style={{ borderColor: "rgba(35,32,26,0.2)" }}>
                <p style={{ fontFamily: "var(--font-display)" }} className="text-[22px]">{s.t}</p>
                <p className="mt-2 font-mono text-[13px]" style={{ color: clay }}>{s.p}</p>
                <p className="mt-2 text-[13.5px] leading-[1.6]" style={{ color: "#45413A" }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews + map */}
      <section className="border-t px-6 py-20 md:px-10" style={{ borderColor: "rgba(35,32,26,0.15)", backgroundColor: "#F2E9CF" }}>
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-2">
          <div>
            <p className="font-mono text-[11px] tracking-[0.22em] uppercase" style={{ color: clay }}>
              4.9 stars · 312 reviews on google
            </p>
            <h3 style={{ fontFamily: "var(--font-display)" }} className="mt-3 text-[32px] md:text-[40px] leading-[1.05]">
              Neighbors have
              <br />
              <span className="italic">thoughts.</span>
            </h3>
            <div className="mt-8 space-y-5">
              {[
                ["Showed up 20 minutes early, fixed a 6-year-old leak in 40 min. Charged less than the quote.", "— Nadia on Butler St."],
                ["My mother has been calling them for 30 years. Now I get why.", "— Marcus in Cobble Hill"],
                ["They wore booties over their boots without me asking. Bookmarked.", "— Han on 2nd Place"],
              ].map(([q, a]) => (
                <figure key={q}>
                  <blockquote style={{ fontFamily: "var(--font-display)" }} className="text-[17px] italic leading-[1.45]">
                    “{q}”
                  </blockquote>
                  <figcaption className="mt-1 font-mono text-[10.5px] tracking-[0.2em] uppercase" style={{ color: "#45413A" }}>
                    {a}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
          <div
            className="relative min-h-[360px] overflow-hidden rounded-sm"
            style={{
              backgroundColor: "#E4D9B6",
              backgroundImage:
                "linear-gradient(rgba(35,32,26,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(35,32,26,0.08) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="h-8 w-8 rounded-full ring-4"
                style={{ backgroundColor: clay, boxShadow: "0 0 0 10px rgba(200,90,63,0.15)" }}
              />
            </div>
            <div
              className="absolute bottom-4 left-4 rounded-sm px-3 py-2 font-mono text-[10.5px] tracking-[0.2em] uppercase"
              style={{ backgroundColor: "#FBF3E2" }}
            >
              412 Smith St, Brooklyn
            </div>
          </div>
        </div>
      </section>

      <footer className="px-6 py-8 md:px-10" style={{ backgroundColor: ink, color: "#C8C3B6" }}>
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 font-mono text-[11px] tracking-[0.2em] uppercase">
          <span>Hollister & Sons · Licensed & Insured · NY #76-221</span>
          <span>Español hablado · Family owned · 1987 →</span>
        </div>
      </footer>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*  Template 7 — Fitness program (cinematic, dark, transformation)            */
/* -------------------------------------------------------------------------- */

const FitnessTemplate: React.FC = () => {
  const bg = "#0F0F10";
  const ink = "#F3F0E9";
  const accent = "#FF5736";
  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: bg, color: ink }}>
      <nav className="flex items-center justify-between px-8 py-5 md:px-14">
        <div className="flex items-center gap-2">
          <span style={{ fontFamily: "var(--font-display)" }} className="text-[22px] italic">
            Hardyard
          </span>
        </div>
        <div className="hidden gap-8 text-[12px] tracking-[0.22em] uppercase md:flex" style={{ color: "#A8A59E" }}>
          <a>Program</a>
          <a>Coach</a>
          <a>Results</a>
          <a>FAQ</a>
        </div>
        <a
          className="rounded-full px-4 py-2 text-[12px] tracking-[0.18em] uppercase"
          style={{ backgroundColor: accent, color: "#0F0F10" }}
        >
          Apply now
        </a>
      </nav>

      {/* Hero cinematic */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${seed("hardyard", 6, 1600, 1100)})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "grayscale(0.9) contrast(1.05)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(15,15,16,0.2) 0%, rgba(15,15,16,0.9) 85%)",
          }}
        />
        <div className="relative px-8 pt-28 pb-40 md:px-14 md:pt-36 md:pb-52">
          <div className="mx-auto max-w-5xl">
            <p className="font-mono text-[11px] tracking-[0.28em] uppercase" style={{ color: accent }}>
              A 12-week strength rebuild
            </p>
            <h1
              style={{ fontFamily: "var(--font-display)" }}
              className="mt-5 text-[60px] leading-[0.92] tracking-[-0.02em] md:text-[120px]"
            >
              Train for the body
              <br />
              <span className="italic">you still want</span>
              <br />
              at forty-two.
            </h1>
            <p className="mt-8 max-w-lg text-[17px] leading-[1.6]" style={{ color: "#D3D0C8" }}>
              Twelve weeks. Four sessions a week. One coach who will text you
              the day your form goes sideways. Built for busy humans who used
              to be athletes.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <a
                className="rounded-full px-5 py-3 text-[14px] font-medium"
                style={{ backgroundColor: accent, color: "#0F0F10" }}
              >
                Apply for the May block
              </a>
              <a className="rounded-full border border-white/25 px-5 py-3 text-[14px]">
                See the full curriculum
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Week-by-week */}
      <section className="px-8 py-24 md:px-14" style={{ backgroundColor: "#121214" }}>
        <div className="mx-auto max-w-6xl">
          <p className="font-mono text-[11px] tracking-[0.28em] uppercase" style={{ color: accent }}>
            The curriculum
          </p>
          <h2 style={{ fontFamily: "var(--font-display)" }} className="mt-2 text-[38px] md:text-[52px]">
            Twelve weeks, nothing wasted.
          </h2>
          <div className="mt-10 grid gap-4 md:grid-cols-4">
            {[
              ["Wk 1", "Baseline", "Movement screen + starting numbers."],
              ["Wk 2", "Recondition", "Zone-2 + mobility, low intensity."],
              ["Wk 3", "Build — pull", "Back, grip, carries."],
              ["Wk 4", "Build — push", "Chest, overhead, anterior core."],
              ["Wk 5", "Power base", "Hinges, jumps, intent."],
              ["Wk 6", "Deload", "Easy week, re-test on Friday."],
              ["Wk 7", "Strength", "4×4 scheme, heavier than you think."],
              ["Wk 8", "Strength II", "Top sets, volume stays."],
              ["Wk 9", "Conditioning", "8-min EMOMs, zone-4 finishers."],
              ["Wk 10", "Peak", "Heavy singles, tested."],
              ["Wk 11", "Taper", "Volume down, intent up."],
              ["Wk 12", "Retest", "Compare numbers, plan what's next."],
            ].map(([w, t, d], i) => (
              <div
                key={w}
                className="rounded-md p-4"
                style={{
                  backgroundColor: "#1A1A1D",
                  border: "1px solid rgba(255,255,255,0.06)",
                  boxShadow: i === 5 || i === 11 ? `inset 2px 0 0 ${accent}` : "none",
                }}
              >
                <p className="font-mono text-[11px] tracking-[0.2em] uppercase" style={{ color: accent }}>
                  {w}
                </p>
                <p className="mt-2 text-[16px] font-medium">{t}</p>
                <p className="mt-1 text-[12.5px] leading-[1.6]" style={{ color: "#9A978F" }}>
                  {d}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coach + results */}
      <section className="px-8 py-24 md:px-14">
        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[1fr_1.3fr]">
          <div className="relative">
            <div className="aspect-[4/5] overflow-hidden">
              <img src={seed("coach", 7, 700, 900)} alt="" className="h-full w-full object-cover grayscale" />
            </div>
            <div
              className="absolute -bottom-3 -left-3 rotate-[-2deg] px-3 py-1.5 font-mono text-[10.5px] tracking-[0.22em] uppercase"
              style={{ backgroundColor: accent, color: "#0F0F10" }}
            >
              Coach · Rae Vuković
            </div>
          </div>
          <div>
            <p className="font-mono text-[11px] tracking-[0.28em] uppercase" style={{ color: accent }}>
              Former D1 — CSCS — 11 yrs coaching
            </p>
            <h3 style={{ fontFamily: "var(--font-display)" }} className="mt-3 text-[34px] md:text-[48px] leading-[1]">
              I will not lie to you about soreness.
            </h3>
            <p className="mt-5 text-[16px] leading-[1.7]" style={{ color: "#C8C5BD" }}>
              Rae has coached 1,400+ athletes in her career, including seven you
              would recognize. Hardyard is her personal program for adults who
              are done being talked down to at the gym.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-6">
              {[
                ["312", "alumni"],
                ["26", "lbs avg fat loss"],
                ["94%", "finish rate"],
              ].map(([n, l]) => (
                <div key={l}>
                  <p style={{ fontFamily: "var(--font-display)" }} className="text-[26px]">
                    {n}
                  </p>
                  <p className="font-mono text-[10.5px] tracking-[0.22em] uppercase" style={{ color: "#8E8A82" }}>
                    {l}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Intake form */}
      <section
        className="px-8 py-20 md:px-14"
        style={{ backgroundColor: "#181819" }}
      >
        <div className="mx-auto max-w-3xl">
          <p className="font-mono text-[11px] tracking-[0.28em] uppercase" style={{ color: accent }}>
            Apply · 2-minute form
          </p>
          <h3 style={{ fontFamily: "var(--font-display)" }} className="mt-2 text-[36px] md:text-[48px] leading-[1.05]">
            One block, twelve people.
            <br />
            <span className="italic">Only.</span>
          </h3>
          <div className="mt-10 grid gap-4">
            {[
              { l: "Name", v: "" },
              { l: "Email", v: "" },
              { l: "What's your primary goal?", v: "" },
              { l: "Current training (last 90 days)", v: "" },
            ].map((f) => (
              <div key={f.l}>
                <label className="font-mono text-[11px] tracking-[0.22em] uppercase" style={{ color: "#8E8A82" }}>
                  {f.l}
                </label>
                <input
                  className="mt-1.5 w-full border-b bg-transparent py-2 text-[15px] outline-none"
                  style={{ borderColor: "rgba(255,255,255,0.15)", color: ink }}
                />
              </div>
            ))}
            <button
              className="mt-6 self-start rounded-full px-6 py-3 text-[14px] font-medium"
              style={{ backgroundColor: accent, color: "#0F0F10" }}
            >
              Apply for the May block →
            </button>
          </div>
        </div>
      </section>

      <footer className="border-t px-8 py-8 md:px-14" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 font-mono text-[11px] tracking-[0.2em] uppercase" style={{ color: "#8E8A82" }}>
          <span>© Hardyard Strength — Brooklyn + remote</span>
          <span>No app · no gimmick</span>
        </div>
      </footer>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*  Template 8 — B2B sales page (enterprise, technical, trust-heavy)          */
/* -------------------------------------------------------------------------- */

const Field = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between rounded-[4px] border px-3 py-2" style={{ borderColor: "rgba(19,20,22,0.12)" }}>
    <span className="font-mono text-[11px] tracking-[0.14em] uppercase" style={{ color: "#55575C" }}>{label}</span>
    <span className="font-mono text-[13px] tabular-nums">{value}</span>
  </div>
);

const B2BSalesTemplate: React.FC = () => {
  const bg = "#FAFAF7";
  const ink = "#131416";
  const brand = "#1A3AC9";
  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: bg, color: ink }}>
      <nav className="flex items-center justify-between border-b px-8 py-4 md:px-12" style={{ borderColor: "rgba(19,20,22,0.1)" }}>
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-[4px]" style={{ backgroundColor: brand, color: "white" }}>
            <span className="font-mono text-[11px] font-bold">L</span>
          </div>
          <span className="text-[15px] font-semibold tracking-tight">Ledgerline</span>
        </div>
        <div className="hidden gap-7 text-[13px] md:flex" style={{ color: "#55575C" }}>
          <a>Platform</a>
          <a>Solutions</a>
          <a>Customers</a>
          <a>Security</a>
          <a>Pricing</a>
          <a>Docs</a>
        </div>
        <div className="flex items-center gap-3">
          <a className="text-[13px]" style={{ color: "#55575C" }}>Sign in</a>
          <a
            className="rounded-[4px] px-3.5 py-1.5 text-[13px] font-medium text-white"
            style={{ backgroundColor: brand }}
          >
            Book a demo
          </a>
        </div>
      </nav>

      {/* Industry badges */}
      <div className="border-b px-8 py-2 md:px-12" style={{ borderColor: "rgba(19,20,22,0.1)", backgroundColor: "#F2F1EC" }}>
        <div className="mx-auto flex max-w-6xl flex-wrap gap-x-4 gap-y-1 text-[11px] font-mono tracking-wide" style={{ color: "#55575C" }}>
          {["Banking", "Insurance", "Supply Chain", "Government", "Telecom"].map((i) => (
            <span key={i} className="rounded-full border px-2.5 py-0.5" style={{ borderColor: "rgba(19,20,22,0.18)" }}>{i}</span>
          ))}
        </div>
      </div>

      {/* Hero */}
      <section className="px-8 pt-16 pb-20 md:px-12 md:pt-24 md:pb-28">
        <div className="mx-auto grid max-w-6xl gap-14 md:grid-cols-[1.1fr_1fr] md:items-center">
          <div>
            <p className="font-mono text-[11px] tracking-[0.18em] uppercase" style={{ color: brand }}>
              Ledger control for large balance sheets
            </p>
            <h1
              style={{ fontFamily: "var(--font-display)" }}
              className="mt-4 text-[46px] leading-[1] md:text-[64px] tracking-tight"
            >
              Close the books 11 days faster, without rewriting them.
            </h1>
            <p className="mt-6 max-w-xl text-[16.5px] leading-[1.65]" style={{ color: "#3C3E43" }}>
              Ledgerline sits beside your GL to reconcile, classify, and audit
              in near-real-time. Used by five of the twenty largest US
              insurers. Read-only by default, write-on-approval.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                className="rounded-[4px] px-5 py-3 text-[14px] font-medium text-white"
                style={{ backgroundColor: brand }}
              >
                Book a 20-min demo
              </a>
              <a className="rounded-[4px] border px-5 py-3 text-[14px]" style={{ borderColor: "rgba(19,20,22,0.25)" }}>
                Download the 2026 ROI report →
              </a>
            </div>

            {/* trust strip */}
            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-[11.5px] font-mono tracking-wide" style={{ color: "#55575C" }}>
              {["SOC 2 Type II", "ISO 27001", "HIPAA", "GDPR", "PCI-DSS L1"].map((b) => (
                <span key={b} className="flex items-center gap-1.5">
                  <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: "#35A27A" }} />
                  {b}
                </span>
              ))}
            </div>
          </div>

          {/* ROI panel */}
          <div
            className="rounded-lg border p-6"
            style={{ borderColor: "rgba(19,20,22,0.12)", backgroundColor: "white", boxShadow: "0 20px 40px rgba(19,20,22,0.06)" }}
          >
            <p className="font-mono text-[11px] tracking-[0.18em] uppercase" style={{ color: brand }}>
              ROI preview · your numbers
            </p>
            <div className="mt-4 space-y-4">
              <Field label="Annual revenue" value="$1.4B" />
              <Field label="Finance team size" value="42 FTE" />
              <Field label="Current close (days)" value="14" />
              <div className="h-px" style={{ backgroundColor: "rgba(19,20,22,0.1)" }} />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-mono text-[10.5px] tracking-[0.18em] uppercase" style={{ color: "#55575C" }}>New close</p>
                  <p style={{ fontFamily: "var(--font-display)" }} className="text-[26px] leading-none">3 days</p>
                </div>
                <div>
                  <p className="font-mono text-[10.5px] tracking-[0.18em] uppercase" style={{ color: "#55575C" }}>Est. annual saved</p>
                  <p style={{ fontFamily: "var(--font-display)" }} className="text-[26px] leading-none" >$4.8M</p>
                </div>
              </div>
            </div>
            <a
              className="mt-6 inline-block w-full rounded-[4px] py-2.5 text-center text-[13px] font-medium text-white"
              style={{ backgroundColor: brand }}
            >
              Get the full report →
            </a>
          </div>
        </div>
      </section>

      {/* Customer logo wall */}
      <section
        className="border-y px-8 py-10 md:px-12"
        style={{ borderColor: "rgba(19,20,22,0.1)", backgroundColor: "#F2F1EC" }}
      >
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-12 gap-y-4">
          <span className="font-mono text-[11px] tracking-[0.2em] uppercase" style={{ color: "#55575C" }}>
            Deployed at
          </span>
          {["NORTHWAY", "SENTINEL", "APEX-RE", "CARON", "BLUEGATE", "KYOMI", "HELIOS"].map((l) => (
            <span key={l} className="font-mono text-[13px] tracking-widest" style={{ color: "#3C3E43" }}>{l}</span>
          ))}
        </div>
      </section>

      {/* Product pillars */}
      <section className="px-8 py-20 md:px-12">
        <div className="mx-auto max-w-6xl">
          <h2 style={{ fontFamily: "var(--font-display)" }} className="text-[34px] md:text-[44px] tracking-tight">
            Purpose-built for finance at scale.
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              {
                t: "Continuous reconciliation",
                d: "Ingests your sub-ledgers at 15-min cadence. Diffs with signed hashes. Auditor-ready.",
              },
              {
                t: "Policy-based classification",
                d: "A rules engine your controllers can actually read. Version-controlled, blameable.",
              },
              {
                t: "Read-only by default",
                d: "Ledgerline never writes unless your team approves. Every write is a signed transaction.",
              },
            ].map((p) => (
              <div
                key={p.t}
                className="rounded-md border p-6"
                style={{ borderColor: "rgba(19,20,22,0.12)", backgroundColor: "white" }}
              >
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-[4px]"
                  style={{ backgroundColor: `${brand}14`, color: brand }}
                >
                  <span className="font-mono text-[12px]">✓</span>
                </div>
                <p className="mt-4 text-[17px] font-semibold tracking-tight">{p.t}</p>
                <p className="mt-2 text-[14px] leading-[1.65]" style={{ color: "#3C3E43" }}>{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote */}
      <section className="border-t px-8 py-20 md:px-12" style={{ borderColor: "rgba(19,20,22,0.1)" }}>
        <div className="mx-auto max-w-4xl">
          <blockquote style={{ fontFamily: "var(--font-display)" }} className="text-[28px] leading-[1.35] md:text-[40px]">
            “We cut our financial close from fourteen days to three, and our
            auditors stopped asking for CSVs.”
          </blockquote>
          <p className="mt-6 font-mono text-[11.5px] tracking-[0.2em] uppercase" style={{ color: "#55575C" }}>
            — Erin Park, SVP Controller, Northway Insurance ($12B AUM)
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="px-8 py-20 md:px-12" style={{ backgroundColor: ink, color: bg }}>
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
          <h3 style={{ fontFamily: "var(--font-display)" }} className="text-[32px] md:text-[48px] leading-[1]">
            Let's put a number on your close.
          </h3>
          <a
            className="rounded-[4px] px-5 py-3 text-[14px] font-medium"
            style={{ backgroundColor: "white", color: ink }}
          >
            Book a 20-min technical demo →
          </a>
        </div>
      </section>

      <footer className="px-8 py-8 md:px-12" style={{ backgroundColor: ink, color: "#8D8E92", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 font-mono text-[11px] tracking-wide">
          <span>© 2026 Ledgerline, Inc. · DUNS 07-441-9823</span>
          <span>Terms · Privacy · Subprocessors · Trust center</span>
        </div>
      </footer>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*  Template 9 — Waitlist / coming soon (minimalist)                          */
/* -------------------------------------------------------------------------- */

const WaitlistTemplate: React.FC = () => {
  const bg = "#F5F1E8";
  const ink = "#111";
  const accent = "#C85A3F";
  return (
    <div
      className="relative flex min-h-screen flex-col"
      style={{
        backgroundColor: bg,
        color: ink,
        backgroundImage: dotGrid,
      }}
    >
      <header className="flex items-center justify-between px-8 py-6 md:px-14">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rotate-45" style={{ backgroundColor: accent }} />
          <span style={{ fontFamily: "var(--font-display)" }} className="text-[18px]">
            Anther
          </span>
        </div>
        <span className="font-mono text-[11px] tracking-[0.22em] uppercase" style={{ color: "#5C5A53" }}>
          Launching · Summer 2026
        </span>
      </header>

      <main className="flex flex-1 items-center justify-center px-8 md:px-14">
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-mono text-[11px] tracking-[0.28em] uppercase" style={{ color: accent }}>
            Private beta opens June 4
          </p>
          <h1
            style={{ fontFamily: "var(--font-display)" }}
            className="mt-6 text-[60px] leading-[0.96] md:text-[104px] tracking-[-0.02em]"
          >
            A quieter place
            <br />
            <span className="italic">to think out loud.</span>
          </h1>
          <p className="mx-auto mt-7 max-w-xl text-[16.5px] leading-[1.65]" style={{ color: "#3F3D37" }}>
            Anther is a long-form writing and reading tool for ideas you don't
            want to post yet. Serif by default. No metrics. Invite-only.
          </p>

          <form className="mx-auto mt-10 flex max-w-lg flex-col gap-3 sm:flex-row">
            <input
              defaultValue="your@email.com"
              className="flex-1 rounded-full border bg-white/60 px-5 py-3 text-[14.5px] outline-none"
              style={{ borderColor: "rgba(17,17,17,0.2)" }}
            />
            <button
              type="button"
              className="rounded-full px-6 py-3 text-[13px] font-medium tracking-wide"
              style={{ backgroundColor: ink, color: bg }}
            >
              Join waitlist
            </button>
          </form>

          {/* countdown */}
          <div className="mx-auto mt-12 flex max-w-md items-center justify-between gap-5 border-t pt-6" style={{ borderColor: "rgba(17,17,17,0.15)" }}>
            {[
              ["32", "days"],
              ["06", "hrs"],
              ["18", "min"],
              ["44", "sec"],
            ].map(([n, l]) => (
              <div key={l}>
                <p style={{ fontFamily: "var(--font-display)" }} className="text-[34px] leading-none tabular-nums">{n}</p>
                <p className="mt-1 font-mono text-[10.5px] tracking-[0.22em] uppercase" style={{ color: "#5C5A53" }}>{l}</p>
              </div>
            ))}
          </div>

          <p className="mt-8 font-mono text-[11px] tracking-[0.2em] uppercase" style={{ color: "#5C5A53" }}>
            2,147 people already on the list
          </p>
        </div>
      </main>

      <footer className="flex items-center justify-between px-8 py-6 md:px-14">
        <span className="font-mono text-[11px] tracking-[0.22em] uppercase" style={{ color: "#5C5A53" }}>
          © Anther Labs · made in Portland
        </span>
        <span className="font-mono text-[11px] tracking-[0.22em] uppercase" style={{ color: "#5C5A53" }}>
          @anther.page
        </span>
      </footer>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*  Template 10 — Job board / community (utilitarian, functional)             */
/* -------------------------------------------------------------------------- */

const JobBoardTemplate: React.FC = () => {
  const bg = "#F6F4EF";
  const ink = "#18181A";
  const accent = "#2A5E4C";
  const alert = "#C14A2E";
  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: bg, color: ink }}>
      <nav className="flex items-center justify-between border-b px-8 py-4 md:px-12" style={{ borderColor: "rgba(24,24,26,0.12)" }}>
        <div className="flex items-center gap-2">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-md font-mono text-[12px] font-bold"
            style={{ backgroundColor: accent, color: bg }}
          >
            W.
          </div>
          <span style={{ fontFamily: "var(--font-display)" }} className="text-[20px]">
            Workshop
          </span>
          <span className="ml-2 font-mono text-[10.5px] tracking-[0.22em] uppercase" style={{ color: "#6A6861" }}>
            jobs + community for builders
          </span>
        </div>
        <div className="hidden gap-7 text-[13px] md:flex">
          <a>Jobs</a>
          <a>Companies</a>
          <a>Community</a>
          <a>About</a>
        </div>
        <a
          className="rounded-md px-4 py-2 text-[12.5px] font-medium"
          style={{ backgroundColor: accent, color: bg }}
        >
          Post a job — $299
        </a>
      </nav>

      {/* Hero + filters */}
      <section className="px-8 pt-14 pb-10 md:px-12 md:pt-20">
        <div className="mx-auto max-w-6xl">
          <p className="font-mono text-[11px] tracking-[0.22em] uppercase" style={{ color: accent }}>
            2,148 jobs · 318 companies · updated 3 min ago
          </p>
          <h1 style={{ fontFamily: "var(--font-display)" }} className="mt-4 text-[52px] leading-[1] md:text-[80px]">
            Small teams
            <br />
            <span className="italic">hiring people</span>
            <br />
            worth hiring.
          </h1>
          <p className="mt-6 max-w-lg text-[16px] leading-[1.7]" style={{ color: "#45443E" }}>
            Workshop is a curated job board for independent software, design,
            and product work. No spam, no unmoderated recruiter dumps — every
            role is reviewed by a human in our Slack.
          </p>

          {/* Search + filters */}
          <div className="mt-10 flex flex-wrap gap-3">
            <div className="flex flex-1 items-center gap-3 rounded-md border bg-white px-4 py-2.5" style={{ borderColor: "rgba(24,24,26,0.15)" }}>
              <span className="font-mono text-[11px] tracking-[0.22em] uppercase" style={{ color: "#6A6861" }}>Search</span>
              <span className="text-[14px] font-medium">Staff product engineer</span>
            </div>
            {["Remote", "Full-time", "Eng", "Design", "Small team"].map((f) => (
              <span
                key={f}
                className="rounded-md border bg-white px-3 py-2.5 text-[12.5px]"
                style={{ borderColor: "rgba(24,24,26,0.15)" }}
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Employer logo strip */}
      <section
        className="border-y px-8 py-6 md:px-12"
        style={{ borderColor: "rgba(24,24,26,0.12)", backgroundColor: "#EEEBE2" }}
      >
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-10 gap-y-3">
          <span className="font-mono text-[11px] tracking-[0.22em] uppercase" style={{ color: "#6A6861" }}>
            Hiring now
          </span>
          {["LINEAR", "ARC", "VERCEL", "RESEND", "WARP", "OPSTACK", "OFFLINE", "PRISM", "MAGIC"].map((c) => (
            <span key={c} className="font-mono text-[12.5px] tracking-widest" style={{ color: "#2A2A27" }}>
              {c}
            </span>
          ))}
        </div>
      </section>

      {/* Jobs list */}
      <section className="px-8 py-14 md:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex items-end justify-between">
            <h2 style={{ fontFamily: "var(--font-display)" }} className="text-[28px] md:text-[36px]">
              Featured roles this week
            </h2>
            <span className="font-mono text-[11px] tracking-[0.22em] uppercase" style={{ color: "#6A6861" }}>
              sort: newest
            </span>
          </div>

          <div className="divide-y rounded-md border bg-white" style={{ borderColor: "rgba(24,24,26,0.15)" }}>
            {[
              { c: "Linear", r: "Staff Product Engineer", t: "Remote · Full-time", s: "$210K–260K + eq", tag: "Eng", hot: true },
              { c: "Resend", r: "Founding Designer", t: "Remote (AMER) · Full-time", s: "$150K–195K + eq", tag: "Design" },
              { c: "Arc", r: "Browser Platform Engineer", t: "NYC hybrid · Full-time", s: "$220K–290K + eq", tag: "Eng" },
              { c: "Offline", r: "Head of Growth", t: "SF · Full-time", s: "$180K–210K + eq", tag: "Growth" },
              { c: "Prism", r: "Senior iOS Engineer", t: "Remote · Contract-to-hire", s: "$160K–200K", tag: "Mobile" },
              { c: "Warp", r: "Developer Advocate", t: "Remote · Full-time", s: "$145K–175K + eq", tag: "DevRel" },
            ].map((j, i) => (
              <div key={i} className="grid grid-cols-[auto_1fr_auto] items-center gap-6 px-5 py-4">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-md font-mono text-[12px]"
                  style={{ backgroundColor: "#EEEBE2", color: "#2A2A27" }}
                >
                  {j.c[0]}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <p className="text-[15px] font-semibold tracking-tight">{j.r}</p>
                    <span
                      className="rounded-full px-2 py-0.5 font-mono text-[10px] tracking-wide uppercase"
                      style={{ backgroundColor: "#EEEBE2", color: "#45443E" }}
                    >
                      {j.tag}
                    </span>
                    {j.hot && (
                      <span
                        className="rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide"
                        style={{ backgroundColor: alert, color: bg }}
                      >
                        Hot
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-[12.5px]" style={{ color: "#6A6861" }}>
                    {j.c} · {j.t}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-[12.5px] tabular-nums">{j.s}</p>
                  <a className="mt-0.5 inline-block text-[11.5px] font-medium underline underline-offset-4" style={{ color: accent }}>
                    Apply →
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <a className="font-mono text-[12px] tracking-[0.22em] uppercase underline underline-offset-4" style={{ color: accent }}>
              See all 2,148 jobs →
            </a>
          </div>
        </div>
      </section>

      {/* Submit CTA */}
      <section
        className="border-t px-8 py-20 md:px-12"
        style={{ borderColor: "rgba(24,24,26,0.12)", backgroundColor: "#1F1F1D", color: bg }}
      >
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1.2fr_1fr] md:items-center">
          <div>
            <p className="font-mono text-[11px] tracking-[0.22em] uppercase" style={{ color: "#C8C3B0" }}>
              Post a role
            </p>
            <h3 style={{ fontFamily: "var(--font-display)" }} className="mt-3 text-[40px] md:text-[56px] leading-[1]">
              $299, no agents, real
              <br />
              humans reading your copy.
            </h3>
            <p className="mt-4 max-w-md text-[15px] leading-[1.7]" style={{ color: "#C8C3B0" }}>
              Each post is live for 30 days, pinned in our Slack for 24 hours,
              and boosted once in the Thursday digest to 84,000 builders.
            </p>
          </div>
          <div className="rounded-md border bg-white/5 p-6" style={{ borderColor: "rgba(255,255,255,0.12)" }}>
            <div className="space-y-3">
              {[
                { l: "Reach", v: "84K builders" },
                { l: "Moderation", v: "Human, 24h" },
                { l: "Duration", v: "30 days" },
                { l: "Boost", v: "1 digest placement" },
              ].map((r) => (
                <div key={r.l} className="flex items-center justify-between text-[14px]">
                  <span className="font-mono text-[11px] tracking-[0.2em] uppercase" style={{ color: "#C8C3B0" }}>
                    {r.l}
                  </span>
                  <span className="font-mono text-[13px]">{r.v}</span>
                </div>
              ))}
            </div>
            <a
              className="mt-6 inline-block w-full rounded-md py-2.5 text-center text-[13px] font-medium"
              style={{ backgroundColor: "#C8E3CE", color: "#15281F" }}
            >
              Post a job — $299 →
            </a>
          </div>
        </div>
      </section>

      <footer className="px-8 py-8 md:px-12" style={{ backgroundColor: ink, color: "#8C8B83" }}>
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 font-mono text-[11px] tracking-[0.2em] uppercase">
          <span>© Workshop · independent since 2022</span>
          <span>RSS · Slack · Newsletter</span>
        </div>
      </footer>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*  Hero JSX snippets — simplified string versions for "copy hero JSX"        */
/* -------------------------------------------------------------------------- */

const heroSrc = (slug: string, title: string) =>
  `<section className="px-8 py-24 md:px-14">
  {/* ${slug} hero */}
  <p className="font-mono text-xs uppercase tracking-[0.22em] text-clay">
    Your eyebrow
  </p>
  <h1 className="mt-4 font-display text-6xl leading-[0.95] md:text-8xl">
    ${title}
  </h1>
  <p className="mt-6 max-w-xl text-base leading-[1.7] text-ink-soft">
    Swap copy with your own. Keep the typographic scale.
  </p>
  <div className="mt-9 flex gap-3">
    <a className="rounded-full bg-ink px-5 py-3 text-sm text-bone">Primary</a>
    <a className="rounded-full border px-5 py-3 text-sm">Secondary</a>
  </div>
</section>`;

const fullSrc = (slug: string, name: string) =>
  `// Full source for "${name}" (${slug})
// The complete JSX lives in src/lib/landing-templates.tsx.
// Drop the Component into any Next.js / React page:
//
//   import { LANDING_TEMPLATES } from "@/lib/landing-templates";
//   const tpl = LANDING_TEMPLATES.find(t => t.slug === "${slug}");
//   return tpl ? <tpl.Component /> : null;
//
// Every template is a pure React.FC with inline styles + Tailwind,
// zero external dependencies beyond React. Copy the component body
// from the repo file and adapt to your project.`;

/* -------------------------------------------------------------------------- */
/*  Registry                                                                  */
/* -------------------------------------------------------------------------- */

export const LANDING_TEMPLATES: LandingTemplate[] = [
  {
    slug: "halon-saas",
    name: "Halon — SaaS launch",
    industryLabel: "SaaS · Developer tool",
    industry: "saas",
    styleTags: ["minimal", "bold", "technical"],
    heroSummary: "Near-black UI with acid-lime accent and a live terminal preview. Type-forward, zero gradients.",
    description:
      "Developer-first SaaS launch page with terminal demo, three feature stats, pricing cards, and a one-line changelog banner.",
    accent: "#CEFF2C",
    lovedCount: 412,
    addedDays: 2,
    Component: SaasLaunchTemplate,
    heroSource: heroSrc("halon-saas", "Ship code faster than your CI can complain."),
    fullSource: fullSrc("halon-saas", "Halon — SaaS launch"),
  },
  {
    slug: "mothlight-dtc",
    name: "Mothlight — DTC candle",
    industryLabel: "DTC · Home fragrance",
    industry: "dtc",
    styleTags: ["editorial", "warm", "cinematic"],
    heroSummary: "Magazine-spread split hero, single-origin ingredient callouts, reader-letter reviews, ten-line FAQ.",
    description:
      "Warm editorial product page that reads like an issue — ingredients grid, quoted reviews, and the kind of footer your aunt keeps.",
    accent: "#8A3B25",
    lovedCount: 624,
    addedDays: 5,
    Component: DtcCandleTemplate,
    heroSource: heroSrc("mothlight-dtc", "The candle you keep lighting."),
    fullSource: fullSrc("mothlight-dtc", "Mothlight — DTC candle"),
  },
  {
    slug: "the-practice-cohort",
    name: "The Practice — Cohort course",
    industryLabel: "Education · Cohort",
    industry: "course",
    styleTags: ["warm", "editorial"],
    heroSummary: "Warm editorial cohort page with instructor stamp, six-week syllabus rows, testimonial grid, two pricing tiers.",
    description:
      "For creators selling writing-adjacent education. Includes stamp-rotated instructor callout and rolling admission counter.",
    accent: "#1F3A2F",
    lovedCount: 271,
    addedDays: 9,
    Component: CohortCourseTemplate,
    heroSource: heroSrc("the-practice-cohort", "Write like someone is reading."),
    fullSource: fullSrc("the-practice-cohort", "The Practice — Cohort course"),
  },
  {
    slug: "bright-idiot-newsletter",
    name: "Bright Idiot — Newsletter",
    industryLabel: "Newsletter · Creator",
    industry: "newsletter",
    styleTags: ["editorial", "warm"],
    heroSummary: "Personality-driven newsletter with tilted author photo, notable-subscriber badges, and an embedded recent issue.",
    description:
      "The most shippable newsletter template here — email capture under the H1, recent issue as a readable card, and socially-loaded proof.",
    accent: "#C54B2A",
    lovedCount: 488,
    addedDays: 12,
    Component: NewsletterTemplate,
    heroSource: heroSrc("bright-idiot-newsletter", "Smart things, explained by a bright idiot."),
    fullSource: fullSrc("bright-idiot-newsletter", "Bright Idiot — Newsletter"),
  },
  {
    slug: "unit-practice-agency",
    name: "Unit Practice — Studio",
    industryLabel: "Agency · Design studio",
    industry: "agency",
    styleTags: ["bold", "editorial"],
    heroSummary: "Massive asymmetric display type, running client ticker strip, one big case image plus three thumbnail snippets, dark contact block.",
    description:
      "For studios ready to turn a 'currently booking' line into real revenue. Swap the four case images and you've got a full rebrand in a weekend.",
    accent: "#FF4A1C",
    lovedCount: 537,
    addedDays: 4,
    Component: AgencyStudioTemplate,
    heroSource: heroSrc("unit-practice-agency", "Brands built to outlast the round."),
    fullSource: fullSrc("unit-practice-agency", "Unit Practice — Studio"),
  },
  {
    slug: "hollister-local",
    name: "Hollister & Sons — Local plumber",
    industryLabel: "Local service · Home",
    industry: "local",
    styleTags: ["warm", "utilitarian"],
    heroSummary: "Warm-paper layout with a sticky phone bar, hours card, flat-rate service grid, a real-looking map pin, and neighbor reviews.",
    description:
      "Utilitarian warm editorial for the real world — plumbers, clinics, small restaurants. Replace pricing rows and you're live.",
    accent: "#C85A3F",
    lovedCount: 198,
    addedDays: 7,
    Component: LocalServiceTemplate,
    heroSource: heroSrc("hollister-local", "The kind of plumber your grandmother still calls."),
    fullSource: fullSrc("hollister-local", "Hollister & Sons"),
  },
  {
    slug: "hardyard-fitness",
    name: "Hardyard — Fitness program",
    industryLabel: "Fitness · Strength",
    industry: "fitness",
    styleTags: ["cinematic", "bold"],
    heroSummary: "Dark cinematic hero over a grayscale lift image, twelve-week deload-aware curriculum grid, coach portrait with stamped name, clean intake form.",
    description:
      "Serious, non-bro fitness aesthetic for coaches selling 12-week blocks. Honest stats, no 'lose 30 lbs in 30 days' nonsense.",
    accent: "#FF5736",
    lovedCount: 346,
    addedDays: 3,
    Component: FitnessTemplate,
    heroSource: heroSrc("hardyard-fitness", "Train for the body you still want at forty-two."),
    fullSource: fullSrc("hardyard-fitness", "Hardyard — Fitness program"),
  },
  {
    slug: "ledgerline-b2b",
    name: "Ledgerline — B2B enterprise",
    industryLabel: "B2B · Enterprise finance",
    industry: "b2b",
    styleTags: ["technical", "minimal"],
    heroSummary: "Enterprise sales page with industry badges, right-rail ROI panel, trust logos, three-pillar product section, single operator quote.",
    description:
      "For teams selling into insurance, banking, or anywhere procurement asks for SOC2 before pricing. Feels like a real enterprise page, not a bootstrap demo.",
    accent: "#1A3AC9",
    lovedCount: 209,
    addedDays: 14,
    Component: B2BSalesTemplate,
    heroSource: heroSrc("ledgerline-b2b", "Close the books 11 days faster."),
    fullSource: fullSrc("ledgerline-b2b", "Ledgerline — B2B enterprise"),
  },
  {
    slug: "anther-waitlist",
    name: "Anther — Waitlist",
    industryLabel: "Waitlist · Pre-launch",
    industry: "waitlist",
    styleTags: ["minimal", "editorial"],
    heroSummary: "Single-screen waitlist with dot-grid background, serif display hero, inline email capture, live countdown strip, and signup count.",
    description:
      "A minimalist, literate waitlist. No hype, no gradient mesh — just a promise and a way to sign up.",
    accent: "#C85A3F",
    lovedCount: 722,
    addedDays: 1,
    Component: WaitlistTemplate,
    heroSource: heroSrc("anther-waitlist", "A quieter place to think out loud."),
    fullSource: fullSrc("anther-waitlist", "Anther — Waitlist"),
  },
  {
    slug: "workshop-jobs",
    name: "Workshop — Jobs + community",
    industryLabel: "Jobs · Community",
    industry: "jobs",
    styleTags: ["utilitarian", "editorial"],
    heroSummary: "Curated job board with search + filter chips, employer logo strip, six-row featured list with hot tags and salary tabulars, post-a-job dark CTA.",
    description:
      "Functional hiring landing for small-team job boards and paid communities. The job list alone is drop-in-ready.",
    accent: "#2A5E4C",
    lovedCount: 184,
    addedDays: 10,
    Component: JobBoardTemplate,
    heroSource: heroSrc("workshop-jobs", "Small teams hiring people worth hiring."),
    fullSource: fullSrc("workshop-jobs", "Workshop — Jobs + community"),
  },
];

/* Lookup helpers */
export const getTemplate = (slug: string) =>
  LANDING_TEMPLATES.find((t) => t.slug === slug);

export const ALL_INDUSTRIES: { key: TemplateIndustry | "all"; label: string }[] =
  [
    { key: "all", label: "All industries" },
    { key: "saas", label: "SaaS" },
    { key: "dtc", label: "DTC" },
    { key: "course", label: "Course" },
    { key: "newsletter", label: "Newsletter" },
    { key: "agency", label: "Agency" },
    { key: "local", label: "Local" },
    { key: "fitness", label: "Fitness" },
    { key: "b2b", label: "B2B" },
    { key: "waitlist", label: "Waitlist" },
    { key: "jobs", label: "Jobs" },
  ];

export const ALL_STYLES: { key: TemplateStyle | "all"; label: string }[] = [
  { key: "all", label: "Any style" },
  { key: "editorial", label: "Editorial" },
  { key: "minimal", label: "Minimal" },
  { key: "bold", label: "Bold" },
  { key: "utilitarian", label: "Utilitarian" },
  { key: "cinematic", label: "Cinematic" },
  { key: "warm", label: "Warm" },
  { key: "technical", label: "Technical" },
  { key: "retro", label: "Retro" },
];
