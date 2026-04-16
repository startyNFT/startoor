"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/cn";
import {
  addTouchpoint,
  createClient,
  deleteClient,
  deleteTouchpoint,
  updateClientField,
} from "./actions";

type Client = {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  nextAction: string | null;
  dueDate: string | null;
  status: string;
  notes: string | null;
  valueCents: number | null;
  lastTouchedAt: Date | string | null;
  updatedAt: Date | string;
};

type Touchpoint = {
  id: string;
  clientId: string;
  note: string;
  kind: string;
  occurredAt: Date | string;
};

const STATUSES = [
  { value: "active", label: "Active", color: "#1F3A2F" },
  { value: "not-yet", label: "Not yet", color: "#E8C77F" },
  { value: "dormant", label: "Dormant", color: "#8F8B80" },
  { value: "closed", label: "Closed", color: "#C85A3F" },
];

const AT_RISK_DAYS = 14;
const DUE_WINDOW_DAYS = 7;

const KIND_STYLES: Record<string, { label: string; dot: string }> = {
  note: { label: "Note", dot: "#8F8B80" },
  email: { label: "Email", dot: "#3B5D7E" },
  call: { label: "Call", dot: "#1F3A2F" },
  meeting: { label: "Meeting", dot: "#C85A3F" },
  shipped: { label: "Shipped", dot: "#E8C77F" },
};

function daysBetween(a: Date | string | null, b: Date) {
  if (!a) return Infinity;
  const t = typeof a === "string" ? new Date(a).getTime() : a.getTime();
  return Math.floor((b.getTime() - t) / (24 * 60 * 60 * 1000));
}

function parseDueDate(s: string | null): number | null {
  if (!s) return null;
  const parsed = Date.parse(`${s}, ${new Date().getFullYear()}`);
  if (!Number.isNaN(parsed)) return parsed;
  const fallback = Date.parse(s);
  return Number.isNaN(fallback) ? null : fallback;
}

