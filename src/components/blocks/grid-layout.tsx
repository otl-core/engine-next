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
    alignItems?: ResponsiveValue<string>;
    justifyItems?: ResponsiveValue<string>;
    autoFlow?: "row" | "column" | "dense";
    padding?: ResponsiveValue<string>;
    margin?: ResponsiveValue<string>;
    color?: ResponsiveValue<ColorReference>;
    borderRadius?: ResponsiveValue<string>;
    verticalAlign?: ResponsiveValue<string>;
    width?: ResponsiveValue<string>;
    minWidth?: ResponsiveValue<string>;
    maxWidth?: ResponsiveValue<string>;
    height?: ResponsiveValue<string>;
    minHeight?: ResponsiveValue<string>;
    maxHeight?: ResponsiveValue<string>;
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
  const {
    padding,
    margin,
    color,
    borderRadius,
    verticalAlign,
    width,
    minWidth,
    maxWidth,
    height,
    minHeight,
    maxHeight,
    ...gridConfig
  } = config;

  return (
    <BlockWrapper
      padding={padding}
      margin={margin}
      color={color}
      borderRadius={borderRadius}
      verticalAlign={verticalAlign}
      width={width}
      minWidth={minWidth}
      maxWidth={maxWidth}
      height={height}
      minHeight={minHeight}
      maxHeight={maxHeight}
    >
      <GridLayout
        config={gridConfig}
        blockRegistry={blockRegistry}
        siteId={siteId}
        gridId={gridId}
      />
    </BlockWrapper>
  );
}
