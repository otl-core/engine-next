/**
 * Test Fixtures - Mock Pages
 */

import type { SchemaInstance } from "@otl-core/cms-types";

export const mockPage = {
  document_id: "page-1",
  sections: [
    {
      id: "section-1",
      type: "container",
      config: {
        width: "container",
        centered: true,
      },
    },
  ] as SchemaInstance[],
  updated_by: "test-user",
  updated_at: "2024-01-01T00:00:00Z",
  created_by: "test-user",
  created_at: "2024-01-01T00:00:00Z",
};

export const mockPageWithMultipleSections = {
  document_id: "page-2",
  sections: [
    {
      id: "section-1",
      type: "container",
      config: { width: "container", centered: true },
    },
    {
      id: "section-2",
      type: "grid",
      config: {
        columns: { base: "1fr", md: "1fr 1fr", lg: "1fr 1fr 1fr" },
        columnGap: "1rem",
        rowGap: "1rem",
      },
    },
    {
      id: "section-3",
      type: "content-blocks",
      config: {
        children: [
          { id: "block-1", type: "text", config: { content: "Hello" } },
        ],
      },
    },
  ] as SchemaInstance[],
  updated_by: "test-user",
  updated_at: "2024-01-01T00:00:00Z",
  created_by: "test-user",
  created_at: "2024-01-01T00:00:00Z",
};
