import type { Metadata } from "next";
import Navbar from "../../components/NewNavbar";
import Carousel from "../../components/Carousel";

export const metadata: Metadata = {
  title: "Trusted Suppliers",
  description: "Browse the brands and suppliers Zowkins Enterprise stocks and sources from.",
};

const suppliers = [
  { title: "HP", img: "/hplogo.jpg", href: "/laptops/hp", category: "Laptops" },
  { title: "Dell", img: "/delllogo.jpg", href: "/laptops/dell", category: "Laptops" },
  { title: "Lenovo", img: "/lenovologo.jpg", href: "/laptops/lenovo", category: "Laptops" },
  { title: "Asus", img: "/asuslogo.jpg", href: "/laptops", category: "Laptops" },
  { title: "Logitech", img: "/logitech.jpg", href: "/accessories", category: "Accessories" },
  { title: "Canon", img: "/canonlogo.jpg", href: "/accessories", category: "Accessories" },
  { title: "Premax", img: "/premaxlogo.png", href: "/accessories", category: "Accessories" },
  { title: "Apple", img: "/applelogo.jpg", href: "/laptops/apple", category: "Laptops" },
  { title: "Microsoft", img: "/microsoft%20logo.jpg", href: "/request-quote", category: "Services" },
];

export default function SuppliersPage() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#050b16_0%,#07142a_48%,#0b1d3b_100%)] text-slate-100">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
        <section className="overflow-hidden rounded-[2.5rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(11,29,59,0.98),rgba(7,12,24,0.96)_55%,rgba(5,11,22,0.99)_100%)] shadow-[0_18px_50px_rgba(0,0,0,0.24)]">
          <div className="px-5 py-10 sm:px-8 sm:py-12">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.45em] text-white/55 sm:text-sm">
                Trusted suppliers
              </p>
              <h1 className="mt-3 font-display text-3xl font-bold text-white md:text-5xl">
                Brands we stock and source from
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-300 md:text-base">
                These are the supplier brands we currently work with across laptops, desktops, and accessories.
              </p>
            </div>

            <div className="mt-8 grid gap-3 text-center sm:grid-cols-3">
              {[
                { label: "Partner brands", value: String(suppliers.length) },
                { label: "Product categories", value: "3" },
                { label: "Always updated", value: "Live" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-[1.25rem] border border-white/10 bg-white/5 px-4 py-4 text-left shadow-[0_10px_24px_rgba(0,0,0,0.12)] backdrop-blur"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/50">
                    {item.label}
                  </p>
                  <p className="mt-2 font-display text-2xl font-bold text-white">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-10 rounded-[2rem] border border-white/15 bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(255,255,255,0.95))] px-4 py-6 text-slate-900 shadow-[0_18px_50px_rgba(0,0,0,0.18)] sm:px-6 sm:py-8">
              <div className="mb-4 flex items-center justify-between gap-4">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#0a2a78]">
                  Our trusted network
                </p>
                <p className="text-xs font-medium tracking-[0.22em] text-slate-500">
                  Swipe to browse
                </p>
              </div>
              <div className="mt-4">
                <Carousel variant="logo" slides={suppliers} />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
