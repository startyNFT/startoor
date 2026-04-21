"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  Plus,
  Trash2,
  Webhook,
} from "lucide-react";
import { cn } from "@/lib/cn";
import {
  API_KEYS,
  TEAM_MEMBERS,
  WEBHOOKS,
  formatDate,
  formatDateTime,
} from "@/lib/data/saas-dashboard-mock";

type Tab = "general" | "team" | "keys" | "webhooks";

type SettingsProps = {
  workspaceName: string;
  timezone: string;
  apiKeysRevealed: Record<string, boolean>;
  webhookActive: Record<string, boolean>;
  onPatch: (p: {
    workspaceName?: string;
    timezone?: string;
    apiKeysRevealed?: Record<string, boolean>;
    webhookActive?: Record<string, boolean>;
  }) => void;
};

export function SettingsView(props: SettingsProps) {
  const [tab, setTab] = useState<Tab>("general");

  return (
    <div className="px-5 py-6 md:px-8 md:py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-clay">
            Settings
          </p>
          <h2 className="mt-2 font-display text-[30px] leading-[1.05] tracking-tight text-ink md:text-[36px]">
            The knobs and levers.
          </h2>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex flex-wrap items-center gap-1 border-b border-hairline">
        {(
          [
            { id: "general", label: "General" },
            { id: "team", label: "Team" },
            { id: "keys", label: "API keys" },
            { id: "webhooks", label: "Webhooks" },
          ] as { id: Tab; label: string }[]
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "-mb-px border-b-2 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.22em] transition-colors",
              tab === t.id
                ? "border-forest text-ink"
                : "border-transparent text-stone hover:text-ink",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "general" && <GeneralTab {...props} />}
        {tab === "team" && <TeamTab />}
        {tab === "keys" && <KeysTab {...props} />}
        {tab === "webhooks" && <WebhooksTab {...props} />}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// General tab
// ---------------------------------------------------------------------------

function GeneralTab({
  workspaceName,
  timezone,
  onPatch,
}: SettingsProps) {
  const [localName, setLocalName] = useState(workspaceName);
  const [localTz, setLocalTz] = useState(timezone);

  const dirty = localName !== workspaceName || localTz !== timezone;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <section className="overflow-hidden rounded-sm border border-hairline bg-warm-white">
        <div className="border-b border-hairline-soft px-5 py-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-clay">
            Workspace
          </p>
          <h3 className="mt-1 font-display text-xl tracking-tight text-ink md:text-[22px]">
            Names on the door.
          </h3>
        </div>
        <div className="flex flex-col gap-5 p-5">
          <Field label="Workspace name">
            <input
              type="text"
              value={localName}
              onChange={(e) => setLocalName(e.target.value)}
              className="w-full rounded-sm border border-hairline bg-paper px-3 py-2 font-sans text-sm text-ink focus:border-ink focus:outline-none"
            />
          </Field>
          <Field
            label="Timezone"
            hint="All report times are rendered relative to this zone."
          >
            <select
              value={localTz}
              onChange={(e) => setLocalTz(e.target.value)}
              className="w-full rounded-sm border border-hairline bg-paper px-3 py-2 font-sans text-sm text-ink focus:border-ink focus:outline-none"
            >
              <option>America/Los_Angeles</option>
              <option>America/New_York</option>
              <option>Europe/London</option>
              <option>Europe/Berlin</option>
              <option>Asia/Tokyo</option>
              <option>Australia/Sydney</option>
            </select>
          </Field>
          <Field label="Subdomain" hint="Your login page lives here.">
            <div className="flex items-stretch overflow-hidden rounded-sm border border-hairline">
              <input
                type="text"
                defaultValue="oakbend"
                className="min-w-0 flex-1 bg-paper px-3 py-2 font-sans text-sm text-ink focus:outline-none"
              />
              <span className="flex items-center border-l border-hairline bg-bone px-3 font-mono text-xs text-stone">
                .startoor.app
              </span>
            </div>
          </Field>

          <div className="mt-1 flex items-center justify-between gap-3 border-t border-hairline-soft pt-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone">
              {dirty ? "Unsaved changes" : "All changes saved"}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setLocalName(workspaceName);
                  setLocalTz(timezone);
                }}
                disabled={!dirty}
                className="rounded-sm border border-hairline bg-warm-white px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft hover:border-ink hover:text-ink disabled:opacity-40"
              >
                Revert
              </button>
              <button
                type="button"
                disabled={!dirty}
                onClick={() => {
                  onPatch({ workspaceName: localName, timezone: localTz });
                  toast.success("Workspace settings saved.");
                }}
                className="rounded-sm bg-ink px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-bone hover:bg-forest disabled:opacity-40"
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-sm border border-hairline bg-warm-white">
        <div className="border-b border-hairline-soft px-5 py-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-clay">
            Danger zone
          </p>
          <h3 className="mt-1 font-display text-xl tracking-tight text-ink md:text-[22px]">
            Irreversible things.
          </h3>
        </div>
        <div className="flex flex-col gap-4 p-5">
          <DangerRow
            title="Transfer ownership"
            description="Hand the keys to another admin. They'll become the billing contact."
            cta="Transfer"
          />
          <DangerRow
            title="Export all data"
            description="Generate a zip of every record in this workspace. Takes ~2 minutes."
            cta="Request export"
          />
          <DangerRow
            title="Delete workspace"
            description="Permanently remove this workspace and every record inside it."
            cta="Delete workspace"
            destructive
          />
        </div>
      </section>
    </div>
  );
}

