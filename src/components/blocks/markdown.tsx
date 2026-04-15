/**
 * Markdown Content Block
 * Renders markdown in collection posts
 */

import type { BlockComponentProps } from "@otl-core/cms-types";
import { cn } from "@otl-core/style-utils";
import { Markdown } from "@/lib/markdown";

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
    <Markdown className={cn("max-w-none", alignmentClass)}>{content}</Markdown>
  );
}
