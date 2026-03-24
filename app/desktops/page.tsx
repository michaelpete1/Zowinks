import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Navbar from "../../components/NewNavbar";

export const metadata: Metadata = {
  title: "Desktops",
  description: "Explore HP and Lenovo desktops for office and business deployments.",
};

const desktopBrands = [
  {
    title: "HP Desktops",
    description: "ProDesk, EliteDesk, and compact workstations for office deployments.",
    href: "/desktops/hp",
    image: "/dell desktop.avif",
  },
  {
    title: "Lenovo Desktops",
    description: "ThinkCentre systems for stable business performance and hybrid teams.",
    href: "/desktops/lenovo",
    image: "/lenovo desktop.avif",
  },
];

export default function DesktopsPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-10 md:px-8 md:py-14">
        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="grid gap-8 px-6 py-10 md:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:px-14 lg:py-14">
            <div className="space-y-6">
              <p className="text-xs uppercase tracking-[0.35em] text-amber-700">Desktop collections</p>
              <h1 className="font-display text-4xl font-bold leading-tight md:text-5xl">
                Desktop systems built for business reliability.
              </h1>
              <p className="max-w-2xl text-lg leading-7 text-slate-600">
                Choose between HP and Lenovo desktop lines for office environments, procurement projects,
                and teams that need dependable performance.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/desktops/hp" className="rounded-full bg-[#0b1d3b] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#12386a]">
                  HP desktops
                </Link>
                <Link href="/desktops/lenovo" className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-900">
                  Lenovo desktops
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {desktopBrands.map((brand) => (
                <Link key={brand.title} href={brand.href} className="group overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white shadow-[0_14px_30px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(15,23,42,0.12)]">
                  <div className="relative h-44 overflow-hidden bg-[linear-gradient(180deg,#fff7e1_0%,#f5e2aa_100%)]">
                    <Image src={brand.image} alt={brand.title} fill className="object-cover transition duration-500 group-hover:scale-105" />
                  </div>
                  <div className="p-5">
                    <h2 className="font-display text-xl font-bold text-slate-900">{brand.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{brand.description}</p>
                    <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-amber-700">
                      View collection <span aria-hidden="true">&rarr;</span>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
