"use client";

import { MarkdownInline } from "@/lib/markdown";
import { useFormField } from "@otl-core/forms";
import { useMemo } from "react";

// Map input types to appropriate autocomplete values
const getAutocomplete = (inputType: string, fieldId?: string): string => {
  switch (inputType) {
    case "email":
      return "email";
    case "tel":
      return "tel";
    case "url":
      return "url";
    case "password":
      return "current-password";
    case "text":
      if (fieldId) {
        const lowerFieldId = fieldId.toLowerCase();
        if (
          lowerFieldId.includes("firstname") ||
          lowerFieldId.includes("first_name") ||
          lowerFieldId.includes("fname")
        ) {
          return "given-name";
        }
        if (
          lowerFieldId.includes("lastname") ||
          lowerFieldId.includes("last_name") ||
          lowerFieldId.includes("lname")
        ) {
          return "family-name";
        }
        if (
          lowerFieldId.includes("fullname") ||
          lowerFieldId.includes("full_name") ||
          lowerFieldId.includes("name")
        ) {
          return "name";
        }
        if (
          lowerFieldId.includes("company") ||
          lowerFieldId.includes("organization")
        ) {
          return "organization";
        }
        if (
          lowerFieldId.includes("street") ||
          lowerFieldId.includes("address1")
        ) {
          return "street-address";
        }
        if (lowerFieldId.includes("address2")) {
          return "address-line2";
        }
        if (lowerFieldId.includes("city")) {
          return "address-level2";
        }
        if (
          lowerFieldId.includes("state") ||
          lowerFieldId.includes("province") ||
          lowerFieldId.includes("region")
        ) {
          return "address-level1";
        }
        if (lowerFieldId.includes("zip") || lowerFieldId.includes("postal")) {
          return "postal-code";
        }
        if (lowerFieldId.includes("country")) {
          return "country-name";
        }
      }
      return "on";
    case "number":
      return "off";
    case "date":
      return "bday";
    case "time":
      return "off";
    default:
      return "on";
  }
};

export const FormInputBlock = ({ blockId }: { blockId: string }) => {
  const field = useFormField<string | number>(blockId);

  const inputId = useMemo(() => `input-${blockId}`, [blockId]);

  if (!field || field.display === "none") return null;

  const inputType = field.type || "text";
  const isTextarea = inputType === "textarea";
  const isHidden = inputType === "hidden";

  if (isHidden) return null;

  const hasError = !!field.error;
  const inputClassName = `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
    hasError
      ? "border-destructive focus:ring-destructive"
      : "border-border focus:ring-primary"
  }`;

  const autocomplete = getAutocomplete(inputType, field.name);
  const helperId = field.helperText ? `helper-${blockId}` : undefined;
  const errorId = hasError ? `error-${blockId}` : undefined;
  const describedBy =
    [helperId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="w-full space-y-2">
      <label htmlFor={inputId} className="text-sm font-medium">
        <MarkdownInline>{field.label}</MarkdownInline>
        {field.required && <span className="text-destructive ml-1">*</span>}
      </label>
      {isTextarea ? (
        <textarea
          id={inputId}
          value={String(field.value || "")}
          onChange={(e) => field.onChange(e.target.value)}
          onBlur={field.onBlur}
          placeholder={field.placeholder || ""}
          rows={(field.additionalSettings?.rows ?? 4) as number}
          disabled={field.disabled}
          required={field.required}
          autoComplete={autocomplete}
          aria-invalid={hasError}
          aria-describedby={describedBy}
          className={inputClassName}
        />
      ) : (
        <input
          id={inputId}
          type={inputType}
          value={field.value || ""}
          onChange={(e) => {
            const newValue =
              inputType === "number" && e.target.value
                ? Number(e.target.value)
                : e.target.value;
            field.onChange(newValue);
          }}
          onBlur={field.onBlur}
          placeholder={field.placeholder || ""}
          disabled={field.disabled}
          required={field.required}
          autoComplete={autocomplete}
          aria-invalid={hasError}
          aria-describedby={describedBy}
          className={inputClassName}
        />
      )}
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
