"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Copy, Eye, EyeOff, Image as ImageIcon, Clock, Zap, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/cn";

export type ResponseTab = "body" | "headers" | "preview" | "timeline";

export type ResponseSnapshot = {
  status: number | null; // null = network/CORS error
  statusText: string;
  headers: Record<string, string>;
  body: string;
  contentType: string;
  sizeBytes: number;
  startedAt: number;
  finishedAt: number;
  durationMs: number;
  error?: string;
  isCorsLikely?: boolean;
};

export function ResponsePane({
  response,
  activeTab,
  onTabChange,
  sending,
}: {
  response: ResponseSnapshot | null;
  activeTab: ResponseTab;
  onTabChange: (t: ResponseTab) => void;
  sending: boolean;
}) {
  if (sending && !response) {
    return <LoadingState />;
  }
  if (!response) {
    return <EmptyState />;
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-bone">
      {/* Status bar */}
      <div className="border-b border-hairline bg-paper px-5 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <StatusPill
            status={response.status}
            statusText={response.statusText}
          />
          <span className="inline-flex items-center gap-1.5 font-mono text-xs tabular-nums text-ink-soft">
            <Zap className="h-3 w-3 text-butter" />
            {response.durationMs}ms
          </span>
          <span className="inline-flex items-center gap-1.5 font-mono text-xs tabular-nums text-ink-soft">
            <span className="h-1 w-1 rounded-full bg-stone" />
            {formatBytes(response.sizeBytes)}
          </span>
          {response.contentType && (
            <span className="max-w-[240px] truncate font-mono text-[11px] text-stone">
              {response.contentType}
            </span>
          )}
        </div>
      </div>

      {response.error && (
        <div className="border-b border-hairline bg-clay/10 px-5 py-3">
          <div className="flex gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-clay" />
            <div className="min-w-0">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-clay">
                {response.isCorsLikely ? "Likely CORS / network error" : "Error"}
              </p>
              <p className="mt-1 font-sans text-sm leading-relaxed text-ink-soft">
                {response.error}
              </p>
              {response.isCorsLikely && (
                <p className="mt-2 font-sans text-xs leading-relaxed text-stone">
                  Browsers block cross-origin requests unless the server sends
                  permissive CORS headers. Try a permissive endpoint like{" "}
                  <span className="font-mono text-ink-soft">
                    https://httpbin.org/anything
                  </span>{" "}
                  to confirm the playground is wired correctly, or run your API
                  behind a proxy with <span className="font-mono text-ink-soft">Access-Control-Allow-Origin</span>.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-hairline bg-bone px-3">
        <TabBtn
          active={activeTab === "body"}
          onClick={() => onTabChange("body")}
          label="Body"
        />
        <TabBtn
          active={activeTab === "headers"}
          onClick={() => onTabChange("headers")}
          label="Headers"
          count={Object.keys(response.headers).length}
        />
        <TabBtn
          active={activeTab === "preview"}
          onClick={() => onTabChange("preview")}
          label="Preview"
        />
        <TabBtn
          active={activeTab === "timeline"}
          onClick={() => onTabChange("timeline")}
          label="Timeline"
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto bg-bone">
        {activeTab === "body" && <BodyView response={response} />}
        {activeTab === "headers" && <HeadersView headers={response.headers} />}
        {activeTab === "preview" && <PreviewView response={response} />}
        {activeTab === "timeline" && <TimelineView response={response} />}
      </div>
    </div>
  );
}

// ---------- pieces ----------

function LoadingState() {
  return (
    <div className="flex h-full min-h-[300px] items-center justify-center bg-bone p-8">
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center">
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-2 w-2 animate-pulse rounded-full bg-forest"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
        </div>
        <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.22em] text-stone">
          Awaiting response...
        </p>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full min-h-[300px] items-center justify-center bg-bone p-8">
      <div className="max-w-sm text-center">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-clay">
          Console
        </span>
        <p className="mt-3 font-display text-xl leading-tight tracking-tight text-ink">
          Nothing to read yet.
        </p>
        <p className="mt-3 font-sans text-sm leading-relaxed text-ink-soft">
          Hit <span className="font-mono text-ink">Send</span> (or{" "}
          <kbd className="rounded border border-hairline bg-paper px-1 py-0.5 font-mono text-[10px]">
            ⌘↵
          </kbd>
          ) and the response lands here. Body, headers, timeline — everything
          pretty-printed for you.
        </p>
      </div>
    </div>
  );
}

function StatusPill({
  status,
  statusText,
}: {
  status: number | null;
  statusText: string;
}) {
  if (status === null) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-clay/30 bg-clay/10 px-3 py-1 font-mono text-xs font-semibold tabular-nums text-clay">
        <span className="h-1.5 w-1.5 rounded-full bg-clay" />
        ERR · {statusText || "network"}
      </span>
    );
  }
  const color =
    status >= 500
      ? "border-[#7a1e1e]/30 bg-[#7a1e1e]/10 text-[#7a1e1e]"
      : status >= 400
        ? "border-clay/30 bg-clay/10 text-clay"
        : status >= 300
          ? "border-butter/40 bg-butter/25 text-[#7a5d18]"
          : "border-forest/25 bg-forest/10 text-forest";
  const dotColor =
    status >= 500
      ? "bg-[#7a1e1e]"
      : status >= 400
        ? "bg-clay"
        : status >= 300
          ? "bg-butter"
          : "bg-forest";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-xs font-semibold tabular-nums",
        color
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dotColor)} />
      {status} · {statusText || httpReason(status)}
    </span>
  );
}

