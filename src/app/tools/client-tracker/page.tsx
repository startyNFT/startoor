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

  let clients: Awaited<ReturnType<typeof getClients>> = [];
  let touchpoints: Awaited<ReturnType<typeof getAllTouchpointsForOwner>> = [];
  try {
    [clients, touchpoints] = await Promise.all([
      getClients(),
      getAllTouchpointsForOwner(),
    ]);
  } catch (err) {
    console.error("Client tracker load failed:", err);
  }

  // Serialize dates to ISO strings at the server boundary so nothing
  // downstream can trip on Date/string ambiguity in the RSC payload.
  const serializedClients = clients.map((c) => ({
    id: c.id,
    name: c.name,
    company: c.company,
    email: c.email,
    nextAction: c.nextAction,
    dueDate: c.dueDate,
    status: c.status,
    notes: c.notes,
    valueCents: c.valueCents ?? 0,
    lastTouchedAt: c.lastTouchedAt ? new Date(c.lastTouchedAt).toISOString() : null,
    updatedAt: new Date(c.updatedAt).toISOString(),
  }));

  const serializedTouchpoints = touchpoints.map((t) => ({
    id: t.id,
    clientId: t.clientId,
    note: t.note,
    kind: t.kind,
    occurredAt: new Date(t.occurredAt).toISOString(),
  }));

  return (
    <>
      {serializedClients.length === 0 && (
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
        initialClients={serializedClients}
        initialTouchpoints={serializedTouchpoints}
        email={email}
      />
    </>
  );
}
