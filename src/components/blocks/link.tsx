"use client";

/**
 * Link Block
 * Hyperlink with styling variants
 */

import { useAnalytics } from "@otl-core/analytics";
import type { BlockComponentProps } from "@otl-core/cms-types";
import { useCallback } from "react";

interface LinkConfig {
  text: string;
  href: string;
  external?: boolean;
  variant?:
    | "default"
    | "underline"
    | "no-underline"
    | "button-primary"
    | "button-secondary"
    | "button-outline";
  ariaLabel?: string;
}

export function LinkBlock({ config }: BlockComponentProps<LinkConfig>) {
  const { text, href, external, variant = "default", ariaLabel } = config;
  const { trackEvent } = useAnalytics();

  const target = external ? "_blank" : undefined;
  const rel = external ? "noopener noreferrer" : undefined;

  const handleClick = useCallback(() => {
    if (!href) return;
    try {
      const parsed = new URL(href, window.location.origin);
      const isExternal = parsed.hostname !== window.location.hostname;
      trackEvent(isExternal ? "outbound_click" : "internal_link_click", {
        url: href,
        link_text: text,
        component: "link",
      });
    } catch {
      trackEvent("internal_link_click", {
        url: href,
        link_text: text,
        component: "link",
      });
    }
  }, [href, text, trackEvent]);

  const variantClasses = {
    default: "hover:underline transition-colors",
    underline: "underline",
    "no-underline": "no-underline",
    "button-primary":
      "inline-flex items-center justify-center px-4 py-2 rounded-md font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90",
    "button-secondary":
      "inline-flex items-center justify-center px-4 py-2 rounded-md font-medium transition-colors bg-secondary text-secondary-foreground hover:bg-secondary/80",
    "button-outline":
      "inline-flex items-center justify-center px-4 py-2 rounded-md font-medium transition-colors border border-border bg-surface hover:bg-accent hover:text-accent-foreground",
  };

  return (
    <a
      href={href}
      target={target}
      rel={rel}
      onClick={handleClick}
      className={variantClasses[variant]}
      aria-label={ariaLabel || text}
    >
      {text}
    </a>
  );
}
