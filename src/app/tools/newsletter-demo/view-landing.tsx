"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ArrowRight, Check, Clock, Mail, Quote } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  ISSUES,
  PUBLICATION,
  TAG_LABELS,
  type Issue,
} from "@/lib/data/newsletter-mock";
import type { SubscriberRecord } from "./newsletter-app";

type NavigateFn = (next: {
  view?: "landing" | "archive" | "issue" | "subscribe" | "about";
  id?: string | null;
}) => void;

function formatDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatNumber(n: number) {
  return n.toLocaleString("en-US");
}

export function LandingView({
  onNavigate,
  subscriber,
  onSubscribe,
}: {
  onNavigate: NavigateFn;
  subscriber: SubscriberRecord | null;
  onSubscribe: (r: SubscriberRecord) => void;
}) {
  const latest = useMemo(
    () => [...ISSUES].sort((a, b) => b.number - a.number).slice(0, 4),
    [],
  );
  const [featured, ...rest] = latest;

  return (
    <div className="bg-paper pb-16">
      <HeroMasthead
        onNavigate={onNavigate}
        subscriber={subscriber}
        onSubscribe={onSubscribe}
      />

      <StatsStrip />

      <FeaturedAndLatest
        featured={featured}
        rest={rest}
        onNavigate={onNavigate}
      />

      <AuthorCard onNavigate={onNavigate} />

      <TestimonialWall />

      <ClosingCTA
        onNavigate={onNavigate}
        subscriber={subscriber}
        onSubscribe={onSubscribe}
      />
    </div>
  );
}

// --------------------------------------------------------------------------
// Hero masthead — the publication's front door.
// --------------------------------------------------------------------------

