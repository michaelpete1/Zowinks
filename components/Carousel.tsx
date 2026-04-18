"use client";

import { useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

interface CarouselProps {
  slides: Array<{
    img: string;
    title: string;
    href: string;
  }>;
  title?: string;
  variant?: "photo" | "logo";
  titleClassName?: string;
}

export default function Carousel({ slides, title, variant = "photo", titleClassName = "text-slate-900" }: CarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      breakpoints: {
        "(max-width: 768px)": { align: "start" },
      },
    },
    [
      Autoplay({
        delay: 2600,
        jump: false,
        playOnInit: true,
        stopOnInteraction: false,
        stopOnMouseEnter: false,
        stopOnFocusIn: false,
      }),
    ],
  );

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <div className="relative">
      {title ? (
        <h2 className={`mb-8 text-center font-display text-2xl font-bold lg:text-left ${titleClassName}`}>
          {title}
        </h2>
      ) : null}
      <div className="embla overflow-hidden" ref={emblaRef}>
        <div className="embla__container flex -ml-4 lg:-ml-6">
          {slides.map((slide, index) => (
            <Link
              key={index}
              href={slide.href}
              className={`p-3 ${variant === "logo" ? "flex-[0_0_82%] sm:flex-[0_0_50%] lg:flex-[0_0_25%] lg:p-5" : "flex-[0_0_86%] sm:flex-[0_0_70%] lg:flex-[0_0_33.333%] lg:p-6"}`}
            >
              <div
                className={
                variant === "logo"
                    ? "group flex h-44 cursor-pointer flex-col justify-between rounded-[1.5rem] border border-[#d4a11d]/18 bg-[#faf7ee]/95 p-3 shadow-[0_14px_32px_rgba(15,23,42,0.08)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,0.12)] sm:h-48"
                    : "group relative h-64 cursor-pointer overflow-hidden rounded-[1.75rem] border border-slate-100 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.12)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(15,23,42,0.16)] sm:h-72 lg:h-80"
                }
              >
                {variant === "logo" ? (
                  <>
                    <div className="grid flex-1 place-items-center overflow-hidden rounded-[1.25rem] border border-slate-100 bg-white px-4 py-5">
                      <Image
                        src={slide.img}
                        alt={slide.title}
                        width={220}
                        height={120}
                        className="h-14 w-auto max-w-full object-contain transition-transform duration-700 group-hover:scale-105 sm:h-20"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-3 pt-3">
                      <h3 className="font-display text-base font-bold text-slate-900 sm:text-lg">
                        {slide.title}
                      </h3>
                      <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#5ab214] sm:text-sm">
                        Explore <span aria-hidden="true">&rarr;</span>
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                   <img
                      src={slide.img}
                      alt={slide.title}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/desktop.jpg";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                    <div className="relative flex h-full flex-col justify-end p-5 sm:p-6 lg:p-8">
                      <h3 className="mb-2 max-w-[85%] font-display text-xl font-bold text-white drop-shadow-2xl sm:text-2xl">
                        {slide.title}
                      </h3>
                      <p className="mb-3 text-sm font-semibold text-emerald-400 drop-shadow-xl sm:text-base lg:text-lg">
                        Explore &rarr;
                      </p>
                    </div>
                  </>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
      <button
        type="button"
        onClick={scrollPrev}
        className="absolute left-0 top-1/2 z-10 hidden h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/90 shadow-2xl backdrop-blur transition-all hover:shadow-3xl md:grid lg:h-14 lg:w-14"
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
        className="absolute right-0 top-1/2 z-10 hidden h-12 w-12 translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/90 shadow-2xl backdrop-blur transition-all hover:shadow-3xl md:grid lg:h-14 lg:w-14"
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
