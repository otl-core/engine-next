interface PlusIconProps {
  isOpen: boolean;
  className?: string;
  size?: number;
  animationDuration?: number;
  animationTiming?: string;
}

export function PlusIcon({
  isOpen,
  className = "",
  size = 24,
  animationDuration = 300,
  animationTiming = "ease-in-out",
}: PlusIconProps) {
  const duration = `${animationDuration}ms`;
  const lineThickness = size * 0.125;
  const lineLength = size;

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
          left: "50%",
          top: "50%",
          width: lineThickness,
          height: lineLength,
          backgroundColor: "currentColor",
          transform: isOpen
            ? "translate(-50%, -50%) rotate(90deg)"
            : "translate(-50%, -50%) rotate(0deg)",
          transition: `transform ${duration} ${animationTiming}`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: lineLength,
          height: lineThickness,
          backgroundColor: "currentColor",
          transform: "translate(-50%, -50%)",
        }}
      />
    </div>
  );
}
