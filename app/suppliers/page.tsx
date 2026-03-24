import type { Metadata } from "next";
import Image from "next/image";
import Navbar from "../../components/NewNavbar";

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
  { title: "Microsoft", img: "/microsoft%20logo.jpg", href: "/contact", category: "Services" },
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

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {suppliers.map((supplier) => (
                <div
                  key={supplier.title}
                  className="group rounded-[1.5rem] border border-white/10 bg-[#0f172a] p-5 shadow-[0_10px_28px_rgba(0,0,0,0.18)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(0,0,0,0.22)]"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white p-3">
                      <Image
                        src={supplier.img}
                        alt={supplier.title}
                        width={120}
                        height={60}
                        className="h-12 w-auto object-contain grayscale transition duration-300 group-hover:grayscale-0"
                      />
                    </div>
                    <div className="min-w-0 flex-1 text-right">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                        {supplier.category}
                      </p>
                      <h2 className="mt-1 font-display text-xl font-bold text-white">
                        {supplier.title}
                      </h2>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
