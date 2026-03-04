/**
 * Test Fixtures - Mock Blocks
 */

import type { SchemaInstance } from "@otl-core/cms-types";

export const mockTextBlock: SchemaInstance = {
  id: "text-1",
  type: "text",
  config: {
    content: "This is test content",
    alignment: "left",
  },
};

export const mockImageBlock: SchemaInstance = {
  id: "image-1",
  type: "image",
  config: {
    src: "/test-image.jpg",
    alt: "Test image",
    caption: "Test caption",
    width: "100%",
  },
};

export const mockButtonBlock: SchemaInstance = {
  id: "button-1",
  type: "button",
  config: {
    text: "Click me",
    url: "/test",
    variant: "primary",
  },
};
