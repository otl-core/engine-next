/**
 * Container Layout Block
 * Block version of the Container section -- renders ContainerLayout without SectionWrapper.
 * Dimension controls (width, maxWidth, etc.) are handled by BlockWrapper.
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
    centered?: boolean;
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

export function ContainerLayoutBlock({
  config,
  siteId,
  blockRegistry,
}: ContainerLayoutBlockProps) {
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
    ...containerConfig
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
      <ContainerLayout
        config={containerConfig}
        blockRegistry={blockRegistry}
        siteId={siteId}
      />
    </BlockWrapper>
  );
}
