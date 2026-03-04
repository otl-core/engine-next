/**
 * Flexbox Layout
 * Pure Flexbox rendering logic shared between the Flexbox section and flexbox-layout block.
 * Renders children via BlockRenderer. No SectionWrapper.
 */

import { BlockRegistry, BlockRenderer } from "@otl-core/block-registry";
import type { BlockInstance, ResponsiveValue } from "@otl-core/cms-types";
import { cn } from "@otl-core/cms-utils";
import { BREAKPOINTS } from "@/lib/breakpoints";

export interface FlexboxLayoutConfig {
  children?: BlockInstance[];
  direction?: "row" | "column";
  justify?: "start" | "center" | "end" | "between" | "around";
  align?: "start" | "center" | "end" | "stretch";
  gap?: ResponsiveValue<string>;
  wrap?: boolean;
}

interface FlexboxLayoutProps {
  config: FlexboxLayoutConfig;
  blockRegistry: BlockRegistry;
  siteId?: string;
}

const DIRECTION_MAP: Record<string, string> = {
  row: "flex-row",
  column: "flex-col",
};

const JUSTIFY_MAP: Record<string, string> = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
  around: "justify-around",
};

const ALIGN_MAP: Record<string, string> = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
};

function resolveGap(
  gap: ResponsiveValue<string> | undefined,
  defaultGap: string,
): { baseGap: string; responsiveCss: string | null; id: string } {
  const id = `flex-${crypto.randomUUID().slice(0, 9)}`;

  if (gap === undefined || typeof gap === "string") {
    return { baseGap: gap ?? defaultGap, responsiveCss: null, id };
  }

  // ResponsiveConfig -- generate CSS media queries
  const baseGap = gap.base ?? defaultGap;
  const rules = BREAKPOINTS.filter((bp) => gap[bp.key] !== undefined)
    .map(
      (bp) =>
        `@media (min-width: ${bp.minWidth}) { #${id} { gap: ${gap[bp.key]}; } }`,
    )
    .join("\n");

  return { baseGap, responsiveCss: rules || null, id };
}

export default function FlexboxLayout({
  config,
  blockRegistry,
  siteId,
}: FlexboxLayoutProps) {
  const {
    children = [],
    direction = "row",
    justify = "start",
    align = "start",
    gap,
    wrap = false,
  } = config;

  if (!children || children.length === 0) {
    return null;
  }

  const { baseGap, responsiveCss, id: flexId } = resolveGap(gap, "1rem");

  return (
    <>
      {responsiveCss && (
        <style dangerouslySetInnerHTML={{ __html: responsiveCss }} />
      )}
      <div
        id={flexId}
        className={cn(
          "flex",
          DIRECTION_MAP[direction] || "flex-row",
          JUSTIFY_MAP[justify] || "justify-start",
          ALIGN_MAP[align] || "items-start",
          wrap && "flex-wrap",
        )}
        style={{ gap: baseGap }}
      >
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
