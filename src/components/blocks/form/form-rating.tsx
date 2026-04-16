"use client";

import { MarkdownInline } from "@/lib/markdown";
import { useFormField } from "@otl-core/forms";
import { HeartIcon, StarIcon, ThumbsUpIcon } from "lucide-react";
import { useCallback, useMemo } from "react";

const ICONS = {
  star: StarIcon,
  heart: HeartIcon,
  "thumbs-up": ThumbsUpIcon,
} as const;

type RatingIcon = keyof typeof ICONS;

export const FormRatingBlock = ({ blockId }: { blockId: string }) => {
  const field = useFormField<number>(blockId);

  const groupId = useMemo(() => `rating-${blockId}`, [blockId]);

  const handleSelect = useCallback(
    (rating: number) => {
      if (!field || field.disabled) return;
      field.onChange(rating);
    },
    [field],
  );

  if (!field || field.display === "none") return null;

  const maxRating =
    typeof field.additionalSettings?.maxRating === "number"
      ? field.additionalSettings.maxRating
      : 5;

  const iconKey =
    typeof field.additionalSettings?.icon === "string" &&
    field.additionalSettings.icon in ICONS
      ? (field.additionalSettings.icon as RatingIcon)
      : "star";

  const Icon = ICONS[iconKey];
  const current = (field.value as number | undefined) ?? 0;
  const hasError = !!field.error;
  const helperId = field.helperText ? `helper-${blockId}` : undefined;
  const errorId = hasError ? `error-${blockId}` : undefined;
  const describedBy =
    [helperId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="space-y-2">
      <div id={groupId} className="text-sm font-medium">
        <MarkdownInline>{field.label}</MarkdownInline>
        {field.required && <span className="text-destructive ml-1">*</span>}
      </div>
      <div
        className="flex gap-1"
        role="radiogroup"
        aria-labelledby={groupId}
        aria-invalid={hasError}
        aria-describedby={describedBy}
        onBlur={field.onBlur}
      >
        {Array.from({ length: maxRating }, (_, i) => i + 1).map((rating) => (
          <button
            key={rating}
            type="button"
            role="radio"
            aria-checked={current >= rating}
            aria-label={`${rating} out of ${maxRating}`}
            onClick={() => handleSelect(rating)}
            disabled={field.disabled}
            className={`transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded ${
              field.disabled
                ? "cursor-not-allowed opacity-50"
                : "cursor-pointer"
            }`}
          >
            <Icon
              className={`h-6 w-6 transition-colors ${
                current >= rating
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-muted-foreground"
              }`}
            />
          </button>
        ))}
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
