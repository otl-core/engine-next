import {
  ColorConfig,
  ColorReference,
  FontConfig,
  ResponsiveValue,
  ThemeColor,
  ThemeConfig,
  ThemeSlots,
} from "@otl-core/cms-types";

const DEFAULT_COLOR = "#cccccc";

const BREAKPOINT_WIDTHS: Record<string, string> = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
};

function generateContainerPaddingCSS(
  containerPadding: ResponsiveValue<string> | undefined,
): string {
  if (!containerPadding) return "";

  if (typeof containerPadding === "string") {
    return `:root { --container-padding: ${containerPadding}; }`;
  }

  const css: string[] = [];
  if (containerPadding.base) {
    css.push(`:root { --container-padding: ${containerPadding.base}; }`);
  }
  for (const [bp, width] of Object.entries(BREAKPOINT_WIDTHS)) {
    const val = containerPadding[bp as keyof typeof containerPadding];
    if (val) {
      css.push(
        `@media (min-width: ${width}) { :root { --container-padding: ${val}; } }`,
      );
    }
  }
  return css.join("\n");
}

/**
 * Resolves a ColorReference to its actual color value
 */
function resolveColorReference(
  colorRef: ColorReference,
  colorLibrary: ThemeColor[],
  mode: "light" | "dark",
  themeSlots: ThemeSlots,
  target?: "background" | "foreground",
): string {
  // Determine which target to resolve: parameter, or colorRef.target (if exists), or default to background
  const resolvedTarget =
    target ??
    ("target" in colorRef ? colorRef.target : undefined) ??
    "background";

  if (colorRef.type === "custom") {
    // Support both string and CustomColor object
    if (typeof colorRef.value === "string") {
      return resolvedTarget === "background" ? colorRef.value : DEFAULT_COLOR;
    }
    return resolvedTarget === "background"
      ? colorRef.value.background
      : colorRef.value.foreground;
  } else if (colorRef.type === "variable") {
    const colorVar = colorLibrary.find((c) => c.id === colorRef.value);
    if (!colorVar) return DEFAULT_COLOR;
    return resolvedTarget === "background"
      ? colorVar[mode].background
      : colorVar[mode].foreground;
  } else if (colorRef.type === "theme") {
    // Resolve theme slot reference (with circular reference protection)
    const targetSlot = themeSlots[colorRef.value as keyof ThemeSlots];
    if (targetSlot && targetSlot.type !== "theme") {
      return resolveColorReference(
        targetSlot,
        colorLibrary,
        mode,
        themeSlots,
        resolvedTarget,
      );
    }
    return DEFAULT_COLOR;
  }
  return DEFAULT_COLOR;
}

interface StyleProps {
  theme: ThemeConfig | null;
  colors: ColorConfig | null;
  fonts: FontConfig | null;
}

