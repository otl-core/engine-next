import type { ToggleIconType } from "@otl-core/cms-types";
import React from "react";
import { ToggleIcon } from "../icons/toggle-icon";

interface AnimatedToggleIconProps {
  type: ToggleIconType;
  isOpen: boolean;
  className?: string;
  size?: number;
  iconId?: string;
  animationDuration?: number;
  animationTiming?: string;
}

export function AnimatedToggleIcon({
  type,
  isOpen,
  className = "",
  size = 24,
  iconId = "default",
  animationDuration,
  animationTiming,
}: AnimatedToggleIconProps) {
  const containerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  return (
    <div
      style={containerStyle}
      className={`animated-toggle-icon-${iconId} ${className}`}
    >
      <ToggleIcon
        type={type}
        isOpen={isOpen}
        size={size}
        animationDuration={animationDuration}
        animationTiming={animationTiming}
      />
    </div>
  );
}
