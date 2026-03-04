import { generateWebManifest } from "@/components/manifest/web-manifest";
import { fetchConfigs, isValidSite } from "@otl-core/engine-next-utils";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Web App Manifest - PWA configuration
 * Defines how the app appears when installed
 */
export async function GET() {
  try {
    const configs = await fetchConfigs();

    if (isValidSite(configs)) {
      const locale = configs.site.default_locale;
      const manifest = await generateWebManifest(configs.favicon, locale);

      if (manifest) {
        return NextResponse.json(manifest, {
          status: 200,
          headers: {
            "Content-Type": "application/manifest+json",
            "Cache-Control": "public, max-age=86400, s-maxage=86400",
          },
        });
      }
    }

    return fallbackManifest();
  } catch (error) {
    console.error("[ERROR] Failed to generate manifest:", error);
    return fallbackManifest();
  }
}

function fallbackManifest(): NextResponse {
  return NextResponse.json(
    {
      name: "Website",
      short_name: "Website",
      start_url: "/",
      display: "standalone",
      background_color: "#ffffff",
      theme_color: "#000000",
    },
    {
      status: 200,
      headers: {
        "Content-Type": "application/manifest+json",
        "Cache-Control": "public, max-age=3600",
      },
    },
  );
}