function HeroMasthead({
  subscriber,
  onSubscribe,
  onNavigate,
}: {
  subscriber: SubscriberRecord | null;
  onSubscribe: (r: SubscriberRecord) => void;
  onNavigate: NavigateFn;
}) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = /.+@.+\..+/.test(email.trim()) && !submitting;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    window.setTimeout(() => {
      onSubscribe({
        email: email.trim(),
        name: name.trim(),
        source: "landing-hero",
        subscribedAt: new Date().toISOString(),
      });
      toast.success("Subscribed. Check your inbox Sunday at 7.", {
        description: "(Demo — nothing is actually sent.)",
      });
      setEmail("");
      setName("");
      setSubmitting(false);
    }, 340);
  };

  return (
    <section className="relative overflow-hidden border-b border-hairline">
      <div className="paper-grain absolute inset-0 pointer-events-none" />

      <div className="relative mx-auto max-w-6xl px-6 pt-20 pb-24 md:px-10 md:pt-28 md:pb-32">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-end">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-3 border border-hairline bg-bone px-3 py-1 font-mono text-[10px] uppercase tracking-[0.24em] text-ink">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-clay" />
              Issue {ISSUES[0].number} · Sunday, 7 a.m.
            </div>

            <h1 className="mt-7 font-display text-5xl leading-[0.92] tracking-tight text-ink md:text-6xl lg:text-[5.5rem]">
              A newsletter
              <br />
              <span className="italic text-forest">about shipping</span>
              <br />
              small, weekly.
            </h1>

            <p className="mt-8 max-w-xl font-sans text-[17px] leading-[1.7] text-ink-soft md:text-[18px]">
              One long email every Sunday morning from{" "}
              <span className="text-ink">{PUBLICATION.authorName}</span> —
              writer, independent product maker, and a moderately competent
              gardener. About {PUBLICATION.issuesPerYear} issues a year, and{" "}
              {formatNumber(PUBLICATION.subscriberCount)} other quiet people
              reading.
            </p>

            {subscriber ? (
              <div className="mt-10 flex flex-col items-start gap-3 rounded-sm border border-forest/30 bg-forest/5 px-5 py-4 md:flex-row md:items-center">
                <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-forest text-bone">
                  <Check className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-[17px] italic leading-snug text-ink">
                    You&apos;re in. Sunday morning, 7 a.m.
                  </p>
                  <p className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.18em] text-stone">
                    Subscribed as {subscriber.email}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate({ view: "archive" })}
                  className="inline-flex shrink-0 items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-forest hover:text-forest-soft"
                >
                  Read the archive
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <form
                onSubmit={submit}
                className="mt-10 flex max-w-lg flex-col gap-3 sm:flex-row sm:items-stretch"
              >
                <div className="min-w-0 flex-1 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1.4fr]">
                  <input
                    type="text"
                    placeholder="Your first name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="min-w-0 border border-hairline bg-bone px-3.5 py-3 font-sans text-[14px] placeholder:text-stone-light focus:border-ink focus:outline-none"
                  />
                  <input
                    type="email"
                    placeholder="you@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="min-w-0 border border-hairline bg-bone px-3.5 py-3 font-sans text-[14px] placeholder:text-stone-light focus:border-ink focus:outline-none"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className={cn(
                    "inline-flex items-center justify-center gap-2 whitespace-nowrap border border-ink bg-ink px-5 py-3 font-display text-[15px] italic tracking-tight text-bone transition-colors",
                    canSubmit
                      ? "hover:bg-ink-soft"
                      : "cursor-not-allowed opacity-60",
                  )}
                >
                  Subscribe
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            )}

            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-stone">
              Free · no paywall · unsubscribe at the top of every email
            </p>
          </div>

          {/* Cover card — a magazine-style featured issue teaser */}
          <aside className="relative mx-auto w-full max-w-sm lg:max-w-none">
            <div
              className="relative rotate-[-1.5deg] border border-hairline bg-bone p-7 shadow-warm-md md:p-8"
              style={{ boxShadow: "0 24px 48px rgba(28,28,26,0.12)" }}
            >
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-clay">
                  This week · Issue {ISSUES[0].number}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone">
                  {formatDate(ISSUES[0].date)}
                </span>
              </div>
              <div className="mt-1 h-px w-full bg-hairline" />
              <h3 className="mt-6 font-display text-[30px] leading-[1.08] tracking-tight text-ink md:text-[34px]">
                {ISSUES[0].title}
              </h3>
              <p className="mt-3 font-display text-[16px] italic leading-[1.5] text-ink-soft">
                {ISSUES[0].deck}
              </p>
              <p className="mt-6 font-sans text-[14px] leading-[1.7] text-ink-soft">
                {ISSUES[0].excerpt}
              </p>
              <div className="mt-7 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
                  <Clock className="h-3 w-3" />
                  {ISSUES[0].readTimeMin} min
                </span>
                <button
                  type="button"
                  onClick={() =>
                    onNavigate({ view: "issue", id: ISSUES[0].id })
                  }
                  className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-ink hover:text-clay"
                >
                  Read it
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div
              className="absolute -left-3 -top-3 z-10 rotate-[5deg] bg-clay px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-bone shadow-warm-sm"
              aria-hidden
            >
              Just in
            </div>

            <div
              className="absolute -bottom-5 right-6 rotate-[-3deg] border border-hairline bg-butter/80 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-ink"
              aria-hidden
            >
              {TAG_LABELS[ISSUES[0].tag]}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

// --------------------------------------------------------------------------
// Stats strip — a newspaper-like marquee of numbers.
// --------------------------------------------------------------------------

