"use client";

import type React from "react";
import { cn } from "@/lib/cn";

/**
 * A lightweight markdown-ish renderer purpose-built for the newsletter demo.
 * Not general-purpose. Intentionally small.
 *
 * Supported block constructs:
 *   # / ## / ###   Heading levels
 *   >              Blockquote (single line)
 *   -              Bulleted list (contiguous lines)
 *   1. 2. 3.       Ordered list (contiguous)
 *   ```            Code fence (preformatted block)
 *   ---            Horizontal rule
 *
 * Supported inline constructs:
 *   **bold**
 *   *italic*
 *   `inline code`
 *   [text](url)
 *
 * The first paragraph in the document is rendered with a Fraunces drop-cap.
 */

type Variant = "reader" | "compact";

export function MarkdownRender({
  source,
  variant = "reader",
  className,
}: {
  source: string;
  variant?: Variant;
  className?: string;
}) {
  const blocks = parseBlocks(source);
  let paragraphSeen = 0;

  return (
    <div
      className={cn(
        variant === "reader"
          ? "font-display text-[17px] leading-[1.7] text-ink md:text-[18px]"
          : "font-display text-[15px] leading-[1.65] text-ink-soft",
        className,
      )}
    >
      {blocks.map((block, idx) => {
        switch (block.type) {
          case "h1":
            return (
              <h1
                key={idx}
                className={cn(
                  "font-display text-ink",
                  variant === "reader"
                    ? "mt-12 text-[30px] leading-[1.1] tracking-tight first:mt-0 md:text-[34px]"
                    : "mt-6 text-[22px] leading-[1.15] first:mt-0",
                )}
              >
                {renderInline(block.text)}
              </h1>
            );
          case "h2":
            return (
              <h2
                key={idx}
                className={cn(
                  "font-display text-ink",
                  variant === "reader"
                    ? "mt-10 text-[24px] italic leading-[1.15] tracking-tight first:mt-0 md:text-[28px]"
                    : "mt-5 text-[18px] italic leading-[1.2] first:mt-0",
                )}
              >
                {renderInline(block.text)}
              </h2>
            );
          case "h3":
            return (
              <h3
                key={idx}
                className={cn(
                  "font-display text-ink",
                  variant === "reader"
                    ? "mt-8 text-[20px] leading-[1.2] tracking-tight first:mt-0 md:text-[22px]"
                    : "mt-4 text-[16px] leading-[1.25] first:mt-0",
                )}
              >
                {renderInline(block.text)}
              </h3>
            );
          case "quote":
            return (
              <blockquote
                key={idx}
                className={cn(
                  "my-8 border-l-2 border-clay pl-5 font-display italic text-ink-soft",
                  variant === "reader"
                    ? "text-[19px] leading-[1.55] md:text-[21px]"
                    : "text-[16px] leading-[1.5]",
                )}
              >
                {renderInline(block.text)}
              </blockquote>
            );
          case "ul":
            return (
              <ul
                key={idx}
                className={cn(
                  "my-5 space-y-2 pl-5",
                  variant === "reader"
                    ? "text-[17px] leading-[1.7] md:text-[18px]"
                    : "text-[15px] leading-[1.6]",
                )}
              >
                {block.items.map((it, i) => (
                  <li
                    key={i}
                    className="relative list-none before:absolute before:-left-5 before:top-[0.65em] before:h-[3px] before:w-[10px] before:bg-ink"
                  >
                    {renderInline(it)}
                  </li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol
                key={idx}
                className={cn(
                  "my-5 space-y-2 pl-5",
                  variant === "reader"
                    ? "text-[17px] leading-[1.7] md:text-[18px]"
                    : "text-[15px] leading-[1.6]",
                )}
              >
                {block.items.map((it, i) => (
                  <li
                    key={i}
                    className="relative list-none pl-7"
                  >
                    <span className="absolute left-0 top-0 font-mono text-[12px] tracking-[0.1em] text-stone tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {renderInline(it)}
                  </li>
                ))}
              </ol>
            );
          case "code":
            return (
              <pre
                key={idx}
                className="my-6 overflow-x-auto rounded-sm border border-hairline bg-bone px-4 py-3 font-mono text-[13px] leading-[1.65] text-ink-soft"
              >
                <code>{block.text}</code>
              </pre>
            );
          case "hr":
            return (
              <div
                key={idx}
                className="my-10 flex items-center justify-center gap-3"
                aria-hidden
              >
                <span className="inline-block h-px w-20 bg-hairline" />
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone">
                  §
                </span>
                <span className="inline-block h-px w-20 bg-hairline" />
              </div>
            );
          case "p": {
            paragraphSeen += 1;
            const isFirst = paragraphSeen === 1 && variant === "reader";
            return (
              <p
                key={idx}
                className={cn(
                  variant === "reader"
                    ? "mt-5 text-[17px] leading-[1.7] text-ink first:mt-0 md:text-[18px]"
                    : "mt-3 text-[15px] leading-[1.65] text-ink-soft first:mt-0",
                  isFirst && "first-paragraph",
                )}
              >
                {isFirst
                  ? renderInlineWithDropCap(block.text)
                  : renderInline(block.text)}
              </p>
            );
          }
          default:
            return null;
        }
      })}
    </div>
  );
}

// ---------- Block parser ---------------------------------------------------

type Block =
  | { type: "h1"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "quote"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "p"; text: string }
  | { type: "code"; text: string }
  | { type: "hr" };

function parseBlocks(source: string): Block[] {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Skip blank lines between blocks
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Code fence
    if (line.startsWith("```")) {
      const start = i + 1;
      let end = start;
      while (end < lines.length && !lines[end].startsWith("```")) end++;
      blocks.push({ type: "code", text: lines.slice(start, end).join("\n") });
      i = end + 1;
      continue;
    }

    // Horizontal rule
    if (/^-{3,}\s*$/.test(line.trim())) {
      blocks.push({ type: "hr" });
      i++;
      continue;
    }

    // Headings
    if (line.startsWith("### ")) {
      blocks.push({ type: "h3", text: line.slice(4).trim() });
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      blocks.push({ type: "h2", text: line.slice(3).trim() });
      i++;
      continue;
    }
    if (line.startsWith("# ")) {
      blocks.push({ type: "h1", text: line.slice(2).trim() });
      i++;
      continue;
    }

    // Blockquote (single line; can be multi-line but here collapse contiguous)
    if (line.startsWith(">")) {
      const lines2: string[] = [];
      while (i < lines.length && lines[i].startsWith(">")) {
        lines2.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      blocks.push({ type: "quote", text: lines2.join(" ") });
      continue;
    }

    // Unordered list
    if (/^-\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^-\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^-\s+/, ""));
        i++;
      }
      blocks.push({ type: "ul", items });
      continue;
    }

    // Ordered list
    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s+/, ""));
        i++;
      }
      blocks.push({ type: "ol", items });
      continue;
    }

    // Paragraph: collect contiguous non-blank lines
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].startsWith("#") &&
      !lines[i].startsWith(">") &&
      !lines[i].startsWith("```") &&
      !/^-\s+/.test(lines[i]) &&
      !/^\d+\.\s+/.test(lines[i]) &&
      !/^-{3,}\s*$/.test(lines[i].trim())
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length) {
      blocks.push({ type: "p", text: paraLines.join(" ") });
    }
  }

  return blocks;
}

