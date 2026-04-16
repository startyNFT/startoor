import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PortfolioBuilder, type BuilderInitial } from "./builder";
import { SignInForm } from "./signin-form";
import { getCurrentEmail, getMyPortfolioPage } from "./actions";
import { PORTFOLIO_TEMPLATES } from "@/lib/portfolio-templates";

export const metadata: Metadata = {
  title: "Portfolio Builder · Try it",
  description:
    "Publish a real portfolio in minutes. Three editorial templates. Case studies, metrics, live preview.",
};

export default async function PortfolioBuilderPage() {
  const email = await getCurrentEmail();
  if (email) {
    const existing = await getMyPortfolioPage();
    if (existing) {
      redirect(`/tools/portfolio-builder/edit/${existing.slug}`);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-6 pb-24 pt-14 md:px-10">
      <header className="mb-12 flex flex-col gap-4 border-b border-hairline pb-10 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-clay">
            Try it · Portfolio Builder
          </span>
          <h1 className="mt-3 font-display text-5xl leading-[0.95] tracking-tight text-ink md:text-6xl">
            A portfolio that reads like a
            <br />
            <span className="italic text-forest">magazine feature.</span>
          </h1>
        </div>
        <p className="max-w-sm font-sans text-sm leading-relaxed text-ink-soft">
          Pick a layout. Write your case studies — problem, approach, outcome,
          a few metrics. Publish to a real URL in minutes.
        </p>
      </header>

      {!email ? (
        <div className="max-w-xl">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-clay">
            Step 1
          </span>
          <h2 className="mt-2 font-display text-3xl tracking-tight text-ink md:text-4xl">
            What email should we tie this to?
          </h2>
          <p className="mt-4 font-sans text-sm leading-relaxed text-ink-soft">
            We use it to let you come back and edit later. No password, no
            magic link — just enter your email and start.
          </p>
          <div className="mt-8">
            <SignInForm />
          </div>
        </div>
      ) : (
        <PortfolioBuilder mode="create" initial={buildInitial(email)} />
      )}
    </div>
  );
}

function buildInitial(email: string): BuilderInitial {
  const defaultTpl = PORTFOLIO_TEMPLATES[0];
  const handle =
    email.split("@")[0].replace(/[^a-z0-9]/g, "").slice(0, 20) || "your-folio";
  return {
    slug: handle,
    template: "grid",
    displayName: "",
    role: "",
    tagline: "",
    about: "",
    avatarUrl: "",
    accentColor: defaultTpl.defaultAccent,
    backgroundColor: defaultTpl.defaultBg,
    location: "",
    contactEmail: email,
    website: "",
    socials: {},
    projects: [
      {
        title: "",
        role: "",
        client: "",
        year: "",
        coverImage: "",
        mediaUrls: [],
        problem: "",
        approach: "",
        outcome: "",
        metrics: [],
        links: [],
      },
    ],
  };
}
