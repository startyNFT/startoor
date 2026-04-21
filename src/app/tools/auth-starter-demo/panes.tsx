"use client";

import { useEffect, useRef, useState } from "react";
import {
  Check,
  Copy,
  Eye,
  EyeOff,
  RotateCw,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/cn";
import type {
  ActivityItem,
  ApiKey,
  AppState,
  Plan,
  TeamMember,
} from "./auth-app";

export type PaneId = "profile" | "teams" | "apikeys" | "billing";

type Props = {
  pane: PaneId;
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  onClose: () => void;
  pushActivity: (kind: ActivityItem["kind"], label: string) => void;
  onAccountDeleted: () => void;
};

export function Panes(props: Props) {
  const { pane, onClose } = props;

  // Close on escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Lock scroll while pane open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-stretch justify-end bg-ink/40 backdrop-blur-[2px] animate-fade-in"
      onClick={onClose}
    >
      <aside
        onClick={(e) => e.stopPropagation()}
        className="relative flex h-full w-full max-w-2xl flex-col overflow-y-auto border-l border-hairline bg-paper shadow-warm-xl"
        style={{ animation: "slide-in 280ms cubic-bezier(0.2, 0.7, 0.2, 1)" }}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-hairline bg-paper/95 px-6 py-4 backdrop-blur-md md:px-8">
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-clay">
              Account · {labelFor(pane)}
            </p>
            <p className="mt-0.5 truncate font-display text-[20px] tracking-tight text-ink">
              {headingFor(pane)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-hairline text-ink-soft transition-colors hover:border-ink hover:text-ink"
            aria-label="Close pane"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 px-6 py-8 md:px-8">
          {pane === "profile" && <ProfilePane {...props} />}
          {pane === "teams" && <TeamsPane {...props} />}
          {pane === "apikeys" && <ApiKeysPane {...props} />}
          {pane === "billing" && <BillingPane {...props} />}
        </div>

        <style>{`
          @keyframes slide-in {
            from { transform: translateX(24px); opacity: 0; }
            to   { transform: translateX(0); opacity: 1; }
          }
        `}</style>
      </aside>
    </div>
  );
}

function labelFor(p: PaneId) {
  return {
    profile: "Profile",
    teams: "Teams",
    apikeys: "API Keys",
    billing: "Billing",
  }[p];
}
function headingFor(p: PaneId) {
  return {
    profile: "Your identity",
    teams: "People you work with",
    apikeys: "Machine credentials",
    billing: "Plan & renewal",
  }[p];
}

// =================================================================
// PROFILE
// =================================================================

function ProfilePane({ state, setState, pushActivity, onAccountDeleted }: Props) {
  const [name, setName] = useState(state.profile.name);
  const [email, setEmail] = useState(state.profile.email);
  const [tz, setTz] = useState(state.profile.timezone);
  const [bio, setBio] = useState(state.profile.bio);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(state.profile.avatarUrl);
  const [dirty, setDirty] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setDirty(
      name !== state.profile.name ||
        email !== state.profile.email ||
        tz !== state.profile.timezone ||
        bio !== state.profile.bio ||
        avatarUrl !== state.profile.avatarUrl
    );
  }, [name, email, tz, bio, avatarUrl, state.profile]);

  const onPick = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Pick an image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setAvatarUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const save = () => {
    setState((s) => ({
      ...s,
      profile: { name, email, timezone: tz, bio, avatarUrl },
      session: s.session
        ? { ...s.session, name, email, avatarUrl }
        : null,
    }));
    pushActivity("profile", "Updated profile");
    toast.success("Profile saved.");
  };

  const initials = (name || "?")
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="space-y-10">
      <section>
        <SectionTitle number="01" title="Avatar" />
        <div className="mt-5 flex flex-wrap items-center gap-6">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-forest text-bone">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt=""
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <span className="font-display text-[22px] tracking-tight">
                {initials}
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-full border border-hairline bg-warm-white px-4 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-ink transition-colors hover:border-ink"
            >
              <Upload className="h-3 w-3" />
              <span>Upload image</span>
            </button>
            {avatarUrl && (
              <button
                type="button"
                onClick={() => setAvatarUrl(null)}
                className="font-mono text-[11px] uppercase tracking-[0.2em] text-stone underline underline-offset-2 hover:text-clay"
              >
                Remove
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onPick(f);
                e.target.value = "";
              }}
            />
          </div>
        </div>
      </section>

      <section>
        <SectionTitle number="02" title="Details" />
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <TextField label="Full name" value={name} onChange={setName} />
          <TextField label="Email" value={email} onChange={setEmail} type="email" />
          <SelectField
            label="Timezone"
            value={tz}
            onChange={setTz}
            options={[
              "America/New_York",
              "America/Los_Angeles",
              "America/Chicago",
              "America/Denver",
              "Europe/London",
              "Europe/Berlin",
              "Europe/Madrid",
              "Asia/Tokyo",
              "Asia/Singapore",
              "Australia/Sydney",
            ]}
          />
          <TextField label="Bio" value={bio} onChange={setBio} />
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-hairline pt-6">
          <button
            type="button"
            onClick={save}
            disabled={!dirty}
            className={cn(
              "rounded-full px-5 py-2 font-sans text-sm transition-colors",
              dirty
                ? "bg-ink text-bone hover:bg-forest"
                : "cursor-not-allowed bg-stone-light text-bone"
            )}
          >
            Save changes
          </button>
          {dirty && (
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-clay">
              Unsaved
            </span>
          )}
        </div>
      </section>

      <section>
        <SectionTitle number="03" title="Danger zone" accent="clay" />
        <p className="mt-3 max-w-lg font-sans text-sm leading-relaxed text-ink-soft">
          Delete this account and wipe all demo state from your device. This is
          a mock action — nothing leaves your browser.
        </p>
        {!confirmOpen ? (
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="mt-5 inline-flex items-center gap-2 rounded-full border border-clay px-5 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-clay transition-colors hover:bg-clay hover:text-bone"
          >
            <Trash2 className="h-3 w-3" />
            <span>Delete account</span>
          </button>
        ) : (
          <div className="mt-5 border border-clay bg-clay/5 p-5">
            <p className="font-sans text-sm text-ink">
              Type{" "}
              <span className="font-mono text-clay">DELETE</span> to confirm.
            </p>
            <input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="mt-3 w-full border-b border-hairline bg-transparent py-2 font-mono text-sm text-ink focus:border-clay focus:outline-none"
              placeholder="DELETE"
            />
            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                disabled={confirmText !== "DELETE"}
                onClick={onAccountDeleted}
                className={cn(
                  "rounded-full px-5 py-2 font-mono text-[11px] uppercase tracking-[0.2em] transition-colors",
                  confirmText === "DELETE"
                    ? "bg-clay text-bone hover:bg-clay-soft"
                    : "cursor-not-allowed bg-stone-light text-bone"
                )}
              >
                Delete permanently
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmOpen(false);
                  setConfirmText("");
                }}
                className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft underline underline-offset-2 hover:text-ink"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

