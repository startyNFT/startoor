"use client";

import { useState } from "react";
import { Loader2, Mail, Zap } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Provider, Session } from "./auth-app";

type Props = {
  provider: Provider;
  loading: string | null;
  defaultEmail: string;
  onSignIn: (
    method: Session["signInMethod"],
    email?: string
  ) => void | Promise<void>;
};

export function SignInScreen({ provider, loading, defaultEmail, onSignIn }: Props) {
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState("");
  const [magicLink, setMagicLink] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  const providerCopy = getProviderCopy(provider);
  const styles = getProviderStyles(provider);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    onSignIn(magicLink ? "magic-link" : "email", email);
  };

  return (
    <section className="relative overflow-hidden bg-paper">
      {/* Atmospheric background per provider */}
      <ProviderBackground provider={provider} />

      <div className="relative mx-auto grid max-w-7xl gap-12 px-6 py-16 md:px-10 md:py-20 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
        {/* Left rail — provider blurb */}
        <aside className="flex flex-col justify-between gap-10 min-w-0">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-clay">
              {providerCopy.tag}
            </span>
            <h2 className="mt-3 font-display text-[28px] leading-[1.05] tracking-tight text-ink md:text-[38px]">
              {providerCopy.headline}
            </h2>
            <p className="mt-5 max-w-md font-sans text-base leading-relaxed text-ink-soft">
              {providerCopy.body}
            </p>
          </div>

          <dl className="grid grid-cols-2 gap-x-8 gap-y-5 border-t border-hairline pt-6">
            {providerCopy.specs.map((s) => (
              <div key={s.k} className="min-w-0">
                <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
                  {s.k}
                </dt>
                <dd className="mt-1 truncate font-display text-[18px] tracking-tight text-ink">
                  {s.v}
                </dd>
              </div>
            ))}
          </dl>

          <button
            type="button"
            onClick={() => onSignIn("seeded")}
            disabled={!!loading}
            className={cn(
              "group inline-flex w-fit items-center gap-2 border-b pb-1 font-mono text-[11px] uppercase tracking-[0.22em] transition-colors",
              "border-hairline text-ink-soft hover:border-ink hover:text-ink disabled:opacity-50"
            )}
          >
            <Zap className="h-3 w-3" />
            <span>Skip auth · seed demo session</span>
            <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </button>
        </aside>

        {/* Right — sign-in card, re-skinned per provider */}
        <div className={cn("relative flex items-start justify-center", styles.wrapper)}>
          <div
            className={cn(
              "relative w-full max-w-md",
              styles.card
            )}
          >
            <ProviderMark provider={provider} />

            <h3
              className={cn(
                "font-display text-[28px] leading-tight tracking-tight",
                styles.title
              )}
            >
              {mode === "signin" ? providerCopy.cardTitle : "Create account"}
            </h3>
            <p className={cn("mt-1.5 font-sans text-[13px]", styles.subtitle)}>
              {mode === "signin"
                ? providerCopy.cardSubtitle
                : "Takes about a minute. No credit card."}
            </p>

            {/* OAuth */}
            <div className="mt-7 grid grid-cols-1 gap-2 sm:grid-cols-3">
              <OAuthButton
                provider={provider}
                brand="google"
                busy={loading === "google"}
                onClick={() => onSignIn("google")}
              />
              <OAuthButton
                provider={provider}
                brand="github"
                busy={loading === "github"}
                onClick={() => onSignIn("github")}
              />
              <OAuthButton
                provider={provider}
                brand="apple"
                busy={loading === "apple"}
                onClick={() => onSignIn("apple")}
              />
            </div>

            <Divider provider={provider} />

            <form className="space-y-4" onSubmit={submit}>
              <label className="block">
                <span
                  className={cn(
                    "font-mono text-[10px] uppercase tracking-[0.2em]",
                    styles.fieldLabel
                  )}
                >
                  Email
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@studio.com"
                  className={cn("mt-2 w-full", styles.input)}
                />
              </label>

              {!magicLink && (
                <label className="block">
                  <div className="flex items-baseline justify-between">
                    <span
                      className={cn(
                        "font-mono text-[10px] uppercase tracking-[0.2em]",
                        styles.fieldLabel
                      )}
                    >
                      Password
                    </span>
                    <button
                      type="button"
                      className={cn(
                        "font-mono text-[10px] uppercase tracking-[0.18em] transition-colors",
                        styles.linkMuted
                      )}
                    >
                      Forgot?
                    </button>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={cn("mt-2 w-full", styles.input)}
                  />
                </label>
              )}

              <label className="flex cursor-pointer items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  checked={magicLink}
                  onChange={(e) => setMagicLink(e.target.checked)}
                  className="h-3.5 w-3.5 shrink-0 accent-clay"
                />
                <span
                  className={cn(
                    "font-mono text-[10px] uppercase tracking-[0.2em]",
                    styles.fieldLabel
                  )}
                >
                  Email me a magic link instead
                </span>
              </label>

              <button
                type="submit"
                disabled={!!loading}
                className={cn(
                  "group mt-2 inline-flex w-full items-center justify-center gap-2 transition-all disabled:cursor-not-allowed disabled:opacity-70",
                  styles.submit
                )}
              >
                {loading === "email" || loading === "magic-link" ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>
                      {magicLink ? "Sending magic link…" : "Creating session…"}
                    </span>
                  </>
                ) : magicLink ? (
                  <>
                    <Mail className="h-3.5 w-3.5" />
                    <span>Send magic link</span>
                  </>
                ) : (
                  <>
                    <span>
                      {mode === "signin" ? "Sign in" : "Create account"}
                    </span>
                    <span className="transition-transform group-hover:translate-x-0.5">
                      →
                    </span>
                  </>
                )}
              </button>
            </form>

            <div className={cn("mt-6 text-center font-sans text-sm", styles.subtitle)}>
              {mode === "signin" ? (
                <>
                  No account yet?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("signup")}
                    className={cn("underline underline-offset-2", styles.linkStrong)}
                  >
                    Create account
                  </button>
                </>
              ) : (
                <>
                  Already have one?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("signin")}
                    className={cn("underline underline-offset-2", styles.linkStrong)}
                  >
                    Sign in
                  </button>
                </>
              )}
            </div>

            <ProviderFooter provider={provider} />
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------- Provider copy & styles ----------

