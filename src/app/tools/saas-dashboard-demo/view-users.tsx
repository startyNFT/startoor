"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Check,
  Download,
  Mail,
  Search,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";
import { cn } from "@/lib/cn";
import {
  USERS,
  daysAgo,
  formatDate,
  formatMoney,
  type Plan,
  type User,
  type UserStatus,
} from "@/lib/data/saas-dashboard-mock";

type SortKey = "name" | "plan" | "lastActive" | "status" | "mrr" | "joinedAt";
type SortDir = "asc" | "desc";

const STATUS_META: Record<UserStatus, { label: string; dot: string; pill: string }> = {
  active: { label: "Active", dot: "#1F3A2F", pill: "bg-forest/10 text-forest" },
  invited: { label: "Invited", dot: "#8F8B80", pill: "bg-stone/15 text-ink-soft" },
  dormant: { label: "Dormant", dot: "#E8C77F", pill: "bg-butter/40 text-ink" },
  suspended: { label: "Suspended", dot: "#C85A3F", pill: "bg-clay/15 text-clay" },
};

const PLAN_LABEL: Record<Plan, string> = {
  free: "Free",
  starter: "Starter",
  growth: "Growth",
  scale: "Scale",
};

export function UsersView() {
  const [query, setQuery] = useState("");
  const [planFilter, setPlanFilter] = useState<Plan | "all">("all");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("lastActive");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [drawerUserId, setDrawerUserId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return USERS.filter((u) => {
      if (planFilter !== "all" && u.plan !== planFilter) return false;
      if (statusFilter !== "all" && u.status !== statusFilter) return false;
      if (!q) return true;
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.country.toLowerCase().includes(q)
      );
    });
  }, [query, planFilter, statusFilter]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "name":
          cmp = a.name.localeCompare(b.name);
          break;
        case "plan": {
          const order: Plan[] = ["free", "starter", "growth", "scale"];
          cmp = order.indexOf(a.plan) - order.indexOf(b.plan);
          break;
        }
        case "lastActive":
          cmp = a.lastActive.localeCompare(b.lastActive);
          break;
        case "joinedAt":
          cmp = a.joinedAt.localeCompare(b.joinedAt);
          break;
        case "status":
          cmp = a.status.localeCompare(b.status);
          break;
        case "mrr":
          cmp = a.mrrCents - b.mrrCents;
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  const toggleSort = (k: SortKey) => {
    if (sortKey === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(k);
      setSortDir(k === "name" ? "asc" : "desc");
    }
  };

  const toggleSelect = (id: string) => {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearSelection = () => setSelected(new Set());

  const selectAllVisible = () => {
    if (sorted.every((u) => selected.has(u.id))) {
      // deselect all visible
      const next = new Set(selected);
      for (const u of sorted) next.delete(u.id);
      setSelected(next);
    } else {
      const next = new Set(selected);
      for (const u of sorted) next.add(u.id);
      setSelected(next);
    }
  };

  const drawerUser = drawerUserId ? USERS.find((u) => u.id === drawerUserId) ?? null : null;

  const exportCsv = () => {
    const header = ["id", "name", "email", "plan", "status", "last_active", "mrr_usd", "joined_at", "country"];
    const lines = [header.join(",")];
    for (const u of sorted) {
      lines.push(
        [
          u.id,
          `"${u.name}"`,
          u.email,
          u.plan,
          u.status,
          u.lastActive,
          (u.mrrCents / 100).toFixed(2),
          u.joinedAt,
          u.country,
        ].join(","),
      );
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users-export-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Exported ${sorted.length} users.`);
  };

  const allVisibleSelected =
    sorted.length > 0 && sorted.every((u) => selected.has(u.id));
  const someVisibleSelected = sorted.some((u) => selected.has(u.id)) && !allVisibleSelected;

  return (
    <div className="px-5 py-6 md:px-8 md:py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-clay">
            Users · {USERS.length} total
          </p>
          <h2 className="mt-2 font-display text-[30px] leading-[1.05] tracking-tight text-ink md:text-[36px]">
            Who&apos;s paying, who&apos;s ghosting.
          </h2>
        </div>
        <button
          type="button"
          onClick={() => toast.info("Demo — invite flow disabled.")}
          className="inline-flex items-center gap-2 rounded-full bg-ink px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-bone hover:bg-forest"
        >
          <UserPlus className="h-3 w-3" /> Invite user
        </button>
      </div>

      {/* Filter bar */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <div className="flex min-w-[240px] max-w-md flex-1 items-center gap-2 rounded-sm border border-hairline bg-warm-white px-3 py-1.5">
          <Search className="h-3.5 w-3.5 text-stone" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email, country…"
            className="min-w-0 flex-1 bg-transparent font-sans text-sm text-ink placeholder:text-stone-light focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-stone hover:text-ink"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        <select
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value as Plan | "all")}
          className="rounded-sm border border-hairline bg-warm-white px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink focus:border-ink focus:outline-none"
        >
          <option value="all">All plans</option>
          <option value="free">Free</option>
          <option value="starter">Starter</option>
          <option value="growth">Growth</option>
          <option value="scale">Scale</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as UserStatus | "all")}
          className="rounded-sm border border-hairline bg-warm-white px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink focus:border-ink focus:outline-none"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="invited">Invited</option>
          <option value="dormant">Dormant</option>
          <option value="suspended">Suspended</option>
        </select>

        <div className="ml-auto flex items-center gap-2">
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.22em] text-stone md:inline">
            {sorted.length} of {USERS.length} users
          </span>
          <button
            type="button"
            onClick={exportCsv}
            className="inline-flex items-center gap-1.5 rounded-sm border border-hairline bg-warm-white px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft hover:border-ink hover:text-ink"
          >
            <Download className="h-3 w-3" /> Export
          </button>
        </div>
      </div>

      {/* Bulk actions toolbar */}
      {selected.size > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-3 rounded-sm border border-ink bg-ink px-4 py-2 text-bone animate-fade-in">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em]">
            {selected.size} selected
          </p>
          <span className="h-3 w-px bg-bone/30" />
          <button
            type="button"
            onClick={() => {
              toast.success(`Sent message to ${selected.size} users.`);
              clearSelection();
            }}
            className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] hover:text-butter"
          >
            <Mail className="h-3 w-3" /> Message
          </button>
          <button
            type="button"
            onClick={() => {
              toast.success(`Changed plan for ${selected.size} users.`);
              clearSelection();
            }}
            className="font-mono text-[10px] uppercase tracking-[0.2em] hover:text-butter"
          >
            Change plan
          </button>
          <button
            type="button"
            onClick={() => {
              toast.success(`Suspended ${selected.size} users.`);
              clearSelection();
            }}
            className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] hover:text-clay"
          >
            <Trash2 className="h-3 w-3" /> Suspend
          </button>
          <button
            type="button"
            onClick={clearSelection}
            className="ml-auto font-mono text-[10px] uppercase tracking-[0.2em] text-bone/70 hover:text-bone"
          >
            Clear
          </button>
        </div>
      )}

      {/* Table */}
      <div className="mt-4 overflow-hidden rounded-sm border border-hairline bg-warm-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left">
            <thead className="border-b border-hairline-soft bg-bone/40">
              <tr>
                <th className="w-10 px-3 py-2.5">
                  <CheckboxControl
                    checked={allVisibleSelected}
                    indeterminate={someVisibleSelected}
                    onChange={selectAllVisible}
                  />
                </th>
                <SortTh label="Name" k="name" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                <SortTh label="Plan" k="plan" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                <SortTh label="Status" k="status" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                <SortTh label="Last active" k="lastActive" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} align="right" />
                <SortTh label="MRR" k="mrr" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} align="right" />
                <SortTh label="Joined" k="joinedAt" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} align="right" />
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center font-sans text-sm italic text-stone">
                    No users match these filters.
                  </td>
                </tr>
              )}
              {sorted.map((u) => {
                const isSelected = selected.has(u.id);
                return (
                  <tr
                    key={u.id}
                    className={cn(
                      "group cursor-pointer border-b border-hairline-soft transition-colors last:border-0 hover:bg-bone/40",
                      isSelected && "bg-butter/20",
                    )}
                    onClick={() => setDrawerUserId(u.id)}
                  >
                    <td
                      className="w-10 px-3 py-2.5"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelect(u.id);
                      }}
                    >
                      <CheckboxControl checked={isSelected} onChange={() => toggleSelect(u.id)} />
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-[3px] bg-forest text-[10px] font-semibold text-bone">
                          {u.name
                            .split(" ")
                            .map((s) => s[0])
                            .join("")
                            .slice(0, 2)}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-sans text-sm text-ink">{u.name}</p>
                          <p className="truncate font-mono text-[10px] text-stone">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <PlanPill plan={u.plan} />
                    </td>
                    <td className="px-3 py-2.5">
                      <StatusPill status={u.status} />
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-xs tabular-nums text-ink-soft">
                      {daysAgo(u.lastActive)}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-xs tabular-nums text-ink">
                      {u.mrrCents === 0 ? (
                        <span className="text-stone">—</span>
                      ) : (
                        formatMoney(u.mrrCents)
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-xs tabular-nums text-stone whitespace-nowrap">
                      {formatDate(u.joinedAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer */}
      {drawerUser && (
        <UserDrawer user={drawerUser} onClose={() => setDrawerUserId(null)} />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Table helpers
// ---------------------------------------------------------------------------

function SortTh({
  label,
  k,
  sortKey,
  sortDir,
  onSort,
  align = "left",
}: {
  label: string;
  k: SortKey;
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (k: SortKey) => void;
  align?: "left" | "right";
}) {
  const active = sortKey === k;
  const Icon = active ? (sortDir === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;
  return (
    <th className={cn("px-3 py-2.5", align === "right" && "text-right")}>
      <button
        type="button"
        onClick={() => onSort(k)}
        className={cn(
          "inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors",
          active ? "text-ink" : "text-stone hover:text-ink",
        )}
      >
        {align === "right" && <Icon className={cn("h-3 w-3", !active && "opacity-50")} />}
        <span>{label}</span>
        {align === "left" && <Icon className={cn("h-3 w-3", !active && "opacity-50")} />}
      </button>
    </th>
  );
}

function CheckboxControl({
  checked,
  indeterminate,
  onChange,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
      className={cn(
        "flex h-4 w-4 items-center justify-center rounded-[3px] border transition-colors",
        checked
          ? "border-ink bg-ink text-bone"
          : indeterminate
            ? "border-ink bg-bone"
            : "border-hairline bg-warm-white hover:border-ink/60",
      )}
      aria-checked={checked}
      role="checkbox"
    >
      {checked && <Check className="h-3 w-3" strokeWidth={3} />}
      {!checked && indeterminate && <span className="block h-0.5 w-2 bg-ink" />}
    </button>
  );
}

function PlanPill({ plan }: { plan: Plan }) {
  const styles =
    plan === "scale"
      ? "bg-forest text-bone"
      : plan === "growth"
        ? "bg-ink text-bone"
        : plan === "starter"
          ? "bg-butter/50 text-ink"
          : "bg-stone/15 text-ink-soft";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em]",
        styles,
      )}
    >
      {PLAN_LABEL[plan]}
    </span>
  );
}

function StatusPill({ status }: { status: UserStatus }) {
  const meta = STATUS_META[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em]",
        meta.pill,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.dot }} />
      {meta.label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// User drawer — right side overlay
// ---------------------------------------------------------------------------

function UserDrawer({ user, onClose }: { user: User; onClose: () => void }) {
  // Fake activity timeline synthesized from user's attributes.
  const activity = useMemo(() => buildUserTimeline(user), [user]);

  return (
    <div className="fixed inset-0 z-50 flex animate-fade-in">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="flex-1 bg-ink/40 backdrop-blur-sm"
      />
      <aside className="flex w-full max-w-[460px] flex-col overflow-hidden border-l border-hairline bg-paper shadow-warm-lg">
        <div className="flex items-start justify-between gap-3 border-b border-hairline px-5 py-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[3px] bg-forest text-[12px] font-semibold text-bone">
              {user.name
                .split(" ")
                .map((s) => s[0])
                .join("")
                .slice(0, 2)}
            </span>
            <div className="min-w-0">
              <p className="font-display text-xl leading-tight tracking-tight text-ink">
                {user.name}
              </p>
              <p className="font-mono text-[11px] text-stone">{user.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-sm border border-hairline bg-warm-white text-ink-soft transition-colors hover:border-ink hover:text-ink"
            aria-label="Close drawer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Profile stats */}
          <div className="grid grid-cols-2 gap-px bg-hairline-soft">
            <DrawerStat label="Plan" value={PLAN_LABEL[user.plan]} />
            <DrawerStat
              label="Status"
              value={
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: STATUS_META[user.status].dot }}
                  />
                  {STATUS_META[user.status].label}
                </span>
              }
            />
            <DrawerStat
              label="MRR"
              value={user.mrrCents === 0 ? "—" : formatMoney(user.mrrCents)}
            />
            <DrawerStat label="Seats" value={String(user.seats)} />
            <DrawerStat label="Role" value={user.role} />
            <DrawerStat label="Country" value={user.country} />
            <DrawerStat label="Last active" value={daysAgo(user.lastActive)} />
            <DrawerStat label="Joined" value={formatDate(user.joinedAt)} />
          </div>

          {/* Activity timeline */}
          <div className="px-5 py-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-clay">
              Activity timeline
            </p>
            <ul className="mt-4 space-y-4">
              {activity.map((a, i) => (
                <li key={i} className="relative pl-6">
                  <span
                    className="absolute left-0 top-1.5 h-2 w-2 rounded-full"
                    style={{ background: a.color }}
                  />
                  {i < activity.length - 1 && (
                    <span className="absolute left-[3px] top-4 h-[calc(100%+8px)] w-px bg-hairline" />
                  )}
                  <p className="font-sans text-sm text-ink">{a.label}</p>
                  <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-stone">
                    {a.when}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-hairline bg-bone/60 px-5 py-3">
          <button
            type="button"
            onClick={() => {
              toast.success(`Impersonate: ${user.name} (demo)`);
            }}
            className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft hover:text-ink"
          >
            Impersonate
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                toast.success(`Sent reset email to ${user.email}.`);
              }}
              className="rounded-sm border border-hairline bg-warm-white px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-ink hover:border-ink"
            >
              Send reset
            </button>
            <button
              type="button"
              onClick={() => {
                toast.success(`Suspended ${user.name} (demo).`);
                onClose();
              }}
              className="rounded-sm bg-clay px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-bone hover:opacity-90"
            >
              Suspend
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}

function DrawerStat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="bg-paper px-5 py-3">
      <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-stone">{label}</p>
      <p className="mt-1 font-sans text-sm text-ink capitalize">{value}</p>
    </div>
  );
}

// Given a user, build a plausible timeline off their attributes.
function buildUserTimeline(user: User) {
  const events: { label: string; when: string; color: string }[] = [];
  events.push({
    label: `Last active · ${user.country}`,
    when: daysAgo(user.lastActive),
    color: "#1F3A2F",
  });
  if (user.status === "active") {
    events.push({
      label: "Opened Settings → API keys",
      when: daysAgo(user.lastActive),
      color: "#9DB89F",
    });
  }
  if (user.plan !== "free" && user.status !== "suspended") {
    events.push({
      label: `Invoice paid · ${formatMoney(user.mrrCents)}`,
      when: "3 days ago",
      color: "#E8C77F",
    });
  }
  if (user.role === "admin" || user.role === "owner") {
    events.push({
      label: "Invited a teammate",
      when: "2 weeks ago",
      color: "#8F8B80",
    });
  }
  if (user.plan === "scale" || user.plan === "growth") {
    events.push({
      label: `Upgraded to ${PLAN_LABEL[user.plan]}`,
      when: "1 month ago",
      color: "#1F3A2F",
    });
  }
  events.push({
    label: "Account created",
    when: formatDate(user.joinedAt),
    color: "#C5BFAF",
  });
  return events;
}
