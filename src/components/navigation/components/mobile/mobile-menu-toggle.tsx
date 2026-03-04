"use client";

import type { HeaderConfig } from "@otl-core/cms-types";
import { useRef } from "react";
import { useNavigation } from "../../context/navigation-context";
import { AnimatedToggleIcon } from "../items/animated-toggle-icon";

interface MobileMenuToggleProps {
  navigation: HeaderConfig;
  resolvedColors: Record<string, string | undefined>;
  toggleId: string;
  mobileMenuId: string;
}

export function MobileMenuToggle({
  navigation,
  resolvedColors,
  toggleId,
  mobileMenuId,
}: MobileMenuToggleProps) {
  const { activeDropdown, toggleDropdown } = useNavigation();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isMobileMenuOpen = activeDropdown === mobileMenuId;

  return (
    <button
      ref={buttonRef}
      onClick={() => toggleDropdown(mobileMenuId)}
      className={`mobile-menu-toggle-${toggleId} transition-colors group flex items-center justify-center`}
      style={{
        backgroundColor: resolvedColors.burgerButtonBackground,
        color: resolvedColors.burgerIconColor,
        padding: navigation.style?.burger?.toggleButton?.padding || "0.5rem",
        borderRadius:
          navigation.style?.burger?.toggleButton?.borderRadius || "0.375rem",
        fontSize: 0,
        lineHeight: 0,
        font: "0/0 a",
        // @ts-expect-error - CSS custom properties
        "--icon-hover": resolvedColors.burgerIconHover,
      }}
      aria-label="Toggle navigation menu"
      aria-expanded={isMobileMenuOpen}
      aria-controls="mobile-menu-dropdown"
    >
      <AnimatedToggleIcon
        type={navigation.style?.burger?.toggleIcon?.type || "hamburger"}
        isOpen={isMobileMenuOpen}
        size={navigation.style?.burger?.toggleIcon?.size || 24}
        iconId={toggleId}
        animationDuration={
          navigation.style?.burger?.toggleIcon?.animationDuration
        }
        animationTiming={navigation.style?.burger?.toggleIcon?.animationTiming}
        className="group-hover:text-[var(--icon-hover)]"
      />
    </button>
  );
}
