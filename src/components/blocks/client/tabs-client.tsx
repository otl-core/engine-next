/**
 * Tabs Client Component
 * Thin client wrapper that only handles tab switching interactivity
 * Content is passed as children from the server component
 */

"use client";

import { useAnalytics } from "@otl-core/analytics";
import { type ReactNode, useCallback, useState } from "react";

interface Tab {
  label: string;
  content: ReactNode;
}

interface TabsClientProps {
  tabs: Tab[];
}

export default function TabsClient({ tabs }: TabsClientProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const { trackEvent } = useAnalytics();

  const handleTabChange = useCallback(
    (index: number) => {
      setActiveIndex(index);
      trackEvent("content_view", {
        component: "tabs",
        tab_label: tabs[index]?.label,
        tab_index: index,
      });
    },
    [trackEvent, tabs],
  );

  return (
    <div className="w-full">
      <div className="flex border-b border-border" role="tablist">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => handleTabChange(index)}
            role="tab"
            aria-selected={activeIndex === index}
            aria-controls={`tabpanel-${index}`}
            className={`px-4 py-2 font-medium transition-colors ${
              activeIndex === index
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab, index) => (
        <div
          key={index}
          id={`tabpanel-${index}`}
          role="tabpanel"
          aria-labelledby={`tab-${index}`}
          className={`py-4 ${activeIndex === index ? "" : "hidden"}`}
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
