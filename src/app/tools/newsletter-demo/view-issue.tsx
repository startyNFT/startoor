"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  Link2,
  Mail,
  Printer,
} from "lucide-react";
import { cn } from "@/lib/cn";
import {
  PUBLICATION,
  TAG_LABELS,
  getAdjacentIssues,
  getIssueById,
  getRelatedIssues,
} from "@/lib/data/newsletter-mock";
import { MarkdownRender } from "./markdown";
import type { SubscriberRecord } from "./newsletter-app";

type NavigateFn = (next: {
  view?: "landing" | "archive" | "issue" | "subscribe" | "about";
  id?: string | null;
}) => void;

function formatDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function IssueView({
  id,
  onNavigate,
  subscriber,
  onSubscribe,
}: {
  id: string | null;
  onNavigate: NavigateFn;
  subscriber: SubscriberRecord | null;
  onSubscribe: (r: SubscriberRecord) => void;
}) {
  const issue = useMemo(() => (id ? getIssueById(id) : undefined), [id]);
  const { prev, next } = useMemo(
    () => (issue ? getAdjacentIssues(issue.id) : { prev: undefined, next: undefined }),
    [issue],
  );
  const related = useMemo(
    () => (issue ? getRelatedIssues(issue.id, 3) : []),
    [issue],
  );

  if (!issue) {
    return (
      <section className="bg-paper">
        <div className="mx-auto max-w-3xl px-6 py-28 text-center md:px-10">
          <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-clay">
            404 · No such issue
          </p>
          <h1 className="mt-3 font-display text-[40px] leading-[1.05] tracking-tight text-ink">
            That issue is missing from the shelf.
          </h1>
          <p className="mt-5 font-sans text-[15px] leading-[1.7] text-ink-soft">
            Possibly unpublished, possibly mis-linked. The archive has
            everything, correctly labelled.
          </p>
          <button
            type="button"
            onClick={() => onNavigate({ view: "archive" })}
            className="mt-8 inline-flex items-center gap-2 border border-ink bg-ink px-5 py-3 font-display text-[15px] italic text-bone hover:bg-ink-soft"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to the archive
          </button>
        </div>
      </section>
    );
  }

  return (
    <article className="bg-paper">
      {/* Top breadcrumb / back */}
      <div className="border-b border-hairline bg-paper">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-6 py-4 md:px-10">
          <button
            type="button"
            onClick={() => onNavigate({ view: "archive" })}
            className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-stone hover:text-ink"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Archive
          </button>
          <ShareRow issueId={issue.id} />
        </div>
      </div>

      {/* Issue header */}
      <header className="border-b border-hairline bg-paper">
        <div className="mx-auto max-w-3xl px-6 pt-16 pb-10 md:px-10 md:pt-24">
          <div className="flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-[0.24em]">
            <span className="text-clay">
              Issue № {String(issue.number).padStart(3, "0")}
            </span>
            <span className="text-stone">·</span>
            <span className="text-ink">{formatDate(issue.date)}</span>
            <span className="text-stone">·</span>
            <span className="rounded-full border border-hairline bg-bone px-2.5 py-0.5 text-ink">
              {TAG_LABELS[issue.tag]}
            </span>
          </div>

          <h1 className="mt-6 font-display text-[44px] leading-[1.02] tracking-tight text-ink md:text-[60px]">
            {issue.title}
          </h1>
          <p className="mt-5 font-display text-[20px] italic leading-[1.4] text-ink-soft md:text-[24px]">
            {issue.deck}
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-hairline pt-5">
            <div className="flex items-center gap-3">
              <div
                aria-hidden
                className="flex h-9 w-9 items-center justify-center rounded-full font-display text-[13px] italic text-bone"
                style={{
                  background:
                    "radial-gradient(circle at 30% 30%, #E8C77F, #C85A3F 72%)",
                }}
              >
                {PUBLICATION.authorInitials}
              </div>
              <div className="min-w-0">
                <p className="font-display text-[15px] italic leading-tight text-ink">
                  {PUBLICATION.authorName}
                </p>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
                  {PUBLICATION.name} · weekly
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-stone">
              <Clock className="h-3.5 w-3.5" />
              {issue.readTimeMin} min read
            </span>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="mx-auto max-w-3xl px-6 pt-12 pb-20 md:px-10 md:pt-16">
        <MarkdownRender source={issue.body} variant="reader" />

        {/* End mark */}
        <div className="mt-16 flex items-center justify-center">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone">
            — {PUBLICATION.name} · Issue{" "}
            {String(issue.number).padStart(3, "0")} —
          </span>
        </div>
      </div>

      {/* Subscribe bar */}
      <section className="border-y border-hairline bg-bone">
        <div className="mx-auto max-w-3xl px-6 py-14 md:px-10 md:py-16">
          {subscriber ? (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-display text-[24px] italic leading-tight text-ink md:text-[28px]">
                  You&apos;ll get the next one Sunday.
                </p>
                <p className="mt-2 font-sans text-[14px] leading-[1.7] text-ink-soft">
                  Thanks for being one of the quiet{" "}
                  {PUBLICATION.subscriberCount.toLocaleString()}.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate({ view: "archive" })}
                className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-ink hover:text-clay"
              >
                More from the archive
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <InlineSubscribe onSubscribe={onSubscribe} />
          )}
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="border-b border-hairline bg-paper">
          <div className="mx-auto max-w-5xl px-6 py-16 md:px-10 md:py-20">
            <div className="flex items-end justify-between border-b border-hairline pb-5">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-[0.26em] text-clay">
                  If you liked this
                </span>
                <h2 className="mt-2 font-display text-[26px] leading-[1.1] tracking-tight text-ink md:text-[30px]">
                  Three more from the{" "}
                  <span className="italic">{TAG_LABELS[issue.tag]}</span>{" "}
                  desk.
                </h2>
              </div>
            </div>
            <ul className="divide-y divide-hairline">
              {related.map((r) => (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => onNavigate({ view: "issue", id: r.id })}
                    className="group grid w-full min-w-0 grid-cols-[auto_1fr] items-baseline gap-5 py-5 text-left"
                  >
                    <span className="font-mono text-[18px] font-medium tabular-nums text-stone group-hover:text-clay">
                      № {String(r.number).padStart(3, "0")}
                    </span>
                    <span className="min-w-0">
                      <span className="block font-display text-[20px] leading-[1.15] tracking-tight text-ink group-hover:text-clay md:text-[22px]">
                        {r.title}
                      </span>
                      <span className="mt-1 block font-display text-[14px] italic leading-[1.45] text-ink-soft">
                        {r.deck}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Prev / Next */}
      <section className="bg-paper">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-px border-b border-hairline bg-hairline md:grid-cols-2">
          {prev ? (
            <button
              type="button"
              onClick={() => onNavigate({ view: "issue", id: prev.id })}
              className="group flex min-w-0 flex-col gap-2 bg-paper px-6 py-10 text-left md:px-10 md:py-12"
            >
              <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-stone group-hover:text-clay">
                <ArrowLeft className="h-3.5 w-3.5" />
                Previous · № {String(prev.number).padStart(3, "0")}
              </span>
              <span className="font-display text-[22px] leading-[1.15] tracking-tight text-ink group-hover:text-clay md:text-[24px]">
                {prev.title}
              </span>
              <span className="font-display text-[14px] italic text-ink-soft">
                {prev.deck}
              </span>
            </button>
          ) : (
            <div className="bg-paper px-6 py-10 text-left md:px-10 md:py-12">
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone">
                First issue
              </span>
              <p className="mt-2 font-display text-[18px] italic text-ink-soft">
                This is where it all started.
              </p>
            </div>
          )}

          {next ? (
            <button
              type="button"
              onClick={() => onNavigate({ view: "issue", id: next.id })}
              className="group flex min-w-0 flex-col items-end gap-2 bg-paper px-6 py-10 text-right md:px-10 md:py-12"
            >
              <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-stone group-hover:text-clay">
                Next · № {String(next.number).padStart(3, "0")}
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
              <span className="font-display text-[22px] leading-[1.15] tracking-tight text-ink group-hover:text-clay md:text-[24px]">
                {next.title}
              </span>
              <span className="font-display text-[14px] italic text-ink-soft">
                {next.deck}
              </span>
            </button>
          ) : (
            <div className="bg-paper px-6 py-10 text-right md:px-10 md:py-12">
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone">
                Most recent
              </span>
              <p className="mt-2 font-display text-[18px] italic text-ink-soft">
                You&apos;re caught up. See you Sunday.
              </p>
            </div>
          )}
        </div>
      </section>
    </article>
  );
}

