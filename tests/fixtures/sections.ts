/**
 * Test Fixtures - Mock Sections
 */

import type { SchemaInstance } from "@otl-core/cms-types";

export const mockContainerSection: SchemaInstance = {
  id: "container-1",
  type: "container",
  config: {
    width: "container",
    centered: true,
  },
};

export const mockGridSection: SchemaInstance = {
  id: "grid-1",
  type: "grid",
  config: {
    columns: { base: "1fr", md: "1fr 1fr", lg: "1fr 1fr 1fr" },
    columnGap: "1rem",
    rowGap: "1rem",
  },
};

export const mockContentBlocksSection: SchemaInstance = {
  id: "content-blocks-1",
  type: "content-blocks",
  config: {
    children: [
      { id: "block-1", type: "text", config: { content: "Test content" } },
    ],
  },
};
