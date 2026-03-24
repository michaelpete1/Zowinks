import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Navbar from "../../components/NewNavbar";
import InfoStrip from "../../components/InfoStrip";

export const metadata: Metadata = {
  title: "Laptops",
  description: "Compare HP, Dell, Lenovo, Asus, and Apple laptops for business and creative work.",
};

const brands = [
  {
    name: "HP",
    href: "/laptops/hp",
    description: "ProBook, EliteBook, and ZBook options for business users and teams.",
    badge: "Enterprise ready",
    tone: "from-emerald-50 via-white to-slate-50",
    image: "/hp.jpg",
    imageAlt: "HP laptop",
  },
  {
    name: "Dell",
    href: "/laptops/dell",
    description: "Latitude and Precision models for dependable daily performance.",
    badge: "Business choice",
    tone: "from-blue-50 via-white to-slate-50",
    image: "/dell.jpg",
    imageAlt: "Dell laptop",
  },
  {
    name: "Lenovo",
    href: "/laptops/lenovo",
    description: "ThinkPad systems built for durability, mobility, and work continuity.",
    badge: "Hybrid work",
    tone: "from-amber-50 via-white to-slate-50",
    image: "/desktop 2.jpg",
    imageAlt: "Lenovo laptop",
  },
  {
    name: "Asus",
    href: "/laptops/asus",
    description: "ZenBook and ExpertBook options for teams that want modern design and performance.",
    badge: "Creator ready",
    tone: "from-sky-50 via-white to-slate-50",
    image: "/asus.jpg",
    imageAlt: "Asus laptop",
  },
  {
    name: "Apple",
    href: "/laptops/apple",
    description: "Apple Air and Pro options for creative and executive teams.",
    badge: "Premium choice",
    tone: "from-slate-100 via-white to-slate-50",
    image: "/mb.jpg",
    imageAlt: "Apple laptop",
  },
];

export default function Laptops() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#050b16_0%,#07142a_48%,#0b1d3b_100%)] text-slate-100">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-10 md:px-8 md:py-14">
        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#0a1020] shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
          <div className="grid gap-8 bg-[linear-gradient(180deg,#0f172a_0%,#050b16_100%)] px-6 py-10 md:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:px-14 lg:py-14">
            <div className="space-y-6">
              <p className="text-xs uppercase tracking-[0.35em] text-white/55">Laptop brands</p>
              <h1 className="font-display text-4xl font-bold leading-tight text-white md:text-5xl">
                Choose the laptop line that fits your team.
              </h1>
              <p className="max-w-2xl text-lg leading-7 text-slate-300">
                Start with the brand family, then move into the products and pricing that match your workload,
                budget, and support requirements.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/laptops/hp" className="rounded-full bg-[#f3c74d] px-6 py-3 text-sm font-semibold text-[#050b16] transition hover:bg-[#e4b935]">
                  View HP
                </Link>
                <Link href="/laptops/dell" className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:border-[#f3c74d]/45 hover:bg-white/10">
                  View Dell
                </Link>
                <Link href="/laptops/asus" className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:border-[#f3c74d]/45 hover:bg-white/10">
                  View Asus
                </Link>
                <Link href="/laptops/apple" className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:border-[#f3c74d]/45 hover:bg-white/10">
                  View Apple
                </Link>
              </div>
            </div>

            <InfoStrip
              variant="dark"
              items={[
                { label: "Brands", value: "5 collections" },
                { label: "Response", value: "Quotes within 24h" },
                { label: "Use case", value: "Business procurement" },
              ]}
            />
          </div>
        </section>

        <section className="mt-14">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/55">Browse by brand</p>
              <h2 className="font-display text-3xl font-semibold text-white">Open a collection and start comparing.</h2>
            </div>
          </div>

            <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-5">
            {brands.map((brand) => (
              <Link
                key={brand.name}
                href={brand.href}
                className="group overflow-hidden rounded-[2rem] border border-white/10 bg-[#0f172a] shadow-[0_16px_40px_rgba(0,0,0,0.18)] transition hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(0,0,0,0.24)]"
              >
                <div className={`relative h-44 overflow-hidden bg-gradient-to-br ${brand.tone}`}>
                  <Image
                    src={brand.image}
                    alt={brand.imageAlt ?? "Laptop"}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,20,39,0.06)_0%,rgba(9,20,39,0.35)_100%)]" />
                  <div className="absolute left-4 top-4 inline-flex rounded-full bg-slate-950/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-white backdrop-blur">
                    {brand.badge}
                  </div>
                </div>
                <div className="space-y-4 p-6">
                  <h3 className="font-display text-3xl font-bold text-white">{brand.name}</h3>
                  <p className="max-w-sm text-sm leading-6 text-slate-300">{brand.description}</p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-sm font-semibold text-slate-400">View collection</span>
                    <span className="text-sm font-semibold text-[#f3c74d] transition group-hover:translate-x-1">Explore &rarr;</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
