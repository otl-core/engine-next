import type { BlockComponentProps } from "@otl-core/cms-types";

interface EntryDateConfig extends Record<string, unknown> {
  dateFormat?: "long" | "short" | "numeric";
  data?: {
    published_at?: string;
    current_locale?: string;
  };
}

interface EntryDateProps extends BlockComponentProps<EntryDateConfig> {
  config: EntryDateConfig;
}

const DATE_OPTIONS: Record<string, Intl.DateTimeFormatOptions> = {
  long: { year: "numeric", month: "long", day: "numeric" },
  short: { year: "numeric", month: "short", day: "numeric" },
  numeric: { year: "numeric", month: "2-digit", day: "2-digit" },
};

function formatDate(
  iso: string,
  locale: string,
  format: "long" | "short" | "numeric",
): string {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return iso;
  try {
    return date.toLocaleDateString(locale, DATE_OPTIONS[format]);
  } catch {
    return date.toLocaleDateString("en-US", DATE_OPTIONS[format]);
  }
}

export function EntryDateBlock({ config }: EntryDateProps) {
  const { dateFormat = "long", data } = config;
  if (!data?.published_at) return null;

  const locale = data.current_locale ?? "en";

  return (
    <time
      dateTime={data.published_at}
      className="text-sm text-muted-foreground"
    >
      {formatDate(data.published_at, locale, dateFormat)}
    </time>
  );
}
