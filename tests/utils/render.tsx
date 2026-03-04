/**
 * Test Utilities - Render Helper
 */

import { render as rtlRender } from "@testing-library/react";
import { ReactElement } from "react";

export function render(ui: ReactElement) {
  return rtlRender(ui);
}

export * from "@testing-library/react";
