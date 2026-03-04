import type { BlockComponentProps } from "@otl-core/cms-types";
import {
  filterScheduledContent,
  filterPasswordProtectedContent,
} from "@otl-core/cms-utils";
import Image from "next/image";
import Link from "next/link";

function safeHref(url: string | undefined): string {
  if (!url || !url.startsWith("/")) return "#";
  return url;
}

interface Entry {
  id: string;
  title: string;
  slug?: string;
  url?: string;
  excerpt?: string;
  featured_image?: {
    src: string;
    alt?: string;
  };
  author?: {
    name: string;
  };
  published_at?: string;
  publish_at?: string;
  expires_at?: string;
  password_protected?: boolean;
}

interface PaginationInfo {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface EntryListConfig extends Record<string, unknown> {
  title?: string;
  layout?: "grid" | "list";
  columns?: number;
  showExcerpt?: boolean;
  showFeaturedImage?: boolean;
  showDate?: boolean;
  showAuthor?: boolean;
  showCategories?: boolean;
  data?: {
    items: Entry[];
    pagination?: PaginationInfo;
  };
}

interface EntryListProps extends BlockComponentProps<EntryListConfig> {
  config: EntryListConfig;
}

const gridClasses: Record<number, string> = {
  1: "grid gap-6 grid-cols-1",
  2: "grid gap-6 grid-cols-1 md:grid-cols-2",
  3: "grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  4: "grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
};

export function EntryListBlock({ config }: EntryListProps) {
  const {
    title,
    layout = "grid",
    columns = 3,
    showExcerpt = true,
    showFeaturedImage = true,
    showDate = true,
    showAuthor = true,
    data,
  } = config;

  const allEntries = data?.items || [];

  // Filter out scheduled, expired, and password-protected entries at render time
  const scheduledFiltered = filterScheduledContent(allEntries);
  const entries = filterPasswordProtectedContent(scheduledFiltered);

  if (entries.length === 0) return null;

  return (
    <div>
      {title && <h3 className="text-2xl font-bold mb-6">{title}</h3>}
      <div
        className={
          layout === "grid"
            ? gridClasses[columns] || gridClasses[3]
            : "space-y-6"
        }
      >
        {entries.map((entry) => {
          return (
            <Link
              key={entry.id}
              href={safeHref(entry.url)}
              className="group block"
            >
              <article className="border border-border rounded-lg overflow-hidden h-full flex flex-col">
                {showFeaturedImage && entry.featured_image && (
                  <div className="relative h-48 w-full overflow-hidden">
                    <Image
                      src={entry.featured_image.src}
                      alt={entry.featured_image.alt || entry.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                )}

                <div className="p-6 flex-1 flex flex-col">
                  <h2 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                    {entry.title}
                  </h2>

                  {showExcerpt && entry.excerpt && (
                    <p className="text-muted-foreground mb-4 flex-1 line-clamp-3">
                      {entry.excerpt}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-auto">
                    {showAuthor && entry.author && (
                      <span>{entry.author.name}</span>
                    )}
                    {showDate && entry.published_at && (
                      <time dateTime={entry.published_at}>
                        {new Date(entry.published_at).toLocaleDateString()}
                      </time>
                    )}
                  </div>
                </div>
              </article>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
