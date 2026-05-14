import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "../../../components/NewNavbar";
import AddToCartButton from "../../../components/AddToCartButton";
import ProductImageGallery from "../../../components/ProductImageGallery";
import { ApiError, zowkinsApi } from "../../../lib/zowkins-api";
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
  let product;

  try {
    product = await zowkinsApi.getProductBySlug(params.slug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }

    throw error;
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

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#050b16_0%,#07142a_48%,#0b1d3b_100%)] text-slate-100">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-10 md:px-8 md:py-14">
        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#0a1020] shadow-[0_20px_60px_rgba(0,0,0,0.22)] lg:grid lg:grid-cols-[1.02fr_0.98fr]">
          <ProductImageGallery
            images={gallery}
            alt={product.name}
            badgeLabel={product.visible ? "Visible" : "Hidden"}
          />

          <div className="space-y-6 px-6 py-10 md:px-10 md:py-14 lg:px-12 lg:py-16">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-white/55">
                {categoryLabel}
              </p>
              <h1 className="mt-2 font-display text-4xl font-bold leading-tight text-white md:text-5xl">
                {product.name}
              </h1>
              <p className="mt-3 text-lg leading-7 text-slate-300">
                {product.description}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
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
                  {product.inStock ? "In stock" : "Out of stock"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
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

            <div className="grid gap-3 rounded-[1.5rem] border border-white/10 bg-[#081224] p-5 text-sm text-slate-300 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-white/45">
                  Slug
                </p>
                <p className="mt-1 font-medium text-white">{product.slug}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-white/45">
                  Subcategory
                </p>
                <p className="mt-1 font-medium text-white">
                  {subcategoryLabel || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-white/45">
                  Created
                </p>
                <p className="mt-1 font-medium text-white">
                  {new Date(product.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-white/45">
                  Updated
                </p>
                <p className="mt-1 font-medium text-white">
                  {new Date(product.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="rounded-[1.8rem] border border-white/10 bg-[#081224] p-6">
              <p className="text-xs uppercase tracking-[0.35em] text-white/55">
                Specifications
              </p>
              {specEntries.length ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {specEntries.map(([key, value]) => (
                    <div
                      key={key}
                      className="rounded-[1.25rem] border border-white/10 bg-white/5 px-4 py-3"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/55">
                        {key}
                      </p>
                      <p className="mt-2 text-sm font-semibold text-white">
                        {String(value)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : specs ? (
                <pre className="mt-4 whitespace-pre-wrap break-words rounded-[1.25rem] border border-white/10 bg-white/5 p-4 text-xs text-slate-200">
                  {typeof specs === "string"
                    ? specs
                    : JSON.stringify(specs, null, 2)}
                </pre>
              ) : (
                <p className="mt-4 text-sm text-slate-300">
                  No specifications were added for this product yet.
                </p>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
