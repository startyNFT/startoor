import type { ReactNode } from "react";

export type PortfolioTemplateKey = "grid" | "story" | "editorial";

export const PORTFOLIO_TEMPLATES: {
  key: PortfolioTemplateKey;
  name: string;
  description: string;
  defaultAccent: string;
  defaultBg: string;
  sample: { bg: string; fg: string; accent: string };
}[] = [
  {
    key: "grid",
    name: "Grid",
    description: "Dense thumbnail gallery. Small mono captions. Click-to-expand detail.",
    defaultAccent: "#1F3A2F",
    defaultBg: "#F5F1E8",
    sample: { bg: "#F5F1E8", fg: "#1C1C1A", accent: "#1F3A2F" },
  },
  {
    key: "story",
    name: "Story",
    description: "Cinematic single-column scroll. Chapters. Long-form narrative.",
    defaultAccent: "#C85A3F",
    defaultBg: "#FAF6ED",
    sample: { bg: "#FAF6ED", fg: "#1C1C1A", accent: "#C85A3F" },
  },
  {
    key: "editorial",
    name: "Editorial",
    description: "Asymmetric broadsheet. Serif titles, mono meta, outcome tiles inline.",
    defaultAccent: "#1F3A2F",
    defaultBg: "#FAF6ED",
    sample: { bg: "#FAF6ED", fg: "#1C1C1A", accent: "#C85A3F" },
  },
];

export type PortfolioProjectData = {
  id: string;
  title: string;
  role: string | null;
  client: string | null;
  year: string | null;
  coverImage: string | null;
  mediaUrls: string[] | null;
  problem: string | null;
  approach: string | null;
  outcome: string | null;
  metrics: { label: string; value: string }[] | null;
  links: { label: string; url: string }[] | null;
};

export type PortfolioPageData = {
  slug: string;
  template: PortfolioTemplateKey;
  displayName: string;
  role: string | null;
  tagline: string | null;
  about: string | null;
  avatarUrl: string | null;
  accentColor: string | null;
  backgroundColor: string | null;
  location: string | null;
  contactEmail: string | null;
  website: string | null;
  socials: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    dribbble?: string;
    instagram?: string;
  } | null;
  projects: PortfolioProjectData[];
};

export function PortfolioTemplateRenderer({ page }: { page: PortfolioPageData }) {
  const Template =
    page.template === "story"
      ? StoryTemplate
      : page.template === "editorial"
        ? EditorialTemplate
        : GridTemplate;
  return <Template page={page} />;
}

