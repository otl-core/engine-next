"use client";

import {
  Site,
  HeaderConfig,
  HeaderNavigationItem,
  HeaderNavigationItemButtonConfig,
  HeaderNavigationItemImageConfig,
  HeaderNavigationItemLinkConfig,
  HeaderNavigationItemMarkdownConfig,
} from "@otl-core/cms-types";
import Link from "next/link";
import React from "react";
import { useNavigation } from "../../context/navigation-context";
import {
  getLocalizedString,
  getVisibilityClass,
  parseMarkdownToHTML,
  resolveItemVisibility,
} from "../../lib/navigation.utils";
import { ChevronIcon } from "../icons/chevron-icon";
import { Logo } from "../items/logo";
import { Button } from "@/components/ui/button";

interface NavigationItemProps {
  item: HeaderNavigationItem;
  navigation?: HeaderConfig;
  resolvedColors: Record<string, string | undefined>;
  itemsShowClass?: string;
  site: Site;
}

// Map button variants to Button component variants
const variantMap: Record<
  string,
  "default" | "secondary" | "outline" | "ghost"
> = {
  primary: "default",
  secondary: "secondary",
  outline: "outline",
  ghost: "ghost",
};

// Map button sizes to Button component sizes
const sizeMap: Record<string, "default" | "sm" | "lg"> = {
  sm: "sm",
  md: "default",
  lg: "lg",
};

export const NavigationItem: React.FC<NavigationItemProps> = ({
  item,
  navigation,
  resolvedColors,
  itemsShowClass,
  site,
}) => {
  const label = getLocalizedString(item.label, site);

  // Always call hooks unconditionally at the top
  const { toggleDropdown, activeDropdown } = useNavigation();

  const visibilityClass = getVisibilityClass(item, itemsShowClass);

  // Render logo
  if (item.type === "logo") {
    if (!navigation?.logo) return null;
    return (
      <Logo
        navigation={navigation}
        siteName={navigation.logo.alt || "Logo"}
        logoTextColor={resolvedColors.logoText}
      />
    );
  }

  if (item.type === "link") {
    const config = item.config as HeaderNavigationItemLinkConfig;
    const linkStyle: React.CSSProperties = {
      color: resolvedColors.linkColor,
    };

    return (
      <Link
        href={config.href}
        style={linkStyle}
        target={config.external ? "_blank" : undefined}
        rel={config.external ? "noopener noreferrer" : undefined}
        className={`${visibilityClass} items-center whitespace-nowrap`}
      >
        {config.icon && <span>{config.icon}</span>}
        {label}
      </Link>
    );
  }

  // Render button — wrapped in a div to avoid CSS specificity conflict
  // between Button's base `inline-flex` and visibility `hidden` classes
  if (item.type === "button") {
    const config = item.config as HeaderNavigationItemButtonConfig;

    return (
      <div className={`${visibilityClass} items-center`}>
        <Button
          asChild
          variant={config.variant ? variantMap[config.variant] : "default"}
          size={config.size ? sizeMap[config.size] : "default"}
          className="whitespace-nowrap"
        >
          <Link
            href={config.href}
            target={config.external ? "_blank" : undefined}
            rel={config.external ? "noopener noreferrer" : undefined}
          >
            {config.icon && <span>{config.icon}</span>}
            {label}
          </Link>
        </Button>
      </div>
    );
  }

  // Render dropdown trigger
  if (item.type === "dropdown") {
    const isOpen = activeDropdown === item.id;

    const linkStyle: React.CSSProperties = {
      color: resolvedColors.linkColor,
    };

    return (
      <button
        onClick={() => toggleDropdown(item.id)}
        style={linkStyle}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={`${visibilityClass} items-center gap-1 whitespace-nowrap`}
      >
        {label}
        <ChevronIcon isOpen={isOpen} size={16} />
      </button>
    );
  }

  // Render markdown
  if (item.type === "markdown") {
    const config = item.config as HeaderNavigationItemMarkdownConfig;
    const content = getLocalizedString(config.content, site);
    const html = parseMarkdownToHTML(content);

    const textStyle: React.CSSProperties = {};
    if (config.color) {
      if (typeof config.color === "string") {
        textStyle.color = config.color;
      } else if (config.color.type === "custom" && config.color.value) {
        textStyle.color =
          typeof config.color.value === "string"
            ? config.color.value
            : config.color.value.background;
      } else if (config.color.type === "variable" && config.color.value) {
        textStyle.color = `var(${config.color.value})`;
      } else if (config.color.type === "theme" && config.color.value) {
        textStyle.color = `var(--${config.color.value})`;
      }
    } else {
      textStyle.color = resolvedColors.text;
    }

    return (
      <div
        dangerouslySetInnerHTML={{ __html: html }}
        className={`${visibilityClass} items-center whitespace-nowrap [&_*]:text-inherit`}
        style={textStyle}
      />
    );
  }

  // Render image
  if (item.type === "image") {
    const config = item.config as HeaderNavigationItemImageConfig;
    if (!config.src) return null;

    const imgElement = (
      <img
        src={config.src}
        alt={config.alt || ""}
        style={{
          display: "block",
          width: config.width || "auto",
          height: config.height || "auto",
          objectFit: config.objectFit || "contain",
        }}
      />
    );

    const wrapped = config.href ? (
      <Link
        href={config.href}
        target={config.external ? "_blank" : undefined}
        rel={config.external ? "noopener noreferrer" : undefined}
      >
        {imgElement}
      </Link>
    ) : (
      imgElement
    );

    return <div className={`${visibilityClass} items-center`}>{wrapped}</div>;
  }

  return null;
};
