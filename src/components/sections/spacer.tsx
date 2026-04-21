/**
 * Spacer Section
 * Vertical spacing with optional background, container behavior, and dimensions.
 * Height and maxWidth are now handled as dimension fields via SectionWrapper.
 */

import type {
  SectionBaseConfig,
  SectionComponentProps,
} from "@otl-core/cms-types";
import SectionWrapper from "./section-wrapper";

type SpacerConfig = SectionBaseConfig;

export function SpacerSection({ config }: SectionComponentProps<SpacerConfig>) {
  const defaultHeight = !config.height ? "3rem" : undefined;

  return (
    <SectionWrapper {...config}>
      <div
        style={{
          height: defaultHeight,
        }}
      />
    </SectionWrapper>
  );
}
