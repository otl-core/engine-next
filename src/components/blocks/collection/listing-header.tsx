import type { BlockComponentProps } from "@otl-core/cms-types";

interface ListingHeaderData {
  title?: string;
  name?: Record<string, string> | string;
  description?: Record<string, string> | string;
  current_locale?: string;
}

interface ListingHeaderConfig extends Record<string, unknown> {
  title?: string;
  tag?: "h1" | "h2" | "h3";
  showDescription?: boolean;
  textAlign?: "left" | "center" | "right";
  data?: ListingHeaderData;
}

function resolveLocalized(
  value: Record<string, string> | string | undefined,
  locale: string,
): string | undefined {
  if (!value) return undefined;
  if (typeof value === "string") return value;
  return value[locale] ?? value["en"] ?? Object.values(value)[0];
}

export function ListingHeaderBlock({
  config,
}: BlockComponentProps<ListingHeaderConfig>) {
  const {
    title: staticTitle,
    tag: Tag = "h1",
    showDescription = true,
    textAlign = "left",
    data,
  } = config;

  const locale = data?.current_locale || "en";
  const displayTitle =
    resolveLocalized(data?.name, locale) || data?.title || staticTitle;
  const displayDescription = showDescription
    ? resolveLocalized(data?.description, locale)
    : undefined;

  if (!displayTitle) return null;

  const alignClass =
    textAlign === "center"
      ? "text-center"
      : textAlign === "right"
        ? "text-right"
        : "text-left";

  return (
    <header className={alignClass}>
      <Tag className="text-3xl font-bold tracking-tight">{displayTitle}</Tag>
      {displayDescription && (
        <p className="text-muted-foreground mt-2 max-w-2xl text-lg">
          {displayDescription}
        </p>
      )}
    </header>
  );
}
