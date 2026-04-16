import type { ReactNode } from "react";

export type BioTemplateKey = "classic" | "night" | "editorial" | "sunset";

export const BIO_TEMPLATES: {
  key: BioTemplateKey;
  name: string;
  description: string;
  defaultAccent: string;
  defaultBg: string;
  sample: { bg: string; fg: string; accent: string };
}[] = [
  {
    key: "classic",
    name: "Classic",
    description: "Warm paper. Serif headline. Quietly elegant.",
    defaultAccent: "#C85A3F",
    defaultBg: "#F5F1E8",
    sample: { bg: "#F5F1E8", fg: "#1C1C1A", accent: "#C85A3F" },
  },
  {
    key: "night",
    name: "Night",
    description: "Inky black. Monospace. Stark and direct.",
    defaultAccent: "#E8C77F",
    defaultBg: "#0E0E0C",
    sample: { bg: "#0E0E0C", fg: "#FAF6ED", accent: "#E8C77F" },
  },
  {
    key: "editorial",
    name: "Editorial",
    description: "Magazine-spread asymmetry. Big type, hairline rules.",
    defaultAccent: "#1F3A2F",
    defaultBg: "#FAF6ED",
    sample: { bg: "#FAF6ED", fg: "#1F3A2F", accent: "#C85A3F" },
  },
  {
    key: "sunset",
    name: "Sunset",
    description: "A warm gradient. Friendly, rounded, alive.",
    defaultAccent: "#C85A3F",
    defaultBg: "#F5E2C5",
    sample: { bg: "linear-gradient(180deg,#F5E2C5,#E8A17F)", fg: "#2C1A14", accent: "#2C1A14" },
  },
];

export type BioPageData = {
  slug: string;
  template: BioTemplateKey;
  displayName: string;
  headline: string | null;
  bio: string | null;
  avatarUrl: string | null;
  accentColor: string | null;
  backgroundColor: string | null;
  location: string | null;
  links: { id: string; label: string; url: string }[];
};

export function BioTemplateRenderer({ page }: { page: BioPageData }) {
  const Template =
    page.template === "night"
      ? NightTemplate
      : page.template === "editorial"
        ? EditorialTemplate
        : page.template === "sunset"
          ? SunsetTemplate
          : ClassicTemplate;
  return <Template page={page} />;
}

// ---------- Classic ----------
function ClassicTemplate({ page }: { page: BioPageData }) {
  const accent = page.accentColor || "#C85A3F";
  const bg = page.backgroundColor || "#F5F1E8";
  return (
    <TemplateShell bg={bg}>
      <div className="mx-auto flex w-full max-w-md flex-col items-center px-6 pt-16 pb-12 md:pt-24">
        {page.avatarUrl && (
          <div
            className="relative h-28 w-28 overflow-hidden rounded-full bg-stone-light/30 ring-[6px]"
            style={{ boxShadow: `0 0 0 2px ${accent}` }}
          >
            <Avatar src={page.avatarUrl} alt={page.displayName} />
          </div>
        )}
        <p
          className="mt-4 font-mono text-[10px] uppercase tracking-[0.28em]"
          style={{ color: accent }}
        >
          {page.location || "Somewhere on earth"}
        </p>
        <h1
          className="mt-3 text-center font-display text-4xl leading-[1.02] tracking-tight md:text-5xl"
          style={{ color: "#1C1C1A" }}
        >
          {page.displayName}
        </h1>
        {page.headline && (
          <p
            className="mt-3 text-center font-display text-lg leading-snug italic"
            style={{ color: accent }}
          >
            {page.headline}
          </p>
        )}
        {page.bio && (
          <p className="mt-5 max-w-sm text-center font-sans text-[15px] leading-relaxed text-ink-soft">
            {page.bio}
          </p>
        )}
        <div className="mt-10 w-full space-y-3">
          {page.links.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block rounded-full border border-ink bg-paper px-5 py-4 text-center font-sans text-[15px] text-ink transition-all hover:-translate-y-0.5 hover:shadow-warm-md"
            >
              <span className="inline-flex items-center justify-center gap-3">
                {link.label}
                <span
                  className="transition-transform group-hover:translate-x-0.5"
                  style={{ color: accent }}
                >
                  →
                </span>
              </span>
            </a>
          ))}
        </div>
        <Watermark color={accent} />
      </div>
    </TemplateShell>
  );
}

