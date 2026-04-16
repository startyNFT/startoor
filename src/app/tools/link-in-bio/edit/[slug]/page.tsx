import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { BioBuilder, type BuilderInitial } from "../../builder";
import { getBioPageForEdit, getCurrentEmail, deleteBioPage } from "../../actions";
import type { BioTemplateKey } from "@/lib/bio-templates";

export const metadata: Metadata = {
  title: "Edit your bio page",
  robots: { index: false, follow: false },
};

export default async function EditBioPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const [{ slug }, { saved }] = await Promise.all([params, searchParams]);
  const email = await getCurrentEmail();
  if (!email) {
    redirect("/tools/link-in-bio");
  }
  const data = await getBioPageForEdit(slug);
  if (!data) notFound();
  const { page, links } = data;

  const initial: BuilderInitial = {
    slug: page.slug,
    template: page.template as BioTemplateKey,
    displayName: page.displayName,
    headline: page.headline ?? "",
    bio: page.bio ?? "",
    avatarUrl: page.avatarUrl ?? "",
    accentColor: page.accentColor ?? "",
    backgroundColor: page.backgroundColor ?? "",
    location: page.location ?? "",
    links: links.map((l) => ({ label: l.label, url: l.url })),
  };

  return (
    <div className="mx-auto max-w-7xl px-6 pb-24 pt-14 md:px-10">
      <header className="mb-10 flex flex-col gap-4 border-b border-hairline pb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-clay">
            Your page · startoor.vercel.app/bio/{page.slug}
          </span>
          <h1 className="mt-3 font-display text-4xl leading-[0.95] tracking-tight text-ink md:text-5xl">
            Tuning{" "}
            <span className="italic text-forest">{page.displayName || page.slug}</span>.
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/bio/${page.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-ink px-5 py-2 font-sans text-sm text-ink transition-colors hover:bg-ink hover:text-bone"
          >
            View live ↗
          </Link>
          <form action={deleteBioPage}>
            <input type="hidden" name="slug" value={page.slug} />
            <button
              type="submit"
              className="inline-flex items-center gap-2 font-sans text-sm text-stone underline underline-offset-[6px] hover:text-clay"
            >
              Delete page
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

      <BioBuilder mode="edit" initial={initial} />
    </div>
  );
}
