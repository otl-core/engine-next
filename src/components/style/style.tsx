import {
  ColorConfig,
  ColorReference,
  FontAssignment,
  FontConfig,
  LinkTypography,
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

  // Generate @font-face rules for custom fonts.
  // File keys can be format-keyed ("700.woff2", "700.ttf") or legacy
  // plain keys ("700"). Group by variant to emit multi-source src: lines.
  const formatHintFromExt = (ext: string): string => {
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
  const fontFormatFromUrl = (url: string): string => {
    const ext = url.split("?")[0].split("#")[0].split(".").pop()?.toLowerCase();
    return formatHintFromExt(ext ?? "woff2");
  };
  // Preferred format ordering for src: (browser picks the first it supports)
  const FORMAT_PRIORITY: Record<string, number> = {
    woff2: 0,
    woff: 1,
    ttf: 2,
    otf: 3,
  };
  const fontFaces = (fonts?.fonts || [])
    .flatMap((font) => {
      if (!font.files) return [];
      const stretch =
        font.stretch && font.stretch !== "normal" ? font.stretch : null;

      // Group file entries by variant (e.g. "700", "700italic", "100-900").
      // Keys can be "700.woff2" (format-keyed) or "700" (legacy).
      const variantSources: Record<
        string,
        { url: string; format: string; ext: string }[]
      > = {};
      for (const [key, url] of Object.entries(font.files)) {
        const dotIdx = key.lastIndexOf(".");
        // Check if the part after the last dot is a known font extension
        const possibleExt = dotIdx > 0 ? key.slice(dotIdx + 1) : "";
        const isFormatKeyed = ["woff2", "woff", "ttf", "otf"].includes(
          possibleExt,
        );
        const variant = isFormatKeyed ? key.slice(0, dotIdx) : key;
        const ext = isFormatKeyed ? possibleExt : "";
        const format = ext ? formatHintFromExt(ext) : fontFormatFromUrl(url);
        if (!variantSources[variant]) variantSources[variant] = [];
        variantSources[variant].push({ url, format, ext: ext || "woff2" });
      }

      // Dedupe: variable fonts with an ital axis register both "100-900"
      // and "100-900italic" pointing at the same URL. We only need one
      // @font-face per unique URL + weight combination.
      const seen = new Set<string>();
      return Object.entries(variantSources).flatMap(([variant, sources]) => {
        const isItalic = variant.endsWith("italic");
        const weightPart = isItalic
          ? variant.slice(0, -"italic".length)
          : variant;
        const fontWeight = weightPart || "400";
        const fontStyle = isItalic ? "italic" : "normal";
        const dedupeKey = `${fontWeight}|${fontStyle}`;
        if (seen.has(dedupeKey)) return [];
        seen.add(dedupeKey);
        // Variable range format: "100-900" → "100 900" for CSS.
        const cssWeight = fontWeight.includes("-")
          ? fontWeight.replace("-", " ")
          : fontWeight;
        const stretchRule = stretch
          ? `\n            font-stretch: ${stretch};`
          : "";
        // Sort sources by format priority (woff2 first)
        const sorted = [...sources].sort(
          (a, b) =>
            (FORMAT_PRIORITY[a.ext] ?? 9) - (FORMAT_PRIORITY[b.ext] ?? 9),
        );
        const srcList = sorted
          .map((s) => `url('${s.url}') format('${s.format}')`)
          .join(",\n                 ");
        return [
          `
          @font-face {
            font-family: '${font.family}';
            font-weight: ${cssWeight};
            font-style: ${fontStyle};${stretchRule}
            font-display: block;
            src: ${srcList};
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
      if (!assignment || element === "link") return "";
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

  // Generate typography color variables (mode-dependent, need light/dark variants)
  const generateTypographyColorVars = (mode: "light" | "dark") => {
    const slots = mode === "light" ? theme.light : theme.dark;
    const vars: string[] = [];

    for (const [element, assignment] of Object.entries(typography)) {
      if (!assignment || element === "link") continue;
      const fa = assignment as FontAssignment;
      if (fa.color) {
        const resolved = resolveColorReference(
          fa.color,
          colorLibrary,
          mode,
          slots,
        );
        vars.push(`--typography-${element}-color: ${resolved};`);
      }
    }

    // Link typography
    const link = typography.link as LinkTypography | undefined;
    if (link) {
      if (link.color) {
        vars.push(
          `--typography-link-color: ${resolveColorReference(link.color, colorLibrary, mode, slots)};`,
        );
      }
      if (link.hoverColor) {
        vars.push(
          `--typography-link-hover-color: ${resolveColorReference(link.hoverColor, colorLibrary, mode, slots)};`,
        );
      }
    }

    return vars.map((v) => `            ${v}`).join("\n");
  };

  const typographyColorVarsLight = generateTypographyColorVars("light");
  const typographyColorVarsDark = generateTypographyColorVars("dark");

  // Generate link typography non-color variables
  const linkTypographyVars = (() => {
    const link = typography.link as LinkTypography | undefined;
    if (!link) return "";
    const vars: string[] = [];
    if (link.textDecoration)
      vars.push(`--typography-link-text-decoration: ${link.textDecoration};`);
    if (link.hoverTextDecoration)
      vars.push(
        `--typography-link-hover-text-decoration: ${link.hoverTextDecoration};`,
      );
    if (link.fontWeight)
      vars.push(`--typography-link-font-weight: ${link.fontWeight};`);
    return vars.map((v) => `      ${v}`).join("\n");
  })();

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
    warning: lightSlots.warning
      ? resolveColorReference(
          lightSlots.warning,
          colorLibrary,
          "light",
          lightSlots,
        )
      : "#f59e0b",
    success: lightSlots.success
      ? resolveColorReference(
          lightSlots.success,
          colorLibrary,
          "light",
          lightSlots,
        )
      : "#22c55e",
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
    warning: darkSlots.warning
      ? resolveColorReference(
          darkSlots.warning,
          colorLibrary,
          "dark",
          darkSlots,
        )
      : "#f59e0b",
    success: darkSlots.success
      ? resolveColorReference(
          darkSlots.success,
          colorLibrary,
          "dark",
          darkSlots,
        )
      : "#22c55e",
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
            --warning: ${resolvedLight.warning};
            --warning-foreground: ${lightSlots.warning ? getForeground(lightSlots.warning, "light") : "#451a03"};
            --success: ${resolvedLight.success};
            --success-foreground: ${lightSlots.success ? getForeground(lightSlots.success, "light") : "#052e16"};

            /* Typography variables */
            ${typographyVars}
            ${linkTypographyVars}

            /* Typography colors (light mode) */
            ${typographyColorVarsLight}
        }
        
        /* Apply typography to classes */
        .h1 {
            font-family: var(--typography-h1-font-family);
            font-weight: var(--typography-h1-font-weight);
            font-style: var(--typography-h1-font-style);
            font-size: var(--typography-h1-font-size);
            line-height: var(--typography-h1-line-height);
            letter-spacing: var(--typography-h1-letter-spacing);
            text-transform: var(--typography-h1-text-transform);
            text-decoration: var(--typography-h1-text-decoration);
            color: var(--typography-h1-color, inherit);
        }

        .h2 {
            font-family: var(--typography-h2-font-family);
            font-weight: var(--typography-h2-font-weight);
            font-style: var(--typography-h2-font-style);
            font-size: var(--typography-h2-font-size);
            line-height: var(--typography-h2-line-height);
            letter-spacing: var(--typography-h2-letter-spacing);
            text-transform: var(--typography-h2-text-transform);
            text-decoration: var(--typography-h2-text-decoration);
            color: var(--typography-h2-color, inherit);
        }

        .h3 {
            font-family: var(--typography-h3-font-family);
            font-weight: var(--typography-h3-font-weight);
            font-style: var(--typography-h3-font-style);
            font-size: var(--typography-h3-font-size);
            line-height: var(--typography-h3-line-height);
            letter-spacing: var(--typography-h3-letter-spacing);
            text-transform: var(--typography-h3-text-transform);
            text-decoration: var(--typography-h3-text-decoration);
            color: var(--typography-h3-color, inherit);
        }

        .h4 {
            font-family: var(--typography-h4-font-family);
            font-weight: var(--typography-h4-font-weight);
            font-style: var(--typography-h4-font-style);
            font-size: var(--typography-h4-font-size);
            line-height: var(--typography-h4-line-height);
            letter-spacing: var(--typography-h4-letter-spacing);
            text-transform: var(--typography-h4-text-transform);
            text-decoration: var(--typography-h4-text-decoration);
            color: var(--typography-h4-color, inherit);
        }

        .h5 {
            font-family: var(--typography-h5-font-family);
            font-weight: var(--typography-h5-font-weight);
            font-style: var(--typography-h5-font-style);
            font-size: var(--typography-h5-font-size);
            line-height: var(--typography-h5-line-height);
            letter-spacing: var(--typography-h5-letter-spacing);
            text-transform: var(--typography-h5-text-transform);
            text-decoration: var(--typography-h5-text-decoration);
            color: var(--typography-h5-color, inherit);
        }

        .h6 {
            font-family: var(--typography-h6-font-family);
            font-weight: var(--typography-h6-font-weight);
            font-style: var(--typography-h6-font-style);
            font-size: var(--typography-h6-font-size);
            line-height: var(--typography-h6-line-height);
            letter-spacing: var(--typography-h6-letter-spacing);
            text-transform: var(--typography-h6-text-transform);
            text-decoration: var(--typography-h6-text-decoration);
            color: var(--typography-h6-color, inherit);
        }

        .paragraph {
            font-family: var(--typography-paragraph-font-family);
            font-weight: var(--typography-paragraph-font-weight);
            font-style: var(--typography-paragraph-font-style);
            font-size: var(--typography-paragraph-font-size);
            line-height: var(--typography-paragraph-line-height);
            letter-spacing: var(--typography-paragraph-letter-spacing);
            text-transform: var(--typography-paragraph-text-transform);
            text-decoration: var(--typography-paragraph-text-decoration);
            color: var(--typography-paragraph-color, inherit);
        }

        .blockquote {
            font-family: var(--typography-blockquote-font-family);
            font-weight: var(--typography-blockquote-font-weight);
            font-style: var(--typography-blockquote-font-style);
            font-size: var(--typography-blockquote-font-size);
            line-height: var(--typography-blockquote-line-height);
            letter-spacing: var(--typography-blockquote-letter-spacing);
            text-transform: var(--typography-blockquote-text-transform);
            text-decoration: var(--typography-blockquote-text-decoration);
            color: var(--typography-blockquote-color, inherit);
        }

        .code {
            font-family: var(--typography-code-font-family);
            font-weight: var(--typography-code-font-weight);
            font-style: var(--typography-code-font-style);
            font-size: var(--typography-code-font-size);
            line-height: var(--typography-code-line-height);
            letter-spacing: var(--typography-code-letter-spacing);
            text-transform: var(--typography-code-text-transform);
            text-decoration: var(--typography-code-text-decoration);
            color: var(--typography-code-color, inherit);
        }

        .small {
            font-family: var(--typography-small-font-family);
            font-weight: var(--typography-small-font-weight);
            font-style: var(--typography-small-font-style);
            font-size: var(--typography-small-font-size);
            line-height: var(--typography-small-line-height);
            letter-spacing: var(--typography-small-letter-spacing);
            text-transform: var(--typography-small-text-transform);
            text-decoration: var(--typography-small-text-decoration);
            color: var(--typography-small-color, inherit);
        }

        /* Link typography */
        .a {
            color: var(--typography-link-color, inherit);
            text-decoration: var(--typography-link-text-decoration, none);
            font-weight: var(--typography-link-font-weight, inherit);
        }
        .a:hover {
            color: var(--typography-link-hover-color, var(--typography-link-color, inherit));
            text-decoration: var(--typography-link-hover-text-decoration, var(--typography-link-text-decoration, none));
        }

        /* List typography */
        .ul {
            list-style-type: var(--typography-ul-list-style, disc);
            padding-left: var(--typography-ul-padding-left, 1.5em);
            margin-bottom: var(--typography-ul-margin-bottom, 1em);
            color: var(--typography-ul-color, inherit);
        }
        .ol {
            list-style-type: var(--typography-ol-list-style, decimal);
            padding-left: var(--typography-ol-padding-left, 1.5em);
            margin-bottom: var(--typography-ol-margin-bottom, 1em);
            color: var(--typography-ol-color, inherit);
        }
        .li {
            margin-bottom: var(--typography-li-margin-bottom, 0.25em);
            color: var(--typography-li-color, inherit);
        }

        /* Horizontal rule */
        .hr {
            border: none;
            border-top: var(--typography-hr-border-width, 1px) var(--typography-hr-border-style, solid) var(--typography-hr-color, currentColor);
            margin-block: var(--typography-hr-margin-block, 1.5em);
            opacity: var(--typography-hr-opacity, 0.2);
        }

        /* Table typography */
        .table {
            width: var(--typography-table-width, 100%);
            border-collapse: collapse;
            margin-bottom: var(--typography-table-margin-bottom, 1em);
            color: var(--typography-table-color, inherit);
        }
        .th {
            text-align: var(--typography-th-text-align, left);
            font-weight: var(--typography-th-font-weight, 600);
            padding: var(--typography-th-padding, 0.5em 0.75em);
            border-bottom: var(--typography-th-border-width, 2px) solid var(--typography-th-border-color, currentColor);
        }
        .td {
            padding: var(--typography-td-padding, 0.5em 0.75em);
            border-bottom: var(--typography-td-border-width, 1px) solid var(--typography-td-border-color, currentColor);
        }
        
        /* Typography overrides for text modifiers */
        .h1 strong, .h1 b {
            font-family: var(--typography-h1-strong-font-family, var(--typography-h1-font-family));
            font-weight: var(--typography-h1-strong-font-weight, var(--typography-h1-font-weight));
            font-style: var(--typography-h1-strong-font-style, normal);
            font-size: var(--typography-h1-strong-font-size, 1em);
            letter-spacing: var(--typography-h1-strong-letter-spacing, var(--typography-h1-letter-spacing));
            text-transform: var(--typography-h1-strong-text-transform, none);
            text-decoration: var(--typography-h1-strong-text-decoration, none);
        }
        
        .h1 em, .h1 i {
            font-family: var(--typography-h1-emphasis-font-family, var(--typography-h1-font-family));
            font-weight: var(--typography-h1-emphasis-font-weight, var(--typography-h1-font-weight));
            font-style: var(--typography-h1-emphasis-font-style, italic);
            font-size: var(--typography-h1-emphasis-font-size, 1em);
            letter-spacing: var(--typography-h1-emphasis-letter-spacing, var(--typography-h1-letter-spacing));
            text-transform: var(--typography-h1-emphasis-text-transform, none);
            text-decoration: var(--typography-h1-emphasis-text-decoration, none);
        }
        
        .h1 code {
            font-family: var(--typography-h1-inlineCode-font-family, var(--typography-h1-font-family));
            font-weight: var(--typography-h1-inlineCode-font-weight, var(--typography-h1-font-weight));
            font-style: var(--typography-h1-inlineCode-font-style, normal);
            font-size: var(--typography-h1-inlineCode-font-size, 1em);
            letter-spacing: var(--typography-h1-inlineCode-letter-spacing, var(--typography-h1-letter-spacing));
            text-transform: var(--typography-h1-inlineCode-text-transform, none);
            text-decoration: var(--typography-h1-inlineCode-text-decoration, none);
        }
        
        .h2 strong, .h2 b {
            font-family: var(--typography-h2-strong-font-family, var(--typography-h2-font-family));
            font-weight: var(--typography-h2-strong-font-weight, var(--typography-h2-font-weight));
            font-style: var(--typography-h2-strong-font-style, normal);
            font-size: var(--typography-h2-strong-font-size, 1em);
            letter-spacing: var(--typography-h2-strong-letter-spacing, var(--typography-h2-letter-spacing));
            text-transform: var(--typography-h2-strong-text-transform, none);
            text-decoration: var(--typography-h2-strong-text-decoration, none);
        }
        
        .h2 em, .h2 i {
            font-family: var(--typography-h2-emphasis-font-family, var(--typography-h2-font-family));
            font-weight: var(--typography-h2-emphasis-font-weight, var(--typography-h2-font-weight));
            font-style: var(--typography-h2-emphasis-font-style, italic);
            font-size: var(--typography-h2-emphasis-font-size, 1em);
            letter-spacing: var(--typography-h2-emphasis-letter-spacing, var(--typography-h2-letter-spacing));
            text-transform: var(--typography-h2-emphasis-text-transform, none);
            text-decoration: var(--typography-h2-emphasis-text-decoration, none);
        }
        
        .h2 code {
            font-family: var(--typography-h2-inlineCode-font-family, var(--typography-h2-font-family));
            font-weight: var(--typography-h2-inlineCode-font-weight, var(--typography-h2-font-weight));
            font-style: var(--typography-h2-inlineCode-font-style, normal);
            font-size: var(--typography-h2-inlineCode-font-size, 1em);
            letter-spacing: var(--typography-h2-inlineCode-letter-spacing, var(--typography-h2-letter-spacing));
            text-transform: var(--typography-h2-inlineCode-text-transform, none);
            text-decoration: var(--typography-h2-inlineCode-text-decoration, none);
        }
        
        .h3 strong, .h3 b {
            font-family: var(--typography-h3-strong-font-family, var(--typography-h3-font-family));
            font-weight: var(--typography-h3-strong-font-weight, var(--typography-h3-font-weight));
            font-style: var(--typography-h3-strong-font-style, normal);
            font-size: var(--typography-h3-strong-font-size, 1em);
            letter-spacing: var(--typography-h3-strong-letter-spacing, var(--typography-h3-letter-spacing));
            text-transform: var(--typography-h3-strong-text-transform, none);
            text-decoration: var(--typography-h3-strong-text-decoration, none);
        }
        
        .h3 em, .h3 i {
            font-family: var(--typography-h3-emphasis-font-family, var(--typography-h3-font-family));
            font-weight: var(--typography-h3-emphasis-font-weight, var(--typography-h3-font-weight));
            font-style: var(--typography-h3-emphasis-font-style, italic);
            font-size: var(--typography-h3-emphasis-font-size, 1em);
            letter-spacing: var(--typography-h3-emphasis-letter-spacing, var(--typography-h3-letter-spacing));
            text-transform: var(--typography-h3-emphasis-text-transform, none);
            text-decoration: var(--typography-h3-emphasis-text-decoration, none);
        }
        
        .h3 code {
            font-family: var(--typography-h3-inlineCode-font-family, var(--typography-h3-font-family));
            font-weight: var(--typography-h3-inlineCode-font-weight, var(--typography-h3-font-weight));
            font-style: var(--typography-h3-inlineCode-font-style, normal);
            font-size: var(--typography-h3-inlineCode-font-size, 1em);
            letter-spacing: var(--typography-h3-inlineCode-letter-spacing, var(--typography-h3-letter-spacing));
            text-transform: var(--typography-h3-inlineCode-text-transform, none);
            text-decoration: var(--typography-h3-inlineCode-text-decoration, none);
        }
        
        .h4 strong, .h4 b {
            font-family: var(--typography-h4-strong-font-family, var(--typography-h4-font-family));
            font-weight: var(--typography-h4-strong-font-weight, var(--typography-h4-font-weight));
            font-style: var(--typography-h4-strong-font-style, normal);
            font-size: var(--typography-h4-strong-font-size, 1em);
            letter-spacing: var(--typography-h4-strong-letter-spacing, var(--typography-h4-letter-spacing));
            text-transform: var(--typography-h4-strong-text-transform, none);
            text-decoration: var(--typography-h4-strong-text-decoration, none);
        }
        
        .h4 em, .h4 i {
            font-family: var(--typography-h4-emphasis-font-family, var(--typography-h4-font-family));
            font-weight: var(--typography-h4-emphasis-font-weight, var(--typography-h4-font-weight));
            font-style: var(--typography-h4-emphasis-font-style, italic);
            font-size: var(--typography-h4-emphasis-font-size, 1em);
            letter-spacing: var(--typography-h4-emphasis-letter-spacing, var(--typography-h4-letter-spacing));
            text-transform: var(--typography-h4-emphasis-text-transform, none);
            text-decoration: var(--typography-h4-emphasis-text-decoration, none);
        }
        
        .h4 code {
            font-family: var(--typography-h4-inlineCode-font-family, var(--typography-h4-font-family));
            font-weight: var(--typography-h4-inlineCode-font-weight, var(--typography-h4-font-weight));
            font-style: var(--typography-h4-inlineCode-font-style, normal);
            font-size: var(--typography-h4-inlineCode-font-size, 1em);
            letter-spacing: var(--typography-h4-inlineCode-letter-spacing, var(--typography-h4-letter-spacing));
            text-transform: var(--typography-h4-inlineCode-text-transform, none);
            text-decoration: var(--typography-h4-inlineCode-text-decoration, none);
        }
        
        .h5 strong, .h5 b {
            font-family: var(--typography-h5-strong-font-family, var(--typography-h5-font-family));
            font-weight: var(--typography-h5-strong-font-weight, var(--typography-h5-font-weight));
            font-style: var(--typography-h5-strong-font-style, normal);
            font-size: var(--typography-h5-strong-font-size, 1em);
            letter-spacing: var(--typography-h5-strong-letter-spacing, var(--typography-h5-letter-spacing));
            text-transform: var(--typography-h5-strong-text-transform, none);
            text-decoration: var(--typography-h5-strong-text-decoration, none);
        }
        
        .h5 em, .h5 i {
            font-family: var(--typography-h5-emphasis-font-family, var(--typography-h5-font-family));
            font-weight: var(--typography-h5-emphasis-font-weight, var(--typography-h5-font-weight));
            font-style: var(--typography-h5-emphasis-font-style, italic);
            font-size: var(--typography-h5-emphasis-font-size, 1em);
            letter-spacing: var(--typography-h5-emphasis-letter-spacing, var(--typography-h5-letter-spacing));
            text-transform: var(--typography-h5-emphasis-text-transform, none);
            text-decoration: var(--typography-h5-emphasis-text-decoration, none);
        }
        
        .h5 code {
            font-family: var(--typography-h5-inlineCode-font-family, var(--typography-h5-font-family));
            font-weight: var(--typography-h5-inlineCode-font-weight, var(--typography-h5-font-weight));
            font-style: var(--typography-h5-inlineCode-font-style, normal);
            font-size: var(--typography-h5-inlineCode-font-size, 1em);
            letter-spacing: var(--typography-h5-inlineCode-letter-spacing, var(--typography-h5-letter-spacing));
            text-transform: var(--typography-h5-inlineCode-text-transform, none);
            text-decoration: var(--typography-h5-inlineCode-text-decoration, none);
        }
        
        .h6 strong, .h6 b {
            font-family: var(--typography-h6-strong-font-family, var(--typography-h6-font-family));
            font-weight: var(--typography-h6-strong-font-weight, var(--typography-h6-font-weight));
            font-style: var(--typography-h6-strong-font-style, normal);
            font-size: var(--typography-h6-strong-font-size, 1em);
            letter-spacing: var(--typography-h6-strong-letter-spacing, var(--typography-h6-letter-spacing));
            text-transform: var(--typography-h6-strong-text-transform, none);
            text-decoration: var(--typography-h6-strong-text-decoration, none);
        }
        
        .h6 em, .h6 i {
            font-family: var(--typography-h6-emphasis-font-family, var(--typography-h6-font-family));
            font-weight: var(--typography-h6-emphasis-font-weight, var(--typography-h6-font-weight));
            font-style: var(--typography-h6-emphasis-font-style, italic);
            font-size: var(--typography-h6-emphasis-font-size, 1em);
            letter-spacing: var(--typography-h6-emphasis-letter-spacing, var(--typography-h6-letter-spacing));
            text-transform: var(--typography-h6-emphasis-text-transform, none);
            text-decoration: var(--typography-h6-emphasis-text-decoration, none);
        }
        
        .h6 code {
            font-family: var(--typography-h6-inlineCode-font-family, var(--typography-h6-font-family));
            font-weight: var(--typography-h6-inlineCode-font-weight, var(--typography-h6-font-weight));
            font-style: var(--typography-h6-inlineCode-font-style, normal);
            font-size: var(--typography-h6-inlineCode-font-size, 1em);
            letter-spacing: var(--typography-h6-inlineCode-letter-spacing, var(--typography-h6-letter-spacing));
            text-transform: var(--typography-h6-inlineCode-text-transform, none);
            text-decoration: var(--typography-h6-inlineCode-text-decoration, none);
        }
        
        .paragraph strong, .paragraph b {
            font-family: var(--typography-paragraph-strong-font-family, var(--typography-paragraph-font-family));
            font-weight: var(--typography-paragraph-strong-font-weight, var(--typography-paragraph-font-weight));
            font-style: var(--typography-paragraph-strong-font-style, normal);
            font-size: var(--typography-paragraph-strong-font-size, 1em);
            letter-spacing: var(--typography-paragraph-strong-letter-spacing, var(--typography-paragraph-letter-spacing));
            text-transform: var(--typography-paragraph-strong-text-transform, none);
            text-decoration: var(--typography-paragraph-strong-text-decoration, none);
        }
        
        .paragraph em, .paragraph i {
            font-family: var(--typography-paragraph-emphasis-font-family, var(--typography-paragraph-font-family));
            font-weight: var(--typography-paragraph-emphasis-font-weight, var(--typography-paragraph-font-weight));
            font-style: var(--typography-paragraph-emphasis-font-style, italic);
            font-size: var(--typography-paragraph-emphasis-font-size, 1em);
            letter-spacing: var(--typography-paragraph-emphasis-letter-spacing, var(--typography-paragraph-letter-spacing));
            text-transform: var(--typography-paragraph-emphasis-text-transform, none);
            text-decoration: var(--typography-paragraph-emphasis-text-decoration, none);
        }
        
        .paragraph code {
            font-family: var(--typography-paragraph-inlineCode-font-family, var(--typography-paragraph-font-family));
            font-weight: var(--typography-paragraph-inlineCode-font-weight, var(--typography-paragraph-font-weight));
            font-style: var(--typography-paragraph-inlineCode-font-style, normal);
            font-size: var(--typography-paragraph-inlineCode-font-size, 1em);
            letter-spacing: var(--typography-paragraph-inlineCode-letter-spacing, var(--typography-paragraph-letter-spacing));
            text-transform: var(--typography-paragraph-inlineCode-text-transform, none);
            text-decoration: var(--typography-paragraph-inlineCode-text-decoration, none);
        }
        
        .blockquote strong, .blockquote b {
            font-family: var(--typography-blockquote-strong-font-family, var(--typography-blockquote-font-family));
            font-weight: var(--typography-blockquote-strong-font-weight, var(--typography-blockquote-font-weight));
            font-style: var(--typography-blockquote-strong-font-style, normal);
            font-size: var(--typography-blockquote-strong-font-size, 1em);
            letter-spacing: var(--typography-blockquote-strong-letter-spacing, var(--typography-blockquote-letter-spacing));
            text-transform: var(--typography-blockquote-strong-text-transform, none);
            text-decoration: var(--typography-blockquote-strong-text-decoration, none);
        }
        
        .blockquote em, .blockquote i {
            font-family: var(--typography-blockquote-emphasis-font-family, var(--typography-blockquote-font-family));
            font-weight: var(--typography-blockquote-emphasis-font-weight, var(--typography-blockquote-font-weight));
            font-style: var(--typography-blockquote-emphasis-font-style, italic);
            font-size: var(--typography-blockquote-emphasis-font-size, 1em);
            letter-spacing: var(--typography-blockquote-emphasis-letter-spacing, var(--typography-blockquote-letter-spacing));
            text-transform: var(--typography-blockquote-emphasis-text-transform, none);
            text-decoration: var(--typography-blockquote-emphasis-text-decoration, none);
        }
        
        .blockquote code {
            font-family: var(--typography-blockquote-inlineCode-font-family, var(--typography-blockquote-font-family));
            font-weight: var(--typography-blockquote-inlineCode-font-weight, var(--typography-blockquote-font-weight));
            font-style: var(--typography-blockquote-inlineCode-font-style, normal);
            font-size: var(--typography-blockquote-inlineCode-font-size, 1em);
            letter-spacing: var(--typography-blockquote-inlineCode-letter-spacing, var(--typography-blockquote-letter-spacing));
            text-transform: var(--typography-blockquote-inlineCode-text-transform, none);
            text-decoration: var(--typography-blockquote-inlineCode-text-decoration, none);
        }
        
        .small strong, .small b {
            font-family: var(--typography-small-strong-font-family, var(--typography-small-font-family));
            font-weight: var(--typography-small-strong-font-weight, var(--typography-small-font-weight));
            font-style: var(--typography-small-strong-font-style, normal);
            font-size: var(--typography-small-strong-font-size, 1em);
            letter-spacing: var(--typography-small-strong-letter-spacing, var(--typography-small-letter-spacing));
            text-transform: var(--typography-small-strong-text-transform, none);
            text-decoration: var(--typography-small-strong-text-decoration, none);
        }
        
        .small em, .small i {
            font-family: var(--typography-small-emphasis-font-family, var(--typography-small-font-family));
            font-weight: var(--typography-small-emphasis-font-weight, var(--typography-small-font-weight));
            font-style: var(--typography-small-emphasis-font-style, italic);
            font-size: var(--typography-small-emphasis-font-size, 1em);
            letter-spacing: var(--typography-small-emphasis-letter-spacing, var(--typography-small-letter-spacing));
            text-transform: var(--typography-small-emphasis-text-transform, none);
            text-decoration: var(--typography-small-emphasis-text-decoration, none);
        }
        
        .small code {
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
                --warning: ${resolvedDark.warning};
                --warning-foreground: ${darkSlots.warning ? getForeground(darkSlots.warning, "dark") : "#451a03"};
                --success: ${resolvedDark.success};
                --success-foreground: ${darkSlots.success ? getForeground(darkSlots.success, "dark") : "#052e16"};

                /* Typography colors (dark mode) */
                ${typographyColorVarsDark}

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
            --warning: ${resolvedDark.warning};
            --warning-foreground: ${darkSlots.warning ? getForeground(darkSlots.warning, "dark") : "#451a03"};
            --success: ${resolvedDark.success};
            --success-foreground: ${darkSlots.success ? getForeground(darkSlots.success, "dark") : "#052e16"};

            /* Typography colors (dark mode) */
            ${typographyColorVarsDark}

        }

        /* Container padding */
        ${generateContainerPaddingCSS(theme.containerPadding)}
        `,
      }}
    />
  );
}
