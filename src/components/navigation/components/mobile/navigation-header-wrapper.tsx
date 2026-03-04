"use client";

import React from "react";
import { useNavigation } from "../../context/navigation-context";

interface NavigationHeaderWrapperProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function NavigationHeaderWrapper({
  children,
  className,
  style,
}: NavigationHeaderWrapperProps) {
  const { headerRef } = useNavigation();

  return (
    <header ref={headerRef} className={className} style={style}>
      {children}
    </header>
  );
}
