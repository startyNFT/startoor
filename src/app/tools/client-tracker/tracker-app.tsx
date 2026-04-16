"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/cn";
import {
  createClient,
  deleteClient,
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
  updatedAt: Date | string;
};

const STATUSES = [
  { value: "active", label: "Active", color: "#1F3A2F" },
  { value: "dormant", label: "Dormant", color: "#8F8B80" },
  { value: "not-yet", label: "Not yet", color: "#E8C77F" },
  { value: "closed", label: "Closed", color: "#C85A3F" },
];

export function ClientTrackerApp({
  initialClients,
  email,
}: {
  initialClients: Client[];
  email: string;
}) {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [filter, setFilter] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [addingOpen, setAddingOpen] = useState(false);
  const addInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setClients(initialClients);
  }, [initialClients]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return clients.filter((c) => {
      if (filter !== "all" && c.status !== filter) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        (c.company?.toLowerCase().includes(q) ?? false) ||
        (c.nextAction?.toLowerCase().includes(q) ?? false) ||
        (c.email?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [clients, filter, query]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: clients.length };
    for (const st of STATUSES) c[st.value] = 0;
    for (const client of clients) {
      c[client.status] = (c[client.status] ?? 0) + 1;
    }
    return c;
  }, [clients]);

  useEffect(() => {
    if (addingOpen) {
      setTimeout(() => addInputRef.current?.focus(), 50);
    }
  }, [addingOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "n" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setAddingOpen(true);
      }
      if (e.key === "Escape") setAddingOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleOptimisticUpdate = (
    id: string,
    field: keyof Client,
    value: string,
  ) => {
    setClients((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)),
    );
  };

  const handleOptimisticDelete = (id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
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
              Your clients,
              <br />
              <span className="italic text-forest">on one screen.</span>
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

        {/* Filter pills */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <FilterPill
            label="All"
            active={filter === "all"}
            count={counts.all}
            onClick={() => setFilter("all")}
          />
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
          <table className="w-full min-w-[980px]">
            <thead>
              <tr className="border-b border-hairline bg-bone">
                <Th>Client</Th>
                <Th>Company</Th>
                <Th>Next action</Th>
                <Th className="w-32">Due</Th>
                <Th className="w-32">Status</Th>
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
                  onUpdate={handleOptimisticUpdate}
                  onDelete={handleOptimisticDelete}
                />
              ))}
              {filtered.length === 0 && !addingOpen && (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    {clients.length === 0 ? (
                      <div>
                        <p className="font-display text-2xl tracking-tight text-ink">
                          Nothing on your plate yet.
                        </p>
                        <p className="mt-2 font-sans text-sm text-ink-soft">
                          Hit <span className="font-mono text-ink">⌘N</span> or
                          the New client button to add your first.
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
            {filtered.length} of {clients.length} · {counts.active ?? 0} active
          </p>
          <p>
            Tip: click any cell to edit in place. Tab to move across. Esc to
            cancel.
          </p>
        </div>
      </div>
    </div>
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

function FilterPill({
  label,
  count,
  active,
  color,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  color?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-4 py-1.5 font-sans text-sm transition-colors",
        active
          ? "border-ink bg-ink text-bone"
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

function ClientRow({
  client,
  onUpdate,
  onDelete,
}: {
  client: Client;
  onUpdate: (id: string, field: keyof Client, value: string) => void;
  onDelete: (id: string) => void;
}) {
  const [, startTransition] = useTransition();

  const update = (field: "name" | "company" | "email" | "nextAction" | "dueDate" | "status" | "notes", value: string) => {
    onUpdate(client.id, field, value);
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
    <tr className="group border-b border-hairline-soft last:border-b-0 transition-colors hover:bg-bone/60">
      <Cell>
        <EditableText value={client.name} onSave={(v) => update("name", v)} className="font-sans text-sm text-ink" />
        {client.email && (
          <EditableText
            value={client.email}
            onSave={(v) => update("email", v)}
            className="mt-1 block font-mono text-[11px] text-stone"
          />
        )}
      </Cell>
      <Cell>
        <EditableText value={client.company ?? ""} placeholder="—" onSave={(v) => update("company", v)} className="font-sans text-sm text-ink-soft" />
      </Cell>
      <Cell>
        <EditableText value={client.nextAction ?? ""} placeholder="Add a next action" onSave={(v) => update("nextAction", v)} className="font-sans text-sm text-ink" />
      </Cell>
      <Cell>
        <EditableText value={client.dueDate ?? ""} placeholder="—" onSave={(v) => update("dueDate", v)} className="font-mono text-[13px] tabular-nums text-ink" />
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
  );
}

function Cell({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3 align-top">{children}</td>;
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

  useEffect(() => {
    setDraft(value);
  }, [value]);

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
        if (e.key === "Enter") {
          e.currentTarget.blur();
        } else if (e.key === "Escape") {
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
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
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
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: s.color }}
                />
                {s.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

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
    status: "active",
  });
  const [pending, startTransition] = useTransition();

  const submit = () => {
    if (!form.name.trim()) {
      onDone();
      return;
    }
    const optimistic: Client = {
      id: `temp-${Date.now()}`,
      name: form.name,
      company: form.company || null,
      email: null,
      nextAction: form.nextAction || null,
      dueDate: form.dueDate || null,
      status: form.status,
      notes: null,
      updatedAt: new Date(),
    };
    onAdd(optimistic);

    const fd = new FormData();
    fd.set("name", form.name);
    fd.set("company", form.company);
    fd.set("nextAction", form.nextAction);
    fd.set("dueDate", form.dueDate);
    fd.set("status", form.status);
    startTransition(() => {
      createClient(fd).catch(() => toast.error("Couldn't save client"));
    });
  };

  return (
    <tr className="border-b border-ink bg-bone/80">
      <td className="px-4 py-3">
        <input
          ref={inputRef}
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
            if (e.key === "Escape") onDone();
          }}
          placeholder="Client name"
          className="w-full border-b border-ink bg-transparent py-0.5 font-sans text-sm text-ink focus:outline-none"
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
          className="w-full border-b border-hairline bg-transparent py-0.5 font-sans text-sm text-ink focus:border-ink focus:outline-none"
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
          className="w-full border-b border-hairline bg-transparent py-0.5 font-sans text-sm text-ink focus:border-ink focus:outline-none"
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
          className="w-full border-b border-hairline bg-transparent py-0.5 font-mono text-[13px] tabular-nums text-ink focus:border-ink focus:outline-none"
        />
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
