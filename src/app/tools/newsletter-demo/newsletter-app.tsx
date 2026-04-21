"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ArrowRight, Code2, Mail, Rss } from "lucide-react";
import { cn } from "@/lib/cn";
import { PUBLICATION } from "@/lib/data/newsletter-mock";
import { LandingView } from "./view-landing";
import { ArchiveView } from "./view-archive";
import { IssueView } from "./view-issue";
import { SubscribeView } from "./view-subscribe";
import { AboutView } from "./view-about";

const STORAGE_KEY = "startoor_newsletter_demo_v1";

export type SubscriberRecord = {
  email: string;
  name: string;
  source: string;
  subscribedAt: string; // ISO
};

type View = "landing" | "archive" | "issue" | "subscribe" | "about";

function parseView(raw: string | null): View {
  switch (raw) {
    case "archive":
    case "issue":
    case "subscribe":
    case "about":
      return raw;
    default:
      return "landing";
  }
}

export function NewsletterApp() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const view = parseView(searchParams.get("view"));
  const issueId = searchParams.get("id") ?? null;

  const [subscriber, setSubscriber] = useState<SubscriberRecord | null>(null);

  // Hydrate from localStorage on mount.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setSubscriber(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  const saveSubscriber = useCallback((record: SubscriberRecord) => {
    setSubscriber(record);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
    } catch {
      /* ignore */
    }
  }, []);

  const clearSubscriber = useCallback(() => {
    setSubscriber(null);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
      toast.success("You've been unsubscribed from the demo.");
    } catch {
      /* ignore */
    }
  }, []);

  const navigate = useCallback(
    (next: { view?: View; id?: string | null }) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next.view && next.view !== "landing") {
        params.set("view", next.view);
      } else if (next.view === "landing") {
        params.delete("view");
      }
      if (next.id === null) {
        params.delete("id");
      } else if (next.id) {
        params.set("id", next.id);
      }
      const qs = params.toString();
      router.push(`/tools/newsletter-demo${qs ? `?${qs}` : ""}`, {
        scroll: true,
      });
    },
    [router, searchParams],
  );

  // Scroll to top whenever the view changes.
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [view, issueId]);

  const activeTab: View = view;

  return (
    <div className="relative">
      <DemoBanner />

      <PublicationMasthead
        active={activeTab}
        onNav={(v) => navigate({ view: v, id: null })}
        subscriber={subscriber}
      />

      <main className="relative">
        {view === "landing" && (
          <LandingView
            onNavigate={navigate}
            subscriber={subscriber}
            onSubscribe={saveSubscriber}
          />
        )}
        {view === "archive" && <ArchiveView onNavigate={navigate} />}
        {view === "issue" && (
          <IssueView
            id={issueId}
            onNavigate={navigate}
            subscriber={subscriber}
            onSubscribe={saveSubscriber}
          />
        )}
        {view === "subscribe" && (
          <SubscribeView
            subscriber={subscriber}
            onSubscribe={saveSubscriber}
            onClear={clearSubscriber}
            onNavigate={navigate}
          />
        )}
        {view === "about" && <AboutView onNavigate={navigate} />}
      </main>

      <PublicationFooter onNav={(v) => navigate({ view: v, id: null })} />
    </div>
  );
}

// --------------------------------------------------------------------------
// Demo banner — a subtle, editorial notice across the top.
// --------------------------------------------------------------------------

