import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "../../../components/NewNavbar";
import AddToCartButton from "../../../components/AddToCartButton";
import ProductImageGallery from "../../../components/ProductImageGallery";
import { ApiError, zowkinsApi, type ProductDetails } from "../../../lib/zowkins-api";
import { resolveImageSource } from "../../../lib/media";

type ProductPageProps = {
  params: {
    slug: string;
  };
};

function formatPrice(value: number) {
  return value.toLocaleString("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function getDisplayLabel(value: unknown, fallback = "N/A") {
  if (typeof value === "string") {
    return value || fallback;
  }

  if (typeof value === "object" && value !== null) {
    const record = value as { name?: unknown; title?: unknown; slug?: unknown };
    if (typeof record.name === "string" && record.name.trim())
      return record.name;
    if (typeof record.title === "string" && record.title.trim())
      return record.title;
    if (typeof record.slug === "string" && record.slug.trim())
      return record.slug;
  }

  return fallback;
}

function getProductId(product: { id?: string; _id?: string }) {
  return product.id || product._id || "";
}

function coerceSpecs(value: unknown): unknown {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (
      !trimmed ||
      trimmed === "0" ||
      trimmed.toLowerCase() === "null" ||
      trimmed.toLowerCase() === "undefined"
    ) {
      return null;
    }

    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (parsed === 0 || parsed === "0") return null;
      return parsed;
    } catch {
      return trimmed;
    }
  }

  if (value === 0) return null;
  return value;
}

function formatSpecValue(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value.map(formatSpecValue).filter(Boolean).join(", ");
  }
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return "";
    }
  }

  return String(value);
}

