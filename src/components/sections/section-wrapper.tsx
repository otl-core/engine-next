/**
 * Section Wrapper
 * Handles common section properties: container behavior, spacing, background,
 * border radius, vertical alignment, and responsive colors.
 * Uses flat config keys matching form builder field IDs.
 *
 * Sections are always top-level. For nested layouts, use layout blocks instead.
 */

import type {
  ColorReference,
  ResponsiveConfig,
  ResponsiveValue,
  SectionBaseConfig,
} from "@otl-core/cms-types";
import {
  cn,
  normalizeResponsiveValue,
  resolveColorToCSS,
} from "@otl-core/style-utils";
import { BREAKPOINTS } from "@/lib/breakpoints";
import { ReactNode } from "react";

interface SectionWrapperProps extends SectionBaseConfig {
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

/**
 * Check if a color value is a responsive config (has breakpoint keys) vs a plain ColorReference
 */
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

/**
 * Validate that a value is a valid CSS dimension (not a preset keyword like "container").
 */
function isValidCSSDimension(value: string): boolean {
  const v = value.trim();
  if (
    /^(auto|none|inherit|initial|unset|revert|fit-content|max-content|min-content)$/.test(
      v,
    )
  )
    return true;
  if (/\d/.test(v)) return true;
  if (/^(calc|clamp|min|max|var|env)\(/.test(v)) return true;
  return false;
}

function generateSectionCSS(
  targetId: string,
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

  // Handle responsive color
  const responsiveColor = isResponsiveColor(color);
  const colorConfig = responsiveColor
    ? (color as ResponsiveConfig<ColorReference>)
    : null;

  const css: string[] = [];
  const target = `#${targetId}`;

  // Generate base styles
  const baseStyles: string[] = [];
  if (normalizedPadding.base) {
    baseStyles.push(`padding:${normalizedPadding.base}`);
  }
  if (normalizedMargin.base) {
    baseStyles.push(`margin:${normalizedMargin.base}`);
    const marginParts = normalizedMargin.base.split(" ");
    const horizontalMargin = marginParts[1] || marginParts[0];
    if (
      horizontalMargin &&
      horizontalMargin !== "0" &&
      horizontalMargin !== "auto"
    ) {
      baseStyles.push(`width:calc(100% - 2 * (${horizontalMargin}))`);
    }
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
    if (
      baseVal &&
      baseVal !== "auto" &&
      baseVal !== "none" &&
      isValidCSSDimension(baseVal)
    ) {
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
    if (marginBp) {
      styles.push(`margin:${marginBp}`);
      const marginParts = marginBp.split(" ");
      const horizontalMargin = marginParts[1] || marginParts[0];
      if (
        horizontalMargin &&
        horizontalMargin !== "0" &&
        horizontalMargin !== "auto"
      ) {
        styles.push(`width:calc(100% - 2 * (${horizontalMargin}))`);
      }
    }
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
      if (dimBp && isValidCSSDimension(dimBp))
        styles.push(`${dim.css}:${dimBp}`);
    }

    if (styles.length > 0) {
      css.push(
        `@media (min-width:${minWidth}){${target}{${styles.join(";")}}}`,
      );
    }
  });

  return css.length > 0 ? css.join("") : null;
}

export default function SectionWrapper({
  container,
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
}: SectionWrapperProps) {
  const sectionId = id || `section-${crypto.randomUUID().slice(0, 9)}`;
  const innerId = `${sectionId}-inner`;
  const sectionCSS = generateSectionCSS(
    innerId,
    padding,
    margin,
    borderRadius,
    verticalAlign,
    color,
    { width, minWidth, maxWidth, height, minHeight, maxHeight },
  );

  // For non-responsive color (plain ColorReference), apply as inline style
  const isPlainColor = color && !isResponsiveColor(color);
  const sectionStyle: React.CSSProperties = isPlainColor
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

  if (container === "boxed") {
    return (
      <section
        id={sectionId}
        data-section-id={id}
        className={cn("w-full container mx-auto", className)}
        style={sectionStyle}
      >
        {sectionCSS && (
          <style dangerouslySetInnerHTML={{ __html: sectionCSS }} />
        )}
        <div id={innerId}>{children}</div>
      </section>
    );
  }

  if (container === "edged") {
    return (
      <section
        id={sectionId}
        data-section-id={id}
        className={cn("w-full", className)}
        style={sectionStyle}
      >
        {sectionCSS && (
          <style dangerouslySetInnerHTML={{ __html: sectionCSS }} />
        )}
        <div className="container mx-auto">
          <div id={innerId}>{children}</div>
        </div>
      </section>
    );
  }

  // No container — render as-is
  return (
    <section
      id={sectionId}
      data-section-id={id}
      className={cn("w-full", className)}
      style={sectionStyle}
    >
      {sectionCSS && <style dangerouslySetInnerHTML={{ __html: sectionCSS }} />}
      <div id={innerId}>{children}</div>
    </section>
  );
}
