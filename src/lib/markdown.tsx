import { Marked } from "marked";
import type { CSSProperties } from "react";

/**
 * Converts single newlines to markdown hard breaks (two trailing spaces + newline)
 * while preserving double newlines as paragraph breaks. Runs of 3+ newlines produce
 * extra `&nbsp;` paragraphs so users can add visible vertical spacing.
 *
 * Standard markdown ignores single \n (soft break). CMS content authored in
 * textareas expects Enter → visible line break, so we normalise here.
 */
export function normalizeNewlines(content: string): string {
  return (
    content
      // Runs of 3+ newlines: keep one paragraph break, emit empty paragraphs for extras
      .replace(/\n{3,}/g, (match) => {
        const extra = match.length - 2;
        return "\n\n" + "&nbsp;\n\n".repeat(extra);
      })
      .replace(/\n\n/g, "\0PARA\0")
      .replace(/\n/g, "  \n")
      .replace(/\0PARA\0/g, "\n\n")
  );
}

/**
 * Pre-processes emphasis markers (**bold**, *italic*, ***bold+italic***)
 * into raw HTML tags before the CommonMark parser sees them.
 *
 * CommonMark's delimiter-run rules reject closing `**` when preceded by
 * punctuation and followed by a non-punctuation character (e.g.
 * `**krippner:**digital`). By converting emphasis to HTML inline tags
 * first, we bypass that limitation — marked passes inline HTML through
 * unchanged.
 *
 * Inline code spans are protected so `**code**` inside backticks stays
 * literal.
 */
function preprocessEmphasis(text: string): string {
  // Protect inline code from emphasis processing
  const codes: string[] = [];
  let s = text.replace(/`[^`]+`/g, (m) => {
    codes.push(m);
    return `\x00C${codes.length - 1}\x00`;
  });

  // Bold+italic: ***...***
  s = s.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
  // Bold: **...**
  s = s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  // Italic: *...* (not adjacent to other asterisks)
  s = s.replace(/(?<![\\*])\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, "<em>$1</em>");

  // Restore inline code
  s = s.replace(/\x00C(\d+)\x00/g, (_, i) => codes[parseInt(i)]);
  return s;
}

/**
 * Shared Marked instance with a custom renderer that adds CSS class hooks
 * to every element. This mirrors the class names the typography system
 * uses for styling via CSS variables (e.g. `.h1`, `.paragraph`, `.ul`).
 */
const md = new Marked({
  renderer: {
    heading({ tokens, depth }) {
      const text = this.parser.parseInline(tokens);
      const tag = `h${depth}`;
      return `<${tag} class="${tag}">${text}</${tag}>\n`;
    },
    paragraph({ tokens }) {
      const text = this.parser.parseInline(tokens);
      return `<p class="paragraph">${text}</p>\n`;
    },
    blockquote({ tokens }) {
      const text = this.parser.parse(tokens);
      return `<blockquote class="blockquote">${text}</blockquote>\n`;
    },
    link({ href, tokens }) {
      const text = this.parser.parseInline(tokens);
      return `<a class="a" href="${href}">${text}</a>`;
    },
    list({ ordered, items }) {
      const tag = ordered ? "ol" : "ul";
      let body = "";
      for (const item of items) {
        body += this.listitem(item);
      }
      return `<${tag} class="${tag}">${body}</${tag}>\n`;
    },
    listitem({ tokens }) {
      let text = "";
      for (const token of tokens) {
        text += this.parser.parse([token]);
      }
      // Remove wrapping <p> from loose list items
      text = text.replace(/^<p class="paragraph">(.*)<\/p>\n$/, "$1");
      return `<li class="li">${text}</li>\n`;
    },
    hr() {
      return `<hr class="hr" />\n`;
    },
    table({ header, rows }) {
      let headerHtml = "<tr>";
      for (const cell of header) {
        headerHtml += `<th class="th">${this.parser.parseInline(cell.tokens)}</th>`;
      }
      headerHtml += "</tr>";
      let bodyHtml = "";
      for (const row of rows) {
        bodyHtml += "<tr>";
        for (const cell of row) {
          bodyHtml += `<td class="td">${this.parser.parseInline(cell.tokens)}</td>`;
        }
        bodyHtml += "</tr>";
      }
      return `<table class="table"><thead>${headerHtml}</thead><tbody>${bodyHtml}</tbody></table>\n`;
    },
    code({ text, lang }) {
      const langAttr = lang ? ` class="language-${lang}"` : "";
      return `<pre class="code"><code${langAttr}>${text}</code></pre>\n`;
    },
    codespan({ text }) {
      return `<code class="code">${text}</code>`;
    },
  },
});

/**
 * Parse markdown content to an HTML string with CSS class hooks on
 * every element, and robust emphasis handling for edge-cases the
 * CommonMark spec drops (e.g. `**bold:**adjacent`).
 */
export function parseMarkdown(content: string): string {
  const normalized = normalizeNewlines(content);
  const preprocessed = preprocessEmphasis(normalized);
  return md.parse(preprocessed, { async: false }) as string;
}

/**
 * Parse inline markdown for contexts where block-level elements are
 * unwanted (e.g. checkbox labels rendered inside a `<label>`).
 * Returns HTML without wrapping `<p>` tags.
 */
export function parseMarkdownInline(content: string): string {
  const normalized = normalizeNewlines(content);
  const preprocessed = preprocessEmphasis(normalized);
  return md.parseInline(preprocessed) as string;
}

/**
 * Renders markdown content as HTML. Drop-in replacement for ReactMarkdown.
 *
 * Usage:
 *   <Markdown>{"**bold** text"}</Markdown>
 */
export function Markdown({
  children,
  className,
  style,
}: {
  children: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      dangerouslySetInnerHTML={{ __html: parseMarkdown(children) }}
      className={className}
      style={style}
    />
  );
}

/**
 * Inline variant — renders as `<span>` instead of `<div>`, suitable for
 * use inside `<label>`, `<p>`, or other inline contexts.
 *
 * Usage:
 *   <MarkdownInline>{"**bold** label"}</MarkdownInline>
 */
export function MarkdownInline({
  children,
  className,
  style,
}: {
  children: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      dangerouslySetInnerHTML={{ __html: parseMarkdownInline(children) }}
      className={className}
      style={style}
    />
  );
}
