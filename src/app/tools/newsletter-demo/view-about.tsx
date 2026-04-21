"use client";

import { ArrowRight, Mail } from "lucide-react";
import { PUBLICATION, ISSUES } from "@/lib/data/newsletter-mock";

type NavigateFn = (next: {
  view?: "landing" | "archive" | "issue" | "subscribe" | "about";
  id?: string | null;
}) => void;

const PRESS: Array<{ outlet: string; line: string; date: string }> = [
  {
    outlet: "Hearth Quarterly",
    line: "A quietly essential newsletter for the post-hustle internet.",
    date: "Spring 2025",
  },
  {
    outlet: "The Small Shops Podcast",
    line: "One of the most-forwarded writers in our corner of the internet.",
    date: "Feb 2026",
  },
  {
    outlet: "Craft & Commerce Weekly",
    line: "Jules Marlowe writes the letter I read even when I do not want to read anything.",
    date: "Nov 2025",
  },
  {
    outlet: "Solo Letter",
    line: "Steady, slow, and faintly perfect.",
    date: "Sept 2025",
  },
];

const FAQ: Array<{ q: string; a: string }> = [
  {
    q: "How often will you email me?",
    a: "Once a week, on Sunday morning at 7 a.m. in my time zone. Never more than once a week. Sometimes, on a slow week, zero.",
  },
  {
    q: "Is there a paid version?",
    a: "Yes, quietly. Paid readers get one additional essay a month. The weekly letter is and will remain free.",
  },
  {
    q: "Do you use AI to write the letters?",
    a: "No. Every issue is written by me, drafted ugly and rewritten two or three times, until it sounds right. I spot-check facts with search tools when needed; that is the extent of it.",
  },
  {
    q: "Will you share my email?",
    a: "No. I do not run advertising, do not cross-promote with other newsletters, and do not sell lists. The email goes nowhere except my own sending tool.",
  },
  {
    q: "Can I reply to the newsletter?",
    a: "Please do. I read everything. I answer most of it. Some of the best issues started as a reply to someone else's note.",
  },
  {
    q: "What happens if I unsubscribe?",
    a: "You stop receiving the letter. Nothing else happens. There are no retention emails, no 'are you sure?' popups, no win-back drips.",
  },
];

