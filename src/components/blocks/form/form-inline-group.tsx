"use client";

import { useFormField } from "@otl-core/forms";
import type { ComponentType } from "react";
import { FormButtonBlock } from "./form-button";
import { FormCheckboxBlock } from "./form-checkbox";
import { FormInputBlock } from "./form-input";
import { FormRadioBlock } from "./form-radio";
import { FormSelectBlock } from "./form-select";
import { FormSliderBlock } from "./form-slider";
import { FormToggleGroupBlock } from "./form-toggle-group";

type BlockComponent = ComponentType<{
  blockId: string;
  siteId?: string;
}>;

interface InlineGroupSettings {
  blocks?: Array<{ id: string; type: string }>;
  gap?: "none" | "sm" | "md" | "lg";
  verticalAlign?: "start" | "center" | "end" | "stretch" | "baseline";
}

const GAP_CLASSES = {
  none: "gap-0",
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
} as const;

const ALIGN_CLASSES = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
  baseline: "items-baseline",
} as const;

export const FormInlineGroupBlock = ({
  blockId,
  siteId,
}: {
  blockId: string;
  siteId?: string;
}) => {
  const field = useFormField<unknown>(blockId);

  if (!field || field.display === "none") return null;

  const settings = field.additionalSettings as InlineGroupSettings;
  const blocks = settings.blocks || [];
  const gap = settings.gap || "md";
  const verticalAlign = settings.verticalAlign || "start";

  return (
    <div className={`flex ${GAP_CLASSES[gap]} ${ALIGN_CLASSES[verticalAlign]}`}>
      {blocks.map((block) => {
        const Component = inlineGroupBlockLookup[block.type];
        if (!Component) return null;
        return (
          <div key={block.id} className="flex-1 min-w-0">
            <Component blockId={block.id} siteId={siteId} />
          </div>
        );
      })}
    </div>
  );
};

// Defined after FormInlineGroupBlock so the self-reference is valid.
// The component function above captures this variable at render time (not at
// module initialisation), so the declaration order is safe.
const inlineGroupBlockLookup: Record<string, BlockComponent> = {
  "form-input": FormInputBlock,
  "form-checkbox": FormCheckboxBlock,
  "form-radio": FormRadioBlock,
  "form-select": FormSelectBlock,
  "form-toggle-group": FormToggleGroupBlock,
  "form-slider": FormSliderBlock,
  "form-button": FormButtonBlock,
  "form-inline-group": FormInlineGroupBlock,
};
