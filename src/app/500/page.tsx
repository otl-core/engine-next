/**
 * Explicit /500 route to override Next.js auto-generated 500.html.
 * Without this, Next.js serves a default static error page for /500,
 * preventing customers from using /500 as a custom CMS error page.
 */
import { resolveShellContext } from "@/lib/route-context";
import { sectionRegistry } from "@/lib/registries/section-registry";
import {
  getABnBucket,
  resolvePath,
  parsePageContent,
} from "@otl-core/engine-next-utils";
import type { SchemaInstance } from "@otl-core/cms-types";
import {
  isMultivariateContent,
  resolveFormVariantsInSections,
  resolvePageVariant,
} from "@otl-core/cms-utils";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { PageRenderer } from "@otl-core/section-registry";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export async function generateMetadata(): Promise<Metadata> {
  const shell = await resolveShellContext();
  if (!shell) return { title: "500" };

  try {
    const resolution = await resolvePath(shell.path, shell.locale);
    if (resolution.type === "page") {
      const content = parsePageContent(resolution.content);
      return generatePageMetadata({
        seo: content?.seo,
        contentTitle: content?.title,
        site: shell.site,
        fullPath: "/500",
      });
    }
  } catch {
    // Fallback metadata
  }

  return { title: "500" };
}

export default async function Error500Page() {
  const shell = await resolveShellContext();
  if (!shell) return notFound();

  let resolution;
  try {
    resolution = await resolvePath(shell.path, shell.locale);
  } catch {
    return notFound();
  }

  if (resolution.type === "not_found") {
    return notFound();
  }

  const pageContent = parsePageContent(resolution.content);
  if (resolution.type !== "page" || !pageContent) {
    return notFound();
  }

  const bucket = await getABnBucket();
  let sections: SchemaInstance[];

  if (isMultivariateContent(pageContent)) {
    const resolved = resolvePageVariant(
      pageContent as unknown as Parameters<typeof resolvePageVariant>[0],
      bucket,
    );
    sections = (resolved.sections as SchemaInstance[]) || [];
  } else {
    sections = pageContent.sections || [];
  }

  sections = resolveFormVariantsInSections(
    sections,
    bucket,
  ) as SchemaInstance[];

  return (
    <PageRenderer
      sections={sections}
      sectionRegistry={sectionRegistry}
      siteId={shell.configs.site.id}
    />
  );
}
