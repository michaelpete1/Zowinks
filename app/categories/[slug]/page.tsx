import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "../../../components/NewNavbar";
import AddToCartButton from "../../../components/AddToCartButton";
import { ApiError, zowkinsApi } from "../../../lib/zowkins-api";

type PageProps = {
  params: { slug: string };
  searchParams?: { page?: string; limit?: string };
};

function money(value: number) {
  return value.toLocaleString("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const category = await zowkinsApi.getCategoryBySlug(params.slug);
    return {
      title: category.name,
      description: category.description,
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return { title: "Category not found" };
    }
    return { title: "Category details" };
  }
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const page = Math.max(1, Number(searchParams?.page ?? "1") || 1);
  const limit = Math.max(1, Number(searchParams?.limit ?? "9") || 9);

  let category;
  let productsResponse;

  try {
    [category, productsResponse] = await Promise.all([
      zowkinsApi.getCategoryBySlug(params.slug),
      zowkinsApi.listCategoryProducts(params.slug, { page, limit }),
    ]);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#050b16_0%,#07142a_48%,#0b1d3b_100%)] text-slate-100">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-10 md:px-8 md:py-14">
        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#0a1020] shadow-[0_20px_60px_rgba(0,0,0,0.22)] lg:grid lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6 px-6 py-10 md:px-10 md:py-14 lg:px-12 lg:py-16">
            <p className="text-xs uppercase tracking-[0.35em] text-white/55">Category</p>
            <h1 className="font-display text-4xl font-bold leading-tight text-white md:text-5xl">{category.name}</h1>
            <p className="max-w-2xl text-base leading-7 text-slate-300 md:text-lg">{category.description}</p>
            <div className="flex flex-wrap gap-3">
              <Link href="/categories" className="rounded-full bg-[#0b1d3b] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#12386a]">
                Back to categories
              </Link>
              <Link href="/cart" className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:border-[#f3c74d]/45 hover:bg-white/10">
                Review cart
              </Link>
            </div>
          </div>

          <div className="relative min-h-[320px] bg-[#081224]">
            <Image 
              src={typeof category.image === "string" ? category.image : category.image?.url || "/desktop.jpg"} 
              alt={category.name} 
              fill 
              className="object-cover" 
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,11,22,0.1)_0%,rgba(5,11,22,0.75)_100%)]" />
            <div className="absolute inset-x-0 bottom-0 p-6 md:p-10">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-[1.25rem] bg-white/10 p-4 backdrop-blur">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-white/55">Products</p>
                  <p className="mt-2 font-display text-2xl font-bold text-white">{category.productsCount}</p>
                </div>
                <div className="rounded-[1.25rem] bg-white/10 p-4 backdrop-blur">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-white/55">Pages</p>
                  <p className="mt-2 font-display text-2xl font-bold text-white">{productsResponse.meta.totalPages}</p>
                </div>
                <div className="rounded-[1.25rem] bg-white/10 p-4 backdrop-blur">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-white/55">Visible</p>
                  <p className="mt-2 font-display text-2xl font-bold text-white">{category.visible ? "Yes" : "No"}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-12">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/55">Products</p>
              <h2 className="font-display text-3xl font-semibold text-white">Items in {category.name}</h2>
            </div>
            <span className="text-sm text-slate-400">
              Page {productsResponse.meta.currentPage} of {productsResponse.meta.totalPages}
            </span>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {productsResponse.products.map((product) => (
              <article key={product.id} className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#0a1020] shadow-[0_16px_40px_rgba(0,0,0,0.18)]">
                <div className="relative h-48 bg-slate-900">
                  <Image 
                    src={typeof product.image === "string" ? product.image : product.image?.url || "/desktop.jpg"} 
                    alt={product.name} 
                    fill 
                    className="object-cover" 
                  />
                </div>
                <div className="space-y-3 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                      {(typeof product.subcategory === "object" ? (product.subcategory as any).name : product.subcategory) || (typeof product.category === "object" ? (product.category as any).name : product.category)}
                    </span>
                    <span className="text-sm font-semibold text-[#f3c74d]">{money(product.price)}</span>
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-semibold text-white">{product.name}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-300">{product.description}</p>
                  </div>
                  <AddToCartButton
                    item={{
                      id: product.id,
                      slug: product.slug,
                      title: product.name,
                      price: money(product.price),
                      spec: (typeof product.subcategory === "object" ? (product.subcategory as any).name : product.subcategory) || (typeof product.category === "object" ? (product.category as any).name : product.category),
                      image: typeof product.image === "string" ? product.image : product.image?.url,
                    }}
                    className="w-full rounded-full bg-[#0b1d3b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#12386a]"
                  >
                    Add to cart
                  </AddToCartButton>
                </div>
              </article>
            ))}
          </div>
        </section>

        {productsResponse.meta.totalPages > 1 ? (
          <div className="mt-10 flex flex-wrap gap-3">
            {Array.from({ length: productsResponse.meta.totalPages }, (_, index) => index + 1).map((pageNumber) => (
              <Link
                key={pageNumber}
                href={`/categories/${params.slug}?page=${pageNumber}&limit=${limit}`}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  pageNumber === page
                    ? "bg-[#f3c74d] text-[#050b16]"
                    : "border border-white/10 bg-white/5 text-white hover:border-[#f3c74d]/45 hover:bg-white/10"
                }`}
              >
                {pageNumber}
              </Link>
            ))}
          </div>
        ) : null}
      </main>
    </div>
  );
}
