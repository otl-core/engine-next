/**
 * Video Block
 * Video embed (YouTube, Vimeo, etc.)
 *
 * Analytics note: This block uses iframe embeds, so native video events
 * (play, timeupdate, ended) are not accessible. Video tracking
 * (video_start, video_progress, video_complete) would require provider-
 * specific APIs (e.g., YouTube iframe API) and is not implemented here.
 */

import type { BlockComponentProps } from "@otl-core/cms-types";

interface VideoConfig {
  url?: string;
  caption?: string;
  autoplay?: boolean;
  controls?: boolean;
  loop?: boolean;
}

export function VideoBlock({ config }: BlockComponentProps<VideoConfig>) {
  const {
    url = "",
    caption = "",
    autoplay = false,
    controls = true,
    loop = false,
  } = config;

  if (!url) {
    return null;
  }

  // Build iframe params
  const params = new URLSearchParams();
  if (autoplay) params.append("autoplay", "1");
  if (!controls) params.append("controls", "0");
  if (loop) params.append("loop", "1");

  const embedUrl = url.includes("?") ? `${url}&${params}` : `${url}?${params}`;

  return (
    <figure className="w-full">
      <div className="relative w-full aspect-video">
        <iframe
          src={embedUrl}
          title="Video player"
          className="absolute top-0 left-0 w-full h-full rounded-lg"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      {caption && (
        <figcaption className="mt-2 text-sm text-center text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
