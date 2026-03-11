/**
 * HTML Content Block
 * Renders raw HTML with sanitization
 */

import type { BlockComponentProps } from "@otl-core/cms-types";
import sanitizeHtml from "sanitize-html";

interface HtmlContentConfig {
  content?: string;
}

export function HtmlBlock({ config }: BlockComponentProps<HtmlContentConfig>) {
  const { content = "" } = config;

  if (!content) {
    return null;
  }

  const sanitizedContent = sanitizeHtml(content);

  return <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />;
}
