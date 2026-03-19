import Link from "next/link";
import Navbar from "../../components/NewNavbar";
import { searchCatalog } from "../../lib/catalog";

type SearchPageProps = {
  searchParams?: {
    q?: string;
  };
};

export default function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams?.q?.trim() ?? "";
  const results = searchCatalog(query);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] md:p-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-emerald-700">
                Search results
              </p>
              <h1 className="mt-2 font-display text-3xl font-bold text-slate-900 md:text-4xl">
                {query ? `Results for "${query}"` : "Search the catalog"}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
                Find laptops, desktops, and accessories across HP, Dell, Lenovo, and Zowkins accessories.
              </p>
            </div>
            <Link
              href="/laptops"
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Browse brands
            </Link>
          </div>

          <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            Search tip: try brand names like HP, Dell, Lenovo, or product terms like dock, monitor, headset.
          </div>
        </section>

        <section className="mt-10">
          {!query ? (
            <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">
              Enter a search in the navbar to see products here.
            </div>
          ) : results.length === 0 ? (
            <div className="rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
              <p className="text-lg font-semibold text-slate-900">No matches found</p>
              <p className="mt-2 text-sm text-slate-600">
                Try a different keyword, brand, or product type.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link href="/laptops/hp" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold hover:border-slate-900">
                  HP laptops
                </Link>
                <Link href="/laptops/dell" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold hover:border-slate-900">
                  Dell laptops
                </Link>
                <Link href="/laptops/lenovo" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold hover:border-slate-900">
                  Lenovo laptops
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {results.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="group overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(15,23,42,0.12)]"
                >
                  <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="space-y-3 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                        {item.brand}
                      </span>
                      <span className="text-sm font-semibold text-slate-900">
                        {item.price}
                      </span>
                    </div>
                    <div>
                      <h2 className="font-display text-xl font-semibold text-slate-900">
                        {item.title}
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">
                        {item.category}
                      </p>
                    </div>
                    <p className="text-sm leading-6 text-slate-600">
                      {item.description}
                    </p>
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700">
                      View product
                      <span aria-hidden="true">&rarr;</span>
                    </span>
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