// ---------- Night ----------
function NightTemplate({ page }: { page: BioPageData }) {
  const accent = page.accentColor || "#E8C77F";
  const bg = page.backgroundColor || "#0E0E0C";
  return (
    <TemplateShell bg={bg}>
      <div className="mx-auto flex w-full max-w-lg flex-col px-6 pt-16 pb-12 md:pt-24">
        <header className="flex items-baseline justify-between">
          <span
            className="font-mono text-[10px] uppercase tracking-[0.28em]"
            style={{ color: accent }}
          >
            ▲ /{page.slug}
          </span>
          {page.location && (
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-bone/50">
              {page.location}
            </span>
          )}
        </header>
        <div className="mt-16">
          {page.avatarUrl && (
            <div className="relative h-20 w-20 overflow-hidden bg-bone/5">
              <Avatar src={page.avatarUrl} alt={page.displayName} />
            </div>
          )}
          <h1 className="mt-7 font-mono text-4xl uppercase leading-[1] tracking-[-0.02em] text-bone md:text-[54px]">
            {page.displayName}
          </h1>
          {page.headline && (
            <p
              className="mt-6 max-w-md font-sans text-lg leading-snug"
              style={{ color: accent }}
            >
              {page.headline}
            </p>
          )}
          {page.bio && (
            <p className="mt-4 max-w-md font-sans text-[15px] leading-relaxed text-bone/75">
              {page.bio}
            </p>
          )}
        </div>
        <div className="mt-16 border-t border-bone/15">
          {page.links.map((link, idx) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between border-b border-bone/15 py-5 transition-colors hover:bg-bone/5"
            >
              <div className="flex items-center gap-6">
                <span className="font-mono text-xs text-bone/40 tabular-nums">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <span className="font-sans text-base text-bone">{link.label}</span>
              </div>
              <span
                className="font-mono text-xs transition-transform group-hover:translate-x-1"
                style={{ color: accent }}
              >
                ↗
              </span>
            </a>
          ))}
        </div>
        <WatermarkDark color={accent} />
      </div>
    </TemplateShell>
  );
}