function getProviderCopy(p: Provider) {
  switch (p) {
    case "clerk":
      return {
        tag: "Clerk · hosted auth",
        headline: "Drop-in components. Auth shipped this afternoon.",
        body:
          "Clerk provides the widgets; you provide the route. Sign-in, user menu, org switcher — all pre-built and themed to match.",
        cardTitle: "Sign in to continue",
        cardSubtitle: "Welcome back. We missed you.",
        specs: [
          { k: "Model", v: "Hosted" },
          { k: "Setup", v: "~10 min" },
          { k: "Components", v: "18 prebuilt" },
          { k: "Free tier", v: "10k MAU" },
        ],
      };
    case "supabase":
      return {
        tag: "Supabase Auth · oss",
        headline: "Auth, database, storage. One Postgres row deep.",
        body:
          "Supabase Auth writes directly into your Postgres. Row-level security means authorization lives where the data does, not in middleware.",
        cardTitle: "supabase.auth.signIn()",
        cardSubtitle: "Authenticate against your project.",
        specs: [
          { k: "Model", v: "Self-host / cloud" },
          { k: "Setup", v: "~15 min" },
          { k: "Providers", v: "20+ OAuth" },
          { k: "Free tier", v: "50k MAU" },
        ],
      };
    case "better-auth":
      return {
        tag: "Better Auth · oss",
        headline: "Typed, lean, framework-free. Auth that stays out of the way.",
        body:
          "Better Auth is a library, not a service. Everything typed end-to-end, plugin-based, and runs wherever your Next server does.",
        cardTitle: "Authenticate",
        cardSubtitle: "Library-first. No vendor lock.",
        specs: [
          { k: "Model", v: "Self-host" },
          { k: "Setup", v: "~20 min" },
          { k: "Type-safe", v: "End-to-end" },
          { k: "Bundle", v: "12kb gz" },
        ],
      };
    case "nextauth":
    default:
      return {
        tag: "NextAuth.js · oss",
        headline: "The default. Quiet, configurable, everywhere.",
        body:
          "NextAuth.js lives in your repo, speaks to any OAuth provider, and writes sessions to the adapter of your choice — Postgres, Redis, memory, or a JWT.",
        cardTitle: "Sign in",
        cardSubtitle: "Use your email or a social provider.",
        specs: [
          { k: "Model", v: "Self-host" },
          { k: "Setup", v: "~5 min" },
          { k: "Adapters", v: "12+ built-in" },
          { k: "Free", v: "MIT" },
        ],
      };
  }
}

type StyleBag = {
  wrapper: string;
  card: string;
  title: string;
  subtitle: string;
  fieldLabel: string;
  input: string;
  submit: string;
  linkMuted: string;
  linkStrong: string;
};

