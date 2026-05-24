"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { type EmblaOptionsType } from "embla-carousel";
import Autoplay from "embla-carousel-autoplay";
import { DEFAULT_HERO_IMAGES } from "../lib/hero-images";
import { zowkinsApi } from "../lib/zowkins-api";
import { resolveImageSource } from "../lib/media";
import FallbackImage from "./FallbackImage";

interface HeroSlide {
  img: string;
  title: string;
  subtitle: string;
  cta1: string;
  cta1Href: string;
  cta2: string;
  cta2Href: string;
  eyebrow: string;
  focalPosition: string;
  overlayStrength: string;
}

type HeroImageSource = string | { url?: string | null } | null | undefined;

const heroTemplates: Omit<HeroSlide, "img">[] = [
  {
    title: "Smart IT Solutions",
    subtitle: "for businesses and professionals",
    cta1: "Shop Products",
    cta1Href: "/products",
    cta2: "Request a Quote",
    cta2Href: "/request-quote",
    eyebrow: "Featured Collection",
    focalPosition: "center 36%",
    overlayStrength: "from-black/70 via-black/42 to-black/70",
  },
  {
    title: "Reliable Tech Procurement",
    subtitle: "laptops, desktops, and accessories",
    cta1: "View Categories",
    cta1Href: "/categories",
    cta2: "Get Quote",
    cta2Href: "/full-quote-bill",
    eyebrow: "Business Essentials",
    focalPosition: "center 48%",
    overlayStrength: "from-black/66 via-black/38 to-black/66",
  },
  {
    title: "Fast Support & Delivery",
    subtitle: "for growing teams and urgent orders",
    cta1: "Shop Now",
    cta1Href: "/products",
    cta2: "Contact Us",
    cta2Href: "/request-quote",
    eyebrow: "Quick Turnaround",
    focalPosition: "center 42%",
    overlayStrength: "from-black/62 via-black/34 to-black/62",
  },
];

const options: EmblaOptionsType = {
  loop: true,
  align: "start",
};

interface HeroCarouselProps {
  initialHeroImages?: HeroImageSource[];
}

export default function HeroCarousel({ initialHeroImages }: HeroCarouselProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const normalizeHeroImages = (input: unknown): HeroImageSource[] => {
    if (input == null || !Array.isArray(input)) return [];
    return input
      .map((img) => (typeof img === "string" ? img : img))
      .filter((img): img is HeroImageSource => Boolean(img));
  };

  const [heroImages, setHeroImages] = useState<HeroImageSource[]>(() =>
    normalizeHeroImages(initialHeroImages),
  );
  const [isMounted, setIsMounted] = useState(false);
  const [emblaRef, emblaApi] = useEmblaCarousel(options, [
    Autoplay({ delay: 5000 }),
  ]);

  useEffect(() => {
    setIsMounted(true);

    const fetchHero = async () => {
      try {
        const response = await zowkinsApi.getApp();
        const app = (
          response as {
            app?: { heroImages?: HeroImageSource[]; images?: HeroImageSource[] };
          }
        ).app;
        const normalized = normalizeHeroImages(app?.heroImages || app?.images);
        if (normalized.length > 0) {
          setHeroImages(normalized);
        }
      } catch (error) {
        console.error("Failed to fetch hero image:", error);
      }
    };

    fetchHero();
  }, []);

  const heroSlides = useMemo(() => {
    return heroTemplates.map((slide, index) => {
      const customImg = heroImages[index];
      const defaultImg = DEFAULT_HERO_IMAGES[index] || DEFAULT_HERO_IMAGES[0];
      return {
        ...slide,
        img: resolveImageSource(customImg, defaultImg),
      };
    });
  }, [heroImages]);

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

  if (!isMounted) {
    // Return a simplified version during SSR to match initial HTML
    return (
      <div className="relative overflow-hidden bg-slate-900 min-h-[82svh] md:h-screen">
        <div className="absolute inset-0">
          <FallbackImage
            src={heroSlides[0].img}
            alt={heroSlides[0].title}
            fallbackSrc={DEFAULT_HERO_IMAGES[0]}
            className="absolute inset-0 h-full w-full object-cover object-[center_36%] brightness-[0.86] contrast-[1.03] saturate-[1.08]"
            priority
            fetchPriority="high"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="embla relative overflow-hidden" ref={emblaRef}>
      <div className="embla__container flex min-h-[82svh] md:h-screen">
        {heroSlides.map((slide, index) => (
          <section key={index} className="relative flex-[0_0_100%]">
            <div className="absolute inset-0">
              {slide.img ? (
                <FallbackImage
                  src={slide.img}
                  alt={slide.title}
                  fallbackSrc={
                    DEFAULT_HERO_IMAGES[index] || DEFAULT_HERO_IMAGES[0]
                  }
                  className="absolute inset-0 h-full w-full object-cover brightness-[0.86] contrast-[1.03] saturate-[1.08] scale-[1.01]"
                  style={
                    {
                      objectPosition: slide.focalPosition,
                    } as React.CSSProperties
                  }
                  priority={index === 0}
                  fetchPriority={index === 0 ? "high" : "low"}
                  loading={index === 0 ? "eager" : "lazy"}
                />
              ) : (
                <div className="h-full w-full bg-slate-900" />
              )}
              <div
                className={`absolute inset-0 bg-gradient-to-r ${slide.overlayStrength}`}
              />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.14),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(243,199,77,0.10),transparent_22%)]" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/45" />
            </div>
            <div className="relative z-10 flex h-full items-center px-4 py-16 sm:py-20 md:px-8 md:py-24 lg:px-12 xl:px-16">
              <div className="max-w-2xl space-y-5 rounded-[2rem] border border-white/12 bg-[#050b16]/52 px-5 py-6 shadow-[0_22px_70px_rgba(0,0,0,0.3)] backdrop-blur-md animate-[fadeIn_0.9s_ease-out] sm:space-y-6 sm:px-7 sm:py-7 md:px-8 md:py-8">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#f3c74d] drop-shadow-[0_2px_4px_rgba(0,0,0,0.55)] md:text-sm">
                  {slide.eyebrow}
                </p>
                <h1 className="font-display text-3xl font-bold leading-tight text-white drop-shadow-[0_4px_18px_rgba(0,0,0,0.7)] sm:text-4xl md:text-5xl lg:text-6xl">
                  {slide.title}
                  <span className="block">{slide.subtitle}</span>
                </h1>
                <p className="max-w-xl text-sm leading-6 text-white/95 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] sm:text-base sm:leading-7 md:text-lg">
                  Premium IT procurement for business teams.
                </p>
                <p className="text-xs text-white/85 drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)] sm:text-sm">
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
