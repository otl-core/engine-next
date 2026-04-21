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
    direction?: ResponsiveValue<string>;
    justify?: ResponsiveValue<string>;
    align?: ResponsiveValue<string>;
    gap?: ResponsiveValue<string>;
    wrap?: boolean;
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

export function FlexboxLayoutBlock({
  config,
  siteId,
  blockRegistry,
}: FlexboxLayoutBlockProps) {
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
    ...flexConfig
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
      <FlexboxLayout
        config={flexConfig}
        blockRegistry={blockRegistry}
        siteId={siteId}
      />
    </BlockWrapper>
  );
}
