"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import {
  Folder,
  FolderOpen,
  Plus,
  MoreHorizontal,
  Trash2,
  Copy,
  Pencil,
  History,
  Globe,
  Download,
  Upload,
  X,
} from "lucide-react";
import { cn } from "@/lib/cn";
import {
  type Collection,
  type SavedRequest,
  type HistoryEntry,
  type Environment,
  METHOD_COLORS,
} from "@/lib/data/api-playground-seeds";

type View = "collections" | "history" | "environments";

export function Sidebar({
  collections,
  requests,
  history,
  environments,
  activeRequestId,
  activeEnvId,
  onSelectRequest,
  onNewCollection,
  onNewRequest,
  onRenameCollection,
  onDeleteCollection,
  onRenameRequest,
  onDuplicateRequest,
  onDeleteRequest,
  onSelectHistoryEntry,
  onClearHistory,
  onNewEnvironment,
  onSelectEnvironment,
  onRenameEnvironment,
  onDeleteEnvironment,
  onExport,
  onImport,
  onClose,
}: {
  collections: Collection[];
  requests: Record<string, SavedRequest>;
  history: HistoryEntry[];
  environments: Environment[];
  activeRequestId: string | null;
  activeEnvId: string | null;
  onSelectRequest: (id: string) => void;
  onNewCollection: () => void;
  onNewRequest: (collectionId: string) => void;
  onRenameCollection: (id: string, name: string) => void;
  onDeleteCollection: (id: string) => void;
  onRenameRequest: (id: string, name: string) => void;
  onDuplicateRequest: (id: string) => void;
  onDeleteRequest: (id: string) => void;
  onSelectHistoryEntry: (entry: HistoryEntry) => void;
  onClearHistory: () => void;
  onNewEnvironment: () => void;
  onSelectEnvironment: (id: string | null) => void;
  onRenameEnvironment: (id: string, name: string) => void;
  onDeleteEnvironment: (id: string) => void;
  onExport: () => void;
  onImport: () => void;
  onClose?: () => void;
}) {
  const [view, setView] = useState<View>("collections");
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(collections.map((c) => [c.id, true]))
  );

  useEffect(() => {
    setExpanded((prev) => {
      const next = { ...prev };
      for (const c of collections) {
        if (!(c.id in next)) next[c.id] = true;
      }
      return next;
    });
  }, [collections]);

  return (
    <div className="flex h-full min-h-0 flex-col bg-bone">
      {/* Top strip */}
      <div className="flex items-center justify-between border-b border-hairline px-4 py-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink">
          Workbench
        </span>
        <div className="flex items-center gap-1">
          <IconBtn title="Export JSON" onClick={onExport}>
            <Download className="h-3.5 w-3.5" />
          </IconBtn>
          <IconBtn title="Import JSON" onClick={onImport}>
            <Upload className="h-3.5 w-3.5" />
          </IconBtn>
          {onClose && (
            <IconBtn title="Close" onClick={onClose}>
              <X className="h-3.5 w-3.5" />
            </IconBtn>
          )}
        </div>
      </div>

      {/* View tabs */}
      <div className="grid grid-cols-3 border-b border-hairline">
        <ViewTab
          active={view === "collections"}
          onClick={() => setView("collections")}
          icon={<Folder className="h-3.5 w-3.5" />}
          label="Collections"
        />
        <ViewTab
          active={view === "history"}
          onClick={() => setView("history")}
          icon={<History className="h-3.5 w-3.5" />}
          label="History"
        />
        <ViewTab
          active={view === "environments"}
          onClick={() => setView("environments")}
          icon={<Globe className="h-3.5 w-3.5" />}
          label="Envs"
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {view === "collections" && (
          <div className="px-2 py-3">
            <div className="flex items-center justify-between px-2 pb-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
                {collections.length} collection{collections.length === 1 ? "" : "s"}
              </span>
              <button
                type="button"
                onClick={onNewCollection}
                className="inline-flex items-center gap-1 rounded-full border border-hairline bg-paper px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft transition-colors hover:border-ink hover:text-ink"
              >
                <Plus className="h-3 w-3" />
                New
              </button>
            </div>

            {collections.length === 0 && (
              <EmptyHint text="No collections yet. Tap New to start one." />
            )}

            <ul className="space-y-1">
              {collections.map((c) => (
                <CollectionRow
                  key={c.id}
                  collection={c}
                  requests={requests}
                  activeRequestId={activeRequestId}
                  expanded={!!expanded[c.id]}
                  onToggle={() =>
                    setExpanded((e) => ({ ...e, [c.id]: !e[c.id] }))
                  }
                  onSelectRequest={onSelectRequest}
                  onNewRequest={() => onNewRequest(c.id)}
                  onRename={(name) => onRenameCollection(c.id, name)}
                  onDelete={() => onDeleteCollection(c.id)}
                  onRenameRequest={onRenameRequest}
                  onDuplicateRequest={onDuplicateRequest}
                  onDeleteRequest={onDeleteRequest}
                />
              ))}
            </ul>
          </div>
        )}

        {view === "history" && (
          <div className="px-2 py-3">
            <div className="flex items-center justify-between px-2 pb-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
                Last {history.length} · max 50
              </span>
              {history.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("Clear all history?")) onClearHistory();
                  }}
                  className="inline-flex items-center gap-1 rounded-full border border-hairline bg-paper px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft transition-colors hover:border-clay hover:text-clay"
                >
                  Clear
                </button>
              )}
            </div>

            {history.length === 0 && (
              <EmptyHint text="Send a request — it'll land here automatically." />
            )}

            <ul className="space-y-1">
              {history.map((h) => (
                <li key={h.id}>
                  <button
                    type="button"
                    onClick={() => onSelectHistoryEntry(h)}
                    className="group flex w-full min-w-0 items-center gap-2 rounded px-2 py-1.5 text-left transition-colors hover:bg-paper"
                  >
                    <MethodDot method={h.method} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-mono text-[11px] text-ink">
                          {h.url || "(empty url)"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 font-mono text-[10px] tabular-nums text-stone">
                        <span
                          className={cn(
                            h.status === null && "text-clay",
                            h.status !== null &&
                              h.status >= 200 &&
                              h.status < 300 &&
                              "text-forest",
                            h.status !== null &&
                              h.status >= 300 &&
                              h.status < 400 &&
                              "text-[#8a6a1f]",
                            h.status !== null && h.status >= 400 && "text-clay"
                          )}
                        >
                          {h.status ?? "ERR"}
                        </span>
                        <span>·</span>
                        <span>{h.durationMs}ms</span>
                        <span>·</span>
                        <span>{relativeTime(h.at)}</span>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {view === "environments" && (
          <div className="px-2 py-3">
            <div className="flex items-center justify-between px-2 pb-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
                {environments.length} env{environments.length === 1 ? "" : "s"}
              </span>
              <button
                type="button"
                onClick={onNewEnvironment}
                className="inline-flex items-center gap-1 rounded-full border border-hairline bg-paper px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft transition-colors hover:border-ink hover:text-ink"
              >
                <Plus className="h-3 w-3" />
                New
              </button>
            </div>

            {environments.length === 0 && (
              <EmptyHint text="Environments hold {{vars}} you can swap in the URL/headers/body." />
            )}

            <ul className="space-y-1">
              <li>
                <button
                  type="button"
                  onClick={() => onSelectEnvironment(null)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded px-2 py-1.5 text-left transition-colors",
                    activeEnvId === null
                      ? "bg-ink text-bone"
                      : "text-ink-soft hover:bg-paper"
                  )}
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      activeEnvId === null ? "bg-bone" : "bg-stone"
                    )}
                  />
                  <span className="font-mono text-[11px] uppercase tracking-[0.16em]">
                    No environment
                  </span>
                </button>
              </li>
              {environments.map((e) => (
                <EnvRow
                  key={e.id}
                  env={e}
                  active={activeEnvId === e.id}
                  onSelect={() => onSelectEnvironment(e.id)}
                  onRename={(name) => onRenameEnvironment(e.id, name)}
                  onDelete={() => onDeleteEnvironment(e.id)}
                />
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="border-t border-hairline px-4 py-3">
        <p className="font-mono text-[10px] leading-relaxed text-stone">
          Stored locally in your browser. Nothing leaves this device unless you fire a
          request.
        </p>
      </div>
    </div>
  );
}

// ---------- subcomponents ----------

function ViewTab({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center justify-center gap-1.5 border-b-2 py-2.5 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors",
        active
          ? "border-ink text-ink"
          : "border-transparent text-stone hover:text-ink"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function IconBtn({
  children,
  onClick,
  title,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="flex h-7 w-7 items-center justify-center rounded text-stone transition-colors hover:bg-paper hover:text-ink"
    >
      {children}
    </button>
  );
}

function CollectionRow({
  collection,
  requests,
  activeRequestId,
  expanded,
  onToggle,
  onSelectRequest,
  onNewRequest,
  onRename,
  onDelete,
  onRenameRequest,
  onDuplicateRequest,
  onDeleteRequest,
}: {
  collection: Collection;
  requests: Record<string, SavedRequest>;
  activeRequestId: string | null;
  expanded: boolean;
  onToggle: () => void;
  onSelectRequest: (id: string) => void;
  onNewRequest: () => void;
  onRename: (name: string) => void;
  onDelete: () => void;
  onRenameRequest: (id: string, name: string) => void;
  onDuplicateRequest: (id: string) => void;
  onDeleteRequest: (id: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  return (
    <li>
      <div
        className={cn(
          "group flex items-center gap-1.5 rounded px-2 py-1.5 transition-colors hover:bg-paper"
        )}
      >
        <button
          type="button"
          onClick={onToggle}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          {expanded ? (
            <FolderOpen className="h-3.5 w-3.5 flex-shrink-0 text-clay" />
          ) : (
            <Folder className="h-3.5 w-3.5 flex-shrink-0 text-clay" />
          )}
          {renaming ? (
            <input
              autoFocus
              defaultValue={collection.name}
              onBlur={(e) => {
                const v = e.target.value.trim();
                if (v) onRename(v);
                setRenaming(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                if (e.key === "Escape") setRenaming(false);
              }}
              className="min-w-0 flex-1 rounded border border-hairline bg-paper px-1 font-mono text-xs text-ink focus:border-ink focus:outline-none"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="min-w-0 truncate font-mono text-xs text-ink">
              {collection.name}
            </span>
          )}
          <span className="flex-shrink-0 font-mono text-[10px] tabular-nums text-stone">
            {collection.requestIds.length}
          </span>
        </button>
        <div className="flex items-center opacity-0 transition-opacity group-hover:opacity-100">
          <IconBtn title="New request" onClick={onNewRequest}>
            <Plus className="h-3 w-3" />
          </IconBtn>
          <div className="relative" ref={menuRef}>
            <IconBtn
              title="More"
              onClick={() => setMenuOpen((v) => !v)}
            >
              <MoreHorizontal className="h-3 w-3" />
            </IconBtn>
            {menuOpen && (
              <div className="absolute right-0 top-7 z-20 w-40 rounded border border-hairline bg-bone py-1 shadow-warm-md">
                <MenuItem
                  onClick={() => {
                    setRenaming(true);
                    setMenuOpen(false);
                  }}
                  icon={<Pencil className="h-3 w-3" />}
                >
                  Rename
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    if (
                      confirm(
                        `Delete "${collection.name}" and ${collection.requestIds.length} requests?`
                      )
                    ) {
                      onDelete();
                    }
                    setMenuOpen(false);
                  }}
                  icon={<Trash2 className="h-3 w-3" />}
                  danger
                >
                  Delete
                </MenuItem>
              </div>
            )}
          </div>
        </div>
      </div>

      {expanded && (
        <ul className="ml-2 border-l border-hairline-soft pl-2">
          {collection.requestIds.length === 0 && (
            <li className="px-2 py-1.5 font-mono text-[10px] italic text-stone">
              Empty — tap + to add a request.
            </li>
          )}
          {collection.requestIds.map((rid) => {
            const req = requests[rid];
            if (!req) return null;
            return (
              <RequestRow
                key={rid}
                request={req}
                active={rid === activeRequestId}
                onSelect={() => onSelectRequest(rid)}
                onRename={(name) => onRenameRequest(rid, name)}
                onDuplicate={() => onDuplicateRequest(rid)}
                onDelete={() => onDeleteRequest(rid)}
              />
            );
          })}
        </ul>
      )}
    </li>
  );
}

function RequestRow({
  request,
  active,
  onSelect,
  onRename,
  onDuplicate,
  onDelete,
}: {
  request: SavedRequest;
  active: boolean;
  onSelect: () => void;
  onRename: (name: string) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  return (
    <li>
      <div
        onContextMenu={(e) => {
          e.preventDefault();
          setMenuOpen(true);
        }}
        className={cn(
          "group flex items-center gap-1.5 rounded px-2 py-1 transition-colors",
          active ? "bg-ink text-bone" : "hover:bg-paper"
        )}
      >
        <button
          type="button"
          onClick={onSelect}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          <MethodDot method={request.method} />
          {renaming ? (
            <input
              autoFocus
              defaultValue={request.name}
              onBlur={(e) => {
                const v = e.target.value.trim();
                if (v) onRename(v);
                setRenaming(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                if (e.key === "Escape") setRenaming(false);
              }}
              className="min-w-0 flex-1 rounded border border-hairline bg-paper px-1 font-mono text-[11px] text-ink focus:border-ink focus:outline-none"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span
              className={cn(
                "min-w-0 truncate font-mono text-[11px]",
                active ? "text-bone" : "text-ink-soft"
              )}
            >
              {request.name}
            </span>
          )}
        </button>
        <div
          className={cn(
            "flex items-center opacity-0 transition-opacity group-hover:opacity-100",
            active && "opacity-60 hover:opacity-100"
          )}
        >
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded transition-colors",
                active
                  ? "text-bone hover:bg-ink-soft"
                  : "text-stone hover:bg-paper hover:text-ink"
              )}
            >
              <MoreHorizontal className="h-3 w-3" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-6 z-30 w-40 rounded border border-hairline bg-bone py-1 shadow-warm-md">
                <MenuItem
                  onClick={() => {
                    setRenaming(true);
                    setMenuOpen(false);
                  }}
                  icon={<Pencil className="h-3 w-3" />}
                >
                  Rename
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    onDuplicate();
                    setMenuOpen(false);
                    toast.success("Duplicated");
                  }}
                  icon={<Copy className="h-3 w-3" />}
                >
                  Duplicate
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    if (confirm(`Delete "${request.name}"?`)) onDelete();
                    setMenuOpen(false);
                  }}
                  icon={<Trash2 className="h-3 w-3" />}
                  danger
                >
                  Delete
                </MenuItem>
              </div>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}

function EnvRow({
  env,
  active,
  onSelect,
  onRename,
  onDelete,
}: {
  env: Environment;
  active: boolean;
  onSelect: () => void;
  onRename: (name: string) => void;
  onDelete: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  return (
    <li>
      <div
        className={cn(
          "group flex items-center gap-2 rounded px-2 py-1.5 transition-colors",
          active ? "bg-ink text-bone" : "hover:bg-paper"
        )}
      >
        <button
          type="button"
          onClick={onSelect}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              active ? "bg-butter" : "bg-forest"
            )}
          />
          {renaming ? (
            <input
              autoFocus
              defaultValue={env.name}
              onBlur={(e) => {
                const v = e.target.value.trim();
                if (v) onRename(v);
                setRenaming(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                if (e.key === "Escape") setRenaming(false);
              }}
              className="min-w-0 flex-1 rounded border border-hairline bg-paper px-1 font-mono text-[11px] text-ink focus:border-ink focus:outline-none"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span
              className={cn(
                "min-w-0 truncate font-mono text-[11px] uppercase tracking-[0.14em]",
                active ? "text-bone" : "text-ink-soft"
              )}
            >
              {env.name}
            </span>
          )}
          <span
            className={cn(
              "flex-shrink-0 font-mono text-[10px] tabular-nums",
              active ? "text-stone-light" : "text-stone"
            )}
          >
            {env.variables.length}
          </span>
        </button>
        <div
          className={cn(
            "relative opacity-0 transition-opacity group-hover:opacity-100",
            active && "opacity-60 hover:opacity-100"
          )}
          ref={menuRef}
        >
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded transition-colors",
              active
                ? "text-bone hover:bg-ink-soft"
                : "text-stone hover:bg-paper hover:text-ink"
            )}
          >
            <MoreHorizontal className="h-3 w-3" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-6 z-30 w-40 rounded border border-hairline bg-bone py-1 shadow-warm-md">
              <MenuItem
                onClick={() => {
                  setRenaming(true);
                  setMenuOpen(false);
                }}
                icon={<Pencil className="h-3 w-3" />}
              >
                Rename
              </MenuItem>
              <MenuItem
                onClick={() => {
                  if (confirm(`Delete env "${env.name}"?`)) onDelete();
                  setMenuOpen(false);
                }}
                icon={<Trash2 className="h-3 w-3" />}
                danger
              >
                Delete
              </MenuItem>
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

function MenuItem({
  children,
  onClick,
  icon,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  icon?: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 px-3 py-1.5 text-left font-mono text-[11px] transition-colors",
        danger
          ? "text-clay hover:bg-clay/10"
          : "text-ink-soft hover:bg-paper hover:text-ink"
      )}
    >
      {icon}
      {children}
    </button>
  );
}

function MethodDot({ method }: { method: keyof typeof METHOD_COLORS }) {
  const c = METHOD_COLORS[method];
  return (
    <span
      className="inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full"
      style={{ backgroundColor: c.dot }}
      title={method}
    />
  );
}

function EmptyHint({ text }: { text: string }) {
  return (
    <div className="mx-2 rounded border border-dashed border-hairline bg-paper/50 px-3 py-4">
      <p className="font-mono text-[10px] leading-relaxed text-stone">{text}</p>
    </div>
  );
}

function relativeTime(ts: number) {
  const diff = Date.now() - ts;
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h`;
  return `${Math.floor(diff / 86_400_000)}d`;
}
