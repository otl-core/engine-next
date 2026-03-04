/**
 * Spacer Block
 * Vertical spacing in collection posts
 */

import type { BlockComponentProps } from "@otl-core/cms-types";

interface SpacerConfig {
  height?: number;
}

export function SpacerBlock({ config }: BlockComponentProps<SpacerConfig>) {
  const { height = 32 } = config;

  return <div style={{ height: `${height}px` }} />;
}
