"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Send,
  Save,
  Copy,
  Terminal,
  Code2,
  Plus,
  Trash2,
  Loader2,
  AlertCircle,
  KeyRound,
} from "lucide-react";
import { cn } from "@/lib/cn";
import {
  type SavedRequest,
  type KVRow,
  type BodyMode,
  type AuthMode,
  type HttpMethod,
  METHODS,
  METHOD_COLORS,
} from "@/lib/data/api-playground-seeds";

type RequestTab = "params" | "headers" | "body" | "auth" | "tests";

export function RequestEditor({
  request,
  onChange,
  onSend,
  onSave,
  sending,
  activeTab,
  onTabChange,
  activeEnvName,
  onCurlCopy,
  onFetchCopy,
}: {
  request: SavedRequest;
  onChange: (patch: Partial<SavedRequest>) => void;
  onSend: () => void;
  onSave: () => void;
  sending: boolean;
  activeTab: RequestTab;
  onTabChange: (t: RequestTab) => void;
  activeEnvName: string | null;
  onCurlCopy: () => void;
  onFetchCopy: () => void;
}) {
  const methodColors = METHOD_COLORS[request.method];

  // URL <-> Params two-way sync
  const lastParsedUrl = useRef<string>("");
  useEffect(() => {
    if (request.url === lastParsedUrl.current) return;
    lastParsedUrl.current = request.url;
    // Attempt to parse query string from URL and merge into params
    try {
      const qIdx = request.url.indexOf("?");
      if (qIdx === -1) return;
      const qs = request.url.slice(qIdx + 1);
      if (!qs) return;
      const parsed: KVRow[] = [];
      for (const pair of qs.split("&")) {
        if (!pair) continue;
        const [rawK, ...rest] = pair.split("=");
        const k = decodeURIComponent(rawK || "");
        const v = decodeURIComponent(rest.join("=") || "");
        if (!k) continue;
        parsed.push({
          id: `url_${k}_${Math.random().toString(36).slice(2, 6)}`,
          key: k,
          value: v,
          enabled: true,
        });
      }
      // Replace params only if different from what's derivable from current enabled params
      const currentQs = request.params
        .filter((p) => p.enabled && p.key)
        .map(
          (p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`
        )
        .join("&");
      if (currentQs !== qs) {
        // Merge: keep disabled ones, replace enabled
        const disabled = request.params.filter((p) => !p.enabled);
        onChange({ params: [...parsed, ...disabled] });
      }
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request.url]);

  const tabCounts = useMemo(
    () => ({
      params: request.params.filter((p) => p.enabled && p.key).length,
      headers: request.headers.filter((h) => h.enabled && h.key).length,
      body:
        request.bodyMode === "none"
          ? 0
          : request.bodyMode === "json"
            ? request.bodyJson.length
              ? 1
              : 0
            : request.bodyMode === "form-data"
              ? request.bodyFormData.filter((r) => r.enabled && r.key).length
              : request.bodyMode === "x-www-form-urlencoded"
                ? request.bodyUrlEncoded.filter((r) => r.enabled && r.key).length
                : request.bodyRaw.length
                  ? 1
                  : 0,
      auth: request.auth.mode === "none" ? 0 : 1,
      tests: (request.testNotes.length > 0 ? 1 : 0) + (request.expectedStatus ? 1 : 0),
    }),
    [request]
  );

  return (
    <div className="flex h-full min-h-0 flex-col bg-paper">
      {/* Request name + save */}
      <div className="flex items-center gap-3 border-b border-hairline bg-bone px-5 py-3">
        <input
          value={request.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="Untitled request"
          className="min-w-0 flex-1 bg-transparent font-display text-[22px] leading-tight tracking-tight text-ink placeholder:text-stone-light focus:outline-none md:text-[26px]"
        />
        <button
          type="button"
          onClick={onSave}
          className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-paper px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft transition-colors hover:border-ink hover:text-ink"
          title="⌘S"
        >
          <Save className="h-3 w-3" />
          Save
        </button>
      </div>

      {/* URL bar */}
      <div className="border-b border-hairline px-5 py-3">
        <div className="flex flex-wrap items-stretch gap-2 md:flex-nowrap">
          <div className="relative flex flex-shrink-0">
            <select
              value={request.method}
              onChange={(e) => onChange({ method: e.target.value as HttpMethod })}
              className={cn(
                "appearance-none rounded-l border border-r-0 px-3 py-2 pr-8 font-mono text-xs font-semibold uppercase tracking-[0.16em] transition-colors focus:outline-none",
                methodColors.pill
              )}
              style={{ minWidth: 96 }}
            >
              {METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[10px] opacity-70">
              ▼
            </span>
          </div>
          <input
            value={request.url}
            onChange={(e) => onChange({ url: e.target.value })}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                e.preventDefault();
                onSend();
              }
            }}
            placeholder="https://api.example.com/resource?id=42"
            className="min-w-0 flex-1 border border-hairline bg-bone px-3 py-2 font-mono text-[13px] text-ink placeholder:text-stone-light focus:border-ink focus:outline-none"
            spellCheck={false}
          />
          <button
            type="button"
            onClick={onSend}
            disabled={sending || !request.url.trim()}
            className={cn(
              "inline-flex flex-shrink-0 items-center gap-2 rounded-r bg-ink px-5 py-2 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-bone transition-colors",
              "hover:bg-forest",
              "disabled:cursor-not-allowed disabled:bg-stone disabled:text-paper"
            )}
            title="⌘↵"
          >
            {sending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
            {sending ? "Sending" : "Send"}
          </button>
        </div>

        {/* Secondary actions */}
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onCurlCopy}
            className="inline-flex items-center gap-1.5 border-b border-hairline pb-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft transition-colors hover:border-ink hover:text-ink"
          >
            <Terminal className="h-3 w-3" />
            Copy as cURL
          </button>
          <button
            type="button"
            onClick={onFetchCopy}
            className="inline-flex items-center gap-1.5 border-b border-hairline pb-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft transition-colors hover:border-ink hover:text-ink"
          >
            <Code2 className="h-3 w-3" />
            Copy as fetch()
          </button>
          {activeEnvName && (
            <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-hairline bg-bone px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft">
              <span className="h-1 w-1 rounded-full bg-butter" />
              Env · {activeEnvName}
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-hairline bg-bone px-3">
        <Tab
          active={activeTab === "params"}
          onClick={() => onTabChange("params")}
          label="Params"
          count={tabCounts.params}
        />
        <Tab
          active={activeTab === "headers"}
          onClick={() => onTabChange("headers")}
          label="Headers"
          count={tabCounts.headers}
        />
        <Tab
          active={activeTab === "body"}
          onClick={() => onTabChange("body")}
          label="Body"
          count={tabCounts.body}
        />
        <Tab
          active={activeTab === "auth"}
          onClick={() => onTabChange("auth")}
          label="Auth"
          count={tabCounts.auth}
        />
        <Tab
          active={activeTab === "tests"}
          onClick={() => onTabChange("tests")}
          label="Notes"
          count={tabCounts.tests}
        />
      </div>

      {/* Tab body */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {activeTab === "params" && (
          <KVTable
            title="Query parameters"
            hint="Toggled keys are appended to the URL. Edit either side — they stay in sync."
            rows={request.params}
            onChange={(rows) => {
              onChange({ params: rows });
              // rebuild URL when params change
              const enabled = rows.filter((r) => r.enabled && r.key);
              const base = request.url.split("?")[0];
              if (enabled.length === 0) {
                if (request.url.includes("?")) {
                  lastParsedUrl.current = base;
                  onChange({ url: base });
                }
              } else {
                const qs = enabled
                  .map(
                    (r) =>
                      `${encodeURIComponent(r.key)}=${encodeURIComponent(
                        r.value
                      )}`
                  )
                  .join("&");
                const next = `${base}?${qs}`;
                lastParsedUrl.current = next;
                onChange({ url: next });
              }
            }}
          />
        )}

        {activeTab === "headers" && (
          <KVTable
            title="Request headers"
            hint="Keys are case-insensitive. Content-Type is set automatically for JSON / form bodies unless you override it."
            rows={request.headers}
            onChange={(rows) => onChange({ headers: rows })}
          />
        )}

        {activeTab === "body" && (
          <BodyTab
            request={request}
            onChange={onChange}
          />
        )}

        {activeTab === "auth" && (
          <AuthTab
            auth={request.auth}
            onChange={(patch) => onChange({ auth: { ...request.auth, ...patch } })}
          />
        )}

        {activeTab === "tests" && (
          <div className="p-5">
            <SectionHead number="05" label="Scratchpad" />
            <p className="mt-2 max-w-xl font-sans text-sm text-ink-soft">
              Notes for future-you. Nothing is executed — this is just a calm
              place to jot what a healthy response should look like.
            </p>
            <div className="mt-6 max-w-xl space-y-4">
              <label className="block">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
                  Expected status
                </span>
                <input
                  value={request.expectedStatus}
                  onChange={(e) =>
                    onChange({ expectedStatus: e.target.value })
                  }
                  placeholder="200"
                  className="mt-2 w-full border-b border-hairline bg-transparent py-2 font-mono text-sm text-ink placeholder:text-stone-light focus:border-ink focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
                  Notes
                </span>
                <textarea
                  value={request.testNotes}
                  onChange={(e) => onChange({ testNotes: e.target.value })}
                  rows={6}
                  placeholder="e.g. Response should include a JWT in Set-Cookie. Fails if rate limited."
                  className="mt-2 w-full resize-none border border-hairline bg-bone p-3 font-sans text-sm leading-relaxed text-ink focus:border-ink focus:outline-none"
                />
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- subcomponents ----------

function Tab({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative inline-flex items-center gap-1.5 px-3 py-2.5 font-mono text-[11px] uppercase tracking-[0.18em] transition-colors",
        active ? "text-ink" : "text-stone hover:text-ink-soft"
      )}
    >
      {label}
      {count > 0 && (
        <span
          className={cn(
            "inline-flex min-w-[16px] items-center justify-center rounded-full px-1 text-[9px] tabular-nums",
            active
              ? "bg-ink text-bone"
              : "bg-hairline text-ink-soft"
          )}
        >
          {count}
        </span>
      )}
      {active && (
        <span className="absolute inset-x-2 bottom-0 h-[2px] bg-ink" />
      )}
    </button>
  );
}

function SectionHead({ number, label }: { number: string; label: string }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="font-display text-3xl leading-none tracking-tight text-clay">
        {number}
      </span>
      <span className="font-display text-lg leading-none tracking-tight text-ink">
        {label}
      </span>
    </div>
  );
}

function KVTable({
  title,
  hint,
  rows,
  onChange,
}: {
  title: string;
  hint?: string;
  rows: KVRow[];
  onChange: (rows: KVRow[]) => void;
}) {
  const update = (id: string, patch: Partial<KVRow>) =>
    onChange(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const remove = (id: string) => onChange(rows.filter((r) => r.id !== id));
  const add = () =>
    onChange([
      ...rows,
      {
        id: `kv_${Math.random().toString(36).slice(2, 9)}`,
        key: "",
        value: "",
        enabled: true,
      },
    ]);

  return (
    <div className="p-5">
      <SectionHead number={title.startsWith("Query") ? "01" : "02"} label={title} />
      {hint && (
        <p className="mt-2 max-w-2xl font-sans text-sm text-ink-soft">{hint}</p>
      )}

      <div className="mt-6 overflow-hidden rounded border border-hairline bg-bone">
        <div className="grid grid-cols-[32px_minmax(0,1fr)_minmax(0,1.4fr)_32px] items-center border-b border-hairline bg-paper px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-stone">
          <span></span>
          <span>Key</span>
          <span>Value</span>
          <span></span>
        </div>
        {rows.length === 0 && (
          <div className="px-4 py-6 text-center">
            <p className="font-mono text-[11px] italic text-stone">
              No entries. Tap + to add.
            </p>
          </div>
        )}
        {rows.map((r) => (
          <div
            key={r.id}
            className="grid grid-cols-[32px_minmax(0,1fr)_minmax(0,1.4fr)_32px] items-center border-b border-hairline-soft px-3 py-1.5 last:border-b-0"
          >
            <button
              type="button"
              onClick={() => update(r.id, { enabled: !r.enabled })}
              className={cn(
                "mx-auto flex h-4 w-4 items-center justify-center rounded border transition-colors",
                r.enabled
                  ? "border-forest bg-forest text-bone"
                  : "border-hairline bg-paper text-transparent hover:border-stone"
              )}
              title={r.enabled ? "Enabled" : "Disabled"}
            >
              <svg viewBox="0 0 12 12" className="h-2.5 w-2.5">
                <path
                  d="M2 6L5 9L10 3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <input
              value={r.key}
              onChange={(e) => update(r.id, { key: e.target.value })}
              placeholder="key"
              className={cn(
                "min-w-0 border-0 bg-transparent py-1 font-mono text-[12px] focus:outline-none",
                r.enabled ? "text-ink" : "text-stone line-through"
              )}
              spellCheck={false}
            />
            <input
              value={r.value}
              onChange={(e) => update(r.id, { value: e.target.value })}
              placeholder="value"
              className={cn(
                "min-w-0 border-0 border-l border-hairline-soft bg-transparent py-1 pl-3 font-mono text-[12px] focus:outline-none",
                r.enabled ? "text-ink" : "text-stone line-through"
              )}
              spellCheck={false}
            />
            <button
              type="button"
              onClick={() => remove(r.id)}
              className="mx-auto flex h-6 w-6 items-center justify-center rounded text-stone transition-colors hover:bg-clay/10 hover:text-clay"
              title="Remove"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={add}
        className="mt-3 inline-flex items-center gap-1.5 border-b border-hairline pb-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft transition-colors hover:border-ink hover:text-ink"
      >
        <Plus className="h-3 w-3" />
        Add row
      </button>
    </div>
  );
}

function BodyTab({
  request,
  onChange,
}: {
  request: SavedRequest;
  onChange: (patch: Partial<SavedRequest>) => void;
}) {
  const modes: { mode: BodyMode; label: string }[] = [
    { mode: "none", label: "None" },
    { mode: "json", label: "JSON" },
    { mode: "form-data", label: "form-data" },
    { mode: "x-www-form-urlencoded", label: "x-www-form" },
    { mode: "raw", label: "Raw" },
  ];

  const formatJson = () => {
    try {
      const parsed = JSON.parse(request.bodyJson || "{}");
      onChange({ bodyJson: JSON.stringify(parsed, null, 2) });
      toast.success("JSON formatted");
    } catch {
      toast.error("Can't format — JSON isn't valid.");
    }
  };

  return (
    <div className="p-5">
      <SectionHead number="03" label="Request body" />

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {modes.map((m) => (
          <button
            key={m.mode}
            type="button"
            onClick={() => onChange({ bodyMode: m.mode })}
            className={cn(
              "rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors",
              request.bodyMode === m.mode
                ? "border-ink bg-ink text-bone"
                : "border-hairline bg-bone text-ink-soft hover:border-ink hover:text-ink"
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

      {request.bodyMode === "none" && (
        <div className="mt-6 rounded border border-dashed border-hairline bg-bone px-5 py-8 text-center">
          <p className="font-mono text-[11px] italic text-stone">
            This request has no body. GET, HEAD, and OPTIONS usually don&apos;t need one.
          </p>
        </div>
      )}

      {request.bodyMode === "json" && (
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
              JSON · editable
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={formatJson}
                className="inline-flex items-center gap-1.5 border-b border-hairline pb-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft transition-colors hover:border-ink hover:text-ink"
              >
                Format
              </button>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(request.bodyJson);
                  toast.success("Copied");
                }}
                className="inline-flex items-center gap-1.5 border-b border-hairline pb-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft transition-colors hover:border-ink hover:text-ink"
              >
                <Copy className="h-3 w-3" />
                Copy
              </button>
            </div>
          </div>
          <LineNumberedTextarea
            value={request.bodyJson}
            onChange={(v) => onChange({ bodyJson: v })}
            placeholder={`{\n  "hello": "world"\n}`}
          />
        </div>
      )}

      {request.bodyMode === "form-data" && (
        <div className="mt-6">
          <KVSubTable
            rows={request.bodyFormData}
            onChange={(rows) => onChange({ bodyFormData: rows })}
            label="Multipart fields"
          />
        </div>
      )}

      {request.bodyMode === "x-www-form-urlencoded" && (
        <div className="mt-6">
          <KVSubTable
            rows={request.bodyUrlEncoded}
            onChange={(rows) => onChange({ bodyUrlEncoded: rows })}
            label="URL-encoded fields"
          />
        </div>
      )}

      {request.bodyMode === "raw" && (
        <div className="mt-6">
          <div className="mb-2 flex items-center gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
              Content-Type
            </span>
            <input
              value={request.bodyRawType}
              onChange={(e) => onChange({ bodyRawType: e.target.value })}
              placeholder="text/plain"
              className="flex-1 max-w-xs border-b border-hairline bg-transparent py-1 font-mono text-[12px] text-ink placeholder:text-stone-light focus:border-ink focus:outline-none"
            />
          </div>
          <LineNumberedTextarea
            value={request.bodyRaw}
            onChange={(v) => onChange({ bodyRaw: v })}
            placeholder="Paste raw body here..."
          />
        </div>
      )}
    </div>
  );
}

function KVSubTable({
  rows,
  onChange,
  label,
}: {
  rows: KVRow[];
  onChange: (rows: KVRow[]) => void;
  label: string;
}) {
  const update = (id: string, patch: Partial<KVRow>) =>
    onChange(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const remove = (id: string) => onChange(rows.filter((r) => r.id !== id));
  const add = () =>
    onChange([
      ...rows,
      {
        id: `kv_${Math.random().toString(36).slice(2, 9)}`,
        key: "",
        value: "",
        enabled: true,
      },
    ]);

  return (
    <div>
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
        {label}
      </span>
      <div className="mt-2 overflow-hidden rounded border border-hairline bg-bone">
        {rows.length === 0 && (
          <div className="px-4 py-5 text-center">
            <p className="font-mono text-[11px] italic text-stone">
              No fields. Tap + to add.
            </p>
          </div>
        )}
        {rows.map((r) => (
          <div
            key={r.id}
            className="grid grid-cols-[32px_minmax(0,1fr)_minmax(0,1.4fr)_32px] items-center border-b border-hairline-soft px-3 py-1.5 last:border-b-0"
          >
            <button
              type="button"
              onClick={() => update(r.id, { enabled: !r.enabled })}
              className={cn(
                "mx-auto flex h-4 w-4 items-center justify-center rounded border transition-colors",
                r.enabled
                  ? "border-forest bg-forest text-bone"
                  : "border-hairline bg-paper text-transparent"
              )}
            >
              <svg viewBox="0 0 12 12" className="h-2.5 w-2.5">
                <path
                  d="M2 6L5 9L10 3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <input
              value={r.key}
              onChange={(e) => update(r.id, { key: e.target.value })}
              placeholder="key"
              className="min-w-0 border-0 bg-transparent py-1 font-mono text-[12px] text-ink focus:outline-none"
            />
            <input
              value={r.value}
              onChange={(e) => update(r.id, { value: e.target.value })}
              placeholder="value"
              className="min-w-0 border-0 border-l border-hairline-soft bg-transparent py-1 pl-3 font-mono text-[12px] text-ink focus:outline-none"
            />
            <button
              type="button"
              onClick={() => remove(r.id)}
              className="mx-auto flex h-6 w-6 items-center justify-center rounded text-stone transition-colors hover:bg-clay/10 hover:text-clay"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={add}
        className="mt-3 inline-flex items-center gap-1.5 border-b border-hairline pb-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft transition-colors hover:border-ink hover:text-ink"
      >
        <Plus className="h-3 w-3" />
        Add field
      </button>
    </div>
  );
}

function LineNumberedTextarea({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const lines = (value || "").split("\n").length;
  const lineNumbers = useMemo(() => {
    return Array.from({ length: Math.max(lines, 1) }, (_, i) => i + 1).join("\n");
  }, [lines]);

  const ref = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  const syncScroll = () => {
    if (gutterRef.current && ref.current) {
      gutterRef.current.scrollTop = ref.current.scrollTop;
    }
  };

  return (
    <div className="relative overflow-hidden rounded border border-hairline bg-bone">
      <div className="flex">
        <div
          ref={gutterRef}
          className="no-scrollbar max-h-[420px] min-h-[220px] overflow-hidden select-none border-r border-hairline bg-paper px-2 py-3 text-right font-mono text-[11px] leading-[1.6] text-stone-light"
          style={{ whiteSpace: "pre" }}
        >
          {lineNumbers}
        </div>
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={syncScroll}
          placeholder={placeholder}
          spellCheck={false}
          className="max-h-[420px] min-h-[220px] flex-1 resize-y bg-transparent px-3 py-3 font-mono text-[12px] leading-[1.6] text-ink placeholder:text-stone-light focus:outline-none"
        />
      </div>
    </div>
  );
}

function AuthTab({
  auth,
  onChange,
}: {
  auth: SavedRequest["auth"];
  onChange: (patch: Partial<SavedRequest["auth"]>) => void;
}) {
  const modes: { mode: AuthMode; label: string; sub: string }[] = [
    { mode: "none", label: "None", sub: "Public endpoint" },
    { mode: "bearer", label: "Bearer", sub: "OAuth 2 / JWT" },
    { mode: "basic", label: "Basic", sub: "user:password" },
    { mode: "api-key", label: "API key", sub: "header or query" },
    { mode: "custom-header", label: "Custom", sub: "one header" },
  ];

  return (
    <div className="p-5">
      <SectionHead number="04" label="Authentication" />
      <p className="mt-2 max-w-2xl font-sans text-sm text-ink-soft">
        Preset flavors. Values are stored locally alongside the request and only
        attached at send time.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-2 md:grid-cols-5">
        {modes.map((m) => (
          <button
            key={m.mode}
            type="button"
            onClick={() => onChange({ mode: m.mode })}
            className={cn(
              "group rounded border px-3 py-3 text-left transition-colors",
              auth.mode === m.mode
                ? "border-ink bg-ink text-bone"
                : "border-hairline bg-bone text-ink-soft hover:border-ink hover:text-ink"
            )}
          >
            <div className="font-mono text-[11px] uppercase tracking-[0.18em]">
              {m.label}
            </div>
            <div
              className={cn(
                "mt-1 font-sans text-[11px]",
                auth.mode === m.mode ? "text-stone-light" : "text-stone"
              )}
            >
              {m.sub}
            </div>
          </button>
        ))}
      </div>

      <div className="mt-8 max-w-xl space-y-4">
        {auth.mode === "bearer" && (
          <LabeledInput
            label="Bearer token"
            value={auth.bearerToken || ""}
            onChange={(v) => onChange({ bearerToken: v })}
            placeholder="eyJhbGciOi..."
            icon={<KeyRound className="h-3 w-3" />}
          />
        )}
        {auth.mode === "basic" && (
          <div className="grid gap-4 md:grid-cols-2">
            <LabeledInput
              label="Username"
              value={auth.basicUser || ""}
              onChange={(v) => onChange({ basicUser: v })}
            />
            <LabeledInput
              label="Password"
              value={auth.basicPass || ""}
              onChange={(v) => onChange({ basicPass: v })}
              type="password"
            />
          </div>
        )}
        {auth.mode === "api-key" && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <LabeledInput
                label="Name"
                value={auth.apiKeyName || ""}
                onChange={(v) => onChange({ apiKeyName: v })}
                placeholder="X-API-Key"
              />
              <LabeledInput
                label="Value"
                value={auth.apiKeyValue || ""}
                onChange={(v) => onChange({ apiKeyValue: v })}
              />
            </div>
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
                Add to
              </span>
              <div className="mt-2 inline-flex rounded-full border border-hairline bg-bone p-1">
                {(["header", "query"] as const).map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => onChange({ apiKeyIn: loc })}
                    className={cn(
                      "rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors",
                      (auth.apiKeyIn || "header") === loc
                        ? "bg-ink text-bone"
                        : "text-ink-soft hover:text-ink"
                    )}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        {auth.mode === "custom-header" && (
          <div className="grid gap-4 md:grid-cols-2">
            <LabeledInput
              label="Header name"
              value={auth.customHeaderName || ""}
              onChange={(v) => onChange({ customHeaderName: v })}
              placeholder="Authorization"
            />
            <LabeledInput
              label="Header value"
              value={auth.customHeaderValue || ""}
              onChange={(v) => onChange({ customHeaderValue: v })}
              placeholder="Custom ..."
            />
          </div>
        )}
        {auth.mode === "none" && (
          <div className="rounded border border-dashed border-hairline bg-bone px-5 py-6">
            <p className="flex items-start gap-2 font-sans text-sm text-ink-soft">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-stone" />
              No auth attached. Fine for public endpoints like httpbin or
              jsonplaceholder.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function LabeledInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  icon,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  icon?: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
        {icon}
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full border-b border-hairline bg-transparent py-2 font-mono text-[13px] text-ink placeholder:text-stone-light focus:border-ink focus:outline-none"
        spellCheck={false}
      />
    </label>
  );
}
