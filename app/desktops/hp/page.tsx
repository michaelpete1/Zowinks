import Link from "next/link";
import Image from "next/image";
import Navbar from "../../../components/NewNavbar";
import AddToCartButton from "../../../components/AddToCartButton";

const desktops = [
  {
    id: "hp-elitedesk-800",
    title: "HP EliteDesk 800",
    spec: "Compact business desktop with Intel Core i5 and 16GB RAM.",
    price: "$999",
  },
  {
    id: "hp-prodesk-600",
    title: "HP ProDesk 600",
    spec: "Reliable office desktop with 512GB SSD and expandable memory.",
    price: "$1,149",
  },
  {
    id: "hp-z2-mini",
    title: "HP Z2 Mini",
    spec: "Small form factor workstation for creative and technical teams.",
    price: "$1,799",
  },
];

export default function HPDesktop() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-10 md:px-8 md:py-14">
        <section className="grid overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)] lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6 px-6 py-10 md:px-10 md:py-14 lg:px-14 lg:py-16">
            <p className="text-xs uppercase tracking-[0.35em] text-emerald-700">HP desktops</p>
            <h1 className="font-display text-4xl font-bold leading-tight md:text-5xl">
              Desktop systems built for office reliability.
            </h1>
            <p className="max-w-2xl text-lg leading-7 text-slate-600">
              HP desktops for stable deployments, office environments, and teams that want an organized
              procurement path with dependable hardware.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/laptops/hp" className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                View HP laptops
              </Link>
              <Link href="/cart" className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-900">
                View cart
              </Link>
            </div>
          </div>

          <div className="relative min-h-[320px] bg-[linear-gradient(180deg,#12386a_0%,#1d4f93_100%)]">
            <Image
              src="/d.jpg"
              alt="Business desktop setup"
              fill
              className="object-cover opacity-80 mix-blend-screen [mask-image:linear-gradient(180deg,rgba(0,0,0,0.95)_0%,rgba(0,0,0,0.7)_100%)]"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,25,48,0.72)_0%,rgba(8,25,48,0.2)_100%)]" />
            <div className="absolute inset-x-0 bottom-0 p-8 text-white md:p-10">
              <p className="text-xs uppercase tracking-[0.35em] text-white/75">Featured category</p>
              <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">EliteDesk, ProDesk, and Z2 Mini.</h2>
            </div>
          </div>
        </section>

        <section className="mt-14">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Featured models</p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-slate-900">Choose the HP desktop that fits the office.</h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {desktops.map((desktop) => (
              <article key={desktop.id} className="rounded-[2rem] border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
                <div className="flex h-52 items-center justify-center bg-[linear-gradient(180deg,#ecfeff_0%,#cffafe_100%)]">
                  <svg className="h-12 w-12 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16v10H4z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 20h8M12 16v4" />
                  </svg>
                </div>
                <div className="space-y-4 p-6">
                  <div>
                    <h3 className="font-display text-2xl font-semibold text-slate-900">{desktop.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{desktop.spec}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-emerald-700">{desktop.price}</span>
                    <AddToCartButton
                      item={{ id: desktop.id, title: desktop.title, price: desktop.price, spec: desktop.spec }}
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

