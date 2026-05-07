"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import FallbackImage from "./FallbackImage";
import AddToCartButton from "./AddToCartButton";
import { fetchAllProducts, type CatalogItem } from "../lib/catalog";

export default function FeaturedProductsSection() {
  const [featured, setFeatured] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
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
    let cancelled = false;

    const loadProducts = async () => {
      try {
        const allProducts = await fetchAllProducts();
        if (!cancelled) {
          setFeatured(allProducts.slice(0, 6));
        }
      } catch {
        if (!cancelled) {
          setFeatured([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadProducts();

    return () => {
      cancelled = true;
    };
  }, []);

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
    <section className="mx-auto max-w-7xl px-4 py-14 md:px-8 md:py-16">
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-white/55">
          New products
        </p>
        <h2 className="mt-2 font-display text-3xl font-bold text-white md:text-4xl">
          Fresh picks for modern teams
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
          Explore the latest products from our catalog.
        </p>
      </div>

      {loading ? (
        <div className="mx-auto mt-8 rounded-[1.5rem] border border-dashed border-white/15 bg-[#0a1020] p-8 text-center text-sm text-slate-300">
          Loading products...
        </div>
      ) : featured.length > 0 ? (
        <div className="relative mx-auto mt-8">
          <div className="embla overflow-hidden" ref={emblaRef}>
            <div className="embla__container flex -ml-4 lg:-ml-6">
              {featured.map((item) => (
                <div
                  key={item.id}
                  className="flex-[0_0_86%] pl-4 sm:flex-[0_0_70%] md:flex-[0_0_48%] lg:flex-[0_0_33.333%] lg:pl-6"
                >
                  <article className="group h-full overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#0a1020] shadow-[0_14px_30px_rgba(0,0,0,0.28)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.34)]">
                    <div className="relative aspect-[4/3] overflow-hidden bg-[#0b1220]">
                      <FallbackImage
                        src={item.image || "/desktop.jpg"}
                        alt={item.title}
                        className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="space-y-3 p-5 text-center">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#f3c74d]">
                          {item.category}
                        </p>
                        <h3 className="mt-2 font-display text-lg font-bold text-white">
                          {item.title}
                        </h3>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-semibold text-white">
                          {item.price}
                        </span>
                        <AddToCartButton
                          item={{
                            id: item.id,
                            slug: item.slug,
                            title: item.title,
                            price: item.price,
                            spec: item.category,
                            image: item.image,
                          }}
                          className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white transition hover:border-[#f3c74d]/45 hover:bg-white/10"
                        >
                          Order Now
                        </AddToCartButton>
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
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
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
      ) : (
        <div className="mx-auto mt-8 rounded-[1.5rem] border border-dashed border-white/15 bg-[#0a1020] p-8 text-center text-sm text-slate-300">
          No products available yet. Products will appear here when added
          through the admin.
        </div>
      )}
    </section>
  );
}
