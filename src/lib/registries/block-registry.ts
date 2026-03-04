/**
 * Block Component Registry
 * Manages registration and retrieval of block components
 */

// Import registry class and analytics wrapper registration from package
import {
  BlockRegistry,
  registerAnalyticsWrapper,
} from "@otl-core/block-registry";
import { BlockAnalyticsWrapper } from "@otl-core/analytics";

// Standard content blocks
import { AccordionBlock } from "@/components/blocks/accordion";
import { AlertBlock } from "@/components/blocks/alert";
import { BadgeBlock } from "@/components/blocks/badge";
import { ButtonBlock } from "@/components/blocks/button";
import { CardBlock } from "@/components/blocks/card";
import { CodeBlock } from "@/components/blocks/code";
import { DividerBlock } from "@/components/blocks/divider";
import { EmbedBlock } from "@/components/blocks/embed";
import { FormBlock } from "@/components/blocks/form";
import { GalleryBlock } from "@/components/blocks/gallery";
import { HtmlBlock } from "@/components/blocks/html";
import { ImageBlock } from "@/components/blocks/image";
import { LinkBlock } from "@/components/blocks/link";
import { MarkdownBlock } from "@/components/blocks/markdown";
import { ModalBlock } from "@/components/blocks/modal";
import { QuoteBlock } from "@/components/blocks/quote";
import { SpacerBlock } from "@/components/blocks/spacer";
import { TableBlock } from "@/components/blocks/table";
import { TabsBlock } from "@/components/blocks/tabs";
import { VideoBlock } from "@/components/blocks/video";

// Collection-specific blocks
import { AuthorInfoBlock } from "@/components/blocks/collection/author-info";
import { CollectionCategoriesBlock } from "@/components/blocks/collection/collection-categories";
import { CollectionPaginationBlock } from "@/components/blocks/collection/collection-pagination";
import { EntryContentBlock } from "@/components/blocks/collection/entry-content";
import { EntryListBlock } from "@/components/blocks/collection/entry-list";
import { EntryDateBlock } from "@/components/blocks/collection/entry-date";
import { EntryReadingTimeBlock } from "@/components/blocks/collection/entry-reading-time";
import { EntryTitleBlock } from "@/components/blocks/collection/entry-title";
import { CollectionTagsBlock } from "@/components/blocks/collection/collection-tags";
import { AuthorListBlock } from "@/components/blocks/collection/author-list";
import { CollectionSearchBlock } from "@/components/blocks/collection/collection-search";
import { ListingHeaderBlock } from "@/components/blocks/collection/listing-header";

// Form-specific blocks
import { FormButtonBlock } from "@/components/blocks/form/form-button";
import { FormCheckboxBlock } from "@/components/blocks/form/form-checkbox";
import { FormInlineGroupBlock } from "@/components/blocks/form/form-inline-group";
import { FormInputBlock } from "@/components/blocks/form/form-input";
import { FormRadioBlock } from "@/components/blocks/form/form-radio";
import { FormSelectBlock } from "@/components/blocks/form/form-select";
import { FormSliderBlock } from "@/components/blocks/form/form-slider";
import { FormToggleGroupBlock } from "@/components/blocks/form/form-toggle-group";

// Layout blocks (block versions of sections, for nesting)
import { ContainerLayoutBlock } from "@/components/blocks/container-layout";
import { FlexboxLayoutBlock } from "@/components/blocks/flexbox-layout";
import { GridLayoutBlock } from "@/components/blocks/grid-layout";

// Create instance
export const blockRegistry = new BlockRegistry();

// Register standard content blocks
blockRegistry.register("markdown", MarkdownBlock);
blockRegistry.register("html", HtmlBlock);
blockRegistry.register("quote", QuoteBlock);
blockRegistry.register("code", CodeBlock);
blockRegistry.register("image", ImageBlock);
blockRegistry.register("video", VideoBlock);
blockRegistry.register("gallery", GalleryBlock);
blockRegistry.register("embed", EmbedBlock);
blockRegistry.register("button", ButtonBlock);
blockRegistry.register("link", LinkBlock);
blockRegistry.register("accordion", AccordionBlock);
blockRegistry.register("tabs", TabsBlock);
blockRegistry.register("table", TableBlock);
blockRegistry.register("divider", DividerBlock);
blockRegistry.register("spacer", SpacerBlock);
blockRegistry.register("form", FormBlock);
blockRegistry.register("badge", BadgeBlock);
blockRegistry.register("alert", AlertBlock);
blockRegistry.register("card", CardBlock);
blockRegistry.register("modal", ModalBlock);

// Register collection-specific blocks
blockRegistry.register("entry-content", EntryContentBlock);
blockRegistry.register("entry-list", EntryListBlock);
blockRegistry.register("collection-pagination", CollectionPaginationBlock);
blockRegistry.register("author-info", AuthorInfoBlock);
blockRegistry.register("collection-categories", CollectionCategoriesBlock);
blockRegistry.register("entry-title", EntryTitleBlock);
blockRegistry.register("entry-date", EntryDateBlock);
blockRegistry.register("entry-reading-time", EntryReadingTimeBlock);
blockRegistry.register("collection-tags", CollectionTagsBlock);
blockRegistry.register("author-list", AuthorListBlock);
blockRegistry.register("listing-header", ListingHeaderBlock);
blockRegistry.register("collection-search", CollectionSearchBlock);

// Register form-specific blocks
blockRegistry.register("form-input", FormInputBlock);
blockRegistry.register("form-checkbox", FormCheckboxBlock);
blockRegistry.register("form-radio", FormRadioBlock);
blockRegistry.register("form-select", FormSelectBlock);
blockRegistry.register("form-toggle-group", FormToggleGroupBlock);
blockRegistry.register("form-slider", FormSliderBlock);
blockRegistry.register("form-button", FormButtonBlock);
blockRegistry.register("form-inline-group", FormInlineGroupBlock);

// Register layout blocks
blockRegistry.register("grid-layout", GridLayoutBlock);
blockRegistry.register("flexbox-layout", FlexboxLayoutBlock);
blockRegistry.register("container-layout", ContainerLayoutBlock);

// Register the block-level analytics wrapper so BlockRenderer wraps blocks
registerAnalyticsWrapper(BlockAnalyticsWrapper);

/**
 * Custom Blocks
 * To add your own blocks:
 * 1. Create your component in src/components/blocks/
 * 2. Import it above
 * 3. Register it: blockRegistry.register('your-block-name', YourBlock);
 */
