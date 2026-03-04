import { fetchConfigs, isValidSite } from "@otl-core/engine-next-utils";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** 1x1 transparent PNG -- returned when no favicon is configured */
const TRANSPARENT_PIXEL = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  "base64",
);

function transparentResponse(maxAge: number): NextResponse {
  return new NextResponse(TRANSPARENT_PIXEL, {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": `public, max-age=${maxAge}`,
    },
  });
}

export async function GET() {
  try {
    const configs = await fetchConfigs();

    if (isValidSite(configs)) {
      if (configs.favicon.favicon_ico) {
        return NextResponse.redirect(configs.favicon.favicon_ico, 302);
      }
      if (configs.favicon.apple_touch_icon_180) {
        return NextResponse.redirect(configs.favicon.apple_touch_icon_180, 302);
      }
    }

    return transparentResponse(86400);
  } catch (error) {
    console.error("[ERROR] Failed to serve favicon:", error);
    return transparentResponse(3600);
  }
}
