import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Navbar from "../../components/NewNavbar";
import AddToCartButton from "../../components/AddToCartButton";
import FallbackImage from "../../components/FallbackImage";
import FeaturedProductsCarousel from "../../components/FeaturedProductsCarousel";
import { getAppSettings } from "../../lib/app-settings";
import { fetchAllProducts } from "../../lib/catalog";
import { compactProductTitle, formatDisplayName } from "../../lib/display-name";
import { zowkinsApi } from "../../lib/zowkins-api";

export const metadata: Metadata = {
  title: "Products",
  description:
    "Browse business laptops, desktops, accessories, and product collections from Zowkins Enterprise.",
};

export const dynamic = "force-dynamic";

const CATEGORY_CARDS = [
  {
    label: "Laptops",
    slug: "laptops",
    icon: "💻",
    image: "/hp.jpg",
    description: "Business laptops, ultrabooks, and everyday work machines.",
  },
  {
    label: "Desktops",
    slug: "desktops",
    icon: "🖥️",
    image: "/desktop.jpg",
    description: "Reliable desktop systems for offices and teams.",
  },
  {
    label: "Accessories",
    slug: "accessories",
    icon: "🎧",
    image: "/keyboard.jpg",
    description: "Keyboards, mice, docking stations, and more.",
  },
  {
    label: "Speakers",
    slug: "speakers",
    icon: "🔊",
    image: "/mb.jpg",
    description: "Audio gear for desks, rooms, and small workspaces.",
  },
  {
    label: "Gaming",
    slug: "gaming",
    icon: "🎮",
    image: "/desktop 2.jpg",
    description: "High-performance systems for creative and gaming use.",
  },
];

const TRUST_FEATURES = [
  "Warranty Available",
  "Fast Delivery",
  "Affordable Prices",
  "Tested Devices",
  "Bulk Orders Accepted",
];