function getProviderStyles(p: Provider): StyleBag {
  const baseInput =
    "border-b bg-transparent py-2 font-sans text-sm text-ink placeholder:text-stone-light focus:outline-none";
  switch (p) {
    case "clerk":
      return {
        wrapper: "",
        card:
          "relative rounded-2xl border border-hairline bg-warm-white p-8 shadow-warm-lg md:p-10",
        title: "text-ink",
        subtitle: "text-ink-soft",
        fieldLabel: "text-stone",
        input: `${baseInput} border-hairline rounded-md border px-3 focus:border-clay`,
        submit:
          "rounded-full bg-clay px-5 py-2.5 font-sans text-sm font-medium text-bone shadow-warm-sm hover:bg-clay-soft",
        linkMuted: "text-stone hover:text-clay",
        linkStrong: "text-clay",
      };
    case "supabase":
      return {
        wrapper: "",
        card:
          "relative border border-forest/20 bg-warm-white p-8 md:p-10",
        title: "font-mono text-forest normal-case tracking-tight",
        subtitle: "text-ink-soft",
        fieldLabel: "text-forest",
        input: `${baseInput} border-forest/25 focus:border-forest`,
        submit:
          "bg-forest px-5 py-2.5 font-mono text-[12px] uppercase tracking-[0.18em] text-bone hover:bg-forest-soft",
        linkMuted: "text-stone hover:text-forest",
        linkStrong: "text-forest",
      };
    case "better-auth":
      return {
        wrapper: "",
        card:
          "relative border-2 border-ink bg-warm-white p-8 md:p-10",
        title: "text-ink",
        subtitle: "text-ink-soft",
        fieldLabel: "text-ink",
        input: `${baseInput} border-ink/20 focus:border-ink`,
        submit:
          "bg-ink px-5 py-2.5 font-sans text-sm font-medium text-bone hover:bg-ink-soft",
        linkMuted: "text-stone hover:text-ink",
        linkStrong: "text-ink",
      };
    case "nextauth":
    default:
      return {
        wrapper: "",
        card:
          "relative border border-hairline bg-bone p-8 md:p-10",
        title: "text-ink",
        subtitle: "text-ink-soft",
        fieldLabel: "text-stone",
        input: `${baseInput} border-hairline focus:border-ink`,
        submit:
          "rounded-full bg-ink px-5 py-2.5 font-sans text-sm font-medium text-bone hover:bg-forest",
        linkMuted: "text-stone hover:text-ink",
        linkStrong: "text-ink",
      };
  }
}

// ---------- Provider mark (corner brand hint) ----------

function ProviderMark({ provider }: { provider: Provider }) {
  switch (provider) {
    case "clerk":
      return (
        <div className="mb-6 flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-clay/15">
            <span className="block h-2.5 w-2.5 rounded-full bg-clay" />
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-clay">
            Clerk · demo
          </span>
        </div>
      );
    case "supabase":
      return (
        <div className="mb-6 flex items-center gap-2">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            className="text-forest"
          >
            <path
              d="M13 3L4 14h8v7l9-11h-8V3z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
          </svg>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-forest">
            supabase · demo
          </span>
        </div>
      );
    case "better-auth":
      return (
        <div className="mb-6 flex items-center gap-2">
          <span className="inline-block h-3 w-3 rotate-45 bg-ink" />
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink">
            Better Auth · demo
          </span>
        </div>
      );
    case "nextauth":
    default:
      return (
        <div className="mb-6 flex items-center gap-2">
          <span className="font-mono text-[11px] font-medium tracking-tight text-ink">
            ▲
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone">
            NextAuth · demo
          </span>
        </div>
      );
  }
}

function ProviderFooter({ provider }: { provider: Provider }) {
  if (provider === "supabase") {
    return (
      <p className="mt-6 text-center font-mono text-[9px] uppercase tracking-[0.24em] text-stone-light">
        {"{ powered_by: 'supabase' }"}
      </p>
    );
  }
  if (provider === "better-auth") {
    return (
      <p className="mt-6 text-center font-mono text-[9px] uppercase tracking-[0.24em] text-stone-light">
        better-auth@1.0.0 · typed
      </p>
    );
  }
  if (provider === "clerk") {
    return (
      <p className="mt-6 text-center font-mono text-[9px] uppercase tracking-[0.24em] text-stone-light">
        Secured by Clerk · SOC 2
      </p>
    );
  }
  return (
    <p className="mt-6 text-center font-mono text-[9px] uppercase tracking-[0.24em] text-stone-light">
      next-auth@5 · MIT licensed
    </p>
  );
}

