"use client";

import { cn } from "@/lib/cn";
import type { TypingIndicator } from "@/lib/data/chatbot-scripts";

/* ----------------------------- shared types ----------------------------- */

export type ThemeId = "editorial" | "terminal" | "soft" | "classic" | "minimalist";
export type BubbleStyle = "rounded" | "square" | "pill" | "none";
export type AvatarStyle = "initials" | "emoji" | "geo" | "none";
export type Density = "compact" | "normal" | "roomy";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  /** partial streaming copy if mid-stream */
  streaming?: boolean;
};

export type ThemeConfig = {
  theme: ThemeId;
  accent: string;
  density: Density;
  bubble: BubbleStyle;
  avatar: AvatarStyle;
  typing: TypingIndicator;
  userName: string;
  aiName: string;
};

export type ThemeMeta = {
  id: ThemeId;
  name: string;
  tagline: string;
  swatch: { base: string; ink: string; accent: string };
};

export const THEMES: ThemeMeta[] = [
  {
    id: "editorial",
    name: "Editorial",
    tagline: "Paper · ink · hairlines",
    swatch: { base: "#FAF6ED", ink: "#1C1C1A", accent: "#C85A3F" },
  },
  {
    id: "terminal",
    name: "Terminal",
    tagline: "Ink ground · mono · cursor",
    swatch: { base: "#0C0D0B", ink: "#E9E7DD", accent: "#8BC480" },
  },
  {
    id: "soft",
    name: "Soft",
    tagline: "Pastel tints · illustrated",
    swatch: { base: "#F4EDDE", ink: "#2E2B25", accent: "#E8C77F" },
  },
  {
    id: "classic",
    name: "Classic chat",
    tagline: "iMessage rhythm · bubbles",
    swatch: { base: "#F5F1E8", ink: "#1C1C1A", accent: "#1F3A2F" },
  },
  {
    id: "minimalist",
    name: "Minimalist",
    tagline: "Typography only",
    swatch: { base: "#FFFBF2", ink: "#1C1C1A", accent: "#8F8B80" },
  },
];

/* ----------------------------- density helpers ----------------------------- */

const DENSITY_GAP: Record<Density, string> = {
  compact: "gap-3",
  normal: "gap-5",
  roomy: "gap-8",
};

const DENSITY_PAD_X: Record<Density, string> = {
  compact: "px-4",
  normal: "px-6",
  roomy: "px-8",
};

const DENSITY_PAD_Y: Record<Density, string> = {
  compact: "py-4",
  normal: "py-6",
  roomy: "py-10",
};

/* ----------------------------- avatars ----------------------------- */

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
}

function Avatar({
  style,
  role,
  name,
  accent,
  variant,
}: {
  style: AvatarStyle;
  role: "user" | "assistant";
  name: string;
  accent: string;
  variant: "light" | "dark" | "soft";
}) {
  if (style === "none") return null;

  const base =
    "flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden font-mono text-[10px] font-medium";

  if (style === "initials") {
    if (variant === "dark") {
      return (
        <div
          className={cn(base, "rounded-full border border-white/15 bg-white/5")}
          style={{ color: role === "user" ? accent : "rgba(233,231,221,0.9)" }}
        >
          {initialsFor(name)}
        </div>
      );
    }
    if (variant === "soft") {
      return (
        <div
          className={cn(base, "rounded-full")}
          style={{
            background: role === "user" ? accent : "rgba(255,255,255,0.6)",
            color: role === "user" ? "#1c1c1a" : "#2e2b25",
          }}
        >
          {initialsFor(name)}
        </div>
      );
    }
    return (
      <div
        className={cn(base, "rounded-full border border-hairline bg-bone text-ink")}
        style={role === "user" ? { background: accent, color: "#faf6ed", borderColor: accent } : {}}
      >
        {initialsFor(name)}
      </div>
    );
  }

  if (style === "emoji") {
    const emoji = role === "user" ? "🧑" : "✨";
    return (
      <div
        className={cn(
          base,
          "rounded-full text-base",
          variant === "dark" ? "bg-white/5" : "bg-white/60",
        )}
      >
        {emoji}
      </div>
    );
  }

  // geo — generated geometric avatar based on name hash
  const seed = [...name].reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) >>> 0, 7);
  const shapes = ["circle", "triangle", "square"] as const;
  const shape = shapes[seed % shapes.length]!;
  const bgHue = (seed * 37) % 360;
  const fgHue = (seed * 61 + 180) % 360;
  const bg = `hsl(${bgHue}, 32%, ${variant === "dark" ? "22%" : "82%"})`;
  const fg = `hsl(${fgHue}, 46%, ${variant === "dark" ? "75%" : "28%"})`;

  return (
    <div
      className={cn(base, "rounded-full")}
      style={{ background: role === "user" ? accent : bg }}
    >
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
        {shape === "circle" && <circle cx="12" cy="12" r="6" fill={fg} />}
        {shape === "triangle" && <polygon points="12,5 19,19 5,19" fill={fg} />}
        {shape === "square" && <rect x="7" y="7" width="10" height="10" fill={fg} />}
      </svg>
    </div>
  );
}

