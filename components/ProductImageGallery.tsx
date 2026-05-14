"use client";

import { useMemo, useState } from "react";
import FallbackImage from "./FallbackImage";

type ProductImageGalleryProps = {
  images: string[];
  alt: string;
  badgeLabel?: string;
};

export default function ProductImageGallery({
  images,
  alt,
  badgeLabel,
}: ProductImageGalleryProps) {
  const gallery = useMemo(() => {
    const normalized = (images ?? [])
      .map((src) => (typeof src === "string" ? src.trim() : ""))
      .filter(Boolean);
    return Array.from(new Set(normalized));
  }, [images]);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedSrc = gallery[selectedIndex] || gallery[0] || "/desktop.jpg";
  const hasMultiple = gallery.length > 1;

  const goPrev = () => {
    if (!hasMultiple) return;
    setSelectedIndex((current) => (current - 1 + gallery.length) % gallery.length);
  };

  const goNext = () => {
    if (!hasMultiple) return;
    setSelectedIndex((current) => (current + 1) % gallery.length);
  };

  return (
    <div className="bg-[#081224]">
      <div className="relative min-h-[320px]">
        <FallbackImage
          src={selectedSrc}
          alt={alt}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,11,22,0.1)_0%,rgba(5,11,22,0.75)_100%)]" />

        {badgeLabel ? (
          <div className="absolute left-6 top-6 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-white backdrop-blur">
            {badgeLabel}
          </div>
        ) : null}

        {hasMultiple ? (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/15 bg-black/30 p-3 text-white backdrop-blur transition hover:bg-black/45"
              aria-label="Previous image"
              title="Previous"
            >
              <span className="text-lg leading-none">&larr;</span>
            </button>
            <button
              type="button"
              onClick={goNext}
              className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/15 bg-black/30 p-3 text-white backdrop-blur transition hover:bg-black/45"
              aria-label="Next image"
              title="Next"
            >
              <span className="text-lg leading-none">&rarr;</span>
            </button>
            <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/80 backdrop-blur">
              {selectedIndex + 1} / {gallery.length}
            </div>
          </>
        ) : null}
      </div>

      {hasMultiple ? (
        <div className="border-t border-white/10 bg-[#07142a] px-4 py-4">
          <div className="flex gap-3 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {gallery.map((src, index) => {
              const active = index === selectedIndex;
              return (
                <button
                  key={`${src}-thumb`}
                  type="button"
                  onClick={() => setSelectedIndex(index)}
                  className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border bg-[#0a1020] transition ${
                    active
                      ? "border-[#f3c74d] ring-2 ring-[#f3c74d]/25"
                      : "border-white/10 hover:border-white/25"
                  }`}
                  aria-label={`View image ${index + 1}`}
                  aria-current={active ? "true" : "false"}
                >
                  <FallbackImage
                    src={src}
                    alt={alt}
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                  />
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

