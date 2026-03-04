import type { BlockComponentProps } from "@otl-core/cms-types";
import Link from "next/link";

interface PaginationInfo {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface CollectionPaginationConfig extends Record<string, unknown> {
  showPageNumbers?: boolean;
  showFirstLast?: boolean;
  maxPages?: number;
  data?: {
    pagination: PaginationInfo;
  };
}

interface CollectionPaginationProps extends BlockComponentProps<CollectionPaginationConfig> {
  config: CollectionPaginationConfig;
}

export function CollectionPaginationBlock({
  config,
}: CollectionPaginationProps) {
  const {
    showPageNumbers = true,
    showFirstLast = false,
    maxPages = 5,
    data,
  } = config;

  const pagination = data?.pagination;

  if (!pagination || pagination.totalPages <= 1) return null;

  const { page, totalPages, hasNext, hasPrev } = pagination;

  // Generate page number array
  const getPageNumbers = () => {
    const pages: number[] = [];
    const half = Math.floor(maxPages / 2);
    let start = Math.max(1, page - half);
    const end = Math.min(totalPages, start + maxPages - 1);

    if (end - start < maxPages - 1) {
      start = Math.max(1, end - maxPages + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <nav className="flex justify-center gap-2 my-8" aria-label="Pagination">
      {showFirstLast && page > 1 && (
        <Link
          href={`?page=1`}
          className="px-4 py-2 border border-border rounded hover:bg-muted"
        >
          First
        </Link>
      )}

      {hasPrev && (
        <Link
          href={`?page=${page - 1}`}
          className="px-4 py-2 border border-border rounded hover:bg-muted"
        >
          Previous
        </Link>
      )}

      {showPageNumbers &&
        pages.map((p) => (
          <Link
            key={p}
            href={`?page=${p}`}
            className={`px-4 py-2 border rounded ${
              p === page
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border hover:bg-muted"
            }`}
            aria-current={p === page ? "page" : undefined}
          >
            {p}
          </Link>
        ))}

      {hasNext && (
        <Link
          href={`?page=${page + 1}`}
          className="px-4 py-2 border border-border rounded hover:bg-muted"
        >
          Next
        </Link>
      )}

      {showFirstLast && page < totalPages && (
        <Link
          href={`?page=${totalPages}`}
          className="px-4 py-2 border border-border rounded hover:bg-muted"
        >
          Last
        </Link>
      )}
    </nav>
  );
}
