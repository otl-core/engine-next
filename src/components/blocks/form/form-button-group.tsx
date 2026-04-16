"use client";

import { MarkdownInline } from "@/lib/markdown";
import { useFormField } from "@otl-core/forms";
import { useCallback, useMemo } from "react";

function CheckIndicator({
  type,
  selected,
}: {
  type: string | undefined;
  selected: boolean;
}) {
  if (!type || type === "none") return null;
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center h-4 w-4 rounded border text-[10px] leading-none transition-colors ${
        selected
          ? "border-primary-foreground/50 bg-primary-foreground/20"
          : "border-border bg-transparent"
      }`}
      aria-hidden="true"
    >
      {selected ? (type === "check" ? "✓" : "●") : ""}
    </span>
  );
}

function getAlignClassName(align: string | undefined): string {
  switch (align) {
    case "center":
      return " justify-center";
    case "right":
      return " justify-end";
    default:
      return "";
  }
}

function getContainerClassName(
  appearance: string | undefined,
  align: string | undefined,
): string {
  const alignClass = getAlignClassName(align);
  switch (appearance) {
    case "full":
      return "flex flex-col gap-2" + alignClass;
    case "grid-2":
      return "grid grid-cols-2 gap-2";
    default:
      return "flex flex-wrap gap-2" + alignClass;
  }
}

function getButtonClassName(
  appearance: string | undefined,
  selected: boolean,
): string {
  const base = "px-4 py-2 border rounded-md text-sm transition-colors";
  const width = appearance === "full" ? " w-full" : "";
  const state = selected
    ? " bg-primary text-primary-foreground border-primary"
    : " border-border hover:bg-muted";
  const indicator = " inline-flex items-center justify-center gap-2";
  return base + width + state + indicator;
}

export const FormButtonGroupBlock = ({ blockId }: { blockId: string }) => {
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
  const align = field.additionalSettings.align as string | undefined;
  const appearance = field.additionalSettings.appearance as string | undefined;
  const checkIndicator = field.additionalSettings.checkIndicator as
    | string
    | undefined;
  const groupId = `button-group-${blockId}`;
  const helperId = field.helperText ? `helper-${blockId}` : undefined;
  const errorId = hasError ? `error-${blockId}` : undefined;
  const describedBy =
    [helperId, errorId].filter(Boolean).join(" ") || undefined;

  const containerClassName = getContainerClassName(appearance, align);

  if (isSingle) {
    return (
      <div className="space-y-2" role="group" aria-labelledby={groupId}>
        <div id={groupId} className="text-sm font-medium">
          <MarkdownInline>{field.label}</MarkdownInline>
          {field.required && <span className="text-destructive ml-1">*</span>}
        </div>
        <div
          className={containerClassName}
          onBlur={field.onBlur}
          role="radiogroup"
          aria-invalid={hasError}
          aria-describedby={describedBy}
        >
          {options.map((opt, idx) => {
            const selected = field.value === opt.value;
            return (
              <button
                key={idx}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => field.onChange(opt.value)}
                disabled={field.disabled}
                className={getButtonClassName(appearance, selected)}
              >
                <CheckIndicator type={checkIndicator} selected={selected} />
                <MarkdownInline>{opt.label}</MarkdownInline>
              </button>
            );
          })}
        </div>
        {field.helperText && !hasError && (
          <p id={helperId} className="text-xs text-muted-foreground mt-2">
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
  }

  return (
    <div className="space-y-2" role="group" aria-labelledby={groupId}>
      <div id={groupId} className="text-sm font-medium">
        <MarkdownInline>{field.label}</MarkdownInline>
        {field.required && <span className="text-destructive ml-1">*</span>}
      </div>
      <div
        className={containerClassName}
        onBlur={field.onBlur}
        aria-invalid={hasError}
        aria-describedby={describedBy}
      >
        {options.map((opt, idx) => {
          const selected = value.includes(opt.value);
          return (
            <button
              key={idx}
              type="button"
              role="checkbox"
              aria-checked={selected}
              onClick={() => handleToggle(opt.value)}
              disabled={field.disabled}
              className={getButtonClassName(appearance, selected)}
            >
              <CheckIndicator type={checkIndicator} selected={selected} />
              <MarkdownInline>{opt.label}</MarkdownInline>
            </button>
          );
        })}
      </div>
      {field.helperText && !hasError && (
        <p id={helperId} className="text-xs text-muted-foreground mt-2">
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
