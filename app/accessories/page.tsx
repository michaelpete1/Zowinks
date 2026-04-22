import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Navbar from "../../components/NewNavbar";
import InfoStrip from "../../components/InfoStrip";
import AddToCartButton from "../../components/AddToCartButton";
import { zowkinsApi, ProductDetails } from "../../lib/zowkins-api";
import { formatPrice } from "../../lib/catalog";
import { resolveImageSource } from "../../lib/media";

export const metadata: Metadata = {
  title: "Accessories",
  description: "Browse docks, keyboards, mice, printers, and other business accessories.",
};

export const dynamic = "force-dynamic";

export default async function Accessories() {
  let products: ProductDetails[] = [];
  let categoryName = "Accessories";
  let activeCategory: any = null;

  try {
    // 1. Try fetching by standard slug first
    try {
      activeCategory = await zowkinsApi.getCategoryBySlug("accessories");
    } catch (err) {
      // 2. Fallback: Search category list for name match
      const response = await zowkinsApi.listCategories({ limit: 100 });
      activeCategory = response.categories.find(
        (c) =>
          c.slug === "accessories" ||
          c.name.toLowerCase() === "accessories" ||
          c.name.toLowerCase().includes("accessory") ||
          c.name.toLowerCase().includes("accessories"),
      );

      if (!activeCategory) throw err;
    }

    if (activeCategory) {
      categoryName = activeCategory.name;
      const response = await zowkinsApi.listCategoryProducts(
        activeCategory.slug,
        {
          page: 1,
          limit: 100,
        },
      );
      products = response.products || [];
    }
  } catch {
    // Category not in DB yet - fallback is handled by UI
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#050b16_0%,#07142a_48%,#0b1d3b_100%)] text-slate-100">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-10 md:px-8 md:py-14">
        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#0a1020] shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
          <div className="grid gap-8 px-6 py-10 md:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:px-14 lg:py-14">
            <div className="space-y-6">
              <p className="text-xs uppercase tracking-[0.35em] text-[#f3c74d]">
                {categoryName}
              </p>
              <h1 className="font-display text-4xl font-bold leading-tight text-white md:text-5xl">
                Practical accessories for modern workstations.
              </h1>
              <p className="max-w-2xl text-lg leading-7 text-slate-300">
                From docking stations to keyboards, our accessories category
                covers the hardware that keeps teams productive every day.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/cart"
                  className="rounded-full bg-[#f3c74d] px-6 py-3 text-sm font-semibold text-[#050b16] transition hover:bg-[#e4b935]"
                >
                  Open order form
                </Link>
                <Link
                  href="/contact"
                  className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:border-[#f3c74d]/45 hover:bg-white/10"
                >
                  Request a Quote
                </Link>
              </div>
            </div>

            <InfoStrip
              variant="dark"
              items={[
                {
                  label: "Category",
                  value: `${activeCategory?.subcategories?.length || 0} groups`,
                },
                {
                  label: "Products",
                  value: `${activeCategory?.productsCount || 0} items`,
                },
                { label: "Ordering", value: "Bulk procurement" },
              ]}
            />
          </div>
        </section>

        <section className="mt-14">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.3em] text-white/55">
              Available items
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-white">
              Reliable add-ons for your professional setup.
            </h2>
          </div>

          {products.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <article
                  key={product.id}
                  className="group overflow-hidden rounded-[2rem] border border-white/10 bg-[#0a1020] shadow-[0_16px_40px_rgba(0,0,0,0.18)] transition hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(0,0,0,0.24)]"
                >
                  <div className="relative h-52 overflow-hidden bg-slate-900">
                    <Image
                      src={resolveImageSource(product.image)}
                      alt={product.name}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="space-y-4 p-6">
                    <div>
                      <h3 className="font-display text-2xl font-semibold text-white">
                        {product.name}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-300">
                        {product.description}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-2xl font-bold text-white">
                        {formatPrice(product.price)}
                      </span>
                      <AddToCartButton
                        item={{
                          id: product.id,
                          title: product.name,
                          price: formatPrice(product.price),
                          spec:
                            (typeof product.subcategory === "object"
                              ? (product.subcategory as any).name
                              : product.subcategory) ||
                            (typeof product.category === "object"
                              ? (product.category as any).name
                              : product.category),
                          image: resolveImageSource(product.image),
                          slug: product.slug,
                        }}
                        className="rounded-full bg-[#f3c74d] px-5 py-3 text-sm font-semibold text-[#050b16] transition hover:bg-[#e4b935]"
                      >
                        Order Now
                      </AddToCartButton>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-[2rem] border border-dashed border-white/15 bg-[#0a1020] p-12 text-center">
              <p className="text-slate-400">
                No items found under "{categoryName}" yet.
              </p>
              <Link
                href="/admin/categories"
                className="mt-4 inline-block font-semibold text-[#f3c74d] hover:underline"
              >
                Go to admin categories &rarr;
              </Link>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}



