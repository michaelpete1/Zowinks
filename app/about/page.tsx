import Navbar from "../../components/NewNavbar";
import Link from "next/link";

export default function About() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 py-16">
        <div className="text-center">
          <h1 className="font-display text-4xl font-bold md:text-5xl">
            About Zowkins
          </h1>
          <p className="mt-4 text-xl text-slate-600">
            Your trusted partner in enterprise IT procurement.
          </p>
        </div>

        <section className="mt-16 grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl font-bold">Who We Are</h2>
            <p className="mt-4 text-lg text-slate-600">
              Zowkins Enterprise LTD is a Dubai-based supplier of premium IT
              hardware for businesses. We specialize in laptops, desktops,
              networking gear, and accessories with fast delivery, expert
              support, and competitive pricing.
            </p>
            <ul className="mt-6 space-y-2 text-slate-600">
              <li>• Authorized distributor</li>
              <li>• 24/7 support team</li>
              <li>• Bulk procurement specialist</li>
              <li>• Dubai-based warehouse</li>
            </ul>
          </div>
          <div className="space-y-6">
            <h2 className="font-display text-2xl font-bold">Our Mission</h2>
            <p className="text-lg text-slate-600">
              Empower businesses with reliable IT infrastructure that scales
              with growth. From small teams to enterprise deployments, we make
              procurement simple and stress-free.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-emerald-50 p-6 text-center">
                <div className="mx-auto mb-3 h-12 w-12 rounded-xl bg-emerald-100 p-3">
                  <svg
                    className="h-6 w-6 text-emerald-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold">Fast Delivery</h3>
              </div>
              <div className="rounded-2xl bg-amber-50 p-6 text-center">
                <div className="mx-auto mb-3 h-12 w-12 rounded-xl bg-amber-100 p-3">
                  <svg
                    className="h-6 w-6 text-amber-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold">Quality Guaranteed</h3>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-20 flex justify-center">
          <Link
            href="/"
            className="rounded-full bg-slate-900 px-8 py-4 text-lg font-semibold text-white transition hover:bg-slate-800"
          >
            Back to Home
          </Link>
        </div>
      </main>
    </div>
  );
}