function isWarrantyKey(key: string): boolean {
  const normalized = key.toLowerCase();
  return (
    normalized.includes("warranty") ||
    normalized.includes("guarantee") ||
    normalized.includes("return policy") ||
    normalized.includes("support period")
  );
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  try {
    const product = await zowkinsApi.getProductBySlug(params.slug);
    return {
      title: product.name,
      description: product.description,
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return { title: "Product not found" };
    }

    return { title: "Product details" };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  let product: ProductDetails;
  let loadError: string | null = null;

  try {
    product = await zowkinsApi.getProductBySlug(params.slug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }

    loadError =
      error instanceof Error
        ? error.message
        : "Unable to load product details right now.";

    product = {
      id: params.slug,
      slug: params.slug,
      name: "Product details unavailable",
      description:
        "The product specification data could not be loaded from the backend right now.",
      price: 0,
      inStock: false,
      visible: true,
      images: ["/desktop.jpg"],
      specs: null,
      specifications: null,
      category: "Unknown",
      subcategory: "",
      image: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as ProductDetails;
  }

  const resolvedGallery = [
    ...(Array.isArray(product.images) ? product.images : []),
    product.image,
  ]
    .map((entry) => resolveImageSource(entry, "/desktop.jpg"))
    .map((src) => src.trim())
    .filter(Boolean);

  const gallery = Array.from(new Set(resolvedGallery));
  const imageUrl = gallery[0] || "/desktop.jpg";
  const categoryLabel = getDisplayLabel(product.category, "Unknown");
  const subcategoryLabel = getDisplayLabel(product.subcategory, "");
  const cartSpec = subcategoryLabel || categoryLabel;

  const specs = coerceSpecs(product.specs ?? product.specifications);
  const specEntries = (() => {
    if (!specs) return [];

    if (Array.isArray(specs)) {
      const entries = specs
        .map((entry) => {
          if (!entry) return null;
          if (Array.isArray(entry) && entry.length >= 2) {
            return [String(entry[0]), entry[1]] as const;
          }
          if (typeof entry === "object") {
            const record = entry as Record<string, unknown>;
            const key =
              (typeof record.key === "string" && record.key.trim()) ||
              (typeof record.name === "string" && record.name.trim()) ||
              (typeof record.label === "string" && record.label.trim()) ||
              "";
            const value =
              record.value ??
              record.val ??
              record.data ??
              record.spec ??
              record.detail ??
              record.description;
            if (!key) return null;
            return [key, value] as const;
          }
          return null;
        })
        .filter((entry): entry is readonly [string, unknown] => Boolean(entry));
      return entries.filter(
        ([key, value]) => Boolean(key) && value != null && String(value).trim(),
      );
    }

    if (typeof specs === "object") {
      return Object.entries(specs as Record<string, unknown>).filter(
        ([key, value]) => Boolean(key) && value != null && String(value).trim(),
      );
    }

    return [];
  })();

  const warrantySpecs = specEntries.filter(([key]) => isWarrantyKey(key));
  const nonWarrantySpecs = specEntries.filter(([key]) => !isWarrantyKey(key));
  const quickSpecs = nonWarrantySpecs.slice(0, 4);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#050b16_0%,#07142a_48%,#0b1d3b_100%)] text-slate-100">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-10 lg:py-12">
        <div className="grid gap-6 lg:grid-cols-[1.12fr_0.88fr] xl:gap-8">
          <section className="space-y-6 lg:pt-2">
            <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#0a1020] shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
              <ProductImageGallery
                images={gallery}
                alt={product.name}
                badgeLabel={product.visible ? "Visible" : "Hidden"}
              />
            </div>

            {loadError ? (
              <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 px-5 py-4 text-amber-900">
                <p className="text-sm font-semibold">Product details are temporarily unavailable.</p>
                <p className="mt-1 text-sm leading-6">
                  {loadError}. The page is showing a fallback view until the backend responds again.
                </p>
              </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-white/55">
                  Category
                </p>
                <p className="mt-2 font-medium text-white">{categoryLabel}</p>
              </div>
              <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-white/55">
                  Stock
                </p>
                <p className="mt-2 font-medium text-white">
                  {product.inStock ? "Ready now" : "Out of stock"}
                </p>
              </div>
            </div>

            {quickSpecs.length ? (
              <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-5">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-white/55">
                      Highlights
                    </p>
                    <h2 className="mt-2 font-display text-xl font-bold text-white">
                      Quick product facts
                    </h2>
                  </div>
                  <p className="text-sm text-slate-300">
                    A compact view of the most useful specs.
                  </p>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {quickSpecs.map(([key, value]) => (
                    <div
                      key={`highlight-${key}`}
                      className="rounded-[1.15rem] border border-white/10 bg-[#081224] px-4 py-3"
                    >
                      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/45">
                        {key}
                      </p>
                      <p className="mt-1 text-sm font-semibold leading-6 text-white break-words">
                        {formatSpecValue(value)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </section>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-[2rem] border border-white/10 bg-[#0a1020] px-6 py-7 shadow-[0_20px_60px_rgba(0,0,0,0.22)] md:px-8 md:py-8">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex rounded-full border border-[#f3c74d]/25 bg-[#f3c74d]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#f3c74d]">
                  Product details
                </span>
                <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/65">
                  {categoryLabel}
                </span>
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] ${
                    product.inStock
                      ? "bg-emerald-500/10 text-emerald-300"
                      : "bg-rose-500/10 text-rose-300"
                  }`}
                >
                  {product.inStock ? "In stock" : "Out of stock"}
                </span>
              </div>
              <h1 className="mt-4 max-w-3xl font-display text-3xl font-bold leading-[1.02] tracking-[-0.06em] text-white text-balance sm:text-4xl lg:text-[2.8rem] xl:text-5xl">
                {product.name}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
                {product.description}
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/55">
                    Price
                  </p>
                  <p className="mt-2 text-2xl font-bold text-white">
                    {formatPrice(product.price)}
                  </p>
                </div>
                <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/55">
                    Stock
                  </p>
                  <p className="mt-2 text-2xl font-bold text-white">
                    {product.inStock ? "Ready now" : "Out of stock"}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <AddToCartButton
                  item={{
                    id: getProductId(product) || product.slug,
                    slug: product.slug,
                    title: product.name,
                    price: formatPrice(product.price),
                    spec: cartSpec,
                    image: imageUrl,
                  }}
                  className="rounded-full bg-[#f3c74d] px-6 py-3 text-sm font-semibold text-[#050b16] transition hover:bg-[#e4b935]"
                >
                  Add to cart
                </AddToCartButton>
                <Link
                  href="/cart"
                  className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:border-[#f3c74d]/45 hover:bg-white/10"
                >
                  Review order
                </Link>
              </div>

              {warrantySpecs.length ? (
                <div className="mt-6 rounded-[1.5rem] border border-[#f3c74d]/25 bg-[linear-gradient(180deg,rgba(243,199,77,0.12),rgba(255,255,255,0.04))] p-4">
                  <div className="flex items-start gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#f3c74d] text-[#050b16]">
                      <svg
                        viewBox="0 0 24 24"
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                      >
                        <path
                          d="M12 3.5l7 3.5v4.5c0 4.6-3.2 8.8-7 9.9-3.8-1.1-7-5.3-7-9.9V7l7-3.5z"
                          strokeWidth="1.8"
                        />
                        <path
                          d="M9.2 12.2l1.9 1.9L15.6 9.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.9"
                        />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs uppercase tracking-[0.28em] text-[#f3c74d]">
                        Warranty
                      </p>
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        {warrantySpecs.map(([key, value]) => (
                          <div
                            key={`warranty-${key}`}
                            className="rounded-[1.15rem] border border-white/10 bg-[#081224] px-4 py-3"
                          >
                            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/45">
                              {key}
                            </p>
                            <p className="mt-1 text-sm font-semibold leading-6 text-white break-words">
                              {formatSpecValue(value)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

            </div>
          </aside>
        </div>

        <section className="mt-6 rounded-[2rem] border border-white/10 bg-[#081224] p-5 shadow-[0_18px_48px_rgba(0,0,0,0.18)] md:p-6 lg:mt-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-white/55">
                Specifications
              </p>
              <h2 className="mt-2 text-2xl font-bold text-white md:text-3xl">
                Everything in one view
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-slate-300">
              Dense cards and a multi-column layout keep the full spec sheet
              readable without forcing a long vertical scroll.
            </p>
          </div>

          {nonWarrantySpecs.length ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {nonWarrantySpecs.map(([key, value]) => (
                <div
                  key={key}
                  className="h-full rounded-[1.2rem] border border-white/10 bg-white/5 p-4"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/45">
                    {key}
                  </p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-white break-words">
                    {formatSpecValue(value)}
                  </p>
                </div>
              ))}
            </div>
          ) : specs ? (
            <pre className="mt-5 whitespace-pre-wrap break-words rounded-[1.2rem] border border-white/10 bg-white/5 p-4 text-xs text-slate-200">
              {typeof specs === "string" ? specs : JSON.stringify(specs, null, 2)}
            </pre>
          ) : (
            <p className="mt-5 text-sm text-slate-300">
              No specifications were added for this product yet.
            </p>
          )}
        </section>
      </main>
    </div>
  );
}
