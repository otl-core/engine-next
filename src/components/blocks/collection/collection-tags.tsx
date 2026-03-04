import type { BlockComponentProps } from "@otl-core/cms-types";
import Link from "next/link";

function safeHref(url: string | undefined): string {
  if (!url || !url.startsWith("/")) return "#";
  return url;
}

interface CollectionTag {
  name: string;
  slug: string;
  url?: string;
  entry_count?: number;
}

interface CollectionTagsConfig extends Record<string, unknown> {
  layout?: "cloud" | "list";
  maxTags?: number;
  showCount?: boolean;
  data?: {
    items: CollectionTag[];
  };
}

interface CollectionTagsProps extends BlockComponentProps<CollectionTagsConfig> {
  config: CollectionTagsConfig;
}

export function CollectionTagsBlock({ config }: CollectionTagsProps) {
  const { layout = "cloud", maxTags = 20, showCount = true, data } = config;

  let tags = data?.items || [];

  // Limit tags if needed
  if (maxTags && tags.length > maxTags) {
    tags = tags.slice(0, maxTags);
  }

  if (tags.length === 0) return null;

  if (layout === "cloud") {
    return (
      <div className="collection-tags-cloud">
        <h3 className="text-xl font-bold mb-4">Tags</h3>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Link
              key={tag.slug}
              href={safeHref(tag.url)}
              className="inline-flex items-center gap-1 px-3 py-1 bg-muted hover:bg-muted/80 rounded-full text-sm transition-colors"
            >
              <span>{tag.name}</span>
              {showCount && tag.entry_count != null && (
                <span className="text-muted-foreground">
                  ({tag.entry_count})
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="collection-tags-list">
      <h3 className="text-xl font-bold mb-4">Tags</h3>
      <ul className="space-y-2">
        {tags.map((tag) => (
          <li key={tag.slug}>
            <Link
              href={safeHref(tag.url)}
              className="flex items-center justify-between p-2 hover:bg-muted rounded transition-colors"
            >
              <span>{tag.name}</span>
              {showCount && tag.entry_count != null && (
                <span className="text-sm text-muted-foreground">
                  ({tag.entry_count})
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
