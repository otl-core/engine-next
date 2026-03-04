/**
 * Accordion Item Client Component
 * Thin client wrapper that only handles interactivity (open/close state)
 * Content is passed as children from the server component
 */

"use client";

import { useAnalytics } from "@otl-core/analytics";
import { type ReactNode, useCallback, useState } from "react";

interface AccordionItemClientProps {
  index: number;
  title: string;
  allowMultiple: boolean;
  children: ReactNode;
}

export default function AccordionItemClient({
  index,
  title,
  children,
}: AccordionItemClientProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { trackEvent } = useAnalytics();

  const handleToggle = useCallback(() => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    if (newIsOpen) {
      trackEvent("content_view", {
        component: "accordion",
        item_title: title,
        item_index: index,
      });
    }
  }, [isOpen, trackEvent, title, index]);

  return (
    <div className="border border-border rounded-lg">
      <button
        onClick={handleToggle}
        className="w-full px-4 py-3 text-left font-semibold flex justify-between items-center hover:bg-muted"
        aria-expanded={isOpen}
      >
        <span>{title}</span>
        <span className="text-muted-foreground" aria-hidden="true">
          {isOpen ? "\u2212" : "+"}
        </span>
      </button>
      <div
        className={`px-4 py-3 border-t border-border ${isOpen ? "" : "hidden"}`}
      >
        {children}
      </div>
    </div>
  );
}
