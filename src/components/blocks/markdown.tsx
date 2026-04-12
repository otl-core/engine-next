/**
 * Markdown Content Block
 * Renders markdown in collection posts
 */

import type { BlockComponentProps } from "@otl-core/cms-types";
import { cn } from "@otl-core/style-utils";
import { markdownComponents, normalizeNewlines } from "@/lib/markdown";
import ReactMarkdown from "react-markdown";

interface MarkdownContentConfig {
  content?: string;
  textAlign?: "left" | "center" | "right" | "justify";
}

export function MarkdownBlock({
  config,
}: BlockComponentProps<MarkdownContentConfig>) {
  const { content = "", textAlign = "left" } = config;

  if (!content) {
    return null;
  }

  const alignmentClass = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
    justify: "text-justify",
  }[textAlign];

  return (
    <div className={cn("max-w-none", alignmentClass)}>
      <ReactMarkdown components={markdownComponents}>
        {normalizeNewlines(content)}
      </ReactMarkdown>
    </div>
  );
}
