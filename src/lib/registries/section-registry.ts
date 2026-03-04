/**
 * Section Component Registry
 * Manages registration and retrieval of section components
 */

// Import registry class from package
import { SectionRegistry } from "@otl-core/section-registry";

// Import section components
import { ContainerSection } from "@/components/sections/container";
import { FlexboxSection } from "@/components/sections/flexbox";
import { GridSection } from "@/components/sections/grid";
import { SpacerSection } from "@/components/sections/spacer";

// Create instance
export const sectionRegistry = new SectionRegistry();

// Register section components
sectionRegistry.register("grid", GridSection);
sectionRegistry.register("flexbox", FlexboxSection);
sectionRegistry.register("spacer", SpacerSection);
sectionRegistry.register("container", ContainerSection);

/**
 * Custom Sections
 * To add your own sections:
 * 1. Create your component in src/components/sections/
 * 2. Import it above
 * 3. Register it: sectionRegistry.register('your-section-name', YourSection);
 */
