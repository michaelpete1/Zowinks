"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import FallbackImage from "./FallbackImage";
import { zowkinsApi, type CategoryListItem } from "../lib/zowkins-api";
import { resolveImageSource } from "../lib/media";

export default function HomepageCategoriesSection() {
  const [categories, setCategories] = useState<CategoryListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadCategories = async () => {
      try {
        const response = await zowkinsApi.listCategories({ page: 1, limit: 12 });
        if (!cancelled) {
          setCategories(response?.categories ?? []);
        }
      } catch {
        if (!cancelled) {
          setCategories([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 md:px-8 md:py-16">
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-white/55">
          Our Products
        </p>
        <h2 className="mt-2 font-display text-3xl font-bold text-white md:text-4xl">
          High-Quality Technology for Your Business
        </h2>
      </div>

      {loading ? (
        <div className="mx-auto mt-8 rounded-[1.5rem] border border-dashed border-white/15 bg-[#0a1020] p-8 text-center text-sm text-slate-300">
          Loading categories...
        </div>
      ) : categories.length > 0 ? (
        <div className="mx-auto mt-8 grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((card) => (
            <Link
              key={card.id}
              href={`/categories/${card.slug}`}
              className="group mx-auto w-full max-w-[22rem] overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#0a1020] shadow-[0_14px_30px_rgba(0,0,0,0.28)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.34)]"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                <FallbackImage
                  src={resolveImageSource(card.image, "/desktop.jpg")}
                  alt={card.name}
                  className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-5 text-center">
                <h3 className="font-display text-lg font-bold text-white">
                  {card.name}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {card.description}
                </p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#f3c74d]">
                  View More <span aria-hidden="true">&rarr;</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mx-auto mt-8 rounded-[1.5rem] border border-dashed border-white/15 bg-[#0a1020] p-8 text-center text-sm text-slate-300">
          No categories available yet. Categories will appear here when added through the admin.
        </div>
      )}
    </section>
  );
}
