import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { sellerApplications } from "@/lib/schema";
import { formatDate } from "@/lib/formatters";
import { checkAdmin, logout, updateApplicationStatusAction } from "../actions";

export const metadata: Metadata = {
  title: "Applications · Admin",
  robots: { index: false, follow: false },
};

export default async function AdminApplicationsPage() {
  if (!(await checkAdmin())) {
    redirect("/admin");
  }
  const applications = await db
    .select()
    .from(sellerApplications)
    .orderBy(desc(sellerApplications.createdAt));

  const pending = applications.filter((a) => a.status === "pending");
  const decided = applications.filter((a) => a.status !== "pending");

  return (
    <div className="border-t border-hairline">
      <div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-24">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-clay">
              Admin
            </span>
            <h1 className="mt-4 font-display text-5xl leading-[0.95] tracking-tight text-ink">
              Applications ({applications.length})
            </h1>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="font-sans text-sm text-ink-soft underline underline-offset-[6px] hover:text-ink"
            >
              Sign out
            </button>
          </form>
        </div>

        {pending.length > 0 && (
          <section className="mt-14">
            <h2 className="font-display text-2xl tracking-tight text-ink">
              Pending review ({pending.length})
            </h2>
            <div className="mt-8 space-y-6">
              {pending.map((app) => (
                <ApplicationCard key={app.id} app={app} allowDecision />
              ))}
            </div>
          </section>
        )}

        {decided.length > 0 && (
          <section className="mt-16">
            <h2 className="font-display text-2xl tracking-tight text-ink">
              Decided ({decided.length})
            </h2>
            <div className="mt-8 space-y-6">
              {decided.map((app) => (
                <ApplicationCard key={app.id} app={app} />
              ))}
            </div>
          </section>
        )}

        {applications.length === 0 && (
          <p className="mt-16 font-sans text-ink-soft">
            No applications yet.
          </p>
        )}
      </div>
    </div>
  );
}

function ApplicationCard({
  app,
  allowDecision,
}: {
  app: typeof sellerApplications.$inferSelect;
  allowDecision?: boolean;
}) {
  return (
    <article className="border border-hairline bg-bone p-7">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone">
            {formatDate(app.createdAt)} · {app.status.toUpperCase()}
          </span>
          <h3 className="mt-2 font-display text-2xl tracking-tight text-ink">
            {app.displayName}
          </h3>
          <p className="font-sans text-sm text-ink-soft">
            {app.name} · <a href={`mailto:${app.email}`} className="underline">{app.email}</a>
          </p>
        </div>
        {allowDecision && (
          <div className="flex items-center gap-2">
            <form action={updateApplicationStatusAction}>
              <input type="hidden" name="applicationId" value={app.id} />
              <input type="hidden" name="status" value="approved" />
              <button
                type="submit"
                className="rounded-full bg-forest px-4 py-2 font-sans text-sm text-bone hover:bg-forest-soft"
              >
                Approve
              </button>
            </form>
            <form action={updateApplicationStatusAction}>
              <input type="hidden" name="applicationId" value={app.id} />
              <input type="hidden" name="status" value="rejected" />
              <button
                type="submit"
                className="rounded-full border border-hairline px-4 py-2 font-sans text-sm text-ink hover:border-ink"
              >
                Reject
              </button>
            </form>
          </div>
        )}
      </header>
      <div className="mt-5 grid gap-4 border-t border-hairline pt-5 md:grid-cols-2">
        <dl className="space-y-2 font-sans text-sm">
          {app.website && <Meta label="Website" value={app.website} link />}
          {app.twitter && <Meta label="Twitter" value={app.twitter} />}
          {app.portfolio && <Meta label="Portfolio" value={app.portfolio} />}
          {app.priceRange && <Meta label="Price range" value={app.priceRange} />}
          {app.launchTimeline && <Meta label="Timeline" value={app.launchTimeline} />}
        </dl>
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
            Pitch
          </span>
          <p className="mt-2 whitespace-pre-wrap font-sans text-sm leading-relaxed text-ink">
            {app.productPitch}
          </p>
        </div>
      </div>
    </article>
  );
}

function Meta({ label, value, link }: { label: string; value: string; link?: boolean }) {
  return (
    <div className="flex gap-3">
      <dt className="min-w-28 font-mono text-[10px] uppercase tracking-[0.18em] text-stone">
        {label}
      </dt>
      <dd className="text-ink">
        {link ? (
          <a
            href={value.startsWith("http") ? value : `https://${value}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4"
          >
            {value}
          </a>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}
