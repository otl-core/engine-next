/**
 * Grid Layout
 * Pure CSS Grid rendering logic shared between the Grid section and grid-layout block.
 * Renders children via BlockRenderer. No SectionWrapper.
 */

import { BlockRegistry, BlockRenderer } from "@otl-core/block-registry";
import type { BlockInstance, ResponsiveValue } from "@otl-core/cms-types";
import { cn, normalizeResponsiveValue } from "@otl-core/style-utils";
import { BREAKPOINTS } from "@/lib/breakpoints";

// --- Types ---

export interface GridLayoutConfig {
  children?: BlockInstance[];
  columns?: ResponsiveValue<string>;
  columnGap?: ResponsiveValue<string>;
  rowGap?: ResponsiveValue<string>;
  alignItems?: ResponsiveValue<string>;
  justifyItems?: ResponsiveValue<string>;
  autoFlow?: "row" | "column" | "dense";
}

interface GridLayoutProps {
  config: GridLayoutConfig;
  blockRegistry: BlockRegistry;
  siteId?: string;
  gridId: string;
}

// --- CSS Generation Helpers ---

// Uses BREAKPOINTS from @/lib/breakpoints

/**
 * Convert percentage-based column values to fr units so gaps don't cause overflow.
 * E.g. "50% 50%" becomes "50fr 50fr", "33% 67%" becomes "33fr 67fr".
 * Non-percentage values (fr, px, minmax, etc.) are left untouched.
 */
function percentColumnsToFr(value: string): string {
  const parts = value.trim().split(/\s+/);
  const allPercent = parts.every((p) => /^\d+(\.\d+)?%$/.test(p));
  if (!allPercent) return value;
  return parts.map((p) => `${parseFloat(p)}fr`).join(" ");
}

function normalizeColumns(columns: ResponsiveValue<string> | undefined): {
  base: string;
  sm?: string;
  md?: string;
  lg?: string;
  xl?: string;
  "2xl"?: string;
} {
  if (!columns) return { base: "1fr" };
  if (typeof columns === "string") return { base: percentColumnsToFr(columns) };
  const result: Record<string, string> = {};
  for (const [key, val] of Object.entries(columns)) {
    if (typeof val === "string") {
      result[key] = percentColumnsToFr(val);
    }
  }
  if (!result.base) result.base = "1fr";
  return result as ReturnType<typeof normalizeColumns>;
}

function resolveResponsive(
  value: ResponsiveValue<string> | undefined,
  fallback: string,
): {
  base: string;
  sm?: string;
  md?: string;
  lg?: string;
  xl?: string;
  "2xl"?: string;
} {
  if (!value) return { base: fallback };
  if (typeof value === "string") return { base: value };
  return {
    base: value.base ?? fallback,
    sm: value.sm,
    md: value.md,
    lg: value.lg,
    xl: value.xl,
    "2xl": value["2xl"],
  };
}

export function generateGridCSS(
  gridId: string,
  columns: ResponsiveValue<string> | undefined,
  colGap: ResponsiveValue<string>,
  rowGap: ResponsiveValue<string>,
  alignItems?: ResponsiveValue<string>,
  justifyItems?: ResponsiveValue<string>,
): string {
  const normalizedColumns = normalizeColumns(columns);
  const resolvedColGap = resolveResponsive(colGap, "1rem");
  const resolvedRowGap = resolveResponsive(rowGap, "1rem");
  const normalizedAlign = normalizeResponsiveValue(alignItems);
  const normalizedJustify = normalizeResponsiveValue(justifyItems);
  const css: string[] = [];

  const baseStyles = [
    `grid-template-columns: ${normalizedColumns.base}`,
    `column-gap: ${resolvedColGap.base}`,
    `row-gap: ${resolvedRowGap.base}`,
  ];
  if (normalizedAlign.base) {
    baseStyles.push(`align-items: ${normalizedAlign.base}`);
  }
  if (normalizedJustify.base) {
    baseStyles.push(`justify-items: ${normalizedJustify.base}`);
  }
  css.push(`#${gridId} { ${baseStyles.map((s) => s + ";").join(" ")} }`);

  for (const { key, minWidth } of BREAKPOINTS) {
    const parts: string[] = [];
    const columnValue = normalizedColumns[key];
    if (columnValue) parts.push(`grid-template-columns: ${columnValue};`);
    const colGapValue = resolvedColGap[key];
    if (colGapValue) parts.push(`column-gap: ${colGapValue};`);
    const rowGapValue = resolvedRowGap[key];
    if (rowGapValue) parts.push(`row-gap: ${rowGapValue};`);
    const alignBp = normalizedAlign[key];
    if (alignBp) parts.push(`align-items: ${alignBp};`);
    const justifyBp = normalizedJustify[key];
    if (justifyBp) parts.push(`justify-items: ${justifyBp};`);
    if (parts.length > 0) {
      css.push(
        `@media (min-width: ${minWidth}) { #${gridId} { ${parts.join(" ")} } }`,
      );
    }
  }

  return css.join("\n");
}

// --- Component ---

export default function GridLayout({
  config,
  blockRegistry,
  siteId,
  gridId,
}: GridLayoutProps) {
  const {
    children = [],
    columns,
    columnGap = "1rem",
    rowGap = "1rem",
    alignItems,
    justifyItems,
    autoFlow,
  } = config;

  if (!children || children.length === 0) {
    return null;
  }

  const autoFlowMap: Record<string, string> = {
    column: "grid-flow-col",
    dense: "grid-flow-dense",
  };
  const autoFlowClass = (autoFlow && autoFlowMap[autoFlow]) || "";

  return (
    <div id={gridId} className={cn("grid", autoFlowClass)}>
      <style
        dangerouslySetInnerHTML={{
          __html: generateGridCSS(
            gridId,
            columns,
            columnGap,
            rowGap,
            alignItems,
            justifyItems,
          ),
        }}
      />
      {children.map((child, index) => {
        const placement = child.config?._gridPlacement as
          | { colSpan?: number; rowSpan?: number }
          | undefined;
        const placementStyle: React.CSSProperties = {};
        if (placement?.colSpan && placement.colSpan > 1) {
          placementStyle.gridColumn = `span ${placement.colSpan}`;
        }
        if (placement?.rowSpan && placement.rowSpan > 1) {
          placementStyle.gridRow = `span ${placement.rowSpan}`;
        }

        return (
          <div
            key={child.id || `child-${child.type}-${index}`}
            style={
              Object.keys(placementStyle).length > 0
                ? placementStyle
                : undefined
            }
          >
            <BlockRenderer
              block={child}
              blockRegistry={blockRegistry}
              siteId={siteId}
            />
          </div>
        );
      })}
    </div>
  );
}
