import type { Metadata } from "next";
import Link from "next/link";
import {
  ADS,
  AD_COUNT_BY_PLATFORM,
  AD_COUNT_BY_VERTICAL,
} from "@/lib/data/ad-copy";
import { SwipeFileApp } from "./swipe-file-app";

export const metadata: Metadata = {
  title: "Ad Copy Swipe File · Try it",
  description:
    "500 annotated ads — headline, body, CTA, implied visual, and a one-sentence structural breakdown. Filter by platform, vertical, pattern. Save favorites. Export to CSV or PDF.",
};

type PageProps = {
  searchParams: Promise<{ platform?: string; vertical?: string; pattern?: string }>;
};

export default async function AdCopySwipeFilePage({ searchParams }: PageProps) {
  await searchParams; // Next 16: must await even when unused

  return (
    <div className="relative">
      <header className="relative border-b border-hairline bg-paper print:hidden">
        <div className="mx-auto max-w-7xl px-6 pt-16 pb-14 md:px-10 md:pt-20 md:pb-16">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-end">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-clay">
                Try it · Ad Copy Swipe File
              </span>
              <h1 className="mt-3 font-display text-5xl leading-[0.95] tracking-tight text-ink md:text-6xl lg:text-[5.5rem]">
                {ADS.length} ads,
                <br />
                <span className="italic text-forest">broken down</span>
                <br />
                to the bone.
              </h1>
              <p className="mt-8 max-w-xl font-sans text-lg leading-relaxed text-ink-soft">
                A working swipe file for people who write ads for a living.
                Every card is a real-feel ad — headline, body, CTA, implied
                visual — with a one-sentence structural breakdown underneath.
                Steal the structure. Ship faster.
              </p>
            </div>
            <aside className="hidden max-w-sm lg:block">
              <div className="space-y-5 border-t border-hairline pt-6 font-sans text-sm leading-relaxed text-ink-soft">
                <p>
                  Curated across seven platforms and nine verticals. Fifteen
                  rhetorical patterns. Every ad annotated so you can copy the
                  move, not just the line.
                </p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-[10px] uppercase tracking-[0.18em] text-stone">
                  <span>Facebook · {AD_COUNT_BY_PLATFORM.facebook}</span>
                  <span>Instagram · {AD_COUNT_BY_PLATFORM.instagram}</span>
                  <span>TikTok · {AD_COUNT_BY_PLATFORM.tiktok}</span>
                  <span>YouTube · {AD_COUNT_BY_PLATFORM.youtube}</span>
                  <span>LinkedIn · {AD_COUNT_BY_PLATFORM.linkedin}</span>
                  <span>Twitter · {AD_COUNT_BY_PLATFORM.twitter}</span>
                  <span>Google · {AD_COUNT_BY_PLATFORM.google}</span>
                  <span>SaaS · {AD_COUNT_BY_VERTICAL.saas}</span>
                </div>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone">
                  Part of ·{" "}
                  <Link
                    href="/products/ad-copy-swipe-file"
                    className="text-ink hover:text-clay"
                  >
                    Startoor · Ad Copy Swipe File
                  </Link>
                </p>
              </div>
            </aside>
          </div>
        </div>
        <div className="paper-grain absolute inset-0 pointer-events-none" />
      </header>

      <SwipeFileApp ads={ADS} />
    </div>
  );
}
