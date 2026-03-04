import {
  generateDesktopDropdownAnimations,
  generateMobileMenuAnimations,
  generateScrollbarStyles,
  generateToggleIconAnimations,
} from "@/lib/animations.utils";
import {
  Site,
  HeaderConfig,
  HeaderDropdownButtonConfig,
  HeaderDropdownContent,
  HeaderNavigationItem,
  HeaderNavigationItemButtonConfig,
  HeaderNavigationItemDropdownConfig,
  HeaderNavigationItemImageConfig,
  HeaderNavigationItemLinkConfig,
  HeaderNavigationItemMarkdownConfig,
  HeaderSection,
  LocalizedString,
  ShadowConfig,
} from "@otl-core/cms-types";
import { generateResponsiveSpacingCSS, minifyCSS } from "@otl-core/cms-utils";
import { marked } from "marked";

/**
 * Convert ShadowConfig to CSS box-shadow string
 */
export function shadowConfigToCSS(shadow: ShadowConfig): string {
  const { offsetX, offsetY, blurRadius, spreadRadius, color, inset } = shadow;
  const parts = [offsetX, offsetY, blurRadius, spreadRadius, color];
  if (inset) {
    return `inset ${parts.join(" ")}`;
  }
  return parts.join(" ");
}

export function calculateNavigationWidth(
  sections: HeaderSection[],
  site?: Site,
): number {
  let totalWidth = 150;

  for (const section of sections) {
    for (const item of section?.items || []) {
      if (item.type === "logo") continue;

      const label =
        typeof item.label === "string"
          ? item.label
          : getLocalizedString(item.label, site) || "";
      const labelLength = label.length;

      if (item.type === "button") {
        totalWidth += labelLength * 8 + 48;
      } else if (
        item.type === "link" ||
        item.type === "dropdown" ||
        item.type === "markdown"
      ) {
        totalWidth += labelLength * 8 + 24;
      } else if (item.type === "image") {
        const imgConfig = item.config as { width?: string };
        const imgWidth = imgConfig?.width
          ? parseInt(imgConfig.width, 10) || 100
          : 100;
        totalWidth += imgWidth + 16;
      }
    }
  }

  return totalWidth;
}

export type Breakpoint = "sm" | "md" | "lg" | "xl" | "2xl" | null;

export function getBreakpointForWidth(estimatedWidth: number): Breakpoint {
  const MAX_USABLE_WIDTH = 1400;

  if (estimatedWidth > MAX_USABLE_WIDTH) return null;

  if (estimatedWidth <= 640) return "sm";
  if (estimatedWidth <= 768) return "md";
  if (estimatedWidth <= 1024) return "lg";
  if (estimatedWidth <= 1280) return "xl";
  return "2xl";
}

export function generateNavigationCSS(
  id: string,
  navigation: HeaderConfig,
  resolvedColors: Record<string, string | undefined>,
  dropdownIds: string[] = [],
): string {
  const cssBlocks: (string | null)[] = [];

  // Margins are now applied inline, no CSS generation needed

  if (navigation.style) {
    const navbarCSS = generateResponsiveSpacingCSS(`navbar-${id}`, {
      border: navigation.style.border,
      padding: navigation.style.layout?.padding,
      shadow: navigation.style.shadow,
    });
    if (navbarCSS) cssBlocks.push(navbarCSS);

    const navbarInnerCSS = generateResponsiveSpacingCSS(`navbar-inner-${id}`, {
      gap: navigation.style.layout?.sectionGap,
    });
    if (navbarInnerCSS) cssBlocks.push(navbarInnerCSS);
  }

  if (navigation.style && dropdownIds.length > 0) {
    dropdownIds.forEach((dropdownId) => {
      const dropdownCSS = generateResponsiveSpacingCSS(
        `navigation-dropdown-${dropdownId}`,
        {
          padding: navigation.style?.dropdown?.padding,
          border: navigation.style?.dropdown?.border,
          shadow: navigation.style?.dropdown?.shadow,
        },
      );
      if (dropdownCSS) cssBlocks.push(dropdownCSS);

      const dropdownContentCSS = generateResponsiveSpacingCSS(
        `dropdown-content-${dropdownId}`,
        {
          gap: navigation.style?.dropdown?.sectionGap,
        },
      );
      if (dropdownContentCSS) cssBlocks.push(dropdownContentCSS);
    });
  }

  if (resolvedColors.burgerButtonBackgroundHover) {
    cssBlocks.push(
      `.mobile-menu-toggle-${id}:hover{background-color:${resolvedColors.burgerButtonBackgroundHover}!important}`,
    );
  }

  if (
    resolvedColors.dropdownMenuLinkHoverColor ||
    resolvedColors.dropdownMenuLinkHoverBackground
  ) {
    const hoverStyles: string[] = [];
    if (resolvedColors.dropdownMenuLinkHoverBackground) {
      hoverStyles.push(
        `background-color:${resolvedColors.dropdownMenuLinkHoverBackground}!important`,
      );
    }
    if (resolvedColors.dropdownMenuLinkHoverColor) {
      hoverStyles.push(
        `color:${resolvedColors.dropdownMenuLinkHoverColor}!important`,
      );
    }
    cssBlocks.push(
      `#mobile-menu-dropdown-${id} a:hover{${hoverStyles.join(";")}}`,
    );
  }

  cssBlocks.push(...generateToggleIconAnimations());
  cssBlocks.push(...generateMobileMenuAnimations());
  cssBlocks.push(...generateScrollbarStyles());
  cssBlocks.push(...generateDesktopDropdownAnimations());

  return minifyCSS(cssBlocks.filter(Boolean).join(""));
}

