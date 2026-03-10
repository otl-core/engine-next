/**
 * Section Wrapper
 * Handles common section properties: container behavior, spacing, background.
 * Uses flat config keys matching form builder field IDs.
 *
 * Sections are always top-level. For nested layouts, use layout blocks instead.
 */

import type { ResponsiveValue, SectionBaseConfig } from "@otl-core/cms-types";
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

function generateSpacingCSS(
  sectionId: string,
  padding: ResponsiveValue<string> | undefined,
  margin: ResponsiveValue<string> | undefined,
): string | null {
  const normalizedPadding = normalizeResponsiveValue(padding);
  const normalizedMargin = normalizeResponsiveValue(margin);

  if (!normalizedPadding.base && !normalizedMargin.base) {
    return null;
  }

  const css: string[] = [];
  const targetClass = `#${sectionId}`;

  // Generate base styles
  const baseStyles: string[] = [];
  if (normalizedPadding.base) {
    baseStyles.push(`padding:${normalizedPadding.base}`);
  }
  if (normalizedMargin.base) {
    baseStyles.push(`margin:${normalizedMargin.base}`);
    // Only adjust width if margin affects horizontal space
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
      if (marginBp) {
        styles.push(`margin:${marginBp}`);
        // Only adjust width if margin affects horizontal space
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

      if (styles.length > 0) {
        css.push(
          `@media (min-width:${minWidth}){${targetClass}{${styles.join(";")}}}`,
        );
      }
    }
  });

  return css.length > 0 ? css.join("") : null;
}

export default function SectionWrapper({
  container = "edged",
  padding,
  margin,
  color,
  children,
  className,
  id,
}: SectionWrapperProps) {
  const bgColor = resolveColorToCSS(color, "background");
  const fgColor = resolveColorToCSS(color, "foreground");

  const sectionId = id || `section-${crypto.randomUUID().slice(0, 9)}`;
  const innerId = `${sectionId}-inner`;
  const spacingCSS = generateSpacingCSS(innerId, padding, margin);

  const sectionStyle: React.CSSProperties = {
    ...(bgColor ? { backgroundColor: bgColor } : {}),
    ...(fgColor ? { color: fgColor } : {}),
  };

  // Default padding when none specified
  const normalizedPadding = normalizeResponsiveValue(padding);
  const normalizedMargin = normalizeResponsiveValue(margin);
  const defaultPadding =
    !normalizedPadding.base && !normalizedMargin.base ? "py-8" : "";

  if (container === "boxed") {
    return (
      <section
        id={sectionId}
        data-section-id={id}
        className={cn("w-full container mx-auto", className)}
        style={sectionStyle}
      >
        {spacingCSS && (
          <style dangerouslySetInnerHTML={{ __html: spacingCSS }} />
        )}
        <div id={innerId} className={defaultPadding}>
          {children}
        </div>
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
        {spacingCSS && (
          <style dangerouslySetInnerHTML={{ __html: spacingCSS }} />
        )}
        <div className="container mx-auto">
          <div id={innerId} className={defaultPadding}>
            {children}
          </div>
        </div>
      </section>
    );
  }

  // container === "ignore"
  return (
    <section
      id={sectionId}
      data-section-id={id}
      className={cn("w-full", className)}
      style={sectionStyle}
    >
      {spacingCSS && <style dangerouslySetInnerHTML={{ __html: spacingCSS }} />}
      <div id={innerId} className={defaultPadding}>
        {children}
      </div>
    </section>
  );
}
