import Navbar from "../../components/NewNavbar";
import Link from "next/link";

const brands = [
  {
    name: "HP",
    href: "/laptops/hp",
    accent: "from-emerald-500/20 via-white to-slate-50",
    border: "border-emerald-200",
    badge: "Enterprise ready",
    description: "ProBook, EliteBook, and ZBook lines for business users and teams.",
  },
  {
    name: "Dell",
    href: "/laptops/dell",
    accent: "from-blue-500/20 via-white to-slate-50",
    border: "border-blue-200",
    badge: "Latitude series",
    description: "Dependable Latitude machines for operations, finance, and field work.",
  },
  {
    name: "Lenovo",
    href: "/laptops/lenovo",
    accent: "from-amber-500/20 via-white to-slate-50",
    border: "border-amber-200",
    badge: "ThinkPad class",
    description: "ThinkPad performance and durability for modern hybrid work.",
  },
];

export default function Laptops() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-16">
        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="grid gap-10 bg-[radial-gradient(circle_at_top_right,_rgba(16,185,129,0.14),_transparent_30%),linear-gradient(180deg,_#ffffff,_#f8fafc)] px-6 py-12 md:px-10 lg:grid-cols-[1.1fr_0.9fr] lg:px-14 lg:py-14">
            <div className="space-y-6">
              <p className="text-xs uppercase tracking-[0.35em] text-emerald-700">
                Laptop brands
              </p>
              <h1 className="font-display text-4xl font-bold leading-tight text-slate-900 md:text-5xl">
                Choose the brand that fits your team.
              </h1>
              <p className="max-w-2xl text-lg text-slate-600">
                Browse our main laptop families and jump straight into brand-specific pages for HP,
                Dell, and Lenovo.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/laptops/hp"
                  className="rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-700"
                >
                  Shop HP &rarr;
                </Link>
                <Link
                  href="/laptops/dell"
                  className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-900"
                >
                  Shop Dell &rarr;
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-3xl font-bold text-slate-900">3</p>
                <p className="mt-1 text-sm text-slate-600">Brand collections</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-3xl font-bold text-slate-900">24h</p>
                <p className="mt-1 text-sm text-slate-600">Quote turnaround</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-3xl font-bold text-slate-900">B2B</p>
                <p className="mt-1 text-sm text-slate-600">Business procurement</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-14">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                Select a brand
              </p>
              <h2 className="font-display text-3xl font-semibold text-slate-900">
                Jump into the right laptop family
              </h2>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {brands.map((brand) => (
              <Link
                key={brand.name}
                href={brand.href}
                className={`group rounded-[2rem] border ${brand.border} bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(15,23,42,0.12)]`}
              >
                <div className={`rounded-[1.5rem] bg-gradient-to-br ${brand.accent} p-5`}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="inline-flex rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-white">
                        {brand.badge}
                      </span>
                      <h3 className="mt-4 font-display text-3xl font-bold text-slate-900">
                        {brand.name}
                      </h3>
                    </div>
                    <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white shadow-sm">
                      <svg
                        viewBox="0 0 24 24"
                        className="h-7 w-7 text-slate-900"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <path d="M4 6h16v10H4z" />
                        <path d="M8 20h8" />
                        <path d="M12 16v4" />
                      </svg>
                    </div>
                  </div>
                  <p className="mt-4 max-w-sm text-sm leading-6 text-slate-600">
                    {brand.description}
                  </p>
                </div>
                <div className="mt-5 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-500">
                    View brand collection
                  </span>
                  <span className="text-sm font-semibold text-emerald-700 transition group-hover:translate-x-1">
                    Explore &rarr;
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
