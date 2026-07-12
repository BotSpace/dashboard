"use client";

import { useEffect, useRef, useState } from "react";
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
  const imgRef = useRef<HTMLImageElement>(null);

  // On a hard reload the <img> can finish loading (often from cache) BEFORE React
  // hydrates and attaches onLoad, so the event is missed and the image stays
  // opacity-0. Check `complete` on mount to catch that case.
  useEffect(() => {
    const el = imgRef.current;
    if (el?.complete && el.naturalWidth > 0) setLoaded(true);
  }, [src]);

  return (
    <>
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-muted/40" aria-hidden="true" />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        className={cn(
          "h-full w-full object-cover transition-opacity duration-500",
          loaded ? "opacity-100" : "opacity-0",
          className,
        )}
      />
    </>
  );
}