function TabBtn({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count?: number;
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
      {count !== undefined && count > 0 && (
        <span
          className={cn(
            "inline-flex min-w-[16px] items-center justify-center rounded-full px-1 text-[9px] tabular-nums",
            active ? "bg-ink text-bone" : "bg-hairline text-ink-soft"
          )}
        >
          {count}
        </span>
      )}
      {active && <span className="absolute inset-x-2 bottom-0 h-[2px] bg-ink" />}
    </button>
  );
}

function BodyView({ response }: { response: ResponseSnapshot }) {
  const [raw, setRaw] = useState(false);
  const isJson = /application\/(.*\+)?json/i.test(response.contentType);
  const pretty = useMemo(() => {
    if (!isJson) return response.body;
    try {
      return JSON.stringify(JSON.parse(response.body), null, 2);
    } catch {
      return response.body;
    }
  }, [response.body, isJson]);

  const shown = raw || !isJson ? response.body : pretty;

  return (
    <div className="p-5">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
          {isJson ? "application/json" : response.contentType || "text"}
          {isJson && !raw && " · pretty"}
        </span>
        <div className="flex items-center gap-3">
          {isJson && (
            <button
              type="button"
              onClick={() => setRaw((r) => !r)}
              className="inline-flex items-center gap-1.5 border-b border-hairline pb-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft transition-colors hover:border-ink hover:text-ink"
            >
              {raw ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              {raw ? "Raw" : "Pretty"}
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(shown);
              toast.success("Copied");
            }}
            className="inline-flex items-center gap-1.5 border-b border-hairline pb-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft transition-colors hover:border-ink hover:text-ink"
          >
            <Copy className="h-3 w-3" />
            Copy
          </button>
        </div>
      </div>
      <div className="mt-3 overflow-hidden rounded border border-hairline bg-paper">
        <pre
          className="max-h-[560px] overflow-auto px-4 py-4 font-mono text-[12px] leading-[1.65] text-ink"
          style={{ whiteSpace: "pre" }}
        >
          {isJson && !raw ? (
            <JsonHighlight text={shown} />
          ) : (
            <span>{shown || <span className="italic text-stone">(empty body)</span>}</span>
          )}
        </pre>
      </div>
    </div>
  );
}

function HeadersView({ headers }: { headers: Record<string, string> }) {
  const entries = Object.entries(headers);
  return (
    <div className="p-5">
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
        {entries.length} header{entries.length === 1 ? "" : "s"}
      </span>
      <div className="mt-3 overflow-hidden rounded border border-hairline bg-paper">
        {entries.length === 0 && (
          <div className="px-4 py-6 text-center">
            <p className="font-mono text-[11px] italic text-stone">
              No headers surfaced. Browsers hide some headers for security.
            </p>
          </div>
        )}
        {entries.map(([k, v], i) => (
          <div
            key={`${k}-${i}`}
            className="grid grid-cols-[minmax(0,0.4fr)_minmax(0,0.6fr)] border-b border-hairline-soft last:border-b-0"
          >
            <span className="border-r border-hairline-soft px-3 py-2 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">
              {k}
            </span>
            <span className="break-all px-3 py-2 font-mono text-[11px] text-ink">
              {v}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PreviewView({ response }: { response: ResponseSnapshot }) {
  const isImage = /^image\//i.test(response.contentType);
  const isHtml = /^text\/html/i.test(response.contentType);
  const isJson = /application\/(.*\+)?json/i.test(response.contentType);

  // Attempt to extract image URL from JSON response (Dog CEO style)
  const jsonImgUrl = useMemo(() => {
    if (!isJson) return null;
    try {
      const parsed = JSON.parse(response.body);
      const candidates = [
        parsed?.message,
        parsed?.image,
        parsed?.url,
        parsed?.image_url,
      ];
      for (const c of candidates) {
        if (typeof c === "string" && /^https?:\/\/.+\.(png|jpg|jpeg|gif|webp|avif)/i.test(c)) {
          return c;
        }
      }
    } catch {}
    return null;
  }, [response.body, isJson]);

  if (isImage) {
    // Build a data URL-ish preview by using the body (text) — which likely won't work for binary.
    // Since fetch().text() for images returns garbled text, we won't render from body.
    return (
      <div className="p-5">
        <div className="rounded border border-dashed border-hairline bg-paper px-5 py-8 text-center">
          <ImageIcon className="mx-auto h-6 w-6 text-stone" />
          <p className="mt-3 font-mono text-[11px] italic text-stone">
            Binary images can&apos;t be re-rendered from the text body. Paste the
            URL into your browser to view.
          </p>
        </div>
      </div>
    );
  }

  if (jsonImgUrl) {
    return (
      <div className="p-5">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
          Detected image URL in response
        </span>
        <div className="mt-3 overflow-hidden rounded border border-hairline bg-paper p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={jsonImgUrl}
            alt="response preview"
            className="mx-auto max-h-[520px] max-w-full object-contain"
          />
        </div>
        <p className="mt-2 font-mono text-[11px] text-stone">{jsonImgUrl}</p>
      </div>
    );
  }

  if (isHtml) {
    // Sanitize: strip scripts and event handlers
    const sanitized = sanitizeHtml(response.body);
    return (
      <div className="p-5">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
          Sanitized HTML preview · scripts stripped
        </span>
        <div
          className="mt-3 overflow-auto rounded border border-hairline bg-paper p-4 font-sans text-sm text-ink"
          style={{ maxHeight: 560 }}
          dangerouslySetInnerHTML={{ __html: sanitized }}
        />
      </div>
    );
  }

  return (
    <div className="p-5">
      <div className="rounded border border-dashed border-hairline bg-paper px-5 py-8 text-center">
        <p className="font-mono text-[11px] italic text-stone">
          No rich preview for this content type. Switch to{" "}
          <span className="text-ink">Body</span> to inspect raw.
        </p>
      </div>
    </div>
  );
}

function TimelineView({ response }: { response: ResponseSnapshot }) {
  const startIso = new Date(response.startedAt).toISOString();
  const endIso = new Date(response.finishedAt).toISOString();
  return (
    <div className="p-5">
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
        Request timeline
      </span>
      <div className="mt-4 space-y-3">
        <TimelineRow
          label="Sent"
          value={formatLocalTime(response.startedAt)}
          sub={startIso}
          color="forest"
        />
        <TimelineRow
          label="Received"
          value={formatLocalTime(response.finishedAt)}
          sub={endIso}
          color="clay"
        />
        <div className="rounded border border-hairline bg-paper p-4">
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
              Elapsed
            </span>
            <span className="font-display text-[26px] leading-none tracking-tight tabular-nums text-ink">
              {response.durationMs}
              <span className="ml-1 font-mono text-xs text-stone">ms</span>
            </span>
          </div>
          <div className="relative mt-4 h-1 overflow-hidden rounded-full bg-hairline">
            <div
              className="absolute left-0 top-0 h-full bg-forest"
              style={{
                width: `${Math.min(100, Math.max(4, (response.durationMs / 2000) * 100))}%`,
              }}
            />
          </div>
          <p className="mt-2 font-mono text-[10px] text-stone">
            Relative to a 2000ms ceiling. Sub-500ms feels instant to a human.
          </p>
        </div>
      </div>
    </div>
  );
}

function TimelineRow({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub: string;
  color: "forest" | "clay";
}) {
  return (
    <div className="flex items-start gap-3 rounded border border-hairline bg-paper p-3">
      <Clock
        className={cn(
          "mt-0.5 h-4 w-4 flex-shrink-0",
          color === "forest" ? "text-forest" : "text-clay"
        )}
      />
      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone">
            {label}
          </span>
          <span className="font-mono text-[13px] tabular-nums text-ink">
            {value}
          </span>
        </div>
        <p className="mt-0.5 break-all font-mono text-[10px] text-stone">{sub}</p>
      </div>
    </div>
  );
}

// ---------- helpers ----------

function JsonHighlight({ text }: { text: string }) {
  // Very light syntax coloring. Regex-based, safe for display (text node).
  const tokens = useMemo(() => tokenizeJson(text), [text]);
  return (
    <>
      {tokens.map((t, i) => (
        <span key={i} className={t.className}>
          {t.value}
        </span>
      ))}
    </>
  );
}

type JsonToken = { value: string; className: string };

function tokenizeJson(text: string): JsonToken[] {
  const tokens: JsonToken[] = [];
  const re = /"(\\.|[^"\\])*"(\s*:)?|\b(true|false|null)\b|-?\d+(\.\d+)?([eE][+-]?\d+)?|[{}\[\],]|\s+/g;
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > lastIndex) {
      tokens.push({
        value: text.slice(lastIndex, m.index),
        className: "text-ink",
      });
    }
    const raw = m[0];
    let cls = "text-ink";
    if (/^"/.test(raw)) {
      // string literal (possibly followed by : for key)
      if (/:\s*$/.test(raw)) cls = "text-clay";
      else cls = "text-forest";
    } else if (/^(true|false|null)$/.test(raw)) {
      cls = "text-[#7a5d18] font-semibold";
    } else if (/^-?\d/.test(raw)) {
      cls = "text-[#7a1e1e]";
    } else if (/^[{}\[\],]$/.test(raw)) {
      cls = "text-stone";
    } else {
      cls = "text-ink";
    }
    tokens.push({ value: raw, className: cls });
    lastIndex = re.lastIndex;
  }
  if (lastIndex < text.length) {
    tokens.push({ value: text.slice(lastIndex), className: "text-ink" });
  }
  return tokens;
}

function sanitizeHtml(html: string): string {
  // Strip <script> blocks, <style> blocks, and event handler attrs.
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/\son\w+\s*=\s*"[^"]*"/gi, "")
    .replace(/\son\w+\s*=\s*'[^']*'/gi, "")
    .replace(/javascript:/gi, "");
}

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

function formatLocalTime(ts: number) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(new Date(ts));
  } catch {
    return String(ts);
  }
}

function httpReason(code: number) {
  const map: Record<number, string> = {
    200: "OK",
    201: "Created",
    202: "Accepted",
    204: "No content",
    301: "Moved",
    302: "Found",
    304: "Not modified",
    400: "Bad request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not found",
    409: "Conflict",
    422: "Unprocessable",
    429: "Too many requests",
    500: "Server error",
    502: "Bad gateway",
    503: "Unavailable",
    504: "Gateway timeout",
  };
  return map[code] || "";
}
