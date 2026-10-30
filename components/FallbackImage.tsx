"use client";

import type { CSSProperties } from "react";
import { useState } from "react";
import NextImage from "next/image";

type FallbackImageProps = {
  src: string;
  alt: string;
  fallbackSrc?: string;
  className?: string;
  style?: CSSProperties;
  loading?: "eager" | "lazy";
  priority?: boolean;
  fetchPriority?: "high" | "low" | "auto";
  sizes?: string;
  fill?: boolean;
  width?: number;
  height?: number;
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
  sizes = "(max-width: 640px) 80vw, (max-width: 1024px) 48vw, 33vw",
  fill,
  width,
  height,
}: FallbackImageProps) {
  const requestedSrc = src || fallbackSrc;
  const [currentSrc, setCurrentSrc] = useState(requestedSrc);
  const [isLoaded, setIsLoaded] = useState(false);
  const [retried, setRetried] = useState(false);

  // Reset if the src prop changes
  const [lastRequestedSrc, setLastRequestedSrc] = useState(requestedSrc);
  if (lastRequestedSrc !== requestedSrc) {
    setLastRequestedSrc(requestedSrc);
    setCurrentSrc(requestedSrc);
    setIsLoaded(false);
    setRetried(false);
  }

  const handleError = () => {
    if (!retried && currentSrc !== fallbackSrc) {
      setRetried(true);
      setCurrentSrc(fallbackSrc);
    }
  };

  const handleLoad = () => setIsLoaded(true);

  const isEager = priority || loading === "eager";

  const imageStyle: CSSProperties = {
    ...style,
    opacity: isLoaded ? 1 : 0,
    transition: "opacity 200ms ease-out",
  };

  // Use fill mode when className contains inset / absolute positioning patterns
  const useFill = fill ?? className?.includes("inset-0");

  if (useFill) {
    return (
      <NextImage
        key={currentSrc}
        src={currentSrc}
        alt={alt}
        fill
        sizes={sizes}
        className={className}
        style={imageStyle}
        priority={isEager}
        quality={82}
        onLoad={handleLoad}
        onError={handleError}
      />
    );
  }

  return (
    <NextImage
      key={currentSrc}
      src={currentSrc}
      alt={alt}
      width={width ?? 800}
      height={height ?? 600}
      sizes={sizes}
      className={className}
      style={imageStyle}
      priority={isEager}
      quality={82}
      onLoad={handleLoad}
      onError={handleError}
    />
  );
}
