/**
 * Container Layout Block
 * Block version of the Container section -- renders ContainerLayout without SectionWrapper.
 * Used for nesting a width-constrained container inside other sections.
 */

import BlockWrapper from "@/components/blocks/block-wrapper";
import ContainerLayout from "@/components/blocks/layouts/container-layout";
import { BlockRegistry } from "@otl-core/block-registry";
import type {
  BlockInstance,
  ColorReference,
  ResponsiveValue,
} from "@otl-core/cms-types";

interface ContainerLayoutBlockProps {
  config: {
    child?: BlockInstance[];
    width?:
      | "small"
      | "medium"
      | "large"
      | "extra-large"
      | "wide"
      | "full"
      | "text-optimized"
      | "container"
      | "custom";
    customWidth?: number;
    centered?: boolean;
    padding?: ResponsiveValue<string>;
    margin?: ResponsiveValue<string>;
    color?: ColorReference;
  };
  siteId?: string;
  blockRegistry: BlockRegistry;
}

export function ContainerLayoutBlock({
  config,
  siteId,
  blockRegistry,
}: ContainerLayoutBlockProps) {
  const { padding, margin, color, ...containerConfig } = config;

  return (
    <BlockWrapper padding={padding} margin={margin} color={color}>
      <ContainerLayout
        config={containerConfig}
        blockRegistry={blockRegistry}
        siteId={siteId}
      />
    </BlockWrapper>
  );
}