// ---------- Editorial ----------
function EditorialTemplate({ page }: { page: BioPageData }) {
  const accent = page.accentColor || "#1F3A2F";
  const bg = page.backgroundColor || "#FAF6ED";
  return (
    <TemplateShell bg={bg}>
      <div className="mx-auto w-full max-w-2xl px-6 pt-16 pb-12 md:pt-24">
        <header className="flex items-center gap-3">
          <span className="block h-[1px] w-10" style={{ background: "#1C1C1A" }} />
          <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-stone">
            Issue 01 · /{page.slug}
          </span>
        </header>
        <div className="mt-10 grid items-end gap-6 md:grid-cols-[1fr_auto]">
          <h1 className="font-display text-[56px] leading-[0.95] tracking-tight md:text-[80px]">
            <span className="block text-ink">{page.displayName}</span>
            {page.headline && (
              <span className="block italic text-[0.85em]" style={{ color: accent }}>
                {page.headline}
              </span>
            )}
          </h1>
          {page.avatarUrl && (
            <div className="relative h-28 w-28 overflow-hidden stamp-rotate-2">
              <Avatar src={page.avatarUrl} alt={page.displayName} />
            </div>
          )}
        </div>
        {page.bio && (
          <p className="mt-8 max-w-xl border-l-2 pl-5 font-display text-xl leading-relaxed text-ink md:text-2xl" style={{ borderColor: accent }}>
            {page.bio}
          </p>
        )}
        <div className="mt-14 hairline pt-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.24em]" style={{ color: accent }}>
            Read on →
          </p>
          <ul className="mt-6 divide-y divide-hairline">
            {page.links.map((link) => (
              <li key={link.id}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-baseline justify-between gap-6 py-5 transition-colors"
                >
                  <span className="font-display text-2xl leading-tight tracking-tight text-ink transition-colors group-hover:text-clay md:text-3xl">
                    {link.label}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone transition-colors group-hover:text-clay">
                    {cleanDomain(link.url)} →
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
        {page.location && (
          <footer className="mt-14 flex items-center justify-between hairline pt-5 font-mono text-[10px] uppercase tracking-[0.24em] text-stone">
            <span>Filed from {page.location}</span>
            <span>/{page.slug}</span>
          </footer>
        )}
        <Watermark color={accent} />
      </div>
    </TemplateShell>
  );
}

// ---------- Sunset ----------
function SunsetTemplate({ page }: { page: BioPageData }) {
  const accent = page.accentColor || "#2C1A14";
  const bg =
    page.backgroundColor ||
    "linear-gradient(180deg, #F8E4C3 0%, #EFC199 45%, #E08A61 100%)";
  return (
    <TemplateShell bg={bg}>
      <div className="mx-auto flex w-full max-w-md flex-col items-center px-6 pt-16 pb-12 md:pt-24">
        {page.avatarUrl && (
          <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-warm-white bg-stone-light/30 shadow-warm-lg">
            <Avatar src={page.avatarUrl} alt={page.displayName} />
          </div>
        )}
        <h1 className="mt-6 text-center font-display text-5xl leading-[1.02] tracking-tight" style={{ color: accent }}>
          {page.displayName}
        </h1>
        {page.headline && (
          <p className="mt-3 text-center font-display text-lg italic" style={{ color: accent, opacity: 0.85 }}>
            {page.headline}
          </p>
        )}
        {page.bio && (
          <p className="mt-5 max-w-sm text-center font-sans text-[15px] leading-relaxed" style={{ color: accent, opacity: 0.82 }}>
            {page.bio}
          </p>
        )}
        <div className="mt-10 w-full space-y-3">
          {page.links.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block rounded-2xl border-2 border-transparent bg-warm-white/80 px-5 py-4 text-center font-sans text-[15px] backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-current hover:bg-warm-white"
              style={{ color: accent }}
            >
              <span className="inline-flex items-center justify-center gap-2">
                {link.label}
                <span className="transition-transform group-hover:translate-x-0.5">↗</span>
              </span>
            </a>
          ))}
        </div>
        {page.location && (
          <p className="mt-10 font-mono text-[10px] uppercase tracking-[0.24em]" style={{ color: accent, opacity: 0.55 }}>
            ☼ {page.location}
          </p>
        )}
        <WatermarkSunset color={accent} />
      </div>
    </TemplateShell>
  );
}

// ---------- Helpers ----------

function TemplateShell({ bg, children }: { bg: string; children: ReactNode }) {
  const style = bg.includes("gradient") ? { background: bg } : { backgroundColor: bg };
  return (
    <div className="min-h-full w-full" style={style}>
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

function Watermark({ color }: { color: string }) {
  return (
    <div className="mt-12 w-full text-center">
      <a
        href="/tools/link-in-bio"
        className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-stone transition-colors hover:text-ink"
      >
        Made with{" "}
        <span className="font-display text-xs" style={{ color }}>
          Startoor
        </span>
        →
      </a>
    </div>
  );
}

function WatermarkDark({ color }: { color: string }) {
  return (
    <div className="mt-12 w-full">
      <a
        href="/tools/link-in-bio"
        className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-bone/50 transition-colors hover:text-bone"
      >
        Made with{" "}
        <span className="font-display text-xs" style={{ color }}>
          Startoor
        </span>
        →
      </a>
    </div>
  );
}

function WatermarkSunset({ color }: { color: string }) {
  return (
    <div className="mt-12 w-full text-center">
      <a
        href="/tools/link-in-bio"
        className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] transition-opacity hover:opacity-100"
        style={{ color, opacity: 0.55 }}
      >
        Made with{" "}
        <span className="font-display text-xs">Startoor</span>→
      </a>
    </div>
  );
}