/* ----------------------------- markdown-lite renderer ----------------------------- */

export function renderInline(text: string): React.ReactNode[] {
  // handle **bold**, *italic*, `code`, links [a](b)
  const nodes: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  const patterns: {
    re: RegExp;
    render: (m: RegExpMatchArray) => React.ReactNode;
  }[] = [
    {
      re: /\*\*([^*]+)\*\*/,
      render: (m) => <strong key={key++}>{m[1]}</strong>,
    },
    {
      re: /`([^`]+)`/,
      render: (m) => (
        <code
          key={key++}
          className="rounded bg-black/5 px-1 py-0.5 font-mono text-[0.9em]"
        >
          {m[1]}
        </code>
      ),
    },
    {
      re: /\*([^*]+)\*/,
      render: (m) => <em key={key++}>{m[1]}</em>,
    },
    {
      re: /\[([^\]]+)\]\(([^)]+)\)/,
      render: (m) => (
        <a
          key={key++}
          href={m[2]!}
          className="underline underline-offset-2"
          target="_blank"
          rel="noreferrer"
        >
          {m[1]}
        </a>
      ),
    },
  ];

  while (remaining.length > 0) {
    let earliest: { idx: number; render: React.ReactNode; consumed: number } | null = null;
    for (const p of patterns) {
      const match = remaining.match(p.re);
      if (match && match.index !== undefined) {
        if (earliest === null || match.index < earliest.idx) {
          earliest = {
            idx: match.index,
            render: p.render(match),
            consumed: match.index + match[0].length,
          };
        }
      }
    }
    if (earliest === null) {
      nodes.push(remaining);
      break;
    }
    if (earliest.idx > 0) nodes.push(remaining.slice(0, earliest.idx));
    nodes.push(earliest.render);
    remaining = remaining.slice(earliest.consumed);
  }
  return nodes;
}

function renderBlocks(content: string): React.ReactNode {
  // split into paragraphs and detect code blocks and ordered/unordered lists
  const blocks: React.ReactNode[] = [];
  const parts = content.split(/```(\w*)\n?([\s\S]*?)```/g);
  // parts: text, lang, code, text, lang, code, ...
  for (let i = 0; i < parts.length; i++) {
    if (i % 3 === 0) {
      const textChunk = parts[i];
      if (!textChunk) continue;
      const paragraphs = textChunk.split(/\n\n+/);
      for (let pi = 0; pi < paragraphs.length; pi++) {
        const para = paragraphs[pi]!.trim();
        if (!para) continue;
        const lines = para.split("\n");
        const isOrdered = lines.every((l) => /^\s*\d+\.\s/.test(l));
        const isBullet = lines.every((l) => /^\s*[-*]\s/.test(l));
        if (isOrdered) {
          blocks.push(
            <ol
              key={`ol-${i}-${pi}`}
              className="list-decimal space-y-1 pl-5"
            >
              {lines.map((l, li) => (
                <li key={li}>{renderInline(l.replace(/^\s*\d+\.\s/, ""))}</li>
              ))}
            </ol>,
          );
        } else if (isBullet) {
          blocks.push(
            <ul
              key={`ul-${i}-${pi}`}
              className="list-disc space-y-1 pl-5"
            >
              {lines.map((l, li) => (
                <li key={li}>{renderInline(l.replace(/^\s*[-*]\s/, ""))}</li>
              ))}
            </ul>,
          );
        } else if (para.startsWith("> ")) {
          blocks.push(
            <blockquote
              key={`bq-${i}-${pi}`}
              className="border-l-2 pl-3 italic opacity-90"
              style={{ borderColor: "currentcolor" }}
            >
              {renderInline(para.replace(/^>\s?/gm, ""))}
            </blockquote>,
          );
        } else {
          blocks.push(<p key={`p-${i}-${pi}`}>{renderInline(para)}</p>);
        }
      }
    } else if (i % 3 === 2) {
      const lang = parts[i - 1] || "";
      const code = parts[i]!;
      blocks.push(
        <CodeBlock key={`code-${i}`} code={code.replace(/\n$/, "")} language={lang} />,
      );
    }
  }
  return <div className="space-y-3">{blocks}</div>;
}

function CodeBlock({ code, language }: { code: string; language?: string }) {
  // lightweight pseudo-syntax coloring: tokens using regex highlighting
  const highlighted = highlightCode(code);
  return (
    <div className="overflow-hidden rounded-md border border-current/10 bg-black/[0.04]">
      <div className="flex items-center justify-between border-b border-current/10 px-3 py-1.5">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-60">
          {language || "code"}
        </span>
        <span className="font-mono text-[10px] opacity-40">—</span>
      </div>
      <pre className="overflow-x-auto px-3 py-3 font-mono text-[12.5px] leading-relaxed">
        <code>{highlighted}</code>
      </pre>
    </div>
  );
}

function highlightCode(code: string): React.ReactNode[] {
  // very simple tokenizer for keywords / strings / comments / numbers
  const tokens: React.ReactNode[] = [];
  const re =
    /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|(['"`])((?:\\.|(?!\2).)*?)\2|\b(const|let|var|function|return|if|else|for|while|import|from|export|default|async|await|class|extends|new|typeof|in|of)\b|\b(\d+(?:\.\d+)?)\b/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(code)) !== null) {
    if (m.index > last) tokens.push(code.slice(last, m.index));
    if (m[1]) {
      tokens.push(
        <span key={k++} className="opacity-55 italic">
          {m[0]}
        </span>,
      );
    } else if (m[2]) {
      tokens.push(
        <span key={k++} style={{ color: "#8BA374" }}>
          {m[0]}
        </span>,
      );
    } else if (m[4]) {
      tokens.push(
        <span key={k++} style={{ color: "#C85A3F" }}>
          {m[0]}
        </span>,
      );
    } else if (m[5]) {
      tokens.push(
        <span key={k++} style={{ color: "#B07A36" }}>
          {m[0]}
        </span>,
      );
    } else {
      tokens.push(m[0]);
    }
    last = m.index + m[0].length;
  }
  if (last < code.length) tokens.push(code.slice(last));
  return tokens;
}

