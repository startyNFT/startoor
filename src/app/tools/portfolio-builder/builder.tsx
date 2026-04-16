"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, Copy, Plus, Trash2, X } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  PORTFOLIO_TEMPLATES,
  PortfolioTemplateRenderer,
  type PortfolioPageData,
  type PortfolioTemplateKey,
} from "@/lib/portfolio-templates";
import {
  createPortfolioPage,
  updatePortfolioPage,
  type FormState,
} from "./actions";

export type BuilderMode = "create" | "edit";

type Metric = { label: string; value: string };
type LinkItem = { label: string; url: string };

export type BuilderProject = {
  title: string;
  role: string;
  client: string;
  year: string;
  coverImage: string;
  mediaUrls: string[];
  problem: string;
  approach: string;
  outcome: string;
  metrics: Metric[];
  links: LinkItem[];
};

export type BuilderSocials = {
  twitter?: string;
  linkedin?: string;
  github?: string;
  dribbble?: string;
  instagram?: string;
};

export type BuilderInitial = {
  slug: string;
  template: PortfolioTemplateKey;
  displayName: string;
  role: string;
  tagline: string;
  about: string;
  avatarUrl: string;
  accentColor: string;
  backgroundColor: string;
  location: string;
  contactEmail: string;
  website: string;
  socials: BuilderSocials;
  projects: BuilderProject[];
};

const ACCENT_SWATCHES = [
  "#1F3A2F",
  "#C85A3F",
  "#1C1C1A",
  "#E8C77F",
  "#2C5282",
  "#9D4E3F",
  "#5B6B4A",
  "#6B3E5B",
];

const BG_SWATCHES = [
  "#F5F1E8",
  "#FAF6ED",
  "#FFFBF2",
  "#EDE4D1",
  "#F0EFEB",
  "#0E0E0C",
  "#F6E4C7",
  "linear-gradient(180deg, #F8E4C3 0%, #EFC199 45%, #E08A61 100%)",
];

const emptyProject = (): BuilderProject => ({
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
});

