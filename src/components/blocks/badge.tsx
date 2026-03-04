/**
 * Badge Block
 * Small label or tag for highlighting information
 */

import type { BlockComponentProps } from "@otl-core/cms-types";

interface BadgeConfig {
  text?: string;
  variant?:
    | "primary"
    | "secondary"
    | "accent"
    | "muted"
    | "outline"
    | "destructive";
  size?: "sm" | "md" | "lg";
}

const VARIANT_CLASSES = {
  primary: "bg-primary text-primary-foreground",
  secondary: "bg-secondary text-secondary-foreground",
  accent: "bg-accent text-accent-foreground",
  muted: "bg-muted text-muted-foreground",
  outline: "border border-border bg-transparent text-foreground",
  destructive: "bg-destructive text-destructive-foreground",
} as const;

const SIZE_CLASSES = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-3 py-1 text-sm",
  lg: "px-4 py-1.5 text-base",
} as const;

export function BadgeBlock({ config }: BlockComponentProps<BadgeConfig>) {
  const { text = "Badge", variant = "primary", size = "md" } = config;

  if (!text) return null;

  return (
    <div className="flex">
      <span
        className={`inline-flex items-center rounded-full font-medium ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]}`}
      >
        {text}
      </span>
    </div>
  );
}
