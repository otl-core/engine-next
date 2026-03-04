/**
 * Quote Block
 * Blockquote/testimonial display
 */

import type { BlockComponentProps } from "@otl-core/cms-types";

interface QuoteConfig {
  text?: string;
  author?: string;
  source?: string;
  style?: "blockquote" | "pullquote";
}

export function QuoteBlock({ config }: BlockComponentProps<QuoteConfig>) {
  const { text = "", author = "", source = "", style = "blockquote" } = config;

  if (!text) {
    return null;
  }

  const isPullquote = style === "pullquote";

  return (
    <blockquote
      className={`${
        isPullquote
          ? "border-l-4 border-r-4 border-primary pl-6 pr-6 py-4 text-center text-xl font-semibold italic"
          : "border-l-4 border-border pl-4 py-2 italic"
      }`}
    >
      <p
        className={
          isPullquote ? "text-xl text-foreground" : "text-lg text-foreground"
        }
      >
        {text}
      </p>
      {(author || source) && (
        <footer className="mt-2 text-sm text-muted-foreground">
          {author && <cite className="font-semibold not-italic">{author}</cite>}
          {author && source && <span>, </span>}
          {source && <span>{source}</span>}
        </footer>
      )}
    </blockquote>
  );
}
