import Link from "next/link";
import FallbackImage from "./FallbackImage";
import { zowkinsApi, type CategoryListItem } from "../lib/zowkins-api";
import { resolveImageSource } from "../lib/media";

export default async function HomepageCategoriesSection() {
  let categories: CategoryListItem[] = [];
  let errorMessage = "";

  try {
    const response = await zowkinsApi.listCategories({ page: 1, limit: 12 });
    categories = response?.categories ?? [];
  } catch (error) {
    console.error("Failed to load homepage categories:", error);
    errorMessage =
      "We could not load categories right now. Please try again shortly.";
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 md:px-8 md:py-16">
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
      ) : categories.length > 0 ? (
        <div className="mx-auto mt-6 max-w-6xl">
          <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-6">
            {categories.map((card) => (
              <Link
                key={card.id}
                href={`/categories/${card.slug}`}
                className="group w-[14.25rem] shrink-0 snap-start overflow-hidden rounded-[1.4rem] border border-white/10 bg-[#0a1020] shadow-[0_14px_30px_rgba(0,0,0,0.28)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.34)] sm:w-[18rem] md:w-[22rem]"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 sm:aspect-[4/3]">
                  <FallbackImage
                    src={resolveImageSource(card.image, "/desktop.jpg")}
                    alt={card.name}
                    className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-4 text-center sm:p-5">
                  <h3 className="font-display text-base font-bold text-white sm:text-lg">
                    {card.name}
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
        </div>
      ) : (
        <div className="mx-auto mt-8 rounded-[1.5rem] border border-dashed border-white/15 bg-[#0a1020] p-8 text-center text-sm text-slate-300">
          No categories available yet. Categories will appear here when added through the admin.
        </div>
      )}
    </section>
  );
}
