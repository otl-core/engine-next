import { generateBrowserConfig } from "@/components/manifest/web-manifest";
import { fetchConfigs, isValidSite } from "@otl-core/engine-next-utils";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const FALLBACK_BROWSERCONFIG = `<?xml version="1.0" encoding="utf-8"?>
<browserconfig>
  <msapplication>
    <tile>
      <TileColor>#ffffff</TileColor>
    </tile>
  </msapplication>
</browserconfig>`;

function xmlResponse(
  body: string,
  cacheControl = "public, max-age=3600, s-maxage=3600",
): NextResponse {
  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": cacheControl,
    },
  });
}

export async function GET() {
  try {
    const configs = await fetchConfigs();

    if (!isValidSite(configs)) {
      return xmlResponse(FALLBACK_BROWSERCONFIG);
    }

    const browserConfig = generateBrowserConfig(configs.favicon);
    return xmlResponse(browserConfig || FALLBACK_BROWSERCONFIG);
  } catch (error) {
    console.error("[ERROR] Failed to generate browserconfig:", error);
    return xmlResponse(FALLBACK_BROWSERCONFIG);
  }
}
