/**
 * Loading Component
 * Shows loading state for async content
 */

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
  message?: string;
}

export default function Loading({
  size = "md",
  fullScreen = false,
  message,
}: LoadingProps) {
  const sizeClasses = {
    sm: "w-8 h-8 border-2",
    md: "w-12 h-12 border-3",
    lg: "w-16 h-16 border-4",
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div
        className={`${sizeClasses[size]} border-primary border-t-transparent rounded-full animate-spin`}
        role="status"
        aria-label="Loading"
      />
      {message && <p className="text-muted-foreground text-sm">{message}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        {spinner}
      </div>
    );
  }

  return spinner;
}

/**
 * Skeleton Loader
 * Shows placeholder for content being loaded
 */

interface SkeletonProps {
  className?: string;
  count?: number;
}

export function Skeleton({ className = "", count = 1 }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse bg-muted rounded ${className}`}
          aria-hidden="true"
        />
      ))}
    </>
  );
}
