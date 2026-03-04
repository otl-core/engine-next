/**
 * Grid Section
 * Top-level section: SectionWrapper + GridLayout.
 * Uses responsive columns via ResponsiveValue<string>.
 */

import GridLayout from "@/components/blocks/layouts/grid-layout";
import { blockRegistry } from "@/lib/registries/block-registry";
import type {
  BlockInstance,
  ResponsiveValue,
  SectionBaseConfig,
  SectionComponentProps,
} from "@otl-core/cms-types";
import SectionWrapper from "./section-wrapper";

interface GridConfig extends SectionBaseConfig {
  children?: BlockInstance[];
  columns?: ResponsiveValue<string>;
  columnGap?: string;
  rowGap?: string;
  alignItems?: "start" | "center" | "end" | "stretch";
  justifyItems?: "start" | "center" | "end" | "stretch";
  autoFlow?: "row" | "column" | "dense";
}

export function GridSection({
  config,
  siteId,
}: SectionComponentProps<GridConfig>) {
  const gridId = `grid-${crypto.randomUUID().slice(0, 9)}`;

  return (
    <SectionWrapper {...config}>
      <GridLayout
        config={config}
        blockRegistry={blockRegistry}
        siteId={siteId}
        gridId={gridId}
      />
    </SectionWrapper>
  );
}
