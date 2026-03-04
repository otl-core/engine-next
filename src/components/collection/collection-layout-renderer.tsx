import { sectionRegistry } from "@/lib/registries/section-registry";
import type { SchemaInstance } from "@otl-core/cms-types";
import { SectionRenderer } from "@otl-core/section-registry";

interface CollectionLayoutRendererProps {
  layout: SchemaInstance[];
  siteId?: string;
}

export default function CollectionLayoutRenderer({
  layout,
  siteId,
}: CollectionLayoutRendererProps) {
  return (
    <div className="collection-layout">
      {layout.map((section, idx) => (
        <SectionRenderer
          key={section.id || idx}
          section={section}
          sectionRegistry={sectionRegistry}
          siteId={siteId}
        />
      ))}
    </div>
  );
}
