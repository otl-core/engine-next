/**
 * Container Layout Block
 * Block version of the Container section -- renders ContainerLayout without SectionWrapper.
 * Styling (padding, margin, color, dimensions, etc.) is handled by the
 * BlockStyleWrapper registered in the block registry.
 */

import ContainerLayout from "@/components/blocks/layouts/container-layout";
import { BlockRegistry } from "@otl-core/block-registry";
import type { BlockComponentProps } from "@otl-core/cms-types";
import type { ContainerLayoutConfig } from "@/components/blocks/layouts/container-layout";

interface ContainerLayoutBlockProps extends BlockComponentProps<ContainerLayoutConfig> {
  siteId?: string;
  blockRegistry: BlockRegistry;
}

export function ContainerLayoutBlock({
  config,
  siteId,
  blockRegistry,
}: ContainerLayoutBlockProps) {
  return (
    <ContainerLayout
      config={config}
      blockRegistry={blockRegistry}
      siteId={siteId}
    />
  );
}
