import type { BlockComponentProps } from "@otl-core/cms-types";
import Image from "next/image";
import Link from "next/link";

function safeHref(url: string | undefined): string {
  if (!url || !url.startsWith("/")) return "#";
  return url;
}

interface AuthorItem {
  id: string;
  name: string;
  slug: string;
  bio?: Record<string, string>;
  excerpt?: Record<string, string>;
  avatar_url?: string;
  url?: string;
  entry_count?: number;
}

interface AuthorListConfig extends Record<string, unknown> {
  layout?: "grid" | "list";
  columns?: number;
  showAvatar?: boolean;
  showBio?: boolean;
  showEntryCount?: boolean;
  data?: {
    items: AuthorItem[];
    current_locale?: string;
  };
}

interface AuthorListProps extends BlockComponentProps<AuthorListConfig> {
  config: AuthorListConfig;
}

function resolveLocalized(
  value: Record<string, string> | undefined,
  locale: string,
): string | undefined {
  if (!value) return undefined;
  return value[locale] ?? value["en"] ?? Object.values(value)[0];
}

export function AuthorListBlock({ config }: AuthorListProps) {
  const {
    layout = "grid",
    columns = 3,
    showAvatar = true,
    showBio = true,
    showEntryCount = false,
    data,
  } = config;

  const locale = data?.current_locale || "en";

  const authors = data?.items || [];

  if (authors.length === 0) return null;

  if (layout === "list") {
    return (
      <div className="space-y-4">
        {authors.map((author) => (
          <Link
            key={author.id}
            href={safeHref(author.url)}
            className="group flex items-center gap-4 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
          >
            {showAvatar && author.avatar_url && (
              <Image
                src={author.avatar_url}
                alt={author.name}
                width={56}
                height={56}
                className="rounded-full shrink-0"
              />
            )}

            <div className="flex-1 min-w-0">
              <p className="font-semibold text-lg group-hover:text-primary transition-colors">
                {author.name}
              </p>

              {showBio && (author.bio || author.excerpt) && (
                <p className="text-muted-foreground text-sm mt-1 line-clamp-2">
                  {resolveLocalized(author.bio || author.excerpt, locale)}
                </p>
              )}
            </div>

            {showEntryCount && author.entry_count != null && (
              <span className="text-sm text-muted-foreground shrink-0">
                {author.entry_count}{" "}
                {author.entry_count === 1 ? "entry" : "entries"}
              </span>
            )}
          </Link>
        ))}
      </div>
    );
  }

  const gridClasses: Record<number, string> = {
    1: "grid gap-6 grid-cols-1",
    2: "grid gap-6 grid-cols-1 md:grid-cols-2",
    3: "grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={gridClasses[columns] || gridClasses[3]}>
      {authors.map((author) => (
        <Link
          key={author.id}
          href={safeHref(author.url)}
          className="group block"
        >
          <article className="border border-border rounded-lg overflow-hidden h-full flex flex-col items-center p-6 text-center">
            {showAvatar && author.avatar_url && (
              <Image
                src={author.avatar_url}
                alt={author.name}
                width={80}
                height={80}
                className="rounded-full mb-4"
              />
            )}

            <h2 className="text-xl font-bold group-hover:text-primary transition-colors">
              {author.name}
            </h2>

            {showBio && (author.bio || author.excerpt) && (
              <p className="text-muted-foreground mt-2 line-clamp-3">
                {resolveLocalized(author.bio || author.excerpt, locale)}
              </p>
            )}

            {showEntryCount && author.entry_count != null && (
              <span className="text-sm text-muted-foreground mt-3">
                {author.entry_count}{" "}
                {author.entry_count === 1 ? "entry" : "entries"}
              </span>
            )}
          </article>
        </Link>
      ))}
    </div>
  );
}
