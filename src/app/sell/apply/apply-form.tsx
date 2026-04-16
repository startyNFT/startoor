"use client";

import { useActionState } from "react";
import { submitApplication, type ApplicationState } from "./actions";

const initialState: ApplicationState = {};

export function ApplyForm() {
  const [state, action, pending] = useActionState(submitApplication, initialState);
  return (
    <form action={action} className="space-y-14">
      <Section number="01" title="You">
        <div className="grid gap-6 md:grid-cols-2">
          <Field label="Your name" name="name" type="text" required autoComplete="name" error={state.errors?.name?.[0]} />
          <Field label="Email" name="email" type="email" required autoComplete="email" error={state.errors?.email?.[0]} />
          <Field
            label="Display name (on Startoor)"
            name="displayName"
            type="text"
            required
            error={state.errors?.displayName?.[0]}
            placeholder="How your maker profile will read"
          />
          <Field
            label="Location"
            name="location"
            type="text"
            placeholder="City, Country (optional)"
          />
        </div>
      </Section>

      <Section number="02" title="Your work">
        <div className="grid gap-6 md:grid-cols-2">
          <Field
            label="Website"
            name="website"
            type="url"
            placeholder="https://"
            error={state.errors?.website?.[0]}
          />
          <Field
            label="Twitter / X"
            name="twitter"
            type="text"
            placeholder="@yourhandle"
            error={state.errors?.twitter?.[0]}
          />
          <div className="md:col-span-2">
            <Field
              label="Portfolio or past work (optional)"
              name="portfolio"
              type="text"
              placeholder="A link, a repo, anything you want us to see"
              error={state.errors?.portfolio?.[0]}
            />
          </div>
        </div>
      </Section>

      <Section number="03" title="The product">
        <TextAreaField
          label="Tell us what you want to sell"
          name="productPitch"
          rows={6}
          placeholder="What is it, who's it for, why you — the shorter and more honest, the better."
          required
          error={state.errors?.productPitch?.[0]}
        />
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Field
            label="Target price range"
            name="priceRange"
            type="text"
            placeholder="e.g. $29 · $49 · $99"
          />
          <Field
            label="Launch timeline"
            name="launchTimeline"
            type="text"
            placeholder="e.g. This week · Within a month · TBD"
          />
        </div>
      </Section>

      {state.message && (
        <p className="font-sans text-sm text-clay">{state.message}</p>
      )}

      <div className="flex flex-col gap-3 border-t border-hairline pt-10 md:flex-row md:items-center md:justify-between">
        <p className="max-w-md font-sans text-sm text-ink-soft">
          We review every application by hand. Expect a response in 5 days.
        </p>
        <button
          type="submit"
          disabled={pending}
          className="group inline-flex items-center justify-center gap-3 rounded-full bg-ink px-8 py-4 font-sans text-sm text-bone transition-colors hover:bg-forest disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Sending…" : "Submit application"}
          {!pending && <span className="transition-transform group-hover:translate-x-0.5">→</span>}
        </button>
      </div>
    </form>
  );
}

function Section({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-8 md:grid-cols-[180px_1fr] md:gap-16">
      <div>
        <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-clay">
          {number}
        </span>
        <h2 className="mt-2 font-display text-2xl leading-tight tracking-tight text-ink">
          {title}
        </h2>
      </div>
      <div>{children}</div>
    </section>
  );
}

function Field({
  label,
  name,
  type,
  placeholder,
  autoComplete,
  error,
  required,
}: {
  label: string;
  name: string;
  type: string;
  placeholder?: string;
  autoComplete?: string;
  error?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
        {label}
      </span>
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`mt-2 w-full border-b bg-transparent py-3 font-sans text-base text-ink placeholder:text-stone-light focus:outline-none ${
          error ? "border-clay" : "border-hairline focus:border-ink"
        }`}
      />
      {error && <span className="mt-1.5 inline-block font-sans text-xs text-clay">{error}</span>}
    </label>
  );
}

function TextAreaField({
  label,
  name,
  placeholder,
  rows = 4,
  error,
  required,
}: {
  label: string;
  name: string;
  placeholder?: string;
  rows?: number;
  error?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
        {label}
      </span>
      <textarea
        name={name}
        rows={rows}
        required={required}
        placeholder={placeholder}
        className={`mt-2 w-full resize-none border bg-transparent p-4 font-sans text-base leading-relaxed text-ink placeholder:text-stone-light focus:outline-none ${
          error ? "border-clay" : "border-hairline focus:border-ink"
        }`}
      />
      {error && <span className="mt-1.5 inline-block font-sans text-xs text-clay">{error}</span>}
    </label>
  );
}
