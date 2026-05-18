"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { type EmblaOptionsType } from "embla-carousel";
import Autoplay from "embla-carousel-autoplay";
import { DEFAULT_HERO_IMAGES } from "../lib/hero-images";

interface HeroSlide {
  img: string;
  title: string;
  subtitle: string;
  cta1: string;
  cta1Href: string;
  cta2: string;
  cta2Href: string;
}

const heroTemplates: Omit<HeroSlide, "img">[] = [
  {
    title: "Smart IT Solutions",
    subtitle: "for businesses and professionals",
    cta1: "Shop Products",
    cta1Href: "/products",
    cta2: "Request a Quote",
    cta2Href: "/request-quote",
  },
  {
    title: "Reliable Tech Procurement",
    subtitle: "laptops, desktops, and accessories",
    cta1: "View Categories",
    cta1Href: "/categories",
    cta2: "Get Quote",
    cta2Href: "/full-quote-bill",
  },
  {
    title: "Fast Support & Delivery",
    subtitle: "for growing teams and urgent orders",
    cta1: "Shop Now",
    cta1Href: "/products",
    cta2: "Contact Us",
    cta2Href: "/request-quote",
  },
];

const options: EmblaOptionsType = {
  loop: true,
  align: "start",
};

export default function HeroCarousel() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel(options, [
    Autoplay({ delay: 5000 }),
  ]);

  const heroSlides = useMemo(() => {
    return heroTemplates.map((slide, index) => ({
      ...slide,
      img:
        DEFAULT_HERO_IMAGES[index] ||
        DEFAULT_HERO_IMAGES[index % DEFAULT_HERO_IMAGES.length],
    }));
  }, []);

  const scrollTo = useCallback(
    (index: number) => {
      emblaApi?.scrollTo(index);
    },
    [emblaApi],
  );

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    onSelect();

    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  return (
    <div className="embla relative overflow-hidden" ref={emblaRef}>
      <div className="embla__container flex min-h-[82svh] md:h-screen">
        {heroSlides.map((slide, index) => (
          <section key={index} className="relative flex-[0_0_100%]">
            <div className="absolute inset-0">
              <Image
                src={slide.img}
                alt={slide.title}
                fill
                sizes="100vw"
                priority={index === 0}
                className="object-cover object-center brightness-[0.68] contrast-[1.15] saturate-[1.08] scale-[1.02]"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/90" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.10),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(243,199,77,0.16),transparent_26%)]" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50" />
            </div>
            <div className="relative z-10 flex h-full items-center px-4 py-16 sm:py-20 md:px-8 md:py-24 lg:px-12 xl:px-16">
              <div className="max-w-2xl space-y-5 animate-[fadeIn_0.9s_ease-out] sm:space-y-6">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/80 md:text-sm">
                  Zowkins Enterprise
                </p>
                <h1 className="font-display text-3xl font-bold leading-tight text-white drop-shadow-2xl sm:text-4xl md:text-5xl lg:text-6xl">
                  {slide.title}
                  <span className="block">{slide.subtitle}</span>
                </h1>
                <p className="max-w-xl text-sm leading-6 text-white/90 sm:text-base sm:leading-7 md:text-lg">
                  Premium IT procurement for business teams.
                </p>
                <p className="text-xs text-white/75 sm:text-sm">
                  Rated 4.9/5 for service.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href={slide.cta1Href}
                    className="rounded-lg bg-slate-900/80 px-5 py-3 text-sm font-semibold text-white shadow-[0_0_28px_rgba(11,29,59,0.22)] transition hover:bg-slate-800 backdrop-blur-sm sm:px-6"
                  >
                    {slide.cta1}
                  </Link>
                  <Link
                    href={slide.cta2Href}
                    className="rounded-lg bg-yellow-400/90 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-yellow-400/20 transition hover:bg-yellow-300 backdrop-blur-sm sm:px-6"
                  >
                    {slide.cta2}
                  </Link>
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>

      <div className="absolute left-1/2 bottom-5 z-20 flex -translate-x-1/2 items-center gap-2.5 rounded-full bg-black/30 px-3 py-2 backdrop-blur-sm sm:bottom-8 sm:gap-3">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => scrollTo(index)}
            className={`h-3 w-3 rounded-full border transition focus:outline-none focus:ring-2 focus:ring-yellow-400 sm:h-3.5 sm:w-3.5 ${
              selectedIndex === index
                ? "border-yellow-400 bg-yellow-400 shadow-[0_0_18px_rgba(250,204,21,0.55)]"
                : "border-white/25 bg-white/30 hover:bg-white/50"
            }`}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={selectedIndex === index ? "true" : "false"}
          >
            <span className="sr-only">{`Go to slide ${index + 1}`}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
