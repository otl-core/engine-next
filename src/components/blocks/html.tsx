/**
 * HTML Content Block
 * Renders raw HTML with sanitization
 */

import type { BlockComponentProps } from "@otl-core/cms-types";
import DOMPurify from "isomorphic-dompurify";

interface HtmlContentConfig {
  content?: string;
}

export function HtmlBlock({ config }: BlockComponentProps<HtmlContentConfig>) {
  const { content = "" } = config;

  if (!content) {
    return null;
  }

  const sanitizedHtml = DOMPurify.sanitize(content);

  return <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />;
}
