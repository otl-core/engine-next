import type { BlockComponentProps } from "@otl-core/cms-types";

interface EntryTitleConfig extends Record<string, unknown> {
  tag?: "h1" | "h2" | "h3";
  textAlign?: "left" | "center" | "right";
  data?: {
    title: string;
  };
}

interface EntryTitleProps extends BlockComponentProps<EntryTitleConfig> {
  config: EntryTitleConfig;
}

const TAG_CLASSES: Record<string, string> = {
  h1: "text-4xl lg:text-5xl font-bold",
  h2: "text-3xl lg:text-4xl font-bold",
  h3: "text-2xl lg:text-3xl font-bold",
};

export function EntryTitleBlock({ config }: EntryTitleProps) {
  const title = config.data?.title;
  if (!title) return null;

  const Tag = config.tag ?? "h1";
  const align = config.textAlign ?? "left";

  return (
    <Tag className={TAG_CLASSES[Tag]} style={{ textAlign: align }}>
      {title}
    </Tag>
  );
}
