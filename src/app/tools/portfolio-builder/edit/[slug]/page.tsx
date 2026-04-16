import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PortfolioBuilder, type BuilderInitial } from "../../builder";
import {
  getPortfolioPageForEdit,
  getCurrentEmail,
  deletePortfolioPage,
} from "../../actions";
import type { PortfolioTemplateKey } from "@/lib/portfolio-templates";

export const metadata: Metadata = {
  title: "Edit your portfolio",
  robots: { index: false, follow: false },
};

export default async function EditPortfolioPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const [{ slug }, { saved }] = await Promise.all([params, searchParams]);
  const email = await getCurrentEmail();
  if (!email) {
    redirect("/tools/portfolio-builder");
  }
  const data = await getPortfolioPageForEdit(slug);
  if (!data) notFound();
  const { page, projects } = data;

  const initial: BuilderInitial = {
    slug: page.slug,
    template: page.template as PortfolioTemplateKey,
    displayName: page.displayName,
    role: page.role ?? "",
    tagline: page.tagline ?? "",
    about: page.about ?? "",
    avatarUrl: page.avatarUrl ?? "",
    accentColor: page.accentColor ?? "",
    backgroundColor: page.backgroundColor ?? "",
    location: page.location ?? "",
    contactEmail: page.contactEmail ?? "",
    website: page.website ?? "",
    socials: page.socials ?? {},
    projects: projects.map((p) => ({
      title: p.title,
      role: p.role ?? "",
      client: p.client ?? "",
      year: p.year ?? "",
      coverImage: p.coverImage ?? "",
      mediaUrls: p.mediaUrls ?? [],
      problem: p.problem ?? "",
      approach: p.approach ?? "",
      outcome: p.outcome ?? "",
      metrics: p.metrics ?? [],
      links: p.links ?? [],
    })),
  };

  return (
    <div className="mx-auto max-w-7xl px-6 pb-24 pt-14 md:px-10">
      <header className="mb-10 flex flex-col gap-4 border-b border-hairline pb-8 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-clay">
            Your portfolio · startoor.vercel.app/portfolio/{page.slug}
          </span>
          <h1 className="mt-3 font-display text-4xl leading-[0.95] tracking-tight text-ink md:text-5xl min-w-0">
            Tuning{" "}
            <span className="italic text-forest">
              {page.displayName || page.slug}
            </span>
            .
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/portfolio/${page.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-ink px-5 py-2 font-sans text-sm text-ink transition-colors hover:bg-ink hover:text-bone"
          >
            View live ↗
          </Link>
          <form action={deletePortfolioPage}>
            <input type="hidden" name="slug" value={page.slug} />
            <button
              type="submit"
              className="inline-flex items-center gap-2 font-sans text-sm text-stone underline underline-offset-[6px] hover:text-clay"
            >
              Delete portfolio
            </button>
          </form>
        </div>
      </header>

      {saved === "1" && (
        <div className="mb-8 flex items-center gap-3 border border-hairline bg-bone px-4 py-3">
          <span className="inline-block h-2 w-2 rounded-full bg-forest" />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink">
            Saved — changes are live
          </span>
        </div>
      )}

      <PortfolioBuilder mode="edit" initial={initial} />
    </div>
  );
}
