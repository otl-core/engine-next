/**
 * Flexbox Layout Block
 * Block version of the Flexbox section -- renders FlexboxLayout without SectionWrapper.
 * Used for nesting flexbox layouts inside other sections.
 */

import BlockWrapper from "@/components/blocks/block-wrapper";
import FlexboxLayout from "@/components/blocks/layouts/flexbox-layout";
import { BlockRegistry } from "@otl-core/block-registry";
import type {
  BlockInstance,
  ColorReference,
  ResponsiveValue,
} from "@otl-core/cms-types";

interface FlexboxLayoutBlockProps {
  config: {
    children?: BlockInstance[];
    direction?: "row" | "column";
    justify?: "start" | "center" | "end" | "between" | "around";
    align?: "start" | "center" | "end" | "stretch";
    gap?: ResponsiveValue<string>;
    wrap?: boolean;
    padding?: ResponsiveValue<string>;
    margin?: ResponsiveValue<string>;
    color?: ColorReference;
  };
  siteId?: string;
  blockRegistry: BlockRegistry;
}

export function FlexboxLayoutBlock({
  config,
  siteId,
  blockRegistry,
}: FlexboxLayoutBlockProps) {
  const { padding, margin, color, ...flexConfig } = config;

  return (
    <BlockWrapper padding={padding} margin={margin} color={color}>
      <FlexboxLayout
        config={flexConfig}
        blockRegistry={blockRegistry}
        siteId={siteId}
      />
    </BlockWrapper>
  );
}