export function PortfolioBuilder({
  mode,
  initial,
}: {
  mode: BuilderMode;
  initial: BuilderInitial;
}) {
  const action = mode === "create" ? createPortfolioPage : updatePortfolioPage;
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    action,
    {},
  );

  const [template, setTemplate] = useState<PortfolioTemplateKey>(initial.template);
  const defaults = useMemo(
    () => PORTFOLIO_TEMPLATES.find((t) => t.key === template)!,
    [template],
  );
  const [slug, setSlug] = useState(initial.slug);
  const [displayName, setDisplayName] = useState(initial.displayName);
  const [role, setRole] = useState(initial.role);
  const [tagline, setTagline] = useState(initial.tagline);
  const [about, setAbout] = useState(initial.about);
  const [avatarUrl, setAvatarUrl] = useState(initial.avatarUrl);
  const [accent, setAccent] = useState(initial.accentColor || defaults.defaultAccent);
  const [background, setBackground] = useState(
    initial.backgroundColor || defaults.defaultBg,
  );
  const [location, setLocation] = useState(initial.location);
  const [contactEmail, setContactEmail] = useState(initial.contactEmail);
  const [website, setWebsite] = useState(initial.website);
  const [socials, setSocials] = useState<BuilderSocials>(initial.socials || {});

  const [projects, setProjects] = useState<BuilderProject[]>(
    initial.projects.length > 0 ? initial.projects : [emptyProject()],
  );
  const [expanded, setExpanded] = useState<number>(0);

  const formRef = useRef<HTMLFormElement>(null);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onTemplateChange = (key: PortfolioTemplateKey) => {
    const outgoing = PORTFOLIO_TEMPLATES.find((t) => t.key === template)!;
    const incoming = PORTFOLIO_TEMPLATES.find((t) => t.key === key)!;
    setTemplate(key);
    if (accent === outgoing.defaultAccent) setAccent(incoming.defaultAccent);
    if (background === outgoing.defaultBg) setBackground(incoming.defaultBg);
  };

  // Debounced autosave on blur for edit mode. Server action redirects to
  // ?saved=1 which just refreshes the page with a "Saved" banner — benign.
  const autosave = () => {
    if (mode !== "edit") return;
    if (pending) return;
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      if (!formRef.current) return;
      const fd = new FormData(formRef.current);
      formAction(fd);
    }, 1500);
  };

  useEffect(() => {
    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    };
  }, []);

  const updateProject = (idx: number, patch: Partial<BuilderProject>) => {
    setProjects((prev) => prev.map((p, i) => (i === idx ? { ...p, ...patch } : p)));
  };

  const moveProject = (idx: number, dir: -1 | 1) => {
    setProjects((prev) => {
      const next = [...prev];
      const to = idx + dir;
      if (to < 0 || to >= next.length) return prev;
      [next[idx], next[to]] = [next[to], next[idx]];
      return next;
    });
    setExpanded((cur) => {
      if (cur === idx) return idx + dir;
      if (cur === idx + dir) return idx;
      return cur;
    });
  };

  const removeProject = (idx: number) => {
    setProjects((prev) => prev.filter((_, i) => i !== idx));
    setExpanded((cur) => Math.max(0, cur - (cur >= idx ? 1 : 0)));
  };

  const addProject = () => {
    setProjects((prev) => [...prev, emptyProject()]);
    setExpanded(projects.length);
  };

  const copyShareUrl = async () => {
    const origin =
      typeof window !== "undefined" ? window.location.origin : "https://startoor.vercel.app";
    try {
      await navigator.clipboard.writeText(`${origin}/portfolio/${slug}`);
      toast.success("Share URL copied");
    } catch {
      toast.error("Couldn't copy — select the URL manually");
    }
  };

  const previewData: PortfolioPageData = {
    slug: slug || "your-folio",
    template,
    displayName: displayName || "Your Name",
    role: role || null,
    tagline: tagline || null,
    about: about || null,
    avatarUrl: avatarUrl || null,
    accentColor: accent,
    backgroundColor: background,
    location: location || null,
    contactEmail: contactEmail || null,
    website: website || null,
    socials: socials || null,
    projects: projects
      .filter((p) => p.title.trim())
      .map((p, i) => ({
        id: `preview-${i}`,
        title: p.title,
        role: p.role || null,
        client: p.client || null,
        year: p.year || null,
        coverImage: p.coverImage || null,
        mediaUrls: p.mediaUrls.filter(Boolean),
        problem: p.problem || null,
        approach: p.approach || null,
        outcome: p.outcome || null,
        metrics: p.metrics.filter((m) => m.label && m.value),
        links: p.links.filter((l) => l.label && l.url),
      })),
  };

  const projectsJson = JSON.stringify(projects);
  const socialsJson = JSON.stringify(socials);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,720px)] lg:gap-12"
    >
      {mode === "edit" && <input type="hidden" name="slug" value={initial.slug} />}
      <input type="hidden" name="template" value={template} />
      <input type="hidden" name="accentColor" value={accent} />
      <input type="hidden" name="backgroundColor" value={background} />
      <input type="hidden" name="projectsJson" value={projectsJson} />
      <input type="hidden" name="socialsJson" value={socialsJson} />

      {/* Editor */}
      <div className="space-y-10 min-w-0">
        {state.globalError && (
          <p className="rounded-md border border-clay/40 bg-clay/5 p-3 font-sans text-sm text-clay">
            {state.globalError}
          </p>
        )}

        <Section number="01" title="Template">
          <div className="grid grid-cols-3 gap-3">
            {PORTFOLIO_TEMPLATES.map((t) => {
              const active = template === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => onTemplateChange(t.key)}
                  className={cn(
                    "group relative overflow-hidden border p-3 text-left transition-all",
                    active
                      ? "border-ink shadow-warm-sm"
                      : "border-hairline hover:border-ink",
                  )}
                >
                  <TemplateThumb kind={t.key} accent={t.sample.accent} bg={t.sample.bg} />
                  <p className="mt-3 font-display text-base leading-none tracking-tight text-ink">
                    {t.name}
                  </p>
                  <p className="mt-1 font-sans text-[11px] leading-snug text-ink-soft">
                    {t.description}
                  </p>
                  {active && (
                    <span className="absolute right-2 top-2 rounded-full bg-ink px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-bone">
                      In use
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </Section>

        <Section number="02" title="Your handle">
          <TextField
            label="Handle"
            name="slug"
            value={slug}
            onChange={(v) =>
              setSlug(
                v.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
              )
            }
            prefix="startoor.vercel.app/portfolio"
            placeholder="your-name"
            disabled={mode === "edit"}
            error={state.errors?.slug?.[0]}
            onBlur={autosave}
            maxLength={40}
            showCount
          />
          {mode === "edit" && (
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-stone">
              Handle can&apos;t be changed after publish
            </p>
          )}
        </Section>

        <Section number="03" title="You">
          <div className="grid gap-4 md:grid-cols-2">
            <TextField
              label="Display name"
              name="displayName"
              value={displayName}
              onChange={setDisplayName}
              onBlur={autosave}
              placeholder="Mina Kwon"
              required
              error={state.errors?.displayName?.[0]}
              maxLength={80}
              showCount
            />
            <TextField
              label="Role / practice"
              name="role"
              value={role}
              onChange={setRole}
              onBlur={autosave}
              placeholder="Brand designer"
              maxLength={80}
              showCount
            />
          </div>
          <div className="mt-4">
            <TextField
              label="Tagline"
              name="tagline"
              value={tagline}
              onChange={setTagline}
              onBlur={autosave}
              placeholder="Work that reads like a letter from a friend."
              maxLength={140}
              showCount
            />
          </div>
          <div className="mt-4">
            <TextAreaField
              label="About"
              name="about"
              rows={4}
              value={about}
              onChange={setAbout}
              onBlur={autosave}
              placeholder="A few sentences about your practice — what you make, for whom, and what it tends to look like."
              maxLength={600}
              showCount
            />
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <TextField
              label="Avatar URL"
              name="avatarUrl"
              value={avatarUrl}
              onChange={setAvatarUrl}
              onBlur={autosave}
              placeholder="https://..."
              error={state.errors?.avatarUrl?.[0]}
            />
            <TextField
              label="Location"
              name="location"
              value={location}
              onChange={setLocation}
              onBlur={autosave}
              placeholder="Brooklyn, NY"
              maxLength={80}
            />
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <TextField
              label="Contact email"
              name="contactEmail"
              value={contactEmail}
              onChange={setContactEmail}
              onBlur={autosave}
              placeholder="hello@you.com"
              error={state.errors?.contactEmail?.[0]}
            />
            <TextField
              label="Website"
              name="website"
              value={website}
              onChange={setWebsite}
              onBlur={autosave}
              placeholder="https://..."
              error={state.errors?.website?.[0]}
            />
          </div>
        </Section>

        <Section number="04" title="Socials">
          <div className="grid gap-3 md:grid-cols-2">
            {(
              ["twitter", "linkedin", "github", "dribbble", "instagram"] as const
            ).map((k) => (
              <label key={k} className="block">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
                  {k}
                </span>
                <input
                  value={socials[k] ?? ""}
                  onChange={(e) =>
                    setSocials((prev) => ({ ...prev, [k]: e.target.value }))
                  }
                  onBlur={autosave}
                  placeholder={k === "linkedin" ? "in-handle or URL" : "@handle or URL"}
                  className="mt-2 w-full border-b border-hairline bg-transparent py-2 font-sans text-sm text-ink placeholder:text-stone-light focus:border-ink focus:outline-none"
                />
              </label>
            ))}
          </div>
        </Section>

        <Section number="05" title="Look & feel">
          <div className="grid gap-6">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
                Accent
              </span>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {ACCENT_SWATCHES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setAccent(c);
                      autosave();
                    }}
                    className={cn(
                      "h-8 w-8 rounded-full border transition-transform hover:scale-110",
                      accent === c
                        ? "border-ink ring-2 ring-ink ring-offset-2 ring-offset-paper"
                        : "border-hairline",
                    )}
                    style={{ background: c }}
                    aria-label={`Accent ${c}`}
                  />
                ))}
                <input
                  type="color"
                  value={accent.startsWith("#") ? accent : "#1F3A2F"}
                  onChange={(e) => setAccent(e.target.value)}
                  onBlur={autosave}
                  className="h-8 w-8 cursor-pointer rounded-full border border-hairline bg-transparent"
                  aria-label="Pick accent"
                />
                <input
                  value={accent}
                  onChange={(e) => setAccent(e.target.value)}
                  onBlur={autosave}
                  className="w-32 border-b border-hairline bg-transparent px-2 py-1 font-mono text-xs text-ink focus:border-ink focus:outline-none"
                />
              </div>
            </div>

            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
                Background
              </span>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {BG_SWATCHES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setBackground(c);
                      autosave();
                    }}
                    className={cn(
                      "h-8 w-12 rounded-sm border transition-transform hover:scale-105",
                      background === c
                        ? "border-ink ring-2 ring-ink ring-offset-2 ring-offset-paper"
                        : "border-hairline",
                    )}
                    style={{ background: c }}
                    aria-label={`Background ${c}`}
                  />
                ))}
                <input
                  value={background}
                  onChange={(e) => setBackground(e.target.value)}
                  onBlur={autosave}
                  className="w-56 border-b border-hairline bg-transparent px-2 py-1 font-mono text-xs text-ink focus:border-ink focus:outline-none"
                  placeholder="#FAF6ED or linear-gradient(...)"
                />
              </div>
              <p className="mt-2 font-sans text-xs text-ink-soft">
                Accepts hex or full <code className="font-mono">linear-gradient()</code>.
              </p>
            </div>
          </div>
        </Section>

        <Section
          number="06"
          title={`Projects · ${String(projects.length).padStart(2, "0")}`}
        >
          <div className="space-y-4">
            {projects.map((project, idx) => {
              const isOpen = expanded === idx;
              return (
                <div
                  key={idx}
                  className={cn(
                    "border transition-colors",
                    isOpen ? "border-ink" : "border-hairline",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setExpanded(isOpen ? -1 : idx)}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <span className="font-display text-2xl italic leading-none tabular-nums text-clay shrink-0">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <div className="min-w-0">
                        <p className="font-sans text-sm text-ink truncate">
                          {project.title || (
                            <span className="italic text-stone">Untitled project</span>
                          )}
                        </p>
                        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone truncate">
                          {[project.role, project.client, project.year]
                            .filter(Boolean)
                            .join(" · ") || "Click to edit"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <IconBtn
                        onClick={(e) => {
                          e.stopPropagation();
                          moveProject(idx, -1);
                        }}
                        disabled={idx === 0}
                        label="Move up"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </IconBtn>
                      <IconBtn
                        onClick={(e) => {
                          e.stopPropagation();
                          moveProject(idx, 1);
                        }}
                        disabled={idx === projects.length - 1}
                        label="Move down"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </IconBtn>
                      <IconBtn
                        onClick={(e) => {
                          e.stopPropagation();
                          removeProject(idx);
                        }}
                        disabled={projects.length <= 1}
                        label="Remove project"
                        danger
                      >
                        <Trash2 className="h-4 w-4" />
                      </IconBtn>
                    </div>
                  </button>
                  {isOpen && (
                    <div className="border-t border-hairline px-4 py-5">
                      <ProjectEditor
                        project={project}
                        onChange={(patch) => updateProject(idx, patch)}
                        onBlur={autosave}
                      />
                    </div>
                  )}
                </div>
              );
            })}
            <button
              type="button"
              onClick={addProject}
              className="inline-flex items-center gap-2 border-b border-hairline pb-1 font-sans text-sm text-ink-soft transition-colors hover:border-ink hover:text-ink"
            >
              <Plus className="h-4 w-4" />
              <span>Add project</span>
            </button>
          </div>
        </Section>

        <div className="flex flex-wrap items-center gap-3 border-t border-hairline pt-8">
          <button
            type="submit"
            disabled={pending}
            onClick={() => {
              if (mode === "edit") toast.success("Saved.");
            }}
            className="group inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-sans text-sm text-bone transition-colors hover:bg-forest disabled:opacity-60"
          >
            {pending
              ? "Saving…"
              : mode === "edit"
                ? "Save & view"
                : "Publish portfolio"}
            {!pending && (
              <span className="transition-transform group-hover:translate-x-0.5">→</span>
            )}
          </button>
          {mode === "edit" && slug && (
            <>
              <a
                href={`/portfolio/${slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-ink px-6 py-3 font-sans text-sm text-ink transition-colors hover:bg-ink hover:text-bone"
              >
                View public page ↗
              </a>
              <button
                type="button"
                onClick={copyShareUrl}
                className="inline-flex items-center gap-2 rounded-full border border-hairline px-5 py-3 font-sans text-sm text-ink transition-colors hover:border-ink"
              >
                <Copy className="h-3.5 w-3.5" />
                Copy share URL
              </button>
            </>
          )}
        </div>
      </div>

      {/* Live preview — full card */}
      <aside className="lg:sticky lg:top-24 lg:h-fit min-w-0">
        <div className="mb-4 flex items-center justify-between">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone">
            Live preview
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone tabular-nums">
            {defaults.name}
          </p>
        </div>
        <div
          className="relative overflow-hidden rounded-sm border border-hairline shadow-warm-md"
          style={{
            height: "min(78vh, 900px)",
          }}
        >
          <div className="h-full w-full overflow-y-auto overscroll-contain">
            <PortfolioTemplateRenderer page={previewData} />
          </div>
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-12"
            style={{
              background:
                "linear-gradient(180deg, rgba(28,28,26,0) 0%, rgba(28,28,26,0.08) 100%)",
            }}
          />
        </div>
        {slug && (
          <p className="mt-4 text-center font-mono text-[11px] tracking-wide text-stone">
            startoor.vercel.app/portfolio/<span className="text-ink">{slug}</span>
          </p>
        )}
      </aside>
    </form>
  );
}

function ProjectEditor({
  project,
  onChange,
  onBlur,
}: {
  project: BuilderProject;
  onChange: (patch: Partial<BuilderProject>) => void;
  onBlur: () => void;
}) {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <TextField
          label="Title"
          name="projectTitle"
          value={project.title}
          onChange={(v) => onChange({ title: v })}
          onBlur={onBlur}
          placeholder="Cascade — brand system for a natural skincare line"
          required
          maxLength={120}
          showCount
        />
        <TextField
          label="Your role"
          name="projectRole"
          value={project.role}
          onChange={(v) => onChange({ role: v })}
          onBlur={onBlur}
          placeholder="Lead designer"
          maxLength={80}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <TextField
          label="Client"
          name="projectClient"
          value={project.client}
          onChange={(v) => onChange({ client: v })}
          onBlur={onBlur}
          placeholder="Cascade Naturals"
          maxLength={80}
        />
        <TextField
          label="Year"
          name="projectYear"
          value={project.year}
          onChange={(v) => onChange({ year: v })}
          onBlur={onBlur}
          placeholder="2026"
          maxLength={20}
        />
        <TextField
          label="Cover image URL"
          name="projectCover"
          value={project.coverImage}
          onChange={(v) => onChange({ coverImage: v })}
          onBlur={onBlur}
          placeholder="https://..."
        />
      </div>

      <TextAreaField
        label="Problem"
        name="projectProblem"
        rows={3}
        value={project.problem}
        onChange={(v) => onChange({ problem: v })}
        onBlur={onBlur}
        placeholder="What was broken, missing, or misaligned before you started?"
        maxLength={600}
        showCount
      />
      <TextAreaField
        label="Approach"
        name="projectApproach"
        rows={5}
        value={project.approach}
        onChange={(v) => onChange({ approach: v })}
        onBlur={onBlur}
        placeholder="How you thought about the work — not a bullet list, a short paragraph."
        maxLength={1200}
        showCount
      />
      <TextAreaField
        label="Outcome"
        name="projectOutcome"
        rows={3}
        value={project.outcome}
        onChange={(v) => onChange({ outcome: v })}
        onBlur={onBlur}
        placeholder="What shipped, and what changed because of it."
        maxLength={600}
        showCount
      />

      {/* Metrics */}
      <div>
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
            Outcome metrics (up to 3)
          </span>
          <span className="font-mono text-[10px] text-stone tabular-nums">
            {project.metrics.length}/3
          </span>
        </div>
        <div className="mt-2 space-y-2">
          {project.metrics.map((m, mi) => (
            <div key={mi} className="grid grid-cols-12 items-center gap-2">
              <input
                value={m.label}
                onChange={(e) => {
                  const next = [...project.metrics];
                  next[mi] = { ...next[mi], label: e.target.value.slice(0, 40) };
                  onChange({ metrics: next });
                }}
                onBlur={onBlur}
                placeholder="Conversion lift"
                className="col-span-5 border-b border-hairline bg-transparent py-2 font-mono text-xs text-ink placeholder:text-stone-light focus:border-ink focus:outline-none"
              />
              <input
                value={m.value}
                onChange={(e) => {
                  const next = [...project.metrics];
                  next[mi] = { ...next[mi], value: e.target.value.slice(0, 40) };
                  onChange({ metrics: next });
                }}
                onBlur={onBlur}
                placeholder="+42%"
                className="col-span-6 border-b border-hairline bg-transparent py-2 font-display text-base text-ink tabular-nums placeholder:text-stone-light focus:border-ink focus:outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  onChange({
                    metrics: project.metrics.filter((_, i) => i !== mi),
                  });
                }}
                className="col-span-1 flex h-8 w-8 items-center justify-center rounded-full text-stone hover:bg-clay/10 hover:text-clay"
                aria-label="Remove metric"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          {project.metrics.length < 3 && (
            <button
              type="button"
              onClick={() =>
                onChange({
                  metrics: [...project.metrics, { label: "", value: "" }],
                })
              }
              className="inline-flex items-center gap-2 font-sans text-xs text-ink-soft hover:text-ink"
            >
              <Plus className="h-3.5 w-3.5" />
              Add metric
            </button>
          )}
        </div>
      </div>

      {/* Links */}
      <div>
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
            Project links
          </span>
          <span className="font-mono text-[10px] text-stone tabular-nums">
            {project.links.length}/5
          </span>
        </div>
        <div className="mt-2 space-y-2">
          {project.links.map((l, li) => (
            <div key={li} className="grid grid-cols-12 items-center gap-2">
              <input
                value={l.label}
                onChange={(e) => {
                  const next = [...project.links];
                  next[li] = { ...next[li], label: e.target.value.slice(0, 60) };
                  onChange({ links: next });
                }}
                onBlur={onBlur}
                placeholder="Case study"
                className="col-span-4 border-b border-hairline bg-transparent py-2 font-mono text-xs text-ink placeholder:text-stone-light focus:border-ink focus:outline-none"
              />
              <input
                value={l.url}
                onChange={(e) => {
                  const next = [...project.links];
                  next[li] = { ...next[li], url: e.target.value };
                  onChange({ links: next });
                }}
                onBlur={onBlur}
                placeholder="https://..."
                className="col-span-7 border-b border-hairline bg-transparent py-2 font-sans text-xs text-ink placeholder:text-stone-light focus:border-ink focus:outline-none"
              />
              <button
                type="button"
                onClick={() =>
                  onChange({
                    links: project.links.filter((_, i) => i !== li),
                  })
                }
                className="col-span-1 flex h-8 w-8 items-center justify-center rounded-full text-stone hover:bg-clay/10 hover:text-clay"
                aria-label="Remove link"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          {project.links.length < 5 && (
            <button
              type="button"
              onClick={() =>
                onChange({ links: [...project.links, { label: "", url: "" }] })
              }
              className="inline-flex items-center gap-2 font-sans text-xs text-ink-soft hover:text-ink"
            >
              <Plus className="h-3.5 w-3.5" />
              Add link
            </button>
          )}
        </div>
      </div>

      {/* Extra media */}
      <div>
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
            Additional media (image URLs, up to 6)
          </span>
          <span className="font-mono text-[10px] text-stone tabular-nums">
            {project.mediaUrls.length}/6
          </span>
        </div>
        <div className="mt-2 space-y-2">
          {project.mediaUrls.map((u, mi) => (
            <div key={mi} className="flex items-center gap-2">
              <input
                value={u}
                onChange={(e) => {
                  const next = [...project.mediaUrls];
                  next[mi] = e.target.value;
                  onChange({ mediaUrls: next });
                }}
                onBlur={onBlur}
                placeholder="https://..."
                className="flex-1 border-b border-hairline bg-transparent py-2 font-sans text-xs text-ink placeholder:text-stone-light focus:border-ink focus:outline-none"
              />
              <button
                type="button"
                onClick={() =>
                  onChange({
                    mediaUrls: project.mediaUrls.filter((_, i) => i !== mi),
                  })
                }
                className="flex h-8 w-8 items-center justify-center rounded-full text-stone hover:bg-clay/10 hover:text-clay"
                aria-label="Remove media"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          {project.mediaUrls.length < 6 && (
            <button
              type="button"
              onClick={() => onChange({ mediaUrls: [...project.mediaUrls, ""] })}
              className="inline-flex items-center gap-2 font-sans text-xs text-ink-soft hover:text-ink"
            >
              <Plus className="h-3.5 w-3.5" />
              Add image URL
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-hairline pt-8 first:border-t-0 first:pt-0">
      <h2 className="flex items-baseline gap-4">
        <span className="font-display text-3xl leading-none tracking-tight text-clay">
          {number}
        </span>
        <span className="font-display text-lg leading-none tracking-tight text-ink">
          {title}
        </span>
      </h2>
      <div className="mt-5 min-w-0">{children}</div>
    </section>
  );
}

function TextField({
  label,
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  prefix,
  disabled,
  required,
  error,
  maxLength,
  showCount,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  prefix?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  maxLength?: number;
  showCount?: boolean;
}) {
  return (
    <label className="block min-w-0">
      <span className="flex items-baseline justify-between gap-4 min-w-0">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone truncate">
          {prefix ? `${prefix}/${label.toLowerCase()}` : label}
        </span>
        {showCount && maxLength ? (
          <span className="font-mono text-[9px] text-stone tabular-nums shrink-0">
            {value.length}/{maxLength}
          </span>
        ) : null}
      </span>
      <input
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        maxLength={maxLength}
        className={cn(
          "mt-2 w-full border-b bg-transparent py-2 font-sans text-sm text-ink placeholder:text-stone-light focus:outline-none disabled:opacity-60",
          error ? "border-clay" : "border-hairline focus:border-ink",
        )}
      />
      {error && (
        <span className="mt-1.5 inline-block font-sans text-xs text-clay">{error}</span>
      )}
    </label>
  );
}

function TextAreaField({
  label,
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  rows = 3,
  error,
  maxLength,
  showCount,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  rows?: number;
  error?: string;
  maxLength?: number;
  showCount?: boolean;
}) {
  return (
    <label className="block min-w-0">
      <span className="flex items-baseline justify-between gap-4 min-w-0">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone truncate">
          {label}
        </span>
        {showCount && maxLength ? (
          <span className="font-mono text-[9px] text-stone tabular-nums shrink-0">
            {value.length}/{maxLength}
          </span>
        ) : null}
      </span>
      <textarea
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        className={cn(
          "mt-2 w-full resize-none border bg-transparent p-3 font-sans text-sm leading-relaxed text-ink placeholder:text-stone-light focus:outline-none",
          error ? "border-clay" : "border-hairline focus:border-ink",
        )}
      />
    </label>
  );
}

function IconBtn({
  children,
  onClick,
  disabled,
  label,
  danger,
}: {
  children: React.ReactNode;
  onClick: (e: React.MouseEvent) => void;
  disabled?: boolean;
  label: string;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full text-stone transition-colors",
        danger ? "hover:bg-clay/10 hover:text-clay" : "hover:bg-ink/5 hover:text-ink",
        "disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-stone",
      )}
    >
      {children}
    </button>
  );
}

function TemplateThumb({
  kind,
  accent,
  bg,
}: {
  kind: PortfolioTemplateKey;
  accent: string;
  bg: string;
}) {
  if (kind === "grid") {
    return (
      <div
        className="relative h-24 w-full overflow-hidden"
        style={{ background: bg }}
      >
        <div className="grid h-full grid-cols-3 gap-1 p-2">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="rounded-sm" style={{ background: `${accent}25` }} />
          ))}
        </div>
      </div>
    );
  }
  if (kind === "story") {
    return (
      <div
        className="relative h-24 w-full overflow-hidden"
        style={{ background: bg }}
      >
        <div className="flex h-full flex-col items-center justify-center gap-1.5 px-3">
          <div className="h-1 w-10 rounded-sm" style={{ background: `${accent}60` }} />
          <div className="h-2 w-20 rounded-sm" style={{ background: accent }} />
          <div className="h-1 w-16 rounded-sm" style={{ background: `${accent}40` }} />
          <div className="h-6 w-full rounded-sm" style={{ background: `${accent}20` }} />
        </div>
      </div>
    );
  }
  // editorial
  return (
    <div className="relative h-24 w-full overflow-hidden" style={{ background: bg }}>
      <div className="h-full w-full p-2">
        <div className="h-[3px] w-full" style={{ background: accent }} />
        <div className="mt-1.5 grid h-[calc(100%-8px)] grid-cols-[1fr_2fr_1.5fr] gap-1">
          <div className="space-y-1">
            <div className="h-1 w-4 rounded-sm" style={{ background: `${accent}60` }} />
            <div className="h-1 w-3 rounded-sm" style={{ background: `${accent}40` }} />
          </div>
          <div className="rounded-sm" style={{ background: `${accent}30` }} />
          <div className="space-y-0.5">
            <div className="h-1.5 w-full rounded-sm" style={{ background: accent }} />
            <div className="h-0.5 w-full rounded-sm" style={{ background: `${accent}50` }} />
            <div className="h-0.5 w-3/4 rounded-sm" style={{ background: `${accent}50` }} />
            <div className="h-0.5 w-full rounded-sm" style={{ background: `${accent}50` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
