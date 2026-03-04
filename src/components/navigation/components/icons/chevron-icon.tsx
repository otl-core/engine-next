interface ChevronIconProps {
  isOpen: boolean;
  className?: string;
  size?: number;
}

export function ChevronIcon({
  isOpen,
  className = "",
  size = 24,
}: ChevronIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{
        transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
        transition: "transform 200ms ease-in-out",
      }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
