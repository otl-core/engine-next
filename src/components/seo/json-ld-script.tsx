import { resolveShellContext } from "@/lib/route-context";
import {
  resolvePath,
  parsePageContent,
  parseEntryContent,
} from "@otl-core/engine-next-utils";
import { generateJsonLd, buildBreadcrumbs } from "@otl-core/cms-utils";

interface LocaleContentEntry {
  locale: string;
  inherits_from?: string;
  enabled?: boolean;
}

/**
 * Filter supported locales to only those that serve independent content
 * (i.e. exclude locales that inherit from another locale).
 */
function getIndependentLocales(
  supportedLocales: string[] | undefined,
  rawContent: Record<string, unknown> | undefined,
): string[] | undefined {
  if (!supportedLocales || supportedLocales.length <= 1)
    return supportedLocales;

  // The backend embeds the full page/entry object which includes locale_content
  const entity =
    (rawContent?.page as Record<string, unknown>) ??
    (rawContent?.entry as Record<string, unknown>);
  const localeContent = entity?.locale_content as
    | LocaleContentEntry[]
    | undefined;
  if (!localeContent || !Array.isArray(localeContent)) return supportedLocales;

  const inheritingLocales = new Set(
    localeContent.filter((lc) => lc.inherits_from).map((lc) => lc.locale),
  );

  if (inheritingLocales.size === 0) return supportedLocales;
  return supportedLocales.filter((loc) => !inheritingLocales.has(loc));
}

/**
 * Server component that renders a JSON-LD `<script>` tag for the current page.
 *
 * Both `resolveShellContext` and `resolvePath` are `React.cache()`'d, so
 * calling them here adds no extra data fetching -- the layout and page
 * components share the same cached results within a single request.
 */
export async function JsonLdScript() {
  const shell = await resolveShellContext();
  if (!shell?.site.siteUrl) return null;

  let resolution;
  try {
    resolution = await resolvePath(shell.path, shell.locale);
  } catch {
    return null;
  }

  if (resolution.type === "redirect" || resolution.type === "not_found") {
    return null;
  }

  const independentLocales = getIndependentLocales(
    shell.configs.site.supported_locales,
    resolution.content,
  );

  let jsonLd: Record<string, unknown> | undefined;

  if (resolution.type === "page") {
    const content = parsePageContent(resolution.content);
    const seo = content?.seo;
    const pageTitle = seo?.title || content?.title || shell.site.siteName;

    jsonLd = seo?.structured_data_override
      ? seo.structured_data_override
      : generateJsonLd({
          siteUrl: shell.site.siteUrl,
          path: shell.path,
          locale: shell.locale,
          siteName: shell.site.siteName,
          siteDescription: shell.site.siteDescription,
          supportedLocales: independentLocales,
          organization: shell.configs.website.organization,
          page: {
            title: pageTitle,
            description: seo?.description || shell.site.siteDescription,
            schemaType: seo?.schema_type || "WebPage",
            datePublished: content?.created_at,
            dateModified: content?.updated_at,
            ogImage: seo?.og_image,
          },
          breadcrumbs: buildBreadcrumbs(shell.path, pageTitle),
        });
  } else if (resolution.type === "entry") {
    const content = parseEntryContent(resolution.content);
    if (content) {
      const seo = content.seo;
      const entryTitle = seo?.title || content.title || "";

      jsonLd = seo?.structured_data_override
        ? seo.structured_data_override
        : generateJsonLd({
            siteUrl: shell.site.siteUrl,
            path: shell.path,
            locale: shell.locale,
            siteName: shell.site.siteName,
            siteDescription: shell.site.siteDescription,
            supportedLocales: independentLocales,
            organization: shell.configs.website.organization,
            entry: {
              title: entryTitle,
              excerpt: content.excerpt,
              datePublished:
                content.published_at ||
                content.created_at ||
                new Date().toISOString(),
              dateModified: content.updated_at,
              categories: content.tags,
              featuredImage: content.featured_image?.src,
            },
            breadcrumbs: buildBreadcrumbs(shell.path, entryTitle),
          });
    }
  }

  if (!jsonLd) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
