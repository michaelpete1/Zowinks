import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "../../components/NewNavbar";
import InfoStrip from "../../components/InfoStrip";
import AddToCartButton from "../../components/AddToCartButton";

export const metadata: Metadata = {
  title: "Accessories",
  description: "Browse docks, keyboards, mice, printers, and other business accessories.",
};

const products = [
  {
    id: "docking-stations",
    title: "Docking Stations",
    spec: "Thunderbolt hubs with dual display support and power delivery.",
    price: "₦199",
  },
  {
    id: "monitors",
    title: "Monitors",
    spec: "4K IPS displays with USB-C connectivity and ergonomic stands.",
    price: "₦349",
  },
  {
    id: "keyboards-mice",
    title: "Keyboards and Mice",
    spec: "Reliable input devices for office and hybrid work setups.",
    price: "₦89",
  },
  {
    id: "canon-pixma-g3430",
    title: "Canon PIXMA G3430",
    spec: "Ink tank printer with wireless printing for home and office use.",
    price: "₦189",
  },
  {
    id: "canon-imageclass-mf3010",
    title: "Canon imageCLASS MF3010",
    spec: "Compact mono laser printer for fast document workflows.",
    price: "₦219",
  },
];

export default function Accessories() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#050b16_0%,#07142a_48%,#0b1d3b_100%)] text-slate-100">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-10 md:px-8 md:py-14">
        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#0a1020] shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
          <div className="grid gap-8 px-6 py-10 md:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:px-14 lg:py-14">
            <div className="space-y-6">
              <p className="text-xs uppercase tracking-[0.35em] text-emerald-700">Accessories</p>
              <h1 className="font-display text-4xl font-bold leading-tight md:text-5xl">
                Practical accessories for modern workstations.
              </h1>
              <p className="max-w-2xl text-lg leading-7 text-slate-600">
                From docking stations to keyboards, our accessories category covers the hardware that keeps
                teams productive every day.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/cart" className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                  Open order form
                </Link>
                <Link href="/contact" className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-900">
                  Request a Quote
                </Link>
                <Link href="/laptops/asus" className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-900">
                  View Asus laptops
                </Link>
              </div>
            </div>

            <InfoStrip
              items={[
                { label: "Category", value: "3 accessory groups" },
                { label: "Connectivity", value: "USB-C ready" },
                { label: "Ordering", value: "Bulk procurement" },
              ]}
            />
          </div>
        </section>

        <section className="mt-14">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Popular items</p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-slate-900">Reliable add-ons and Canon devices for your setup.</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <article key={product.id} className="rounded-[2rem] border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
                <div className="flex h-52 items-center justify-center bg-[linear-gradient(180deg,#eff6ff_0%,#dbeafe_100%)]">
                  <svg className="h-14 w-14 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
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


