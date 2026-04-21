"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Check, ChevronDown, Code2, ExternalLink } from "lucide-react";
import { cn } from "@/lib/cn";
import { SignInScreen } from "./signin-screen";
import { DashboardView } from "./dashboard-view";
import { Panes, type PaneId } from "./panes";

// ---------- Types ----------

export type Provider = "nextauth" | "clerk" | "supabase" | "better-auth";

export type Session = {
  userId: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  signInMethod: "email" | "magic-link" | "google" | "github" | "apple" | "seeded";
  signedInAt: number;
  expiresAt: number;
};

export type Profile = {
  name: string;
  email: string;
  avatarUrl: string | null;
  timezone: string;
  bio: string;
};

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "member";
};

export type Team = {
  id: string;
  name: string;
  handle: string;
  role: "owner" | "admin" | "member";
  members: TeamMember[];
  seats: number;
};

export type ApiKey = {
  id: string;
  label: string;
  prefix: string; // shown unmasked, like "sk_live_"
  secret: string; // 24-char, shown masked unless revealed
  createdAt: number;
  lastUsedAt: number | null;
  scope: "read" | "read-write" | "admin";
};

export type Plan = "free" | "pro" | "team";

export type Billing = {
  plan: Plan;
  seats: number;
  renewsAt: number | null;
  paymentMethod: string | null;
};

export type ActivityItem = {
  id: string;
  kind: "signin" | "profile" | "team" | "apikey" | "billing" | "signout";
  label: string;
  at: number;
};

export type AppState = {
  provider: Provider;
  session: Session | null;
  profile: Profile;
  teams: Team[];
  apiKeys: ApiKey[];
  billing: Billing;
  activity: ActivityItem[];
};

// ---------- Constants ----------

const STORAGE_KEY = "startoor_auth_starter_demo_v1";
const SESSION_DURATION_MS = 60 * 60 * 1000; // 1 hour

export const PROVIDERS: {
  id: Provider;
  label: string;
  tag: string;
  blurb: string;
}[] = [
  {
    id: "nextauth",
    label: "NextAuth.js",
    tag: "OSS · built-in",
    blurb: "Minimal, unopinionated. The default.",
  },
  {
    id: "clerk",
    label: "Clerk",
    tag: "Hosted · components",
    blurb: "Pre-built widgets, shipped fast.",
  },
  {
    id: "supabase",
    label: "Supabase Auth",
    tag: "OSS · Postgres-native",
    blurb: "Auth + database + storage, one key.",
  },
  {
    id: "better-auth",
    label: "Better Auth",
    tag: "OSS · TypeScript-first",
    blurb: "Lean, typed, framework-agnostic.",
  },
];

// ---------- Seeds ----------

function seedProfile(): Profile {
  return {
    name: "Avery Lange",
    email: "avery@lange.studio",
    avatarUrl: null,
    timezone: "America/New_York",
    bio: "Independent designer. Ships small, honest tools.",
  };
}

function seedTeams(): Team[] {
  return [
    {
      id: "t_1",
      name: "Lange Studio",
      handle: "lange-studio",
      role: "owner",
      seats: 5,
      members: [
        { id: "m_1", name: "Avery Lange", email: "avery@lange.studio", role: "owner" },
        { id: "m_2", name: "Priya Raman", email: "priya@lange.studio", role: "admin" },
        { id: "m_3", name: "Tomás Ortiz", email: "tomas@lange.studio", role: "member" },
      ],
    },
    {
      id: "t_2",
      name: "Harbour Collective",
      handle: "harbour-co",
      role: "admin",
      seats: 3,
      members: [
        { id: "m_4", name: "Nils Bergstrom", email: "nils@harbour.co", role: "owner" },
        { id: "m_5", name: "Avery Lange", email: "avery@lange.studio", role: "admin" },
      ],
    },
    {
      id: "t_3",
      name: "Foxglove Beta",
      handle: "foxglove",
      role: "member",
      seats: 2,
      members: [
        { id: "m_6", name: "June Kwon", email: "june@foxglove.io", role: "owner" },
        { id: "m_7", name: "Avery Lange", email: "avery@lange.studio", role: "member" },
      ],
    },
  ];
}

function seedApiKeys(): ApiKey[] {
  const now = Date.now();
  return [
    {
      id: "k_1",
      label: "Production · web",
      prefix: "sk_live_",
      secret: "Jt7PaQ2XuN4m9oRzKcW8LbdS",
      createdAt: now - 42 * 24 * 60 * 60 * 1000,
      lastUsedAt: now - 9 * 60 * 1000,
      scope: "read-write",
    },
    {
      id: "k_2",
      label: "Local dev",
      prefix: "sk_test_",
      secret: "8rA3vG1fPeMyHzTqX2oWnBcK",
      createdAt: now - 3 * 24 * 60 * 60 * 1000,
      lastUsedAt: now - 2 * 60 * 60 * 1000,
      scope: "read",
    },
  ];
}

