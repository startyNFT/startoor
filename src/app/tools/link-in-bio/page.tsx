import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BioBuilder, type BuilderInitial } from "./builder";
import { SignInForm } from "./signin-form";
import { getCurrentEmail, getMyBioPage } from "./actions";
import { BIO_TEMPLATES } from "@/lib/bio-templates";

export const metadata: Metadata = {
  title: "Link-in-Bio Maker · Try it",
  description:
    "Build a beautiful link page in minutes. Four templates, custom domain, live preview.",
};

export default async function LinkInBioPage() {
  const email = await getCurrentEmail();
  if (email) {
    const existing = await getMyBioPage();
    if (existing) {
      redirect(`/tools/link-in-bio/edit/${existing.slug}`);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-6 pb-24 pt-14 md:px-10">
      <header className="mb-12 flex flex-col gap-4 border-b border-hairline pb-10 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-clay">
            Try it · Link-in-Bio Maker
          </span>
          <h1 className="mt-3 font-display text-5xl leading-[0.95] tracking-tight text-ink md:text-6xl">
            Build a bio page that
            <br />
            <span className="italic text-forest">looks like you.</span>
          </h1>
        </div>
        <p className="max-w-sm font-sans text-sm leading-relaxed text-ink-soft">
          Pick one of four templates. Customize. Get a real, shareable URL
          in under two minutes. Everything autosaves.
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
        <BioBuilder mode="create" initial={buildInitial(email)} />
      )}
    </div>
  );
}

function buildInitial(email: string): BuilderInitial {
  const defaultTpl = BIO_TEMPLATES[0];
  const handle = email.split("@")[0].replace(/[^a-z0-9]/g, "").slice(0, 20) || "your-handle";
  return {
    slug: handle,
    template: "classic",
    displayName: "",
    headline: "",
    bio: "",
    avatarUrl: "",
    accentColor: defaultTpl.defaultAccent,
    backgroundColor: defaultTpl.defaultBg,
    location: "",
    links: [
      { label: "", url: "" },
    ],
  };
}
