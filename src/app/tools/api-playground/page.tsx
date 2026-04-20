import type { Metadata } from "next";
import Link from "next/link";
import { PlaygroundApp } from "./playground-app";

export const metadata: Metadata = {
  title: "API Playground · Try it",
  description:
    "A warm, editorial REST client that runs in the browser. Build requests, route through environments, save collections, replay history — no accounts, no servers.",
};

export default function ApiPlaygroundPage() {
  return (
    <div className="relative">
      <header className="relative border-b border-hairline bg-paper">
        <div className="mx-auto max-w-[1600px] px-6 pt-14 pb-10 md:px-10 md:pt-16 md:pb-12">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-end">
            <div className="min-w-0">
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-clay">
                Try it · API Playground
              </span>
              <h1 className="mt-3 font-display text-5xl leading-[0.95] tracking-tight text-ink md:text-6xl lg:text-[5.25rem]">
                Read the response
                <br />
                <span className="italic text-forest">before</span> you trust
                <br />
                the documentation.
              </h1>
              <p className="mt-7 max-w-xl font-sans text-lg leading-relaxed text-ink-soft">
                A tidy little REST client in your browser. Collections, environments,
                history, cURL export — all local, all yours. Ship a snippet, not a
                screenshot.
              </p>
            </div>
            <aside className="hidden max-w-sm lg:block">
              <div className="space-y-5 border-t border-hairline pt-6 font-sans text-sm leading-relaxed text-ink-soft">
                <p>
                  Built as a one-window tool for the drafting table, not a subscription.
                  Requests fire through your browser, so CORS still applies — when it
                  bites, the console on the right will tell you.
                </p>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone">
                  Part of ·{" "}
                  <Link
                    href="/products/api-playground"
                    className="text-ink hover:text-clay"
                  >
                    Startoor · API Playground
                  </Link>
                </p>
              </div>
            </aside>
          </div>
        </div>
        <div className="paper-grain pointer-events-none absolute inset-0" />
      </header>

      <PlaygroundApp />
    </div>
  );
}
