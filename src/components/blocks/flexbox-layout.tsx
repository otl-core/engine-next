/**
 * Flexbox Layout Block
 * Block version of the Flexbox section -- renders FlexboxLayout without SectionWrapper.
 * Styling (padding, margin, color, dimensions, etc.) is handled by the
 * BlockStyleWrapper registered in the block registry.
 */

import FlexboxLayout from "@/components/blocks/layouts/flexbox-layout";
import { BlockRegistry } from "@otl-core/block-registry";
import type { BlockComponentProps } from "@otl-core/cms-types";
import type { FlexboxLayoutConfig } from "@/components/blocks/layouts/flexbox-layout";

interface FlexboxLayoutBlockProps extends BlockComponentProps<FlexboxLayoutConfig> {
  siteId?: string;
  blockRegistry: BlockRegistry;
}

export function FlexboxLayoutBlock({
  config,
  siteId,
  blockRegistry,
}: FlexboxLayoutBlockProps) {
  return (
    <FlexboxLayout
      config={config}
      blockRegistry={blockRegistry}
      siteId={siteId}
    />
  );
}
