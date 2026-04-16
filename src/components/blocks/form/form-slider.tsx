"use client";

import { Slider } from "@/components/ui/slider";
import { MarkdownInline } from "@/lib/markdown";
import { useFormField } from "@otl-core/forms";
import { useMemo } from "react";

export const FormSliderBlock = ({ blockId }: { blockId: string }) => {
  const field = useFormField<number>(blockId);

  const sliderId = useMemo(() => `slider-${blockId}`, [blockId]);

  if (!field || field.display === "none") return null;

  const min = (field.additionalSettings?.min ?? 0) as number;
  const max = (field.additionalSettings?.max ?? 100) as number;
  const step = (field.additionalSettings?.step ?? 1) as number;
  const hasError = !!field.error;
  const helperId = field.helperText ? `helper-${blockId}` : undefined;
  const errorId = hasError ? `error-${blockId}` : undefined;
  const describedBy =
    [helperId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="space-y-4">
      <label htmlFor={sliderId} className="text-sm font-medium">
        <MarkdownInline>{field.label}</MarkdownInline>
        {field.required && <span className="text-destructive ml-1">*</span>}
      </label>
      <div className="space-y-2">
        <Slider
          id={sliderId}
          value={[Number(field.value) || min]}
          onValueChange={(vals) => field.onChange(vals[0])}
          onBlur={field.onBlur}
          min={min}
          max={max}
          step={step}
          disabled={field.disabled}
          aria-invalid={hasError}
          aria-describedby={describedBy}
          className="w-full"
        />
        <span className="text-sm font-medium min-w-[3ch]" aria-live="polite">
          {(field.value as number | undefined) ?? min}
        </span>
      </div>
      {field.helperText && !hasError && (
        <p id={helperId} className="text-xs text-muted-foreground">
          <MarkdownInline>{field.helperText}</MarkdownInline>
        </p>
      )}
      {hasError && (
        <p id={errorId} className="text-xs text-destructive" role="alert">
          {field.error}
        </p>
      )}
    </div>
  );
};
