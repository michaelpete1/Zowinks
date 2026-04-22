"use client";

import { useEffect, useState } from "react";

type FallbackImageProps = {
  src: string;
  alt: string;
  fallbackSrc?: string;
  className?: string;
};

export default function FallbackImage({
  src,
  alt,
  fallbackSrc = "/desktop.jpg",
  className,
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
      onError={() => {
        if (currentSrc !== fallbackSrc) {
          setCurrentSrc(fallbackSrc);
        }
      }}
    />
  );
}
