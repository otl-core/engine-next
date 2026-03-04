import { blockRegistry } from "@/lib/registries/block-registry";
import { BlockRenderer } from "@otl-core/block-registry";
import {
  Site,
  FooterConfig,
  FooterContentSection,
  FooterSection,
} from "@otl-core/cms-types";
import React from "react";
import { resolveColorToCSS } from "@otl-core/cms-utils";
import { isContentSection } from "../../lib/footer.utils";

interface FooterSectionProps {
  section: FooterSection | FooterContentSection;
  footer: FooterConfig;
  site: Site;
  resolvedColors: Record<string, string | undefined>;
  level?: number;
}

function buildSectionStyle(
  section: FooterSection | FooterContentSection,
): React.CSSProperties {
  const style: React.CSSProperties = {
    display: "flex",
    flexDirection: section.type === "row" ? "row" : "column",
    alignItems: section.style.align || "flex-start",
    justifyContent: section.style.justify || "flex-start",
    gap: section.style.gap || "0",
  };

  if (section.style.flex) {
    style.flex = section.style.flex;
  }

  if (section.style.background) {
    style.backgroundColor = resolveColorToCSS(section.style.background);
  }

  if (section.style.padding) {
    const padding =
      typeof section.style.padding === "object" &&
      "base" in section.style.padding
        ? section.style.padding.base
        : section.style.padding;
    style.padding = padding;
  }

  if (section.style.border) {
    const border =
      typeof section.style.border === "object" && "base" in section.style.border
        ? section.style.border.base
        : section.style.border;

    if (border) {
      style.border = `${border.width || "0"} ${border.style || "solid"} ${
        border.color ? resolveColorToCSS(border.color) : "transparent"
      }`;
      if (border.radius) {
        style.borderRadius = border.radius;
      }
    }
  }

  return style;
}

export const FooterSectionComponent: React.FC<FooterSectionProps> = ({
  section,
  footer,
  site,
  resolvedColors,
  level = 0,
}) => {
  const sectionStyle = buildSectionStyle(section);

  // Content section - render blocks
  if (isContentSection(section)) {
    return (
      <div
        className="footer-section footer-content-section"
        style={sectionStyle}
        data-section-id={section.id}
      >
        {section?.blocks?.map((block) => (
          <BlockRenderer
            key={block.id}
            block={block}
            blockRegistry={blockRegistry}
          />
        ))}
      </div>
    );
  }

  // Container section - render nested sections recursively
  return (
    <div
      className="footer-section footer-container-section"
      style={sectionStyle}
      data-section-id={section.id}
    >
      {section?.sections
        ?.sort((a, b) => a.order - b.order)
        ?.map((childSection) => (
          <FooterSectionComponent
            key={childSection.id}
            section={childSection}
            footer={footer}
            site={site}
            resolvedColors={resolvedColors}
            level={level + 1}
          />
        ))}
    </div>
  );
};