export function sectionsToDropdownContent(
  sections: HeaderSection[],
): HeaderDropdownContent[] {
  const result: HeaderDropdownContent[] = [];
  let lastSectionHadContent = false;

  sections.forEach((section: HeaderSection, index: number) => {
    const items = section?.items?.filter((item: HeaderNavigationItem) => {
      if (item.type === "logo") return false;
      if (resolveItemVisibility(item) === "navbar-only") return false;
      return true;
    });

    if (items?.length === 0) {
      return; // Skip this section, don't update lastSectionHadContent
    }

    // Add divider if the previous section had content and this isn't the first section with content
    if (lastSectionHadContent && result.length > 0) {
      result.push({
        id: `divider-${sections[index - 1].id}`,
        type: "divider",
        config: {},
      });
    }

    items?.forEach((item: HeaderNavigationItem) => {
      if (item.type === "link") {
        const config = item.config as HeaderNavigationItemLinkConfig;
        result.push({
          id: item.id,
          type: "navigation-item",
          config: {
            label: item.label || "",
            href: config.href,
            icon: config.icon,
            external: config.external,
          },
        });
      } else if (item.type === "button") {
        const config = item.config as HeaderNavigationItemButtonConfig;
        const btnConfig: HeaderDropdownButtonConfig = {
          label: item.label || "",
          href: config.href,
          icon: config.icon,
          external: config.external,
          variant: config.variant,
          size: config.size,
        };
        result.push({
          id: item.id,
          type: "button",
          config: btnConfig,
        });
      } else if (item.type === "dropdown") {
        const config = item.config as HeaderNavigationItemDropdownConfig;
        result.push({
          id: item.id,
          type: "dropdown",
          label: item.label || "",
          config,
        });
      } else if (item.type === "markdown") {
        const config = item.config as HeaderNavigationItemMarkdownConfig;
        result.push({
          id: item.id,
          type: "markdown",
          config: { content: config.content || item.label || "" },
        });
      } else if (item.type === "image") {
        const config = item.config as HeaderNavigationItemImageConfig;
        result.push({
          id: item.id,
          type: "image",
          config: {
            src: config.src,
            alt: config.alt,
            width: config.width ? { base: config.width } : { base: "100%" },
            height: config.height ? { base: config.height } : { base: "auto" },
            objectFit: config.objectFit,
            href: config.href,
          },
        });
      }
    });

    lastSectionHadContent = true;
  });

  return result;
}

export function resolveDropdownColor(
  colorRef: { type: string; value: string } | undefined,
  resolvedColors: Record<string, string | undefined>,
  fallback?: string,
): string | undefined {
  if (!colorRef) return fallback;

  if (colorRef.type === "custom") {
    return colorRef.value;
  }

  if (colorRef.type === "theme") {
    return resolvedColors[colorRef.value] || fallback;
  }

  if (colorRef.type === "variable") {
    // For variables, construct the CSS variable reference
    return `var(--color-${colorRef.value})`;
  }

  return fallback;
}

