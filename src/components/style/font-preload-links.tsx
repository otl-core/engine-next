import type { FontConfig } from "@otl-core/cms-types";

/**
 * Extracts woff2 URLs from font config for preloading.
 * Only woff2 is preloaded — all browsers that support preload also support woff2.
 * Deduplicates URLs (variable fonts may reference the same file for multiple variants).
 */
function getPreloadUrls(fonts: FontConfig | null): string[] {
  if (!fonts?.fonts) return [];

  const urls = new Set<string>();

  for (const font of fonts.fonts) {
    if (!font.files) continue;
    for (const [key, url] of Object.entries(font.files)) {
      // Format-keyed: "400.woff2" → ext is "woff2"
      const dotIdx = key.lastIndexOf(".");
      const possibleExt = dotIdx > 0 ? key.slice(dotIdx + 1) : "";
      const isFormatKeyed = ["woff2", "woff", "ttf", "otf"].includes(
        possibleExt,
      );

      if (isFormatKeyed) {
        // Only preload woff2 entries
        if (possibleExt === "woff2") {
          urls.add(url);
        }
      } else {
        // Legacy key (no extension) — check URL extension
        const urlExt = url
          .split("?")[0]
          .split("#")[0]
          .split(".")
          .pop()
          ?.toLowerCase();
        if (urlExt === "woff2") {
          urls.add(url);
        }
      }
    }
  }

  return Array.from(urls);
}

/**
 * Renders <link rel="preload"> tags for woff2 font files.
 * Must be placed in <head> to start font downloads as early as possible,
 * reducing CLS from font-display: optional falling back.
 */
export function FontPreloadLinks({ fonts }: { fonts: FontConfig | null }) {
  const urls = getPreloadUrls(fonts);
  if (urls.length === 0) return null;

  return (
    <>
      {urls.map((url) => (
        <link
          key={url}
          rel="preload"
          href={url}
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      ))}
    </>
  );
}
