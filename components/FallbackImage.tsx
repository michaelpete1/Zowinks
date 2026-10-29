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
  loading = "lazy",
  priority = false,
  fetchPriority,
}: FallbackImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src || fallbackSrc);
  const [retryCount, setRetryCount] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const MAX_RETRIES = 1;

  useEffect(() => {
    const nextSrc = src || fallbackSrc;
    setCurrentSrc(nextSrc);
    setRetryCount(0);
    setIsLoaded(false);

    if (nextSrc === fallbackSrc) {
      setIsLoaded(true);
      return;
    }

    const preloader = new Image();
    preloader.src = nextSrc;

    if (preloader.complete) {
      setIsLoaded(true);
      return;
    }

    const handlePreload = () => setIsLoaded(true);
    preloader.addEventListener("load", handlePreload, { once: true });
    preloader.addEventListener(
      "error",
      () => {
        setCurrentSrc(fallbackSrc);
        setIsLoaded(true);
      },
      { once: true },
    );

    return () => {
      preloader.removeEventListener("load", handlePreload);
    };
  }, [src, fallbackSrc]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    if (currentSrc !== fallbackSrc && retryCount < MAX_RETRIES) {
      setRetryCount((prev) => prev + 1);
      setIsLoaded(false);
      return;
    }

    if (currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setIsLoaded(true);
    }
  };

  return (
    <img
      key={`${currentSrc}-${retryCount}`}
      src={currentSrc}
      alt={alt}
      className={className}
      style={{
        ...style,
        opacity: isLoaded || currentSrc === fallbackSrc ? 1 : 0,
        transition: "opacity 180ms ease-out",
      }}
      loading={priority ? "eager" : loading}
      fetchPriority={fetchPriority ?? (priority ? "high" : undefined)}
      decoding="async"
      onLoad={handleLoad}
      onError={handleError}
    />
  );
}
