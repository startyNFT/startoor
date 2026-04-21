"use client";

import { useMemo } from "react";
import {
  CreditCard,
  KeyRound,
  LogOut,
  RefreshCw,
  User,
  Users,
} from "lucide-react";
import { cn } from "@/lib/cn";
import type { ActivityItem, AppState } from "./auth-app";
import { PROVIDERS } from "./auth-app";
import type { PaneId } from "./panes";

type Props = {
  state: AppState;
  now: number;
  onSignOut: () => void;
  onRefresh: () => void;
  onOpenPane: (p: PaneId) => void;
};

export function DashboardView({ state, now, onSignOut, onRefresh, onOpenPane }: Props) {
  const session = state.session!;
  const provider = PROVIDERS.find((p) => p.id === state.provider)!;

  const greeting = useMemo(() => greet(new Date()), []);
  const firstName = (session.name || state.profile.name || "there").split(" ")[0];

  const remainingMs = Math.max(0, session.expiresAt - now);
  const mins = Math.floor(remainingMs / 60000);
  const secs = Math.floor((remainingMs % 60000) / 1000);
  const pct = Math.max(0, Math.min(100, (remainingMs / (60 * 60 * 1000)) * 100));

  const initials = (session.name || state.profile.name || "?")
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const cards: { id: PaneId; label: string; caption: string; icon: React.ReactNode; meta: string }[] = [
    {
      id: "profile",
      label: "Profile",
      caption: "Name, avatar, timezone",
      icon: <User className="h-4 w-4" />,
      meta: state.profile.email,
    },
    {
      id: "teams",
      label: "Teams",
      caption: `${state.teams.length} · across ${state.teams.reduce((n, t) => n + t.members.length, 0)} members`,
      icon: <Users className="h-4 w-4" />,
      meta: `${state.teams.filter((t) => t.role === "owner").length} owned`,
    },
    {
      id: "apikeys",
      label: "API Keys",
      caption: `${state.apiKeys.length} · live + test`,
      icon: <KeyRound className="h-4 w-4" />,
      meta: "Rotate anytime",
    },
    {
      id: "billing",
      label: "Billing",
      caption: `Plan · ${state.billing.plan}`,
      icon: <CreditCard className="h-4 w-4" />,
      meta:
        state.billing.renewsAt && state.billing.plan !== "free"
          ? `Renews ${dateShort(state.billing.renewsAt)}`
          : "No payment on file",
    },
  ];

  return (
    <div className="relative bg-paper">
      <div className="mx-auto max-w-7xl px-6 py-10 md:px-10 md:py-14">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-6 border-b border-hairline pb-8">
          <div className="flex min-w-0 items-center gap-4">
            <div
              className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-bone",
                avatarBg(session.email)
              )}
              aria-hidden
            >
              {session.avatarUrl || state.profile.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={(session.avatarUrl || state.profile.avatarUrl)!}
                  alt=""
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <span className="font-display text-base tracking-tight">
                  {initials}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-clay">
                Signed in · {provider.label}
              </p>
              <p className="mt-1 min-w-0 truncate font-display text-[22px] leading-tight tracking-tight text-ink md:text-[26px]">
                {session.name}
              </p>
              <p className="mt-0.5 truncate font-mono text-[11px] text-stone">
                {session.email}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onSignOut}
            className="inline-flex items-center gap-2 rounded-full border border-hairline px-4 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft transition-colors hover:border-ink hover:text-ink"
          >
            <LogOut className="h-3 w-3" />
            <span>Sign out</span>
          </button>
        </div>

        {/* Main grid */}
        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          {/* Left column */}
          <div className="space-y-8 min-w-0">
            {/* Welcome tile */}
            <section className="relative overflow-hidden border border-hairline bg-warm-white">
              <div className="absolute inset-x-0 top-0 h-[3px] bg-forest" />
              <div className="px-7 py-9 md:px-10 md:py-12">
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-clay">
                  {greeting} ·{" "}
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
                <h2 className="mt-3 font-display text-[28px] leading-[1.05] tracking-tight text-ink">
                  Welcome back, <span className="italic text-forest">{firstName}</span>.
                </h2>
                <p className="mt-4 max-w-xl font-sans text-[15px] leading-relaxed text-ink-soft">
                  Your session is active. Jump into any surface below — it&apos;s all
                  wired up and writes to your device. Ship with this shape and
                  swap the state layer for your real backend.
                </p>

                <dl className="mt-8 grid grid-cols-2 gap-x-8 gap-y-5 border-t border-hairline pt-6 sm:grid-cols-4">
                  <Stat k="Session" v={`${mins}m ${String(secs).padStart(2, "0")}s`} mono />
                  <Stat k="Method" v={prettyMethod(session.signInMethod)} />
                  <Stat k="Teams" v={String(state.teams.length)} mono />
                  <Stat k="Plan" v={capitalize(state.billing.plan)} />
                </dl>
              </div>
            </section>

            {/* Feature cards */}
            <section>
              <div className="mb-3 flex items-baseline justify-between">
                <h3 className="font-display text-[20px] tracking-tight text-ink">
                  Account
                </h3>
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone">
                  4 surfaces
                </span>
              </div>
              <div className="grid gap-px bg-hairline sm:grid-cols-2">
                {cards.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => onOpenPane(c.id)}
                    className="group relative flex min-w-0 items-start justify-between gap-4 bg-warm-white p-6 text-left transition-colors hover:bg-bone"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full border border-hairline text-ink-soft transition-colors group-hover:border-ink group-hover:text-ink">
                          {c.icon}
                        </span>
                        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone">
                          {c.label}
                        </span>
                      </div>
                      <p className="mt-4 min-w-0 truncate font-display text-[22px] leading-tight tracking-tight text-ink">
                        {c.caption}
                      </p>
                      <p className="mt-1 truncate font-mono text-[11px] text-stone">
                        {c.meta}
                      </p>
                    </div>
                    <span className="mt-1 font-mono text-[11px] text-stone transition-transform group-hover:translate-x-0.5 group-hover:text-ink">
                      →
                    </span>
                  </button>
                ))}
              </div>
            </section>
          </div>

          {/* Right column */}
          <aside className="space-y-8 min-w-0">
            {/* Session card */}
            <section className="relative border border-hairline bg-bone">
              <div className="px-6 py-7">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-forest">
                    Session
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
                    {session.userId}
                  </span>
                </div>

                <div className="mt-4 flex items-baseline gap-3">
                  <span className="font-display text-[28px] tabular-nums leading-none tracking-tight text-ink">
                    {mins}:{String(secs).padStart(2, "0")}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone">
                    remaining
                  </span>
                </div>

                <div className="mt-4 h-[3px] w-full overflow-hidden bg-hairline">
                  <div
                    className={cn(
                      "h-full transition-all duration-1000",
                      pct > 25 ? "bg-forest" : "bg-clay"
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <dl className="mt-6 space-y-2 font-sans text-[13px]">
                  <MetaRow k="Signed in" v={relTime(session.signedInAt, now)} />
                  <MetaRow k="Expires" v={dateTimeShort(session.expiresAt)} />
                  <MetaRow k="Method" v={prettyMethod(session.signInMethod)} />
                  <MetaRow k="Provider" v={provider.label} />
                </dl>

                <button
                  type="button"
                  onClick={onRefresh}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-4 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-bone transition-colors hover:bg-forest"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Refresh session</span>
                </button>
              </div>
            </section>

            {/* Activity */}
            <section>
              <div className="mb-3 flex items-baseline justify-between">
                <h3 className="font-display text-[20px] tracking-tight text-ink">
                  Activity
                </h3>
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone">
                  Last {Math.min(state.activity.length, 12)}
                </span>
              </div>
              <ul className="space-y-0 border-t border-hairline">
                {state.activity.length === 0 ? (
                  <li className="py-5 font-sans text-sm text-stone">
                    No activity yet.
                  </li>
                ) : (
                  state.activity.slice(0, 8).map((a) => (
                    <li
                      key={a.id}
                      className="flex items-baseline justify-between gap-3 border-b border-hairline-soft py-3"
                    >
                      <div className="flex min-w-0 items-baseline gap-3">
                        <span
                          className={cn(
                            "mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full",
                            activityDot(a.kind)
                          )}
                          aria-hidden
                        />
                        <span className="min-w-0 truncate font-sans text-[13px] text-ink">
                          {a.label}
                        </span>
                      </div>
                      <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.18em] text-stone">
                        {relTime(a.at, now)}
                      </span>
                    </li>
                  ))
                )}
              </ul>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

// ---------- Small bits ----------

function Stat({ k, v, mono = false }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
        {k}
      </dt>
      <dd
        className={cn(
          "mt-1 truncate text-[20px] leading-tight tracking-tight text-ink",
          mono ? "font-mono tabular-nums" : "font-display"
        )}
      >
        {v}
      </dd>
    </div>
  );
}

function MetaRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
        {k}
      </dt>
      <dd className="truncate font-mono text-[11px] text-ink">{v}</dd>
    </div>
  );
}

function activityDot(kind: ActivityItem["kind"]) {
  switch (kind) {
    case "signin":
      return "bg-forest";
    case "signout":
      return "bg-stone-light";
    case "team":
      return "bg-butter";
    case "apikey":
      return "bg-clay";
    case "billing":
      return "bg-forest-light";
    default:
      return "bg-ink-soft";
  }
}

function avatarBg(email: string) {
  const palette = [
    "bg-forest",
    "bg-clay",
    "bg-forest-soft",
    "bg-ink",
  ];
  const i = Math.abs(hashCode(email)) % palette.length;
  return palette[i];
}

function hashCode(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return h;
}

function greet(d: Date) {
  const h = d.getHours();
  if (h < 5) return "Up late";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Good evening";
}

function prettyMethod(m: string) {
  if (m === "magic-link") return "Magic link";
  return m.charAt(0).toUpperCase() + m.slice(1);
}

function relTime(ts: number, now: number) {
  const diff = Math.max(0, now - ts);
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function dateShort(ts: number) {
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function dateTimeShort(ts: number) {
  return new Date(ts).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