// =================================================================
// TEAMS
// =================================================================

function TeamsPane({ state, setState, pushActivity }: Props) {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteTeamId, setInviteTeamId] = useState(state.teams[0]?.id ?? "");
  const [inviteRole, setInviteRole] = useState<"admin" | "member">("member");

  const invite = (e: React.FormEvent) => {
    e.preventDefault();
    const email = inviteEmail.trim().toLowerCase();
    if (!email || !email.includes("@")) {
      toast.error("Enter a valid email.");
      return;
    }
    setState((s) => ({
      ...s,
      teams: s.teams.map((t) =>
        t.id === inviteTeamId
          ? {
              ...t,
              members: [
                ...t.members,
                {
                  id: "m_" + Math.random().toString(36).slice(2, 8),
                  name: email.split("@")[0].replace(/[._]/g, " "),
                  email,
                  role: inviteRole,
                },
              ],
            }
          : t
      ),
    }));
    const teamName = state.teams.find((t) => t.id === inviteTeamId)?.name;
    pushActivity("team", `Invited ${email} to ${teamName}`);
    setInviteEmail("");
    toast.success(`Invite sent to ${email}`);
  };

  const leave = (teamId: string) => {
    const team = state.teams.find((t) => t.id === teamId);
    if (!team) return;
    if (!confirm(`Leave ${team.name}? You'll need a new invite to rejoin.`)) return;
    setState((s) => ({ ...s, teams: s.teams.filter((t) => t.id !== teamId) }));
    pushActivity("team", `Left ${team.name}`);
    toast.success(`Left ${team.name}.`);
  };

  const removeMember = (teamId: string, memberId: string) => {
    setState((s) => ({
      ...s,
      teams: s.teams.map((t) =>
        t.id === teamId
          ? { ...t, members: t.members.filter((m) => m.id !== memberId) }
          : t
      ),
    }));
    toast.success("Member removed.");
  };

  const updateRole = (teamId: string, memberId: string, role: TeamMember["role"]) => {
    setState((s) => ({
      ...s,
      teams: s.teams.map((t) =>
        t.id === teamId
          ? {
              ...t,
              members: t.members.map((m) =>
                m.id === memberId ? { ...m, role } : m
              ),
            }
          : t
      ),
    }));
  };

  return (
    <div className="space-y-10">
      <section>
        <SectionTitle number="01" title="Your teams" />
        <div className="mt-5 space-y-6">
          {state.teams.length === 0 ? (
            <p className="font-sans text-sm text-stone">
              You aren&apos;t in any teams yet. Create one or accept an invite.
            </p>
          ) : (
            state.teams.map((team) => (
              <div
                key={team.id}
                className="border border-hairline bg-warm-white"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-hairline-soft px-5 py-4">
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-2">
                      <h4 className="min-w-0 truncate font-display text-[20px] tracking-tight text-ink">
                        {team.name}
                      </h4>
                      <RolePill role={team.role} />
                    </div>
                    <p className="font-mono text-[11px] text-stone">
                      @{team.handle} · {team.members.length} of {team.seats} seats
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => leave(team.id)}
                    className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone underline underline-offset-2 hover:text-clay"
                  >
                    {team.role === "owner" ? "Disband" : "Leave"}
                  </button>
                </div>
                <ul className="divide-y divide-hairline-soft">
                  {team.members.map((m) => (
                    <li
                      key={m.id}
                      className="flex items-center justify-between gap-3 px-5 py-3"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-forest text-[10px] text-bone">
                          {initials(m.name)}
                        </span>
                        <div className="min-w-0">
                          <p className="min-w-0 truncate font-sans text-sm text-ink">
                            {m.name}
                          </p>
                          <p className="min-w-0 truncate font-mono text-[11px] text-stone">
                            {m.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        {team.role === "owner" && m.role !== "owner" ? (
                          <select
                            value={m.role}
                            onChange={(e) =>
                              updateRole(
                                team.id,
                                m.id,
                                e.target.value as TeamMember["role"]
                              )
                            }
                            className="border-b border-hairline bg-transparent pb-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink focus:border-ink focus:outline-none"
                          >
                            <option value="admin">Admin</option>
                            <option value="member">Member</option>
                          </select>
                        ) : (
                          <RolePill role={m.role} />
                        )}
                        {team.role === "owner" && m.role !== "owner" && (
                          <button
                            type="button"
                            onClick={() => removeMember(team.id, m.id)}
                            className="text-stone hover:text-clay"
                            aria-label="Remove member"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      </section>

      {state.teams.length > 0 && (
        <section>
          <SectionTitle number="02" title="Invite a member" />
          <form onSubmit={invite} className="mt-5 space-y-4">
            <div className="grid gap-4 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,0.7fr)]">
              <TextField
                label="Email"
                value={inviteEmail}
                onChange={setInviteEmail}
                type="email"
                placeholder="teammate@studio.com"
              />
              <SelectField
                label="Team"
                value={inviteTeamId}
                onChange={setInviteTeamId}
                options={state.teams.map((t) => ({ value: t.id, label: t.name }))}
              />
              <SelectField
                label="Role"
                value={inviteRole}
                onChange={(v) => setInviteRole(v as "admin" | "member")}
                options={[
                  { value: "admin", label: "Admin" },
                  { value: "member", label: "Member" },
                ]}
              />
            </div>
            <button
              type="submit"
              className="rounded-full bg-ink px-5 py-2 font-sans text-sm text-bone transition-colors hover:bg-forest"
            >
              Send invite
            </button>
          </form>
        </section>
      )}
    </div>
  );
}

function RolePill({ role }: { role: "owner" | "admin" | "member" }) {
  const cls =
    role === "owner"
      ? "border-forest text-forest bg-forest/5"
      : role === "admin"
        ? "border-clay text-clay bg-clay/5"
        : "border-hairline text-ink-soft";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em]",
        cls
      )}
    >
      {role}
    </span>
  );
}

function initials(s: string) {
  return s
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// =================================================================
// API KEYS
// =================================================================

function ApiKeysPane({ state, setState, pushActivity }: Props) {
  const [reveal, setReveal] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState<string | null>(null);
  const [newLabel, setNewLabel] = useState("");
  const [newScope, setNewScope] = useState<ApiKey["scope"]>("read");
  const [createdKey, setCreatedKey] = useState<ApiKey | null>(null);

  const copyKey = async (k: ApiKey) => {
    const full = k.prefix + k.secret;
    try {
      await navigator.clipboard.writeText(full);
      setCopied(k.id);
      toast.success("Copied to clipboard.");
      setTimeout(() => setCopied(null), 1400);
    } catch {
      toast.error("Clipboard unavailable.");
    }
  };

  const rotate = (id: string) => {
    const newSecret = Array.from({ length: 24 }, () =>
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".charAt(
        Math.floor(Math.random() * 62)
      )
    ).join("");
    setState((s) => ({
      ...s,
      apiKeys: s.apiKeys.map((k) =>
        k.id === id ? { ...k, secret: newSecret, createdAt: Date.now(), lastUsedAt: null } : k
      ),
    }));
    setReveal((r) => ({ ...r, [id]: true }));
    const label = state.apiKeys.find((k) => k.id === id)?.label;
    pushActivity("apikey", `Rotated key · ${label}`);
    toast.success("Key rotated. Reveal to copy the new secret.");
  };

  const remove = (id: string) => {
    const k = state.apiKeys.find((x) => x.id === id);
    if (!k) return;
    if (!confirm(`Delete key "${k.label}"? This can't be undone.`)) return;
    setState((s) => ({ ...s, apiKeys: s.apiKeys.filter((k) => k.id !== id) }));
    pushActivity("apikey", `Deleted key · ${k.label}`);
    toast.success("Key deleted.");
  };

  const create = (e: React.FormEvent) => {
    e.preventDefault();
    const label = newLabel.trim();
    if (!label) {
      toast.error("Give the key a label.");
      return;
    }
    const prefix = newScope === "admin" ? "sk_admin_" : newScope === "read-write" ? "sk_live_" : "sk_test_";
    const secret = Array.from({ length: 24 }, () =>
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".charAt(
        Math.floor(Math.random() * 62)
      )
    ).join("");
    const key: ApiKey = {
      id: "k_" + Math.random().toString(36).slice(2, 8),
      label,
      prefix,
      secret,
      scope: newScope,
      createdAt: Date.now(),
      lastUsedAt: null,
    };
    setState((s) => ({ ...s, apiKeys: [key, ...s.apiKeys] }));
    setReveal((r) => ({ ...r, [key.id]: true }));
    setCreatedKey(key);
    setNewLabel("");
    pushActivity("apikey", `Created key · ${label}`);
    toast.success("Key created. Copy it now — you won't see it again.");
  };

  return (
    <div className="space-y-10">
      {createdKey && (
        <div className="relative border-2 border-forest bg-forest/5 p-5">
          <button
            type="button"
            onClick={() => setCreatedKey(null)}
            className="absolute right-3 top-3 text-stone hover:text-ink"
            aria-label="Dismiss"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-forest">
            New key — copy it now
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <code className="min-w-0 flex-1 truncate border border-hairline bg-warm-white px-3 py-2 font-mono text-[12px] text-ink">
              {createdKey.prefix}
              {createdKey.secret}
            </code>
            <button
              type="button"
              onClick={() => copyKey(createdKey)}
              className="inline-flex items-center gap-2 rounded-full bg-forest px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-bone hover:bg-forest-soft"
            >
              <Copy className="h-3 w-3" />
              Copy
            </button>
          </div>
          <p className="mt-3 font-sans text-[13px] text-ink-soft">
            This secret won&apos;t be shown in full again after you dismiss it.
          </p>
        </div>
      )}

      <section>
        <SectionTitle number="01" title="Your keys" />
        <div className="mt-5 space-y-3">
          {state.apiKeys.length === 0 ? (
            <p className="font-sans text-sm text-stone">
              No keys yet. Create one below.
            </p>
          ) : (
            state.apiKeys.map((k) => {
              const revealed = !!reveal[k.id];
              return (
                <div
                  key={k.id}
                  className="border border-hairline bg-warm-white px-5 py-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="min-w-0 truncate font-display text-[18px] tracking-tight text-ink">
                          {k.label}
                        </h4>
                        <ScopePill scope={k.scope} />
                      </div>
                      <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
                        Created {relDateShort(k.createdAt)} · last used{" "}
                        {k.lastUsedAt ? relTime(k.lastUsedAt, Date.now()) : "never"}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        onClick={() => rotate(k.id)}
                        className="inline-flex items-center gap-1 rounded-full border border-hairline px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft transition-colors hover:border-ink hover:text-ink"
                      >
                        <RotateCw className="h-3 w-3" />
                        Rotate
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(k.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-full text-stone transition-colors hover:bg-clay/10 hover:text-clay"
                        aria-label="Delete key"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <code className="min-w-0 flex-1 truncate border border-hairline bg-bone px-3 py-2 font-mono text-[12px] tabular-nums text-ink">
                      {k.prefix}
                      {revealed ? k.secret : mask(k.secret)}
                    </code>
                    <button
                      type="button"
                      onClick={() => setReveal((r) => ({ ...r, [k.id]: !revealed }))}
                      className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft transition-colors hover:text-ink"
                    >
                      {revealed ? (
                        <>
                          <EyeOff className="h-3 w-3" />
                          Hide
                        </>
                      ) : (
                        <>
                          <Eye className="h-3 w-3" />
                          Reveal
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => copyKey(k)}
                      className="inline-flex items-center gap-1 rounded-full bg-ink px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-bone hover:bg-forest"
                    >
                      {copied === k.id ? (
                        <>
                          <Check className="h-3 w-3" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      <section>
        <SectionTitle number="02" title="Create a new key" />
        <form onSubmit={create} className="mt-5 grid gap-4 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_auto]">
          <TextField
            label="Label"
            value={newLabel}
            onChange={setNewLabel}
            placeholder="e.g. Staging server"
          />
          <SelectField
            label="Scope"
            value={newScope}
            onChange={(v) => setNewScope(v as ApiKey["scope"])}
            options={[
              { value: "read", label: "Read" },
              { value: "read-write", label: "Read + write" },
              { value: "admin", label: "Admin" },
            ]}
          />
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full rounded-full bg-ink px-5 py-2 font-sans text-sm text-bone transition-colors hover:bg-forest md:w-auto"
            >
              Create key
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function ScopePill({ scope }: { scope: ApiKey["scope"] }) {
  const cls =
    scope === "admin"
      ? "border-clay text-clay bg-clay/5"
      : scope === "read-write"
        ? "border-forest text-forest bg-forest/5"
        : "border-hairline text-ink-soft";
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em]",
        cls
      )}
    >
      {scope}
    </span>
  );
}

function mask(secret: string) {
  if (secret.length <= 8) return "•".repeat(secret.length);
  return "•".repeat(secret.length - 4) + secret.slice(-4);
}

// =================================================================
// BILLING
// =================================================================

type PlanDef = {
  id: Plan;
  name: string;
  price: string;
  cadence: string;
  blurb: string;
  features: string[];
};

const PLANS: PlanDef[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    cadence: "forever",
    blurb: "For kicking the tires.",
    features: ["1 project", "1 seat", "Community support", "7-day logs"],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$19",
    cadence: "per month",
    blurb: "For the builder working alone or in pairs.",
    features: ["Unlimited projects", "3 seats", "Priority email", "90-day logs"],
  },
  {
    id: "team",
    name: "Team",
    price: "$49",
    cadence: "per month",
    blurb: "For small studios running real work.",
    features: ["Unlimited projects", "10 seats", "Slack support", "Audit log export"],
  },
];

function BillingPane({ state, setState, pushActivity }: Props) {
  const [selected, setSelected] = useState<Plan>(state.billing.plan);

  const upgrade = () => {
    if (selected === state.billing.plan) {
      toast.message("No change — you're already on this plan.");
      return;
    }
    setState((s) => ({
      ...s,
      billing: {
        ...s.billing,
        plan: selected,
        renewsAt:
          selected === "free"
            ? null
            : Date.now() + 30 * 24 * 60 * 60 * 1000,
        paymentMethod:
          selected === "free" ? null : s.billing.paymentMethod ?? "Visa · 4242",
        seats: selected === "team" ? 10 : selected === "pro" ? 3 : 1,
      },
    }));
    const verb =
      planWeight(selected) > planWeight(state.billing.plan)
        ? "Upgraded"
        : planWeight(selected) < planWeight(state.billing.plan)
          ? "Downgraded"
          : "Switched";
    pushActivity("billing", `${verb} to ${capitalize(selected)}`);
    toast.success(`${verb} to ${capitalize(selected)}.`);
  };

  const current = PLANS.find((p) => p.id === state.billing.plan)!;

  return (
    <div className="space-y-10">
      <section className="border border-hairline bg-warm-white px-6 py-7">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-forest">
              Current plan
            </p>
            <p className="mt-2 font-display text-[28px] leading-tight tracking-tight text-ink">
              {current.name}
              <span className="ml-2 font-mono text-[12px] uppercase tracking-[0.2em] text-stone">
                · {current.cadence}
              </span>
            </p>
          </div>
          <div className="text-right">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone">
              {state.billing.renewsAt ? "Renews" : "No renewal"}
            </p>
            <p className="mt-1 font-display text-[18px] tracking-tight text-ink">
              {state.billing.renewsAt
                ? new Date(state.billing.renewsAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })
                : "—"}
            </p>
          </div>
        </div>
        <dl className="mt-6 grid grid-cols-2 gap-x-8 gap-y-4 border-t border-hairline pt-5 sm:grid-cols-4">
          <Meta k="Seats" v={`${state.billing.seats}`} />
          <Meta k="Payment" v={state.billing.paymentMethod ?? "—"} />
          <Meta k="Usage" v="82%" />
          <Meta k="Invoices" v="4" />
        </dl>
      </section>

      <section>
        <SectionTitle number="01" title="Change plan" />
        <div className="mt-5 grid gap-px bg-hairline sm:grid-cols-3">
          {PLANS.map((p) => {
            const active = selected === p.id;
            const current = state.billing.plan === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelected(p.id)}
                className={cn(
                  "group relative bg-warm-white p-6 text-left transition-colors",
                  active && "bg-bone ring-2 ring-ink"
                )}
              >
                <div className="flex items-baseline justify-between">
                  <span className="font-display text-[20px] tracking-tight text-ink">
                    {p.name}
                  </span>
                  {current && (
                    <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-forest">
                      current
                    </span>
                  )}
                </div>
                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="font-display text-[28px] leading-none tabular-nums tracking-tight text-ink">
                    {p.price}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
                    {p.cadence}
                  </span>
                </div>
                <p className="mt-3 font-sans text-[13px] text-ink-soft">
                  {p.blurb}
                </p>
                <ul className="mt-5 space-y-1.5 border-t border-hairline-soft pt-4 font-sans text-[13px] text-ink-soft">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-baseline gap-2">
                      <Check className="mt-0.5 h-3 w-3 shrink-0 text-forest" />
                      <span className="min-w-0">{f}</span>
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={upgrade}
            disabled={selected === state.billing.plan}
            className={cn(
              "rounded-full px-5 py-2 font-sans text-sm transition-colors",
              selected === state.billing.plan
                ? "cursor-not-allowed bg-stone-light text-bone"
                : "bg-ink text-bone hover:bg-forest"
            )}
          >
            {planWeight(selected) > planWeight(state.billing.plan)
              ? `Upgrade to ${capitalize(selected)}`
              : planWeight(selected) < planWeight(state.billing.plan)
                ? `Downgrade to ${capitalize(selected)}`
                : "No change"}
          </button>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
            Demo · no card charged
          </span>
        </div>
      </section>

      <section>
        <SectionTitle number="02" title="Recent invoices" />
        <ul className="mt-5 divide-y divide-hairline-soft border-t border-hairline">
          {[
            { id: "inv_2026_04", amt: "$19.00", date: "Apr 1, 2026", status: "paid" },
            { id: "inv_2026_03", amt: "$19.00", date: "Mar 1, 2026", status: "paid" },
            { id: "inv_2026_02", amt: "$19.00", date: "Feb 1, 2026", status: "paid" },
            { id: "inv_2026_01", amt: "$0.00", date: "Jan 1, 2026", status: "free" },
          ].map((inv) => (
            <li
              key={inv.id}
              className="flex items-baseline justify-between gap-3 py-3"
            >
              <div className="flex min-w-0 items-baseline gap-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
                  {inv.id}
                </span>
                <span className="min-w-0 truncate font-sans text-sm text-ink">
                  {inv.date}
                </span>
              </div>
              <div className="flex shrink-0 items-baseline gap-3">
                <span className="font-mono text-[11px] tabular-nums text-ink">
                  {inv.amt}
                </span>
                <span
                  className={cn(
                    "font-mono text-[9px] uppercase tracking-[0.2em]",
                    inv.status === "paid" ? "text-forest" : "text-stone"
                  )}
                >
                  {inv.status}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Meta({ k, v }: { k: string; v: string }) {
  return (
    <div className="min-w-0">
      <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
        {k}
      </dt>
      <dd className="mt-1 truncate font-display text-[18px] tracking-tight text-ink">
        {v}
      </dd>
    </div>
  );
}

function planWeight(p: Plan) {
  return p === "free" ? 0 : p === "pro" ? 1 : 2;
}

// =================================================================
// Shared pieces
// =================================================================

function SectionTitle({
  number,
  title,
  accent = "clay",
}: {
  number: string;
  title: string;
  accent?: "clay" | "forest";
}) {
  return (
    <h3 className="flex items-baseline gap-4">
      <span
        className={cn(
          "font-display text-[28px] leading-none tracking-tight",
          accent === "clay" ? "text-clay" : "text-forest"
        )}
      >
        {number}
      </span>
      <span className="font-display text-[18px] leading-none tracking-tight text-ink">
        {title}
      </span>
    </h3>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block min-w-0">
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full border-b border-hairline bg-transparent py-2 font-sans text-sm text-ink placeholder:text-stone-light focus:border-ink focus:outline-none"
      />
    </label>
  );
}

type SelectOption = string | { value: string; label: string };

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: SelectOption[];
}) {
  const normalized = options.map((o) =>
    typeof o === "string" ? { value: o, label: o } : o
  );
  return (
    <label className="block min-w-0">
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full border-b border-hairline bg-transparent py-2 font-sans text-sm text-ink focus:border-ink focus:outline-none"
      >
        {normalized.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
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

function relDateShort(ts: number) {
  const days = Math.floor((Date.now() - ts) / (24 * 60 * 60 * 1000));
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
