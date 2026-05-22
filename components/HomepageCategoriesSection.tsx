"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import FallbackImage from "./FallbackImage";
import { zowkinsApi, type CategoryListItem } from "../lib/zowkins-api";
import { resolveImageSource } from "../lib/media";
import { formatDisplayName } from "../lib/display-name";

export default function HomepageCategoriesSection() {
  const [categories, setCategories] = useState<CategoryListItem[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    let alive = true;

    async function loadCategories() {
      setIsLoading(true);
      try {
        const response = await zowkinsApi.listCategories({ page: 1, limit: 12 });
        if (!alive) return;
        setCategories(response?.categories ?? []);
        setErrorMessage("");
      } catch (error) {
        if (!alive) return;
        console.error("Failed to load homepage categories:", error);
        setCategories([]);
        setErrorMessage(
          "We could not load categories right now. Please try again shortly.",
        );
      } finally {
        if (!alive) return;
        setIsLoading(false);
      }
    }

    void loadCategories();

    return () => {
      alive = false;
    };
  }, []);

  const updateScrollState = () => {
    const el = carouselRef.current;
    if (!el) return;
    const maxScrollLeft = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < maxScrollLeft - 4);
  };

  useEffect(() => {
    updateScrollState();
    const el = carouselRef.current;
    if (!el) return;

    const handleResize = () => updateScrollState();
    window.addEventListener("resize", handleResize);
    const raf = window.requestAnimationFrame(() => updateScrollState());

    return () => {
      window.removeEventListener("resize", handleResize);
      window.cancelAnimationFrame(raf);
    };
  }, [categories.length]);

  const scrollByAmount = (direction: "left" | "right") => {
    const el = carouselRef.current;
    if (!el) return;
    const amount = Math.max(240, Math.floor(el.clientWidth * 0.85));
    el.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-16">
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-white/55">
          Categories
        </p>
        <h2 className="mt-2 font-display text-3xl font-bold text-white md:text-4xl">
          Browse by category
        </h2>
      </div>

      {errorMessage ? (
        <div className="mx-auto mt-8 rounded-[1.5rem] border border-amber-200/20 bg-amber-950/30 p-8 text-center text-sm text-amber-100">
          {errorMessage}
        </div>
      ) : isLoading ? (
        <div className="mx-auto mt-8 rounded-[1.5rem] border border-white/10 bg-white/5 p-8 text-center text-sm text-slate-300">
          Loading categories…
        </div>
      ) : categories.length > 0 ? (
        <div className="mx-auto mt-5 max-w-6xl md:mt-6">
          <div className="relative">
            <div
              ref={carouselRef}
              onScroll={updateScrollState}
              className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-4 md:gap-6"
            >
            {categories.map((card) => (
              <Link
                key={card.id}
                href={`/categories/${card.slug}`}
                className="group w-[12.75rem] shrink-0 snap-start overflow-hidden rounded-[1.4rem] border border-white/10 bg-[#0a1020] shadow-[0_14px_30px_rgba(0,0,0,0.28)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.34)] sm:w-[16.5rem] md:w-[20rem]"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 sm:aspect-[4/3]">
                  <FallbackImage
                    src={resolveImageSource(card.image, "/desktop.jpg")}
                    alt={card.name}
                    className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    loading="lazy"
                    fetchPriority="low"
                  />
                </div>
                <div className="p-4 text-center sm:p-5">
                  <h3 className="font-display text-base font-bold text-white sm:text-lg">
                    {formatDisplayName(card.name, card.name)}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-300 sm:text-sm sm:leading-6">
                    {card.description}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-[#f3c74d] sm:mt-4 sm:text-sm">
                    View More <span aria-hidden="true">&rarr;</span>
                  </span>
                </div>
              </Link>
            ))}
            </div>

            <div className="pointer-events-none absolute inset-y-0 left-0 hidden items-center md:flex">
              <button
                type="button"
                onClick={() => scrollByAmount("left")}
                aria-label="Scroll categories left"
                disabled={!canScrollLeft}
                className="pointer-events-auto ml-2 grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-[#050b16]/75 text-white shadow-[0_14px_30px_rgba(0,0,0,0.3)] backdrop-blur transition hover:border-[#f3c74d]/40 hover:bg-[#050b16]/85 disabled:opacity-40"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            <div className="pointer-events-none absolute inset-y-0 right-0 hidden items-center md:flex">
              <button
                type="button"
                onClick={() => scrollByAmount("right")}
                aria-label="Scroll categories right"
                disabled={!canScrollRight}
                className="pointer-events-auto mr-2 grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-[#050b16]/75 text-white shadow-[0_14px_30px_rgba(0,0,0,0.3)] backdrop-blur transition hover:border-[#f3c74d]/40 hover:bg-[#050b16]/85 disabled:opacity-40"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mx-auto mt-8 rounded-[1.5rem] border border-dashed border-white/15 bg-[#0a1020] p-8 text-center text-sm text-slate-300">
          No categories available yet. Categories will appear here as soon as
          they are published.
        </div>
      )}
    </section>
  );
}
