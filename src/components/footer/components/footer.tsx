import { Site, FooterConfig } from "@otl-core/cms-types";
import React from "react";
import { generateFooterCSS, resolveFooterColors } from "../lib/footer.utils";
import { cn } from "../lib/utils";
import { FooterSectionComponent } from "./footer/footer-section";

export interface FooterProps {
  footer: FooterConfig;
  site: Site;
  className?: string;
  id?: string;
}

export const Footer: React.FC<FooterProps> = ({
  footer,
  site,
  className = "",
  id = "default",
}) => {
  const resolvedColors = resolveFooterColors(footer.style);
  const styles = generateFooterCSS(id, footer, resolvedColors);
  const sortedSections = [...footer.sections].sort((a, b) => a.order - b.order);
  const containerBehavior = footer.style.container || "edged";

  // Render sections with container wrapping per section for "edged" mode
  const sectionsContent = sortedSections.map((section) => {
    const sectionElement = (
      <FooterSectionComponent
        key={section.id}
        section={section}
        footer={footer}
        site={site}
        resolvedColors={resolvedColors}
      />
    );

    // In "edged" mode, wrap each top-level section in its own container
    if (containerBehavior === "edged") {
      return (
        <div key={section.id} className="container mx-auto">
          {sectionElement}
        </div>
      );
    }

    return sectionElement;
  });

  return (
    <>
      {styles && <style>{styles}</style>}
      <footer
        className={cn(
          {
            "container mx-auto": containerBehavior === "boxed",
          },
          className,
        )}
        data-footer-id={id}
        data-container={containerBehavior}
      >
        <div className={`footer-${id} footer-container`}>{sectionsContent}</div>
      </footer>
    </>
  );
};
