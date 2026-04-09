/**
 * Route Context
 *
 * Cached per-request utility that resolves site configs (including
 * header/footer presets), locale, path, and site context.
 *
 * Both the root layout and page components call this -- React.cache()
 * ensures the work happens only once per request.
 */

import { cache } from "react";
import { headers } from "next/headers";
import {
  fetchConfigs,
  isValidSite,
  resolvePath,
  resolveLocaleFromSegments,
  buildSiteContext,
  parsePageContent,
  parseEntryContent,
} from "@otl-core/engine-next-utils";
import type {
  ValidatedSiteConfig,
  SiteContext,
} from "@otl-core/engine-next-utils";

export interface ShellContext {
  configs: ValidatedSiteConfig;
  locale: string;
  /** Pathname with locale prefix stripped (for API calls). */
  path: string;
  site: SiteContext;
  /** Resolved content type for script context filtering. */
  contentType: "pages" | "collections";
}

/**
 * Resolve the shell context for the current request.
 * Returns `null` when the site is not configured.
 */
export const resolveShellContext = cache(
  async (): Promise<ShellContext | null> => {
    // First fetch — no locale yet, we need the site config to know which
    // locales exist and which one is the default before we can resolve the
    // request locale from the URL.
    const baseConfigs = await fetchConfigs();
    if (!isValidSite(baseConfigs)) return null;

    // Read the pathname set by proxy.ts
    const headersList = await headers();
    const pathname = headersList.get("x-pathname") || "/";

    // Resolve locale from URL segments
    const segments = pathname.replace(/^\//, "").split("/").filter(Boolean);
    const { locale, path } = resolveLocaleFromSegments(
      segments,
      pathname,
      baseConfigs.site,
    );

    // Re-fetch with the resolved locale so locale-specific header/footer
    // presets are returned. Skip the extra round trip when the resolved
    // locale matches the site default — the first fetch already returned
    // the correct config in that case.
    const defaultConfigs =
      locale && locale !== baseConfigs.site.default_locale
        ? await fetchConfigs(locale)
        : baseConfigs;
    if (!isValidSite(defaultConfigs)) return null;

    // Resolve the path to check for header/footer presets and content type
    let configs = defaultConfigs;
    let contentType: "pages" | "collections" = "pages";
    try {
      const resolution = await resolvePath(path, locale);

      if (
        resolution.type !== "page" &&
        resolution.type !== "not_found" &&
        resolution.type !== "redirect"
      ) {
        contentType = "collections";
      }

      if (resolution.content) {
        const presetSource =
          resolution.type === "page"
            ? parsePageContent(resolution.content)
            : parseEntryContent(resolution.content);

        if (presetSource?.header_preset_id || presetSource?.footer_preset_id) {
          const presetConfigs = await fetchConfigs(
            locale,
            presetSource.header_preset_id,
            presetSource.footer_preset_id,
          );
          if (isValidSite(presetConfigs)) {
            configs = presetConfigs;
          }
        }
      }
    } catch {
      // Path resolution failed (404, error pages, etc.) -- use default configs
    }

    const site = buildSiteContext(
      configs,
      locale,
      path,
      process.env.NEXT_PUBLIC_SITE_URL,
    );

    return { configs, locale, path, site, contentType };
  },
);
