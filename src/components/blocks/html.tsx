/**
 * HTML Content Block
 * Renders raw HTML from CMS-authored content
 */

import type { BlockComponentProps } from "@otl-core/cms-types";

interface HtmlContentConfig {
  content?: string;
}

export function HtmlBlock({ config }: BlockComponentProps<HtmlContentConfig>) {
  const { content = "" } = config;

  if (!content) {
    return null;
  }

  return <div dangerouslySetInnerHTML={{ __html: content }} />;
}
