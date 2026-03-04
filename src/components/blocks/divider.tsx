/**
 * Divider Block
 * Visual separator line
 */

import type { BlockComponentProps } from "@otl-core/cms-types";

interface DividerConfig {
  style?: "solid" | "dashed" | "dotted" | "stars" | "space";
  spacing?: number;
  width?: "full" | "medium" | "small";
}

const WIDTH_MAP: Record<string, string> = {
  full: "w-full",
  medium: "w-3/5 mx-auto",
  small: "w-[30%] mx-auto",
};

const STYLE_MAP: Record<string, string> = {
  solid: "border-solid",
  dashed: "border-dashed",
  dotted: "border-dotted",
};

export function DividerBlock({ config }: BlockComponentProps<DividerConfig>) {
  const { style = "solid", spacing = 32, width = "full" } = config;

  if (style === "space") {
    return <div style={{ height: `${spacing}px` }} />;
  }

  if (style === "stars") {
    return (
      <div
        className={`text-center text-muted-foreground ${WIDTH_MAP[width] || "w-full"}`}
        style={{ margin: `${spacing}px auto` }}
      >
        * * *
      </div>
    );
  }

  return (
    <hr
      className={`border-border ${STYLE_MAP[style] || "border-solid"} ${WIDTH_MAP[width] || "w-full"}`}
      style={{ margin: `${spacing}px auto` }}
    />
  );
}