const BRAND_IMAGE_MAP: Record<string, string> = {
  hp: "/hplogo.jpg",
  dell: "/delllogo.jpg",
  lenovo: "/lenovologo.jpg",
  asus: "/asuslogo.jpg",
  apple: "/applelogo.jpg",
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const getSearchParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const matchesText = (value: string, needle: string) =>
  slugify(value).includes(needle) || value.toLowerCase().includes(needle.replace(/-/g, " "));

const matchesBrand = (
  product: {
    title: string;
    brand: string;
    subcategory: string;
    category: string;
    description: string;
  },
  brandSlug: string,
) => {
  const fields = `${product.title} ${product.brand} ${product.subcategory} ${product.category} ${product.description}`;
  const normalizedBrand = slugify(product.subcategory || product.brand || "");
  return (
    normalizedBrand === brandSlug ||
    matchesText(fields, brandSlug) ||
    fields.toLowerCase().includes(brandSlug.toLowerCase())
  );
};

const matchesCategory = (
  product: { title: string; brand: string; category: string; description: string },
  categorySlug: string,
) => {
  const fields = `${product.title} ${product.brand} ${product.category} ${product.description}`;
  return (
    slugify(product.category) === categorySlug ||
    matchesText(fields, categorySlug) ||
    fields.toLowerCase().includes(categorySlug.toLowerCase())
  );
};

const brandFilterHref = (brandSlug: string) =>
  `/products?brand=${encodeURIComponent(brandSlug)}`;

const categoryFilterHref = (categorySlug: string) =>
  `/products?category=${encodeURIComponent(categorySlug)}`;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: { brand?: string | string[]; category?: string | string[] };
}) {
  const [products, categoriesResponse, appSettings] = await Promise.all([
    fetchAllProducts(),
    zowkinsApi.listCategories({ page: 1, limit: 12 }).catch(() => null),
    getAppSettings(),
  ]);

  const categories = categoriesResponse?.categories ?? [];
  const visibleProducts = products.filter(Boolean);
  const selectedBrand = slugify(getSearchParam(searchParams?.brand) || "");
  const selectedCategory = slugify(getSearchParam(searchParams?.category) || "");
  const app = appSettings.app;

  const liveBrands = Array.from(
    new Map(
      categories.flatMap((category) =>
        (category.subcategories ?? []).map((subcategory: any) => {
          const label = String(subcategory.name || "").trim();
          const slug = String(subcategory.slug || slugify(label));
          const categorySlug = String(category.slug || "");
          const categoryName = formatDisplayName(
            String(category.name || "Category"),
            "Category",
          );
          return [
            slug,
            {
              label: formatDisplayName(label, label),
              slug,
              categorySlug,
              categoryName,
              image:
                BRAND_IMAGE_MAP[slug] ||
                BRAND_IMAGE_MAP[slugify(label)] ||
                "/desktop.jpg",
            },
          ] as const;
        }),
      ),
    ).values(),
  ).filter((brand) => brand.label && brand.slug);

  const displayProducts =
    selectedBrand || selectedCategory
      ? visibleProducts.filter((product) => {
          const brandMatch = selectedBrand
            ? matchesBrand(product, selectedBrand)
            : true;
          const categoryMatch = selectedCategory
            ? matchesCategory(product, selectedCategory)
            : true;
          return brandMatch && categoryMatch;
        })
      : visibleProducts;

  const brandCounts = liveBrands
    .map((brand) => ({
      ...brand,
      count: visibleProducts.filter((product) => matchesBrand(product, brand.slug))
        .length,
    }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

  const categoryCounts = categories
    .map((category) => ({
      label: formatDisplayName(category.name, category.name),
      slug: category.slug,
      count: visibleProducts.filter((product) =>
        matchesCategory(product, category.slug),
      ).length,
    }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

  const topProducts = displayProducts.slice(0, 3);
  const whatsappHref = "https://wa.me/message/QL4N3SVOVCUZH1";

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#050b16_0%,#07142a_48%,#0b1d3b_100%)] text-slate-100">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
        <section className="overflow-hidden rounded-[2.4rem] border border-white/10 bg-[#08111f] shadow-[0_28px_80px_rgba(0,0,0,0.28)]">
          <div className="grid gap-10 px-6 py-10 md:px-10 lg:grid-cols-[1.1fr_0.9fr] lg:px-14 lg:py-14">
            <div className="space-y-7">
              <div className="inline-flex rounded-full border border-[#f3c74d]/20 bg-[#f3c74d]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#f3c74d]">
                Product catalog
              </div>
              <div className="space-y-4">
                <h1 className="max-w-2xl font-display text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
                  Find the Right Tech for Work, Gaming & Everyday Use
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-slate-300">
                  Explore premium laptops, desktops, accessories, and gadgets at
                  competitive prices. New brand collections automatically
                  appear here from the backend.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="#featured-products"
                  className="rounded-full bg-[#f3c74d] px-6 py-3 text-sm font-semibold text-[#050b16] transition hover:bg-[#e4b935]"
                >
                  Shop Products
                </Link>
                <Link
                  href="/categories"
                  className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:border-[#f3c74d]/45 hover:bg-white/10"
                >
                  Browse Categories
                </Link>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {TRUST_FEATURES.map((feature) => (
                  <span
                    key={feature}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-200"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#0d1728] p-3 shadow-[0_18px_50px_rgba(0,0,0,0.24)] sm:p-4">
              <div className="relative min-h-[280px] overflow-hidden rounded-[1.6rem] sm:min-h-[360px]">
                <Image
                  src="/heroimage1.jpg"
                  alt="Featured products"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,10,22,0.08)_0%,rgba(4,10,22,0.72)_100%)]" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <div className="max-w-sm rounded-[1.4rem] border border-white/10 bg-[#050b16]/80 p-4 backdrop-blur sm:p-4">
                    <p className="text-xs uppercase tracking-[0.28em] text-[#f3c74d]">
                      Premium catalog
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-200">
                      Clean sourcing, business-ready systems, and fast delivery
                      for modern teams.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-12" id="featured-products">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/55">
                Featured products
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold text-white md:text-4xl">
                Best sellers, new arrivals, and hot deals
              </h2>
            </div>
            <Link
              href="/request-quote"
              className="rounded-full border border-[#f3c74d]/25 bg-[#f3c74d]/10 px-5 py-3 text-sm font-semibold text-[#f3c74d] transition hover:bg-[#f3c74d]/15"
            >
              Request Quote
            </Link>
          </div>

          {topProducts.length ? (
            <FeaturedProductsCarousel featured={topProducts} />
          ) : (
            <div className="mt-6 rounded-[2rem] border border-dashed border-white/15 bg-[#0a1020] p-10 text-center">
              <p className="text-slate-300">
                No featured products available for the current filter.
              </p>
              <Link
                href="/products"
                className="mt-4 inline-block text-sm font-semibold text-[#f3c74d] hover:underline"
              >
                Clear filters
              </Link>
            </div>
          )}
        </section>

        <section className="mt-12">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/55">
                Product filters
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold text-white md:text-4xl">
                Narrow the catalog by brand or category
              </h2>
            </div>
            {selectedBrand || selectedCategory ? (
              <Link
                href="/products"
                className="text-sm font-semibold text-[#f3c74d] hover:underline"
              >
                Clear filters
              </Link>
            ) : null}
          </div>

          <div className="mt-6 space-y-6">
            <div>
              <p className="mb-3 text-sm font-semibold text-slate-300">
                Brands
              </p>
              <div className="flex flex-nowrap gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <Link
                  href="/products"
                  className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    !selectedBrand
                      ? "border-[#f3c74d] bg-[#f3c74d] text-[#050b16]"
                      : "border-white/10 bg-white/5 text-white hover:border-[#f3c74d]/45 hover:bg-white/10"
                  }`}
                >
                  All
                </Link>
                {brandCounts.map((brand) => (
                  <Link
                    key={brand.slug}
                    href={brandFilterHref(brand.slug)}
                    className={`inline-flex shrink-0 items-center gap-3 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                      selectedBrand === brand.slug
                        ? "border-[#f3c74d] bg-[#f3c74d] text-[#050b16]"
                        : "border-white/10 bg-white/5 text-white hover:border-[#f3c74d]/45 hover:bg-white/10"
                    }`}
                  >
                    <span>{brand.label}</span>
                    <span className="text-[11px] opacity-75">{brand.count}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-3 text-sm font-semibold text-slate-300">
                Categories
              </p>
              <div className="flex flex-nowrap gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <Link
                  href="/products"
                  className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    !selectedCategory
                      ? "border-[#f3c74d] bg-[#f3c74d] text-[#050b16]"
                      : "border-white/10 bg-white/5 text-white hover:border-[#f3c74d]/45 hover:bg-white/10"
                  }`}
                >
                  All
                </Link>
                {categoryCounts.map((category) => (
                  <Link
                    key={category.slug}
                    href={categoryFilterHref(category.slug)}
                    className={`inline-flex shrink-0 items-center gap-3 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                      selectedCategory === category.slug
                        ? "border-[#f3c74d] bg-[#f3c74d] text-[#050b16]"
                        : "border-white/10 bg-white/5 text-white hover:border-[#f3c74d]/45 hover:bg-white/10"
                    }`}
                  >
                    <span>{category.label}</span>
                    <span className="text-[11px] opacity-75">{category.count}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-12">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/55">
                Product grid
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold text-white md:text-4xl">
                Showing {displayProducts.length} products
              </h2>
            </div>
            <Link
              href="/categories"
              className="text-sm font-semibold text-[#f3c74d] hover:underline"
            >
              Browse all categories
            </Link>
          </div>

          {displayProducts.length ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {displayProducts.map((product) => (
                <article
                  key={product.id}
                  className="group overflow-hidden rounded-[1.6rem] border border-white/10 bg-[#0a1020] shadow-[0_16px_44px_rgba(0,0,0,0.18)] transition hover:-translate-y-1 hover:shadow-[0_24px_56px_rgba(0,0,0,0.24)]"
                >
                  <Link href={product.href} className="block">
                    <div className="relative aspect-[16/11] overflow-hidden bg-slate-900 sm:aspect-[4/3]">
                      <FallbackImage
                        src={product.image}
                        alt={product.title}
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,11,22,0.05)_0%,rgba(5,11,22,0.72)_100%)]" />
                    </div>
                  </Link>

                  <div className="space-y-3 p-4 sm:space-y-4 sm:p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
                      <Link
                        href={categoryFilterHref(slugify(product.category))}
                        className="rounded-full bg-white/8 px-2.5 py-1 text-[10px] font-semibold text-slate-100 transition hover:bg-white/14 hover:text-[#f3c74d] sm:px-3 sm:text-xs"
                      >
                        {formatDisplayName(product.category, product.category)}
                      </Link>
                      <Link
                        href={brandFilterHref(slugify(product.subcategory || product.brand))}
                        className="text-xs font-semibold text-[#f3c74d] hover:underline sm:text-sm"
                      >
                        {formatDisplayName(
                          product.subcategory || product.brand,
                          product.subcategory || product.brand,
                        )}
                      </Link>
                    </div>

                    <div>
                      <Link href={product.href} className="block">
                        <h3 className="font-display text-xl font-bold leading-tight text-white transition group-hover:text-[#f3c74d] sm:text-2xl">
                          {compactProductTitle(product.title)}
                        </h3>
                      </Link>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-300">
                        {product.description}
                      </p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                          Price
                        </p>
                        <p className="mt-1 text-xl font-bold text-[#f3c74d] sm:text-2xl">
                          {product.price}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <AddToCartButton
                          item={{
                            id: product.id,
                            slug: product.slug,
                            title: compactProductTitle(product.title),
                            price: product.price,
                            spec: formatDisplayName(
                              product.subcategory || product.brand,
                              product.subcategory || product.brand,
                            ),
                            image: product.image,
                          }}
                          className="rounded-full bg-[#f3c74d] px-4 py-2.5 text-sm font-semibold text-[#050b16] transition hover:bg-[#e4b935] sm:px-4"
                        >
                          Add
                        </AddToCartButton>
                        <Link
                          href={product.href}
                          className="rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-[#f3c74d]/45 hover:bg-white/10"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-[2rem] border border-dashed border-white/15 bg-[#0a1020] p-10 text-center">
              <p className="text-slate-300">
                No products match the current filter.
              </p>
              <Link
                href="/products"
                className="mt-4 inline-block text-sm font-semibold text-[#f3c74d] hover:underline"
              >
                Clear filters
              </Link>
            </div>
          )}
        </section>

        <section className="mt-12">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/55">
                Popular brands
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold text-white md:text-4xl">
                Trusted brands customers ask for
              </h2>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {brandCounts.map((brand) => {
              return (
                <Link
                  key={brand.slug}
                  href={brandFilterHref(brand.slug)}
                  className="group overflow-hidden rounded-[1.4rem] border border-white/10 bg-[#0a1020] p-4 shadow-[0_16px_44px_rgba(0,0,0,0.18)] transition hover:-translate-y-1 hover:border-[#f3c74d]/40 hover:shadow-[0_24px_56px_rgba(0,0,0,0.24)] sm:p-5"
                >
                  <div className="flex items-center gap-4">
                    <div className="grid h-12 w-12 place-items-center overflow-hidden rounded-2xl bg-white/90 p-2 sm:h-14 sm:w-14">
                        <Image
                          src={brand.image}
                          alt={brand.label}
                        width={56}
                        height={56}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div>
                      <h3 className="font-display text-xl font-bold text-white transition group-hover:text-[#f3c74d] sm:text-2xl">
                        {brand.label}
                      </h3>
                      <p className="text-sm text-slate-300">
                        {brand.count} products
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mt-12">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 sm:rounded-[2rem] sm:p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-[#f3c74d]">
                Genuine Devices
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                Reliable products sourced for business and everyday use.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 sm:rounded-[2rem] sm:p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-[#f3c74d]">
                Fast Delivery
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                Quick fulfillment for urgent orders and team rollouts.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 sm:rounded-[2rem] sm:p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-[#f3c74d]">
                Business Support
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                Bulk orders, procurement help, and after-sales support.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-12 overflow-hidden rounded-[2.4rem] border border-[#f3c74d]/20 bg-[linear-gradient(135deg,#0a1020_0%,#0f1730_100%)] px-6 py-10 shadow-[0_24px_70px_rgba(0,0,0,0.28)] md:px-10">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.35em] text-[#f3c74d]">
                Ready to buy?
              </p>
              <h2 className="font-display text-3xl font-bold text-white md:text-4xl">
                Ready to Upgrade Your Business Tech?
              </h2>
              <p className="max-w-2xl text-lg leading-8 text-slate-300">
                Get reliable laptops, desktops, accessories, and procurement
                support tailored for your organization.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:justify-end">
              <Link
                href="/request-quote"
                className="rounded-full bg-[#f3c74d] px-6 py-3 text-sm font-semibold text-[#050b16] transition hover:bg-[#e4b935]"
              >
                Request Quote
              </Link>
              <Link
                href="#featured-products"
                className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:border-[#f3c74d]/45 hover:bg-white/10"
              >
                Browse Products
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Link
        href={whatsappHref}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-full bg-[#25d366] px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(37,211,102,0.3)] transition hover:scale-105 hover:bg-[#1fb85a]"
      >
        <span className="grid h-9 w-9 place-items-center rounded-full bg-white/15 text-lg">
          💬
        </span>
        <span>Chat to Order</span>
      </Link>
    </div>
  );
}
