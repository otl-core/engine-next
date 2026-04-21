/**
 * Block Wrapper
 * Handles common block properties: padding, margin, background color,
 * border radius, and vertical alignment.
 * Similar to SectionWrapper but for blocks.
 */

import type {
  ColorReference,
  ResponsiveConfig,
  ResponsiveValue,
} from "@otl-core/cms-types";
import {
  cn,
  normalizeResponsiveValue,
  resolveColorToCSS,
} from "@otl-core/style-utils";
import { BREAKPOINTS } from "@/lib/breakpoints";
import { ReactNode } from "react";

interface BlockWrapperProps {
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
  children: ReactNode;
  className?: string;
  id?: string;
}

const VERTICAL_ALIGN_MAP: Record<string, string> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  stretch: "stretch",
  between: "space-between",
  around: "space-around",
};

function isResponsiveColor(
  color: ResponsiveValue<ColorReference> | undefined,
): color is ResponsiveConfig<ColorReference> {
  if (!color || typeof color !== "object") return false;
  return (
    "base" in color &&
    typeof (color as unknown as Record<string, unknown>).base === "object"
  );
}

interface DimensionConfig {
  width?: ResponsiveValue<string>;
  minWidth?: ResponsiveValue<string>;
  maxWidth?: ResponsiveValue<string>;
  height?: ResponsiveValue<string>;
  minHeight?: ResponsiveValue<string>;
  maxHeight?: ResponsiveValue<string>;
}

const DIMENSION_PROPS = [
  { key: "width", css: "width" },
  { key: "minWidth", css: "min-width" },
  { key: "maxWidth", css: "max-width" },
  { key: "height", css: "height" },
  { key: "minHeight", css: "min-height" },
  { key: "maxHeight", css: "max-height" },
] as const;

function generateBlockCSS(
  blockId: string,
  padding: ResponsiveValue<string> | undefined,
  margin: ResponsiveValue<string> | undefined,
  borderRadius: ResponsiveValue<string> | undefined,
  verticalAlign: ResponsiveValue<string> | undefined,
  color: ResponsiveValue<ColorReference> | undefined,
  dimensions?: DimensionConfig,
): string | null {
  const normalizedPadding = normalizeResponsiveValue(padding);
  const normalizedMargin = normalizeResponsiveValue(margin);
  const normalizedBorderRadius = normalizeResponsiveValue(borderRadius);
  const normalizedVerticalAlign = normalizeResponsiveValue(verticalAlign);

  const normalizedDimensions = DIMENSION_PROPS.map((d) => ({
    ...d,
    values: normalizeResponsiveValue(dimensions?.[d.key]),
  }));

  const responsiveColor = isResponsiveColor(color);
  const colorConfig = responsiveColor
    ? (color as ResponsiveConfig<ColorReference>)
    : null;

  const css: string[] = [];
  const target = `#${blockId}`;

  // Generate base styles
  const baseStyles: string[] = [];
  if (normalizedPadding.base) {
    baseStyles.push(`padding:${normalizedPadding.base}`);
  }
  if (normalizedMargin.base) {
    baseStyles.push(`margin:${normalizedMargin.base}`);
  }
  if (normalizedBorderRadius.base && normalizedBorderRadius.base !== "0") {
    baseStyles.push(`border-radius:${normalizedBorderRadius.base}`);
  }
  if (
    normalizedVerticalAlign.base &&
    normalizedVerticalAlign.base !== "start"
  ) {
    baseStyles.push(`display:flex`);
    baseStyles.push(`flex-direction:column`);
    baseStyles.push(
      `justify-content:${VERTICAL_ALIGN_MAP[normalizedVerticalAlign.base] || "flex-start"}`,
    );
  }
  if (colorConfig?.base) {
    const bg = resolveColorToCSS(colorConfig.base, "background");
    const fg = resolveColorToCSS(colorConfig.base, "foreground");
    if (bg) baseStyles.push(`background-color:${bg}`);
    if (fg) baseStyles.push(`color:${fg}`);
  }
  for (const dim of normalizedDimensions) {
    const baseVal = dim.values.base;
    if (baseVal && baseVal !== "auto" && baseVal !== "none") {
      baseStyles.push(`${dim.css}:${baseVal}`);
    }
  }
  if (baseStyles.length > 0) {
    css.push(`${target}{${baseStyles.join(";")}}`);
  }

  // Generate responsive styles
  BREAKPOINTS.forEach(({ key, minWidth }) => {
    const styles: string[] = [];
    const paddingBp = normalizedPadding[key];
    const marginBp = normalizedMargin[key];
    const borderRadiusBp = normalizedBorderRadius[key];
    const verticalAlignBp = normalizedVerticalAlign[key];
    const colorBp = colorConfig?.[key];

    if (paddingBp) styles.push(`padding:${paddingBp}`);
    if (marginBp) styles.push(`margin:${marginBp}`);
    if (borderRadiusBp) styles.push(`border-radius:${borderRadiusBp}`);
    if (verticalAlignBp) {
      styles.push(`display:flex`);
      styles.push(`flex-direction:column`);
      styles.push(
        `justify-content:${VERTICAL_ALIGN_MAP[verticalAlignBp] || "flex-start"}`,
      );
    }
    if (colorBp) {
      const bg = resolveColorToCSS(colorBp, "background");
      const fg = resolveColorToCSS(colorBp, "foreground");
      if (bg) styles.push(`background-color:${bg}`);
      if (fg) styles.push(`color:${fg}`);
    }
    for (const dim of normalizedDimensions) {
      const dimBp = dim.values[key];
      if (dimBp) styles.push(`${dim.css}:${dimBp}`);
    }

    if (styles.length > 0) {
      css.push(
        `@media (min-width:${minWidth}){${target}{${styles.join(";")}}}`,
      );
    }
  });

  return css.length > 0 ? css.join("") : null;
}

export default function BlockWrapper({
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
  children,
  className,
  id,
}: BlockWrapperProps) {
  const blockId = id || `block-${crypto.randomUUID().slice(0, 9)}`;
  const blockCSS = generateBlockCSS(
    blockId,
    padding,
    margin,
    borderRadius,
    verticalAlign,
    color,
    { width, minWidth, maxWidth, height, minHeight, maxHeight },
  );

  // For non-responsive color (plain ColorReference), apply as inline style
  const isPlainColor = color && !isResponsiveColor(color);
  const blockStyle: React.CSSProperties = isPlainColor
    ? {
        ...(resolveColorToCSS(color as ColorReference, "background")
          ? {
              backgroundColor: resolveColorToCSS(
                color as ColorReference,
                "background",
              )!,
            }
          : {}),
        ...(resolveColorToCSS(color as ColorReference, "foreground")
          ? {
              color: resolveColorToCSS(color as ColorReference, "foreground")!,
            }
          : {}),
      }
    : {};

  // Check if we have any styling to apply
  const hasStyling =
    padding ||
    margin ||
    color ||
    borderRadius ||
    verticalAlign ||
    width ||
    minWidth ||
    maxWidth ||
    height ||
    minHeight ||
    maxHeight;

  // If no styling, just return children directly
  if (!hasStyling) {
    return <>{children}</>;
  }

  return (
    <div id={blockId} className={cn("w-full", className)} style={blockStyle}>
      {blockCSS && <style dangerouslySetInnerHTML={{ __html: blockCSS }} />}
      {children}
    </div>
  );
}
