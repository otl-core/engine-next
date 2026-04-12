/**
 * SEO metadata builders for the OTL CMS engine.
 *
 * Architecture:
 *  - Low-level builders (`buildOpenGraph`, `buildTwitterCard`, etc.)
 *    each produce one piece of a Next.js `Metadata` object.
 *  - High-level generators (`generatePageMetadata`, `generateEntryMetadata`,
 *    `generateListingMetadata`) compose the low-level builders for each
 *    content type.
 *  - The route-level `generateMetadata` functions become thin orchestrators
 *    that fetch data and delegate here.
 *
 * All inputs use proper CMS types -- no `Record<string, unknown>` casting.
 */

import type { SEOConfig } from "@otl-core/cms-types";
import type { SiteContext } from "@otl-core/engine-next-utils";
import type { Metadata } from "next";

export function buildOpenGraph(params: {
  title: string;
  description?: string;
  url?: string;
  siteName: string;
  ogLocale: string;
  type: "website" | "article";
  image?: string;
  publishedTime?: string;
  modifiedTime?: string;
}): Metadata["openGraph"] {
  return {
    title: params.title,
    description: params.description || undefined,
    url: params.url || undefined,
    siteName: params.siteName,
    locale: params.ogLocale,
    type: params.type,
    ...(params.publishedTime ? { publishedTime: params.publishedTime } : {}),
    ...(params.modifiedTime ? { modifiedTime: params.modifiedTime } : {}),
    ...(params.image ? { images: [{ url: params.image }] } : {}),
  };
}

export function buildTwitterCard(params: {
  title: string;
  description?: string;
  image?: string;
  site?: string;
}): Metadata["twitter"] {
  return {
    card: params.image ? "summary_large_image" : "summary",
    title: params.title,
    description: params.description || undefined,
    ...(params.image ? { images: [params.image] } : {}),
    ...(params.site ? { site: params.site } : {}),
  };
}

export function buildAlternates(params: {
  canonical?: string;
  hreflang?: Record<string, string>;
}): Metadata["alternates"] {
  if (!params.canonical && !params.hreflang) return undefined;
  return {
    ...(params.canonical ? { canonical: params.canonical } : {}),
    ...(params.hreflang ? { languages: params.hreflang } : {}),
  };
}

export function buildRobots(params: {
  noIndex?: boolean;
  noFollow?: boolean;
}): Metadata["robots"] {
  return {
    index: !params.noIndex,
    follow: !params.noFollow,
  };
}

/** Derive the canonical URL: explicit SEO override, or siteUrl + path. */
export function resolveCanonical(
  seoCanonical: string | undefined,
  siteUrl: string,
  fullPath: string,
): string | undefined {
  return seoCanonical || (siteUrl ? `${siteUrl}${fullPath}` : undefined);
}

/** Generate full Next.js Metadata for a CMS page. */
export function generatePageMetadata(params: {
  seo: SEOConfig | undefined;
  contentTitle?: string;
  descriptionFallback?: string;
  site: SiteContext;
  fullPath: string;
}): Metadata {
  const { seo, site } = params;
  const title = seo?.title || params.contentTitle;
  const description = seo?.description || params.descriptionFallback;
  const ogTitle = seo?.og_title || title || site.siteName;
  const ogDescription = seo?.og_description || description;
  const canonical = resolveCanonical(
    seo?.canonical,
    site.siteUrl,
    params.fullPath,
  );
  const ogType = (seo?.og_type || "website") as "website" | "article";
  const image = seo?.og_image;

  return {
    title,
    description,
    keywords: seo?.keywords,
    alternates: buildAlternates({ canonical, hreflang: site.hreflang }),
    robots: buildRobots({ noIndex: seo?.no_index, noFollow: seo?.no_follow }),
    openGraph: buildOpenGraph({
      title: ogTitle,
      description: ogDescription,
      url: canonical,
      siteName: site.siteName,
      ogLocale: site.ogLocale,
      type: ogType,
      image,
    }),
    twitter: buildTwitterCard({
      title: ogTitle,
      description: ogDescription,
      image,
      site: site.twitterHandle,
    }),
  };
}

/** Generate full Next.js Metadata for a collection post. */
export function generateEntryMetadata(params: {
  seo: SEOConfig | undefined;
  contentTitle?: string;
  excerpt?: string;
  featuredImage?: string;
  publishedAt?: string;
  modifiedAt?: string;
  site: SiteContext;
  fullPath: string;
}): Metadata {
  const { seo, site } = params;
  const title = seo?.title || params.contentTitle;
  const description = seo?.description || params.excerpt;
  const ogTitle = seo?.og_title || title || site.siteName;
  const ogDescription = seo?.og_description || description;
  const image = seo?.og_image || params.featuredImage;
  const canonical = resolveCanonical(
    seo?.canonical,
    site.siteUrl,
    params.fullPath,
  );

  return {
    title,
    description,
    keywords: seo?.keywords,
    alternates: buildAlternates({ canonical, hreflang: site.hreflang }),
    robots: buildRobots({ noIndex: seo?.no_index, noFollow: seo?.no_follow }),
    openGraph: buildOpenGraph({
      title: ogTitle,
      description: ogDescription,
      url: canonical,
      siteName: site.siteName,
      ogLocale: site.ogLocale,
      type: "article",
      image,
      publishedTime: params.publishedAt,
      modifiedTime: params.modifiedAt,
    }),
    twitter: buildTwitterCard({
      title: ogTitle,
      description: ogDescription,
      image,
      site: site.twitterHandle,
    }),
  };
}

/** Generate full Next.js Metadata for a collection listing (index or category). */
export function generateListingMetadata(params: {
  site: SiteContext;
  fullPath: string;
  currentPage: number;
}): Metadata {
  const { site } = params;
  const canonical = site.siteUrl
    ? `${site.siteUrl}${params.fullPath}${params.currentPage > 1 ? `?page=${params.currentPage}` : ""}`
    : undefined;

  // Derive a readable title from the path (e.g. "/collection" -> "Collection", "/collection/category/news" -> "News")
  const segments = params.fullPath
    .replace(/^\//, "")
    .split("/")
    .filter(Boolean);
  const lastSegment = segments[segments.length - 1] || "";
  const derivedName = lastSegment
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  const title = derivedName || site.siteName;
  const description = site.siteDescription;

  return {
    title,
    description,
    alternates: buildAlternates({ canonical, hreflang: site.hreflang }),
    robots: buildRobots({ noIndex: params.currentPage > 1 }),
    openGraph: buildOpenGraph({
      title,
      description,
      url: canonical,
      siteName: site.siteName,
      ogLocale: site.ogLocale,
      type: "website",
    }),
    twitter: buildTwitterCard({ title, description, site: site.twitterHandle }),
  };
}
