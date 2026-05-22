"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
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
  const hasMultiple = gallery.length > 1;
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: hasMultiple,
      align: "start",
    },
    hasMultiple
      ? [
          Autoplay({
            delay: 3800,
            jump: false,
            playOnInit: true,
            stopOnInteraction: false,
            stopOnMouseEnter: true,
            stopOnFocusIn: true,
          }),
        ]
      : [],
  );

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi],
  );

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    const onReInit = () => setScrollSnaps(emblaApi.scrollSnapList());

    onSelect();
    onReInit();

    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onReInit);

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onReInit);
    };
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi || selectedIndex === emblaApi.selectedScrollSnap()) return;
    emblaApi.scrollTo(selectedIndex);
  }, [emblaApi, selectedIndex]);

  return (
    <div className="bg-[#081224]">
      <div className="relative min-h-[240px] overflow-hidden sm:min-h-[320px]">
        <div className="embla h-full" ref={emblaRef}>
          <div className="embla__container flex h-full">
            {gallery.map((src, index) => (
              <div key={`${src}-slide`} className="flex-[0_0_100%] min-w-0">
                <div className="relative min-h-[240px] sm:min-h-[320px]">
                  <FallbackImage
                    src={src}
                    alt={alt}
                    className="absolute inset-0 h-full w-full object-cover"
                    loading={index === 0 ? "eager" : "lazy"}
                    fetchPriority={index === 0 ? "high" : "low"}
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,11,22,0.1)_0%,rgba(5,11,22,0.75)_100%)]" />
                  <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/80 backdrop-blur">
                    {index + 1} / {gallery.length}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {badgeLabel ? (
          <div className="absolute left-6 top-6 z-10 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-white backdrop-blur">
            {badgeLabel}
          </div>
        ) : null}

        {hasMultiple ? (
          <>
            <button
              type="button"
              onClick={scrollPrev}
              className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/15 bg-black/30 p-3 text-white backdrop-blur transition hover:bg-black/45"
              aria-label="Previous image"
              title="Previous"
            >
              <span className="text-lg leading-none">&larr;</span>
            </button>
            <button
              type="button"
              onClick={scrollNext}
              className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/15 bg-black/30 p-3 text-white backdrop-blur transition hover:bg-black/45"
              aria-label="Next image"
              title="Next"
            >
              <span className="text-lg leading-none">&rarr;</span>
            </button>
          </>
        ) : null}
      </div>

      {hasMultiple ? (
        <div className="border-t border-white/10 bg-[#07142a] px-4 py-4">
          <div className="flex max-w-full gap-3 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {gallery.map((src, index) => {
              const active = index === selectedIndex;
              return (
                <button
                  key={`${src}-thumb`}
                  type="button"
                  onClick={() => scrollTo(index)}
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
                    fetchPriority="low"
                  />
                </button>
              );
            })}
          </div>

          {scrollSnaps.length > 1 ? (
            <div className="mt-4 flex items-center justify-center gap-2">
              {scrollSnaps.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => scrollTo(index)}
                  className={`h-2.5 rounded-full transition ${
                    selectedIndex === index
                      ? "w-8 bg-[#f3c74d]"
                      : "w-2.5 bg-white/30 hover:bg-white/50"
                  }`}
                  aria-label={`Go to image slide ${index + 1}`}
                  aria-current={selectedIndex === index ? "true" : "false"}
                />
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
