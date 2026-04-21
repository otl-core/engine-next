/**
 * Container Layout
 * Width-constrained rendering logic shared between the Container section and container-layout block.
 * Renders children via BlockRenderer.
 * Dimension controls (width, maxWidth, etc.) are handled by the parent wrapper.
 */

import { BlockRegistry, BlockRenderer } from "@otl-core/block-registry";
import type { BlockInstance } from "@otl-core/cms-types";
import { cn } from "@otl-core/style-utils";

export interface ContainerLayoutConfig {
  child?: BlockInstance[];
  centered?: boolean;
}

interface ContainerLayoutProps {
  config: ContainerLayoutConfig;
  blockRegistry: BlockRegistry;
  siteId?: string;
}

export default function ContainerLayout({
  config,
  blockRegistry,
  siteId,
}: ContainerLayoutProps) {
  const { child, centered = true } = config;

  const children = Array.isArray(child) ? child : [];

  if (children.length === 0) {
    return null;
  }

  return (
    <div className={cn("w-full", centered && "mx-auto")}>
      {children.map((block, index) => (
        <BlockRenderer
          key={block.id || `child-${block.type}-${index}`}
          block={block}
          blockRegistry={blockRegistry}
          siteId={siteId}
        />
      ))}
    </div>
  );
}
