"use client";

import { useFormField } from "@otl-core/forms";
import { useCallback, useMemo } from "react";

export const FormToggleGroupBlock = ({ blockId }: { blockId: string }) => {
  const field = useFormField<string | string[]>(blockId);

  const value = useMemo(
    () => (field && Array.isArray(field.value) ? field.value : []),
    [field],
  );

  const handleToggle = useCallback(
    (optionValue: string) => {
      if (!field) return;
      const newValue = value.includes(optionValue)
        ? value.filter((v) => v !== optionValue)
        : [...value, optionValue];
      field.onChange(newValue);
    },
    [value, field],
  );

  if (!field || field.display === "none") return null;

  const hasError = !!field.error;
  const options =
    (field.additionalSettings.options as Array<{
      value: string;
      label: string;
    }>) || [];
  const isSingle = !field.additionalSettings.multiple;
  const groupId = `toggle-group-${blockId}`;
  const helperId = field.helperText ? `helper-${blockId}` : undefined;
  const errorId = hasError ? `error-${blockId}` : undefined;
  const describedBy =
    [helperId, errorId].filter(Boolean).join(" ") || undefined;

  if (isSingle) {
    return (
      <div className="space-y-2" role="group" aria-labelledby={groupId}>
        <div id={groupId} className="text-sm font-medium">
          {field.label}
          {field.required && <span className="text-destructive ml-1">*</span>}
        </div>
        <div
          className="flex gap-2"
          onBlur={field.onBlur}
          role="radiogroup"
          aria-invalid={hasError}
          aria-describedby={describedBy}
        >
          {options.map((opt, idx) => (
            <button
              key={idx}
              type="button"
              role="radio"
              aria-checked={field.value === opt.value}
              onClick={() => field.onChange(opt.value)}
              disabled={field.disabled}
              className={`px-4 py-2 border rounded-md text-sm transition-colors ${
                field.value === opt.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border hover:bg-muted"
              }`}
            >
              {opt.label}
            </button>
          ))}
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
      </div>
    );
  }

  return (
    <div className="space-y-2" role="group" aria-labelledby={groupId}>
      <div id={groupId} className="text-sm font-medium">
        {field.label}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </div>
      <div
        className="flex gap-2"
        onBlur={field.onBlur}
        aria-invalid={hasError}
        aria-describedby={describedBy}
      >
        {options.map((opt, idx) => (
          <button
            key={idx}
            type="button"
            role="checkbox"
            aria-checked={value.includes(opt.value)}
            onClick={() => handleToggle(opt.value)}
            disabled={field.disabled}
            className={`px-4 py-2 border rounded-md text-sm transition-colors ${
              value.includes(opt.value)
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border hover:bg-muted"
            }`}
          >
            {opt.label}
          </button>
        ))}
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
    </div>
  );
};
