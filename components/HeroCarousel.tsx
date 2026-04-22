"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { type EmblaOptionsType } from "embla-carousel";
import Autoplay from "embla-carousel-autoplay";

interface HeroSlide {
  img: string;
  title: string;
  subtitle: string;
  cta1: string;
  cta1Href: string;
  cta2: string;
  cta2Href: string;
}

const heroSlides: HeroSlide[] = [
  {
    img: "/heroimage1.jpg",
    title: "Empowering Your Business",
    subtitle: "with Innovative IT Solutions",
    cta1: "Explore Products",
    cta1Href: "/products",
    cta2: "Request a Quote",
    cta2Href: "/contact",
  },
  {
    img: "/heroimage2.jpg",
    title: "Premium IT Procurement",
    subtitle: "Trusted suppliers for modern teams",
    cta1: "View Categories",
    cta1Href: "/categories",
    cta2: "Get Quote",
    cta2Href: "/full-quote-bill",
  },
  {
    img: "/desktop.jpg",
    title: "Business Technology Solutions",
    subtitle: "Laptops, Desktops & Accessories",
    cta1: "Shop Now",
    cta1Href: "/products",
    cta2: "Contact Us",
    cta2Href: "/contact",
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
      <div className="embla__container flex h-screen">
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
            <div className="relative z-10 flex h-full items-center px-4 py-20 md:px-8 md:py-24 lg:px-12 xl:px-16">
              <div className="max-w-2xl space-y-6 animate-[fadeIn_0.9s_ease-out]">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/80 md:text-sm">
                  Zowkins Enterprise
                </p>
                <h1 className="font-display text-4xl font-bold leading-tight text-white drop-shadow-2xl md:text-5xl lg:text-6xl">
                  {slide.title}
                  <span className="block">{slide.subtitle}</span>
                </h1>
                <p className="max-w-xl text-base leading-7 text-white/95 md:text-lg">
                  Premium IT procurement for business teams.
                </p>
                <p className="text-sm text-white/80">
                  Rated 4.9/5 for service.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href={slide.cta1Href}
                    className="rounded-lg bg-slate-900/80 px-6 py-3 text-sm font-semibold text-white shadow-[0_0_28px_rgba(11,29,59,0.22)] transition hover:bg-slate-800 backdrop-blur-sm"
                  >
                    {slide.cta1}
                  </Link>
                  <Link
                    href={slide.cta2Href}
                    className="rounded-lg bg-yellow-400/90 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-yellow-400/20 transition hover:bg-yellow-300 backdrop-blur-sm"
                  >
                    {slide.cta2}
                  </Link>
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>

      <div className="absolute left-1/2 bottom-8 z-20 flex -translate-x-1/2 items-center gap-3 rounded-full bg-black/30 px-3 py-2 backdrop-blur-sm">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => scrollTo(index)}
            className={`h-10 w-10 rounded-full border border-white/15 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-yellow-400 ${
              selectedIndex === index
                ? "bg-yellow-400 text-slate-950 shadow-lg shadow-yellow-400/20"
                : "bg-white/10 text-white/80 hover:bg-white/20"
            }`}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={selectedIndex === index ? "true" : "false"}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
