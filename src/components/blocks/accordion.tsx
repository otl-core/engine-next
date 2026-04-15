/**
 * Accordion Block (Server Component)
 * Collapsible content sections - renders all content on server for SEO
 */

import type { BlockComponentProps } from "@otl-core/cms-types";
import { Markdown } from "@/lib/markdown";
import AccordionItemClient from "./client/accordion-item-client";

interface AccordionItem {
  title: string;
  content: string;
}

interface AccordionConfig {
  items?: AccordionItem[];
  allowMultiple?: boolean;
}

export function AccordionBlock({
  config,
}: BlockComponentProps<AccordionConfig>) {
  const { items = [], allowMultiple = false } = config;

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <AccordionItemClient
          key={index}
          index={index}
          title={item.title}
          allowMultiple={allowMultiple}
        >
          <Markdown className="max-w-none">{item.content}</Markdown>
        </AccordionItemClient>
      ))}
    </div>
  );
}
