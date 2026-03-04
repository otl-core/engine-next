/**
 * Card Block
 * Content container for grouping related information
 */

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BlockRegistry, BlockRenderer } from "@otl-core/block-registry";
import { BlockInstance } from "@otl-core/cms-types";

interface CardBlockProps {
  config: {
    title?: string;
    description?: string;
    blocks?: BlockInstance[];
  };
  siteId?: string;
  blockRegistry: BlockRegistry;
}

export function CardBlock({ config, siteId, blockRegistry }: CardBlockProps) {
  const { title, description, blocks = [] } = config;

  return (
    <Card>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        <div className="space-y-4">
          {blocks.map((block) => (
            <BlockRenderer
              key={block.id}
              block={block}
              blockRegistry={blockRegistry}
              siteId={siteId}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
