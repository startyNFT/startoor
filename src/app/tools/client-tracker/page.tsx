import type { Metadata } from "next";
import { ClientTrackerApp } from "./tracker-app";
import { SignInForm } from "./signin-form";
import { SeedButton } from "./seed-button";
import {
  getAllTouchpointsForOwner,
  getClients,
  getCurrentEmail,
} from "./actions";

export const metadata: Metadata = {
  title: "Client Tracker · Try it",
  description: "A single-screen CRM for solo consultants and freelancers.",
};

export default async function ClientTrackerPage() {
  const email = await getCurrentEmail();
  if (!email) {
    return (
      <div className="mx-auto max-w-5xl px-6 pt-16 pb-24 md:px-10">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-clay">
          Try it · Client Tracker
        </span>
        <h1 className="mt-3 font-display text-5xl leading-[0.95] tracking-tight text-ink md:text-6xl">
          Your clients,
          <br />
          <span className="italic text-forest">on one screen.</span>
        </h1>
        <p className="mt-8 max-w-xl font-sans text-lg leading-relaxed text-ink-soft">
          A keyboard-first CRM for solo consultants. No onboarding. No 14
          dashboards. Enter your email, start tracking.
        </p>
        <div className="mt-12 max-w-md">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-clay">
            Step 1
          </span>
          <h2 className="mt-2 font-display text-2xl tracking-tight text-ink md:text-3xl">
            Which email should this tracker belong to?
          </h2>
          <div className="mt-6">
            <SignInForm />
          </div>
          <p className="mt-4 font-sans text-xs text-stone">
            No password — your clients list is scoped to this email on this
            device.
          </p>
        </div>
      </div>
    );
  }

  const [clients, touchpoints] = await Promise.all([
    getClients(),
    getAllTouchpointsForOwner(),
  ]);
  return (
    <>
      {clients.length === 0 && (
        <div className="border-b border-hairline bg-bone">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4 md:px-10">
            <p className="font-sans text-sm text-ink-soft">
              First time here? Seed a sample set of clients to play with.
            </p>
            <SeedButton />
          </div>
        </div>
      )}
      <ClientTrackerApp
        initialClients={clients}
        initialTouchpoints={touchpoints}
        email={email}
      />
    </>
  );
}
