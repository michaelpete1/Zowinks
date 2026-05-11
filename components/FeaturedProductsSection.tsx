import FeaturedProductsCarousel from "./FeaturedProductsCarousel";
import { fetchFeaturedProducts } from "../lib/catalog";

export default async function FeaturedProductsSection() {
  const featured = await fetchFeaturedProducts(6);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-16">
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-white/55">
          New products
        </p>
        <h2 className="mt-2 font-display text-2xl font-bold text-white md:text-4xl">
          Fresh picks for modern teams
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
          Explore the latest products from our catalog.
        </p>
      </div>

      {featured.length > 0 ? (
        <FeaturedProductsCarousel featured={featured} />
      ) : (
        <div className="mx-auto mt-8 rounded-[1.5rem] border border-dashed border-white/15 bg-[#0a1020] p-8 text-center text-sm text-slate-300">
          No products available yet. Products will appear here when added
          through the admin.
        </div>
      )}
    </section>
  );
}
