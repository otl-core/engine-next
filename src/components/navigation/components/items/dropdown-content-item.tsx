import {
  Site,
  HeaderConfig,
  HeaderDropdownButtonConfig,
  HeaderDropdownContent,
  HeaderDropdownDividerConfig,
  HeaderDropdownImageConfig,
  HeaderDropdownMarkdownConfig,
  HeaderDropdownNavigationItemConfig,
  HeaderDropdownGroupConfig,
  LocalizedString,
} from "@otl-core/cms-types";
import { resolveColorToCSS } from "@otl-core/cms-utils";
import Link from "next/link";
import {
  getLocalizedString,
  parseMarkdownToHTML,
} from "../../lib/navigation.utils";
import { Button } from "@/components/ui/button";

interface DropdownContentItemProps {
  content: HeaderDropdownContent;
  resolvedColors: Record<string, string | undefined>;
  onNavigate?: (contentId: string) => void;
  navigation: HeaderConfig;
  site: Site;
}

export const DropdownContentItem: React.FC<DropdownContentItemProps> = ({
  content,
  resolvedColors,
  onNavigate,
  navigation,
  site,
}) => {
  if (content.type === "markdown") {
    const config = content.config as HeaderDropdownMarkdownConfig;
    const markdownContent = getLocalizedString(config.content, site);
    const parsedHTML = parseMarkdownToHTML(markdownContent);

    return (
      <div
        dangerouslySetInnerHTML={{ __html: parsedHTML }}
        style={{
          color: resolvedColors.text,
        }}
        className="[&_*]:text-inherit"
      />
    );
  }

  // Image content
  if (content.type === "image") {
    const config = content.config as HeaderDropdownImageConfig;

    const getBaseValue = (
      val: string | { base: string } | number | undefined,
      fallback: string,
    ): string => {
      if (val === undefined || val === null) return fallback;
      if (typeof val === "number") return `${val}px`;
      if (typeof val === "string") return val;
      if (typeof val === "object" && "base" in val) return val.base;
      return fallback;
    };

    const width = getBaseValue(config.width, "300px");
    const height = getBaseValue(config.height, "auto");
    const objectFit = config.objectFit || "cover";

    if (!config.src) {
      return null;
    }

    const imgElement = (
      // eslint-disable-next-line @next/next/no-img-element -- navigation dropdown image from CMS config
      <img
        src={config.src}
        alt={config.alt || ""}
        style={{
          display: "block",
          width,
          height,
          objectFit,
        }}
      />
    );

    if (config.href) {
      return (
        <div>
          <Link href={config.href}>{imgElement}</Link>
        </div>
      );
    }

    return <div>{imgElement}</div>;
  }

  // Navigation item (link)
  if (content.type === "navigation-item") {
    const config = content.config as HeaderDropdownNavigationItemConfig;
    const label = getLocalizedString(config.label, site);

    return (
      <Link
        href={config.href}
        className="block px-3 py-2 rounded-md text-sm transition-colors whitespace-nowrap"
        style={{
          color:
            resolvedColors.dropdownMenuLinkColor || resolvedColors.linkColor,
          backgroundColor: "transparent",
        }}
        target={config.external ? "_blank" : undefined}
        rel={config.external ? "noopener noreferrer" : undefined}
      >
        {config.icon && <span className="mr-2">{config.icon}</span>}
        {label}
      </Link>
    );
  }

  // Button
  if (content.type === "button") {
    const config = content.config as HeaderDropdownButtonConfig;
    const label = getLocalizedString(config.label, site);

    const variantMap: Record<
      string,
      "default" | "secondary" | "outline" | "ghost"
    > = {
      primary: "default",
      secondary: "secondary",
      outline: "outline",
      ghost: "ghost",
    };

    return (
      <Button
        asChild
        variant={config.variant ? variantMap[config.variant] : "default"}
        className="w-full whitespace-nowrap"
      >
        <Link
          href={config.href}
          target={config.external ? "_blank" : undefined}
          rel={config.external ? "noopener noreferrer" : undefined}
        >
          {config.icon && <span className="mr-2">{config.icon}</span>}
          {label}
        </Link>
      </Button>
    );
  }

  // Nested dropdown - switch content
  if (content.type === "dropdown") {
    const label = content.label
      ? getLocalizedString(content.label, site)
      : "Submenu";

    return (
      <button
        onClick={(e) => {
          e.preventDefault();
          onNavigate?.(content.id);
        }}
        type="button"
        data-navigation-internal="true"
        className="block w-full text-left px-3 py-2 rounded-md text-sm transition-colors whitespace-nowrap"
        style={{
          color:
            resolvedColors.dropdownMenuLinkColor || resolvedColors.linkColor,
          backgroundColor: "transparent",
        }}
      >
        <span className="flex items-center justify-between">
          <span>{label}</span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </span>
      </button>
    );
  }

  // Section with content
  if (content.type === "section") {
    const config = content.config as HeaderDropdownGroupConfig;

    // Get label as string
    const getLabel = (value: string | LocalizedString | undefined): string => {
      if (!value) return "";
      if (typeof value === "string") return value;
      return (value as LocalizedString).en || "";
    };

    const title = config.title ? getLabel(config.title) : undefined;

    return (
      <div
        className="flex flex-col"
        style={{
          gap: config.gap || "0.25rem",
          justifyContent: config.justify || "flex-start",
          alignItems: config.align || "flex-start",
        }}
      >
        {title && (
          <div
            className="text-sm font-semibold mb-1"
            style={{ color: resolvedColors.text }}
          >
            {title}
          </div>
        )}
        {config.content?.map((item: HeaderDropdownContent) => (
          <DropdownContentItem
            key={item.id}
            content={item}
            resolvedColors={resolvedColors}
            onNavigate={onNavigate}
            navigation={navigation}
            site={site}
          />
        ))}
      </div>
    );
  }

  // Divider
  if (content.type === "divider") {
    const dividerConfig = content.config as HeaderDropdownDividerConfig;
    const dividerColor = dividerConfig?.color
      ? resolveColorToCSS(dividerConfig.color)
      : resolvedColors.border;
    const thickness = dividerConfig?.thickness || "1px";
    const margin = dividerConfig?.margin || "0.5rem";
    const borderStyle = dividerConfig?.style || "solid";

    return (
      <div
        style={{
          borderTopWidth: thickness,
          borderTopStyle: borderStyle,
          borderTopColor: dividerColor,
          marginTop: margin,
          marginBottom: margin,
        }}
      />
    );
  }

  return null;
};
