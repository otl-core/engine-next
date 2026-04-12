/**
 * Not Found Page (404)
 *
 * Renders the CMS "/not-found" system page if available, otherwise
 * a static fallback. Header/Footer come from the root layout.
 */

import { sectionRegistry } from "@/lib/registries/section-registry";
import type { SchemaInstance } from "@otl-core/cms-types";
import {
  detectLocaleFromRequest,
  parsePageContent,
  resolvePath,
} from "@otl-core/engine-next-utils";
import { PageRenderer } from "@otl-core/section-registry";
import type { Metadata } from "next";
import Link from "next/link";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const { locale } = await detectLocaleFromRequest();
    const resolution = await resolvePath("/not-found", locale);
    if (resolution.type === "page" && resolution.content) {
      const content = parsePageContent(resolution.content);
      if (content?.title) {
        return {
          title: content.title,
          robots: { index: false, follow: false },
        };
      }
    }
  } catch {
    // CMS not available
  }
  return { title: "Page Not Found", robots: { index: false, follow: false } };
}

export default async function NotFound() {
  let sections: SchemaInstance[] | null = null;

  try {
    const { locale } = await detectLocaleFromRequest();
    const resolution = await resolvePath("/not-found", locale);
    if (resolution.type === "page" && resolution.content) {
      const content = parsePageContent(resolution.content);
      sections = content?.sections ?? [];
    }
  } catch {
    // CMS not-found page not available -- use fallback
  }

  if (sections && sections.length > 0) {
    return (
      <PageRenderer sections={sections} sectionRegistry={sectionRegistry} />
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="text-6xl font-bold text-muted-foreground/30 mb-4">
          404
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-4">
          Page Not Found
        </h1>
        <p className="text-muted-foreground mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
        >
          Go to Homepage
        </Link>
      </div>
    </div>
  );
}
