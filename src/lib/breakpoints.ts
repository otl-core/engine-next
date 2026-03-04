/**
 * Breakpoint Configuration
 *
 * If you change these, also update the @theme block in globals.css.
 */

import type { Breakpoint } from "@otl-core/cms-types";

export const BREAKPOINTS: ReadonlyArray<{
  key: Breakpoint;
  minWidth: string;
}> = [
  { key: "sm", minWidth: "640px" },
  { key: "md", minWidth: "768px" },
  { key: "lg", minWidth: "1024px" },
  { key: "xl", minWidth: "1280px" },
  { key: "2xl", minWidth: "1536px" },
];