function ProviderBackground({ provider }: { provider: Provider }) {
  if (provider === "supabase") {
    return (
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--color-forest) 1px, transparent 1px), linear-gradient(to bottom, var(--color-forest) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
    );
  }
  if (provider === "clerk") {
    return (
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(600px 400px at 85% 10%, rgba(200,90,63,0.10), transparent 60%)",
        }}
      />
    );
  }
  if (provider === "better-auth") {
    return (
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, rgba(28,28,26,0.04) 100%)",
        }}
      />
    );
  }
  return null;
}

function Divider({ provider }: { provider: Provider }) {
  const label =
    provider === "supabase"
      ? "or /auth with email"
      : provider === "better-auth"
        ? "or credentials"
        : "or with email";
  return (
    <div className="relative my-7 flex items-center">
      <div className="flex-1 border-t border-hairline" />
      <span className="px-3 font-mono text-[10px] uppercase tracking-[0.22em] text-stone">
        {label}
      </span>
      <div className="flex-1 border-t border-hairline" />
    </div>
  );
}

// ---------- OAuth button ----------

function OAuthButton({
  provider,
  brand,
  busy,
  onClick,
}: {
  provider: Provider;
  brand: "google" | "github" | "apple";
  busy: boolean;
  onClick: () => void;
}) {
  const shape =
    provider === "clerk"
      ? "rounded-lg"
      : provider === "nextauth"
        ? "rounded-full"
        : "rounded-none";
  const border =
    provider === "better-auth"
      ? "border-2 border-ink/70 hover:border-ink"
      : provider === "supabase"
        ? "border border-forest/30 hover:border-forest"
        : "border border-hairline hover:border-ink";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className={cn(
        "group relative flex items-center justify-center gap-2 bg-warm-white py-2.5 font-sans text-xs text-ink transition-colors disabled:opacity-60",
        shape,
        border
      )}
    >
      {busy ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <BrandGlyph brand={brand} />
      )}
      <span className="font-mono text-[10px] uppercase tracking-[0.18em]">
        {brand}
      </span>
    </button>
  );
}

function BrandGlyph({ brand }: { brand: "google" | "github" | "apple" }) {
  if (brand === "google") {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" className="shrink-0">
        <path
          fill="#EA4335"
          d="M12 11v3.2h5.35c-.22 1.2-1.66 3.53-5.35 3.53-3.22 0-5.85-2.67-5.85-5.96S8.78 5.81 12 5.81c1.84 0 3.07.78 3.77 1.45l2.57-2.47C16.73 3.34 14.58 2.4 12 2.4 6.8 2.4 2.6 6.6 2.6 11.77S6.8 21.15 12 21.15c6.94 0 8.66-4.85 8.66-8.76 0-.59-.06-1.04-.15-1.49H12z"
        />
      </svg>
    );
  }
  if (brand === "github") {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" className="shrink-0 text-ink">
        <path
          fill="currentColor"
          d="M12 .5C5.73.5.75 5.48.75 11.75c0 4.95 3.21 9.14 7.66 10.62.56.1.77-.24.77-.54 0-.27-.01-1.15-.01-2.08-3.12.57-3.92-.76-4.17-1.45-.14-.36-.77-1.46-1.31-1.75-.45-.24-1.09-.83-.02-.85 1.01-.02 1.73.93 1.97 1.31 1.15 1.93 2.98 1.39 3.7 1.06.11-.83.45-1.39.81-1.71-2.77-.31-5.66-1.39-5.66-6.17 0-1.36.49-2.48 1.29-3.35-.13-.32-.56-1.6.12-3.33 0 0 1.05-.33 3.44 1.28.99-.28 2.05-.42 3.11-.42 1.06 0 2.12.14 3.11.42 2.38-1.62 3.43-1.28 3.43-1.28.68 1.73.25 3.01.12 3.33.8.87 1.29 1.99 1.29 3.35 0 4.79-2.91 5.86-5.68 6.17.46.4.87 1.17.87 2.37 0 1.71-.02 3.08-.02 3.5 0 .3.21.65.78.54 4.42-1.48 7.63-5.67 7.63-10.62C23.25 5.48 18.27.5 12 .5z"
        />
      </svg>
    );
  }
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" className="shrink-0 text-ink">
      <path
        fill="currentColor"
        d="M17.05 20.28c-.98.96-2.06.81-3.09.36-1.09-.47-2.09-.47-3.22 0-1.44.62-2.2.44-3.07-.36C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8.89-.13 2.15-.82 3.58-.71 2.11.17 3.6 1.33 4.32 2.92-3.94 2.38-3.06 7.12.49 8.46-.55 1.44-1.14 2.84-2.47 4.5zM12.03 7.21c-.07-1.96 1.41-3.6 3.22-3.77.22 1.99-1.71 3.72-3.22 3.77z"
      />
    </svg>
  );
}