function formatCurrency(cents: number | null | undefined): string {
  if (!cents) return "—";
  if (cents % 100 === 0) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(cents / 100);
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function ClientTrackerApp({
  initialClients,
  initialTouchpoints,
  email,
}: {
  initialClients: Client[];
  initialTouchpoints: Touchpoint[];
  email: string;
}) {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [touchpoints, setTouchpoints] = useState<Touchpoint[]>(initialTouchpoints);
  const [filter, setFilter] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [addingOpen, setAddingOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const addInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => setClients(initialClients), [initialClients]);
  useEffect(() => setTouchpoints(initialTouchpoints), [initialTouchpoints]);

  useEffect(() => {
    if (addingOpen) setTimeout(() => addInputRef.current?.focus(), 50);
  }, [addingOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "n" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setAddingOpen(true);
      }
      if (e.key === "Escape") {
        setAddingOpen(false);
        setExpandedId(null);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const now = new Date();

  const withDerived = useMemo(
    () =>
      clients.map((c) => {
        const lastDays = daysBetween(c.lastTouchedAt, now);
        const dueMs = parseDueDate(c.dueDate);
        const dueDays =
          dueMs !== null ? Math.ceil((dueMs - now.getTime()) / (24 * 60 * 60 * 1000)) : null;
        const isAtRisk = c.status === "active" && lastDays >= AT_RISK_DAYS;
        const isDueSoon =
          dueDays !== null &&
          dueDays >= 0 &&
          dueDays <= DUE_WINDOW_DAYS &&
          (c.status === "active" || c.status === "not-yet");
        const isOverdue =
          dueDays !== null &&
          dueDays < 0 &&
          (c.status === "active" || c.status === "not-yet");
        return {
          ...c,
          _lastDays: lastDays,
          _dueDays: dueDays,
          _atRisk: isAtRisk,
          _dueSoon: isDueSoon,
          _overdue: isOverdue,
        };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [clients],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return withDerived.filter((c) => {
      if (filter === "at-risk" && !c._atRisk) return false;
      if (filter === "due" && !(c._dueSoon || c._overdue)) return false;
      if (STATUSES.some((s) => s.value === filter) && c.status !== filter) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        (c.company?.toLowerCase().includes(q) ?? false) ||
        (c.nextAction?.toLowerCase().includes(q) ?? false) ||
        (c.email?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [withDerived, filter, query]);

  const stats = useMemo(() => {
    const active = withDerived.filter((c) => c.status === "active").length;
    const atRisk = withDerived.filter((c) => c._atRisk).length;
    const dueSoon = withDerived.filter((c) => c._dueSoon || c._overdue).length;
    const pipelineCents = withDerived
      .filter((c) => c.status === "active" || c.status === "not-yet")
      .reduce((sum, c) => sum + (c.valueCents ?? 0), 0);
    return { active, atRisk, dueSoon, pipelineCents };
  }, [withDerived]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {
      all: withDerived.length,
      "at-risk": stats.atRisk,
      due: stats.dueSoon,
    };
    for (const st of STATUSES) c[st.value] = 0;
    for (const client of withDerived) {
      c[client.status] = (c[client.status] ?? 0) + 1;
    }
    return c;
  }, [withDerived, stats]);

  const handleOptimisticUpdate = (
    id: string,
    field: keyof Client,
    value: string | number | null,
  ) => {
    setClients((prev) =>
      prev.map((c) => (c.id === id ? ({ ...c, [field]: value } as Client) : c)),
    );
  };

  const handleOptimisticDelete = (id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
    setTouchpoints((prev) => prev.filter((t) => t.clientId !== id));
  };

  const handleAddTouchpoint = (clientId: string, tp: Touchpoint) => {
    setTouchpoints((prev) => [tp, ...prev]);
    setClients((prev) =>
      prev.map((c) => (c.id === clientId ? { ...c, lastTouchedAt: tp.occurredAt } : c)),
    );
  };

  const handleRemoveTouchpoint = (id: string) => {
    setTouchpoints((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="border-t border-hairline bg-paper">
      <div className="mx-auto max-w-7xl px-6 pt-10 pb-16 md:px-10">
        <header className="flex flex-wrap items-end justify-between gap-5 border-b border-hairline pb-8">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-clay">
              Try it · Client Tracker
            </span>
            <h1 className="mt-3 font-display text-4xl leading-[0.95] tracking-tight text-ink md:text-5xl">
              What&apos;s stuck.
              <br />
              <span className="italic text-forest">What&apos;s due.</span>{" "}
              What you&apos;ve done.
            </h1>
            <p className="mt-4 font-sans text-sm text-ink-soft">
              Signed in as{" "}
              <span className="font-mono text-[13px] text-ink">{email}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.3-4.3" strokeLinecap="round" />
              </svg>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search clients..."
                className="w-64 border border-hairline bg-bone py-2 pl-9 pr-3 font-sans text-sm placeholder:text-stone focus:border-ink focus:outline-none"
              />
            </div>
            <button
              onClick={() => setAddingOpen(true)}
              className="group inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2 font-sans text-sm text-bone transition-colors hover:bg-forest"
            >
              <span className="text-base">+</span>
              <span>New client</span>
              <span className="font-mono text-[10px] text-bone/60">⌘N</span>
            </button>
          </div>
        </header>

        {/* Dashboard */}
        <section className="mt-8 grid gap-4 md:grid-cols-4">
          <StatTile
            label="Active clients"
            value={stats.active.toString()}
            hint={stats.active === 0 ? "Nothing active" : "In progress"}
            tint="#1F3A2F"
          />
          <StatTile
            label="At risk"
            value={stats.atRisk.toString()}
            hint={`Active · dormant ${AT_RISK_DAYS}+ days`}
            tint="#C85A3F"
            danger={stats.atRisk > 0}
            onClick={() => setFilter("at-risk")}
          />
          <StatTile
            label="Due this week"
            value={stats.dueSoon.toString()}
            hint={`Next action within ${DUE_WINDOW_DAYS} days`}
            tint="#E8C77F"
            onClick={() => setFilter("due")}
          />
          <StatTile
            label="Pipeline"
            value={formatCurrency(stats.pipelineCents)}
            hint="Active + not yet started"
            tint="#3B5D7E"
            wideValue
          />
        </section>

        {/* Filter pills */}
        <div className="mt-7 flex flex-wrap items-center gap-2">
          <FilterPill
            label="All"
            active={filter === "all"}
            count={counts.all}
            onClick={() => setFilter("all")}
          />
          {stats.atRisk > 0 && (
            <FilterPill
              label="At risk"
              color="#C85A3F"
              active={filter === "at-risk"}
              count={counts["at-risk"] ?? 0}
              accentBorder
              onClick={() => setFilter("at-risk")}
            />
          )}
          {stats.dueSoon > 0 && (
            <FilterPill
              label="Due this week"
              color="#E8C77F"
              active={filter === "due"}
              count={counts.due ?? 0}
              onClick={() => setFilter("due")}
            />
          )}
          <span className="mx-1 hidden h-5 w-px bg-hairline md:inline-block" />
          {STATUSES.map((st) => (
            <FilterPill
              key={st.value}
              label={st.label}
              color={st.color}
              active={filter === st.value}
              count={counts[st.value] ?? 0}
              onClick={() => setFilter(st.value)}
            />
          ))}
        </div>

        {/* Table */}
        <div className="mt-8 overflow-x-auto border border-hairline bg-warm-white">
          <table className="w-full min-w-[1060px]">
            <thead>
              <tr className="border-b border-hairline bg-bone">
                <Th>Client</Th>
                <Th>Company</Th>
                <Th>Next action</Th>
                <Th className="w-28">Due</Th>
                <Th className="w-28">Value</Th>
                <Th className="w-36">Last touch</Th>
                <Th className="w-28">Status</Th>
                <Th className="w-10"></Th>
              </tr>
            </thead>
            <tbody>
              {addingOpen && (
                <NewClientRow
                  onDone={() => setAddingOpen(false)}
                  onAdd={(newClient) => {
                    setClients((prev) => [newClient, ...prev]);
                    setAddingOpen(false);
                  }}
                  inputRef={addInputRef}
                />
              )}
              {filtered.map((client) => (
                <ClientRow
                  key={client.id}
                  client={client}
                  expanded={expandedId === client.id}
                  onToggleExpand={() =>
                    setExpandedId((cur) => (cur === client.id ? null : client.id))
                  }
                  touchpoints={touchpoints.filter((t) => t.clientId === client.id)}
                  onUpdate={handleOptimisticUpdate}
                  onDelete={handleOptimisticDelete}
                  onAddTouchpoint={handleAddTouchpoint}
                  onRemoveTouchpoint={handleRemoveTouchpoint}
                />
              ))}
              {filtered.length === 0 && !addingOpen && (
                <tr>
                  <td colSpan={8} className="py-20 text-center">
                    {clients.length === 0 ? (
                      <div>
                        <p className="font-display text-2xl tracking-tight text-ink">
                          Nothing on your plate yet.
                        </p>
                        <p className="mt-2 font-sans text-sm text-ink-soft">
                          Hit <span className="font-mono text-ink">⌘N</span> or the
                          New client button to add your first.
                        </p>
                      </div>
                    ) : (
                      <p className="font-sans text-sm text-ink-soft">
                        No clients match that filter.
                      </p>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-8 flex flex-col gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-stone md:flex-row md:items-center md:justify-between">
          <p>
            {filtered.length} of {clients.length} · {stats.active} active ·{" "}
            {stats.atRisk} at risk
          </p>
          <p>
            Click any cell to edit · Click the row to see activity · ⌘N adds a client
          </p>
        </div>
      </div>
    </div>
  );
}

// ---------- Stats & filters ----------

function StatTile({
  label,
  value,
  hint,
  tint,
  danger,
  onClick,
  wideValue,
}: {
  label: string;
  value: string;
  hint: string;
  tint: string;
  danger?: boolean;
  onClick?: () => void;
  wideValue?: boolean;
}) {
  const Component = onClick ? "button" : "div";
  return (
    <Component
      onClick={onClick}
      className={cn(
        "group relative border border-hairline bg-warm-white p-5 text-left transition-colors",
        onClick && "hover:border-ink",
        danger && "border-clay/40 bg-clay/5",
      )}
    >
      <div className="flex items-center gap-2">
        <span
          className="inline-block h-1.5 w-1.5 rounded-full"
          style={{ background: tint }}
        />
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone">
          {label}
        </span>
      </div>
      <p
        className={cn(
          "mt-3 font-display leading-none tracking-tight text-ink tabular-nums",
          wideValue ? "text-3xl md:text-4xl" : "text-4xl md:text-5xl",
        )}
      >
        {value}
      </p>
      <p className="mt-3 font-sans text-xs text-ink-soft">{hint}</p>
      {onClick && (
        <span className="absolute right-4 top-4 font-mono text-[10px] uppercase tracking-[0.18em] text-stone opacity-0 transition-opacity group-hover:opacity-100">
          View →
        </span>
      )}
    </Component>
  );
}

function FilterPill({
  label,
  count,
  active,
  color,
  onClick,
  accentBorder,
}: {
  label: string;
  count: number;
  active: boolean;
  color?: string;
  onClick: () => void;
  accentBorder?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-4 py-1.5 font-sans text-sm transition-colors",
        active
          ? "border-ink bg-ink text-bone"
          : accentBorder
            ? "border-clay/50 bg-clay/5 text-ink hover:border-clay hover:text-clay"
            : "border-hairline bg-paper text-ink-soft hover:border-ink hover:text-ink",
      )}
    >
      {color && (
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
      )}
      {label}
      <span
        className={cn(
          "font-mono text-[10px] tabular-nums",
          active ? "text-bone/70" : "text-stone",
        )}
      >
        {count}
      </span>
    </button>
  );
}

function Th({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <th
      className={cn(
        "px-4 py-3 text-left font-mono text-[10px] uppercase tracking-[0.22em] text-stone",
        className,
      )}
    >
      {children}
    </th>
  );
}

// ---------- Row ----------

type ClientWithDerived = Client & {
  _lastDays: number;
  _dueDays: number | null;
  _atRisk: boolean;
  _dueSoon: boolean;
  _overdue: boolean;
};

function ClientRow({
  client,
  expanded,
  onToggleExpand,
  touchpoints,
  onUpdate,
  onDelete,
  onAddTouchpoint,
  onRemoveTouchpoint,
}: {
  client: ClientWithDerived;
  expanded: boolean;
  onToggleExpand: () => void;
  touchpoints: Touchpoint[];
  onUpdate: (id: string, field: keyof Client, value: string | number | null) => void;
  onDelete: (id: string) => void;
  onAddTouchpoint: (clientId: string, tp: Touchpoint) => void;
  onRemoveTouchpoint: (id: string) => void;
}) {
  const [, startTransition] = useTransition();

  const update = (
    field: "name" | "company" | "email" | "nextAction" | "dueDate" | "status" | "notes" | "valueCents",
    value: string,
  ) => {
    let optimistic: string | number | null = value;
    if (field === "valueCents") {
      const cleaned = value.replace(/[^0-9.]/g, "");
      optimistic = cleaned ? Math.round(parseFloat(cleaned) * 100) : 0;
    }
    onUpdate(client.id, field, optimistic);
    startTransition(() => {
      const fd = new FormData();
      fd.set("id", client.id);
      fd.set("field", field);
      fd.set("value", value);
      updateClientField(fd).catch(() => toast.error("Couldn't save"));
    });
  };

  const handleDelete = () => {
    if (!confirm(`Remove ${client.name}?`)) return;
    onDelete(client.id);
    const fd = new FormData();
    fd.set("id", client.id);
    startTransition(() => {
      deleteClient(fd).catch(() => toast.error("Couldn't delete"));
    });
  };

  const status = STATUSES.find((s) => s.value === client.status) ?? STATUSES[0];

  return (
    <>
      <tr
        className={cn(
          "group border-b border-hairline-soft transition-colors hover:bg-bone/60",
          client._atRisk && "bg-clay/[0.035]",
          expanded && "bg-bone",
        )}
      >
        <Cell>
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={onToggleExpand}
              className={cn(
                "mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border text-[10px] transition-colors",
                expanded
                  ? "border-ink bg-ink text-bone"
                  : "border-hairline text-stone hover:border-ink hover:text-ink",
              )}
              aria-label={expanded ? "Collapse" : "Expand"}
            >
              {expanded ? "−" : "+"}
            </button>
            <div className="flex-1 min-w-0">
              <EditableText
                value={client.name}
                onSave={(v) => update("name", v)}
                className="font-sans text-sm text-ink"
              />
              {client.email !== null && client.email !== undefined && (
                <EditableText
                  value={client.email ?? ""}
                  placeholder="add email"
                  onSave={(v) => update("email", v)}
                  className="mt-1 block font-mono text-[11px] text-stone"
                />
              )}
              {client._atRisk && (
                <span className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-clay/40 bg-clay/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-clay">
                  <span className="h-1 w-1 rounded-full bg-clay animate-pulse" />
                  At risk
                </span>
              )}
            </div>
          </div>
        </Cell>
        <Cell>
          <EditableText
            value={client.company ?? ""}
            placeholder="—"
            onSave={(v) => update("company", v)}
            className="font-sans text-sm text-ink-soft"
          />
        </Cell>
        <Cell>
          <EditableText
            value={client.nextAction ?? ""}
            placeholder="Add a next action"
            onSave={(v) => update("nextAction", v)}
            className={cn(
              "font-sans text-sm",
              client._overdue ? "text-clay" : "text-ink",
            )}
          />
        </Cell>
        <Cell>
          <div className="space-y-0.5">
            <EditableText
              value={client.dueDate ?? ""}
              placeholder="—"
              onSave={(v) => update("dueDate", v)}
              className="font-mono text-[13px] tabular-nums text-ink"
            />
            {client._dueDays !== null && (
              <span
                className={cn(
                  "block font-mono text-[10px] uppercase tracking-[0.16em]",
                  client._overdue
                    ? "text-clay"
                    : client._dueSoon
                      ? "text-clay/80"
                      : "text-stone",
                )}
              >
                {client._overdue
                  ? `${Math.abs(client._dueDays)}d late`
                  : client._dueDays === 0
                    ? "Today"
                    : `In ${client._dueDays}d`}
              </span>
            )}
          </div>
        </Cell>
        <Cell>
          <ValueCell
            cents={client.valueCents ?? 0}
            onSave={(v) => update("valueCents", v)}
          />
        </Cell>
        <Cell>
          <LastTouch days={client._lastDays} atRisk={client._atRisk} />
        </Cell>
        <Cell>
          <StatusPill current={status.value} onChange={(v) => update("status", v)} />
        </Cell>
        <Cell>
          <button
            onClick={handleDelete}
            className="flex h-8 w-8 items-center justify-center rounded-full text-stone opacity-0 transition-all hover:bg-clay/10 hover:text-clay group-hover:opacity-100"
            aria-label="Remove client"
          >
            ×
          </button>
        </Cell>
      </tr>
      {expanded && (
        <tr className="border-b border-hairline bg-bone">
          <td colSpan={8} className="px-6 py-7 md:px-10">
            <ExpandedPanel
              client={client}
              touchpoints={touchpoints}
              onUpdateNotes={(v) => update("notes", v)}
              onAddTouchpoint={onAddTouchpoint}
              onRemoveTouchpoint={onRemoveTouchpoint}
            />
          </td>
        </tr>
      )}
    </>
  );
}

function Cell({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3 align-top">{children}</td>;
}

function LastTouch({ days, atRisk }: { days: number; atRisk: boolean }) {
  if (!Number.isFinite(days)) {
    return <span className="font-sans text-xs text-stone">—</span>;
  }
  const label =
    days === 0 ? "Today" : days === 1 ? "Yesterday" : `${days}d ago`;
  return (
    <div className="flex flex-col">
      <span
        className={cn(
          "font-mono text-[13px] tabular-nums",
          atRisk ? "text-clay" : days <= 3 ? "text-forest" : "text-ink",
        )}
      >
        {label}
      </span>
      {days > 7 && (
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-stone">
          Ping?
        </span>
      )}
    </div>
  );
}

function ValueCell({
  cents,
  onSave,
}: {
  cents: number;
  onSave: (v: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(cents ? (cents / 100).toString() : "");

  useEffect(() => {
    setDraft(cents ? (cents / 100).toString() : "");
  }, [cents]);

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className={cn(
          "block w-full text-left font-mono text-sm tabular-nums transition-colors hover:text-clay",
          cents ? "text-ink" : "text-stone-light",
        )}
      >
        {cents ? formatCurrency(cents) : "Add"}
      </button>
    );
  }
  return (
    <div className="relative">
      <span className="absolute left-0 top-1/2 -translate-y-1/2 font-mono text-sm text-stone">
        $
      </span>
      <input
        autoFocus
        type="number"
        min="0"
        step="0.01"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          setEditing(false);
          onSave(draft);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
          if (e.key === "Escape") {
            setDraft(cents ? (cents / 100).toString() : "");
            setEditing(false);
          }
        }}
        className="w-full border-b border-ink bg-bone py-0.5 pl-4 text-right font-mono text-sm tabular-nums text-ink focus:outline-none"
      />
    </div>
  );
}

function EditableText({
  value,
  onSave,
  className,
  placeholder,
}: {
  value: string;
  onSave: (v: string) => void;
  className?: string;
  placeholder?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => setDraft(value), [value]);

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className={cn(
          "block w-full text-left leading-snug transition-colors hover:text-clay",
          !value && "text-stone-light",
          className,
        )}
      >
        {value || placeholder || "—"}
      </button>
    );
  }
  return (
    <input
      autoFocus
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => {
        setEditing(false);
        if (draft !== value) onSave(draft);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
        if (e.key === "Escape") {
          setDraft(value);
          setEditing(false);
        }
      }}
      className={cn(
        "w-full border-b border-ink bg-bone px-1 py-0.5 font-sans text-sm text-ink focus:outline-none",
        className,
      )}
    />
  );
}

function StatusPill({
  current,
  onChange,
}: {
  current: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const status = STATUSES.find((s) => s.value === current) ?? STATUSES[0];
  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 rounded-full border border-hairline bg-paper px-3 py-1 font-sans text-xs text-ink transition-colors hover:border-ink"
      >
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: status.color }} />
        {status.label}
        <span className="text-stone">⌄</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-20 mt-1 min-w-[140px] border border-hairline bg-paper py-1 shadow-warm-md">
            {STATUSES.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => {
                  onChange(s.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-1.5 text-left font-sans text-xs transition-colors hover:bg-bone",
                  s.value === current ? "text-ink" : "text-ink-soft",
                )}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.color }} />
                {s.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ---------- Expanded panel ----------

function ExpandedPanel({
  client,
  touchpoints,
  onUpdateNotes,
  onAddTouchpoint,
  onRemoveTouchpoint,
}: {
  client: ClientWithDerived;
  touchpoints: Touchpoint[];
  onUpdateNotes: (v: string) => void;
  onAddTouchpoint: (clientId: string, tp: Touchpoint) => void;
  onRemoveTouchpoint: (id: string) => void;
}) {
  const [note, setNote] = useState("");
  const [kind, setKind] = useState<string>("note");
  const [pending, startTransition] = useTransition();
  const [notesDraft, setNotesDraft] = useState(client.notes ?? "");

  useEffect(() => setNotesDraft(client.notes ?? ""), [client.notes]);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!note.trim()) return;
    const now = new Date();
    const optimistic: Touchpoint = {
      id: `temp-${Date.now()}`,
      clientId: client.id,
      note: note.trim(),
      kind,
      occurredAt: now,
    };
    onAddTouchpoint(client.id, optimistic);
    const saved = note;
    setNote("");
    setKind("note");
    const fd = new FormData();
    fd.set("clientId", client.id);
    fd.set("note", saved);
    fd.set("kind", kind);
    startTransition(() => {
      addTouchpoint(fd).catch(() => toast.error("Couldn't log touchpoint"));
    });
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:gap-14">
      <div>
        <div className="flex items-baseline justify-between">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-clay">
            Activity · {touchpoints.length}{" "}
            {touchpoints.length === 1 ? "touchpoint" : "touchpoints"}
          </p>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone">
            Press ↵ to log
          </span>
        </div>

        {/* Quick log */}
        <form
          onSubmit={submit}
          className="mt-4 border border-hairline bg-warm-white"
        >
          <div className="flex items-stretch gap-0">
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value)}
              className="border-r border-hairline bg-bone px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-ink focus:outline-none"
            >
              {Object.entries(KIND_STYLES).map(([value, meta]) => (
                <option key={value} value={value}>
                  {meta.label}
                </option>
              ))}
            </select>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What just happened? (sent proposal, had call, etc.)"
              className="flex-1 bg-transparent px-4 py-3 font-sans text-sm text-ink placeholder:text-stone focus:outline-none"
            />
            <button
              type="submit"
              disabled={pending || !note.trim()}
              className="border-l border-hairline bg-ink px-5 font-sans text-sm text-bone transition-colors hover:bg-forest disabled:opacity-40"
            >
              Log
            </button>
          </div>
        </form>

        {/* Timeline */}
        <ol className="mt-8 space-y-5">
          {touchpoints.map((tp) => {
            const meta = KIND_STYLES[tp.kind] ?? KIND_STYLES.note;
            const when = typeof tp.occurredAt === "string" ? new Date(tp.occurredAt) : tp.occurredAt;
            const days = Math.max(0, Math.floor((Date.now() - when.getTime()) / (1000 * 60 * 60 * 24)));
            const dateLabel =
              days === 0
                ? "Today"
                : days === 1
                  ? "Yesterday"
                  : `${days} days ago`;
            return (
              <li
                key={tp.id}
                className="group grid grid-cols-[auto_1fr_auto] items-start gap-4 border-l border-hairline pl-5"
                style={{ borderLeftColor: meta.dot }}
              >
                <span
                  className="mt-1 inline-flex h-2 w-2 -translate-x-[25px] rounded-full ring-4 ring-bone"
                  style={{ background: meta.dot }}
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <span
                      className="font-mono text-[10px] uppercase tracking-[0.22em]"
                      style={{ color: meta.dot }}
                    >
                      {meta.label}
                    </span>
                    <span className="font-mono text-[10px] tabular-nums text-stone">
                      {dateLabel} · {when.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                  <p className="mt-1 font-sans text-sm leading-snug text-ink">
                    {tp.note}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onRemoveTouchpoint(tp.id);
                    const fd = new FormData();
                    fd.set("id", tp.id);
                    startTransition(() => {
                      deleteTouchpoint(fd).catch(() => toast.error("Couldn't remove"));
                    });
                  }}
                  className="flex h-6 w-6 items-center justify-center rounded-full text-stone opacity-0 transition-opacity hover:bg-clay/10 hover:text-clay group-hover:opacity-100"
                  aria-label="Remove touchpoint"
                >
                  ×
                </button>
              </li>
            );
          })}
          {touchpoints.length === 0 && (
            <li className="font-sans text-sm italic text-stone">
              No touchpoints logged yet. Use the quick log above — &ldquo;Sent
              proposal&rdquo;, &ldquo;Called them&rdquo;, etc.
            </li>
          )}
        </ol>
      </div>

      <aside className="lg:border-l lg:border-hairline lg:pl-12">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-clay">
          Notes
        </p>
        <textarea
          value={notesDraft}
          onChange={(e) => setNotesDraft(e.target.value)}
          onBlur={() => {
            if (notesDraft !== (client.notes ?? "")) onUpdateNotes(notesDraft);
          }}
          rows={6}
          placeholder="Context, preferences, how you met. Anything you wouldn't put in the table row."
          className="mt-4 w-full resize-none border border-hairline bg-warm-white p-4 font-sans text-sm leading-relaxed text-ink placeholder:text-stone focus:border-ink focus:outline-none"
        />
        <dl className="mt-8 space-y-3 font-mono text-[11px] uppercase tracking-[0.18em] text-stone">
          <Meta label="Last touch" value={Number.isFinite(client._lastDays) ? `${client._lastDays}d ago` : "Never"} />
          <Meta label="Value" value={formatCurrency(client.valueCents)} />
          <Meta label="Status" value={client.status} />
        </dl>
      </aside>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-stone">{label}</dt>
      <dd className="tabular-nums text-ink">{value}</dd>
    </div>
  );
}

// ---------- New row ----------

function NewClientRow({
  onDone,
  onAdd,
  inputRef,
}: {
  onDone: () => void;
  onAdd: (client: Client) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}) {
  const [form, setForm] = useState({
    name: "",
    company: "",
    nextAction: "",
    dueDate: "",
    valueCents: "",
    status: "active",
  });
  const [pending, startTransition] = useTransition();

  const submit = () => {
    if (!form.name.trim()) {
      onDone();
      return;
    }
    const valueCents = form.valueCents
      ? Math.round(parseFloat(form.valueCents.replace(/[^0-9.]/g, "")) * 100) || 0
      : 0;
    const optimistic: Client = {
      id: `temp-${Date.now()}`,
      name: form.name,
      company: form.company || null,
      email: null,
      nextAction: form.nextAction || null,
      dueDate: form.dueDate || null,
      status: form.status,
      notes: null,
      valueCents,
      lastTouchedAt: new Date(),
      updatedAt: new Date(),
    };
    onAdd(optimistic);

    const fd = new FormData();
    fd.set("name", form.name);
    fd.set("company", form.company);
    fd.set("nextAction", form.nextAction);
    fd.set("dueDate", form.dueDate);
    fd.set("valueCents", String(valueCents));
    fd.set("status", form.status);
    startTransition(() => {
      createClient(fd).catch(() => toast.error("Couldn't save client"));
    });
  };

  const baseInput = "w-full border-b bg-transparent py-0.5 font-sans text-sm text-ink focus:outline-none";

  return (
    <tr className="border-b border-ink bg-bone/80">
      <td className="px-4 py-3" colSpan={1}>
        <input
          ref={inputRef}
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
            if (e.key === "Escape") onDone();
          }}
          placeholder="Client name"
          className={cn(baseInput, "border-ink")}
        />
      </td>
      <td className="px-4 py-3">
        <input
          value={form.company}
          onChange={(e) => setForm({ ...form, company: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
            if (e.key === "Escape") onDone();
          }}
          placeholder="Company"
          className={cn(baseInput, "border-hairline focus:border-ink")}
        />
      </td>
      <td className="px-4 py-3">
        <input
          value={form.nextAction}
          onChange={(e) => setForm({ ...form, nextAction: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
            if (e.key === "Escape") onDone();
          }}
          placeholder="Next action"
          className={cn(baseInput, "border-hairline focus:border-ink")}
        />
      </td>
      <td className="px-4 py-3">
        <input
          value={form.dueDate}
          onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
            if (e.key === "Escape") onDone();
          }}
          placeholder="Apr 22"
          className={cn(baseInput, "border-hairline font-mono text-[13px] tabular-nums focus:border-ink")}
        />
      </td>
      <td className="px-4 py-3">
        <input
          type="number"
          value={form.valueCents}
          onChange={(e) => setForm({ ...form, valueCents: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
            if (e.key === "Escape") onDone();
          }}
          placeholder="0"
          className={cn(baseInput, "border-hairline text-right font-mono tabular-nums focus:border-ink")}
        />
      </td>
      <td className="px-4 py-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-stone">
          New
        </span>
      </td>
      <td className="px-4 py-3">
        <select
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
          className="rounded-full border border-hairline bg-paper px-3 py-1 font-sans text-xs text-ink focus:border-ink focus:outline-none"
        >
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </td>
      <td className="px-4 py-3 text-right">
        <button
          type="button"
          onClick={submit}
          disabled={pending}
          className="rounded-full bg-ink px-3 py-1 font-sans text-xs text-bone hover:bg-forest disabled:opacity-60"
        >
          {pending ? "..." : "↵"}
        </button>
      </td>
    </tr>
  );
}