// --------------------------------------------------------------------------
// Share row — copy link, tweet, print.
// --------------------------------------------------------------------------

function ShareRow({ issueId }: { issueId: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 1400);
    return () => window.clearTimeout(t);
  }, [copied]);

  const copyLink = async () => {
    if (typeof window === "undefined") return;
    const url = `${window.location.origin}/tools/newsletter-demo?view=issue&id=${issueId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied", {
        description: "(Demo link — paste where you like.)",
      });
    } catch {
      toast.error("Could not copy — clipboard access blocked.");
    }
  };

  const print = () => {
    if (typeof window === "undefined") return;
    window.print();
  };

  return (
    <div className="flex items-center gap-1.5">
      <IconBtn onClick={copyLink} label={copied ? "Copied" : "Copy link"}>
        {copied ? (
          <Check className="h-3.5 w-3.5" />
        ) : (
          <Link2 className="h-3.5 w-3.5" />
        )}
      </IconBtn>
      <IconBtn onClick={print} label="Print">
        <Printer className="h-3.5 w-3.5" />
      </IconBtn>
      <IconBtn
        onClick={() => {
          if (typeof window === "undefined") return;
          const url = `${window.location.origin}/tools/newsletter-demo?view=issue&id=${issueId}`;
          const intent = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
            url,
          )}`;
          window.open(intent, "_blank", "noopener,noreferrer");
        }}
        label="Tweet"
      >
        <span className="font-mono text-[11px] font-semibold">X</span>
      </IconBtn>
    </div>
  );
}