/* ----------------------------- typing indicator ----------------------------- */

export function TypingDot({
  kind,
  dark,
  accent,
}: {
  kind: TypingIndicator;
  dark?: boolean;
  accent: string;
}) {
  const color = dark ? "rgba(233,231,221,0.6)" : "rgba(28,28,26,0.55)";
  if (kind === "cursor") {
    return (
      <span
        className="inline-block h-[1em] w-[0.5ch] translate-y-[2px] animate-pulse"
        style={{ background: dark ? accent : "currentColor" }}
      />
    );
  }
  if (kind === "wave") {
    return (
      <span className="inline-flex items-end gap-[3px]">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="block w-[2px]"
            style={{
              background: color,
              height: "8px",
              animation: `cbui-wave 900ms ease-in-out ${i * 100}ms infinite`,
            }}
          />
        ))}
      </span>
    );
  }
  if (kind === "pulse") {
    return (
      <span
        className="inline-block h-2 w-2 rounded-full"
        style={{ background: color, animation: "cbui-pulse 900ms ease-in-out infinite" }}
      />
    );
  }
  // dots default
  return (
    <span className="inline-flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="block h-1.5 w-1.5 rounded-full"
          style={{
            background: color,
            animation: `cbui-dot 1.1s ease-in-out ${i * 140}ms infinite`,
          }}
        />
      ))}
    </span>
  );
}

