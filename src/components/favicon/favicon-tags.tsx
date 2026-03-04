/**
 * Favicon Tags Component
 * Generates all favicon and app icon tags based on configuration
 */

import { FaviconConfig } from "@otl-core/cms-types";

interface FaviconTagsProps {
  config: FaviconConfig | null;
}

export function FaviconTags({ config }: FaviconTagsProps) {
  if (!config) {
    return null;
  }

  const tags: React.JSX.Element[] = [];

  // Standard ICO and SVG favicons
  if (config.favicon_ico) {
    tags.push(
      <link
        key="favicon-ico"
        rel="icon"
        type="image/x-icon"
        href={config.favicon_ico}
      />,
    );
  }

  if (config.favicon_svg) {
    tags.push(
      <link
        key="favicon-svg"
        rel="icon"
        type="image/svg+xml"
        href={config.favicon_svg}
      />,
    );
  }

  // Standard PNG favicons
  if (config.favicon16) {
    tags.push(
      <link
        key="favicon-16"
        rel="icon"
        type="image/png"
        sizes="16x16"
        href={config.favicon16}
      />,
    );
  }

  if (config.favicon32) {
    tags.push(
      <link
        key="favicon-32"
        rel="icon"
        type="image/png"
        sizes="32x32"
        href={config.favicon32}
      />,
    );
  }

  if (config.favicon48) {
    tags.push(
      <link
        key="favicon-48"
        rel="icon"
        type="image/png"
        sizes="48x48"
        href={config.favicon48}
      />,
    );
  }

  if (config.favicon96) {
    tags.push(
      <link
        key="favicon-96"
        rel="icon"
        type="image/png"
        sizes="96x96"
        href={config.favicon96}
      />,
    );
  }

  if (config.favicon128) {
    tags.push(
      <link
        key="favicon-128"
        rel="icon"
        type="image/png"
        sizes="128x128"
        href={config.favicon128}
      />,
    );
  }

  if (config.favicon196) {
    tags.push(
      <link
        key="favicon-196"
        rel="icon"
        type="image/png"
        sizes="196x196"
        href={config.favicon196}
      />,
    );
  }

  // Apple Touch Icons
  if (config.apple_touch_icon_57) {
    tags.push(
      <link
        key="apple-touch-icon-57"
        rel="apple-touch-icon"
        sizes="57x57"
        href={config.apple_touch_icon_57}
      />,
    );
  }

  if (config.apple_touch_icon_60) {
    tags.push(
      <link
        key="apple-touch-icon-60"
        rel="apple-touch-icon"
        sizes="60x60"
        href={config.apple_touch_icon_60}
      />,
    );
  }

  if (config.apple_touch_icon_72) {
    tags.push(
      <link
        key="apple-touch-icon-72"
        rel="apple-touch-icon"
        sizes="72x72"
        href={config.apple_touch_icon_72}
      />,
    );
  }

  if (config.apple_touch_icon_76) {
    tags.push(
      <link
        key="apple-touch-icon-76"
        rel="apple-touch-icon"
        sizes="76x76"
        href={config.apple_touch_icon_76}
      />,
    );
  }

  if (config.apple_touch_icon_114) {
    tags.push(
      <link
        key="apple-touch-icon-114"
        rel="apple-touch-icon"
        sizes="114x114"
        href={config.apple_touch_icon_114}
      />,
    );
  }

  if (config.apple_touch_icon_120) {
    tags.push(
      <link
        key="apple-touch-icon-120"
        rel="apple-touch-icon"
        sizes="120x120"
        href={config.apple_touch_icon_120}
      />,
    );
  }

  if (config.apple_touch_icon_144) {
    tags.push(
      <link
        key="apple-touch-icon-144"
        rel="apple-touch-icon"
        sizes="144x144"
        href={config.apple_touch_icon_144}
      />,
    );
  }

  if (config.apple_touch_icon_152) {
    tags.push(
      <link
        key="apple-touch-icon-152"
        rel="apple-touch-icon"
        sizes="152x152"
        href={config.apple_touch_icon_152}
      />,
    );
  }

  if (config.apple_touch_icon_180) {
    tags.push(
      <link
        key="apple-touch-icon-180"
        rel="apple-touch-icon"
        sizes="180x180"
        href={config.apple_touch_icon_180}
      />,
    );
  }

  // Android Chrome Icons (using standard link rel for manifest)
  // Note: Android icons are typically defined in manifest.json

  // Safari Pinned Tab
  if (config.safari_pinned_tab) {
    tags.push(
      <link
        key="safari-pinned-tab"
        rel="mask-icon"
        href={config.safari_pinned_tab}
        color={config.safari_pinned_tab_color || "#000000"}
      />,
    );
  }

  // Web App Manifest
  // Prefer dynamic manifest generation over static file
  if (
    config.manifest_name ||
    config.android_chrome_192 ||
    config.android_chrome_512
  ) {
    tags.push(<link key="manifest" rel="manifest" href="/manifest.json" />);
  }

  // Browser Config for Microsoft
  if (config.ms_application_tile_70 || config.ms_application_tile_150) {
    tags.push(
      <meta
        key="ms-config"
        name="msapplication-config"
        content="/browserconfig.xml"
      />,
    );
  }

  // Theme Colors
  if (config.theme_color) {
    tags.push(
      <meta
        key="theme-color"
        name="theme-color"
        content={config.theme_color}
      />,
    );
  }

  // Microsoft Application Tile
  if (config.ms_application_tile_color) {
    tags.push(
      <meta
        key="ms-tile-color"
        name="msapplication-TileColor"
        content={config.ms_application_tile_color}
      />,
    );
  }

  if (config.ms_application_tile_150) {
    tags.push(
      <meta
        key="ms-tile-image"
        name="msapplication-TileImage"
        content={config.ms_application_tile_150}
      />,
    );
  }

  return <>{tags}</>;
}
