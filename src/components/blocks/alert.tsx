/**
 * Alert Block
 * Status messages and notifications with icon support
 */

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BlockRegistry, BlockRenderer } from "@otl-core/block-registry";
import { BlockInstance } from "@otl-core/cms-types";

interface AlertBlockProps {
  config: {
    title?: string;
    variant?: "default" | "success" | "destructive" | "warning";
    blocks?: BlockInstance[];
  };
  siteId?: string;
  blockRegistry: BlockRegistry;
}

export function AlertBlock({ config, siteId, blockRegistry }: AlertBlockProps) {
  const { title, variant = "default", blocks = [] } = config;

  return (
    <Alert variant={variant}>
      {title && <AlertTitle>{title}</AlertTitle>}
      <AlertDescription>
        <div className="space-y-3">
          {blocks.map((block) => (
            <BlockRenderer
              key={block.id}
              block={block}
              blockRegistry={blockRegistry}
              siteId={siteId}
            />
          ))}
        </div>
      </AlertDescription>
    </Alert>
  );
}
