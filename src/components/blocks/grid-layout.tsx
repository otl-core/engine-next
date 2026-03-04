/**
 * Grid Layout Block
 * Block version of the Grid section -- renders GridLayout without SectionWrapper.
 * Used for nesting grid layouts inside other sections.
 */

import BlockWrapper from "@/components/blocks/block-wrapper";
import GridLayout from "@/components/blocks/layouts/grid-layout";
import { BlockRegistry } from "@otl-core/block-registry";
import type {
  BlockInstance,
  ColorReference,
  ResponsiveValue,
} from "@otl-core/cms-types";

interface GridLayoutBlockProps {
  config: {
    children?: BlockInstance[];
    columns?: ResponsiveValue<string>;
    columnGap?: ResponsiveValue<string>;
    rowGap?: ResponsiveValue<string>;
    alignItems?: "start" | "center" | "end" | "stretch";
    justifyItems?: "start" | "center" | "end" | "stretch";
    autoFlow?: "row" | "column" | "dense";
    padding?: ResponsiveValue<string>;
    margin?: ResponsiveValue<string>;
    color?: ColorReference;
  };
  siteId?: string;
  blockRegistry: BlockRegistry;
}

export function GridLayoutBlock({
  config,
  siteId,
  blockRegistry,
}: GridLayoutBlockProps) {
  const gridId = `grid-blk-${crypto.randomUUID().slice(0, 9)}`;
  const { padding, margin, color, ...gridConfig } = config;

  return (
    <BlockWrapper padding={padding} margin={margin} color={color}>
      <GridLayout
        config={gridConfig}
        blockRegistry={blockRegistry}
        siteId={siteId}
        gridId={gridId}
      />
    </BlockWrapper>
  );
}
