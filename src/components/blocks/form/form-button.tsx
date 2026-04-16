"use client";

import { useFormAction } from "@otl-core/forms";
import { useCallback } from "react";

const VARIANT_CLASSES = {
  primary:
    "bg-primary text-primary-foreground hover:bg-primary/90 border-2 border-primary",
  secondary:
    "bg-secondary text-secondary-foreground hover:bg-secondary/80 border-2 border-secondary",
  outline:
    "border-2 border-primary text-primary hover:bg-primary/10 bg-transparent",
  ghost: "text-primary hover:bg-primary/10 border-2 border-transparent",
} as const;

const SIZE_CLASSES = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
} as const;

const ALIGN_CLASSES = {
  left: "justify-start",
  center: "justify-center",
  right: "justify-end",
} as const;

export const FormButtonBlock = ({ blockId }: { blockId: string }) => {
  const action = useFormAction(blockId);

  const handleClick = useCallback(async () => {
    if (action?.onClick) {
      await action.onClick();
    }
  }, [action]);

  if (!action || action.display === "none") return null;

  return (
    <div className={`w-full flex ${ALIGN_CLASSES[action.align]}`}>
      <button
        type="button"
        onClick={handleClick}
        disabled={action.disabled || action.loading}
        className={`inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${VARIANT_CLASSES[action.variant]} ${SIZE_CLASSES[action.size]} ${action.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {action.loading ? "Loading..." : action.text}
      </button>
    </div>
  );
};
