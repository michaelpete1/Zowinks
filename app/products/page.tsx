import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "../../components/NewNavbar";
import FallbackImage from "../../components/FallbackImage";
import { fetchAllProducts } from "../../lib/catalog";
import { zowkinsApi } from "../../lib/zowkins-api";

export const metadata: Metadata = {
  title: "Products",
  description:
    "Browse business laptops, desktops, accessories, and product collections from Zowkins Enterprise.",
};

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const [products, categoriesResponse] = await Promise.all([
    fetchAllProducts(),
    zowkinsApi.listCategories({ page: 1, limit: 12 }).catch(() => null),
  ]);

  const categories = categoriesResponse?.categories ?? [];
  const visibleProducts = products.filter(Boolean);

  const grouped = visibleProducts.reduce<Record<string, typeof visibleProducts>>(
    (acc, product) => {
      const key = product.category || "Other";
      acc[key] = acc[key] || [];
      acc[key].push(product);
      return acc;
    },
    {},
  );

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#050b16_0%,#07142a_48%,#0b1d3b_100%)] text-slate-100">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
        <section className="overflow-hidden rounded-[2.2rem] border border-white/10 bg-[#0a1020] shadow-[0_24px_70px_rgba(0,0,0,0.26)]">
          <div className="grid gap-8 px-6 py-10 md:px-10 lg:grid-cols-[1.15fr_0.85fr] lg:px-14 lg:py-14">
            <div className="space-y-6">
              <p className="text-xs uppercase tracking-[0.35em] text-white/55">
                Product catalog
              </p>
              <h1 className="font-display text-4xl font-bold leading-tight text-white md:text-5xl">
                Browse products by category, brand, and use case.
              </h1>
              <p className="max-w-2xl text-lg leading-7 text-slate-300">
                Use this page to explore the full product lineup. If you want a
                brand family, head into Laptops or Desktops. If you want the
                full catalog, stay here.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/categories"
                  className="rounded-full bg-[#f3c74d] px-6 py-3 text-sm font-semibold text-[#050b16] transition hover:bg-[#e4b935]"
                >
                  Browse categories
                </Link>
                <Link
                  href="/laptops"
                  className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:border-[#f3c74d]/45 hover:bg-white/10"
                >
                  Browse laptop families
                </Link>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/55">
                  Products
                </p>
                <p className="mt-2 text-3xl font-bold text-white">
                  {visibleProducts.length}
                </p>
              </div>
              <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/55">
                  Categories
                </p>
                <p className="mt-2 text-3xl font-bold text-white">
                  {categories.length}
                </p>
              </div>
              <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/55">
                  Focus
                </p>
                <p className="mt-2 text-lg font-semibold text-white">
                  One catalog, multiple routes
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/55">
                Quick links
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold text-white">
                Start with a category or jump straight into a product.
              </h2>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-[#f3c74d]/45 hover:bg-white/10"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-12 space-y-10">
          {Object.entries(grouped).map(([categoryName, items]) => (
            <div key={categoryName}>
              <div className="mb-6 flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-white/55">
                    {categoryName}
                  </p>
                  <h3 className="mt-2 font-display text-2xl font-bold text-white">
                    {items.length} products available
                  </h3>
                </div>
                <Link
                  href="/categories"
                  className="text-sm font-semibold text-[#f3c74d] hover:underline"
                >
                  View categories
                </Link>
              </div>

              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {items.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="group overflow-hidden rounded-[1.8rem] border border-white/10 bg-[#0a1020] shadow-[0_16px_40px_rgba(0,0,0,0.18)] transition hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,0.24)]"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-slate-900">
                      <FallbackImage
                        src={item.image}
                        alt={item.title}
                        className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,11,22,0.06)_0%,rgba(5,11,22,0.72)_100%)]" />
                    </div>
                    <div className="space-y-3 p-5">
                      <div className="flex items-center justify-between gap-3">
                        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                          {item.brand}
                        </span>
                        <span className="text-sm font-semibold text-[#f3c74d]">
                          {item.price}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-display text-lg font-bold text-white">
                          {item.title}
                        </h4>
                        <p className="mt-2 text-sm leading-6 text-slate-300">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
