import { fetchConfigs, isValidSite } from "@otl-core/engine-next-utils";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * ads.txt - Digital advertising authorization
 * Used by ad networks to verify authorized sellers.
 * Content is fully configurable per site via the management app.
 */
export async function GET() {
  try {
    const configs = await fetchConfigs();

    let content = "";
    if (isValidSite(configs) && configs.website.ads_txt_content) {
      content = configs.website.ads_txt_content;
    }

    return new NextResponse(content, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch (error) {
    console.error("[ERROR] Failed to generate ads.txt:", error);
    return new NextResponse("", {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  }
}