export function TypingKeyframes() {
  return (
    <style>{`
      @keyframes cbui-dot {
        0%,80%,100% { transform: translateY(0); opacity: 0.35; }
        40% { transform: translateY(-3px); opacity: 1; }
      }
      @keyframes cbui-wave {
        0%,100% { height: 4px; }
        50% { height: 14px; }
      }
      @keyframes cbui-pulse {
        0%,100% { transform: scale(1); opacity: 0.5; }
        50% { transform: scale(1.4); opacity: 1; }
      }
      @keyframes cbui-cursor-blink {
        0%,49% { opacity: 1; }
        50%,100% { opacity: 0; }
      }
    `}</style>
  );
}

/* ----------------------------- bubble radius ----------------------------- */

function bubbleRadius(bubble: BubbleStyle, role: "user" | "assistant"): string {
  switch (bubble) {
    case "rounded":
      return role === "user"
        ? "rounded-2xl rounded-br-md"
        : "rounded-2xl rounded-bl-md";
    case "square":
      return "rounded-none";
    case "pill":
      return "rounded-full";
    case "none":
      return "rounded-none";
  }
}

/* ===================================================================== */
/*                       THEME RENDERERS                                 */
/* ===================================================================== */

export function ThemeFrame({
  theme,
  children,
  phoneFrame,
}: {
  theme: ThemeId;
  children: React.ReactNode;
  phoneFrame: boolean;
}) {
  const outer =
    "relative flex w-full flex-col overflow-hidden transition-colors";

  const bg =
    theme === "terminal"
      ? "bg-[#0C0D0B]"
      : theme === "soft"
        ? "bg-[#F4EDDE]"
        : theme === "minimalist"
          ? "bg-[#FFFBF2]"
          : theme === "editorial"
            ? "bg-[#FAF6ED]"
            : "bg-[#F5F1E8]";

  return (
    <div
      className={cn(
        outer,
        bg,
        phoneFrame
          ? "mx-auto h-[640px] max-w-[380px] rounded-[2rem] border-[10px] border-ink shadow-warm-xl"
          : "h-[640px] rounded-xl border border-hairline shadow-warm-md",
      )}
    >
      {children}
    </div>
  );
}

