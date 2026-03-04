/**
 * Gallery Block
 * Image gallery display
 */

import type { BlockComponentProps } from "@otl-core/cms-types";
import Image from "next/image";

interface GalleryImage {
  src: string;
  alt: string;
  caption?: string;
}

interface GalleryConfig {
  images?: GalleryImage[];
  columns?: string;
  spacing?: number;
}

export function GalleryBlock({ config }: BlockComponentProps<GalleryConfig>) {
  const { images = [], columns = "3", spacing = 16 } = config;

  if (!images || images.length === 0) {
    return null;
  }

  const columnCount = parseInt(columns, 10) || 3;

  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
        gap: `${spacing}px`,
      }}
    >
      {images.map((image, index) => (
        <figure key={index} className="relative">
          <Image
            src={image.src}
            alt={image.alt}
            width={400}
            height={300}
            className="w-full h-auto object-cover"
          />
          {image.caption && (
            <figcaption className="mt-1 text-xs text-muted-foreground">
              {image.caption}
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  );
}
