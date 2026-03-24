import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Navbar from "../../../components/NewNavbar";
import AddToCartButton from "../../../components/AddToCartButton";

export const metadata: Metadata = {
  title: "Apple Laptops",
  description: "Browse Apple Air and Pro laptops for premium mobile work.",
};

const products = [
  {
    id: "apple-air-m3",
    title: "Apple Air M3",
    spec: "Apple M3, 16GB RAM, 512GB SSD",
    price: "₦1,599",
  },
  {
    id: "apple-pro-14-m3-pro",
    title: "Apple Pro 14 M3 Pro",
    spec: "Apple M3 Pro, 18GB RAM, 1TB SSD",
    price: "₦2,499",
  },
  {
    id: "apple-pro-16-m3-max",
    title: "Apple Pro 16 M3 Max",
    spec: "Apple M3 Max, 36GB RAM, 1TB SSD",
    price: "₦3,999",
  },
];

export default function Apple() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#050b16_0%,#07142a_48%,#0b1d3b_100%)] text-slate-100">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-10 md:px-8 md:py-14">
        <section className="grid overflow-hidden rounded-[2rem] border border-white/10 bg-[#0a1020] shadow-[0_20px_60px_rgba(0,0,0,0.22)] lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6 px-6 py-10 md:px-10 md:py-14 lg:px-14 lg:py-16">
            <p className="text-xs uppercase tracking-[0.35em] text-emerald-700">Apple collection</p>
            <h1 className="font-display text-4xl font-bold leading-tight md:text-5xl">
              Apple models for premium mobile work.
            </h1>
            <p className="max-w-2xl text-lg leading-7 text-slate-600">
              Browse Apple Air and Pro systems for teams that need strong battery life, clean design, and
              reliable performance for creative or executive work.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/laptops" className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                Back to brands
              </Link>
              <Link href="/cart" className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-900">
                Open order form
              </Link>
            </div>
          </div>

          <div className="relative min-h-[320px] bg-[linear-gradient(180deg,#12386a_0%,#1d4f93_100%)]">
            <Image
              src="/mb.jpg"
              alt="Apple setup"
              fill
              className="object-cover opacity-80 mix-blend-screen [mask-image:linear-gradient(180deg,rgba(0,0,0,0.95)_0%,rgba(0,0,0,0.7)_100%)]"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,25,48,0.72)_0%,rgba(8,25,48,0.18)_100%)]" />
            <div className="absolute inset-x-0 bottom-0 p-8 text-white md:p-10">
              <p className="text-xs uppercase tracking-[0.35em] text-white/75">Featured brand</p>
              <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">Apple Air and Pro lines.</h2>
            </div>
          </div>
        </section>

        <section className="mt-14">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Featured models</p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-slate-900">Apple options for modern teams.</h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {products.map((product) => (
              <article key={product.id} className="rounded-[2rem] border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
                <div className="flex h-52 items-center justify-center bg-[linear-gradient(180deg,#f8fafc_0%,#e2e8f0_100%)]">
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
                      Order Now
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