export function AboutView({ onNavigate }: { onNavigate: NavigateFn }) {
  return (
    <section className="bg-paper">
      {/* Masthead */}
      <div className="relative border-b border-hairline">
        <div className="paper-grain absolute inset-0 pointer-events-none" />
        <div className="relative mx-auto max-w-5xl px-6 pt-20 pb-16 md:px-10 md:pt-24 md:pb-20">
          <span className="font-mono text-[10px] uppercase tracking-[0.26em] text-clay">
            About · the writer, the letter
          </span>
          <h1 className="mt-3 font-display text-[44px] leading-[0.98] tracking-tight text-ink md:text-[72px]">
            The writer, in
            <br />
            <span className="italic text-forest">her own words.</span>
          </h1>

          <div className="mt-12 grid gap-10 md:grid-cols-[auto_1fr] md:items-start">
            <div
              aria-hidden
              className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full font-display text-[40px] italic text-bone shadow-warm-md md:h-36 md:w-36 md:text-[54px]"
              style={{
                background:
                  "radial-gradient(circle at 30% 30%, #E8C77F, #C85A3F 72%)",
              }}
            >
              {PUBLICATION.authorInitials}
            </div>

            <div className="min-w-0 space-y-5 font-display text-[17px] leading-[1.7] text-ink md:text-[19px]">
              <p>
                I am {PUBLICATION.authorName}. I am a writer and an independent
                product maker. I live in a rented apartment above a
                second-hand bookshop. I keep, with decreasing success, a small
                garden on a shared back terrace.
              </p>
              <p>
                I have been writing {PUBLICATION.name} every Sunday morning
                since the autumn of {PUBLICATION.foundedYear}. The readership
                now sits around{" "}
                {PUBLICATION.subscriberCount.toLocaleString()} people, which
                is small enough that I still know many of your names and
                large enough that I feel, most weeks, a genuine
                responsibility to do the work well.
              </p>
              <p className="border-l-2 border-clay pl-5 italic">
                &ldquo;{PUBLICATION.authorManifesto}&rdquo;
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Why I write */}
      <div className="border-b border-hairline bg-bone">
        <div className="mx-auto grid max-w-5xl gap-10 px-6 py-20 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.3fr)] md:px-10 md:py-24">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.26em] text-clay">
              Why I write
            </span>
            <h2 className="mt-3 font-display text-[32px] leading-[1.05] tracking-tight text-ink md:text-[40px]">
              A weekly <span className="italic">argument</span> with myself.
            </h2>
          </div>
          <div className="space-y-5 font-display text-[17px] leading-[1.7] text-ink-soft md:text-[18px]">
            <p>
              I write this letter because writing is the way I work things
              out. If I do not write down what I believe, I do not know what
              I believe. The letter is the thinking, and the thinking is the
              point.
            </p>
            <p>
              The shop I run — a quiet software business with a few hundred
              paying customers — is closely braided with the writing. The
              product exists because readers asked for it. The readers came
              because the writing felt honest. I am not certain I could
              separate the two anymore, and I have stopped trying.
            </p>
            <p>
              I am interested in a specific kind of working life: small,
              deliberate, and on a slower clock than the internet would
              prefer. I write for people who have chosen that life, or are
              considering it, or are recovering from not having chosen it.
              That is, more or less, the whole audience.
            </p>
          </div>
        </div>
      </div>

      {/* Press */}
      <div className="border-b border-hairline">
        <div className="mx-auto max-w-5xl px-6 py-20 md:px-10 md:py-24">
          <span className="font-mono text-[10px] uppercase tracking-[0.26em] text-clay">
            Kind things, elsewhere
          </span>
          <h2 className="mt-3 font-display text-[32px] leading-[1.05] tracking-tight text-ink md:text-[40px]">
            Mentions & <span className="italic">appearances.</span>
          </h2>

          <ul className="mt-10 divide-y divide-hairline border-y border-hairline">
            {PRESS.map((p) => (
              <li
                key={p.outlet}
                className="grid grid-cols-1 items-baseline gap-3 py-6 md:grid-cols-[auto_1fr_auto] md:gap-6"
              >
                <span className="font-display text-[20px] italic tracking-tight text-ink md:text-[22px]">
                  {p.outlet}
                </span>
                <span className="font-display text-[16px] leading-[1.5] text-ink-soft md:text-[17px]">
                  &ldquo;{p.line}&rdquo;
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone">
                  {p.date}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* FAQ */}
      <div className="border-b border-hairline bg-bone">
        <div className="mx-auto max-w-5xl px-6 py-20 md:px-10 md:py-24">
          <div className="grid gap-3 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] md:items-end">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.26em] text-clay">
                Frequently asked
              </span>
              <h2 className="mt-3 font-display text-[32px] leading-[1.05] tracking-tight text-ink md:text-[40px]">
                Questions, <span className="italic">answered plainly.</span>
              </h2>
            </div>
            <p className="font-sans text-[14.5px] leading-[1.75] text-ink-soft">
              If something below doesn&apos;t cover it, reply to any issue —
              I read every email and most of them get an actual answer,
              usually within the week.
            </p>
          </div>

          <dl className="mt-10 grid gap-6 md:grid-cols-2">
            {FAQ.map((f) => (
              <div
                key={f.q}
                className="flex min-w-0 flex-col gap-3 border border-hairline bg-paper p-6"
              >
                <dt className="font-display text-[19px] leading-[1.25] tracking-tight text-ink md:text-[20px]">
                  {f.q}
                </dt>
                <dd className="font-sans text-[14.5px] leading-[1.75] text-ink-soft">
                  {f.a}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Closing */}
      <div className="bg-paper">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center md:px-10 md:py-28">
          <span className="font-mono text-[10px] uppercase tracking-[0.26em] text-clay">
            If you&apos;ve read this far
          </span>
          <h2 className="mt-3 font-display text-[36px] leading-[1.05] tracking-tight text-ink md:text-[48px]">
            You&apos;ll probably like
            <br />
            <span className="italic text-forest">the letter itself.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl font-sans text-[15px] leading-[1.75] text-ink-soft md:text-[16px]">
            The about page is decoration. The issues — all {ISSUES.length} of
            them, so far — are the work.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate({ view: "subscribe" })}
              className="inline-flex items-center gap-2 border border-ink bg-ink px-5 py-3 font-display text-[15px] italic text-bone hover:bg-ink-soft"
            >
              <Mail className="h-4 w-4" />
              Subscribe
            </button>
            <button
              type="button"
              onClick={() => onNavigate({ view: "archive" })}
              className="inline-flex items-center gap-2 border border-hairline bg-bone px-5 py-3 font-display text-[15px] italic text-ink hover:border-ink"
            >
              Read the archive
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
