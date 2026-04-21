/**
 * Flexbox Layout
 * Pure Flexbox rendering logic shared between the Flexbox section and flexbox-layout block.
 * Renders children via BlockRenderer. No SectionWrapper.
 */

import { BlockRegistry, BlockRenderer } from "@otl-core/block-registry";
import type { BlockInstance, ResponsiveValue } from "@otl-core/cms-types";
import { cn, normalizeResponsiveValue } from "@otl-core/style-utils";
import { BREAKPOINTS } from "@/lib/breakpoints";

export interface FlexboxLayoutConfig {
  children?: BlockInstance[];
  direction?: ResponsiveValue<string>;
  justify?: ResponsiveValue<string>;
  align?: ResponsiveValue<string>;
  gap?: ResponsiveValue<string>;
  wrap?: boolean;
}

interface FlexboxLayoutProps {
  config: FlexboxLayoutConfig;
  blockRegistry: BlockRegistry;
  siteId?: string;
}

const DIRECTION_CSS: Record<string, string> = {
  row: "row",
  column: "column",
};

const JUSTIFY_CSS: Record<string, string> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  between: "space-between",
  around: "space-around",
};

const ALIGN_CSS: Record<string, string> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  stretch: "stretch",
};

function generateFlexCSS(
  flexId: string,
  direction: ResponsiveValue<string> | undefined,
  justify: ResponsiveValue<string> | undefined,
  align: ResponsiveValue<string> | undefined,
  gap: ResponsiveValue<string> | undefined,
): string {
  const normalizedDirection = normalizeResponsiveValue(direction);
  const normalizedJustify = normalizeResponsiveValue(justify);
  const normalizedAlign = normalizeResponsiveValue(align);
  const normalizedGap = normalizeResponsiveValue(gap);

  const css: string[] = [];
  const target = `#${flexId}`;

  // Base styles
  const baseStyles: string[] = [];
  if (normalizedDirection.base) {
    baseStyles.push(
      `flex-direction:${DIRECTION_CSS[normalizedDirection.base] || "row"}`,
    );
  }
  if (normalizedJustify.base) {
    baseStyles.push(
      `justify-content:${JUSTIFY_CSS[normalizedJustify.base] || "flex-start"}`,
    );
  }
  if (normalizedAlign.base) {
    baseStyles.push(
      `align-items:${ALIGN_CSS[normalizedAlign.base] || "flex-start"}`,
    );
  }
  if (normalizedGap.base) {
    baseStyles.push(`gap:${normalizedGap.base}`);
  }
  if (baseStyles.length > 0) {
    css.push(`${target}{${baseStyles.join(";")}}`);
  }

  // Responsive styles
  for (const { key, minWidth } of BREAKPOINTS) {
    const styles: string[] = [];
    const dirBp = normalizedDirection[key];
    if (dirBp) styles.push(`flex-direction:${DIRECTION_CSS[dirBp] || "row"}`);
    const justBp = normalizedJustify[key];
    if (justBp)
      styles.push(`justify-content:${JUSTIFY_CSS[justBp] || "flex-start"}`);
    const alignBp = normalizedAlign[key];
    if (alignBp)
      styles.push(`align-items:${ALIGN_CSS[alignBp] || "flex-start"}`);
    const gapBp = normalizedGap[key];
    if (gapBp) styles.push(`gap:${gapBp}`);
    if (styles.length > 0) {
      css.push(
        `@media (min-width:${minWidth}){${target}{${styles.join(";")}}}`,
      );
    }
  }

  return css.join("");
}

export default function FlexboxLayout({
  config,
  blockRegistry,
  siteId,
}: FlexboxLayoutProps) {
  const {
    children = [],
    direction,
    justify,
    align,
    gap,
    wrap = false,
  } = config;

  if (!children || children.length === 0) {
    return null;
  }

  const flexId = `flex-${crypto.randomUUID().slice(0, 9)}`;
  const flexCSS = generateFlexCSS(flexId, direction, justify, align, gap);

  return (
    <>
      {flexCSS && <style dangerouslySetInnerHTML={{ __html: flexCSS }} />}
      <div id={flexId} className={cn("flex", wrap && "flex-wrap")}>
        {children.map((child, index) => (
          <div key={child.id || `child-${child.type}-${index}`}>
            <BlockRenderer
              block={child}
              blockRegistry={blockRegistry}
              siteId={siteId}
            />
          </div>
        ))}
      </div>
    </>
  );
}
