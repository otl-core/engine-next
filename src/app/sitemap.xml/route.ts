import { getAPIClient } from "@otl-core/cms-api";
import {
  fetchConfigs,
  isValidSite,
  buildSiteContext,
} from "@otl-core/engine-next-utils";
import { NextResponse } from "next/server";

// Always render at request time -- the backend caches sitemap responses (max-age=3600)
export const dynamic = "force-dynamic";

/**
 * sitemap.xml - SEO sitemap
 * Proxies the backend-generated sitemap, with stale-while-error resilience.
 */
export async function GET() {
  try {
    const backend = getAPIClient();
    const siteId = backend.getSiteId();
    const baseURL = `${backend.getBaseUrl()}/api/v1/public/sites/${siteId}/sitemap.xml`;

    // Derive siteUrl from site config or env
    const configs = await fetchConfigs();
    let siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (!siteUrl && isValidSite(configs)) {
      const site = buildSiteContext(configs, configs.site.default_locale, "/");
      siteUrl = site.siteUrl;
    }

    const url = siteUrl
      ? `${baseURL}?base_url=${encodeURIComponent(siteUrl)}`
      : baseURL;

    const token = process.env.SITE_ACCESS_TOKEN;
    const headers: Record<string, string> = token
      ? { Authorization: `Bearer ${token}` }
      : {};

    const response = await fetch(url, {
      headers,
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      // Backend returned an error -- try to serve stale cached sitemap
      const stale = await tryStaleCache(url, headers);
      if (stale) return sitemapResponse(stale, 3600);

      throw new Error(`Backend returned ${response.status}`);
    }

    const sitemap = await response.text();
    return sitemapResponse(sitemap, 3600);
  } catch (error) {
    console.error("[ERROR] Failed to fetch sitemap from backend:", error);

    const fallbackUrl = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(
      /\/+$/,
      "",
    );
    const errorSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<!-- Sitemap temporarily unavailable -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${fallbackUrl ? `  <url>\n    <loc>${fallbackUrl}/</loc>\n  </url>` : ""}
</urlset>`;

    // Short cache so it retries sooner once the backend recovers
    return sitemapResponse(errorSitemap, 300);
  }
}

function sitemapResponse(body: string, maxAge: number): NextResponse {
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": `public, max-age=${maxAge}, s-maxage=${maxAge}`,
    },
  });
}

/**
 * Attempt to retrieve the last known sitemap from the Next.js data cache.
 */
async function tryStaleCache(
  url: string,
  headers: Record<string, string>,
): Promise<string | null> {
  try {
    const staleResponse = await fetch(url, {
      headers,
      cache: "force-cache",
    });

    if (staleResponse.ok) {
      console.log("[sitemap] Serving stale cached sitemap");
      return staleResponse.text();
    }
  } catch {
    // No cache entry available
  }
  return null;
}
