/**
 * Grid Layout Block
 * Block version of the Grid section -- renders GridLayout without SectionWrapper.
 * Styling (padding, margin, color, dimensions, etc.) is handled by the
 * BlockStyleWrapper registered in the block registry.
 */

import GridLayout from "@/components/blocks/layouts/grid-layout";
import { BlockRegistry } from "@otl-core/block-registry";
import type { BlockComponentProps } from "@otl-core/cms-types";
import type { GridLayoutConfig } from "@/components/blocks/layouts/grid-layout";

interface GridLayoutBlockProps extends BlockComponentProps<GridLayoutConfig> {
  siteId?: string;
  blockRegistry: BlockRegistry;
}

export function GridLayoutBlock({
  config,
  siteId,
  blockRegistry,
}: GridLayoutBlockProps) {
  const gridId = `grid-blk-${crypto.randomUUID().slice(0, 9)}`;

  return (
    <GridLayout
      config={config}
      blockRegistry={blockRegistry}
      siteId={siteId}
      gridId={gridId}
    />
  );
}
