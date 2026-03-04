import { resolveShellContext } from "@/lib/route-context";
import { sectionRegistry } from "@/lib/registries/section-registry";
import {
  getABnBucket,
  hasValidPasswordCookie,
  isMultivariateContent,
  resolveFormVariantsInSections,
  resolvePageVariant,
  resolvePath,
  parsePageContent,
} from "@otl-core/engine-next-utils";
import { ABnVariantSetter } from "@otl-core/analytics";
import type { SchemaInstance } from "@otl-core/cms-types";
import { isContentVisible, isPasswordProtected } from "@otl-core/cms-utils";
import { generatePageMetadata } from "@/lib/seo/metadata";
import PasswordPrompt from "@/components/password/password-prompt";
import { PageRenderer } from "@otl-core/section-registry";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const shell = await resolveShellContext();
    if (!shell) return { title: "Website" };

    const resolution = await resolvePath(shell.path, shell.locale);
    const content = parsePageContent(resolution.content);

    return generatePageMetadata({
      seo: content?.seo,
      contentTitle: content?.title,
      descriptionFallback: shell.site.siteDescription,
      site: shell.site,
      fullPath: "/",
    });
  } catch {
    return { title: "Website" };
  }
}

export default async function Home() {
  const shell = await resolveShellContext();
  if (!shell) return null;

  // ------ Path resolution ------

  let resolution;
  try {
    resolution = await resolvePath(shell.path, shell.locale);
  } catch (error) {
    console.error("Failed to resolve homepage:", error);
    return notFound();
  }

  if (resolution.type === "redirect" && resolution.redirect) {
    redirect(resolution.redirect.to_path || resolution.redirect.to_url || "/");
  }

  if (resolution.type === "not_found") {
    return notFound();
  }

  // ------ Content parsing ------

  const content = parsePageContent(resolution.content);

  if (content && !isContentVisible(content.publish_at, content.expires_at)) {
    return notFound();
  }

  if (content && isPasswordProtected(content.password_protected)) {
    const entityId = resolution.content_id!;
    const hasValidCookie = await hasValidPasswordCookie(entityId);
    if (!hasValidCookie) {
      return (
        <PasswordPrompt
          title={content.title || ""}
          message={content.password_message}
          entityId={entityId}
          entityType="page"
          locale={shell.locale}
        />
      );
    }
  }

  // ------ Sections ------

  const bucket = await getABnBucket();
  let sections: SchemaInstance[];
  let variantId: string | null = null;

  if (content && isMultivariateContent(content)) {
    const resolved = resolvePageVariant(
      content as unknown as Parameters<typeof resolvePageVariant>[0],
      bucket,
    );
    sections = (resolved.sections as SchemaInstance[]) || [];
    variantId = resolved.variantId;
  } else {
    sections = content?.sections || [];
  }

  sections = resolveFormVariantsInSections(
    sections,
    bucket,
  ) as SchemaInstance[];

  // ------ Render ------

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
