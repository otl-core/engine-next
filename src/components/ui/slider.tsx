"use client";

import * as SliderPrimitives from "@radix-ui/react-slider";
import * as React from "react";

import { cn } from "@otl-core/style-utils";

function getThumbValues(
  value: number[] | undefined,
  defaultValue: number[] | readonly number[] | undefined,
): number[] {
  if (Array.isArray(value)) return value;
  if (defaultValue) {
    return Array.isArray(defaultValue)
      ? [...defaultValue]
      : [defaultValue as unknown as number];
  }
  return [0];
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitives.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      className,
    )}
    {...props}
  >
    <SliderPrimitives.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20">
      <SliderPrimitives.Range className="absolute h-full bg-primary" />
    </SliderPrimitives.Track>
    {getThumbValues(props.value, props.defaultValue).map((_, i) => (
      <SliderPrimitives.Thumb
        key={i}
        className="block h-4 w-4 rounded-full border border-primary/50 bg-background transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
      />
    ))}
  </SliderPrimitives.Root>
));
Slider.displayName = SliderPrimitives.Root.displayName;

export { Slider };