// ---------- Grid ----------
function GridTemplate({ page }: { page: PortfolioPageData }) {
  const accent = page.accentColor || "#1F3A2F";
  const bg = page.backgroundColor || "#F5F1E8";
  return (
    <TemplateShell bg={bg}>
      <div className="mx-auto w-full max-w-6xl px-6 pt-14 pb-20 md:px-10 md:pt-20">
        {/* Masthead */}
        <header className="grid gap-6 border-b border-hairline pb-10 md:grid-cols-[auto_1fr_auto] md:items-end md:gap-10">
          <div className="flex items-center gap-4">
            {page.avatarUrl && (
              <div className="h-14 w-14 overflow-hidden rounded-full bg-stone-light/30">
                <Avatar src={page.avatarUrl} alt={page.displayName} />
              </div>
            )}
            <div className="min-w-0">
              <p
                className="font-mono text-[10px] uppercase tracking-[0.24em]"
                style={{ color: accent }}
              >
                Portfolio · /{page.slug}
              </p>
              <h1 className="mt-1 font-display text-3xl leading-none tracking-tight text-ink md:text-4xl">
                {page.displayName}
              </h1>
            </div>
          </div>
          <div className="min-w-0 md:px-6">
            {page.role && (
              <p className="font-sans text-sm uppercase tracking-[0.18em] text-ink-soft">
                {page.role}
              </p>
            )}
            {page.tagline && (
              <p className="mt-2 font-display text-lg italic leading-snug text-ink">
                {page.tagline}
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-4 font-mono text-[10px] uppercase tracking-[0.18em] text-stone md:justify-end">
            {page.location && <span>{page.location}</span>}
            {page.contactEmail && (
              <a href={`mailto:${page.contactEmail}`} className="hover:text-ink">
                {page.contactEmail}
              </a>
            )}
            {page.website && (
              <a href={page.website} target="_blank" rel="noopener noreferrer" className="hover:text-ink">
                {cleanDomain(page.website)} ↗
              </a>
            )}
          </div>
        </header>

        {page.about && (
          <section className="mx-auto mt-10 max-w-2xl text-center">
            <p className="font-display text-xl leading-relaxed text-ink md:text-2xl">
              {page.about}
            </p>
          </section>
        )}

        {/* Index line */}
        <div className="mt-14 flex items-baseline justify-between border-b border-hairline pb-3">
          <span
            className="font-mono text-[10px] uppercase tracking-[0.28em]"
            style={{ color: accent }}
          >
            Index — {String(page.projects.length).padStart(2, "0")} works
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone">
            Click any tile
          </span>
        </div>

        {/* Grid */}
        <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3">
          {page.projects.map((project, idx) => (
            <details
              key={project.id}
              className="group [&_summary::-webkit-details-marker]:hidden md:col-span-1 [&[open]]:col-span-2 [&[open]]:md:col-span-3"
            >
              <summary className="cursor-pointer list-none">
                <div className="group/tile">
                  <div
                    className="relative aspect-[4/5] w-full overflow-hidden bg-stone-light/20 transition-all group-hover/tile:shadow-warm-md"
                    style={{ border: `1px solid ${accent}18` }}
                  >
                    {project.coverImage ? (
                      <img
                        src={project.coverImage}
                        alt={project.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover/tile:scale-[1.03]"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <span
                          className="font-display text-6xl italic"
                          style={{ color: `${accent}30` }}
                        >
                          {(idx + 1).toString().padStart(2, "0")}
                        </span>
                      </div>
                    )}
                    <span
                      className="absolute left-2 top-2 font-mono text-[9px] uppercase tracking-[0.22em]"
                      style={{ color: accent }}
                    >
                      № {String(idx + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="mt-3 flex items-baseline gap-3 min-w-0">
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone tabular-nums shrink-0">
                      {project.year || "—"}
                    </span>
                    <span className="min-w-0 flex-1 truncate font-sans text-sm text-ink">
                      {project.title}
                    </span>
                  </div>
                  {project.role && (
                    <p className="ml-[3.5rem] font-mono text-[10px] uppercase tracking-[0.18em] text-stone">
                      {project.role}
                      {project.client ? ` · ${project.client}` : ""}
                    </p>
                  )}
                </div>
              </summary>
              <div
                className="mt-6 border-t-2 pt-6 animate-fade-up"
                style={{ borderColor: accent }}
              >
                <ProjectDetail project={project} accent={accent} />
              </div>
            </details>
          ))}
        </div>

        <ContactFooter page={page} accent={accent} variant="grid" />
        <Watermark color={accent} />
      </div>
    </TemplateShell>
  );
}

// ---------- Story ----------
function StoryTemplate({ page }: { page: PortfolioPageData }) {
  const accent = page.accentColor || "#C85A3F";
  const bg = page.backgroundColor || "#FAF6ED";
  return (
    <TemplateShell bg={bg}>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto w-full max-w-3xl px-6 pt-24 pb-24 md:pt-40 md:pb-32 text-center">
          <p
            className="font-mono text-[10px] uppercase tracking-[0.3em]"
            style={{ color: accent }}
          >
            A collected body of work by
          </p>
          {page.avatarUrl && (
            <div className="mx-auto mt-10 h-24 w-24 overflow-hidden rounded-full border-2 border-ink bg-stone-light/30">
              <Avatar src={page.avatarUrl} alt={page.displayName} />
            </div>
          )}
          <h1 className="mt-10 font-display text-[56px] leading-[0.96] tracking-tight text-ink md:text-[96px]">
            {page.displayName}
          </h1>
          {page.role && (
            <p className="mt-5 font-display text-xl italic text-ink-soft md:text-2xl">
              {page.role}
            </p>
          )}
          {page.tagline && (
            <p className="mx-auto mt-12 max-w-xl font-display text-2xl leading-snug text-ink md:text-3xl">
              &ldquo;{page.tagline}&rdquo;
            </p>
          )}
          <div className="mt-14 flex items-center justify-center gap-2">
            <span className="block h-[1px] w-10" style={{ background: accent }} />
            <span
              className="font-mono text-[10px] uppercase tracking-[0.3em]"
              style={{ color: accent }}
            >
              Scroll to read
            </span>
            <span className="block h-[1px] w-10" style={{ background: accent }} />
          </div>
        </div>
      </section>

      {page.about && (
        <section className="border-y border-hairline bg-bone/40">
          <div className="mx-auto w-full max-w-2xl px-6 py-20 md:py-28">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-stone">
              Prologue
            </p>
            <p className="mt-6 font-display text-2xl leading-relaxed text-ink md:text-3xl">
              {page.about}
            </p>
          </div>
        </section>
      )}

      {/* Chapters */}
      {page.projects.map((project, idx) => (
        <section key={project.id} className="border-b border-hairline">
          <div className="mx-auto w-full max-w-4xl px-6 py-24 md:py-32">
            <div className="mb-12 flex items-center gap-4">
              <span
                className="font-display text-5xl italic leading-none tabular-nums"
                style={{ color: accent }}
              >
                {String(idx + 1).padStart(2, "0")}
              </span>
              <span className="block h-[1px] flex-1" style={{ background: `${accent}40` }} />
              <span
                className="font-mono text-[10px] uppercase tracking-[0.3em]"
                style={{ color: accent }}
              >
                Chapter {romanize(idx + 1)}
              </span>
            </div>

            {/* Big hero image */}
            {project.coverImage && (
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-light/20 shadow-warm-lg">
                <img
                  src={project.coverImage}
                  alt={project.title}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            <div className="mt-12 flex flex-wrap items-baseline gap-x-6 gap-y-2 font-mono text-[10px] uppercase tracking-[0.24em] text-stone">
              {project.year && <span className="tabular-nums">{project.year}</span>}
              {project.role && <span>{project.role}</span>}
              {project.client && <span>for {project.client}</span>}
            </div>

            <h2 className="mt-4 font-display text-5xl leading-[0.98] tracking-tight text-ink md:text-7xl min-w-0">
              {project.title}
            </h2>

            {project.problem && (
              <div className="mt-12 grid gap-6 md:grid-cols-[10rem_1fr]">
                <p
                  className="font-mono text-[10px] uppercase tracking-[0.28em] pt-2"
                  style={{ color: accent }}
                >
                  The problem
                </p>
                <p className="font-display text-xl leading-relaxed text-ink md:text-2xl min-w-0">
                  {project.problem}
                </p>
              </div>
            )}

            {project.approach && (
              <div className="mt-10 grid gap-6 md:grid-cols-[10rem_1fr]">
                <p
                  className="font-mono text-[10px] uppercase tracking-[0.28em] pt-2"
                  style={{ color: accent }}
                >
                  The approach
                </p>
                <p className="font-sans text-lg leading-relaxed text-ink-soft min-w-0">
                  {project.approach}
                </p>
              </div>
            )}

            {/* Additional media */}
            {project.mediaUrls && project.mediaUrls.length > 0 && (
              <div className="mt-14 grid gap-6 md:grid-cols-2">
                {project.mediaUrls.map((url, i) => (
                  <div key={i} className="relative aspect-[4/3] overflow-hidden bg-stone-light/20">
                    <img src={url} alt="" className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            )}

            {project.outcome && (
              <div className="mt-14 rounded-sm border-l-4 pl-6 py-2" style={{ borderColor: accent }}>
                <p
                  className="font-mono text-[10px] uppercase tracking-[0.28em]"
                  style={{ color: accent }}
                >
                  The outcome
                </p>
                <p className="mt-3 font-display text-2xl leading-relaxed text-ink md:text-3xl min-w-0">
                  {project.outcome}
                </p>
              </div>
            )}

            {/* Metrics */}
            {project.metrics && project.metrics.length > 0 && (
              <div className="mt-14 grid gap-4 md:grid-cols-3">
                {project.metrics.map((m, i) => (
                  <div
                    key={i}
                    className="border-t-2 pt-4 min-w-0"
                    style={{ borderColor: accent }}
                  >
                    <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-stone truncate">
                      {m.label}
                    </p>
                    <p className="mt-2 font-display text-[22px] md:text-[26px] leading-tight tracking-tight text-ink tabular-nums min-w-0 break-words">
                      {m.value}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Links */}
            {project.links && project.links.length > 0 && (
              <div className="mt-12 flex flex-wrap gap-3">
                {project.links.map((l, i) => (
                  <a
                    key={i}
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-ink px-5 py-2 font-sans text-sm text-ink transition-colors hover:bg-ink hover:text-bone"
                  >
                    {l.label} <span>↗</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </section>
      ))}

      <ContactFooter page={page} accent={accent} variant="story" />
      <div className="pb-16">
        <Watermark color={accent} />
      </div>
    </TemplateShell>
  );
}

// ---------- Editorial ----------
function EditorialTemplate({ page }: { page: PortfolioPageData }) {
  const accent = page.accentColor || "#1F3A2F";
  const bg = page.backgroundColor || "#FAF6ED";
  return (
    <TemplateShell bg={bg}>
      <div className="mx-auto w-full max-w-6xl px-6 pt-14 pb-20 md:px-10 md:pt-16">
        {/* Masthead */}
        <header className="flex items-center justify-between border-b-2 border-ink pb-4">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink">
            The {page.displayName.split(" ")[0] || "Folio"} Quarterly
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone tabular-nums">
            Vol. 01 · /{page.slug}
          </span>
        </header>

        {/* Nameplate */}
        <section className="grid gap-8 pt-10 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-8 min-w-0">
            <p
              className="font-mono text-[10px] uppercase tracking-[0.28em]"
              style={{ color: accent }}
            >
              {page.role || "Practice"} · {page.location || "Everywhere"}
            </p>
            <h1 className="mt-4 font-display text-[60px] leading-[0.94] tracking-tight text-ink md:text-[108px] min-w-0">
              {page.displayName}
            </h1>
            {page.tagline && (
              <p
                className="mt-5 max-w-xl font-display text-2xl italic leading-snug md:text-3xl"
                style={{ color: accent }}
              >
                {page.tagline}
              </p>
            )}
          </div>
          <div className="md:col-span-4 min-w-0">
            {page.avatarUrl && (
              <div className="relative h-40 w-40 overflow-hidden stamp-rotate-1 shadow-warm-md">
                <Avatar src={page.avatarUrl} alt={page.displayName} />
              </div>
            )}
            {page.about && (
              <p className="mt-6 font-sans text-[13px] leading-relaxed text-ink-soft columns-1 [column-rule:1px_solid_var(--color-hairline)] [column-gap:1.5rem] md:columns-1">
                {page.about}
              </p>
            )}
          </div>
        </section>

        {/* Broadsheet projects */}
        <section className="mt-16 border-t-2 border-ink pt-3">
          <div className="flex items-baseline justify-between">
            <p
              className="font-mono text-[10px] uppercase tracking-[0.3em]"
              style={{ color: accent }}
            >
              Selected Works
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone tabular-nums">
              Page 01 of {String(page.projects.length).padStart(2, "0")}
            </p>
          </div>
        </section>

        <div className="mt-10 space-y-20">
          {page.projects.map((project, idx) => {
            const flip = idx % 2 === 1;
            return (
              <article key={project.id} className="grid gap-8 md:grid-cols-12 md:gap-10 relative">
                {/* Meta column */}
                <aside
                  className={`md:col-span-3 min-w-0 ${flip ? "md:order-3" : "md:order-1"}`}
                >
                  <div className="sticky top-12">
                    <p
                      className="font-display text-5xl italic leading-none tabular-nums"
                      style={{ color: accent }}
                    >
                      {String(idx + 1).padStart(2, "0")}
                    </p>
                    <div className="mt-6 space-y-2 font-mono text-[10px] uppercase tracking-[0.22em] text-stone">
                      {project.year && (
                        <p className="tabular-nums">
                          <span className="text-ink/40">Yr.</span> {project.year}
                        </p>
                      )}
                      {project.role && (
                        <p>
                          <span className="text-ink/40">Role.</span> {project.role}
                        </p>
                      )}
                      {project.client && (
                        <p className="truncate">
                          <span className="text-ink/40">For.</span> {project.client}
                        </p>
                      )}
                    </div>
                  </div>
                </aside>

                {/* Image column */}
                <div className={`md:col-span-5 min-w-0 ${flip ? "md:order-1" : "md:order-2"}`}>
                  {project.coverImage ? (
                    <div
                      className="relative aspect-[4/5] w-full overflow-hidden bg-stone-light/20"
                      style={{ border: `1px solid ${accent}30` }}
                    >
                      <img
                        src={project.coverImage}
                        alt={project.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div
                      className="flex aspect-[4/5] w-full items-center justify-center border"
                      style={{ borderColor: `${accent}30` }}
                    >
                      <span
                        className="font-display text-8xl italic"
                        style={{ color: `${accent}20` }}
                      >
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                    </div>
                  )}
                </div>

                {/* Copy column */}
                <div className={`md:col-span-4 min-w-0 ${flip ? "md:order-2" : "md:order-3"}`}>
                  <h2 className="font-display text-4xl leading-[1.02] tracking-tight text-ink md:text-5xl min-w-0">
                    {project.title}
                  </h2>
                  {project.problem && (
                    <p className="mt-5 font-display text-lg italic leading-relaxed text-ink-soft min-w-0">
                      {project.problem}
                    </p>
                  )}
                  {project.approach && (
                    <p
                      className="mt-5 font-sans text-[13.5px] leading-[1.7] text-ink-soft [column-count:1] md:[column-count:2] [column-gap:1.5rem] [column-rule:1px_solid_var(--color-hairline)] min-w-0"
                      style={{ hyphens: "auto" }}
                    >
                      {project.approach}
                    </p>
                  )}
                  {project.outcome && (
                    <div className="mt-6 border-y border-hairline py-3">
                      <span
                        className="font-mono text-[9px] uppercase tracking-[0.3em]"
                        style={{ color: accent }}
                      >
                        Outcome →
                      </span>
                      <p className="mt-1 font-display text-lg leading-snug text-ink min-w-0">
                        {project.outcome}
                      </p>
                    </div>
                  )}
                  {project.metrics && project.metrics.length > 0 && (
                    <div className="mt-6 grid grid-cols-3 gap-2">
                      {project.metrics.map((m, i) => (
                        <div
                          key={i}
                          className="min-w-0 border p-2.5"
                          style={{ borderColor: `${accent}40` }}
                        >
                          <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-stone truncate">
                            {m.label}
                          </p>
                          <p
                            className="mt-1 font-display text-[22px] md:text-[26px] leading-none tracking-tight tabular-nums min-w-0 break-words"
                            style={{ color: accent }}
                          >
                            {m.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                  {project.links && project.links.length > 0 && (
                    <div className="mt-5 flex flex-wrap gap-x-4 gap-y-1">
                      {project.links.map((l, i) => (
                        <a
                          key={i}
                          href={l.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink hover:text-clay"
                          style={{ borderBottom: `1px solid ${accent}60` }}
                        >
                          {l.label} ↗
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        <ContactFooter page={page} accent={accent} variant="editorial" />
        <Watermark color={accent} />
      </div>
    </TemplateShell>
  );
}

// ---------- Shared bits ----------

function ProjectDetail({
  project,
  accent,
}: {
  project: PortfolioProjectData;
  accent: string;
}) {
  return (
    <div className="grid gap-8 md:grid-cols-12 md:gap-10">
      <div className="md:col-span-7 min-w-0">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 font-mono text-[10px] uppercase tracking-[0.24em] text-stone">
          {project.year && <span className="tabular-nums">{project.year}</span>}
          {project.role && <span>{project.role}</span>}
          {project.client && <span>· {project.client}</span>}
        </div>
        <h3 className="mt-2 font-display text-[28px] leading-[1.02] tracking-tight text-ink min-w-0">
          {project.title}
        </h3>
        {project.problem && (
          <div className="mt-5">
            <p
              className="font-mono text-[10px] uppercase tracking-[0.24em]"
              style={{ color: accent }}
            >
              Problem
            </p>
            <p className="mt-2 font-sans text-[14.5px] leading-relaxed text-ink min-w-0">
              {project.problem}
            </p>
          </div>
        )}
        {project.approach && (
          <div className="mt-5">
            <p
              className="font-mono text-[10px] uppercase tracking-[0.24em]"
              style={{ color: accent }}
            >
              Approach
            </p>
            <p className="mt-2 font-sans text-[14.5px] leading-relaxed text-ink-soft min-w-0">
              {project.approach}
            </p>
          </div>
        )}
        {project.outcome && (
          <div className="mt-5 border-l-2 pl-4 py-1" style={{ borderColor: accent }}>
            <p
              className="font-mono text-[10px] uppercase tracking-[0.24em]"
              style={{ color: accent }}
            >
              Outcome
            </p>
            <p className="mt-2 font-display text-lg leading-snug text-ink min-w-0">
              {project.outcome}
            </p>
          </div>
        )}
        {project.links && project.links.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-3">
            {project.links.map((l, i) => (
              <a
                key={i}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-ink px-4 py-1.5 font-sans text-xs text-ink transition-colors hover:bg-ink hover:text-bone"
              >
                {l.label} ↗
              </a>
            ))}
          </div>
        )}
      </div>
      <div className="md:col-span-5 min-w-0">
        {project.metrics && project.metrics.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {project.metrics.map((m, i) => (
              <div
                key={i}
                className="border-t-2 pt-3 min-w-0"
                style={{ borderColor: accent }}
              >
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-stone truncate">
                  {m.label}
                </p>
                <p className="mt-1.5 font-display text-[22px] md:text-[26px] leading-none tracking-tight text-ink tabular-nums min-w-0 break-words">
                  {m.value}
                </p>
              </div>
            ))}
          </div>
        )}
        {project.mediaUrls && project.mediaUrls.length > 0 && (
          <div className="mt-5 grid grid-cols-2 gap-3">
            {project.mediaUrls.slice(0, 4).map((url, i) => (
              <div
                key={i}
                className="aspect-[4/3] overflow-hidden bg-stone-light/20"
              >
                <img src={url} alt="" className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ContactFooter({
  page,
  accent,
  variant,
}: {
  page: PortfolioPageData;
  accent: string;
  variant: "grid" | "story" | "editorial";
}) {
  const socials = page.socials || {};
  const socialEntries = Object.entries(socials).filter(([, v]) => v && v.length > 0);
  const hasContact =
    page.contactEmail || page.website || socialEntries.length > 0;
  if (!hasContact) return null;

  if (variant === "story") {
    return (
      <section className="bg-ink text-bone">
        <div className="mx-auto max-w-3xl px-6 py-24 text-center md:py-32">
          <p
            className="font-mono text-[10px] uppercase tracking-[0.3em]"
            style={{ color: accent }}
          >
            Epilogue
          </p>
          <h2 className="mt-6 font-display text-4xl leading-tight tracking-tight md:text-6xl">
            Say hello.
          </h2>
          {page.contactEmail && (
            <a
              href={`mailto:${page.contactEmail}`}
              className="mt-8 inline-block font-display text-2xl italic underline decoration-2 underline-offset-8 hover:text-butter md:text-3xl"
            >
              {page.contactEmail}
            </a>
          )}
          {socialEntries.length > 0 && (
            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-mono text-[10px] uppercase tracking-[0.24em] text-bone/60">
              {socialEntries.map(([k, v]) => (
                <a
                  key={k}
                  href={socialUrl(k, v as string)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-butter"
                >
                  {k} ↗
                </a>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="mt-24 border-t-2 border-ink pt-10">
      <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
        <div className="min-w-0">
          <p
            className="font-mono text-[10px] uppercase tracking-[0.3em]"
            style={{ color: accent }}
          >
            Let&apos;s work
          </p>
          <h2 className="mt-3 font-display text-4xl leading-tight tracking-tight text-ink md:text-5xl min-w-0">
            Open for select{" "}
            <span className="italic" style={{ color: accent }}>
              commissions.
            </span>
          </h2>
        </div>
        <div className="flex flex-col items-start gap-3 md:items-end">
          {page.contactEmail && (
            <a
              href={`mailto:${page.contactEmail}`}
              className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-sans text-sm text-bone transition-colors hover:bg-forest"
            >
              {page.contactEmail} →
            </a>
          )}
          {socialEntries.length > 0 && (
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 font-mono text-[10px] uppercase tracking-[0.22em] text-stone">
              {socialEntries.map(([k, v]) => (
                <a
                  key={k}
                  href={socialUrl(k, v as string)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-ink"
                >
                  {k} ↗
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function TemplateShell({ bg, children }: { bg: string; children: ReactNode }) {
  const style = bg.includes("gradient") ? { background: bg } : { backgroundColor: bg };
  return (
    <div className="min-h-screen w-full" style={style}>
      {children}
    </div>
  );
}

function Avatar({ src, alt }: { src: string; alt: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className="h-full w-full object-cover" />
  );
}

function cleanDomain(url: string) {
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function socialUrl(kind: string, handle: string) {
  if (handle.startsWith("http")) return handle;
  const h = handle.replace(/^@/, "");
  switch (kind) {
    case "twitter":
      return `https://twitter.com/${h}`;
    case "linkedin":
      return `https://linkedin.com/in/${h}`;
    case "github":
      return `https://github.com/${h}`;
    case "dribbble":
      return `https://dribbble.com/${h}`;
    case "instagram":
      return `https://instagram.com/${h}`;
    default:
      return handle;
  }
}

function romanize(n: number) {
  const map: [number, string][] = [
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];
  let result = "";
  let num = n;
  for (const [val, sym] of map) {
    while (num >= val) {
      result += sym;
      num -= val;
    }
  }
  return result;
}

function Watermark({ color }: { color: string }) {
  return (
    <div className="mt-16 w-full text-center">
      <a
        href="/tools/portfolio-builder"
        className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-stone transition-colors hover:text-ink"
      >
        Made with{" "}
        <span className="font-display text-xs italic" style={{ color }}>
          Startoor Portfolio Builder
        </span>
        →
      </a>
    </div>
  );
}