export function Style({ theme, colors, fonts }: StyleProps) {
  if (!theme || !theme.light || !theme.dark) {
    return null;
  }

  const colorLibrary = colors?.colors || [];

  // Generate CSS for user-defined color variables with paired background/foreground (light mode)
  const colorVarsLight = colorLibrary
    .map(
      (color) =>
        `--${color.id}: ${color.light.background};
        --${color.id}-foreground: ${color.light.foreground};`,
    )
    .join("\n            ");

  // Generate CSS for user-defined color variables with paired background/foreground (dark mode)
  const colorVarsDark = colorLibrary
    .map(
      (color) =>
        `--${color.id}: ${color.dark.background};
        --${color.id}-foreground: ${color.dark.foreground};`,
    )
    .join("\n            ");

  // Generate @font-face rules for custom fonts
  const fontFormatFromUrl = (url: string): string => {
    const ext = url.split("?")[0].split("#")[0].split(".").pop()?.toLowerCase();
    switch (ext) {
      case "woff2":
        return "woff2";
      case "woff":
        return "woff";
      case "ttf":
        return "truetype";
      case "otf":
        return "opentype";
      default:
        return "woff2";
    }
  };
  const fontFaces = (fonts?.fonts || [])
    .flatMap((font) => {
      if (!font.files) return [];
      const stretch =
        font.stretch && font.stretch !== "normal" ? font.stretch : null;
      // Dedupe: variable fonts with an ital axis register both "100-900"
      // and "100-900italic" pointing at the same URL. We only need one
      // @font-face per unique URL + weight combination.
      const seen = new Set<string>();
      return Object.entries(font.files).flatMap(([variant, url]) => {
        const isItalic = variant.endsWith("italic");
        const weightPart = isItalic
          ? variant.slice(0, -"italic".length)
          : variant;
        // Weight can be a single value ("400") or a range ("100-900").
        const fontWeight = weightPart || "400";
        const fontStyle = isItalic ? "italic" : "normal";
        const dedupeKey = `${url}|${fontWeight}|${fontStyle}`;
        if (seen.has(dedupeKey)) return [];
        seen.add(dedupeKey);
        // Variable range format: "100-900" → "100 900" for CSS.
        const cssWeight = fontWeight.includes("-")
          ? fontWeight.replace("-", " ")
          : fontWeight;
        const stretchRule = stretch
          ? `\n            font-stretch: ${stretch};`
          : "";
        return [
          `
          @font-face {
            font-family: '${font.family}';
            font-weight: ${cssWeight};
            font-style: ${fontStyle};${stretchRule}
            font-display: swap;
            src: url('${url}') format('${fontFormatFromUrl(url)}');
          }
        `,
        ];
      });
    })
    .join("\n");

  // Helper function to get font family string
  const getFontFamilyString = (
    fontId: string,
    font: { family: string } | undefined,
  ) => {
    if (fontId === "system") {
      return "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    }
    return font ? `'${font.family}', sans-serif` : "sans-serif";
  };

  // Generate typography CSS variables
  const typography = theme.typography || {};
  const typographyVars = Object.entries(typography)
    .map(([element, assignment]) => {
      if (!assignment) return "";
      const font = fonts?.fonts.find((f) => f.id === assignment.fontId);
      const fontFamily = getFontFamilyString(assignment.fontId, font);

      let css = `
      --typography-${element}-font-family: ${fontFamily};
      --typography-${element}-font-weight: ${assignment.fontWeight || "400"};
      --typography-${element}-font-style: ${assignment.fontStyle || "normal"};
      --typography-${element}-font-size: ${assignment.fontSize || "1rem"};
      --typography-${element}-line-height: ${assignment.lineHeight || "1.5"};
      --typography-${element}-letter-spacing: ${assignment.letterSpacing || "normal"};
      --typography-${element}-text-transform: ${assignment.textTransform || "none"};
      --typography-${element}-text-decoration: ${assignment.textDecoration || "none"};
      `;
      // Strong override variables
      if (assignment.strong) {
        const strongFont = assignment.strong.fontId
          ? fonts?.fonts.find((f) => f.id === assignment.strong.fontId)
          : font;
        const strongFontFamily = getFontFamilyString(
          assignment.strong.fontId || assignment.fontId,
          strongFont,
        );
        css += `
      --typography-${element}-strong-font-family: ${strongFontFamily};
      --typography-${element}-strong-font-weight: ${assignment.strong.fontWeight || "700"};
      --typography-${element}-strong-font-style: ${assignment.strong.fontStyle || "normal"};
      --typography-${element}-strong-font-size: ${assignment.strong.fontSize || "1em"};
      --typography-${element}-strong-letter-spacing: ${assignment.strong.letterSpacing || "normal"};
      --typography-${element}-strong-text-transform: ${assignment.strong.textTransform || "none"};
      --typography-${element}-strong-text-decoration: ${assignment.strong.textDecoration || "none"};
      `;
      }

      // Emphasis override variables
      if (assignment.emphasis) {
        const emphasisFont = assignment.emphasis.fontId
          ? fonts?.fonts.find((f) => f.id === assignment.emphasis.fontId)
          : font;
        const emphasisFontFamily = getFontFamilyString(
          assignment.emphasis.fontId || assignment.fontId,
          emphasisFont,
        );
        css += `
      --typography-${element}-emphasis-font-family: ${emphasisFontFamily};
      --typography-${element}-emphasis-font-weight: ${assignment.emphasis.fontWeight || assignment.fontWeight || "400"};
      --typography-${element}-emphasis-font-style: ${assignment.emphasis.fontStyle || "italic"};
      --typography-${element}-emphasis-font-size: ${assignment.emphasis.fontSize || "1em"};
      --typography-${element}-emphasis-letter-spacing: ${assignment.emphasis.letterSpacing || "normal"};
      --typography-${element}-emphasis-text-transform: ${assignment.emphasis.textTransform || "none"};
      --typography-${element}-emphasis-text-decoration: ${assignment.emphasis.textDecoration || "none"};
      `;
      }

      // Inline code override variables
      if (assignment.inlineCode) {
        const inlineCodeFont = assignment.inlineCode.fontId
          ? fonts?.fonts.find((f) => f.id === assignment.inlineCode.fontId)
          : font;
        const inlineCodeFontFamily = getFontFamilyString(
          assignment.inlineCode.fontId || assignment.fontId,
          inlineCodeFont,
        );
        css += `
      --typography-${element}-inlineCode-font-family: ${inlineCodeFontFamily};
      --typography-${element}-inlineCode-font-weight: ${assignment.inlineCode.fontWeight || assignment.fontWeight || "400"};
      --typography-${element}-inlineCode-font-style: ${assignment.inlineCode.fontStyle || "normal"};
      --typography-${element}-inlineCode-font-size: ${assignment.inlineCode.fontSize || "1em"};
      --typography-${element}-inlineCode-letter-spacing: ${assignment.inlineCode.letterSpacing || "normal"};
      --typography-${element}-inlineCode-text-transform: ${assignment.inlineCode.textTransform || "none"};
      --typography-${element}-inlineCode-text-decoration: ${assignment.inlineCode.textDecoration || "none"};
      `;
      }

      return css;
    })
    .join("\n");

  // Resolve theme slots to actual color values
  const lightSlots = theme.light;
  const darkSlots = theme.dark;

  // Helper to get foreground for a color reference
  const getForeground = (
    colorRef: ColorReference,
    mode: "light" | "dark",
  ): string => {
    const slots = mode === "light" ? lightSlots : darkSlots;
    return resolveColorReference(
      colorRef,
      colorLibrary,
      mode,
      slots,
      "foreground",
    );
  };

  const resolvedLight = {
    surface: resolveColorReference(
      lightSlots.surface,
      colorLibrary,
      "light",
      lightSlots,
    ),
    primary: resolveColorReference(
      lightSlots.primary,
      colorLibrary,
      "light",
      lightSlots,
    ),
    secondary: resolveColorReference(
      lightSlots.secondary,
      colorLibrary,
      "light",
      lightSlots,
    ),
    accent: resolveColorReference(
      lightSlots.accent,
      colorLibrary,
      "light",
      lightSlots,
    ),
    muted: resolveColorReference(
      lightSlots.muted,
      colorLibrary,
      "light",
      lightSlots,
    ),
    border: resolveColorReference(
      lightSlots.border,
      colorLibrary,
      "light",
      lightSlots,
    ),
    card: resolveColorReference(
      lightSlots.card,
      colorLibrary,
      "light",
      lightSlots,
    ),
    destructive: resolveColorReference(
      lightSlots.destructive,
      colorLibrary,
      "light",
      lightSlots,
    ),
  };

  const resolvedDark = {
    surface: resolveColorReference(
      darkSlots.surface,
      colorLibrary,
      "dark",
      darkSlots,
    ),
    primary: resolveColorReference(
      darkSlots.primary,
      colorLibrary,
      "dark",
      darkSlots,
    ),
    secondary: resolveColorReference(
      darkSlots.secondary,
      colorLibrary,
      "dark",
      darkSlots,
    ),
    accent: resolveColorReference(
      darkSlots.accent,
      colorLibrary,
      "dark",
      darkSlots,
    ),
    muted: resolveColorReference(
      darkSlots.muted,
      colorLibrary,
      "dark",
      darkSlots,
    ),
    border: resolveColorReference(
      darkSlots.border,
      colorLibrary,
      "dark",
      darkSlots,
    ),
    card: resolveColorReference(
      darkSlots.card,
      colorLibrary,
      "dark",
      darkSlots,
    ),
    destructive: resolveColorReference(
      darkSlots.destructive,
      colorLibrary,
      "dark",
      darkSlots,
    ),
  };

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
        /* Font faces */
        ${fontFaces}
        
        :root {
            /* User-defined color variables (light mode) */
            ${colorVarsLight}
            
            /* Border radius */
            --radius-sm: ${typeof theme.radius === "string" ? theme.radius : theme.radius.sm};
            --radius-md: ${typeof theme.radius === "string" ? theme.radius : theme.radius.md};
            --radius-lg: ${typeof theme.radius === "string" ? theme.radius : theme.radius.lg};
            --radius-xl: ${typeof theme.radius === "string" ? theme.radius : theme.radius.xl};
            ${typeof theme.radius !== "string" && theme.radius.full === false ? `--radius-full: ${theme.radius.xl};` : ""}
            
            /* Theme slots (light mode) */
            --surface: ${resolvedLight.surface};
            --surface-foreground: ${getForeground(lightSlots.surface, "light")};
            --primary: ${resolvedLight.primary};
            --primary-foreground: ${getForeground(lightSlots.primary, "light")};
            --secondary: ${resolvedLight.secondary};
            --secondary-foreground: ${getForeground(lightSlots.secondary, "light")};
            --accent: ${resolvedLight.accent};
            --accent-foreground: ${getForeground(lightSlots.accent, "light")};
            --muted: ${resolvedLight.muted};
            --muted-foreground: ${getForeground(lightSlots.muted, "light")};
            --border: ${resolvedLight.border};
            --card: ${resolvedLight.card};
            --card-foreground: ${getForeground(lightSlots.card, "light")};
            --destructive: ${resolvedLight.destructive};
            --destructive-foreground: ${getForeground(lightSlots.destructive, "light")};
            
            /* Typography variables */
            ${typographyVars}
        }
        
        /* Apply typography to HTML elements and classes */
        h1, .h1 {
            font-family: var(--typography-h1-font-family);
            font-weight: var(--typography-h1-font-weight);
            font-style: var(--typography-h1-font-style);
            font-size: var(--typography-h1-font-size);
            line-height: var(--typography-h1-line-height);
            letter-spacing: var(--typography-h1-letter-spacing);
            text-transform: var(--typography-h1-text-transform);
            text-decoration: var(--typography-h1-text-decoration);
        }
        
        h2, .h2 {
            font-family: var(--typography-h2-font-family);
            font-weight: var(--typography-h2-font-weight);
            font-style: var(--typography-h2-font-style);
            font-size: var(--typography-h2-font-size);
            line-height: var(--typography-h2-line-height);
            letter-spacing: var(--typography-h2-letter-spacing);
            text-transform: var(--typography-h2-text-transform);
            text-decoration: var(--typography-h2-text-decoration);
        }
        
        h3, .h3 {
            font-family: var(--typography-h3-font-family);
            font-weight: var(--typography-h3-font-weight);
            font-style: var(--typography-h3-font-style);
            font-size: var(--typography-h3-font-size);
            line-height: var(--typography-h3-line-height);
            letter-spacing: var(--typography-h3-letter-spacing);
            text-transform: var(--typography-h3-text-transform);
            text-decoration: var(--typography-h3-text-decoration);
        }
        
        h4, .h4 {
            font-family: var(--typography-h4-font-family);
            font-weight: var(--typography-h4-font-weight);
            font-style: var(--typography-h4-font-style);
            font-size: var(--typography-h4-font-size);
            line-height: var(--typography-h4-line-height);
            letter-spacing: var(--typography-h4-letter-spacing);
            text-transform: var(--typography-h4-text-transform);
            text-decoration: var(--typography-h4-text-decoration);
        }
        
        h5, .h5 {
            font-family: var(--typography-h5-font-family);
            font-weight: var(--typography-h5-font-weight);
            font-style: var(--typography-h5-font-style);
            font-size: var(--typography-h5-font-size);
            line-height: var(--typography-h5-line-height);
            letter-spacing: var(--typography-h5-letter-spacing);
            text-transform: var(--typography-h5-text-transform);
            text-decoration: var(--typography-h5-text-decoration);
        }
        
        h6, .h6 {
            font-family: var(--typography-h6-font-family);
            font-weight: var(--typography-h6-font-weight);
            font-style: var(--typography-h6-font-style);
            font-size: var(--typography-h6-font-size);
            line-height: var(--typography-h6-line-height);
            letter-spacing: var(--typography-h6-letter-spacing);
            text-transform: var(--typography-h6-text-transform);
            text-decoration: var(--typography-h6-text-decoration);
        }
        
        p, .paragraph {
            font-family: var(--typography-paragraph-font-family);
            font-weight: var(--typography-paragraph-font-weight);
            font-style: var(--typography-paragraph-font-style);
            font-size: var(--typography-paragraph-font-size);
            line-height: var(--typography-paragraph-line-height);
            letter-spacing: var(--typography-paragraph-letter-spacing);
            text-transform: var(--typography-paragraph-text-transform);
            text-decoration: var(--typography-paragraph-text-decoration);
        }
        
        blockquote, .blockquote {
            font-family: var(--typography-blockquote-font-family);
            font-weight: var(--typography-blockquote-font-weight);
            font-style: var(--typography-blockquote-font-style);
            font-size: var(--typography-blockquote-font-size);
            line-height: var(--typography-blockquote-line-height);
            letter-spacing: var(--typography-blockquote-letter-spacing);
            text-transform: var(--typography-blockquote-text-transform);
            text-decoration: var(--typography-blockquote-text-decoration);
        }
        
        code, pre, .code {
            font-family: var(--typography-code-font-family);
            font-weight: var(--typography-code-font-weight);
            font-style: var(--typography-code-font-style);
            font-size: var(--typography-code-font-size);
            line-height: var(--typography-code-line-height);
            letter-spacing: var(--typography-code-letter-spacing);
            text-transform: var(--typography-code-text-transform);
            text-decoration: var(--typography-code-text-decoration);
        }
        
        small, .small {
            font-family: var(--typography-small-font-family);
            font-weight: var(--typography-small-font-weight);
            font-style: var(--typography-small-font-style);
            font-size: var(--typography-small-font-size);
            line-height: var(--typography-small-line-height);
            letter-spacing: var(--typography-small-letter-spacing);
            text-transform: var(--typography-small-text-transform);
            text-decoration: var(--typography-small-text-decoration);
        }
        
        /* Typography overrides for text modifiers */
        h1 strong, .h1 strong, h1 b, .h1 b {
            font-family: var(--typography-h1-strong-font-family, var(--typography-h1-font-family));
            font-weight: var(--typography-h1-strong-font-weight, var(--typography-h1-font-weight));
            font-style: var(--typography-h1-strong-font-style, normal);
            font-size: var(--typography-h1-strong-font-size, 1em);
            letter-spacing: var(--typography-h1-strong-letter-spacing, var(--typography-h1-letter-spacing));
            text-transform: var(--typography-h1-strong-text-transform, none);
            text-decoration: var(--typography-h1-strong-text-decoration, none);
        }
        
        h1 em, .h1 em, h1 i, .h1 i {
            font-family: var(--typography-h1-emphasis-font-family, var(--typography-h1-font-family));
            font-weight: var(--typography-h1-emphasis-font-weight, var(--typography-h1-font-weight));
            font-style: var(--typography-h1-emphasis-font-style, italic);
            font-size: var(--typography-h1-emphasis-font-size, 1em);
            letter-spacing: var(--typography-h1-emphasis-letter-spacing, var(--typography-h1-letter-spacing));
            text-transform: var(--typography-h1-emphasis-text-transform, none);
            text-decoration: var(--typography-h1-emphasis-text-decoration, none);
        }
        
        h1 code, .h1 code {
            font-family: var(--typography-h1-inlineCode-font-family, var(--typography-h1-font-family));
            font-weight: var(--typography-h1-inlineCode-font-weight, var(--typography-h1-font-weight));
            font-style: var(--typography-h1-inlineCode-font-style, normal);
            font-size: var(--typography-h1-inlineCode-font-size, 1em);
            letter-spacing: var(--typography-h1-inlineCode-letter-spacing, var(--typography-h1-letter-spacing));
            text-transform: var(--typography-h1-inlineCode-text-transform, none);
            text-decoration: var(--typography-h1-inlineCode-text-decoration, none);
        }
        
        h2 strong, .h2 strong, h2 b, .h2 b {
            font-family: var(--typography-h2-strong-font-family, var(--typography-h2-font-family));
            font-weight: var(--typography-h2-strong-font-weight, var(--typography-h2-font-weight));
            font-style: var(--typography-h2-strong-font-style, normal);
            font-size: var(--typography-h2-strong-font-size, 1em);
            letter-spacing: var(--typography-h2-strong-letter-spacing, var(--typography-h2-letter-spacing));
            text-transform: var(--typography-h2-strong-text-transform, none);
            text-decoration: var(--typography-h2-strong-text-decoration, none);
        }
        
        h2 em, .h2 em, h2 i, .h2 i {
            font-family: var(--typography-h2-emphasis-font-family, var(--typography-h2-font-family));
            font-weight: var(--typography-h2-emphasis-font-weight, var(--typography-h2-font-weight));
            font-style: var(--typography-h2-emphasis-font-style, italic);
            font-size: var(--typography-h2-emphasis-font-size, 1em);
            letter-spacing: var(--typography-h2-emphasis-letter-spacing, var(--typography-h2-letter-spacing));
            text-transform: var(--typography-h2-emphasis-text-transform, none);
            text-decoration: var(--typography-h2-emphasis-text-decoration, none);
        }
        
        h2 code, .h2 code {
            font-family: var(--typography-h2-inlineCode-font-family, var(--typography-h2-font-family));
            font-weight: var(--typography-h2-inlineCode-font-weight, var(--typography-h2-font-weight));
            font-style: var(--typography-h2-inlineCode-font-style, normal);
            font-size: var(--typography-h2-inlineCode-font-size, 1em);
            letter-spacing: var(--typography-h2-inlineCode-letter-spacing, var(--typography-h2-letter-spacing));
            text-transform: var(--typography-h2-inlineCode-text-transform, none);
            text-decoration: var(--typography-h2-inlineCode-text-decoration, none);
        }
        
        h3 strong, .h3 strong, h3 b, .h3 b {
            font-family: var(--typography-h3-strong-font-family, var(--typography-h3-font-family));
            font-weight: var(--typography-h3-strong-font-weight, var(--typography-h3-font-weight));
            font-style: var(--typography-h3-strong-font-style, normal);
            font-size: var(--typography-h3-strong-font-size, 1em);
            letter-spacing: var(--typography-h3-strong-letter-spacing, var(--typography-h3-letter-spacing));
            text-transform: var(--typography-h3-strong-text-transform, none);
            text-decoration: var(--typography-h3-strong-text-decoration, none);
        }
        
        h3 em, .h3 em, h3 i, .h3 i {
            font-family: var(--typography-h3-emphasis-font-family, var(--typography-h3-font-family));
            font-weight: var(--typography-h3-emphasis-font-weight, var(--typography-h3-font-weight));
            font-style: var(--typography-h3-emphasis-font-style, italic);
            font-size: var(--typography-h3-emphasis-font-size, 1em);
            letter-spacing: var(--typography-h3-emphasis-letter-spacing, var(--typography-h3-letter-spacing));
            text-transform: var(--typography-h3-emphasis-text-transform, none);
            text-decoration: var(--typography-h3-emphasis-text-decoration, none);
        }
        
        h3 code, .h3 code {
            font-family: var(--typography-h3-inlineCode-font-family, var(--typography-h3-font-family));
            font-weight: var(--typography-h3-inlineCode-font-weight, var(--typography-h3-font-weight));
            font-style: var(--typography-h3-inlineCode-font-style, normal);
            font-size: var(--typography-h3-inlineCode-font-size, 1em);
            letter-spacing: var(--typography-h3-inlineCode-letter-spacing, var(--typography-h3-letter-spacing));
            text-transform: var(--typography-h3-inlineCode-text-transform, none);
            text-decoration: var(--typography-h3-inlineCode-text-decoration, none);
        }
        
        h4 strong, .h4 strong, h4 b, .h4 b {
            font-family: var(--typography-h4-strong-font-family, var(--typography-h4-font-family));
            font-weight: var(--typography-h4-strong-font-weight, var(--typography-h4-font-weight));
            font-style: var(--typography-h4-strong-font-style, normal);
            font-size: var(--typography-h4-strong-font-size, 1em);
            letter-spacing: var(--typography-h4-strong-letter-spacing, var(--typography-h4-letter-spacing));
            text-transform: var(--typography-h4-strong-text-transform, none);
            text-decoration: var(--typography-h4-strong-text-decoration, none);
        }
        
        h4 em, .h4 em, h4 i, .h4 i {
            font-family: var(--typography-h4-emphasis-font-family, var(--typography-h4-font-family));
            font-weight: var(--typography-h4-emphasis-font-weight, var(--typography-h4-font-weight));
            font-style: var(--typography-h4-emphasis-font-style, italic);
            font-size: var(--typography-h4-emphasis-font-size, 1em);
            letter-spacing: var(--typography-h4-emphasis-letter-spacing, var(--typography-h4-letter-spacing));
            text-transform: var(--typography-h4-emphasis-text-transform, none);
            text-decoration: var(--typography-h4-emphasis-text-decoration, none);
        }
        
        h4 code, .h4 code {
            font-family: var(--typography-h4-inlineCode-font-family, var(--typography-h4-font-family));
            font-weight: var(--typography-h4-inlineCode-font-weight, var(--typography-h4-font-weight));
            font-style: var(--typography-h4-inlineCode-font-style, normal);
            font-size: var(--typography-h4-inlineCode-font-size, 1em);
            letter-spacing: var(--typography-h4-inlineCode-letter-spacing, var(--typography-h4-letter-spacing));
            text-transform: var(--typography-h4-inlineCode-text-transform, none);
            text-decoration: var(--typography-h4-inlineCode-text-decoration, none);
        }
        
        h5 strong, .h5 strong, h5 b, .h5 b {
            font-family: var(--typography-h5-strong-font-family, var(--typography-h5-font-family));
            font-weight: var(--typography-h5-strong-font-weight, var(--typography-h5-font-weight));
            font-style: var(--typography-h5-strong-font-style, normal);
            font-size: var(--typography-h5-strong-font-size, 1em);
            letter-spacing: var(--typography-h5-strong-letter-spacing, var(--typography-h5-letter-spacing));
            text-transform: var(--typography-h5-strong-text-transform, none);
            text-decoration: var(--typography-h5-strong-text-decoration, none);
        }
        
        h5 em, .h5 em, h5 i, .h5 i {
            font-family: var(--typography-h5-emphasis-font-family, var(--typography-h5-font-family));
            font-weight: var(--typography-h5-emphasis-font-weight, var(--typography-h5-font-weight));
            font-style: var(--typography-h5-emphasis-font-style, italic);
            font-size: var(--typography-h5-emphasis-font-size, 1em);
            letter-spacing: var(--typography-h5-emphasis-letter-spacing, var(--typography-h5-letter-spacing));
            text-transform: var(--typography-h5-emphasis-text-transform, none);
            text-decoration: var(--typography-h5-emphasis-text-decoration, none);
        }
        
        h5 code, .h5 code {
            font-family: var(--typography-h5-inlineCode-font-family, var(--typography-h5-font-family));
            font-weight: var(--typography-h5-inlineCode-font-weight, var(--typography-h5-font-weight));
            font-style: var(--typography-h5-inlineCode-font-style, normal);
            font-size: var(--typography-h5-inlineCode-font-size, 1em);
            letter-spacing: var(--typography-h5-inlineCode-letter-spacing, var(--typography-h5-letter-spacing));
            text-transform: var(--typography-h5-inlineCode-text-transform, none);
            text-decoration: var(--typography-h5-inlineCode-text-decoration, none);
        }
        
        h6 strong, .h6 strong, h6 b, .h6 b {
            font-family: var(--typography-h6-strong-font-family, var(--typography-h6-font-family));
            font-weight: var(--typography-h6-strong-font-weight, var(--typography-h6-font-weight));
            font-style: var(--typography-h6-strong-font-style, normal);
            font-size: var(--typography-h6-strong-font-size, 1em);
            letter-spacing: var(--typography-h6-strong-letter-spacing, var(--typography-h6-letter-spacing));
            text-transform: var(--typography-h6-strong-text-transform, none);
            text-decoration: var(--typography-h6-strong-text-decoration, none);
        }
        
        h6 em, .h6 em, h6 i, .h6 i {
            font-family: var(--typography-h6-emphasis-font-family, var(--typography-h6-font-family));
            font-weight: var(--typography-h6-emphasis-font-weight, var(--typography-h6-font-weight));
            font-style: var(--typography-h6-emphasis-font-style, italic);
            font-size: var(--typography-h6-emphasis-font-size, 1em);
            letter-spacing: var(--typography-h6-emphasis-letter-spacing, var(--typography-h6-letter-spacing));
            text-transform: var(--typography-h6-emphasis-text-transform, none);
            text-decoration: var(--typography-h6-emphasis-text-decoration, none);
        }
        
        h6 code, .h6 code {
            font-family: var(--typography-h6-inlineCode-font-family, var(--typography-h6-font-family));
            font-weight: var(--typography-h6-inlineCode-font-weight, var(--typography-h6-font-weight));
            font-style: var(--typography-h6-inlineCode-font-style, normal);
            font-size: var(--typography-h6-inlineCode-font-size, 1em);
            letter-spacing: var(--typography-h6-inlineCode-letter-spacing, var(--typography-h6-letter-spacing));
            text-transform: var(--typography-h6-inlineCode-text-transform, none);
            text-decoration: var(--typography-h6-inlineCode-text-decoration, none);
        }
        
        p strong, .paragraph strong, p b, .paragraph b {
            font-family: var(--typography-paragraph-strong-font-family, var(--typography-paragraph-font-family));
            font-weight: var(--typography-paragraph-strong-font-weight, var(--typography-paragraph-font-weight));
            font-style: var(--typography-paragraph-strong-font-style, normal);
            font-size: var(--typography-paragraph-strong-font-size, 1em);
            letter-spacing: var(--typography-paragraph-strong-letter-spacing, var(--typography-paragraph-letter-spacing));
            text-transform: var(--typography-paragraph-strong-text-transform, none);
            text-decoration: var(--typography-paragraph-strong-text-decoration, none);
        }
        
        p em, .paragraph em, p i, .paragraph i {
            font-family: var(--typography-paragraph-emphasis-font-family, var(--typography-paragraph-font-family));
            font-weight: var(--typography-paragraph-emphasis-font-weight, var(--typography-paragraph-font-weight));
            font-style: var(--typography-paragraph-emphasis-font-style, italic);
            font-size: var(--typography-paragraph-emphasis-font-size, 1em);
            letter-spacing: var(--typography-paragraph-emphasis-letter-spacing, var(--typography-paragraph-letter-spacing));
            text-transform: var(--typography-paragraph-emphasis-text-transform, none);
            text-decoration: var(--typography-paragraph-emphasis-text-decoration, none);
        }
        
        p code, .paragraph code {
            font-family: var(--typography-paragraph-inlineCode-font-family, var(--typography-paragraph-font-family));
            font-weight: var(--typography-paragraph-inlineCode-font-weight, var(--typography-paragraph-font-weight));
            font-style: var(--typography-paragraph-inlineCode-font-style, normal);
            font-size: var(--typography-paragraph-inlineCode-font-size, 1em);
            letter-spacing: var(--typography-paragraph-inlineCode-letter-spacing, var(--typography-paragraph-letter-spacing));
            text-transform: var(--typography-paragraph-inlineCode-text-transform, none);
            text-decoration: var(--typography-paragraph-inlineCode-text-decoration, none);
        }
        
        blockquote strong, .blockquote strong, blockquote b, .blockquote b {
            font-family: var(--typography-blockquote-strong-font-family, var(--typography-blockquote-font-family));
            font-weight: var(--typography-blockquote-strong-font-weight, var(--typography-blockquote-font-weight));
            font-style: var(--typography-blockquote-strong-font-style, normal);
            font-size: var(--typography-blockquote-strong-font-size, 1em);
            letter-spacing: var(--typography-blockquote-strong-letter-spacing, var(--typography-blockquote-letter-spacing));
            text-transform: var(--typography-blockquote-strong-text-transform, none);
            text-decoration: var(--typography-blockquote-strong-text-decoration, none);
        }
        
        blockquote em, .blockquote em, blockquote i, .blockquote i {
            font-family: var(--typography-blockquote-emphasis-font-family, var(--typography-blockquote-font-family));
            font-weight: var(--typography-blockquote-emphasis-font-weight, var(--typography-blockquote-font-weight));
            font-style: var(--typography-blockquote-emphasis-font-style, italic);
            font-size: var(--typography-blockquote-emphasis-font-size, 1em);
            letter-spacing: var(--typography-blockquote-emphasis-letter-spacing, var(--typography-blockquote-letter-spacing));
            text-transform: var(--typography-blockquote-emphasis-text-transform, none);
            text-decoration: var(--typography-blockquote-emphasis-text-decoration, none);
        }
        
        blockquote code, .blockquote code {
            font-family: var(--typography-blockquote-inlineCode-font-family, var(--typography-blockquote-font-family));
            font-weight: var(--typography-blockquote-inlineCode-font-weight, var(--typography-blockquote-font-weight));
            font-style: var(--typography-blockquote-inlineCode-font-style, normal);
            font-size: var(--typography-blockquote-inlineCode-font-size, 1em);
            letter-spacing: var(--typography-blockquote-inlineCode-letter-spacing, var(--typography-blockquote-letter-spacing));
            text-transform: var(--typography-blockquote-inlineCode-text-transform, none);
            text-decoration: var(--typography-blockquote-inlineCode-text-decoration, none);
        }
        
        small strong, .small strong, small b, .small b {
            font-family: var(--typography-small-strong-font-family, var(--typography-small-font-family));
            font-weight: var(--typography-small-strong-font-weight, var(--typography-small-font-weight));
            font-style: var(--typography-small-strong-font-style, normal);
            font-size: var(--typography-small-strong-font-size, 1em);
            letter-spacing: var(--typography-small-strong-letter-spacing, var(--typography-small-letter-spacing));
            text-transform: var(--typography-small-strong-text-transform, none);
            text-decoration: var(--typography-small-strong-text-decoration, none);
        }
        
        small em, .small em, small i, .small i {
            font-family: var(--typography-small-emphasis-font-family, var(--typography-small-font-family));
            font-weight: var(--typography-small-emphasis-font-weight, var(--typography-small-font-weight));
            font-style: var(--typography-small-emphasis-font-style, italic);
            font-size: var(--typography-small-emphasis-font-size, 1em);
            letter-spacing: var(--typography-small-emphasis-letter-spacing, var(--typography-small-letter-spacing));
            text-transform: var(--typography-small-emphasis-text-transform, none);
            text-decoration: var(--typography-small-emphasis-text-decoration, none);
        }
        
        small code, .small code {
            font-family: var(--typography-small-inlineCode-font-family, var(--typography-small-font-family));
            font-weight: var(--typography-small-inlineCode-font-weight, var(--typography-small-font-weight));
            font-style: var(--typography-small-inlineCode-font-style, normal);
            font-size: var(--typography-small-inlineCode-font-size, 1em);
            letter-spacing: var(--typography-small-inlineCode-letter-spacing, var(--typography-small-letter-spacing));
            text-transform: var(--typography-small-inlineCode-text-transform, none);
            text-decoration: var(--typography-small-inlineCode-text-decoration, none);
        }
        
        @media (prefers-color-scheme: dark) {
            :root {
                /* User-defined color variables (dark mode) */
                ${colorVarsDark}

                /* Theme slots (dark mode) */
                --surface: ${resolvedDark.surface};
                --surface-foreground: ${getForeground(darkSlots.surface, "dark")};
                --primary: ${resolvedDark.primary};
                --primary-foreground: ${getForeground(darkSlots.primary, "dark")};
                --secondary: ${resolvedDark.secondary};
                --secondary-foreground: ${getForeground(darkSlots.secondary, "dark")};
                --accent: ${resolvedDark.accent};
                --accent-foreground: ${getForeground(darkSlots.accent, "dark")};
                --muted: ${resolvedDark.muted};
                --muted-foreground: ${getForeground(darkSlots.muted, "dark")};
                --border: ${resolvedDark.border};
                --card: ${resolvedDark.card};
                --card-foreground: ${getForeground(darkSlots.card, "dark")};
                --destructive: ${resolvedDark.destructive};
                --destructive-foreground: ${getForeground(darkSlots.destructive, "dark")};
                
            }
        }

        .dark {
            /* User-defined color variables (dark mode) */
            ${colorVarsDark}

            /* Theme slots (dark mode) */
            --surface: ${resolvedDark.surface};
            --surface-foreground: ${getForeground(darkSlots.surface, "dark")};
            --primary: ${resolvedDark.primary};
            --primary-foreground: ${getForeground(darkSlots.primary, "dark")};
            --secondary: ${resolvedDark.secondary};
            --secondary-foreground: ${getForeground(darkSlots.secondary, "dark")};
            --accent: ${resolvedDark.accent};
            --accent-foreground: ${getForeground(darkSlots.accent, "dark")};
            --muted: ${resolvedDark.muted};
            --muted-foreground: ${getForeground(darkSlots.muted, "dark")};
            --border: ${resolvedDark.border};
            --card: ${resolvedDark.card};
            --card-foreground: ${getForeground(darkSlots.card, "dark")};
            --destructive: ${resolvedDark.destructive};
            --destructive-foreground: ${getForeground(darkSlots.destructive, "dark")};

        }

        /* Container padding */
        ${generateContainerPaddingCSS(theme.containerPadding)}
        `,
      }}
    />
  );
}
