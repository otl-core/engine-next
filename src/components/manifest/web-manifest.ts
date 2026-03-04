/**
 * Web App Manifest Generation
 * Generates manifest.json dynamically based on favicon config
 */

import { getWebsiteConfig } from "@otl-core/engine-next-utils";
import { getLocalizedString } from "@otl-core/cms-utils";
import { FaviconConfig } from "@otl-core/cms-types";

export interface WebManifest {
  name: string;
  short_name: string;
  start_url: string;
  display: string;
  background_color: string;
  theme_color: string;
  scope?: string;
  icons: ManifestIcon[];
}

export interface ManifestIcon {
  src: string;
  sizes: string;
  type: string;
  purpose?: string;
}

/**
 * Generate web app manifest from favicon config
 */
export async function generateWebManifest(
  faviconConfig: FaviconConfig | null,
  locale: string = "en",
): Promise<WebManifest | null> {
  if (!faviconConfig) return null;

  const websiteConfig = await getWebsiteConfig();
  const siteName = websiteConfig
    ? getLocalizedString(websiteConfig.site_name, { preferredLocale: locale })
    : "Website";

  const manifest: WebManifest = {
    name: faviconConfig.manifest_name || siteName,
    short_name: faviconConfig.manifest_short_name || siteName.substring(0, 12),
    start_url: faviconConfig.manifest_start_url || "/",
    display: (faviconConfig.manifest_display as string) || "standalone",
    background_color: faviconConfig.background_color || "#ffffff",
    theme_color: faviconConfig.theme_color || "#000000",
    icons: [],
  };

  if (faviconConfig.manifest_scope) {
    manifest.scope = faviconConfig.manifest_scope;
  }

  // ICO favicon (general-purpose fallback, multi-resolution)
  if (faviconConfig.favicon_ico) {
    manifest.icons.push({
      src: faviconConfig.favicon_ico,
      sizes: "any",
      type: "image/x-icon",
    });
  }

  // Apple Touch Icon (standard 180x180 -- not maskable, Apple has its own safe zone)
  if (faviconConfig.apple_touch_icon_180) {
    manifest.icons.push({
      src: faviconConfig.apple_touch_icon_180,
      sizes: "180x180",
      type: "image/png",
    });
  }

  // Android Chrome icons (designed with maskable safe zone)
  const androidIcons: Array<{ src: string | undefined; sizes: string }> = [
    { src: faviconConfig.android_chrome_36, sizes: "36x36" },
    { src: faviconConfig.android_chrome_48, sizes: "48x48" },
    { src: faviconConfig.android_chrome_72, sizes: "72x72" },
    { src: faviconConfig.android_chrome_96, sizes: "96x96" },
    { src: faviconConfig.android_chrome_144, sizes: "144x144" },
    { src: faviconConfig.android_chrome_192, sizes: "192x192" },
    { src: faviconConfig.android_chrome_256, sizes: "256x256" },
    { src: faviconConfig.android_chrome_384, sizes: "384x384" },
    { src: faviconConfig.android_chrome_512, sizes: "512x512" },
  ];

  for (const icon of androidIcons) {
    if (icon.src) {
      manifest.icons.push({
        src: icon.src,
        sizes: icon.sizes,
        type: "image/png",
        purpose: "any maskable",
      });
    }
  }

  return manifest;
}

/**
 * Generate browserconfig.xml for Microsoft
 */
export function generateBrowserConfig(
  faviconConfig: FaviconConfig | null,
): string | null {
  if (!faviconConfig) return null;

  const tileColor = escapeXmlAttr(
    faviconConfig.ms_application_tile_color || "#ffffff",
  );
  const tiles: string[] = [];

  if (faviconConfig.ms_application_tile_70) {
    tiles.push(
      `<square70x70logo src="${escapeXmlAttr(faviconConfig.ms_application_tile_70)}"/>`,
    );
  }
  if (faviconConfig.ms_application_tile_150) {
    tiles.push(
      `<square150x150logo src="${escapeXmlAttr(faviconConfig.ms_application_tile_150)}"/>`,
    );
  }
  if (faviconConfig.ms_application_tile_310) {
    tiles.push(
      `<square310x310logo src="${escapeXmlAttr(faviconConfig.ms_application_tile_310)}"/>`,
    );
  }
  if (faviconConfig.ms_application_tile_wide) {
    tiles.push(
      `<wide310x150logo src="${escapeXmlAttr(faviconConfig.ms_application_tile_wide)}"/>`,
    );
  }

  if (tiles.length === 0) return null;

  return `<?xml version="1.0" encoding="utf-8"?>
<browserconfig>
  <msapplication>
    <tile>
      ${tiles.join("\n      ")}
      <TileColor>${tileColor}</TileColor>
    </tile>
  </msapplication>
</browserconfig>`;
}

/** Escape characters that are invalid in XML attribute values */
function escapeXmlAttr(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
