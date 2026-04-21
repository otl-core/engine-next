/**
 * Flexbox Section
 * Top-level section: SectionWrapper + FlexboxLayout.
 */

import FlexboxLayout from "@/components/blocks/layouts/flexbox-layout";
import { blockRegistry } from "@/lib/registries/block-registry";
import type {
  BlockInstance,
  ResponsiveValue,
  SectionBaseConfig,
  SectionComponentProps,
} from "@otl-core/cms-types";
import SectionWrapper from "./section-wrapper";

interface FlexboxConfig extends SectionBaseConfig {
  children?: BlockInstance[];
  direction?: ResponsiveValue<string>;
  justify?: ResponsiveValue<string>;
  align?: ResponsiveValue<string>;
  gap?: ResponsiveValue<string>;
  wrap?: boolean;
}

export function FlexboxSection({
  config,
  siteId,
}: SectionComponentProps<FlexboxConfig>) {
  return (
    <SectionWrapper {...config}>
      <FlexboxLayout
        config={config}
        blockRegistry={blockRegistry}
        siteId={siteId}
      />
    </SectionWrapper>
  );
}