function DemoBanner() {
  return (
    <div className="border-b border-hairline bg-ink text-bone">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-2.5 md:px-10">
        <p className="font-mono text-[11px] leading-relaxed tracking-[0.12em] text-bone/85">
          <span className="mr-2 inline-block rounded-full bg-clay px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-bone">
            Demo
          </span>
          A fully-working newsletter site filled with sample issues — swap the
          content, deploy in a weekend.
        </p>
        <a
          href="https://github.com/startyNFT"
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-butter hover:text-bone"
        >
          <Code2 className="h-3.5 w-3.5" />
          Get the code
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </a>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// The publication's own masthead + nav (the "newsletter site" chrome).
// --------------------------------------------------------------------------

function PublicationMasthead({
  active,
  onNav,
  subscriber,
}: {
  active: View;
  onNav: (v: View) => void;
  subscriber: SubscriberRecord | null;
}) {
  const nav: Array<{ key: View; label: string }> = useMemo(
    () => [
      { key: "landing", label: "Home" },
      { key: "archive", label: "Archive" },
      { key: "about", label: "About" },
      { key: "subscribe", label: "Subscribe" },
    ],
    [],
  );

  return (
    <header className="sticky top-28 z-20 border-b border-hairline bg-paper/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4 md:px-10">
        <button
          type="button"
          onClick={() => onNav("landing")}
          className="group flex items-baseline gap-3"
        >
          <span className="font-display text-[22px] italic leading-none tracking-tight text-ink transition-colors group-hover:text-clay md:text-[26px]">
            {PUBLICATION.name}
          </span>
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.24em] text-stone sm:inline">
            a weekly letter
          </span>
        </button>

        <nav className="flex items-center gap-1">
          {nav.map((n) => {
            const isActive = active === n.key;
            return (
              <button
                key={n.key}
                type="button"
                onClick={() => onNav(n.key)}
                className={cn(
                  "relative px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] transition-colors",
                  isActive
                    ? "text-ink"
                    : "text-stone hover:text-ink",
                )}
              >
                {n.label}
                {isActive && (
                  <span className="absolute inset-x-3 -bottom-[1px] h-[2px] bg-clay" />
                )}
              </button>
            );
          })}

          {subscriber ? (
            <span
              className="ml-3 hidden items-center gap-1.5 rounded-full border border-hairline bg-bone px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-ink md:inline-flex"
              title={`Subscribed as ${subscriber.email}`}
            >
              <Mail className="h-3 w-3 text-forest" />
              Subscribed
            </span>
          ) : null}
        </nav>
      </div>
    </header>
  );
}

// --------------------------------------------------------------------------
// Publication footer — colophon, RSS, social.
// --------------------------------------------------------------------------

function PublicationFooter({ onNav }: { onNav: (v: View) => void }) {
  return (
    <footer className="relative mt-16 border-t border-hairline bg-bone">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-[1.6fr_1fr_1fr] md:px-10">
        <div>
          <p className="font-display text-[28px] italic leading-none tracking-tight text-ink md:text-[32px]">
            {PUBLICATION.name}
          </p>
          <p className="mt-3 max-w-md font-sans text-[14px] leading-[1.7] text-ink-soft">
            {PUBLICATION.positioning} Sundays, 7 a.m., a long email. Since{" "}
            {PUBLICATION.foundedYear}.
          </p>
          <div className="mt-6 flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
            <span className="inline-flex items-center gap-1.5">
              <Rss className="h-3 w-3" />
              RSS
            </span>
            <span>·</span>
            <span>Archive</span>
            <span>·</span>
            <span>Colophon</span>
          </div>
        </div>

        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-stone">
            The letter
          </p>
          <ul className="mt-4 space-y-2 font-sans text-[14px] text-ink">
            <li>
              <button
                type="button"
                onClick={() => onNav("landing")}
                className="hover:text-clay"
              >
                Home
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onNav("archive")}
                className="hover:text-clay"
              >
                Archive
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onNav("about")}
                className="hover:text-clay"
              >
                About
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onNav("subscribe")}
                className="hover:text-clay"
              >
                Subscribe
              </button>
            </li>
          </ul>
        </div>

        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-stone">
            The shop
          </p>
          <ul className="mt-4 space-y-2 font-sans text-[14px] text-ink">
            <li>
              <Link href="/products/newsletter-starter" className="hover:text-clay">
                Newsletter Starter →
              </Link>
            </li>
            <li>
              <Link href="/tools/newsletter-demo?view=subscribe" className="hover:text-clay">
                Get new issues
              </Link>
            </li>
            <li>
              <Link href="/browse" className="hover:text-clay">
                All Startoor tools
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-hairline-soft">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-5 font-mono text-[10px] uppercase tracking-[0.2em] text-stone md:px-10">
          <span>
            © {new Date().getFullYear()} · {PUBLICATION.name} · Written in
            a small apartment above a bookshop.
          </span>
          <span>Built with Startoor · Newsletter Starter</span>
        </div>
      </div>
    </footer>
  );
}
