import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LANDING_TEMPLATES, getTemplate } from "@/lib/landing-templates";
import { PreviewControls } from "./preview-controls";

export async function generateStaticParams() {
  return LANDING_TEMPLATES.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tpl = getTemplate(slug);
  if (!tpl) return { title: "Template not found" };
  return {
    title: `${tpl.name} · Startoor template preview`,
    description: tpl.description,
    openGraph: {
      title: tpl.name,
      description: tpl.heroSummary,
      type: "website",
    },
  };
}

export default async function TemplatePreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tpl = getTemplate(slug);
  if (!tpl) notFound();

  const Component = tpl.Component;

  return (
    <div className="relative">
      <PreviewControls
        slug={tpl.slug}
        name={tpl.name}
        industry={tpl.industryLabel}
        heroSource={tpl.heroSource}
        fullSource={tpl.fullSource}
      />
      <Component />
    </div>
  );
}
