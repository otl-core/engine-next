import type { ToggleIconType } from "@otl-core/cms-types";
import { HamburgerIcon } from "./hamburger-icon";
import { KebabIcon } from "./kebab-icon";
import { MeatballsIcon } from "./meatballs-icon";
import { GridIcon } from "./grid-icon";
import { ChevronIcon } from "./chevron-icon";
import { PlusIcon } from "./plus-icon";

interface ToggleIconProps {
  type: ToggleIconType;
  isOpen: boolean;
  className?: string;
  size?: number;
  animationDuration?: number;
  animationTiming?: string;
}

export function ToggleIcon({
  type,
  isOpen,
  className = "",
  size = 24,
  animationDuration,
  animationTiming,
}: ToggleIconProps) {
  const props = { isOpen, className, size, animationDuration, animationTiming };

  switch (type) {
    case "hamburger":
      return <HamburgerIcon {...props} />;
    case "kebab":
      return <KebabIcon {...props} />;
    case "meatballs":
      return <MeatballsIcon {...props} />;
    case "grid":
      return <GridIcon {...props} />;
    case "chevron":
      return <ChevronIcon {...props} />;
    case "plus":
      return <PlusIcon {...props} />;
    default:
      return <HamburgerIcon {...props} />;
  }
}