function IconBtn({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-full border border-hairline bg-bone px-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink",
        "transition-colors hover:border-ink",
      )}
    >
      {children}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

// --------------------------------------------------------------------------
// Inline subscribe (inside an issue).
// --------------------------------------------------------------------------

function InlineSubscribe({
  onSubscribe,
}: {
  onSubscribe: (r: SubscriberRecord) => void;
}) {
  const [email, setEmail] = useState("");

  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:items-center">
      <div className="min-w-0">
        <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-clay">
          Before you go
        </p>
        <h3 className="mt-2 font-display text-[26px] italic leading-[1.15] tracking-tight text-ink md:text-[30px]">
          Get the next one, Sunday 7 a.m.
        </h3>
        <p className="mt-2 font-sans text-[14px] leading-[1.7] text-ink-soft">
          One long email, never more than weekly. Unsubscribe at the top of
          any issue. {PUBLICATION.subscriberCount.toLocaleString()} quiet
          readers so far.
        </p>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!/.+@.+\..+/.test(email.trim())) return;
          onSubscribe({
            email: email.trim(),
            name: "",
            source: "inline-issue",
            subscribedAt: new Date().toISOString(),
          });
          toast.success("Subscribed. Check your inbox Sunday.", {
            description: "(Demo — nothing is actually sent.)",
          });
          setEmail("");
        }}
        className="flex min-w-0 gap-2"
      >
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          required
          className="min-w-0 flex-1 border border-hairline bg-paper px-3.5 py-3 font-sans text-[14px] placeholder:text-stone-light focus:border-ink focus:outline-none"
        />
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap bg-ink px-4 py-3 font-display text-[14px] italic tracking-tight text-bone hover:bg-ink-soft"
        >
          <Mail className="h-4 w-4" />
          Subscribe
        </button>
      </form>
    </div>
  );
}