export function ChatHeader({
  theme,
  aiName,
  accent,
}: {
  theme: ThemeId;
  aiName: string;
  accent: string;
}) {
  if (theme === "terminal") {
    return (
      <div className="flex items-center justify-between border-b border-white/10 bg-[#0C0D0B] px-4 py-2.5 font-mono text-[11px] text-[#B8B5A7]">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: accent }} />
          <span>/session/{aiName.toLowerCase().replace(/\s+/g, "-")}</span>
        </div>
        <span className="opacity-60">v1.0 · mock</span>
      </div>
    );
  }
  if (theme === "editorial") {
    return (
      <div className="flex items-baseline justify-between border-b border-hairline px-6 py-3">
        <div>
          <div className="font-mono text-[9px] uppercase tracking-[0.28em] text-stone">
            Dispatch · N°028
          </div>
          <div className="mt-0.5 font-display text-lg tracking-tight text-ink">{aiName}</div>
        </div>
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
          Thursday
        </div>
      </div>
    );
  }
  if (theme === "soft") {
    return (
      <div
        className="flex items-center gap-3 px-4 py-3"
        style={{
          background:
            "linear-gradient(180deg, rgba(232,199,127,0.25) 0%, rgba(244,237,222,0) 100%)",
        }}
      >
        <div
          className="flex h-9 w-9 items-center justify-center rounded-full text-lg"
          style={{ background: accent, color: "#1c1c1a" }}
        >
          ✿
        </div>
        <div>
          <div className="font-display text-base leading-tight text-[#2e2b25]">{aiName}</div>
          <div className="flex items-center gap-1.5 font-sans text-[11px] text-[#6f6a5e]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#7c9c7e]" />
            online
          </div>
        </div>
      </div>
    );
  }
  if (theme === "classic") {
    return (
      <div className="flex items-center justify-between border-b border-hairline bg-bone px-4 py-2.5">
        <button className="font-sans text-[13px]" style={{ color: accent }}>
          ‹ Back
        </button>
        <div className="text-center">
          <div className="font-sans text-[13px] font-medium text-ink">{aiName}</div>
          <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-stone">
            active now
          </div>
        </div>
        <div className="font-sans text-[13px]" style={{ color: accent }}>
          ⓘ
        </div>
      </div>
    );
  }
  // minimalist
  return (
    <div className="flex items-center justify-between px-6 py-4">
      <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-stone">
        {aiName}
      </div>
      <div className="h-[1px] w-16" style={{ background: accent, opacity: 0.6 }} />
    </div>
  );
}

