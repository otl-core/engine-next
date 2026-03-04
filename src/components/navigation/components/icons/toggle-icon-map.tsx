import type { ToggleIconType } from "@otl-core/cms-types";
import { ChevronIcon } from "./chevron-icon";
import { GridIcon } from "./grid-icon";
import { HamburgerIcon } from "./hamburger-icon";
import { KebabIcon } from "./kebab-icon";
import { MeatballsIcon } from "./meatballs-icon";
import { PlusIcon } from "./plus-icon";

interface ToggleIconProps {
  isOpen: boolean;
  className?: string;
  size?: number;
  animationDuration?: number;
  animationTiming?: string;
}

export const toggleIconMap = new Map<
  ToggleIconType,
  React.ComponentType<ToggleIconProps>
>([
  ["hamburger", HamburgerIcon],
  ["kebab", KebabIcon],
  ["meatballs", MeatballsIcon],
  ["grid", GridIcon],
  ["chevron", ChevronIcon],
  ["plus", PlusIcon],
]);

export function getToggleIcon(
  type: ToggleIconType,
): React.ComponentType<ToggleIconProps> | undefined {
  return toggleIconMap.get(type);
}
