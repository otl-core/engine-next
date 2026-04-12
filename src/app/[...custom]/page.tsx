import type React from "react";
import CollectionLayoutRenderer from "@/components/collection/collection-layout-renderer";
import { resolveShellContext } from "@/lib/route-context";
import { sectionRegistry } from "@/lib/registries/section-registry";
import {
  getABnBucket,
  hasValidPasswordCookie,
  resolvePath,
  parsePageContent,
  parseEntryContent,
  parseListingContent,
} from "@otl-core/engine-next-utils";
import { ABnVariantSetter } from "@otl-core/analytics";
import type { SchemaInstance } from "@otl-core/cms-types";
import {
  extractPaginationFromLayout,
  isContentVisible,
  isMultivariateContent,
  isPasswordProtected,
  resolveEntryVariant,
  resolveFormVariantsInSections,
  resolvePageVariant,
} from "@otl-core/cms-utils";
import {
  generatePageMetadata,
  generateEntryMetadata,
  generateListingMetadata,
} from "@/lib/seo/metadata";
import PasswordPrompt from "@/components/password/password-prompt";
import { PageRenderer } from "@otl-core/section-registry";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

interface CustomRouteProps {
  params: Promise<{ custom: string[] }>;
  searchParams: Promise<{ page?: string; q?: string }>;
}

export async function generateMetadata({
  params,
  searchParams,
}: CustomRouteProps): Promise<Metadata> {
  const shell = await resolveShellContext();
  if (!shell) return { title: "Page Not Found" };

  const { custom } = await params;
  const search = await searchParams;
  const fullPath = "/" + custom.join("/");
  const currentPage = search.page ? parseInt(search.page, 10) : 1;

  try {
    const resolution = await resolvePath(shell.path, shell.locale, {
      page: currentPage > 0 ? currentPage : 1,
    });

    if (resolution.type === "page") {
      const content = parsePageContent(resolution.content);
      return generatePageMetadata({
        seo: content?.seo,
        contentTitle: content?.title,
        site: shell.site,
        fullPath,
      });
    }

    if (resolution.type === "entry") {
      const content = parseEntryContent(resolution.content);
      return generateEntryMetadata({
        seo: content?.seo,
        contentTitle: content?.title,
        excerpt: content?.excerpt,
        featuredImage: content?.featured_image?.src,
        publishedAt: content?.published_at,
        modifiedAt: content?.updated_at,
        site: shell.site,
        fullPath,
      });
    }

    if (
      resolution.type === "collection" ||
      resolution.type === "category" ||
      resolution.type === "category_index" ||
      resolution.type === "author_index" ||
      resolution.type === "tag_index"
    ) {
      return generateListingMetadata({
        site: shell.site,
        fullPath,
        currentPage,
      });
    }

    if (resolution.type === "author" || resolution.type === "tag") {
      return generateListingMetadata({
        site: shell.site,
        fullPath,
        currentPage,
      });
    }
  } catch {
    // Fallback metadata
  }

  // Path didn't resolve — use the CMS /not-found page title if available
  try {
    const notFoundResolution = await resolvePath("/not-found", shell.locale);
    if (notFoundResolution.type === "page" && notFoundResolution.content) {
      const notFoundContent = parsePageContent(notFoundResolution.content);
      return generatePageMetadata({
        seo: notFoundContent?.seo,
        contentTitle: notFoundContent?.title,
        site: shell.site,
        fullPath: "/not-found",
      });
    }
  } catch {
    // CMS not-found page not available
  }

  return { title: "Page Not Found" };
}

