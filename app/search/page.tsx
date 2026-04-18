import Link from "next/link";
import Navbar from "../../components/NewNavbar";
import { searchCatalog } from "../../lib/catalog";
import type { CatalogItem } from "../../lib/catalog";

type SearchPageProps = {
  searchParams?: {
    q?: string;
  };
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams?.q?.trim() ?? "";
  let results: CatalogItem[] = [];
  try {
    results = await searchCatalog(query);
  } catch (error) {
    console.error("Search failed:", error);
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#050b16_0%,#07142a_48%,#0b1d3b_100%)] text-slate-100">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <section className="rounded-[2rem] border border-white/10 bg-[#0a1020] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)] md:p-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-[#f3c74d]">
                Explore Catalog
              </p>
              <h1 className="mt-2 font-display text-3xl font-bold text-white md:text-4xl">
                {query ? `Results for "${query}"` : "Search the catalog"}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
                Find laptops, desktops, and accessories across all product
                categories.
              </p>
            </div>
            <Link
              href="/categories"
              className="inline-flex items-center justify-center rounded-full bg-[#f3c74d] px-6 py-3 text-sm font-semibold text-[#050b16] transition hover:bg-[#e4b935]"
            >
              Browse categories
            </Link>
          </div>

          <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300 backdrop-blur-sm">
            Search tip: try brand names (HP, Dell), product types (Dock,
            Monitor), or specific models.
          </div>
        </section>

        <section className="mt-10">
          {!query ? (
            <div className="rounded-[2rem] border border-dashed border-white/15 bg-[#0a1020] p-16 text-center text-slate-400">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
                <svg
                  className="h-8 w-8 text-white/20"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              Enter a search in the navbar to see products here.
            </div>
          ) : results.length === 0 ? (
            <div className="rounded-[2rem] border border-white/10 bg-[#0a1020] p-16 text-center shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
              <p className="text-xl font-semibold text-white">
                No matches found for "{query}"
              </p>
              <p className="mt-2 text-sm text-slate-400">
                Try a different keyword, brand, or product type.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link
                  href="/categories"
                  className="rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
                >
                  Browse categories
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {results.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="group overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#0a1020] shadow-[0_18px_40px_rgba(0,0,0,0.18)] transition hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(0,0,0,0.24)]"
                >
                  <div className="relative h-52 w-full overflow-hidden bg-slate-900/50">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-full w-full object-cover opacity-90 transition duration-500 group-hover:scale-105 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050b16]/60 to-transparent" />
                  </div>
                  <div className="space-y-4 p-6">
                    <div className="flex items-center justify-between gap-3">
                      <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#f3c74d]">
                        {item.brand}
                      </span>
                      <span className="text-lg font-bold text-white">
                        {item.price}
                      </span>
                    </div>
                    <div>
                      <h2 className="font-display text-xl font-bold text-white group-hover:text-[#f3c74d] transition-colors">
                        {item.title}
                      </h2>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-white/40">
                        {item.category}
                      </p>
                    </div>
                    <p className="line-clamp-2 text-sm leading-6 text-slate-300">
                      {item.description}
                    </p>
                    <div className="flex items-center gap-2 pt-2 text-sm font-semibold text-[#f3c74d]">
                      View details
                      <span
                        aria-hidden="true"
                        className="transition-transform group-hover:translate-x-1"
                      >
                        &rarr;
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
