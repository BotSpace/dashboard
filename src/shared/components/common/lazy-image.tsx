"use client";

import { useState } from "react";
import { cn } from "@/shared/lib/utils";

/**
 * Lazy <img> with a skeleton placeholder + fade-in. Avoids the "half-loaded" look
 * for large (S3) images and defers off-screen images. Parent must be `relative`.
 * next/image is intentionally not used here: file URLs are presigned (change every
 * request), which would defeat its cache and re-optimize on every render.
 */
export function LazyImage({
  src,
  alt,
  className,
  eager = false,
}: {
  src: string;
  alt: string;
  className?: string;
  eager?: boolean;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-muted/40" aria-hidden="true" />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={cn(
          "h-full w-full object-cover transition-opacity duration-500",
          loaded ? "opacity-100" : "opacity-0",
          className,
        )}
      />
    </>
  );
}