export default async function CustomRoute({
  params,
  searchParams,
}: CustomRouteProps) {
  const shell = await resolveShellContext();
  if (!shell) return null;

  const { custom } = await params;
  const search = await searchParams;
  const fullPath = "/" + custom.join("/");
  const page = search.page ? parseInt(search.page, 10) : 1;
  const searchQuery = search.q;

  // ------ Path resolution ------

  let resolution;
  try {
    resolution = await resolvePath(shell.path, shell.locale, {
      page: page > 0 ? page : 1,
      searchQuery,
    });
  } catch (error) {
    console.error(
      "Failed to resolve path:",
      shell.path,
      "locale:",
      shell.locale,
      error,
    );
    return notFound();
  }

  if (resolution.type === "redirect" && resolution.redirect) {
    redirect(resolution.redirect.to_path || resolution.redirect.to_url || "/");
  }

  if (resolution.type === "not_found") {
    return notFound();
  }

  // ------ Content parsing ------

  const rawContent = resolution.content;
  const pageContent = parsePageContent(rawContent);
  const entryContent = parseEntryContent(rawContent);

  // Visibility & password checks (pages and collection posts)
  const scheduleContent =
    resolution.type === "page" ? pageContent : entryContent;

  if (
    scheduleContent &&
    !isContentVisible(scheduleContent.publish_at, scheduleContent.expires_at)
  ) {
    return notFound();
  }

  if (
    scheduleContent &&
    isPasswordProtected(scheduleContent.password_protected)
  ) {
    const entityId = resolution.content_id!;
    const entityType = resolution.type === "entry" ? "entry" : "page";
    const hasValidCookie = await hasValidPasswordCookie(entityId);
    if (!hasValidCookie) {
      return (
        <PasswordPrompt
          title={scheduleContent.title || ""}
          message={scheduleContent.password_message}
          entityId={entityId}
          entityType={entityType}
          locale={shell.locale}
        />
      );
    }
  }

  // ------ Page rendering ------

  if (resolution.type === "page" && pageContent) {
    const bucket = await getABnBucket();
    let sections: SchemaInstance[];
    let variantId: string | null = null;

    if (isMultivariateContent(pageContent)) {
      const resolved = resolvePageVariant(
        pageContent as unknown as Parameters<typeof resolvePageVariant>[0],
        bucket,
      );
      sections = (resolved.sections as SchemaInstance[]) || [];
      variantId = resolved.variantId;
    } else {
      sections = pageContent.sections || [];
    }

    sections = resolveFormVariantsInSections(
      sections,
      bucket,
    ) as SchemaInstance[];

    return (
      <>
        {variantId && (
          <ABnVariantSetter
            variantId={variantId}
            experimentId={resolution.content_id}
          />
        )}
        <PageRenderer
          sections={sections}
          sectionRegistry={sectionRegistry}
          siteId={shell.configs.site.id}
        />
      </>
    );
  }

  // ------ Collection rendering ------

  if (
    resolution.type === "entry" ||
    resolution.type === "collection" ||
    resolution.type === "category" ||
    resolution.type === "category_index" ||
    resolution.type === "author" ||
    resolution.type === "author_index" ||
    resolution.type === "tag" ||
    resolution.type === "tag_index"
  ) {
    if (resolution.type === "entry" && entryContent) {
      const bucket = await getABnBucket();
      resolveEntryVariant(rawContent!, bucket);
    }

    const listingContent = parseListingContent(rawContent);
    let layout: SchemaInstance[] =
      (resolution.type === "entry"
        ? entryContent?.layout
        : listingContent?.layout) ?? [];

    if (resolution.type === "entry" && entryContent?.blocks) {
      layout = injectEntryBlocksIntoLayout(layout, entryContent.blocks);
    }

    // Pagination prev/next links (React 19 auto-hoists <link> into <head>)
    let paginationLinks: React.JSX.Element | null = null;
    if (
      (resolution.type === "collection" ||
        resolution.type === "category" ||
        resolution.type === "category_index" ||
        resolution.type === "author" ||
        resolution.type === "author_index" ||
        resolution.type === "tag" ||
        resolution.type === "tag_index") &&
      shell.site.siteUrl
    ) {
      const pagination = extractPaginationFromLayout(layout);
      if (pagination) {
        const baseUrl = `${shell.site.siteUrl}${fullPath}`;
        let prevPage: string | null = null;
        if (pagination.hasPrev && pagination.page > 1) {
          prevPage =
            pagination.page === 2
              ? baseUrl
              : `${baseUrl}?page=${pagination.page - 1}`;
        }
        const nextPage = pagination.hasNext
          ? `${baseUrl}?page=${pagination.page + 1}`
          : null;
        paginationLinks = (
          <>
            {prevPage && <link rel="prev" href={prevPage} />}
            {nextPage && <link rel="next" href={nextPage} />}
          </>
        );
      }
    }

    return (
      <>
        {paginationLinks}
        <CollectionLayoutRenderer
          layout={layout}
          siteId={shell.configs.site.id}
        />
      </>
    );
  }

  console.error("[ERROR] Unknown resolution type:", resolution.type);
  return notFound();
}

/**
 * Walk layout sections and inject the entry's content blocks into any
 * `entry-content` block's config. If the layout is empty but blocks
 * exist, creates a minimal fallback layout wrapping them.
 */
function injectEntryBlocksIntoLayout(
  layout: SchemaInstance[],
  blocks: SchemaInstance[],
): SchemaInstance[] {
  if (layout.length === 0) {
    return [
      {
        id: "fallback-entry-section",
        type: "flexbox",
        config: {
          direction: "column",
          gap: "1rem",
          padding: "1rem",
          justify: "start",
          align: "stretch",
          children: [
            {
              id: "fallback-entry-content",
              type: "entry-content",
              config: { blocks },
            },
          ],
        },
      },
    ];
  }

  return layout.map((section) => {
    const config = section.config;
    if (!config) return section;

    let childrenKey: "children" | "child" | null = null;
    if (Array.isArray(config.children)) {
      childrenKey = "children";
    } else if (Array.isArray(config.child)) {
      childrenKey = "child";
    }

    if (!childrenKey) return section;

    const children = config[childrenKey] as Array<Record<string, unknown>>;
    const updated = children.map((child) => {
      if (child.type !== "entry-content") return child;
      const childConfig =
        (child.config as Record<string, unknown> | undefined) ?? {};
      return { ...child, config: { ...childConfig, blocks } };
    });

    return { ...section, config: { ...config, [childrenKey]: updated } };
  });
}
