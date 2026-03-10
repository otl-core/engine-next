/**
 * OTL CMS Engine - Public API
 *
 * @example
 * ```typescript
 * import { sectionRegistry } from '@otl-core/engine';
 * import type { SectionComponentProps } from '@otl-core/cms-types';
 *
 * export default function MySection({ config }: SectionComponentProps) {
 *   return <div>My Section</div>;
 * }
 *
 * sectionRegistry.register('my-section', MySection);
 * ```
 */

export { blockRegistry } from "./lib/registries/block-registry";
export { sectionRegistry } from "./lib/registries/section-registry";

export { ConsentReopenTrigger } from "./components/consent";
export { default as ErrorBoundary } from "./components/feedback/error-boundary";
export { default as Loading, Skeleton } from "./components/feedback/loading";
export { default as SectionWrapper } from "./components/sections/section-wrapper";

export { useConsent } from "./lib/consent";
