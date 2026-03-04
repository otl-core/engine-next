import { Site, HeaderConfig, HeaderSection } from "@otl-core/cms-types";
import { cn } from "@otl-core/cms-utils";
import { ReactNode } from "react";
import { NavbarSections } from "../sections/navbar-sections";

interface NavbarProps {
  id: string;
  className: string;
  headerStyles: React.CSSProperties;
  sortedSections: HeaderSection[];
  navigation: HeaderConfig;
  resolvedColors: Record<string, string | undefined>;
  itemsShowClass: string;
  togglerHideClass: string;
  togglerSectionId: string;
  site: Site;
  mobileMenuId?: string;
  containerContent?: boolean;
}

export function Navbar({
  id,
  className,
  headerStyles,
  sortedSections,
  navigation,
  resolvedColors,
  itemsShowClass,
  togglerHideClass,
  togglerSectionId,
  site,
  mobileMenuId,
  containerContent = false,
}: NavbarProps): ReactNode {
  const sectionsContent = sortedSections.map((section) => (
    <NavbarSections
      key={section.id}
      section={section}
      site={site}
      navigation={navigation}
      resolvedColors={resolvedColors}
      itemsShowClass={itemsShowClass}
      togglerHideClass={togglerHideClass}
      isTogglerSection={section.id === togglerSectionId}
      mobileMenuId={mobileMenuId}
    />
  ));

  return (
    <div
      className={cn(
        `navbar-${id}`,
        "relative z-[9999] flex items-center justify-between",
        !containerContent && `navbar-inner-${id}`,
        className,
      )}
      style={headerStyles}
    >
      {containerContent ? (
        <div
          className={cn(
            "container mx-auto flex items-center justify-between w-full",
            `navbar-inner-${id}`,
          )}
        >
          {sectionsContent}
        </div>
      ) : (
        sectionsContent
      )}
    </div>
  );
}
