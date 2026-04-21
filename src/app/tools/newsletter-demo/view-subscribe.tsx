"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ArrowRight, Check, Mail } from "lucide-react";
import { cn } from "@/lib/cn";
import { ISSUES, PUBLICATION } from "@/lib/data/newsletter-mock";
import type { SubscriberRecord } from "./newsletter-app";

type NavigateFn = (next: {
  view?: "landing" | "archive" | "issue" | "subscribe" | "about";
  id?: string | null;
}) => void;

const SOURCE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "", label: "What brings you here? (optional)" },
  { value: "friend", label: "A friend forwarded an issue" },
  { value: "twitter", label: "I read something of hers elsewhere" },
  { value: "podcast", label: "I heard her on a podcast" },
  { value: "search", label: "I was searching for something specific" },
  { value: "reader-since-day-1", label: "I've been reading since the start" },
  { value: "other", label: "Other" },
];

export function SubscribeView({
  subscriber,
  onSubscribe,
  onClear,
  onNavigate,
}: {
  subscriber: SubscriberRecord | null;
  onSubscribe: (r: SubscriberRecord) => void;
  onClear: () => void;
  onNavigate: NavigateFn;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [source, setSource] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [justSubscribed, setJustSubscribed] = useState(false);

  const canSubmit = /.+@.+\..+/.test(email.trim()) && !submitting;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    window.setTimeout(() => {
      onSubscribe({
        email: email.trim(),
        name: name.trim(),
        source: source || "subscribe-page",
        subscribedAt: new Date().toISOString(),
      });
      toast.success("You're in. Check your inbox Sunday at 7.", {
        description: "(Demo — nothing is actually sent.)",
      });
      setJustSubscribed(true);
      setSubmitting(false);
    }, 420);
  };

  const alreadyIn = subscriber && !justSubscribed;

  if (justSubscribed || alreadyIn) {
    return (
      <SuccessState
        record={subscriber!}
        onNavigate={onNavigate}
        onClear={() => {
          setJustSubscribed(false);
          onClear();
        }}
      />
    );
  }

  return (
    <section className="bg-paper">
      <div className="mx-auto grid max-w-5xl gap-14 px-6 pt-20 pb-28 md:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] md:px-10 md:pt-24">
        <div className="min-w-0">
          <span className="font-mono text-[10px] uppercase tracking-[0.26em] text-clay">
            Subscribe
          </span>
          <h1 className="mt-3 font-display text-[44px] leading-[0.98] tracking-tight text-ink md:text-[60px]">
            One long email.
            <br />
            <span className="italic text-forest">Sunday mornings.</span>
          </h1>
          <p className="mt-7 max-w-lg font-sans text-[16px] leading-[1.75] text-ink-soft md:text-[17px]">
            Quiet Output is a weekly letter from {PUBLICATION.authorName}. It
            arrives at 7 a.m. in her time zone, takes about{" "}
            {PUBLICATION.avgReadTimeMin} minutes to read, and does not ask
            anything of you except a careful Sunday morning.
          </p>

          <div className="mt-10 grid gap-5 border-l-2 border-clay pl-6">
            <p className="font-display text-[18px] italic leading-[1.5] text-ink md:text-[20px]">
              The deal, in one line:
            </p>
            <p className="font-display text-[16px] leading-[1.65] text-ink-soft md:text-[17px]">
              I will write you one long, careful email on Sunday mornings, for
              as long as I can keep it up. You read what you feel like
              reading. The rest, you delete.
            </p>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 font-mono text-[10px] uppercase tracking-[0.22em] text-stone">
            <span>Free</span>
            <span>·</span>
            <span>No paywall</span>
            <span>·</span>
            <span>One email / week, max</span>
            <span>·</span>
            <span>Unsubscribe any Sunday</span>
          </div>
        </div>

        {/* Form card */}
        <form
          onSubmit={submit}
          className="relative h-fit border border-hairline bg-bone p-7 shadow-warm-md md:p-9"
        >
          <div
            className="absolute -right-3 -top-3 rotate-[4deg] bg-clay px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-bone shadow-warm-sm"
            aria-hidden
          >
            Come in
          </div>

          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-stone">
            Form · takes 20 seconds
          </p>

          <div className="mt-5 space-y-5">
            <Field label="Name" hint="Optional. Jules likes to know.">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your first name"
                className="w-full border border-hairline bg-paper px-3.5 py-3 font-sans text-[14px] placeholder:text-stone-light focus:border-ink focus:outline-none"
              />
            </Field>

            <Field label="Email" hint="Required. Never shared. Truly.">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                required
                className="w-full border border-hairline bg-paper px-3.5 py-3 font-sans text-[14px] placeholder:text-stone-light focus:border-ink focus:outline-none"
              />
            </Field>

            <Field
              label="How you arrived"
              hint="Not asked for analytics — asked to say hello in the welcome."
            >
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full appearance-none border border-hairline bg-paper px-3.5 py-3 font-sans text-[14px] text-ink focus:border-ink focus:outline-none"
              >
                {SOURCE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className={cn(
              "mt-7 inline-flex w-full items-center justify-center gap-2 bg-ink px-5 py-3.5 font-display text-[16px] italic tracking-tight text-bone transition-colors",
              canSubmit
                ? "hover:bg-ink-soft"
                : "cursor-not-allowed opacity-60",
            )}
          >
            {submitting ? "Subscribing…" : "Subscribe"}
            {!submitting && <Mail className="h-4 w-4" />}
          </button>

          <p className="mt-4 font-mono text-[10px] leading-relaxed tracking-[0.18em] uppercase text-stone">
            You&apos;ll get a welcome email within a minute (in this demo:
            instantly, on the next screen). No drip sequences. No upsells. No
            cross-promotion of other newsletters.
          </p>
        </form>
      </div>
    </section>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block font-mono text-[10px] uppercase tracking-[0.22em] text-ink">
        {label}
      </span>
      {hint && (
        <span className="mb-2 block font-sans text-[12px] leading-snug text-stone">
          {hint}
        </span>
      )}
      {children}
    </label>
  );
}

// --------------------------------------------------------------------------
// Success state — "check your inbox"
// --------------------------------------------------------------------------

function SuccessState({
  record,
  onNavigate,
  onClear,
}: {
  record: SubscriberRecord;
  onNavigate: NavigateFn;
  onClear: () => void;
}) {
  const firstName =
    record.name || record.email.split("@")[0].split(/[._-]/)[0];
  const pretty = firstName
    ? firstName.charAt(0).toUpperCase() + firstName.slice(1)
    : "there";

  return (
    <section className="bg-paper">
      <div className="mx-auto max-w-3xl px-6 pt-20 pb-28 text-center md:px-10 md:pt-28">
        <div className="paper-grain relative inline-flex flex-col items-center gap-4 border border-forest/30 bg-forest/5 px-10 py-14">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-forest text-bone">
            <Check className="h-6 w-6" />
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.26em] text-forest">
            Subscribed
          </span>
          <h1 className="font-display text-[40px] leading-[1.02] tracking-tight text-ink md:text-[56px]">
            Welcome, {pretty}.
          </h1>
          <p className="max-w-xl font-display text-[18px] italic leading-[1.5] text-ink-soft md:text-[22px]">
            Check your inbox — a short hello is on its way.
          </p>
          <p className="max-w-xl font-sans text-[14px] leading-[1.7] text-ink-soft">
            The first full issue will arrive on the next Sunday at 7 a.m.
            Until then: the archive has {ISSUES.length} issues worth of reading. (Demo
            only — no actual email is sent.)
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate({ view: "archive" })}
              className="inline-flex items-center gap-2 border border-ink bg-ink px-5 py-3 font-display text-[15px] italic text-bone hover:bg-ink-soft"
            >
              Read the archive
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate({ view: "landing" })}
              className="inline-flex items-center gap-2 border border-hairline bg-bone px-5 py-3 font-display text-[15px] italic text-ink hover:border-ink"
            >
              Back to the home page
            </button>
          </div>
        </div>

        <div className="mt-8 font-mono text-[10px] uppercase tracking-[0.22em] text-stone">
          Subscribed as {record.email} ·{" "}
          <button
            type="button"
            onClick={onClear}
            className="underline underline-offset-2 hover:text-clay"
          >
            Unsubscribe (demo)
          </button>
        </div>
      </div>
    </section>
  );
}
