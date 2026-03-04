/**
 * OTL CMS Engine - Public API
 *
 * This is the public API for the OTL CMS Engine.
 * Import these to extend the engine or use its functionality.
 *
 * @example
 * ```typescript
 * import { sectionRegistry, SectionComponentProps } from '@otl-core/engine';
 *
 * export default function MySection({ config }: SectionComponentProps) {
 *   return <div>My Section</div>;
 * }
 *
 * sectionRegistry.register('my-section', MySection);
 * ```
 */

// ==================== Core Registries ====================
export { blockRegistry } from "./lib/registries/block-registry";
export { sectionRegistry } from "./lib/registries/section-registry";

// ==================== Type Definitions ====================
export type {
  BlockComponentProps,
  SchemaInstance,
  SectionBaseConfig,
  SectionComponentProps,
} from "@otl-core/cms-types";

// ==================== Renderers ====================
export {
  BlockRenderer,
  ComponentNotFound,
  registerAnalyticsWrapper,
} from "@otl-core/block-registry";
export { PageRenderer, SectionRenderer } from "@otl-core/section-registry";

// ==================== Components ====================
export { ConsentReopenTrigger } from "./components/consent";
export { default as ErrorBoundary } from "./components/feedback/error-boundary";
export { default as Loading, Skeleton } from "./components/feedback/loading";
export { default as SectionWrapper } from "./components/sections/section-wrapper";

// ==================== Consent ====================
export { useConsent } from "./lib/consent";

// ==================== Utilities ====================
// Style utilities (re-exported from @otl-core/cms-utils)
export {
  cn,
  colorToStyle,
  gapToClass,
  paddingBottomToClass,
  paddingToClass,
  paddingTopToClass,
  resolveColorToCSS,
  spacingToClass,
  widthToClass,
} from "@otl-core/cms-utils";
