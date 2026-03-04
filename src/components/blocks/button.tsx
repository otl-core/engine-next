"use client";

/**
 * Button Block
 * Button linking to a URL
 */

import { useAnalytics } from "@otl-core/analytics";
import type { BlockComponentProps } from "@otl-core/cms-types";
import { useCallback } from "react";

interface ButtonConfig {
  text?: string;
  url?: string;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  newTab?: boolean;
}

const VARIANT_CLASSES: Record<string, string> = {
  primary: "bg-primary hover:bg-primary/90 text-primary-foreground",
  secondary: "bg-secondary hover:bg-secondary/80 text-secondary-foreground",
  outline: "border-2 border-primary text-primary hover:bg-primary/10",
  ghost: "text-primary hover:bg-primary/10",
};

const SIZE_CLASSES: Record<string, string> = {
  sm: "px-3 py-1 text-sm",
  md: "px-6 py-2 text-base",
  lg: "px-8 py-3 text-lg",
};

export function ButtonBlock({ config }: BlockComponentProps<ButtonConfig>) {
  const {
    text = "",
    url = "",
    variant = "primary",
    size = "md",
    newTab = false,
  } = config;

  const { trackEvent } = useAnalytics();

  const handleClick = useCallback(() => {
    if (!url) return;
    try {
      const parsed = new URL(url, window.location.origin);
      const isExternal = parsed.hostname !== window.location.hostname;
      trackEvent(isExternal ? "outbound_click" : "internal_link_click", {
        url,
        link_text: text,
        component: "button",
      });
    } catch {
      trackEvent("internal_link_click", {
        url,
        link_text: text,
        component: "button",
      });
    }
  }, [url, text, trackEvent]);

  return (
    <div className="flex">
      <a
        href={url}
        target={newTab ? "_blank" : undefined}
        rel={newTab ? "noopener noreferrer" : undefined}
        onClick={handleClick}
        className={`inline-block rounded-lg font-semibold transition-colors ${VARIANT_CLASSES[variant] || VARIANT_CLASSES.primary} ${SIZE_CLASSES[size] || SIZE_CLASSES.md}`}
      >
        {text}
      </a>
    </div>
  );
}
