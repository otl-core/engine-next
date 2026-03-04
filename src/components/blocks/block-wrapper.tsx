/**
 * Block Wrapper
 * Handles common block properties: padding, margin, background color.
 * Similar to SectionWrapper but for blocks.
 */

import type { ColorReference, ResponsiveValue } from "@otl-core/cms-types";
import {
  cn,
  normalizeResponsiveValue,
  resolveColorToCSS,
} from "@otl-core/cms-utils";
import { BREAKPOINTS } from "@/lib/breakpoints";
import { ReactNode } from "react";

interface BlockWrapperProps {
  padding?: ResponsiveValue<string>;
  margin?: ResponsiveValue<string>;
  color?: ColorReference;
  children: ReactNode;
  className?: string;
  id?: string;
}

function generateSpacingCSS(
  blockId: string,
  padding: ResponsiveValue<string> | undefined,
  margin: ResponsiveValue<string> | undefined,
): string | null {
  const normalizedPadding = normalizeResponsiveValue(padding);
  const normalizedMargin = normalizeResponsiveValue(margin);

  if (!normalizedPadding.base && !normalizedMargin.base) {
    return null;
  }

  const css: string[] = [];
  const targetClass = `#${blockId}`;

  // Generate base styles
  const baseStyles: string[] = [];
  if (normalizedPadding.base) {
    baseStyles.push(`padding:${normalizedPadding.base}`);
  }
  if (normalizedMargin.base) {
    baseStyles.push(`margin:${normalizedMargin.base}`);
  }
  if (baseStyles.length > 0) {
    css.push(`${targetClass}{${baseStyles.join(";")}}`);
  }

  // Generate responsive styles
  BREAKPOINTS.forEach(({ key, minWidth }) => {
    const paddingBp = normalizedPadding[key];
    const marginBp = normalizedMargin[key];

    if (paddingBp || marginBp) {
      const styles: string[] = [];
      if (paddingBp) styles.push(`padding:${paddingBp}`);
      if (marginBp) styles.push(`margin:${marginBp}`);

      if (styles.length > 0) {
        css.push(
          `@media (min-width:${minWidth}){${targetClass}{${styles.join(";")}}}`,
        );
      }
    }
  });

  return css.length > 0 ? css.join("") : null;
}

export default function BlockWrapper({
  padding,
  margin,
  color,
  children,
  className,
  id,
}: BlockWrapperProps) {
  const bgColor = resolveColorToCSS(color, "background");
  const fgColor = resolveColorToCSS(color, "foreground");

  const blockId = id || `block-${crypto.randomUUID().slice(0, 9)}`;
  const spacingCSS = generateSpacingCSS(blockId, padding, margin);

  const blockStyle: React.CSSProperties = {
    ...(bgColor ? { backgroundColor: bgColor } : {}),
    ...(fgColor ? { color: fgColor } : {}),
  };

  // Check if we have any styling to apply
  const hasStyling = padding || margin || color;

  // If no styling, just return children directly
  if (!hasStyling) {
    return <>{children}</>;
  }

  return (
    <div id={blockId} className={cn("w-full", className)} style={blockStyle}>
      {spacingCSS && <style dangerouslySetInnerHTML={{ __html: spacingCSS }} />}
      {children}
    </div>
  );
}
