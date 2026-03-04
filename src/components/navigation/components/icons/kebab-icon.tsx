interface KebabIconProps {
  isOpen: boolean;
  className?: string;
  size?: number;
  animationDuration?: number;
  animationTiming?: string;
}

export function KebabIcon({
  isOpen,
  className = "",
  size = 24,
  animationDuration = 300,
  animationTiming = "ease-in-out",
}: KebabIconProps) {
  const duration = `${animationDuration}ms`;

  const dotSize = size * 0.125;

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        position: "relative",
        // @ts-expect-error - CSS custom property
        "--dot-width": "12.5%",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "25%",
          width: "12.5%",
          height: dotSize,
          backgroundColor: "currentColor",
          transform: "translate(-50%, -50%)",
          animation: `${isOpen ? "kebab-top-open" : "kebab-top-close"} ${duration} ${animationTiming} forwards`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: "12.5%",
          height: dotSize,
          backgroundColor: "currentColor",
          transform: "translate(-50%, -50%)",
          animation: `${isOpen ? "kebab-middle-hide" : "kebab-middle-show"} ${duration} ${animationTiming} forwards`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "75%",
          width: "12.5%",
          height: dotSize,
          backgroundColor: "currentColor",
          transform: "translate(-50%, -50%)",
          animation: `${isOpen ? "kebab-bottom-open" : "kebab-bottom-close"} ${duration} ${animationTiming} forwards`,
        }}
      />
    </div>
  );
}
