"use client";

import type { BlockComponentProps } from "@otl-core/cms-types";
import Link from "next/link";

function safeHref(url: string | undefined): string {
  if (!url || !url.startsWith("/")) return "#";
  return url;
}

interface Category {
  id: string;
  title: string;
  name: string;
  slug: string;
  full_path: string;
  url?: string;
  post_count?: number;
}

interface CollectionCategoriesConfig extends Record<string, unknown> {
  layout?: "list" | "grid" | "dropdown";
  showPostCount?: boolean;
  data?: {
    items: Category[];
  };
}

interface CollectionCategoriesProps extends BlockComponentProps<CollectionCategoriesConfig> {
  config: CollectionCategoriesConfig;
}

export function CollectionCategoriesBlock({
  config,
}: CollectionCategoriesProps) {
  const { layout = "list", showPostCount = true, data } = config;

  const categories = data?.items || [];

  if (categories.length === 0) return null;

  if (layout === "dropdown") {
    return (
      <div className="collection-categories-dropdown">
        <label
          htmlFor="category-select"
          className="block text-sm font-medium mb-2"
        >
          Browse by Category
        </label>
        <select
          id="category-select"
          className="w-full px-4 py-2 border border-border rounded"
          onChange={(e) => {
            const href = safeHref(e.target.value);
            if (href !== "#") {
              window.location.href = href;
            }
          }}
        >
          <option value="">Select a category...</option>
          {categories.map((category) => (
            <option key={category.id} value={safeHref(category.url)}>
              {category.title}
              {showPostCount &&
                category.post_count != null &&
                ` (${category.post_count})`}
            </option>
          ))}
        </select>
      </div>
    );
  }

  const containerClass =
    layout === "grid" ? "grid grid-cols-2 md:grid-cols-3 gap-4" : "space-y-2";

  return (
    <div className="collection-categories">
      <h3 className="text-xl font-bold mb-4">Categories</h3>
      <div className={containerClass}>
        {categories.map((category) => (
          <Link
            key={category.id}
            href={safeHref(category.url)}
            className="flex items-center justify-between p-3 border border-border rounded hover:bg-muted transition-colors"
          >
            <span className="font-medium">{category.title}</span>
            {showPostCount && category.post_count != null && (
              <span className="text-sm text-muted-foreground">
                ({category.post_count})
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
