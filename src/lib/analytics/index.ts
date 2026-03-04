/**
 * Analytics - Barrel Export
 */

export { CMSDataLayer, dataLayer } from "./data-layer";
export type { DataLayerEntry, DataLayerSubscriber } from "./data-layer";
export {
  createProviderAdapter,
  executeProviderCall,
} from "./provider-adapters";
export { setupAutoTriggers } from "./auto-triggers";
export { setupEventRules } from "./rule-engine";
export { BlockAnalyticsWrapper } from "./block-analytics-wrapper";
