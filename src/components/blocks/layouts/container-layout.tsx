/**
 * Container Layout
 * Pure width-constrained rendering logic shared between the Container section and container-layout block.
 * Renders children via BlockRenderer. No SectionWrapper.
 */

import { BlockRegistry, BlockRenderer } from "@otl-core/block-registry";
import type { BlockInstance, ResponsiveValue } from "@otl-core/cms-types";
import { cn, normalizeResponsiveValue } from "@otl-core/style-utils";
import { BREAKPOINTS } from "@/lib/breakpoints";

export interface ContainerLayoutConfig {
  child?: BlockInstance[];
  maxWidth?: ResponsiveValue<string>;
  centered?: boolean;
}

interface ContainerLayoutProps {
  config: ContainerLayoutConfig;
  blockRegistry: BlockRegistry;
  siteId?: string;
}

function generateMaxWidthCSS(
  containerId: string,
  maxWidth: ResponsiveValue<string> | undefined,
): string | null {
  const normalizedMaxWidth = normalizeResponsiveValue(maxWidth);

  if (!normalizedMaxWidth.base) {
    return null;
  }

  const css: string[] = [];
  const targetClass = `#${containerId}`;

  // Generate base styles
  css.push(`${targetClass}{max-width:${normalizedMaxWidth.base}}`);

  // Generate responsive styles
  BREAKPOINTS.forEach(({ key, minWidth }) => {
    const maxWidthBp = normalizedMaxWidth[key];
    if (maxWidthBp) {
      css.push(
        `@media (min-width:${minWidth}){${targetClass}{max-width:${maxWidthBp}}}`,
      );
    }
  });

  return css.length > 0 ? css.join("") : null;
}

export default function ContainerLayout({
  config,
  blockRegistry,
  siteId,
}: ContainerLayoutProps) {
  const { child, maxWidth, centered = true } = config;

  const children = Array.isArray(child) ? child : [];

  if (children.length === 0) {
    return null;
  }

  const containerId = `container-${crypto.randomUUID().slice(0, 9)}`;
  const maxWidthCSS = generateMaxWidthCSS(containerId, maxWidth);

  return (
    <>
      {maxWidthCSS && (
        <style dangerouslySetInnerHTML={{ __html: maxWidthCSS }} />
      )}
      <div id={containerId} className={cn("w-full", centered && "mx-auto")}>
        {children.map((block, index) => (
          <BlockRenderer
            key={block.id || `child-${block.type}-${index}`}
            block={block}
            blockRegistry={blockRegistry}
            siteId={siteId}
          />
        ))}
      </div>
    </>
  );
}
