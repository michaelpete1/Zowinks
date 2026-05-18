import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "../../components/NewNavbar";
import FallbackImage from "../../components/FallbackImage";
import { ApiError, zowkinsApi } from "../../lib/zowkins-api";
import { resolveImageSource } from "../../lib/media";
import { formatDisplayName } from "../../lib/display-name";

export const metadata: Metadata = {
  title: "Categories",
  description:
    "Browse visible categories and open a category to view its products.",
};

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  let categoriesList: any[] = [];
  try {
    const response = await zowkinsApi.listCategories({ page: 1, limit: 12 });
    categoriesList = response?.categories || [];
    console.log(
      "Categories data:",
      categoriesList.map((c) => ({ name: c.name, image: c.image })),
    );
  } catch (error) {
    console.error("Error loading categories:", error);
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#050b16_0%,#07142a_48%,#0b1d3b_100%)] text-slate-100">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-10 md:px-8 md:py-14">
        <section className="rounded-[2rem] border border-white/10 bg-[#0a1020] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.22)] sm:p-6 md:p-10">
          <p className="text-xs uppercase tracking-[0.35em] text-white/55">
            Categories
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl md:text-5xl">
            Browse visible categories
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
            Open a category to see its subcategories and products from the API.
          </p>
        </section>
        <section className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {categoriesList.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="group overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#0a1020] shadow-[0_16px_40px_rgba(0,0,0,0.18)] transition hover:-translate-y-1 sm:rounded-[1.75rem]"
            >
              <div className="relative h-40 bg-slate-900 sm:h-48 md:h-64 lg:h-72">
                <FallbackImage
                  src={resolveImageSource(category.image, "/desktop.jpg")}
                  alt={category.name}
                  className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>
              <div className="space-y-3 p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-white sm:text-xs">
                    {category.visible ? "Visible" : "Hidden"}
                  </span>
                  <span className="text-xs font-semibold text-[#f3c74d] sm:text-sm">
                    {category.productsCount} products
                  </span>
                </div>
                <div>
                  <h2 className="font-display text-lg font-semibold text-white sm:text-xl">
                    {formatDisplayName(category.name, category.name)}
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-300">
                    {category.description}
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400 sm:text-sm">
                  <span>{category.subcategories.length} subcategories</span>
                  <span>Browse details</span>
                </div>
              </div>
            </Link>
          ))}
        </section>
      </main>
    </div>
  );
}
