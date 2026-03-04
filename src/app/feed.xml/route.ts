import {
  fetchConfigs,
  fetchCollections,
  fetchEntries,
  isValidSite,
  buildSiteContext,
} from "@otl-core/engine-next-utils";
import type { Collection, Entry } from "@otl-core/cms-types";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * RSS 2.0 Feed
 *
 * Generates a proper RSS feed from all published collection entries across every
 * collection in the site. Uses real entry data (title, excerpt, publish
 * date, tags) from the backend -- nothing is guessed from URL slugs.
 */
export async function GET() {
  try {
    const configs = await fetchConfigs();
    if (!isValidSite(configs)) {
      return emptyFeed();
    }

    const locale = configs.site.default_locale;
    const site = buildSiteContext(
      configs,
      locale,
      "/feed.xml",
      process.env.NEXT_PUBLIC_SITE_URL,
    );

    // Fetch all collections for the site
    const collections = await fetchCollections();
    if (!collections || collections.length === 0) {
      return emptyFeed(site.siteName, site.siteUrl);
    }

    // Fetch published entries from every collection (up to 200 most recent)
    const allEntries: Array<{ entry: Entry; collection: Collection }> = [];
    for (const collection of collections) {
      const entries = await fetchEntries(collection.id, { limit: 200 });
      if (entries) {
        for (const entry of entries) {
          if (entry.status === "published") {
            allEntries.push({ entry, collection });
          }
        }
      }
    }

    // Sort by publish date descending (most recent first)
    allEntries.sort((a, b) => {
      const dateA = a.entry.published_at
        ? new Date(a.entry.published_at).getTime()
        : 0;
      const dateB = b.entry.published_at
        ? new Date(b.entry.published_at).getTime()
        : 0;
      return dateB - dateA;
    });

    // Determine <lastBuildDate> from the most recent entry
    const lastBuildDate = allEntries[0]?.entry.published_at
      ? toRFC822(new Date(allEntries[0].entry.published_at))
      : toRFC822(new Date());

    // Build RSS <item> entries
    const items = allEntries
      .map(({ entry, collection }) => {
        const entryUrl = buildEntryUrl(site.siteUrl, collection, entry, locale);
        const pubDate = entry.published_at
          ? toRFC822(new Date(entry.published_at))
          : undefined;

        const tagElements = entry.tags
          .map((tag) => `      <category>${escapeXml(tag)}</category>`)
          .join("\n");

        return `    <item>
      <title>${escapeXml(entry.title)}</title>
      <link>${escapeXml(entryUrl)}</link>
      <guid isPermaLink="true">${escapeXml(entryUrl)}</guid>${pubDate ? `\n      <pubDate>${pubDate}</pubDate>` : ""}${entry.excerpt ? `\n      <description>${escapeXml(entry.excerpt)}</description>` : ""}${tagElements ? `\n${tagElements}` : ""}
    </item>`;
      })
      .join("\n");

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(site.siteName)}</title>
    <link>${escapeXml(site.siteUrl)}</link>
    <description>${escapeXml(site.siteDescription || `${site.siteName} RSS Feed`)}</description>
    <language>${escapeXml(locale)}</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${escapeXml(site.siteUrl)}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

    return new NextResponse(rss, {
      status: 200,
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (error) {
    console.error("[ERROR] Failed to generate RSS feed:", error);
    return emptyFeed();
  }
}

/**
 * Build the full URL for a collection entry.
 * Uses the collection's configured base_path for the given locale and the entry slug.
 */
function buildEntryUrl(
  siteUrl: string,
  collection: Collection,
  entry: Entry,
  locale: string,
): string {
  const localeConfig = collection.locales.find((l) => l.locale === locale);
  const basePath = localeConfig?.base_path || `/collection`;
  // Ensure no double slashes
  const normalizedBase = basePath.endsWith("/")
    ? basePath.slice(0, -1)
    : basePath;
  return `${siteUrl}${normalizedBase}/${entry.slug}`;
}

/**
 * Return a minimal valid RSS feed when no content is available.
 */
function emptyFeed(siteName = "RSS Feed", siteUrl = ""): NextResponse {
  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(siteName)}</title>${siteUrl ? `\n    <link>${escapeXml(siteUrl)}</link>` : ""}
    <description>No content available</description>
  </channel>
</rss>`;
  return new NextResponse(rss, {
    status: 200,
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}

/**
 * Convert a Date to RFC 822 format (required by RSS 2.0).
 * Example: "Mon, 06 Sep 2021 14:30:00 GMT"
 */
function toRFC822(date: Date): string {
  return date.toUTCString();
}

/** Escape special XML characters */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
