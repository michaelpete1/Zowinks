"use client";

import { useCallback } from "react";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

interface CarouselProps {
  slides: Array<{
    img: string;
    title: string;
    href: string;
  }>;
  title: string;
}

export default function Carousel({ slides, title }: CarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      breakpoints: {
        "(max-width: 768px)": { align: "start" },
      },
    },
    [Autoplay({ delay: 4000 })],
  );

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <div className="relative">
      <h2 className="mb-8 text-center font-display text-2xl font-bold text-slate-900 lg:text-left">
        {title}
      </h2>
      <div className="embla overflow-hidden" ref={emblaRef}>
        <div className="embla__container flex -ml-4 lg:-ml-6">
          {slides.map((slide, index) => (
            <Link
              key={index}
              href={slide.href}
              className="flex-[0_0_100%] p-4 lg:flex-[0_0_33.333%] lg:p-6"
            >
              <div className="group relative h-80 cursor-pointer overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-3xl">
                <img
                  src={slide.img}
                  alt={slide.title}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                <div className="relative flex h-full flex-col justify-end p-8">
                  <h3 className="mb-2 font-display text-2xl font-bold text-white drop-shadow-2xl">
                    {slide.title}
                  </h3>
                  <p className="mb-4 text-lg font-semibold text-emerald-400 drop-shadow-xl">
                    Explore &rarr;
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <button
        type="button"
        onClick={scrollPrev}
        className="absolute left-0 top-1/2 z-10 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/90 shadow-2xl backdrop-blur transition-all hover:shadow-3xl lg:h-14 lg:w-14"
        aria-label="Previous slides"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      <button
        type="button"
        onClick={scrollNext}
        className="absolute right-0 top-1/2 z-10 grid h-12 w-12 translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/90 shadow-2xl backdrop-blur transition-all hover:shadow-3xl lg:h-14 lg:w-14"
        aria-label="Next slides"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </div>
  );
}
