"use client";

import { useActionState, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/cn";
import {
  BIO_TEMPLATES,
  BioTemplateRenderer,
  type BioPageData,
  type BioTemplateKey,
} from "@/lib/bio-templates";
import { createBioPage, updateBioPage, type FormState } from "./actions";

export type BuilderMode = "create" | "edit";

export type BuilderInitial = {
  slug: string;
  template: BioTemplateKey;
  displayName: string;
  headline: string;
  bio: string;
  avatarUrl: string;
  accentColor: string;
  backgroundColor: string;
  location: string;
  links: { label: string; url: string }[];
};

export function BioBuilder({
  mode,
  initial,
}: {
  mode: BuilderMode;
  initial: BuilderInitial;
}) {
  const action = mode === "create" ? createBioPage : updateBioPage;
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    action,
    {},
  );

  const [template, setTemplate] = useState<BioTemplateKey>(initial.template);
  const defaults = BIO_TEMPLATES.find((t) => t.key === template)!;
  const [displayName, setDisplayName] = useState(initial.displayName);
  const [headline, setHeadline] = useState(initial.headline);
  const [bio, setBio] = useState(initial.bio);
  const [avatarUrl, setAvatarUrl] = useState(initial.avatarUrl);
  const [accent, setAccent] = useState(initial.accentColor || defaults.defaultAccent);
  const [background, setBackground] = useState(initial.backgroundColor || defaults.defaultBg);
  const [location, setLocation] = useState(initial.location);
  const [slug, setSlug] = useState(initial.slug);
  const [links, setLinks] = useState<{ label: string; url: string }[]>(
    initial.links.length > 0 ? initial.links : [{ label: "", url: "" }],
  );

  const onTemplateChange = (key: BioTemplateKey) => {
    const outgoing = BIO_TEMPLATES.find((t) => t.key === template)!;
    const incoming = BIO_TEMPLATES.find((t) => t.key === key)!;
    setTemplate(key);
    // Follow the new template's look unless the user has customized away
    // from the outgoing template's defaults
    if (accent === outgoing.defaultAccent) setAccent(incoming.defaultAccent);
    if (background === outgoing.defaultBg) setBackground(incoming.defaultBg);
  };

  const previewData: BioPageData = {
    slug: slug || "your-handle",
    template,
    displayName: displayName || "Your Name",
    headline: headline || null,
    bio: bio || null,
    avatarUrl: avatarUrl || null,
    accentColor: accent,
    backgroundColor: background,
    location: location || null,
    links: links
      .filter((l) => l.label && l.url)
      .map((l, i) => ({ id: `preview-${i}`, label: l.label, url: l.url })),
  };

  return (
    <form action={formAction} className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,540px)] lg:gap-14">
      {mode === "edit" && <input type="hidden" name="slug" value={initial.slug} />}

      {/* Editor */}
      <div className="space-y-10">
        {state.globalError && (
          <p className="rounded-md border border-clay/40 bg-clay/5 p-3 font-sans text-sm text-clay">
            {state.globalError}
          </p>
        )}

        <Section number="01" title="Template">
          <div className="grid grid-cols-2 gap-3">
            {BIO_TEMPLATES.map((t) => {
              const active = template === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => onTemplateChange(t.key)}
                  className={cn(
                    "group relative overflow-hidden border p-4 text-left transition-all",
                    active
                      ? "border-ink shadow-warm-sm"
                      : "border-hairline hover:border-ink",
                  )}
                >
                  <div
                    className="mb-3 h-16 w-full"
                    style={{
                      background: t.sample.bg,
                      borderTop: `3px solid ${t.sample.accent}`,
                    }}
                  />
                  <p className="font-display text-lg leading-none tracking-tight text-ink">
                    {t.name}
                  </p>
                  <p className="mt-1 font-sans text-xs text-ink-soft">
                    {t.description}
                  </p>
                  {active && (
                    <span className="absolute right-3 top-3 rounded-full bg-ink px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-bone">
                      ✓ In use
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <input type="hidden" name="template" value={template} />
        </Section>

        <Section number="02" title="Your handle">
          <TextField
            label="/bio/"
            name="slug"
            value={slug}
            onChange={(v) =>
              setSlug(v.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""))
            }
            prefix="startoor.vercel.app"
            placeholder="your-name"
            disabled={mode === "edit"}
            error={state.errors?.slug?.[0]}
          />
          {mode === "edit" && (
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-stone">
              Handle can&apos;t be changed after publish
            </p>
          )}
        </Section>

        <Section number="03" title="You">
          <TextField
            label="Display name"
            name="displayName"
            value={displayName}
            onChange={setDisplayName}
            placeholder="Mina Kwon"
            required
            error={state.errors?.displayName?.[0]}
          />
          <div className="mt-4">
            <TextField
              label="Headline"
              name="headline"
              value={headline}
              onChange={setHeadline}
              placeholder="Designer & indie builder"
              error={state.errors?.headline?.[0]}
            />
          </div>
          <div className="mt-4">
            <TextAreaField
              label="Bio"
              name="bio"
              rows={3}
              value={bio}
              onChange={setBio}
              placeholder="A few sentences about yourself and what you make."
              error={state.errors?.bio?.[0]}
            />
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <TextField
              label="Avatar URL"
              name="avatarUrl"
              value={avatarUrl}
              onChange={setAvatarUrl}
              placeholder="https://..."
              error={state.errors?.avatarUrl?.[0]}
            />
            <TextField
              label="Location"
              name="location"
              value={location}
              onChange={setLocation}
              placeholder="City, Country"
              error={state.errors?.location?.[0]}
            />
          </div>
        </Section>

        <Section number="04" title="Look & feel">
          <div className="grid gap-4 md:grid-cols-2">
            <ColorField
              label="Accent color"
              name="accentColor"
              value={accent}
              onChange={setAccent}
            />
            <TextField
              label="Background"
              name="backgroundColor"
              value={background}
              onChange={setBackground}
              placeholder="#F5F1E8 or a gradient"
            />
          </div>
          <p className="mt-3 font-sans text-xs text-ink-soft">
            Background accepts a hex color or a full <code className="font-mono">linear-gradient()</code>.
          </p>
        </Section>

        <Section number="05" title="Links">
          <div className="space-y-4">
            {links.map((link, idx) => (
              <div key={idx} className="grid grid-cols-12 items-end gap-3">
                <div className="col-span-12 md:col-span-5">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone">
                    № {String(idx + 1).padStart(2, "0")} · Label
                  </span>
                  <input
                    name="linkLabel"
                    value={link.label}
                    onChange={(e) => {
                      const next = [...links];
                      next[idx] = { ...next[idx], label: e.target.value };
                      setLinks(next);
                    }}
                    placeholder="My portfolio"
                    className="mt-1 w-full border-b border-hairline bg-transparent py-2 font-sans text-sm text-ink placeholder:text-stone-light focus:border-ink focus:outline-none"
                  />
                </div>
                <div className="col-span-10 md:col-span-6">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone">
                    URL
                  </span>
                  <input
                    name="linkUrl"
                    value={link.url}
                    onChange={(e) => {
                      const next = [...links];
                      next[idx] = { ...next[idx], url: e.target.value };
                      setLinks(next);
                    }}
                    placeholder="https://..."
                    className="mt-1 w-full border-b border-hairline bg-transparent py-2 font-sans text-sm text-ink placeholder:text-stone-light focus:border-ink focus:outline-none"
                  />
                </div>
                <div className="col-span-2 md:col-span-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setLinks(links.filter((_, i) => i !== idx));
                    }}
                    disabled={links.length <= 1}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-stone transition-colors hover:bg-clay/10 hover:text-clay disabled:opacity-30"
                    aria-label="Remove link"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setLinks([...links, { label: "", url: "" }])}
              className="inline-flex items-center gap-2 border-b border-hairline pb-1 font-sans text-sm text-ink-soft transition-colors hover:border-ink hover:text-ink"
            >
              <span>+</span>
              <span>Add a link</span>
            </button>
          </div>
        </Section>

        <div className="flex flex-wrap items-center gap-3 border-t border-hairline pt-8">
          <button
            type="submit"
            disabled={pending}
            onClick={() => {
              if (mode === "edit") {
                toast.success("Saved.");
              }
            }}
            className="group inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-sans text-sm text-bone transition-colors hover:bg-forest disabled:opacity-60"
          >
            {pending
              ? "Saving…"
              : mode === "edit"
                ? "Save changes"
                : "Create my page"}
            {!pending && (
              <span className="transition-transform group-hover:translate-x-0.5">→</span>
            )}
          </button>
          {mode === "edit" && slug && (
            <a
              href={`/bio/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-ink px-6 py-3 font-sans text-sm text-ink transition-colors hover:bg-ink hover:text-bone"
            >
              View page ↗
            </a>
          )}
        </div>
      </div>

      {/* Mobile-frame preview */}
      <aside className="lg:sticky lg:top-36 lg:h-fit">
        <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.22em] text-stone">
          Live preview
        </p>
        <div className="mx-auto w-full max-w-[360px]">
          <div className="relative rounded-[40px] border-[10px] border-ink bg-ink shadow-warm-xl">
            <div className="absolute left-1/2 top-0 z-10 h-6 w-24 -translate-x-1/2 rounded-b-xl bg-ink" />
            <div
              className="relative h-[640px] overflow-hidden rounded-[30px]"
              style={{
                background: background,
              }}
            >
              <div className="h-full overflow-y-auto overscroll-contain">
                <BioTemplateRenderer page={previewData} />
              </div>
            </div>
          </div>
          {slug && (
            <p className="mt-5 text-center font-mono text-[11px] tracking-wide text-stone">
              startoor.vercel.app/bio/<span className="text-ink">{slug}</span>
            </p>
          )}
        </div>
      </aside>
    </form>
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
      <div className="mt-5">{children}</div>
    </section>
  );
}

function TextField({
  label,
  name,
  value,
  onChange,
  placeholder,
  prefix,
  disabled,
  required,
  error,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  prefix?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
}) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
        {prefix ? `${prefix}/${label}` : label}
      </span>
      <input
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
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
  placeholder,
  rows = 3,
  error,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  error?: string;
}) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
        {label}
      </span>
      <textarea
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={cn(
          "mt-2 w-full resize-none border bg-transparent p-3 font-sans text-sm leading-relaxed text-ink placeholder:text-stone-light focus:outline-none",
          error ? "border-clay" : "border-hairline focus:border-ink",
        )}
      />
    </label>
  );
}

function ColorField({
  label,
  name,
  value,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
        {label}
      </span>
      <div className="mt-2 flex items-center gap-3 border-b border-hairline py-1 focus-within:border-ink">
        <span
          className="h-7 w-7 border border-hairline"
          style={{ background: value }}
        />
        <input
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-transparent py-1 font-mono text-sm text-ink focus:outline-none"
        />
        <input
          type="color"
          value={value.startsWith("#") ? value : "#C85A3F"}
          onChange={(e) => onChange(e.target.value)}
          className="h-7 w-7 cursor-pointer border border-hairline bg-transparent"
          aria-label="Pick color"
        />
      </div>
    </label>
  );
}
