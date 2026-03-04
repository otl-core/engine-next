/**
 * Container Section
 * Top-level section: SectionWrapper + ContainerLayout.
 * Width-constrained wrapper for a single child.
 */

import { blockRegistry } from "@/lib/registries/block-registry";
import type {
  BlockInstance,
  ResponsiveValue,
  SectionBaseConfig,
  SectionComponentProps,
} from "@otl-core/cms-types";
import SectionWrapper from "./section-wrapper";
import ContainerLayout from "../blocks/layouts/container-layout";

interface ContainerConfig extends SectionBaseConfig {
  child?: BlockInstance[];
  maxWidth?: ResponsiveValue<string>;
  centered?: boolean;
}

export function ContainerSection({
  config,
  siteId,
}: SectionComponentProps<ContainerConfig>) {
  return (
    <SectionWrapper {...config}>
      <ContainerLayout
        config={config}
        blockRegistry={blockRegistry}
        siteId={siteId}
      />
    </SectionWrapper>
  );
}