function DangerRow({
  title,
  description,
  cta,
  destructive,
}: {
  title: string;
  description: string;
  cta: string;
  destructive?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-t border-hairline-soft pt-4 first:border-0 first:pt-0">
      <div className="min-w-0">
        <p className="font-sans text-sm text-ink">{title}</p>
        <p className="mt-0.5 font-sans text-xs leading-snug text-ink-soft">
          {description}
        </p>
      </div>
      <button
        type="button"
        onClick={() => toast.info(`Demo — ${cta.toLowerCase()} disabled.`)}
        className={cn(
          "flex-shrink-0 rounded-sm border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors",
          destructive
            ? "border-clay text-clay hover:bg-clay hover:text-bone"
            : "border-hairline text-ink-soft hover:border-ink hover:text-ink",
        )}
      >
        {cta}
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Team tab
// ---------------------------------------------------------------------------

function TeamTab() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"editor" | "viewer" | "admin">("editor");

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
      <section className="overflow-hidden rounded-sm border border-hairline bg-warm-white">
        <div className="border-b border-hairline-soft px-5 py-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-clay">
            Invite
          </p>
          <h3 className="mt-1 font-display text-xl tracking-tight text-ink md:text-[22px]">
            Add a teammate.
          </h3>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!email.trim() || !email.includes("@")) {
              toast.error("Enter a valid email.");
              return;
            }
            toast.success(`Invite sent to ${email}.`);
            setEmail("");
          }}
          className="flex flex-col gap-4 p-5"
        >
          <Field label="Email">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="teammate@oakbend.studio"
              className="w-full rounded-sm border border-hairline bg-paper px-3 py-2 font-sans text-sm text-ink focus:border-ink focus:outline-none"
            />
          </Field>
          <Field label="Role">
            <div className="flex flex-wrap gap-2">
              {(["admin", "editor", "viewer"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={cn(
                    "rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors",
                    role === r
                      ? "border-ink bg-ink text-bone"
                      : "border-hairline text-ink-soft hover:border-ink hover:text-ink",
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
            <p className="mt-2 font-sans text-xs leading-snug text-ink-soft">
              {role === "admin" &&
                "Can manage billing, members, and all settings. Cannot delete the workspace."}
              {role === "editor" && "Can read and write every record. No billing access."}
              {role === "viewer" && "Read-only access to data. Cannot make any changes."}
            </p>
          </Field>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-sm bg-ink px-3 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-bone hover:bg-forest"
          >
            <Plus className="h-3 w-3" /> Send invite
          </button>
        </form>
      </section>

      <section className="overflow-hidden rounded-sm border border-hairline bg-warm-white">
        <div className="border-b border-hairline-soft px-5 py-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-clay">
            Members · {TEAM_MEMBERS.length}
          </p>
          <h3 className="mt-1 font-display text-xl tracking-tight text-ink md:text-[22px]">
            People with access.
          </h3>
        </div>
        <ul className="divide-y divide-hairline-soft">
          {TEAM_MEMBERS.map((m) => (
            <li key={m.id} className="flex items-center gap-3 px-5 py-3">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[3px] bg-forest text-[10px] font-semibold text-bone">
                {m.name
                  .split(" ")
                  .map((s) => s[0])
                  .join("")
                  .slice(0, 2)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-sans text-sm text-ink">{m.name}</p>
                <p className="truncate font-mono text-[10px] text-stone">{m.email}</p>
              </div>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em]",
                  m.role === "owner"
                    ? "bg-forest text-bone"
                    : m.role === "admin"
                      ? "bg-ink text-bone"
                      : m.role === "editor"
                        ? "bg-butter/50 text-ink"
                        : "bg-stone/15 text-ink-soft",
                )}
              >
                {m.role}
              </span>
              <span className="hidden font-mono text-[10px] uppercase tracking-[0.18em] text-stone md:inline">
                since {formatDate(m.addedAt)}
              </span>
              {m.role !== "owner" && (
                <button
                  type="button"
                  onClick={() => toast.info(`Demo — removing ${m.name} disabled.`)}
                  className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-sm border border-hairline bg-warm-white text-ink-soft transition-colors hover:border-clay hover:text-clay"
                  aria-label={`Remove ${m.name}`}
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// API keys tab
// ---------------------------------------------------------------------------

function KeysTab({ apiKeysRevealed, onPatch }: SettingsProps) {
  const [localRevealed, setLocalRevealed] = useState(apiKeysRevealed);

  const toggle = (id: string) => {
    const next = { ...localRevealed, [id]: !localRevealed[id] };
    setLocalRevealed(next);
    onPatch({ apiKeysRevealed: next });
  };

  const copy = (text: string) => {
    navigator.clipboard?.writeText(text).then(
      () => toast.success("Copied to clipboard."),
      () => toast.error("Copy failed."),
    );
  };

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-sm border border-hairline bg-warm-white">
        <div className="flex items-end justify-between gap-4 border-b border-hairline-soft px-5 py-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-clay">
              API keys
            </p>
            <h3 className="mt-1 font-display text-xl tracking-tight text-ink md:text-[22px]">
              For programmatic access.
            </h3>
          </div>
          <button
            type="button"
            onClick={() => toast.info("Demo — key creation disabled.")}
            className="inline-flex items-center gap-1.5 rounded-sm bg-ink px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-bone hover:bg-forest"
          >
            <Plus className="h-3 w-3" /> New key
          </button>
        </div>
        <ul className="divide-y divide-hairline-soft">
          {API_KEYS.map((k) => {
            const revealed = localRevealed[k.id];
            return (
              <li key={k.id} className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[3px] bg-bone text-ink">
                    <KeyRound className="h-4 w-4" strokeWidth={1.5} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-sans text-sm text-ink">{k.label}</p>
                    <p className="truncate font-mono text-[10px] uppercase tracking-[0.18em] text-stone">
                      Created {formatDate(k.createdAt)} · last used {formatDateTime(k.lastUsedAt)}
                    </p>
                  </div>
                </div>
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <code className="min-w-0 flex-1 overflow-hidden truncate rounded-sm border border-hairline bg-bone px-3 py-1.5 font-mono text-xs text-ink">
                    {revealed ? k.secret : `${k.prefix}${"•".repeat(24)}`}
                  </code>
                  <button
                    type="button"
                    onClick={() => toggle(k.id)}
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-sm border border-hairline bg-warm-white text-ink-soft transition-colors hover:border-ink hover:text-ink"
                    aria-label={revealed ? "Hide" : "Reveal"}
                  >
                    {revealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => copy(revealed ? k.secret : k.prefix)}
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-sm border border-hairline bg-warm-white text-ink-soft transition-colors hover:border-ink hover:text-ink"
                    aria-label="Copy"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 md:ml-auto">
                  {k.scopes.map((s) => (
                    <span
                      key={s}
                      className="rounded-full border border-hairline bg-bone px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.16em] text-ink-soft"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Webhooks tab
// ---------------------------------------------------------------------------

function WebhooksTab({ webhookActive, onPatch }: SettingsProps) {
  const [localActive, setLocalActive] = useState(webhookActive);

  const isActive = (id: string, fallback: boolean) =>
    localActive[id] !== undefined ? !!localActive[id] : fallback;

  const toggle = (id: string, current: boolean) => {
    const next = { ...localActive, [id]: !current };
    setLocalActive(next);
    onPatch({ webhookActive: next });
    toast.success(`Webhook ${current ? "paused" : "activated"}.`);
  };

  return (
    <section className="overflow-hidden rounded-sm border border-hairline bg-warm-white">
      <div className="flex items-end justify-between gap-4 border-b border-hairline-soft px-5 py-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-clay">
            Webhooks
          </p>
          <h3 className="mt-1 font-display text-xl tracking-tight text-ink md:text-[22px]">
            Where events get delivered.
          </h3>
        </div>
        <button
          type="button"
          onClick={() => toast.info("Demo — webhook creation disabled.")}
          className="inline-flex items-center gap-1.5 rounded-sm bg-ink px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-bone hover:bg-forest"
        >
          <Plus className="h-3 w-3" /> Add endpoint
        </button>
      </div>
      <ul className="divide-y divide-hairline-soft">
        {WEBHOOKS.map((w) => {
          const active = isActive(w.id, w.active);
          return (
            <li key={w.id} className="flex flex-col gap-3 px-5 py-4">
              <div className="flex items-start gap-3">
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[3px] bg-bone text-ink">
                  <Webhook className="h-4 w-4" strokeWidth={1.5} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-sm text-ink">{w.url}</p>
                  <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-stone">
                    Last delivery {formatDateTime(w.lastDeliveryAt)} ·{" "}
                    <span
                      className={cn(
                        w.lastStatus === "ok" ? "text-forest" : "text-clay",
                      )}
                    >
                      {w.lastStatus === "ok" ? "delivered 200" : "failed"}
                    </span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggle(w.id, active)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors",
                    active
                      ? "border-forest bg-forest text-bone"
                      : "border-hairline text-ink-soft hover:border-ink hover:text-ink",
                  )}
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      active ? "bg-bone" : "bg-stone",
                    )}
                  />
                  {active ? "Active" : "Paused"}
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 pl-11">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
                  Events:
                </span>
                {w.events.map((ev) => (
                  <span
                    key={ev}
                    className="rounded-full border border-hairline bg-bone px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.16em] text-ink-soft"
                  >
                    {ev}
                  </span>
                ))}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Field helper
// ---------------------------------------------------------------------------

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-clay">
        {label}
      </span>
      {children}
      {hint && (
        <span className="font-sans text-xs leading-snug text-ink-soft">
          {hint}
        </span>
      )}
    </label>
  );
}
