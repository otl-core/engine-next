/**
 * Tabs Block (Server Component)
 * Tabbed content display - renders all content on server for SEO
 */

import type { BlockComponentProps } from "@otl-core/cms-types";
import { markdownComponents, normalizeNewlines } from "@/lib/markdown";
import ReactMarkdown from "react-markdown";
import TabsClient from "./client/tabs-client";

interface TabItem {
  label: string;
  content: string;
}

interface TabsConfig {
  tabs?: TabItem[];
}

export function TabsBlock({ config }: BlockComponentProps<TabsConfig>) {
  const { tabs = [] } = config;

  if (!tabs || tabs.length === 0) {
    return null;
  }

  // Render all tab content on server for SEO
  const renderedTabs = tabs.map((tab, index) => ({
    label: tab.label,
    content: (
      <div key={index} className="max-w-none">
        <ReactMarkdown components={markdownComponents}>
          {normalizeNewlines(tab.content)}
        </ReactMarkdown>
      </div>
    ),
  }));

  return <TabsClient tabs={renderedTabs} />;
}
