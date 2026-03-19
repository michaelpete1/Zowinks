import Link from "next/link";
import Image from "next/image";
import Navbar from "../../../components/NewNavbar";
import AddToCartButton from "../../../components/AddToCartButton";

const laptops = [
  {
    id: "hp-probook-440-g11",
    title: "HP ProBook 440 G11",
    spec: "Intel Core Ultra 5, 16GB RAM, 512GB SSD",
    price: "$1,249",
  },
  {
    id: "hp-elitebook-845-g11",
    title: "HP EliteBook 845 G11",
    spec: "AMD Ryzen 7 PRO, 32GB RAM, 1TB SSD",
    price: "$1,799",
  },
  {
    id: "hp-zbook-firefly",
    title: "HP ZBook Firefly",
    spec: "Intel Core Ultra 7, 64GB RAM, 2TB SSD",
    price: "$2,999",
  },
];

export default function HP() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-10 md:px-8 md:py-14">
        <section className="grid overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)] lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6 px-6 py-10 md:px-10 md:py-14 lg:px-14 lg:py-16">
            <p className="text-xs uppercase tracking-[0.35em] text-emerald-700">HP collection</p>
            <h1 className="font-display text-4xl font-bold leading-tight md:text-5xl">
              HP laptops built for serious work.
            </h1>
            <p className="max-w-2xl text-lg leading-7 text-slate-600">
              Browse enterprise-ready HP systems for teams that need consistent performance, clean deployment,
              and reliable support.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/cart" className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                View cart
              </Link>
              <Link href="/laptops" className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-900">
                Back to brands
              </Link>
            </div>
          </div>

          <div className="relative min-h-[320px] bg-[linear-gradient(180deg,#12386a_0%,#1d4f93_100%)]">
            <Image
              src="/hp.jpg"
              alt="HP laptop setup"
              fill
              className="object-cover opacity-70 mix-blend-screen [mask-image:linear-gradient(180deg,rgba(0,0,0,0.95)_0%,rgba(0,0,0,0.7)_100%)]"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,25,48,0.72)_0%,rgba(8,25,48,0.2)_100%)]" />
            <div className="absolute inset-x-0 bottom-0 p-8 text-white md:p-10">
              <p className="text-xs uppercase tracking-[0.35em] text-white/75">Featured brand</p>
              <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">ProBook, EliteBook, and ZBook lines.</h2>
            </div>
          </div>
        </section>

        <section className="mt-14">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Featured models</p>
              <h2 className="font-display text-3xl font-semibold text-slate-900">Choose the right HP device.</h2>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {laptops.map((laptop) => (
              <article key={laptop.id} className="group overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(15,23,42,0.12)]">
                <div className="flex h-64 items-center justify-center bg-[linear-gradient(180deg,#eef6ff_0%,#dbeafe_100%)]">
                  <svg viewBox="0 0 24 24" className="h-12 w-12 text-slate-700" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="space-y-4 p-6 md:p-7">
                  <div>
                    <h3 className="font-display text-2xl font-semibold text-slate-900">{laptop.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{laptop.spec}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-emerald-700">{laptop.price}</span>
                    <AddToCartButton
                      item={{ id: laptop.id, title: laptop.title, price: laptop.price, spec: laptop.spec }}
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

