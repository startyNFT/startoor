import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicBioPage } from "@/app/tools/link-in-bio/actions";
import { BioTemplateRenderer, type BioPageData } from "@/lib/bio-templates";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPublicBioPage(slug);
  if (!data) return { title: "Not found" };
  return {
    title: `${data.page.displayName} · @${data.page.slug}`,
    description: data.page.bio ?? data.page.headline ?? `${data.page.displayName}'s links`,
  };
}

export default async function PublicBioPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getPublicBioPage(slug);
  if (!data) notFound();

  const pageData: BioPageData = {
    slug: data.page.slug,
    template: data.page.template as BioPageData["template"],
    displayName: data.page.displayName,
    headline: data.page.headline,
    bio: data.page.bio,
    avatarUrl: data.page.avatarUrl,
    accentColor: data.page.accentColor,
    backgroundColor: data.page.backgroundColor,
    location: data.page.location,
    links: data.links.map((l) => ({ id: l.id, label: l.label, url: l.url })),
  };

  return <BioTemplateRenderer page={pageData} />;
}
