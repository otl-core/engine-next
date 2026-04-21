/**
 * Block Style Wrapper
 * Extracts common styling fields (padding, margin, color, borderRadius,
 * verticalAlign, dimensions) from block config and wraps children with BlockWrapper.
 * Registered globally via registerBlockStyleWrapper so all blocks get styling support.
 */

import type { ColorReference, ResponsiveValue } from "@otl-core/cms-types";
import BlockWrapper from "./block-wrapper";
import { ReactNode } from "react";

const STYLING_KEYS = [
  "padding",
  "margin",
  "color",
  "borderRadius",
  "verticalAlign",
  "width",
  "minWidth",
  "maxWidth",
  "height",
  "minHeight",
  "maxHeight",
] as const;

interface BlockStyleWrapperProps {
  config: Record<string, unknown>;
  children: ReactNode;
}

export default function BlockStyleWrapper({
  config,
  children,
}: BlockStyleWrapperProps) {
  const hasStyling = STYLING_KEYS.some((key) => config[key] !== undefined);

  if (!hasStyling) {
    return <>{children}</>;
  }

  return (
    <BlockWrapper
      padding={config.padding as ResponsiveValue<string> | undefined}
      margin={config.margin as ResponsiveValue<string> | undefined}
      color={config.color as ResponsiveValue<ColorReference> | undefined}
      borderRadius={config.borderRadius as ResponsiveValue<string> | undefined}
      verticalAlign={
        config.verticalAlign as ResponsiveValue<string> | undefined
      }
      width={config.width as ResponsiveValue<string> | undefined}
      minWidth={config.minWidth as ResponsiveValue<string> | undefined}
      maxWidth={config.maxWidth as ResponsiveValue<string> | undefined}
      height={config.height as ResponsiveValue<string> | undefined}
      minHeight={config.minHeight as ResponsiveValue<string> | undefined}
      maxHeight={config.maxHeight as ResponsiveValue<string> | undefined}
    >
      {children}
    </BlockWrapper>
  );
}
