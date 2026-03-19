import Link from "next/link";
import Navbar from "../../../components/NewNavbar";
import InfoStrip from "../../../components/InfoStrip";
import AddToCartButton from "../../../components/AddToCartButton";

const products = [
  {
    id: "lenovo-thinkpad-t14",
    title: "Lenovo ThinkPad T14",
    spec: "AMD Ryzen 5 PRO, 16GB RAM, 512GB SSD",
    price: "$1,139",
  },
  {
    id: "lenovo-thinkpad-x1-carbon",
    title: "Lenovo ThinkPad X1 Carbon",
    spec: "Intel Core Ultra 7, 32GB RAM, 1TB SSD",
    price: "$2,149",
  },
  {
    id: "lenovo-thinkpad-p1",
    title: "Lenovo ThinkPad P1",
    spec: "Workstation performance for technical teams",
    price: "$2,749",
  },
];

export default function Lenovo() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-10 md:px-8 md:py-14">
        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="grid gap-8 px-6 py-10 md:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:px-14 lg:py-14">
            <div className="space-y-6">
              <p className="text-xs uppercase tracking-[0.35em] text-emerald-700">Lenovo collection</p>
              <h1 className="font-display text-4xl font-bold leading-tight md:text-5xl">
                Lenovo systems made for long workdays.
              </h1>
              <p className="max-w-2xl text-lg leading-7 text-slate-600">
                ThinkPad reliability for hybrid teams, technical users, and business environments
                that need durable hardware and consistent performance.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/laptops" className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                  Back to brands
                </Link>
                <Link href="/cart" className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-900">
                  View cart
                </Link>
              </div>
            </div>

            <InfoStrip
              items={[
                { label: "Models", value: "3 Lenovo options" },
                { label: "Workstyle", value: "Hybrid work ready" },
                { label: "Response", value: "Quotes within 24h" },
              ]}
            />
          </div>
        </section>

        <section className="mt-14">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Featured models</p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-slate-900">Lenovo options for business continuity.</h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {products.map((product) => (
              <article key={product.id} className="rounded-[2rem] border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
                <div className="flex h-52 items-center justify-center bg-[linear-gradient(180deg,#fff7ed_0%,#ffedd5_100%)]">
                  <svg className="h-12 w-12 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="space-y-4 p-6">
                  <div>
                    <h3 className="font-display text-2xl font-semibold text-slate-900">{product.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{product.spec}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-emerald-700">{product.price}</span>
                    <AddToCartButton
                      item={{ id: product.id, title: product.title, price: product.price, spec: product.spec }}
                      className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      Add to cart
                    </AddToCartButton>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}


