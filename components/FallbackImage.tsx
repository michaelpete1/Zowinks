"use client";

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";

type FallbackImageProps = {
  src: string;
  alt: string;
  fallbackSrc?: string;
  className?: string;
  style?: CSSProperties;
  loading?: "eager" | "lazy";
  priority?: boolean;
  fetchPriority?: "high" | "low" | "auto";
};

export default function FallbackImage({
  src,
  alt,
  fallbackSrc = "/desktop.jpg",
  className,
  style,
  loading = "eager",
  priority = false,
  fetchPriority,
}: FallbackImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src || fallbackSrc);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 1;

  useEffect(() => {
    setCurrentSrc(src || fallbackSrc);
    setRetryCount(0);
  }, [src, fallbackSrc]);

  const handleError = () => {
    if (currentSrc !== fallbackSrc && retryCount < MAX_RETRIES) {
      // Retry once with a fresh load attempt
      setRetryCount((prev) => prev + 1);
    } else if (currentSrc !== fallbackSrc) {
      // Fall back to fallback image
      setCurrentSrc(fallbackSrc);
    }
  };

  return (
    <img
      key={`${currentSrc}-${retryCount}`}
      src={currentSrc}
      alt={alt}
      className={className}
      style={style}
      loading={priority ? "eager" : loading}
      fetchPriority={fetchPriority ?? (priority ? "high" : undefined)}
      decoding="async"
      onError={handleError}
    />
  );
}
