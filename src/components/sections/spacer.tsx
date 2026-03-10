/**
 * Spacer Section
 * Vertical spacing with optional background, container behavior, and max width
 */

import type {
  ResponsiveValue,
  SectionBaseConfig,
  SectionComponentProps,
} from "@otl-core/cms-types";
import { normalizeResponsiveValue } from "@otl-core/style-utils";
import { BREAKPOINTS } from "@/lib/breakpoints";
import SectionWrapper from "./section-wrapper";

interface SpacerConfig extends SectionBaseConfig {
  height?: ResponsiveValue<string>;
  maxWidth?: ResponsiveValue<string>;
}

function generateHeightCSS(
  spacerId: string,
  height: ResponsiveValue<string> | undefined,
): string | null {
  const normalizedHeight = normalizeResponsiveValue(height);

  if (!normalizedHeight.base) {
    return null;
  }

  const css: string[] = [];
  const targetClass = `#${spacerId}`;

  // Generate base styles
  css.push(`${targetClass}{height:${normalizedHeight.base}}`);

  // Generate responsive styles
  BREAKPOINTS.forEach(({ key, minWidth }) => {
    const heightBp = normalizedHeight[key];
    if (heightBp) {
      css.push(
        `@media (min-width:${minWidth}){${targetClass}{height:${heightBp}}}`,
      );
    }
  });

  return css.length > 0 ? css.join("") : null;
}

function generateMaxWidthCSS(
  spacerId: string,
  maxWidth: ResponsiveValue<string> | undefined,
): string | null {
  const normalizedMaxWidth = normalizeResponsiveValue(maxWidth);

  if (!normalizedMaxWidth.base) {
    return null;
  }

  const css: string[] = [];
  const targetClass = `#${spacerId}`;

  // Generate base styles
  css.push(
    `${targetClass}{max-width:${normalizedMaxWidth.base};margin-left:auto;margin-right:auto}`,
  );

  // Generate responsive styles
  BREAKPOINTS.forEach(({ key, minWidth }) => {
    const maxWidthBp = normalizedMaxWidth[key];
    if (maxWidthBp) {
      css.push(
        `@media (min-width:${minWidth}){${targetClass}{max-width:${maxWidthBp}}}`,
      );
    }
  });

  return css.length > 0 ? css.join("") : null;
}

export function SpacerSection({ config }: SectionComponentProps<SpacerConfig>) {
  const { height, maxWidth, color, container, padding, margin } = config;
  const spacerId = `spacer-${crypto.randomUUID().slice(0, 9)}`;
  const heightCSS = generateHeightCSS(spacerId, height);
  const maxWidthCSS = generateMaxWidthCSS(spacerId, maxWidth);

  // Default height if none specified
  const normalizedHeight = normalizeResponsiveValue(height);
  const defaultHeight = !normalizedHeight.base ? "3rem" : undefined;

  return (
    <SectionWrapper
      container={container}
      padding={padding}
      margin={margin}
      color={color}
    >
      {heightCSS && <style dangerouslySetInnerHTML={{ __html: heightCSS }} />}
      {maxWidthCSS && (
        <style dangerouslySetInnerHTML={{ __html: maxWidthCSS }} />
      )}
      <div
        id={spacerId}
        style={{
          height: defaultHeight,
        }}
      />
    </SectionWrapper>
  );
}
