"use client";

import { useFormField } from "@otl-core/forms";
import { normalizeNewlines } from "@/lib/markdown";
import { useCallback, useMemo } from "react";
import ReactMarkdown from "react-markdown";

export const FormCheckboxBlock = ({ blockId }: { blockId: string }) => {
  const field = useFormField<boolean | string[]>(blockId);

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
  const options = field.additionalSettings.options as
    | Array<{ value: string; label: string; check_required?: boolean }>
    | undefined;
  const isSingle = !options || options.length === 0;
  const errorId = hasError ? `error-${blockId}` : undefined;

  if (isSingle) {
    const inputId = `checkbox-${blockId}`;

    return (
      <div className="space-y-2">
        <div className="flex items-start space-x-2">
          <input
            id={inputId}
            type="checkbox"
            checked={Boolean(field.value)}
            onChange={(e) => field.onChange(e.target.checked)}
            onBlur={field.onBlur}
            disabled={field.disabled}
            required={field.required}
            aria-invalid={hasError}
            aria-describedby={errorId}
            className="mt-1 h-4 w-4 border-border rounded"
          />
          <div className="flex-1">
            <label
              htmlFor={inputId}
              className="text-sm font-medium max-w-none cursor-pointer"
            >
              <ReactMarkdown
                components={{
                  p: ({ children }) => <span>{children}</span>,
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {children}
                    </a>
                  ),
                }}
              >
                {normalizeNewlines(field.label)}
              </ReactMarkdown>
            </label>
          </div>
        </div>
        {hasError && (
          <p id={errorId} className="text-xs text-destructive" role="alert">
            {field.error}
          </p>
        )}
      </div>
    );
  }

  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium">{field.label}</legend>
      <div
        role="group"
        aria-invalid={hasError}
        aria-describedby={errorId}
        className="space-y-2"
        onBlur={field.onBlur}
      >
        {options.map((opt, idx) => {
          const inputId = `checkbox-${blockId}-${opt.value}`;

          return (
            <div key={idx} className="flex items-start space-x-2">
              <input
                id={inputId}
                type="checkbox"
                checked={value.includes(opt.value)}
                onChange={() => handleToggle(opt.value)}
                disabled={field.disabled}
                required={opt.check_required}
                className="mt-1 h-4 w-4 border-border rounded"
              />
              <label
                htmlFor={inputId}
                className="text-sm max-w-none flex-1 cursor-pointer"
              >
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <span>{children}</span>,
                    a: ({ href, children }) => (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {children}
                      </a>
                    ),
                  }}
                >
                  {normalizeNewlines(opt.label)}
                </ReactMarkdown>
              </label>
            </div>
          );
        })}
      </div>
      {hasError && (
        <p id={errorId} className="text-xs text-destructive" role="alert">
          {field.error}
        </p>
      )}
    </fieldset>
  );
};
