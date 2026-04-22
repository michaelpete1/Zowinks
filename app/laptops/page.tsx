import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Navbar from "../../components/NewNavbar";
import InfoStrip from "../../components/InfoStrip";
import { zowkinsApi } from "../../lib/zowkins-api";
import { resolveImageSource } from "../../lib/media";

export const metadata: Metadata = {
  title: "Laptops",
  description: "Compare HP, Dell, Lenovo, Asus, and Apple laptops for business and creative work.",
};

export const dynamic = "force-dynamic";

export default async function Laptops() {
  let subcategories: any[] = [];
  let productsCount = 0;
  let categoryName = "Laptops";
  let activeCategory: any = null;

  try {
    // 1. Try fetching by standard slug first
    try {
      activeCategory = await zowkinsApi.getCategoryBySlug("laptops");
    } catch (err) {
      // 2. Fallback: Search category list for name match
      const response = await zowkinsApi.listCategories({ limit: 100 });
      activeCategory = response.categories.find(
        (c) =>
          c.slug === "laptops" ||
          c.name.toLowerCase() === "laptops" ||
          c.name.toLowerCase().includes("laptop"),
      );

      if (!activeCategory) throw err;
    }

    if (activeCategory) {
      subcategories = activeCategory.subcategories || [];
      productsCount = activeCategory.productsCount || 0;
      categoryName = activeCategory.name;
    }
  } catch {
    // Category not in DB yet - fallback is handled by UI
  }

  // Map subcategories to brand UI data
  const brands = subcategories.map((sub) => {
    // Determine tone based on name for a bit of variety
    const name = sub.name.toLowerCase();
    let tone = "from-slate-100 via-white to-slate-50";
    let badge = "Business choice";

    if (name.includes("hp")) {
      tone = "from-emerald-50 via-white to-slate-50";
      badge = "Enterprise ready";
    } else if (name.includes("dell")) {
      tone = "from-blue-50 via-white to-slate-50";
      badge = "High performance";
    } else if (name.includes("lenovo")) {
      tone = "from-amber-50 via-white to-slate-50";
      badge = "Hybrid work";
    } else if (name.includes("apple") || name.includes("mac")) {
      tone = "from-slate-200 via-white to-slate-100";
      badge = "Premium Choice";
    }

    return {
      name: sub.name,
      slug: sub.slug,
      href: `/categories/${activeCategory?.slug || "laptops"}/${sub.slug}`,
      description: `Explore the latest ${sub.name} laptop models and configurations.`,
      badge,
      tone,
      image: resolveImageSource(sub.image),
    };
  });

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#050b16_0%,#07142a_48%,#0b1d3b_100%)] text-slate-100">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-10 md:px-8 md:py-14">
        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#0a1020] shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
          <div className="grid gap-8 bg-[linear-gradient(180deg,#0f172a_0%,#050b16_100%)] px-6 py-10 md:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:px-14 lg:py-14">
            <div className="space-y-6">
              <p className="text-xs uppercase tracking-[0.35em] text-white/55">Laptop brands</p>
              <h1 className="font-display text-4xl font-bold leading-tight text-white md:text-5xl">
                Choose the laptop line that fits your team.
              </h1>
              <p className="max-w-2xl text-lg leading-7 text-slate-300">
                Start with the brand family, then move into the products and pricing that match your workload,
                budget, and support requirements.
              </p>
              {brands.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {brands.slice(0, 4).map((b) => (
                    <Link
                      key={b.slug}
                      href={b.href}
                      className="rounded-full border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-semibold text-white transition hover:border-[#f3c74d]/45 hover:bg-white/10"
                    >
                      View {b.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <InfoStrip
              variant="dark"
              items={[
                { label: "Brands", value: `${brands.length} subcategories` },
                { label: "Products", value: `${productsCount} items` },
                { label: "Category", value: categoryName },
              ]}
            />
          </div>
        </section>

        <section className="mt-14">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/55">Browse by brand</p>
              <h2 className="font-display text-3xl font-semibold text-white">Open a collection and start comparing.</h2>
            </div>
          </div>

          {brands.length > 0 ? (
            <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
              {brands.map((brand) => (
                <Link
                  key={brand.slug}
                  href={brand.href}
                  className="group overflow-hidden rounded-[2rem] border border-white/10 bg-[#0f172a] shadow-[0_16px_40px_rgba(0,0,0,0.18)] transition hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(0,0,0,0.24)]"
                >
                  <div className={`relative h-44 overflow-hidden bg-gradient-to-br ${brand.tone}`}>
                    <Image
                      src={brand.image}
                      alt={brand.name}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,20,39,0.06)_0%,rgba(9,20,39,0.35)_100%)]" />
                    <div className="absolute left-4 top-4 inline-flex rounded-full bg-slate-950/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-white backdrop-blur">
                      {brand.badge}
                    </div>
                  </div>
                  <div className="space-y-4 p-6">
                    <h3 className="font-display text-3xl font-bold text-white">{brand.name}</h3>
                    <p className="max-w-sm text-sm leading-6 text-slate-300">{brand.description}</p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-sm font-semibold text-slate-400">View collection</span>
                      <span className="text-sm font-semibold text-[#f3c74d] transition group-hover:translate-x-1">
                        Explore &rarr;
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-[2rem] border border-dashed border-white/15 bg-[#0a1020] p-12 text-center">
              <p className="text-slate-400">No brands found under "{categoryName}" yet. Create a category with this name in Admin &rarr;</p>
              <Link href="/admin/categories" className="mt-4 inline-block text-sm font-semibold text-[#f3c74d] hover:underline">
                Go to admin categories
              </Link>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

