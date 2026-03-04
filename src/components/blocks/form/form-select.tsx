"use client";

import { useFormField } from "@otl-core/forms";
import { useMemo } from "react";

export const FormSelectBlock = ({ blockId }: { blockId: string }) => {
  const field = useFormField<string>(blockId);

  const selectId = useMemo(() => `select-${blockId}`, [blockId]);

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
    <div className="space-y-2">
      <label htmlFor={selectId} className="text-sm font-medium">
        {field.label}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </label>
      <select
        id={selectId}
        value={field.value || ""}
        onChange={(e) => field.onChange(e.target.value)}
        onBlur={field.onBlur}
        disabled={field.disabled}
        required={field.required}
        aria-invalid={hasError}
        aria-describedby={describedBy}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
          hasError
            ? "border-destructive focus:ring-destructive"
            : "border-border focus:ring-primary"
        }`}
      >
        <option value="">{field.placeholder || "Select an option"}</option>
        {options.map((opt, idx) => (
          <option key={idx} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
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