function seedActivity(): ActivityItem[] {
  const now = Date.now();
  return [
    { id: "a_1", kind: "profile", label: "Updated profile · avatar", at: now - 24 * 60 * 60 * 1000 },
    { id: "a_2", kind: "apikey", label: "Rotated key · Production · web", at: now - 3 * 24 * 60 * 60 * 1000 },
    { id: "a_3", kind: "team", label: "Invited priya@lange.studio", at: now - 8 * 24 * 60 * 60 * 1000 },
    { id: "a_4", kind: "billing", label: "Upgraded to Pro", at: now - 31 * 24 * 60 * 60 * 1000 },
  ];
}

function initialState(): AppState {
  return {
    provider: "nextauth",
    session: null,
    profile: seedProfile(),
    teams: seedTeams(),
    apiKeys: seedApiKeys(),
    billing: {
      plan: "pro",
      seats: 3,
      renewsAt: Date.now() + 18 * 24 * 60 * 60 * 1000,
      paymentMethod: "Visa · 4242",
    },
    activity: seedActivity(),
  };
}

// ---------- Component ----------

export function AuthApp({
  initialParams,
}: {
  initialParams: { view?: string; provider?: string; pane?: string };
}) {
  const [state, setState] = useState<AppState>(initialState);
  const [hydrated, setHydrated] = useState(false);
  const [view, setView] = useState<"signin" | "dashboard">("signin");
  const [pane, setPane] = useState<PaneId | null>(
    (initialParams.pane as PaneId) || null
  );
  const [authLoading, setAuthLoading] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<AppState>;
        setState((s) => ({ ...s, ...parsed }));
        if (parsed.session && parsed.session.expiresAt > Date.now()) {
          setView("dashboard");
        }
      }
      const urlProvider = initialParams.provider as Provider | undefined;
      if (urlProvider && PROVIDERS.some((p) => p.id === urlProvider)) {
        setState((s) => ({ ...s, provider: urlProvider }));
      }
      if (initialParams.view === "dashboard") {
        // Only allow if we'll have a session after hydration — handled below
      }
    } catch {}
    setHydrated(true);
  }, [initialParams.provider, initialParams.view]);

  // Persist to localStorage
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [state, hydrated]);

  // Tick for session countdown
  useEffect(() => {
    if (view !== "dashboard") return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [view]);

  // Auto-signout on session expiry
  useEffect(() => {
    if (!state.session) return;
    if (state.session.expiresAt <= now) {
      handleSignOut(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now, state.session]);

  // Close picker on outside click / escape
  useEffect(() => {
    if (!pickerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPickerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pickerOpen]);

  // ---------- Actions ----------

  const pushActivity = useCallback(
    (kind: ActivityItem["kind"], label: string) => {
      setState((s) => ({
        ...s,
        activity: [
          { id: `a_${Math.random().toString(36).slice(2, 9)}`, kind, label, at: Date.now() },
          ...s.activity,
        ].slice(0, 12),
      }));
    },
    []
  );

  const signIn = useCallback(
    async (method: Session["signInMethod"], email?: string) => {
      if (authLoading) return;
      setAuthLoading(method);
      // simulate network
      await new Promise((r) => setTimeout(r, 820));
      const providerLabel =
        PROVIDERS.find((p) => p.id === state.provider)?.label || "provider";
      const resolvedEmail =
        email ||
        (method === "google"
          ? "avery@gmail.com"
          : method === "github"
            ? "avery@lange.studio"
            : method === "apple"
              ? "avery@icloud.com"
              : state.profile.email);
      const nextSession: Session = {
        userId: "u_" + Math.random().toString(36).slice(2, 9),
        email: resolvedEmail,
        name: state.profile.name,
        avatarUrl: state.profile.avatarUrl,
        signInMethod: method,
        signedInAt: Date.now(),
        expiresAt: Date.now() + SESSION_DURATION_MS,
      };
      setState((s) => ({
        ...s,
        session: nextSession,
        profile: { ...s.profile, email: resolvedEmail },
      }));
      pushActivity(
        "signin",
        method === "seeded"
          ? `Seeded demo session via ${providerLabel}`
          : `Signed in via ${method} · ${providerLabel}`
      );
      setAuthLoading(null);
      setView("dashboard");
      toast.success(`Session created · ${providerLabel}`);
    },
    [authLoading, state.provider, state.profile, pushActivity]
  );

  const handleSignOut = useCallback(
    (expired = false) => {
      setState((s) => ({ ...s, session: null }));
      setPane(null);
      setView("signin");
      if (expired) {
        toast.message("Session expired", { description: "Please sign in again." });
      } else {
        pushActivity("signout", "Signed out");
        toast.success("Signed out.");
      }
    },
    [pushActivity]
  );

  const refreshSession = useCallback(() => {
    if (!state.session) return;
    setState((s) => ({
      ...s,
      session: s.session
        ? { ...s.session, expiresAt: Date.now() + SESSION_DURATION_MS }
        : null,
    }));
    toast.success("Session refreshed · 60 minutes");
  }, [state.session]);

  const setProvider = useCallback(
    (p: Provider) => {
      setState((s) => ({ ...s, provider: p }));
      setPickerOpen(false);
      toast.message(`Provider · ${PROVIDERS.find((x) => x.id === p)?.label}`, {
        description: "Sign-in screen re-skinned.",
      });
    },
    []
  );

  // Provider accents for the preview banner
  const providerAccent = useMemo(() => {
    switch (state.provider) {
      case "clerk":
        return { dot: "bg-clay", label: "text-clay" };
      case "supabase":
        return { dot: "bg-forest", label: "text-forest" };
      case "better-auth":
        return { dot: "bg-ink", label: "text-ink" };
      default:
        return { dot: "bg-stone", label: "text-ink-soft" };
    }
  }, [state.provider]);

  const currentProvider = PROVIDERS.find((p) => p.id === state.provider)!;

  // ---------- Render ----------

  return (
    <div className="relative">
      {/* Demo banner + provider picker */}
      <div className="border-b border-hairline bg-bone/70">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-3 md:px-10">
          <div className="flex min-w-0 items-center gap-3">
            <span
              className={cn(
                "inline-block h-1.5 w-1.5 rounded-full",
                providerAccent.dot
              )}
            />
            <p className="min-w-0 truncate font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
              Demo · mock auth, localStorage-only · your real deployment uses{" "}
              <span className={cn("font-medium", providerAccent.label)}>
                {currentProvider.label}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                type="button"
                onClick={() => setPickerOpen((o) => !o)}
                className="inline-flex items-center gap-2 rounded-full border border-hairline bg-warm-white px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink transition-colors hover:border-ink"
              >
                <span>{currentProvider.label}</span>
                <ChevronDown
                  className={cn(
                    "h-3 w-3 transition-transform",
                    pickerOpen && "rotate-180"
                  )}
                />
              </button>
              {pickerOpen && (
                <>
                  <div
                    aria-hidden
                    className="fixed inset-0 z-40"
                    onClick={() => setPickerOpen(false)}
                  />
                  <div className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-[4px] border border-hairline bg-warm-white shadow-warm-lg">
                    <div className="border-b border-hairline-soft px-4 py-3">
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
                        Re-skin the sign-in screen
                      </p>
                    </div>
                    <ul className="py-1">
                      {PROVIDERS.map((p) => {
                        const active = p.id === state.provider;
                        return (
                          <li key={p.id}>
                            <button
                              type="button"
                              onClick={() => setProvider(p.id)}
                              className={cn(
                                "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors",
                                active ? "bg-bone" : "hover:bg-bone/60"
                              )}
                            >
                              <span
                                className={cn(
                                  "mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full",
                                  active ? "bg-clay" : "bg-stone-light"
                                )}
                              />
                              <span className="min-w-0 flex-1">
                                <span className="flex items-baseline justify-between gap-2">
                                  <span className="font-display text-base tracking-tight text-ink">
                                    {p.label}
                                  </span>
                                  <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-stone">
                                    {p.tag}
                                  </span>
                                </span>
                                <span className="mt-0.5 block font-sans text-[13px] leading-snug text-ink-soft">
                                  {p.blurb}
                                </span>
                              </span>
                              {active && (
                                <Check className="mt-1 h-3.5 w-3.5 shrink-0 text-clay" />
                              )}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </>
              )}
            </div>
            <Link
              href="/products/nextjs-auth-starter"
              className="group inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-bone transition-colors hover:bg-forest"
            >
              <Code2 className="h-3 w-3" />
              <span>Get the code</span>
              <ExternalLink className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* View router */}
      {view === "signin" ? (
        <SignInScreen
          provider={state.provider}
          onSignIn={signIn}
          loading={authLoading}
          defaultEmail={state.profile.email}
        />
      ) : (
        <div className="relative">
          <DashboardView
            state={state}
            now={now}
            onSignOut={() => handleSignOut(false)}
            onRefresh={refreshSession}
            onOpenPane={(p) => setPane(p)}
          />
          {pane && (
            <Panes
              pane={pane}
              state={state}
              setState={setState}
              onClose={() => setPane(null)}
              pushActivity={pushActivity}
              onAccountDeleted={() => {
                // wipe everything, go back to signin
                try {
                  localStorage.removeItem(STORAGE_KEY);
                } catch {}
                setState(initialState());
                setPane(null);
                setView("signin");
                toast.message("Account deleted", {
                  description: "Demo state reset. You can seed a new session.",
                });
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}
