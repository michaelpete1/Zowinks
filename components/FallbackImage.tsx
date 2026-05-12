"use client";

import { useEffect, useState } from "react";

type FallbackImageProps = {
  src: string;
  alt: string;
  fallbackSrc?: string;
  className?: string;
  loading?: "eager" | "lazy";
};

export default function FallbackImage({
  src,
  alt,
  fallbackSrc = "/desktop.jpg",
  className,
  loading = "eager",
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
      loading={loading}
      onError={handleError}
    />
  );
}
