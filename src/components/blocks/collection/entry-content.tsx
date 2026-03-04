import { blockRegistry } from "@/lib/registries/block-registry";
import { BlockRenderer } from "@otl-core/block-registry";
import type { BlockInstance } from "@otl-core/cms-types";
import type { BlockRegistry } from "@otl-core/block-registry";

interface EntryContentConfig {
  blocks?: BlockInstance[];
  data?: {
    id: string;
    title: string;
    blocks?: BlockInstance[];
  };
}

interface EntryContentBlockProps {
  config: EntryContentConfig;
  siteId?: string;
  blockRegistry?: BlockRegistry;
}

export function EntryContentBlock({
  config,
  siteId,
  blockRegistry: registryProp,
}: EntryContentBlockProps) {
  const registry = registryProp ?? blockRegistry;
  const blocks = config.blocks ?? config.data?.blocks;

  if (!blocks || blocks.length === 0) return null;

  return (
    <div className="entry-content prose prose-lg max-w-none dark:prose-invert">
      {blocks.map((block) => (
        <BlockRenderer
          key={block.id}
          block={block}
          blockRegistry={registry}
          siteId={siteId}
        />
      ))}
    </div>
  );
}
