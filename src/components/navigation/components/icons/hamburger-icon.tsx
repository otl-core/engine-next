interface HamburgerIconProps {
  isOpen: boolean;
  className?: string;
  size?: number;
  animationDuration?: number;
  animationTiming?: string;
}

export function HamburgerIcon({
  isOpen,
  className = "",
  size = 24,
  animationDuration = 300,
  animationTiming = "ease-in-out",
}: HamburgerIconProps) {
  const duration = `${animationDuration}ms`;

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: "25%",
          width: size,
          height: "12.5%",
          backgroundColor: "currentColor",
          transform: "translateY(-50%)",
          animation: `${isOpen ? "hamburger-top-open" : "hamburger-top-close"} ${duration} ${animationTiming} forwards`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          top: "50%",
          width: size,
          height: "12.5%",
          backgroundColor: "currentColor",
          transform: "translateY(-50%)",
          animation: `${isOpen ? "hamburger-middle-hide" : "hamburger-middle-show"} ${duration} ${animationTiming} forwards`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          top: "75%",
          width: size,
          height: "12.5%",
          backgroundColor: "currentColor",
          transform: "translateY(-50%)",
          animation: `${isOpen ? "hamburger-bottom-open" : "hamburger-bottom-close"} ${duration} ${animationTiming} forwards`,
        }}
      />
    </div>
  );
}
