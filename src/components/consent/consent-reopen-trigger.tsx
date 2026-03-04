"use client";

/**
 * Consent Reopen Trigger
 *
 * A small client component that renders a button to re-open the
 * consent banner. Can be placed in the footer or anywhere the site
 * owner wants a "Cookie Settings" link.
 */

import { useConsent } from "@/lib/consent";

interface ConsentReopenTriggerProps {
  label?: string;
  className?: string;
}

export function ConsentReopenTrigger({
  label = "Cookie Settings",
  className,
}: ConsentReopenTriggerProps) {
  const { resetConsent } = useConsent();

  return (
    <button
      type="button"
      onClick={resetConsent}
      className={className}
      aria-label={label}
    >
      {label}
    </button>
  );
}
