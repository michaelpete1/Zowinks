"use client";

import { useMemo } from "react";
import Image from "next/image";
import AddToCartButton from "./AddToCartButton";
import { useCatalog } from "../hooks/useCatalog";

export default function FeaturedProductsSection() {
  const products = useCatalog((state) => state.products);
  const featured = useMemo(
    () => products.filter((product) => product.featured && product.visibility === "Visible"),
    [products],
  );
  const featuredLaptops = useMemo(
    () => featured.filter((product) => product.category === "Laptops"),
    [featured],
  );
  const featuredDesktops = useMemo(
    () => featured.filter((product) => product.category === "Desktops"),
    [featured],
  );

  const collections = [
    {
      title: "Featured Laptops",
      description: "Products marked as featured in admin will appear here.",
      items: featuredLaptops,
      emptyState: "No featured laptops selected in admin yet.",
    },
    {
      title: "Featured Desktops",
      description: "Keep desktop picks visible by marking them featured in admin.",
      items: featuredDesktops,
      emptyState: "No featured desktops selected in admin yet.",
    },
  ] as const;

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 md:px-8 md:py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
            Featured products
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold text-slate-900 md:text-4xl">
            Best picks for modern teams
          </h2>
        </div>
      </div>

      {featured.length ? (
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {collections.map((collection) => (
            <article
              key={collection.title}
              className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_12px_30px_rgba(15,23,42,0.08)]"
            >
              <div className="border-b border-slate-100 px-5 py-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  Homepage spotlight
                </p>
                <h3 className="mt-1 font-display text-2xl font-bold text-slate-900">
                  {collection.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {collection.description}
                </p>
              </div>

              {collection.items.length ? (
                <>
                  <div className="flex gap-4 overflow-x-auto px-5 py-5 md:hidden">
                    {collection.items.map((item) => (
                      <div
                        key={item.id}
                        className="group w-[82%] shrink-0 overflow-hidden rounded-[1.4rem] border border-slate-200 bg-slate-50 shadow-[0_10px_24px_rgba(15,23,42,0.06)]"
                      >
                        <div className="relative h-48 overflow-hidden bg-white">
                          <Image
                            src={item.image || "/desktop.jpg"}
                            alt={item.name}
                            fill
                            className="object-cover transition duration-500 group-hover:scale-105"
                          />
                        </div>
                        <div className="space-y-2 p-4">
                          <div>
                            <h4 className="font-display text-base font-bold text-slate-900">
                              {item.brand} {item.name}
                            </h4>
                            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                              {item.category}
                            </p>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-sm font-semibold text-slate-900">
                              {item.price}
                            </span>
                            <AddToCartButton
                              item={{
                                id: item.id,
                                title: `${item.brand} ${item.name}`,
                                price: item.price,
                                spec: item.category,
                                image: item.image,
                              }}
                              className="rounded-full border border-slate-200 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] transition hover:border-slate-900"
                            >
                              Order Now
                            </AddToCartButton>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="hidden gap-4 px-5 py-5 md:grid sm:grid-cols-2">
                    {collection.items.map((item) => (
                      <div
                        key={item.id}
                        className="group overflow-hidden rounded-[1.4rem] border border-slate-200 bg-slate-50 shadow-[0_10px_24px_rgba(15,23,42,0.06)]"
                      >
                        <div className="relative h-48 overflow-hidden bg-white">
                          <Image
                            src={item.image || "/desktop.jpg"}
                            alt={item.name}
                            fill
                            className="object-cover transition duration-500 group-hover:scale-105"
                          />
                        </div>
                        <div className="space-y-2 p-4">
                          <div>
                            <h4 className="font-display text-lg font-bold text-slate-900">
                              {item.brand} {item.name}
                            </h4>
                            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                              {item.category}
                            </p>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-sm font-semibold text-slate-900">
                              {item.price}
                            </span>
                            <AddToCartButton
                              item={{
                                id: item.id,
                                title: `${item.brand} ${item.name}`,
                                price: item.price,
                                spec: item.category,
                                image: item.image,
                              }}
                              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] transition hover:border-slate-900"
                            >
                              Order Now
                            </AddToCartButton>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="px-5 py-8 text-sm text-slate-600">
                  {collection.emptyState}
                </div>
              )}
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-[1.5rem] border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">
          No featured products selected. Open admin products and mark products as featured.
        </div>
      )}
    </section>
  );
}
