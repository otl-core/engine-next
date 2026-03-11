/**
 * Embed Block
 * External content embed (tweets, etc.)
 */

import type { BlockComponentProps } from "@otl-core/cms-types";
import sanitizeHtml from "sanitize-html";

interface EmbedConfig {
  embedCode?: string;
  url?: string;
}

export function EmbedBlock({ config }: BlockComponentProps<EmbedConfig>) {
  const { embedCode = "", url = "" } = config;

  if (embedCode) {
    const sanitizedCode = sanitizeHtml(embedCode);
    return (
      <div
        className="my-4"
        dangerouslySetInnerHTML={{ __html: sanitizedCode }}
      />
    );
  }

  if (url) {
    return (
      <div className="my-4">
        <iframe
          src={url}
          className="w-full rounded-lg"
          style={{ minHeight: "400px" }}
          title="Embedded content"
        />
      </div>
    );
  }

  return null;
}