export function ChatInput({
  theme,
  accent,
  disabled,
}: {
  theme: ThemeId;
  accent: string;
  disabled?: boolean;
}) {
  if (theme === "terminal") {
    return (
      <div className="flex items-center gap-2 border-t border-white/10 bg-[#0C0D0B] px-4 py-3 font-mono text-[13px] text-[#E9E7DD]">
        <span style={{ color: accent }}>$</span>
        <input
          disabled
          placeholder="message…"
          className="min-w-0 flex-1 border-0 bg-transparent text-[13px] placeholder:text-white/30 focus:outline-none"
        />
        <span
          className="inline-block h-[14px] w-[7px]"
          style={{
            background: accent,
            animation: "cbui-cursor-blink 1s steps(1) infinite",
          }}
        />
      </div>
    );
  }
  if (theme === "editorial") {
    return (
      <div className="border-t border-hairline px-6 py-4">
        <div className="flex items-end gap-3">
          <textarea
            disabled={disabled}
            placeholder="Reply with care…"
            rows={1}
            className="min-h-[36px] min-w-0 flex-1 resize-none border-0 border-b border-hairline bg-transparent py-1 font-sans text-[14px] leading-relaxed text-ink placeholder:italic placeholder:text-stone focus:border-ink focus:outline-none"
          />
          <button
            className="font-mono text-[10px] uppercase tracking-[0.24em]"
            style={{ color: accent }}
          >
            Send ↵
          </button>
        </div>
      </div>
    );
  }
  if (theme === "soft") {
    return (
      <div className="border-t border-[#e5dcc4] px-3 py-3">
        <div
          className="flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 shadow-sm"
          style={{ boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.04)" }}
        >
          <input
            disabled={disabled}
            placeholder="Say something nice"
            className="min-w-0 flex-1 border-0 bg-transparent text-[14px] text-[#2e2b25] placeholder:text-[#a79e8b] focus:outline-none"
          />
          <button
            className="flex h-8 w-8 items-center justify-center rounded-full text-sm text-[#1c1c1a]"
            style={{ background: accent }}
          >
            →
          </button>
        </div>
      </div>
    );
  }
  if (theme === "classic") {
    return (
      <div className="border-t border-hairline bg-bone px-3 py-2.5">
        <div className="flex items-center gap-2 rounded-full border border-hairline bg-white px-4 py-1.5">
          <input
            disabled={disabled}
            placeholder="Message"
            className="min-w-0 flex-1 border-0 bg-transparent text-[14px] text-ink placeholder:text-stone focus:outline-none"
          />
          <button
            className="flex h-7 w-7 items-center justify-center rounded-full text-sm text-bone"
            style={{ background: accent }}
          >
            ↑
          </button>
        </div>
      </div>
    );
  }
  // minimalist
  return (
    <div className="px-6 py-5">
      <div className="flex items-center gap-4 border-t border-hairline pt-4">
        <input
          disabled={disabled}
          placeholder="Type a reply"
          className="min-w-0 flex-1 border-0 bg-transparent text-[14px] text-ink placeholder:text-stone focus:outline-none"
        />
        <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-stone">
          ⏎
        </span>
      </div>
    </div>
  );
}

/* ----------------------------- message renderers ----------------------------- */

type MessageProps = {
  msg: ChatMessage;
  cfg: ThemeConfig;
};

export function ThemeMessageList({
  messages,
  cfg,
}: {
  messages: ChatMessage[];
  cfg: ThemeConfig;
}) {
  const gap = DENSITY_GAP[cfg.density];
  const padX = DENSITY_PAD_X[cfg.density];
  const padY = DENSITY_PAD_Y[cfg.density];

  if (cfg.theme === "editorial") {
    return (
      <div className={cn("flex flex-col", gap, padX, padY, "overflow-y-auto")}>
        {messages.map((m, i) => (
          <EditorialMessage key={m.id} msg={m} cfg={cfg} index={i} />
        ))}
      </div>
    );
  }
  if (cfg.theme === "terminal") {
    return (
      <div
        className={cn(
          "flex flex-col overflow-y-auto px-4 py-4 font-mono text-[13px] leading-relaxed",
          cfg.density === "compact" && "gap-2",
          cfg.density === "normal" && "gap-3",
          cfg.density === "roomy" && "gap-5",
        )}
      >
        {messages.map((m) => (
          <TerminalMessage key={m.id} msg={m} cfg={cfg} />
        ))}
      </div>
    );
  }
  if (cfg.theme === "soft") {
    return (
      <div className={cn("flex flex-col overflow-y-auto", gap, padX, padY)}>
        {messages.map((m) => (
          <SoftMessage key={m.id} msg={m} cfg={cfg} />
        ))}
      </div>
    );
  }
  if (cfg.theme === "classic") {
    return (
      <div
        className={cn(
          "flex flex-col overflow-y-auto",
          cfg.density === "compact" && "gap-1.5 px-3 py-3",
          cfg.density === "normal" && "gap-2.5 px-3 py-4",
          cfg.density === "roomy" && "gap-4 px-4 py-6",
        )}
      >
        {messages.map((m, i) => {
          const prev = messages[i - 1];
          const groupStart = !prev || prev.role !== m.role;
          return <ClassicMessage key={m.id} msg={m} cfg={cfg} groupStart={groupStart} />;
        })}
      </div>
    );
  }
  // minimalist
  return (
    <div
      className={cn(
        "flex flex-col overflow-y-auto",
        cfg.density === "compact" && "gap-4 px-6 py-6",
        cfg.density === "normal" && "gap-7 px-8 py-8",
        cfg.density === "roomy" && "gap-12 px-10 py-12",
      )}
    >
      {messages.map((m) => (
        <MinimalistMessage key={m.id} msg={m} cfg={cfg} />
      ))}
    </div>
  );
}

/* ---- Editorial ---- */
function EditorialMessage({ msg, cfg, index }: MessageProps & { index: number }) {
  const isUser = msg.role === "user";
  return (
    <div
      className={cn(
        "relative",
        index > 0 && "border-t border-hairline-soft pt-4",
      )}
    >
      <div className="mb-1 flex items-baseline gap-3">
        <span
          className="font-mono text-[9px] uppercase tracking-[0.28em]"
          style={{ color: isUser ? cfg.accent : "#8F8B80" }}
        >
          {isUser ? cfg.userName : cfg.aiName}
        </span>
        <span className="font-display text-[11px] italic text-stone">
          line {String(index + 1).padStart(2, "0")}
        </span>
      </div>
      <div
        className={cn(
          "min-w-0 max-w-prose text-[15px] leading-relaxed text-ink",
          isUser && "border-l-2 pl-3",
        )}
        style={isUser ? { borderColor: cfg.accent } : {}}
      >
        {renderBlocks(msg.content)}
        {msg.streaming && (
          <span
            className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[3px]"
            style={{ background: cfg.accent, animation: "cbui-cursor-blink 1s steps(1) infinite" }}
          />
        )}
      </div>
    </div>
  );
}

/* ---- Terminal ---- */
function TerminalMessage({ msg, cfg }: MessageProps) {
  const isUser = msg.role === "user";
  const color = isUser ? "#8BC480" : "#D3CFC0";
  const prefix = isUser ? `${cfg.userName} ›` : `${cfg.aiName} ‹`;
  return (
    <div className="min-w-0 flex gap-2">
      <span className="shrink-0" style={{ color: cfg.accent }}>
        {prefix}
      </span>
      <div className="min-w-0 flex-1 whitespace-pre-wrap" style={{ color }}>
        {renderBlocks(msg.content)}
        {msg.streaming && (
          <span
            className="ml-[1px] inline-block h-[1em] w-[8px] translate-y-[2px]"
            style={{
              background: cfg.accent,
              animation: "cbui-cursor-blink 0.9s steps(1) infinite",
            }}
          />
        )}
      </div>
    </div>
  );
}

/* ---- Soft ---- */
function SoftMessage({ msg, cfg }: MessageProps) {
  const isUser = msg.role === "user";
  const radius = bubbleRadius(cfg.bubble, msg.role);

  const userBg = cfg.accent;
  const aiBg = "rgba(255,255,255,0.75)";

  return (
    <div className={cn("flex items-end gap-2.5", isUser && "flex-row-reverse")}>
      <Avatar
        style={cfg.avatar}
        role={msg.role}
        name={isUser ? cfg.userName : cfg.aiName}
        accent={cfg.accent}
        variant="soft"
      />
      <div
        className={cn(
          "min-w-0 max-w-[80%] px-4 py-2.5 text-[15px] leading-relaxed shadow-sm",
          radius,
          cfg.bubble === "pill" ? "px-5 py-3" : "",
        )}
        style={{
          background: isUser ? userBg : aiBg,
          color: isUser ? "#1c1c1a" : "#2e2b25",
          boxShadow: "0 1px 2px rgba(0,0,0,0.04), inset 0 0 0 1px rgba(0,0,0,0.03)",
        }}
      >
        {renderBlocks(msg.content)}
        {msg.streaming && (
          <span className="ml-1 inline-block align-middle">
            <TypingDot kind={cfg.typing} accent={cfg.accent} />
          </span>
        )}
      </div>
    </div>
  );
}

/* ---- Classic ---- */
function ClassicMessage({
  msg,
  cfg,
  groupStart,
}: MessageProps & { groupStart: boolean }) {
  const isUser = msg.role === "user";
  const radius = bubbleRadius(cfg.bubble, msg.role);

  return (
    <div className={cn("flex items-end gap-2", isUser && "flex-row-reverse")}>
      <div className={cn("w-8 shrink-0", !groupStart && "invisible")}>
        <Avatar
          style={cfg.avatar}
          role={msg.role}
          name={isUser ? cfg.userName : cfg.aiName}
          accent={cfg.accent}
          variant="light"
        />
      </div>
      <div
        className={cn(
          "min-w-0 max-w-[72%] text-[15px] leading-relaxed",
          cfg.bubble === "none"
            ? ""
            : cn(
                "px-3.5 py-2",
                radius,
                isUser
                  ? "text-bone"
                  : "border border-hairline bg-bone text-ink",
              ),
        )}
        style={
          cfg.bubble === "none"
            ? { color: isUser ? cfg.accent : "#1c1c1a" }
            : isUser
              ? { background: cfg.accent }
              : {}
        }
      >
        {renderBlocks(msg.content)}
        {msg.streaming && (
          <span className="ml-1 inline-block align-middle">
            <TypingDot kind={cfg.typing} accent={isUser ? "#faf6ed" : cfg.accent} />
          </span>
        )}
      </div>
    </div>
  );
}

/* ---- Minimalist ---- */
function MinimalistMessage({ msg, cfg }: MessageProps) {
  const isUser = msg.role === "user";
  return (
    <div className="min-w-0">
      <div
        className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.28em]"
        style={{ color: isUser ? cfg.accent : "#8F8B80" }}
      >
        {isUser ? cfg.userName : cfg.aiName}
      </div>
      <div className="min-w-0 max-w-prose text-[15px] leading-relaxed text-ink">
        {renderBlocks(msg.content)}
        {msg.streaming && (
          <span
            className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[3px]"
            style={{ background: cfg.accent, animation: "cbui-cursor-blink 1s steps(1) infinite" }}
          />
        )}
      </div>
    </div>
  );
}

