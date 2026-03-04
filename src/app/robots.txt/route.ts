import {
  fetchConfigs,
  isValidSite,
  buildSiteContext,
} from "@otl-core/engine-next-utils";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * robots.txt - SEO crawling instructions
 * Tells search engines which pages to crawl
 */
export async function GET() {
  try {
    const configs = await fetchConfigs();
    let siteUrl = "";

    if (isValidSite(configs)) {
      const site = buildSiteContext(
        configs,
        configs.site.default_locale,
        "/",
        process.env.NEXT_PUBLIC_SITE_URL,
      );
      siteUrl = site.siteUrl;
    } else if (process.env.NEXT_PUBLIC_SITE_URL) {
      siteUrl = process.env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, "");
    }

    // Append custom rules from config if configured
    const customRules =
      isValidSite(configs) && configs.website.robots_txt_custom_rules
        ? configs.website.robots_txt_custom_rules
        : "";

    const robotsTxt = `# Robots.txt
User-agent: *
Allow: /
${siteUrl ? `\nSitemap: ${siteUrl}/sitemap.xml` : ""}
${customRules ? `\n${customRules}\n` : ""}`;

    return new NextResponse(robotsTxt, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (error) {
    console.error("[ERROR] Failed to generate robots.txt:", error);
    return new NextResponse("User-agent: *\nAllow: /\n", {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=300",
      },
    });
  }
}
