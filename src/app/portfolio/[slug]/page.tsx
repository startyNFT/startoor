import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicPortfolioPage } from "@/app/tools/portfolio-builder/actions";
import {
  PortfolioTemplateRenderer,
  type PortfolioPageData,
  type PortfolioTemplateKey,
} from "@/lib/portfolio-templates";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPublicPortfolioPage(slug);
  if (!data) return { title: "Not found" };
  const p = data.page;
  const title = `${p.displayName} — Portfolio`;
  const description = p.tagline ?? p.about ?? `Selected work by ${p.displayName}.`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function PublicPortfolioPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getPublicPortfolioPage(slug);
  if (!data) notFound();

  const pageData: PortfolioPageData = {
    slug: data.page.slug,
    template: data.page.template as PortfolioTemplateKey,
    displayName: data.page.displayName,
    role: data.page.role,
    tagline: data.page.tagline,
    about: data.page.about,
    avatarUrl: data.page.avatarUrl,
    accentColor: data.page.accentColor,
    backgroundColor: data.page.backgroundColor,
    location: data.page.location,
    contactEmail: data.page.contactEmail,
    website: data.page.website,
    socials: data.page.socials,
    projects: data.projects.map((p) => ({
      id: p.id,
      title: p.title,
      role: p.role,
      client: p.client,
      year: p.year,
      coverImage: p.coverImage,
      mediaUrls: p.mediaUrls,
      problem: p.problem,
      approach: p.approach,
      outcome: p.outcome,
      metrics: p.metrics,
      links: p.links,
    })),
  };

  return <PortfolioTemplateRenderer page={pageData} />;
}
