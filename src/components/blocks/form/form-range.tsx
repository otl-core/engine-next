"use client";

import { Slider } from "@/components/ui/slider";
import { useFormField } from "@otl-core/forms";
import { useMemo } from "react";

export const FormRangeBlock = ({ blockId }: { blockId: string }) => {
  const field = useFormField<[number, number]>(blockId);

  const sliderId = useMemo(() => `range-${blockId}`, [blockId]);

  if (!field || field.display === "none") return null;

  const min = (field.additionalSettings?.min ?? 0) as number;
  const max = (field.additionalSettings?.max ?? 100) as number;
  const step = (field.additionalSettings?.step ?? 1) as number;

  const currentValue: [number, number] = Array.isArray(field.value)
    ? [field.value[0] ?? min, field.value[1] ?? max]
    : [min, max];

  const hasError = !!field.error;
  const helperId = field.helperText ? `helper-${blockId}` : undefined;
  const errorId = hasError ? `error-${blockId}` : undefined;
  const describedBy =
    [helperId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="space-y-4">
      <label htmlFor={sliderId} className="text-sm font-medium">
        {field.label}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </label>
      <div className="space-y-3">
        <Slider
          id={sliderId}
          value={currentValue}
          onValueChange={(vals) =>
            field.onChange([vals[0] ?? min, vals[1] ?? max])
          }
          onBlur={field.onBlur}
          min={min}
          max={max}
          step={step}
          disabled={field.disabled}
          aria-invalid={hasError}
          aria-describedby={describedBy}
          className="w-full"
        />
        <div className="flex justify-between text-sm font-medium">
          <span aria-live="polite">{currentValue[0]}</span>
          <span aria-live="polite">{currentValue[1]}</span>
        </div>
      </div>
      {field.helperText && !hasError && (
        <p id={helperId} className="text-xs text-muted-foreground">
          {field.helperText}
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
