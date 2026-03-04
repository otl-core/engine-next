"use client";

import type { BlockComponentProps } from "@otl-core/cms-types";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";

interface CollectionSearchConfig extends Record<string, unknown> {
  placeholder?: string;
}

export function CollectionSearchBlock({
  config,
}: BlockComponentProps<CollectionSearchConfig>) {
  const { placeholder = "Search entries..." } = config;
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = query.trim();
      if (trimmed) {
        const params = new URLSearchParams(searchParams);
        params.set("q", trimmed);
        params.delete("page");
        router.push(`?${params.toString()}`);
      } else {
        const params = new URLSearchParams(searchParams);
        params.delete("q");
        params.delete("page");
        const qs = params.toString();
        router.push(qs ? `?${qs}` : window.location.pathname);
      }
    },
    [query, router, searchParams],
  );

  return (
    <form onSubmit={handleSubmit} className="collection-search">
      <div className="flex gap-2">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-4 py-2 border border-border rounded bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
        >
          Search
        </button>
      </div>
    </form>
  );
}
