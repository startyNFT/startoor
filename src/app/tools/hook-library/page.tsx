import type { Metadata } from "next";
import Link from "next/link";
import { HookLibrary } from "./hook-library";
import { HOOKS, HOOK_COUNT_BY_PLATFORM } from "@/lib/data/hooks";

export const metadata: Metadata = {
  title: "Hook Library · Try it",
  description:
    "700 annotated opening lines for writers who post for a living. Filter by platform, pattern and length. Enter swipe mode for the deep read.",
};

type PageProps = {
  searchParams: Promise<{ mode?: string; platform?: string }>;
};

export default async function HookLibraryPage({ searchParams }: PageProps) {
  await searchParams; // Next 16: must await even if unused

  return (
    <div className="relative">
      <header className="relative border-b border-hairline bg-paper">
        <div className="mx-auto max-w-7xl px-6 pt-16 pb-14 md:px-10 md:pt-20 md:pb-16">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-end">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-clay">
                Try it · Hook Library
              </span>
              <h1 className="mt-3 font-display text-5xl leading-[0.95] tracking-tight text-ink md:text-6xl lg:text-[5.5rem]">
                The first line
                <br />
                <span className="italic text-forest">is the whole</span>
                <br />
                argument.
              </h1>
              <p className="mt-8 max-w-xl font-sans text-lg leading-relaxed text-ink-soft">
                {HOOKS.length} annotated opening lines for people who post for a
                living. Real patterns. Real slots to fill. Copy one, save a
                shortlist, or drop into Swipe Mode and read them the way a
                museum reads its captions.
              </p>
            </div>
            <aside className="hidden max-w-sm lg:block">
              <div className="space-y-5 border-t border-hairline pt-6 font-sans text-sm leading-relaxed text-ink-soft">
                <p>
                  Curated across six platforms — Twitter, LinkedIn, YouTube,
                  Newsletters, Cold Email, TikTok — and fifteen rhetorical
                  patterns. Every hook carries a one-sentence annotation so you
                  can steal the structure, not just the line.
                </p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-[10px] uppercase tracking-[0.18em] text-stone">
                  <span>Twitter · {HOOK_COUNT_BY_PLATFORM.twitter}</span>
                  <span>LinkedIn · {HOOK_COUNT_BY_PLATFORM.linkedin}</span>
                  <span>YouTube · {HOOK_COUNT_BY_PLATFORM.youtube}</span>
                  <span>Newsletter · {HOOK_COUNT_BY_PLATFORM.newsletter}</span>
                  <span>Cold Email · {HOOK_COUNT_BY_PLATFORM["cold-email"]}</span>
                  <span>TikTok · {HOOK_COUNT_BY_PLATFORM.tiktok}</span>
                </div>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone">
                  Part of ·{" "}
                  <Link
                    href="/products/hook-library"
                    className="text-ink hover:text-clay"
                  >
                    Startoor · Hook Library
                  </Link>
                </p>
              </div>
            </aside>
          </div>
        </div>
        <div className="paper-grain absolute inset-0 pointer-events-none" />
      </header>

      <HookLibrary hooks={HOOKS} />
    </div>
  );
}
