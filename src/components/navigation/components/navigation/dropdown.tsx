"use client";

import type {
  Site,
  HeaderConfig,
  HeaderDropdownGroupConfig,
  HeaderNavigationItemConfig,
  HeaderNavigationItemDropdownConfig,
} from "@otl-core/cms-types";
import { HeaderDropdownContent } from "@otl-core/cms-types";
import { getBreakpointValue } from "@otl-core/cms-utils";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { CSSTransition } from "react-transition-group";
import { useNavigation } from "../../context/navigation-context";
import { resolveBorderToCSS, resolveColorsToCSS } from "@otl-core/cms-utils";
import { DropdownContentItem } from "../items/dropdown-content-item";
interface NavigationDropdownProps {
  itemId: string;
  config: HeaderNavigationItemConfig;
  navigation: HeaderConfig;
  resolvedColors: Record<string, string | undefined>;
  styles: React.CSSProperties;
  linkStyle: React.CSSProperties;
  dropdownId: string;
  site: Site;
  containerContent?: boolean;
}
export function NavigationDropdown({
  itemId,
  config,
  navigation,
  resolvedColors,
  dropdownId,
  site,
  containerContent = false,
}: NavigationDropdownProps) {
  const { activeDropdown } = useNavigation();
  const [navigationStack, setNavigationStack] = useState<string[]>([]);
  const nodeRef = useRef(null);
  const backButtonRef = useRef<HTMLButtonElement>(null);
  const prevIsOpenRef = useRef(false);

  const isMobileMenu = useMemo(
    () => itemId.startsWith("mobile-menu"),
    [itemId],
  );
  const isOpen = useMemo(
    () => activeDropdown === itemId,
    [activeDropdown, itemId],
  );
  const content: HeaderDropdownContent[] = useMemo(
    () => (config as HeaderNavigationItemDropdownConfig).content || [],
    [config],
  );

  // Reset nested content when dropdown closes
  useEffect(() => {
    if (isOpen) {
      prevIsOpenRef.current = true;
      return; // Don't reset if dropdown is open
    }

    // Only reset if it was previously open
    if (prevIsOpenRef.current) {
      prevIsOpenRef.current = false;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reset nested content when dropdown closes
      setNavigationStack([]);
    }
  }, [isOpen]);

  // Move focus to back button when navigating to nested content
  useEffect(() => {
    if (navigationStack.length > 0 && backButtonRef.current) {
      backButtonRef.current.focus();
    }
  }, [navigationStack]);

  const handleNavigate = (contentId: string) => {
    setNavigationStack((prev) => [...prev, contentId]);
  };

  const handleBack = () => {
    setNavigationStack((prev) => prev.slice(0, -1));
  };

  // Helper to recursively find a dropdown by ID in content (including inside sections)
  const findDropdownById = (
    contentArray: HeaderDropdownContent[],
    id: string,
  ): HeaderDropdownContent | undefined => {
    for (const item of contentArray) {
      if (item.id === id && item.type === "dropdown") {
        return item;
      }
      // Search inside sections
      if (item.type === "section") {
        const config = item.config as HeaderDropdownGroupConfig;
        const found = findDropdownById(config.content, id);
        if (found) return found;
      }
    }
    return undefined;
  };

  // Build the navigation panels based on the stack
  const buildNavigationPanels = () => {
    const panels: Array<{
      content: HeaderDropdownContent[];
      depth: number;
    }> = [];

    // Root panel
    panels.push({ content: content, depth: 0 });

    // Build nested panels
    let currentContent = content;
    for (let i = 0; i < navigationStack.length; i++) {
      const contentId = navigationStack[i];
      const dropdownItem = findDropdownById(currentContent, contentId);

      if (dropdownItem && dropdownItem.config) {
        const nestedContent = (
          dropdownItem.config as HeaderNavigationItemDropdownConfig
        ).content;
        panels.push({ content: nestedContent, depth: i + 1 });
        currentContent = nestedContent;
      } else {
        break;
      }
    }

    return panels;
  };

  const panels = buildNavigationPanels();

  // Use the same color resolution as the rest of the system
  const dropdownColors = resolveColorsToCSS({
    dropdownMenuBackground: navigation.style?.dropdown?.background,
    dropdownMenuLinkColor: navigation.style?.dropdown?.link?.color,
    dropdownMenuLinkHoverColor: navigation.style?.dropdown?.link?.hoverColor,
    dropdownMenuLinkHoverBackground:
      navigation.style?.dropdown?.link?.hoverBackground,
    dropdownMenuTextColor: navigation.style?.dropdown?.textColor,
  });

  const dropdownMenuBackground = dropdownColors.dropdownMenuBackground;
  const dropdownMenuLinkColor = dropdownColors.dropdownMenuLinkColor;
  const dropdownMenuLinkHoverColor = dropdownColors.dropdownMenuLinkHoverColor;
  const dropdownMenuLinkHoverBackground =
    dropdownColors.dropdownMenuLinkHoverBackground || "transparent";
  const dropdownMenuTextColor = dropdownColors.dropdownMenuTextColor;

  const dropdownMenuBorder = useMemo(() => {
    if (!navigation.style?.dropdown?.border) return undefined;
    return resolveBorderToCSS(navigation.style.dropdown.border);
  }, [navigation.style]);

  // Early return AFTER all hooks
  if (content.length === 0) return null;

  // Enhanced resolved colors for dropdown, using dropdown-specific text color if available
  const dropdownResolvedColors = {
    ...resolvedColors,
    text: dropdownMenuTextColor || resolvedColors.text,
    dropdownMenuLinkColor,
  };

  const dropdownStyles: React.CSSProperties = {
    backgroundColor: dropdownMenuBackground,
    color: dropdownMenuTextColor || dropdownMenuLinkColor,
    ...dropdownMenuBorder,
  };

  const linkHoverStyle = {
    "--dropdown-link-hover-color": dropdownMenuLinkHoverColor,
    "--dropdown-link-hover-background": dropdownMenuLinkHoverBackground,
  } as React.CSSProperties;

  return (
    <>
      <CSSTransition
        in={isOpen}
        nodeRef={nodeRef}
        timeout={isMobileMenu ? 300 : 200}
        classNames={isMobileMenu ? "mobile-menu" : "desktop-dropdown"}
        unmountOnExit
      >
        <div
          ref={nodeRef}
          className={`relative w-full overflow-hidden navigation-dropdown-${dropdownId}`}
          style={{
            ...dropdownStyles,
            marginTop: navigation.style?.dropdown?.offset?.y
              ? getBreakpointValue(navigation.style.dropdown.offset.y, "base")
              : "0",
            marginLeft: navigation.style?.dropdown?.offset?.left
              ? getBreakpointValue(
                  navigation.style.dropdown.offset.left,
                  "base",
                )
              : "0",
            marginRight: navigation.style?.dropdown?.offset?.right
              ? getBreakpointValue(
                  navigation.style.dropdown.offset.right,
                  "base",
                )
              : "0",
          }}
        >
          <div
            style={{
              display: "flex",
              width: "100%",
              transform: `translateX(-${navigationStack.length * 100}%)`,
              transition: "transform 300ms ease-in-out",
            }}
          >
            {panels.map((panel, panelIndex) => {
              const isActive = panelIndex === navigationStack.length;
              const isToRight = panelIndex > navigationStack.length;

              const panelContent = (
                <>
                  {panel.depth > 0 && (
                    <button
                      ref={
                        panelIndex === navigationStack.length
                          ? backButtonRef
                          : null
                      }
                      onClick={(e) => {
                        e.preventDefault();
                        handleBack();
                      }}
                      type="button"
                      data-navigation-internal="true"
                      className="flex items-center px-3 py-2 text-sm rounded-md transition-colors mb-2"
                      style={{
                        color:
                          resolvedColors.dropdownMenuLinkColor ||
                          resolvedColors.linkColor,
                      }}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="mr-2"
                      >
                        <polyline points="15 18 9 12 15 6" />
                      </svg>
                      Back
                    </button>
                  )}

                  <div className="flex flex-wrap gap-4">
                    {panel.content?.map((item: HeaderDropdownContent) => {
                      if (item.type === "section") {
                        return (
                          <div key={item.id} className="flex-1 min-w-[200px]">
                            <DropdownContentItem
                              content={item}
                              resolvedColors={dropdownResolvedColors}
                              onNavigate={handleNavigate}
                              navigation={navigation}
                              site={site}
                            />
                          </div>
                        );
                      }
                      return (
                        <div key={item.id} className="w-full">
                          <DropdownContentItem
                            content={item}
                            resolvedColors={dropdownResolvedColors}
                            onNavigate={handleNavigate}
                            navigation={navigation}
                            site={site}
                          />
                        </div>
                      );
                    })}
                  </div>
                </>
              );

              return (
                <nav
                  key={panelIndex}
                  className={`flex flex-col p-2 dropdown-content-${dropdownId}`}
                  style={{
                    ...linkHoverStyle,
                    width: "100%",
                    flexShrink: 0,
                    transform: isToRight ? "translateX(30px)" : "translateX(0)",
                    opacity: isActive ? 1 : 0.95,
                    transition:
                      "transform 300ms ease-in-out, opacity 300ms ease-in-out",
                  }}
                  inert={!isActive ? true : undefined}
                >
                  {containerContent ? (
                    <div className="container mx-auto">{panelContent}</div>
                  ) : (
                    panelContent
                  )}
                </nav>
              );
            })}
          </div>
        </div>
      </CSSTransition>
    </>
  );
}
