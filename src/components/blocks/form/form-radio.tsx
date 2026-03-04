"use client";

import { useFormField } from "@otl-core/forms";
import { useMemo } from "react";

export const FormRadioBlock = ({ blockId }: { blockId: string }) => {
  const field = useFormField<string>(blockId);

  const groupId = useMemo(() => `radio-group-${blockId}`, [blockId]);

  if (!field || field.display === "none") return null;

  const hasError = !!field.error;
  const options =
    (field.additionalSettings.options as Array<{
      value: string;
      label: string;
    }>) || [];

  const helperId = field.helperText ? `helper-${blockId}` : undefined;
  const errorId = hasError ? `error-${blockId}` : undefined;
  const describedBy =
    [helperId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium">
        {field.label}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </legend>
      <div
        role="radiogroup"
        aria-labelledby={groupId}
        aria-invalid={hasError}
        aria-describedby={describedBy}
        className="space-y-2"
        onBlur={field.onBlur}
      >
        {options.map((opt, idx) => {
          const radioId = `radio-${blockId}-${idx}`;
          return (
            <div key={idx} className="flex items-center space-x-2">
              <input
                id={radioId}
                type="radio"
                name={blockId}
                value={opt.value}
                checked={field.value === opt.value}
                onChange={() => field.onChange(opt.value)}
                disabled={field.disabled}
                required={field.required}
                className="h-4 w-4 border-border"
              />
              <label htmlFor={radioId} className="text-sm cursor-pointer">
                {opt.label}
              </label>
            </div>
          );
        })}
      </div>
      {field.helperText && !hasError && (
        <p id={helperId} className="text-xs text-muted-foreground mt-2">
          {field.helperText}
        </p>
      )}
      {hasError && (
        <p id={errorId} className="text-xs text-destructive" role="alert">
          {field.error}
        </p>
      )}
    </fieldset>
  );
};
