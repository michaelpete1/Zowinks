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

  useEffect(() => {
    setCurrentSrc(src || fallbackSrc);
  }, [src, fallbackSrc]);

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      loading={loading}
      onError={() => {
        if (currentSrc !== fallbackSrc) {
          setCurrentSrc(fallbackSrc);
        }
      }}
    />
  );
}