function getBrowserPreferredLocales(options = {}) {
  if (typeof navigator === "undefined") {
    return undefined;
  }

  const defaultOptions = {
    languageCodeOnly: false,
  };
  const opt = {
    ...defaultOptions,
    ...options,
  };
  const browserLocales =
    navigator.languages === undefined
      ? [navigator.language]
      : navigator.languages;
  if (!browserLocales) {
    return undefined;
  }
  return browserLocales.map((locale) => {
    const trimmedLocale = locale.trim();
    return opt.languageCodeOnly ? trimmedLocale.split(/-|_/)[0] : trimmedLocale;
  });
}

export function getLocalizedString(
  value: string | LocalizedString | null | undefined,
  options?:
    | Site
    | {
        preferredLocale?: string;
        defaultLocale?: string;
        supportedLocales?: string[];
      },
): string {
  // Handle null/undefined
  if (value === null || value === undefined) return "";

  // If it's already a string, return it
  if (typeof value === "string") return value;

  // Normalize options to handle both Site and simple options object
  const preferredLocale =
    options && "preferredLocale" in options
      ? options.preferredLocale
      : undefined;
  const defaultLocale =
    options && "defaultLocale" in options
      ? options.defaultLocale
      : options && "default_locale" in options
        ? options.default_locale
        : undefined;
  const supportedLocales =
    options && "supportedLocales" in options
      ? options.supportedLocales
      : options && "supported_locales" in options
        ? options.supported_locales
        : undefined;

  // Try preferred locale first (if explicitly provided)
  if (preferredLocale && preferredLocale in value && value[preferredLocale]) {
    return value[preferredLocale];
  }

  // Try browser locales if no explicit preferred locale
  if (!preferredLocale) {
    const browserLocales = getBrowserPreferredLocales();
    if (browserLocales) {
      for (const locale of browserLocales) {
        if (locale in value && value[locale]) {
          return value[locale];
        }
      }
    }
  }

  // Try default locale
  if (defaultLocale && defaultLocale in value && value[defaultLocale]) {
    return value[defaultLocale];
  }

  // Try 'en' as fallback
  if ("en" in value && value.en) {
    return value.en;
  }

  // Try any supported locale
  if (supportedLocales) {
    for (const locale of supportedLocales) {
      if (locale in value && value[locale]) {
        return value[locale];
      }
    }
  }

  // Return first available value as last resort
  const keys = Object.keys(value);
  if (keys.length > 0 && value[keys[0]]) {
    return value[keys[0]];
  }

  return "";
}

/**
 * Resolve the effective visibility for a navigation item.
 * Supports the new `visibility` field and the legacy `collapse` field.
 * collapse: false → "navbar-only", collapse: true/undefined → "responsive"
 */
export function resolveItemVisibility(
  item: HeaderNavigationItem,
): HeaderNavigationItem["visibility"] {
  if (item.visibility) return item.visibility;
  const legacy = (item as Record<string, unknown>).collapse;
  if (legacy === false) return "navbar-only";
  return undefined;
}

const VISIBILITY_CLASSES: Record<string, string> = {
  "navbar-only": "flex",
  "mobile-only": "hidden",
  both: "flex",
};

/**
 * Get the CSS class for an item's visibility, falling back to the
 * responsive breakpoint class when no explicit visibility is set.
 */
export function getVisibilityClass(
  item: HeaderNavigationItem,
  fallback?: string,
): string {
  const vis = resolveItemVisibility(item);
  return (vis && VISIBILITY_CLASSES[vis]) || fallback || "";
}

export function parseMarkdownToHTML(markdown: string): string {
  // Parse markdown to HTML
  const html = marked.parse(markdown, { async: false }) as string;

  // Transform h1-h6 elements to divs with corresponding classes
  return html
    .replace(/<h1>/g, '<div class="h1">')
    .replace(/<\/h1>/g, "</div>")
    .replace(/<h2>/g, '<div class="h2">')
    .replace(/<\/h2>/g, "</div>")
    .replace(/<h3>/g, '<div class="h3">')
    .replace(/<\/h3>/g, "</div>")
    .replace(/<h4>/g, '<div class="h4">')
    .replace(/<\/h4>/g, "</div>")
    .replace(/<h5>/g, '<div class="h5">')
    .replace(/<\/h5>/g, "</div>")
    .replace(/<h6>/g, '<div class="h6">')
    .replace(/<\/h6>/g, "</div>");
}
