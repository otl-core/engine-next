import {
  Site,
  HeaderConfig,
  HeaderNavigationItem,
  HeaderSection,
} from "@otl-core/cms-types";
import React from "react";
import { resolveItemVisibility } from "../../lib/navigation.utils";
import { MobileMenuToggle } from "../mobile/mobile-menu-toggle";
import { NavigationItem } from "./navigation-item";

interface NavbarSectionProps {
  section: HeaderSection;
  logo?: {
    text?: string;
    url?: string;
    alt?: string;
    width?: number;
    height?: number;
  };
  navigation?: HeaderConfig;
  resolvedColors: Record<string, string | undefined>;
  itemsShowClass?: string;
  togglerHideClass?: string;
  isTogglerSection?: boolean;
  site: Site;
  mobileMenuId?: string;
}

export const NavbarSections: React.FC<NavbarSectionProps> = ({
  section,
  navigation,
  resolvedColors,
  itemsShowClass,
  togglerHideClass,
  isTogglerSection,
  site,
  mobileMenuId,
}) => {
  // Check if this section contains a logo
  const hasLogo = section?.items?.some(
    (item: HeaderNavigationItem) => item.type === "logo",
  );

  // Compute section flex style
  let flexValue = section.flex;
  if (flexValue === "0" || flexValue === undefined) {
    flexValue = hasLogo ? "0 0 auto" : "0 1 auto";
  }

  const sectionStyle: React.CSSProperties = {
    flex: flexValue,
    justifyContent: section.justify || "flex-start",
    alignItems: section.align || "center",
    gap: section.gap || "0",
    ...(!hasLogo ? { minWidth: 0 } : {}),
  };

  // Check if section should be hidden when empty
  const shouldHide = (() => {
    if (!section.hideWhenEmpty) return false;

    const sectionHasLogo = section.items?.some(
      (item: HeaderNavigationItem) => item.type === "logo",
    );
    if (sectionHasLogo) return false;

    const hasAlwaysVisibleItems = section.items?.some(
      (item: HeaderNavigationItem) =>
        resolveItemVisibility(item) === "navbar-only" ||
        resolveItemVisibility(item) === "both",
    );
    if (hasAlwaysVisibleItems) return false;

    const collapsibleItems = section.items?.filter(
      (item: HeaderNavigationItem) =>
        item.type !== "logo" &&
        resolveItemVisibility(item) !== "navbar-only" &&
        resolveItemVisibility(item) !== "both",
    );
    if (collapsibleItems && collapsibleItems.length > 0) return false;

    if (isTogglerSection) return false;

    return true;
  })();

  // Compute visibility class
  const sectionVisibilityClass = (() => {
    if (!section.hideWhenEmpty) return "";

    const alwaysVisibleItems = section.items?.filter(
      (item: HeaderNavigationItem) =>
        item.type === "logo" ||
        resolveItemVisibility(item) === "navbar-only" ||
        resolveItemVisibility(item) === "both",
    );
    if (alwaysVisibleItems && alwaysVisibleItems.length > 0) return "";

    return itemsShowClass;
  })();

  if (shouldHide) {
    return null;
  }

  return (
    <div
      className={`flex flex-row ${sectionVisibilityClass}`}
      style={sectionStyle}
      data-section-id={section.id}
    >
      {section.items?.map((item: HeaderNavigationItem) => {
        return (
          <NavigationItem
            key={item.id}
            item={item}
            navigation={navigation}
            resolvedColors={resolvedColors}
            itemsShowClass={itemsShowClass}
            site={site}
          />
        );
      })}
      {isTogglerSection && navigation && mobileMenuId && (
        <div className={`flex flex-shrink-0 ${togglerHideClass}`}>
          <MobileMenuToggle
            navigation={navigation}
            resolvedColors={resolvedColors}
            toggleId={`toggler-${section.id}`}
            mobileMenuId={mobileMenuId}
          />
        </div>
      )}
    </div>
  );
};
