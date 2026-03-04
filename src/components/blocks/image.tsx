/**
 * Image Block
 * Single image with caption and alt text
 */

import type { BlockComponentProps } from "@otl-core/cms-types";

interface ImageConfig {
  src?: string;
  alt?: string;
  caption?: string;
  width?: string;
  aspectRatio?: string;
  objectFit?: "cover" | "contain" | "fill" | "none";
  borderRadius?: string;
  link?: string;
}

export function ImageBlock({ config }: BlockComponentProps<ImageConfig>) {
  const {
    src = "",
    alt = "",
    caption = "",
    width = "100%",
    aspectRatio = "auto",
    objectFit = "cover",
    borderRadius = "0",
    link,
  } = config;

  if (!src) {
    return null;
  }

  const imgElement = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      style={{
        width: "100%",
        height: "100%",
        aspectRatio,
        objectFit,
        borderRadius,
      }}
    />
  );

  return (
    <figure style={{ width, margin: width !== "100%" ? "0 auto" : undefined }}>
      {link ? (
        <a href={link} target="_blank" rel="noopener noreferrer">
          {imgElement}
        </a>
      ) : (
        imgElement
      )}
      {caption && (
        <figcaption className="mt-2 text-sm text-center text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
