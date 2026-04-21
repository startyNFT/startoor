import type { Metadata } from "next";
import Link from "next/link";
import { AuthApp } from "./auth-app";

export const metadata: Metadata = {
  title: "Next.js + Auth Starter · Preview",
  description:
    "A working preview of the Next.js + Auth Starter. Flip between NextAuth, Clerk, Supabase, and Better-Auth — see the sign-in flow, session, and a full post-auth dashboard. Mock auth, localStorage-only.",
};

type PageProps = {
  searchParams: Promise<{
    view?: string;
    provider?: string;
    pane?: string;
  }>;
};

export default async function AuthStarterDemoPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <div className="relative">
      {/* Intro header */}
      <header className="relative border-b border-hairline bg-paper">
        <div className="mx-auto max-w-7xl px-6 pt-16 pb-14 md:px-10 md:pt-20 md:pb-16">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-end">
            <div className="min-w-0">
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-clay">
                Try it · Next.js + Auth Starter
              </span>
              <h1 className="mt-3 font-display text-5xl leading-[0.95] tracking-tight text-ink md:text-6xl lg:text-[5.5rem]">
                Sign-in,
                <br />
                <span className="italic text-forest">session,</span>
                <br />
                dashboard.
              </h1>
              <p className="mt-8 max-w-xl font-sans text-lg leading-relaxed text-ink-soft">
                A working preview of the starter. Pick your auth provider,
                sign in (or skip with one tap), and walk the whole post-auth
                surface — profile, teams, API keys, billing. The real build
                ships as a Next.js repo you clone, not a hosted trial.
              </p>
            </div>
            <aside className="hidden max-w-sm lg:block">
              <div className="space-y-5 border-t border-hairline pt-6 font-sans text-sm leading-relaxed text-ink-soft">
                <p>
                  Four provider flavors re-skin the sign-in screen. The real
                  starter ships adapters for each — your wiring work is
                  minutes, not a sprint.
                </p>
                <p>
                  Everything below is mock state in your browser. Clear
                  localStorage to reset.
                </p>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone">
                  Part of ·{" "}
                  <Link
                    href="/products/nextjs-auth-starter"
                    className="text-ink hover:text-clay"
                  >
                    Startoor · Next.js + Auth Starter
                  </Link>
                </p>
              </div>
            </aside>
          </div>
        </div>
        <div className="paper-grain absolute inset-0 pointer-events-none" />
      </header>

      <AuthApp initialParams={params} />
    </div>
  );
}
