import Navbar from "../../components/NewNavbar";
import Link from "next/link";

export default function Accessories() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="font-display text-4xl font-bold md:text-5xl text-slate-900">
            Accessories
          </h1>
          <p className="mt-4 text-xl text-slate-600">
            Premium peripherals and docking solutions for every setup.
          </p>
        </div>

        <section className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <div className="group rounded-3xl bg-white p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-100">
            <div className="mb-4 h-48 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center">
              <svg
                className="h-20 w-20 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <h3 className="font-display text-xl font-bold mb-2">
              Docking Stations
            </h3>
            <p className="text-slate-600 mb-4">
              Thunderbolt 4 hubs with dual 4K display support, 100W charging.
            </p>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-emerald-700">
                From $199
              </span>
              <button className="rounded-full bg-emerald-600 text-white px-6 py-2 font-semibold hover:bg-emerald-700 transition">
                Add to Cart
              </button>
            </div>
          </div>

          <div className="group rounded-3xl bg-white p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-100">
            <div className="mb-4 h-48 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center">
              <svg
                className="h-20 w-20 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012 2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h3 className="font-display text-xl font-bold mb-2">Monitors</h3>
            <p className="text-slate-600 mb-4">
              4K IPS panels with USB-C power delivery and ergonomic stands.
            </p>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-emerald-700">
                From $349
              </span>
              <button className="rounded-full bg-emerald-600 text-white px-6 py-2 font-semibold hover:bg-emerald-700 transition">
                Add to Cart
              </button>
            </div>
          </div>

          <div className="group rounded-3xl bg-white p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-100">
            <div className="mb-4 h-48 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center">
              <svg
                className="h-20 w-20 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="font-display text-xl font-bold mb-2">
              Keyboards & Mice
            </h3>
            <p className="text-slate-600 mb-4">
              Mechanical keyboards and precision mice with multi-device pairing.
            </p>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-emerald-700">
                From $89
              </span>
              <button className="rounded-full bg-emerald-600 text-white px-6 py-2 font-semibold hover:bg-emerald-700 transition">
                Add to Cart
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