/* ----------------------------- typing row (between turns) ----------------------------- */

export function TypingRow({ cfg }: { cfg: ThemeConfig }) {
  if (cfg.theme === "terminal") {
    return (
      <div className="min-w-0 flex gap-2 px-4 font-mono text-[13px]">
        <span style={{ color: cfg.accent }}>{cfg.aiName} ‹</span>
        <span className="text-[#8BA37C]">
          <TypingDot kind={cfg.typing} dark accent={cfg.accent} />
        </span>
      </div>
    );
  }
  if (cfg.theme === "editorial") {
    return (
      <div className="px-6">
        <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-stone">
          {cfg.aiName} is writing
        </span>
        <span className="ml-2 inline-block align-middle">
          <TypingDot kind={cfg.typing} accent={cfg.accent} />
        </span>
      </div>
    );
  }
  if (cfg.theme === "soft") {
    return (
      <div className="flex items-end gap-2.5 px-6">
        <Avatar
          style={cfg.avatar}
          role="assistant"
          name={cfg.aiName}
          accent={cfg.accent}
          variant="soft"
        />
        <div
          className="rounded-2xl rounded-bl-md bg-white/80 px-4 py-3 shadow-sm"
          style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.04), inset 0 0 0 1px rgba(0,0,0,0.03)" }}
        >
          <TypingDot kind={cfg.typing} accent={cfg.accent} />
        </div>
      </div>
    );
  }
  if (cfg.theme === "classic") {
    return (
      <div className="flex items-end gap-2 px-3">
        <Avatar
          style={cfg.avatar}
          role="assistant"
          name={cfg.aiName}
          accent={cfg.accent}
          variant="light"
        />
        <div className="rounded-2xl rounded-bl-md border border-hairline bg-bone px-3 py-2">
          <TypingDot kind={cfg.typing} accent={cfg.accent} />
        </div>
      </div>
    );
  }
  return (
    <div className="px-8">
      <div
        className="font-mono text-[10px] uppercase tracking-[0.28em]"
        style={{ color: "#8F8B80" }}
      >
        {cfg.aiName}
      </div>
      <div className="mt-1">
        <TypingDot kind={cfg.typing} accent={cfg.accent} />
      </div>
    </div>
  );
}