function StatsStrip() {
  const stats = [
    { label: "Readers", value: formatNumber(PUBLICATION.subscriberCount) },
    { label: "Open rate", value: `${PUBLICATION.openRate}%` },
    { label: "Avg. reading", value: `${PUBLICATION.avgReadTimeMin} min` },
    { label: "Issues shipped", value: String(ISSUES.length) },
    { label: "Since", value: String(PUBLICATION.foundedYear) },
  ];
  return (
    <section className="border-b border-hairline bg-ink text-bone">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-6 py-8 md:grid-cols-5 md:px-10">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col gap-1">
            <span className="font-display text-[28px] leading-none tabular-nums md:text-[36px]">
              {s.value}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-bone/60">
              {s.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

// --------------------------------------------------------------------------
// Featured issue + three more — magazine-style TOC.
// --------------------------------------------------------------------------

function FeaturedAndLatest({
  featured,
  rest,
  onNavigate,
}: {
  featured: Issue;
  rest: Issue[];
  onNavigate: NavigateFn;
}) {
  return (
    <section className="border-b border-hairline bg-bone">
      <div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-24">
        <div className="flex items-end justify-between gap-4 border-b border-hairline pb-6">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.26em] text-clay">
              Latest issues
            </span>
            <h2 className="mt-2 font-display text-[32px] leading-[1.05] tracking-tight text-ink md:text-[40px]">
              A table of contents,
              <span className="italic"> recently.</span>
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate({ view: "archive" })}
            className="hidden shrink-0 items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-ink hover:text-clay md:inline-flex"
          >
            See all {ISSUES.length} issues
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          {/* Featured card */}
          <button
            type="button"
            onClick={() => onNavigate({ view: "issue", id: featured.id })}
            className="group relative flex min-w-0 flex-col items-start gap-5 border border-hairline bg-paper p-8 text-left transition-colors hover:border-ink md:p-10"
          >
            <div className="flex w-full items-baseline justify-between gap-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-clay">
                Issue № {String(featured.number).padStart(3, "0")}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone">
                {formatDate(featured.date)}
              </span>
            </div>

            <h3 className="min-w-0 font-display text-[28px] leading-[1.06] tracking-tight text-ink md:text-[32px]">
              {featured.title}
            </h3>
            <p className="min-w-0 font-display text-[18px] italic leading-[1.45] text-ink-soft md:text-[20px]">
              {featured.deck}
            </p>
            <p className="min-w-0 font-sans text-[14.5px] leading-[1.7] text-ink-soft">
              {featured.excerpt}
            </p>

            <div className="mt-auto flex w-full items-center justify-between border-t border-hairline pt-5">
              <span className="inline-flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-stone">
                <span className="rounded-full border border-hairline bg-bone px-2.5 py-0.5 text-ink">
                  {TAG_LABELS[featured.tag]}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3 w-3" />
                  {featured.readTimeMin} min
                </span>
              </span>
              <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.22em] text-ink transition-colors group-hover:text-clay">
                Read
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </button>

          {/* Three more */}
          <div className="flex flex-col">
            {rest.map((i, idx) => (
              <button
                key={i.id}
                type="button"
                onClick={() => onNavigate({ view: "issue", id: i.id })}
                className={cn(
                  "group grid min-w-0 grid-cols-[auto_1fr] items-baseline gap-5 py-6 text-left transition-colors hover:bg-paper/70",
                  idx !== 0 && "border-t border-hairline",
                )}
              >
                <span className="font-mono text-[22px] font-medium leading-none tabular-nums text-stone group-hover:text-clay md:text-[26px]">
                  № {String(i.number).padStart(3, "0")}
                </span>
                <span className="min-w-0">
                  <span className="block font-display text-[22px] leading-[1.1] tracking-tight text-ink group-hover:text-clay md:text-[26px]">
                    {i.title}
                  </span>
                  <span className="mt-1.5 block font-display text-[15px] italic leading-[1.45] text-ink-soft">
                    {i.deck}
                  </span>
                  <span className="mt-3 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
                    <span>{formatDate(i.date)}</span>
                    <span>·</span>
                    <span>{TAG_LABELS[i.tag]}</span>
                    <span>·</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {i.readTimeMin} min
                    </span>
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigate({ view: "archive" })}
          className="mt-8 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-ink hover:text-clay md:hidden"
        >
          See all {ISSUES.length} issues
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </section>
  );
}

// --------------------------------------------------------------------------
// Author card — bio + manifesto.
// --------------------------------------------------------------------------

function AuthorCard({ onNavigate }: { onNavigate: NavigateFn }) {
  return (
    <section className="border-b border-hairline bg-paper">
      <div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-24">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.3fr)] lg:items-start">
          <div className="min-w-0">
            <span className="font-mono text-[10px] uppercase tracking-[0.26em] text-clay">
              The writer
            </span>
            <div className="mt-6 flex items-center gap-5">
              <div
                aria-hidden
                className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full font-display text-[28px] italic text-bone"
                style={{
                  background:
                    "radial-gradient(circle at 30% 30%, #E8C77F, #C85A3F 72%)",
                }}
              >
                {PUBLICATION.authorInitials}
              </div>
              <div className="min-w-0">
                <p className="font-display text-[26px] italic leading-none tracking-tight text-ink md:text-[30px]">
                  {PUBLICATION.authorName}
                </p>
                <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
                  {PUBLICATION.authorRole}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigate({ view: "about" })}
              className="mt-7 inline-flex items-center gap-1.5 border-b border-ink/50 pb-0.5 font-mono text-[11px] uppercase tracking-[0.2em] text-ink hover:border-clay hover:text-clay"
            >
              Full bio
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="min-w-0">
            <p className="font-display text-[22px] italic leading-[1.45] text-ink md:text-[26px]">
              &ldquo;{PUBLICATION.authorManifesto}&rdquo;
            </p>
            <p className="mt-7 font-sans text-[15px] leading-[1.75] text-ink-soft">
              {PUBLICATION.authorBio}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// --------------------------------------------------------------------------
// Testimonial wall — reader quotes.
// --------------------------------------------------------------------------

function TestimonialWall() {
  return (
    <section className="border-b border-hairline bg-bone">
      <div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-24">
        <div className="max-w-2xl">
          <span className="font-mono text-[10px] uppercase tracking-[0.26em] text-clay">
            From the inbox
          </span>
          <h2 className="mt-2 font-display text-[32px] leading-[1.05] tracking-tight text-ink md:text-[40px]">
            What readers keep
            <span className="italic"> writing back.</span>
          </h2>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {PUBLICATION.testimonials.map((t, idx) => (
            <figure
              key={t.name}
              className={cn(
                "relative flex min-w-0 flex-col gap-5 border border-hairline bg-paper p-7",
                idx % 2 === 0 ? "stamp-rotate-1" : "stamp-rotate-2",
              )}
            >
              <Quote
                className="absolute left-5 top-5 h-5 w-5 text-clay/50"
                aria-hidden
              />
              <blockquote className="pl-8 font-display text-[17px] leading-[1.5] text-ink md:text-[18px]">
                {t.quote}
              </blockquote>
              <figcaption className="mt-auto border-t border-hairline pt-4">
                <p className="font-display text-[15px] italic text-ink">
                  {t.name}
                </p>
                <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
                  {t.role}
                </p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

// --------------------------------------------------------------------------
// Closing CTA.
// --------------------------------------------------------------------------

function ClosingCTA({
  subscriber,
  onSubscribe,
  onNavigate,
}: {
  subscriber: SubscriberRecord | null;
  onSubscribe: (r: SubscriberRecord) => void;
  onNavigate: NavigateFn;
}) {
  const [email, setEmail] = useState("");

  return (
    <section className="border-b border-hairline bg-forest text-bone">
      <div className="mx-auto max-w-5xl px-6 py-20 text-center md:px-10 md:py-28">
        <span className="font-mono text-[10px] uppercase tracking-[0.26em] text-butter">
          Sundays, 7 a.m.
        </span>
        <h2 className="mt-4 font-display text-[40px] leading-[1.02] tracking-tight md:text-[56px]">
          One long email
          <br />
          <span className="italic">that respects your morning.</span>
        </h2>
        <p className="mx-auto mt-7 max-w-xl font-sans text-[15px] leading-[1.75] text-bone/85 md:text-[16px]">
          {formatNumber(PUBLICATION.subscriberCount)} quiet readers. No
          paywall. No daily drip. Just Jules, writing into the weekend.
        </p>

        {subscriber ? (
          <div className="mx-auto mt-10 inline-flex flex-wrap items-center justify-center gap-3 rounded-sm border border-butter/30 bg-ink/20 px-5 py-3">
            <span className="inline-flex items-center gap-2 font-display text-[17px] italic">
              <Check className="h-4 w-4 text-butter" />
              You&apos;re already on the list.
            </span>
            <button
              type="button"
              onClick={() => onNavigate({ view: "archive" })}
              className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-butter hover:text-bone"
            >
              Read the archive
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!/.+@.+\..+/.test(email.trim())) return;
              onSubscribe({
                email: email.trim(),
                name: "",
                source: "landing-closing",
                subscribedAt: new Date().toISOString(),
              });
              toast.success("Subscribed. See you Sunday.", {
                description: "(Demo — nothing is actually sent.)",
              });
              setEmail("");
            }}
            className="mx-auto mt-10 flex max-w-md flex-col gap-3 sm:flex-row"
          >
            <input
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="min-w-0 flex-1 border border-butter/30 bg-ink/20 px-4 py-3 font-sans text-[14px] text-bone placeholder:text-bone/50 focus:border-butter focus:outline-none"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap bg-butter px-5 py-3 font-display text-[15px] italic tracking-tight text-ink transition-opacity hover:opacity-90"
            >
              Subscribe
              <Mail className="h-4 w-4" />
            </button>
          </form>
        )}

        <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.24em] text-bone/50">
          Free · unsubscribe any week · no forwarding your email
        </p>
      </div>
    </section>
  );
}
