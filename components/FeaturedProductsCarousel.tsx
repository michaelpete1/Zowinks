"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import FallbackImage from "./FallbackImage";
import AddToCartButton from "./AddToCartButton";
import type { CatalogItem } from "../lib/catalog";

type FeaturedProductsCarouselProps = {
  featured: CatalogItem[];
};

export default function FeaturedProductsCarousel({
  featured,
}: FeaturedProductsCarouselProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
    },
    [
      Autoplay({
        delay: 3500,
        jump: false,
        playOnInit: true,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
        stopOnFocusIn: true,
      }),
    ],
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

  return (
    <div className="relative mx-auto mt-6 md:mt-8">
      <div className="embla overflow-hidden" ref={emblaRef}>
        <div className="embla__container flex -ml-3 lg:-ml-6">
          {featured.map((item) => (
            <div
              key={item.id}
              className="flex-[0_0_80%] pl-3 sm:flex-[0_0_70%] md:flex-[0_0_48%] lg:flex-[0_0_33.333%] lg:pl-6"
            >
              <article className="group h-full overflow-hidden rounded-[1.25rem] border border-white/10 bg-[#0a1020] shadow-[0_14px_30px_rgba(0,0,0,0.28)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.34)]">
                <Link href={item.href} className="block">
                  <div className="relative aspect-[16/10] overflow-hidden bg-[#0b1220] sm:aspect-[4/3]">
                    <FallbackImage
                      src={item.image || "/desktop.jpg"}
                      alt={item.title}
                      className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,11,22,0.02)_0%,rgba(5,11,22,0.58)_100%)] opacity-0 transition duration-300 group-hover:opacity-100" />
                    <div className="absolute bottom-4 left-4 rounded-full bg-black/45 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white opacity-0 transition duration-300 group-hover:opacity-100">
                      View details
                    </div>
                  </div>
                </Link>
                <div className="space-y-2.5 p-4 text-center sm:space-y-3 sm:p-5">
                  <Link href={item.href} className="block">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#f3c74d] sm:text-[11px] sm:tracking-[0.24em]">
                      {item.category}
                    </p>
                    <h3 className="mt-1.5 font-display text-base font-bold text-white sm:mt-2 sm:text-lg">
                      {item.title}
                    </h3>
                  </Link>
                  <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
                    <span className="text-sm font-semibold text-white">
                      {item.price}
                    </span>
                    <div className="flex flex-wrap justify-end gap-2">
                      <Link
                        href={item.href}
                        className="rounded-full border border-white/10 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white transition hover:border-[#f3c74d]/45 hover:bg-white/10 sm:py-1 sm:text-[10px] sm:tracking-[0.2em]"
                      >
                        View details
                      </Link>
                      <AddToCartButton
                        item={{
                          id: item.id,
                          slug: item.slug,
                          title: item.title,
                          price: item.price,
                          spec: item.category,
                          image: item.image,
                        }}
                        className="rounded-full bg-[#f3c74d] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#050b16] transition hover:bg-[#e4b935] sm:py-1 sm:text-[10px] sm:tracking-[0.2em]"
                      >
                        Order Now
                      </AddToCartButton>
                    </div>
                  </div>
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={scrollPrev}
        className="absolute left-2 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-[#0a1020]/90 text-white shadow-[0_12px_28px_rgba(0,0,0,0.24)] transition hover:bg-[#10182c] md:flex"
        aria-label="Previous products"
      >
        <span className="text-lg leading-none">&larr;</span>
      </button>
      <button
        type="button"
        onClick={scrollNext}
        className="absolute right-2 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-[#0a1020]/90 text-white shadow-[0_12px_28px_rgba(0,0,0,0.24)] transition hover:bg-[#10182c] md:flex"
        aria-label="Next products"
      >
        <span className="text-lg leading-none">&rarr;</span>
      </button>

      {scrollSnaps.length > 1 ? (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 md:mt-6">
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
              aria-label={`Go to product slide ${index + 1}`}
              aria-current={selectedIndex === index ? "true" : "false"}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
