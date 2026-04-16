/**
 * Embed Block
 * External content embed (tweets, etc.)
 */

import type { BlockComponentProps } from "@otl-core/cms-types";

interface EmbedConfig {
  embedCode?: string;
  url?: string;
}

export function EmbedBlock({ config }: BlockComponentProps<EmbedConfig>) {
  const { embedCode = "", url = "" } = config;

  if (embedCode) {
    return (
      <div className="my-4" dangerouslySetInnerHTML={{ __html: embedCode }} />
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
