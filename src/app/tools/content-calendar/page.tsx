import type { Metadata } from "next";
import Link from "next/link";
import { CalendarApp } from "./calendar-app";
import { IDEAS, IDEA_COUNT_BY_PLATFORM } from "@/lib/data/content-ideas";

export const metadata: Metadata = {
  title: "Content Calendar Kit · Try it",
  description:
    "A 90-day planner for writers who post for a living. 400 specific ideas, a 13-week grid, and a batching board that respects your weekdays.",
};

type PageProps = {
  searchParams: Promise<{ tab?: string }>;
};

export default async function ContentCalendarPage({ searchParams }: PageProps) {
  await searchParams;

  return (
    <div className="relative">
      <header className="relative border-b border-hairline bg-paper">
        <div className="mx-auto max-w-7xl px-6 pt-16 pb-14 md:px-10 md:pt-20 md:pb-16">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-end">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-clay">
                Try it · Content Calendar Kit
              </span>
              <h1 className="mt-3 font-display text-5xl leading-[0.95] tracking-tight text-ink md:text-6xl lg:text-[5.5rem]">
                Ninety days,
                <br />
                <span className="italic text-forest">quietly</span>
                <br />
                laid out.
              </h1>
              <p className="mt-8 max-w-xl font-sans text-lg leading-relaxed text-ink-soft">
                {IDEAS.length} specific post ideas, a 13-week grid you can drag
                into, and a batching board that respects your weekdays. Save to
                this device. Export to CSV or iCal. Print like a planner page.
              </p>
            </div>
            <aside className="hidden max-w-sm lg:block">
              <div className="space-y-5 border-t border-hairline pt-6 font-sans text-sm leading-relaxed text-ink-soft">
                <p>
                  Seven platforms, eight content pillars, three views. No login,
                  no cloud. Your plan lives on this device. Seed a realistic
                  month in a click and rearrange from there.
                </p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-[10px] uppercase tracking-[0.18em] text-stone">
                  <span>Twitter · {IDEA_COUNT_BY_PLATFORM.twitter}</span>
                  <span>LinkedIn · {IDEA_COUNT_BY_PLATFORM.linkedin}</span>
                  <span>Instagram · {IDEA_COUNT_BY_PLATFORM.instagram}</span>
                  <span>YouTube · {IDEA_COUNT_BY_PLATFORM.youtube}</span>
                  <span>TikTok · {IDEA_COUNT_BY_PLATFORM.tiktok}</span>
                  <span>Newsletter · {IDEA_COUNT_BY_PLATFORM.newsletter}</span>
                  <span>Blog · {IDEA_COUNT_BY_PLATFORM.blog}</span>
                </div>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone">
                  Part of ·{" "}
                  <Link
                    href="/products/content-calendar-kit"
                    className="text-ink hover:text-clay"
                  >
                    Startoor · Content Calendar Kit
                  </Link>
                </p>
              </div>
            </aside>
          </div>
        </div>
        <div className="paper-grain absolute inset-0 pointer-events-none" />
      </header>

      <CalendarApp ideas={IDEAS} />
    </div>
  );
}
