import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Navbar from "../../components/NewNavbar";
import AddToCartButton from "../../components/AddToCartButton";
import FallbackImage from "../../components/FallbackImage";
import BrandMark from "../../components/BrandMark";
import FeaturedProductsCarousel from "../../components/FeaturedProductsCarousel";
import RotaryLinesBackground from "../../components/RotaryLinesBackground";
import { fetchAllCategories, fetchAllProducts } from "../../lib/catalog";
import { PRODUCT_BRANDS } from "../../lib/brands";
import { compactProductTitle, formatDisplayName } from "../../lib/display-name";
import { resolveImageSource } from "../../lib/media";

export const metadata: Metadata = {
  title: "Products",
  description:
    "Browse business laptops, desktops, accessories, and product collections from Zowkins Enterprise.",
};

export const revalidate = 60;

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
void CATEGORY_CARDS;

const TRUST_FEATURES = [
  "Warranty Available",
  "Fast Delivery",
  "Affordable Prices",
  "Tested Devices",
  "Bulk Orders Accepted",
];


const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const getSearchParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

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
  const knownBrand = PRODUCT_BRANDS.find((brand) => brand.slug === brandSlug);
  const productTerms = `-${slugify(
    `${product.title} ${product.brand} ${product.subcategory}`,
  )}-`;

  if (knownBrand) {
    return knownBrand.searchTerms.some((term) =>
      productTerms.includes(`-${slugify(term)}-`),
    );
  }

  return productTerms.includes(`-${brandSlug}-`);
};

const matchesCategory = (
  product: { category: string },
  categorySlug: string,
  categoryName?: string,
) => {
  const productCategory = slugify(product.category);
  return [categorySlug, categoryName]
    .filter((value): value is string => Boolean(value))
    .some((value) => productCategory === slugify(value));
};

const resolveCategorySlug = (
  categoryLabel: string,
  categories: Array<{ name: string; slug: string }>,
) => {
  const normalizedLabel = slugify(categoryLabel);
  return (
    categories.find(
      (category) =>
        slugify(category.name) === normalizedLabel ||
        slugify(category.slug) === normalizedLabel,
    )?.slug ?? normalizedLabel
  );
};

type ProductFilterPatch = {
  brand?: string | null;
  category?: string | null;
};

const buildProductsHref = (
  selectedBrand: string,
  selectedCategory: string,
  patch: ProductFilterPatch,
) => {
  const nextBrand = Object.prototype.hasOwnProperty.call(patch, "brand")
    ? patch.brand
    : selectedBrand;
  const nextCategory = Object.prototype.hasOwnProperty.call(patch, "category")
    ? patch.category
    : selectedCategory;
  const params = new URLSearchParams();

  if (nextBrand) params.set("brand", nextBrand);
  if (nextCategory) params.set("category", nextCategory);

  const query = params.toString();
  return query ? `/products?${query}` : "/products";
};

const brandFilterHref = (
  brandSlug: string,
  selectedBrand: string,
  selectedCategory: string,
) => buildProductsHref(selectedBrand, selectedCategory, { brand: brandSlug });

const categoryFilterHref = (
  categorySlug: string,
  selectedBrand: string,
  selectedCategory: string,
) =>
  buildProductsHref(selectedBrand, selectedCategory, { category: categorySlug });

