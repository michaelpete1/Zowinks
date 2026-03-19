import Navbar from "../../components/NewNavbar";
import Link from "next/link";

export default function Laptops() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="font-display text-4xl font-bold md:text-5xl text-slate-900">
            Laptops
          </h1>
          <p className="mt-4 text-xl text-slate-600">
            Business-ready laptops built for performance and reliability.
          </p>
        </div>

        <section className="grid gap-8 lg:grid-cols-3">
          <div className="group rounded-3xl bg-white p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-100">
            <div className="mb-4 h-52 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-2xl flex items-center justify-center">
              <svg
                className="h-24 w-24 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="font-display text-xl font-bold mb-2">
              HP ProBook 440 G11
            </h3>
            <p className="text-slate-600 mb-2">
              Intel Core Ultra 5 • 16GB RAM • 512GB SSD
            </p>
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs">
                Windows 11 Pro
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs">
                14&#34; FHD
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-emerald-700">
                $1,249
              </span>
              <button className="rounded-full bg-emerald-600 text-white px-6 py-2 font-semibold hover:bg-emerald-700 transition">
                Configure
              </button>
            </div>
          </div>

          <div className="group rounded-3xl bg-white p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-100">
            <div className="mb-4 h-52 bg-gradient-to-br from-gray-100 to-slate-200 rounded-2xl flex items-center justify-center">
              <svg
                className="h-24 w-24 text-slate-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="font-display text-xl font-bold mb-2">
              HP EliteBook 845 G11
            </h3>
            <p className="text-slate-600 mb-2">
              AMD Ryzen 7 PRO • 32GB RAM • 1TB SSD
            </p>
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs">
                Windows 11 Pro
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-orange-100 text-orange-700 text-xs">
                14&#34; WUXGA
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-emerald-700">
                $1,799
              </span>
              <button className="rounded-full bg-emerald-600 text-white px-6 py-2 font-semibold hover:bg-emerald-700 transition">
                Configure
              </button>
            </div>
          </div>

          <div className="group rounded-3xl bg-white p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-100">
            <div className="mb-4 h-52 bg-gradient-to-br from-indigo-100 to-purple-200 rounded-2xl flex items-center justify-center">
              <svg
                className="h-24 w-24 text-indigo-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="font-display text-xl font-bold mb-2">
              Dell Latitude 7450
            </h3>
            <p className="text-slate-600 mb-2">
              Intel Core Ultra 7 • 16GB RAM • 512GB SSD
            </p>
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs">
                Ubuntu Linux
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs">
                14&#34; QHD+
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-emerald-700">
                $1,599
              </span>
              <button className="rounded-full bg-emerald-600 text-white px-6 py-2 font-semibold hover:bg-emerald-700 transition">
                Configure
              </button>
            </div>
          </div>
        </section>

        <div className="mt-20 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-8 py-4 text-lg font-semibold text-white transition hover:bg-slate-800"
          >
            ← Back to Home
          </Link>
        </div>
      </main>
    </div>
  );
}