// ---------- Inline parser --------------------------------------------------

type Inline =
  | { type: "text"; text: string }
  | { type: "bold"; children: Inline[] }
  | { type: "italic"; children: Inline[] }
  | { type: "code"; text: string }
  | { type: "link"; text: string; href: string };

// Tokenize a string using a single-pass regex over the supported patterns.
function parseInline(source: string): Inline[] {
  // Order matters: bold before italic so **x** doesn't get eaten first by italic.
  const pattern =
    /(\*\*([^*]+)\*\*)|(\*([^*]+)\*)|(`([^`]+)`)|(\[([^\]]+)\]\(([^)]+)\))/g;
  const out: Inline[] = [];
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = pattern.exec(source))) {
    if (m.index > lastIndex) {
      out.push({ type: "text", text: source.slice(lastIndex, m.index) });
    }
    if (m[1]) {
      out.push({ type: "bold", children: parseInline(m[2]) });
    } else if (m[3]) {
      out.push({ type: "italic", children: parseInline(m[4]) });
    } else if (m[5]) {
      out.push({ type: "code", text: m[6] });
    } else if (m[7]) {
      out.push({ type: "link", text: m[8], href: m[9] });
    }
    lastIndex = pattern.lastIndex;
  }
  if (lastIndex < source.length) {
    out.push({ type: "text", text: source.slice(lastIndex) });
  }
  return out;
}

function renderInline(source: string): React.ReactNode {
  return renderInlineNodes(parseInline(source));
}

function renderInlineNodes(nodes: Inline[]): React.ReactNode {
  return nodes.map((n, i) => {
    switch (n.type) {
      case "text":
        return <span key={i}>{n.text}</span>;
      case "bold":
        return (
          <strong key={i} className="font-display font-semibold text-ink">
            {renderInlineNodes(n.children)}
          </strong>
        );
      case "italic":
        return (
          <em key={i} className="italic">
            {renderInlineNodes(n.children)}
          </em>
        );
      case "code":
        return (
          <code
            key={i}
            className="rounded-sm bg-bone px-1.5 py-0.5 font-mono text-[0.85em] text-clay"
          >
            {n.text}
          </code>
        );
      case "link":
        return (
          <a
            key={i}
            href={n.href}
            className="border-b border-forest/40 text-forest transition-colors hover:border-forest hover:text-forest-soft"
            target={n.href.startsWith("http") ? "_blank" : undefined}
            rel={n.href.startsWith("http") ? "noopener noreferrer" : undefined}
          >
            {n.text}
          </a>
        );
      default:
        return null;
    }
  });
}

// First paragraph drop cap — the first letter of the first text node gets
// a Fraunces uppercase display treatment.
function renderInlineWithDropCap(source: string): React.ReactNode {
  const nodes = parseInline(source);
  if (!nodes.length) return null;
  const [first, ...rest] = nodes;
  if (first.type !== "text" || first.text.length === 0) {
    return renderInlineNodes(nodes);
  }
  const cap = first.text[0];
  const tail = first.text.slice(1);
  return (
    <>
      <span
        aria-hidden
        className="float-left mr-3 mt-[0.1em] font-display text-[72px] leading-[0.85] text-clay md:text-[88px]"
        style={{ fontWeight: 500 }}
      >
        {cap}
      </span>
      <span className="font-display">{tail}</span>
      {renderInlineNodes(rest)}
    </>
  );
}
