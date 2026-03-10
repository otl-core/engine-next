"use client";

/**
 * Modal Block
 * Displays content in an overlay dialog using Radix UI Dialog
 * Can contain any blocks including forms
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAnalytics } from "@otl-core/analytics";
import { cn } from "@otl-core/style-utils";
import { BlockRegistry, BlockRenderer } from "@otl-core/block-registry";
import { BlockInstance } from "@otl-core/cms-types";
import { useCallback } from "react";

interface ModalBlockProps {
  config: {
    triggerText?: string;
    triggerVariant?: "primary" | "secondary" | "outline" | "ghost";
    triggerSize?: "sm" | "md" | "lg";
    title?: string;
    width?: "sm" | "md" | "lg" | "xl" | "full";
    maxHeight?: "sm" | "md" | "lg" | "full";
    blocks?: BlockInstance[];
  };
  siteId?: string;
  blockRegistry: BlockRegistry;
}

const TRIGGER_VARIANT_CLASSES = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  outline:
    "border-2 border-border bg-transparent hover:bg-accent hover:text-accent-foreground",
  ghost: "text-primary hover:bg-accent hover:text-accent-foreground",
} as const;

const TRIGGER_SIZE_CLASSES = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg",
} as const;

const WIDTH_CLASSES = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  full: "max-w-[95vw]",
} as const;

const MAX_HEIGHT_CLASSES = {
  sm: "max-h-[50vh]",
  md: "max-h-[70vh]",
  lg: "max-h-[85vh]",
  full: "max-h-[95vh]",
} as const;

export function ModalBlock({ config, siteId, blockRegistry }: ModalBlockProps) {
  const {
    triggerText = "Open Modal",
    triggerVariant = "primary",
    triggerSize = "md",
    title,
    width = "md",
    maxHeight = "lg",
    blocks = [],
  } = config;

  const { trackEvent } = useAnalytics();

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (open) {
        trackEvent("content_view", {
          component: "modal",
          modal_title: title,
          trigger_text: triggerText,
        });
      }
    },
    [trackEvent, title, triggerText],
  );

  return (
    <Dialog onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          className={cn(
            "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            TRIGGER_VARIANT_CLASSES[triggerVariant],
            TRIGGER_SIZE_CLASSES[triggerSize],
          )}
        >
          {triggerText}
        </button>
      </DialogTrigger>
      <DialogContent className={cn("overflow-hidden", WIDTH_CLASSES[width])}>
        {title && (
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
        )}
        <div
          className={cn(
            "overflow-y-auto space-y-4",
            MAX_HEIGHT_CLASSES[maxHeight],
          )}
        >
          {blocks.map((block) => (
            <BlockRenderer
              key={block.id}
              block={block}
              blockRegistry={blockRegistry}
              siteId={siteId}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
