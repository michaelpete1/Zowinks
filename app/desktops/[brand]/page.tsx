import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import Navbar from "../../../components/NewNavbar";
import AddToCartButton from "../../../components/AddToCartButton";
import { zowkinsApi, ProductDetails, ApiError } from "../../../lib/zowkins-api";
import { formatPrice } from "../../../lib/catalog";
import { resolveImageSource } from "../../../lib/media";

type Props = {
  params: { brand: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const brandName =
    params.brand.charAt(0).toUpperCase() + params.brand.slice(1);
  return {
    title: `${brandName} Desktops`,
    description: `Browse the latest ${brandName} business desktops and compact workstations.`,
  };
}

export default async function DesktopBrandPage({ params }: Props) {
  const { brand } = params;

  let products: ProductDetails[] = [];
  let category: any = null;

  try {
    const response = await zowkinsApi.listCategoryProducts("desktops", {
      subcategories: [brand],
      page: 1,
      limit: 50,
    });
    products = response.products || [];

    category = await zowkinsApi.getCategoryBySlug("desktops");
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    console.error("Error fetching desktop brand products:", error);
  }

  if (!category && products.length === 0) {
    notFound();
  }

  const brandName = brand.charAt(0).toUpperCase() + brand.slice(1);
  const subcategoryData = category?.subcategories?.find(
    (s: any) => s.slug === brand,
  );
  const displayName = subcategoryData?.name || brandName;

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#050b16_0%,#07142a_48%,#0b1d3b_100%)] text-slate-100">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-10 md:px-8 md:py-14">
        <section className="grid overflow-hidden rounded-[2rem] border border-white/10 bg-[#0a1020] shadow-[0_20px_60px_rgba(0,0,0,0.22)] lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6 px-6 py-10 md:px-10 md:py-14 lg:px-14 lg:py-16">
            <p className="text-xs uppercase tracking-[0.35em] text-[#f3c74d]">
              Desktop collection
            </p>
            <h1 className="font-display text-4xl font-bold leading-tight text-white md:text-5xl">
              {displayName} systems for business performance.
            </h1>
            <p className="max-w-2xl text-lg leading-7 text-slate-300">
              Browse enterprise-ready {displayName} desktop systems for teams
              that need consistent performance, clean deployment, and reliable
              support.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/cart"
                className="rounded-full bg-[#f3c74d] px-6 py-3 text-sm font-semibold text-[#050b16] transition hover:bg-[#e4b935]"
              >
                Order form
              </Link>
              <Link
                href="/desktops"
                className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:border-[#f3c74d]/45 hover:bg-white/10"
              >
                Back to brands
              </Link>
            </div>
          </div>

          <div className="relative min-h-[320px] bg-[linear-gradient(180deg,#0b1d3b_0%,#12386a_100%)]">
            <Image
              src="/desktop.jpg"
              alt={`${displayName} desktops`}
              fill
              className="object-cover opacity-60 mix-blend-overlay"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,11,22,0.8)_0%,rgba(5,11,22,0.2)_100%)]" />
            <div className="absolute inset-x-0 bottom-0 p-8 text-white md:p-10">
              <p className="text-xs uppercase tracking-[0.35em] text-white/75">
                Selection
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">
                Reliable {displayName} setups.
              </h2>
            </div>
          </div>
        </section>

        <section className="mt-14">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/55">
                Models
              </p>
              <h2 className="font-display text-3xl font-semibold text-white">
                Choose the right {displayName} desktop.
              </h2>
            </div>
          </div>

          {products.length > 0 ? (
            <div className="grid gap-6 lg:grid-cols-3">
              {products.map((product) => (
                <article
                  key={product.id}
                  className="group overflow-hidden rounded-[2rem] border border-white/10 bg-[#0a1020] shadow-[0_16px_40px_rgba(0,0,0,0.18)] transition hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(0,0,0,0.24)]"
                >
                  <div className="relative h-64 overflow-hidden bg-slate-900/50">
                    <Image
                      src={resolveImageSource(product.image)}
                      alt={product.name}
                      fill
                      className="h-full w-full object-cover opacity-90 transition duration-500 group-hover:scale-105 group-hover:opacity-100"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                  <div className="space-y-4 p-6 md:p-7">
                    <div>
                      <h3 className="font-display text-2xl font-semibold text-white">
                        {product.name}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-300">
                        {product.description}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xl font-bold text-white">
                        {formatPrice(product.price)}
                      </span>
                      <AddToCartButton
                        item={{
                          id: product.id,
                          title: product.name,
                          price: formatPrice(product.price),
                          spec: product.subcategory || brandName,
                          image: resolveImageSource(product.image),
                          slug: product.slug,
                        }}
                        className="rounded-full bg-[#f3c74d] px-5 py-2.5 text-sm font-semibold text-[#050b16] transition hover:bg-[#e4b935]"
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
                No {displayName} desktops are currently listed.
              </p>
              <Link
                href="/desktops"
                className="mt-4 inline-block text-[#f3c74d] hover:underline"
              >
                View other brands
              </Link>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
