import type { BlockComponentProps } from "@otl-core/cms-types";

interface EntryReadingTimeConfig extends Record<string, unknown> {
  label?: string;
  data?: {
    reading_time_minutes?: number;
  };
}

interface EntryReadingTimeProps extends BlockComponentProps<EntryReadingTimeConfig> {
  config: EntryReadingTimeConfig;
}

export function EntryReadingTimeBlock({ config }: EntryReadingTimeProps) {
  const { label = "{minutes} min read", data } = config;
  if (!data?.reading_time_minutes || data.reading_time_minutes <= 0)
    return null;

  const text = label.replace("{minutes}", String(data.reading_time_minutes));

  return <span className="text-sm text-muted-foreground">{text}</span>;
}