type ProductsSearchParams = {
  brand?: string | string[];
  category?: string | string[];
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: Promise<ProductsSearchParams>;
}) {
  const [products, categories, resolvedSearchParams] = await Promise.all([
    fetchAllProducts(),
    fetchAllCategories(),
    searchParams ?? Promise.resolve<ProductsSearchParams>({}),
  ]);
  const visibleProducts = products.filter(Boolean);
  const selectedBrand = slugify(
    getSearchParam(resolvedSearchParams.brand) || "",
  );
  const selectedCategory = slugify(
    getSearchParam(resolvedSearchParams.category) || "",
  );


  const selectedCategoryData = categories.find(
    (category) =>
      slugify(category.slug) === selectedCategory ||
      slugify(category.name) === selectedCategory,
  );
  const productsMatchingBrand = selectedBrand
    ? visibleProducts.filter((product) => matchesBrand(product, selectedBrand))
    : visibleProducts;
  const productsMatchingCategory = selectedCategory
    ? visibleProducts.filter((product) =>
        matchesCategory(
          product,
          selectedCategory,
          selectedCategoryData?.name,
        ),
      )
    : visibleProducts;
  const displayProducts = selectedBrand || selectedCategory
    ? productsMatchingBrand.filter((product) =>
        !selectedCategory ||
        matchesCategory(
          product,
          selectedCategory,
          selectedCategoryData?.name,
        ),
      )
    : visibleProducts;

  const selectedBrandProduct = selectedBrand
    ? visibleProducts.find((product) => matchesBrand(product, selectedBrand))
    : undefined;
  const knownBrandSlugs = new Set(PRODUCT_BRANDS.map((brand) => brand.slug));
  const brandOptions = [
    ...PRODUCT_BRANDS,
    ...(selectedBrand && !knownBrandSlugs.has(selectedBrand)
      ? [
          {
            label: formatDisplayName(
              selectedBrandProduct?.brand || selectedBrand.replace(/-/g, " "),
              selectedBrand,
            ),
            slug: selectedBrand,
            searchTerms: [selectedBrand.replace(/-/g, " ")],
            logo: null,
          },
        ]
      : []),
  ];

  const brandCounts = brandOptions
    .map((brand) => ({
      ...brand,
      count: productsMatchingCategory.filter((product) =>
        matchesBrand(product, brand.slug),
      ).length,
    }))
    .filter((brand) => brand.count > 0 || brand.slug === selectedBrand)
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

  const categoryCounts = categories
    .map((category) => ({
      label: formatDisplayName(category.name, category.name),
      slug: category.slug,
      count: productsMatchingBrand.filter((product) =>
        matchesCategory(product, category.slug, category.name),
      ).length,
    }))
    .filter(
      (category) =>
        category.count > 0 ||
        slugify(category.slug) === selectedCategory ||
        slugify(category.label) === selectedCategory,
    )
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

  const topProducts = displayProducts.slice(0, 3);
  const whatsappHref = "https://wa.me/message/6U6S7AJM4GECJ1";

  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#050b16_0%,#07142a_48%,#0b1d3b_100%)] text-slate-100">
      <div className="absolute inset-0 z-0">
        <RotaryLinesBackground count={10} speed={0.7} opacity={0.05} />
      </div>
      <div className="relative z-10">
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
                  competitive prices. New brand collections automatically appear
                  here from the backend.
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
                  sizes="(min-width: 1280px) 560px, (min-width: 1024px) 45vw, calc(100vw - 2rem)"
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
            </div>
          )}
        </section>

        <section className="mt-12" aria-labelledby="product-filters-heading">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0a1020] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-4 sm:px-5">
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <h2
                  id="product-filters-heading"
                  className="font-display text-lg font-bold text-white sm:text-xl"
                >
                  Filter products
                </h2>
                <p className="text-sm tabular-nums text-slate-400" aria-live="polite">
                  {displayProducts.length} product{displayProducts.length === 1 ? "" : "s"}
                </p>
              </div>
              {selectedBrand || selectedCategory ? (
                <Link
                  href="/products"
                  className="min-h-11 rounded-lg px-3 py-2 text-sm font-semibold text-[#f3c74d] transition hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f3c74d]"
                >
                  Clear all
                </Link>
              ) : null}
            </div>

            <div className="divide-y divide-white/10 px-4 sm:px-5">
              <div
                role="group"
                aria-labelledby="category-filter-label"
                className="grid gap-3 py-4 sm:grid-cols-[8rem_minmax(0,1fr)] sm:items-start"
              >
                <h3
                  id="category-filter-label"
                  className="pt-2 text-sm font-semibold text-slate-300"
                >
                  Categories
                </h3>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={buildProductsHref(selectedBrand, selectedCategory, {
                      category: null,
                    })}
                    aria-current={!selectedCategory ? "page" : undefined}
                    aria-label={`All categories, ${productsMatchingBrand.length} ${productsMatchingBrand.length === 1 ? "product" : "products"}`}
                    className={`inline-flex min-h-11 items-center justify-between gap-3 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f3c74d] ${
                      !selectedCategory
                        ? "border-[#f3c74d] bg-[#f3c74d] text-[#050b16]"
                        : "border-white/10 bg-[#111b2a] text-slate-100 hover:border-white/20 hover:bg-white/10"
                    }`}
                  >
                    <span>All categories</span>
                    <span className="tabular-nums" aria-hidden="true">
                      {productsMatchingBrand.length}
                    </span>
                  </Link>
                  {categoryCounts.map((category) => {
                    const isSelected =
                      selectedCategory === slugify(category.slug) ||
                      selectedCategory === slugify(category.label);
                    return (
                      <Link
                        key={category.slug}
                        href={buildProductsHref(selectedBrand, selectedCategory, {
                          category: category.slug,
                        })}
                        aria-current={isSelected ? "page" : undefined}
                        aria-label={`${category.label}, ${category.count} ${category.count === 1 ? "product" : "products"}`}
                        className={`inline-flex min-h-11 items-center justify-between gap-3 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f3c74d] ${
                          isSelected
                            ? "border-[#f3c74d] bg-[#f3c74d] text-[#050b16]"
                            : "border-white/10 bg-[#111b2a] text-slate-100 hover:border-white/20 hover:bg-white/10"
                        }`}
                      >
                        <span>{category.label}</span>
                        <span className="tabular-nums" aria-hidden="true">
                          {category.count}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div
                role="group"
                aria-labelledby="brand-filter-label"
                className="grid gap-3 py-4 sm:grid-cols-[8rem_minmax(0,1fr)] sm:items-start"
              >
                <h3
                  id="brand-filter-label"
                  className="pt-2 text-sm font-semibold text-slate-300"
                >
                  Brands
                </h3>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={buildProductsHref(selectedBrand, selectedCategory, {
                      brand: null,
                    })}
                    aria-current={!selectedBrand ? "page" : undefined}
                    aria-label={`All brands, ${productsMatchingCategory.length} products`}
                    className={`inline-flex min-h-11 items-center justify-between gap-3 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f3c74d] ${
                      !selectedBrand
                        ? "border-[#f3c74d] bg-[#f3c74d] text-[#050b16]"
                        : "border-white/10 bg-[#111b2a] text-slate-100 hover:border-white/20 hover:bg-white/10"
                    }`}
                  >
                    <span>All brands</span>
                    <span className="tabular-nums" aria-hidden="true">
                      {productsMatchingCategory.length}
                    </span>
                  </Link>
                  {brandCounts.map((brand) => {
                    const isSelected = selectedBrand === brand.slug;
                    return (
                      <Link
                        key={brand.slug}
                        href={buildProductsHref(selectedBrand, selectedCategory, {
                          brand: brand.slug,
                        })}
                        aria-current={isSelected ? "page" : undefined}
                        aria-label={`${brand.label}, ${brand.count} ${brand.count === 1 ? "product" : "products"}`}
                        className={`inline-flex min-h-11 items-center justify-between gap-3 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f3c74d] ${
                          isSelected
                            ? "border-[#f3c74d] bg-[#f3c74d] text-[#050b16]"
                            : "border-white/10 bg-[#111b2a] text-slate-100 hover:border-white/20 hover:bg-white/10"
                        }`}
                      >
                        <span className="inline-flex items-center gap-2">
                          <BrandMark compact label={brand.label} logo={brand.logo} />
                          <span>{brand.label}</span>
                        </span>
                        <span className="tabular-nums" aria-hidden="true">
                          {brand.count}
                        </span>
                      </Link>
                    );
                  })}
                </div>
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
                Showing {displayProducts.length} product{displayProducts.length === 1 ? "" : "s"}
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
                  className="group flex h-full flex-col overflow-hidden rounded-[1.6rem] border border-white/10 bg-[#0a1020] shadow-[0_16px_44px_rgba(0,0,0,0.18)] transition hover:-translate-y-1 hover:shadow-[0_24px_56px_rgba(0,0,0,0.24)]"
                >
                  <Link href={product.href} className="block">
                    <div className="relative aspect-[16/11] overflow-hidden bg-slate-900 sm:aspect-[4/3]">
                      <FallbackImage
                        src={resolveImageSource(product.image, "/desktop.jpg")}
                        alt={product.title}
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,11,22,0.05)_0%,rgba(5,11,22,0.72)_100%)]" />
                    </div>
                  </Link>

                  <div className="flex flex-1 flex-col space-y-3 p-4 sm:space-y-4 sm:p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
                      <Link
                        href={categoryFilterHref(
                          resolveCategorySlug(product.category, categories),
                          selectedBrand,
                          selectedCategory,
                        )}
                        className="rounded-full bg-white/8 px-2.5 py-1 text-[10px] font-semibold text-slate-100 transition hover:bg-white/14 hover:text-[#f3c74d] sm:px-3 sm:text-xs"
                      >
                        {formatDisplayName(product.category, product.category)}
                      </Link>
                      <Link
                        href={brandFilterHref(
                          slugify(product.subcategory || product.brand),
                          selectedBrand,
                          selectedCategory,
                        )}
                        className="text-xs font-semibold text-[#f3c74d] hover:underline sm:text-sm"
                      >
                        {formatDisplayName(
                          product.subcategory || product.brand,
                          product.subcategory || product.brand,
                        )}
                      </Link>
                    </div>

                    <div className="flex-1">
                      <Link href={product.href} className="block">
                        <h3 className="font-display text-xl font-bold leading-tight text-white transition group-hover:text-[#f3c74d] sm:text-2xl">
                          {compactProductTitle(product.title)}
                        </h3>
                      </Link>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-300">
                        {product.description}
                      </p>
                    </div>

                    <div className="mt-auto flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
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
            </div>
          )}
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
    </div>
  );
}
