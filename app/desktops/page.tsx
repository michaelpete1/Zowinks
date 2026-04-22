import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Navbar from "../../components/NewNavbar";
import { zowkinsApi } from "../../lib/zowkins-api";
import { resolveImageSource } from "../../lib/media";

export const metadata: Metadata = {
  title: "Desktops",
  description: "Explore HP and Lenovo desktops for office and business deployments.",
};

export const dynamic = "force-dynamic";

export default async function DesktopsPage() {
  let subcategories: any[] = [];
  let productsCount = 0;
  let categoryName = "Desktops";
  let activeCategory: any = null;

  try {
    // 1. Try fetching by standard slug first
    try {
      activeCategory = await zowkinsApi.getCategoryBySlug("desktops");
    } catch (err) {
      // 2. Fallback: Search category list for name match
      const response = await zowkinsApi.listCategories({ limit: 100 });
      activeCategory = response.categories.find(
        (c) =>
          c.slug === "desktops" ||
          c.name.toLowerCase() === "desktops" ||
          c.name.toLowerCase().includes("desktop"),
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

  const brands = subcategories.map((sub) => {
    const name = sub.name.toLowerCase();
    let image = "/desktop.jpg";
    if (name.includes("hp")) image = "/hp.jpg";
    if (name.includes("lenovo")) image = "/desktop 2.jpg";

    return {
      title: sub.name,
      description: `Robust ${sub.name} desktop systems for business environments and professional workflows.`,
      href: `/categories/${activeCategory?.slug || "desktops"}/${sub.slug}`,
      image: resolveImageSource(sub.image, image),
    };
  });

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#050b16_0%,#07142a_48%,#0b1d3b_100%)] text-slate-100">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-10 md:px-8 md:py-14">
        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#0a1020] shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
          <div className="grid gap-8 px-6 py-10 md:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:px-14 lg:py-14">
            <div className="space-y-6">
              <p className="text-xs uppercase tracking-[0.35em] text-[#f3c74d]">{categoryName} collections</p>
              <h1 className="font-display text-4xl font-bold leading-tight text-white md:text-5xl">
                Desktop systems built for business reliability.
              </h1>
              <p className="max-w-2xl text-lg leading-7 text-slate-300">
                Choose between leading desktop lines for office environments, procurement projects,
                and teams that need dependable performance.
              </p>
              {brands.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {brands.map((b) => (
                    <Link
                      key={b.href}
                      href={b.href}
                      className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:border-[#f3c74d]/45 hover:bg-white/10"
                    >
                      {b.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {brands.length > 0 ? (
                brands.map((brand) => (
                  <Link
                    key={brand.title}
                    href={brand.href}
                    className="group overflow-hidden rounded-[1.6rem] border border-white/10 bg-[#0f172a] shadow-[0_14px_30px_rgba(0,0,0,0.28)] transition hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.34)]"
                  >
                    <div className="relative h-44 overflow-hidden bg-slate-900">
                      <Image
                        src={brand.image}
                        alt={brand.title}
                        fill
                        className="object-cover opacity-80 transition duration-500 group-hover:scale-105 group-hover:opacity-100"
                      />
                    </div>
                    <div className="p-5">
                      <h2 className="font-display text-xl font-bold text-white">{brand.title}</h2>
                      <p className="mt-2 text-sm leading-6 text-slate-300">{brand.description}</p>
                      <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#f3c74d]">
                        View collection <span aria-hidden="true">&rarr;</span>
                      </span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="col-span-2 rounded-[1.5rem] border border-dashed border-white/15 bg-white/5 p-8 text-center text-sm text-slate-400">
                  <p>No brands found under "{categoryName}" yet.</p>
                  <Link href="/admin/categories" className="mt-4 inline-block font-semibold text-[#f3c74d] hover:underline">
                    Go to admin categories &rarr;
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

