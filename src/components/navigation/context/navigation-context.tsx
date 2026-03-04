"use client";

import { usePathname } from "next/navigation";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

interface NavigationContextType {
  headerRef: React.RefObject<HTMLElement | null>;
  isDropdownOpen: boolean;
  activeDropdown: string | null;
  openDropdown: (dropdownId: string) => void;
  closeDropdown: () => void;
  toggleDropdown: (dropdownId: string) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(
  undefined,
);

export function NavigationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);
  const pathname = usePathname();

  const openDropdown = (dropdownId: string) => setActiveDropdown(dropdownId);
  const closeDropdown = () => setActiveDropdown(null);
  const toggleDropdown = (dropdownId: string) =>
    setActiveDropdown((prev) => (prev === dropdownId ? null : dropdownId));

  // Close dropdown on route change
  useEffect(() => {
    if (!activeDropdown) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- close dropdown on route change
    setActiveDropdown(null);
  }, [pathname, activeDropdown]);

  useEffect(() => {
    if (!activeDropdown) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveDropdown(null);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [activeDropdown]);

  useEffect(() => {
    if (!activeDropdown) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Check if click is on an internal navigation element (back button, nested dropdown triggers)
      if (target.closest("[data-navigation-internal]")) {
        return;
      }

      // Check if click is outside the header
      if (!headerRef.current?.contains(target)) {
        setActiveDropdown(null);
      }
    };

    // Use capture phase to handle clicks before they bubble
    document.addEventListener("click", handleClickOutside, true);

    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, [activeDropdown]);

  const isDropdownOpen = useMemo(
    () => activeDropdown !== null,
    [activeDropdown],
  );

  return (
    <NavigationContext.Provider
      value={{
        headerRef,
        isDropdownOpen,
        activeDropdown,
        openDropdown,
        closeDropdown,
        toggleDropdown,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error("useNavigation must be used within NavigationProvider");
  }
  return context;
}
