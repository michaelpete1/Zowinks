import Image from "next/image";
import Link from "next/link";
import Navbar from "../components/NewNavbar";
import Carousel from "../components/Carousel";
import AddToCartButton from "../components/AddToCartButton";
const valueProps = [
  {
    title: "Trusted Supplier",
    body: "Authorized distributor with genuine stock and verified warranties.",
  },
  {
    title: "Expert Support",
    body: "On-site setup, fast replacements, and priority SLA options.",
  },
  {
    title: "Competitive Pricing",
    body: "Bulk discounts, flexible quotes, and transparent invoicing.",
  },
];

const featured = [
  {
    title: "HP ProBook Series",
    label: "Business Performance",
    price: "$849",
    spec: "Business Performance",
    img: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=900&auto=format&fit=crop",
  },
  {
    title: "HP EliteBook",
    label: "Premium Laptops",
    price: "$1,199",
    spec: "Premium Laptops",
    img: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=900&auto=format&fit=crop",
  },
  {
    title: "Networking Equipment",
    label: "Advanced Connectivity",
    price: "$229",
    spec: "Advanced Connectivity",
    img: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=900&auto=format&fit=crop",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <section className="relative h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(34,197,94,0.08),_transparent)]" />
        </div>
        <div className="relative z-10 text-center animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]">
          <Image
            src="/zowinkss-removebg-preview.png"
            alt="Zowkins"
            width={400}
            height={400}
            className="mx-auto h-96 w-auto drop-shadow-2xl animate-[bounce_3s_ease-in-out_infinite] md:h-[500px]"
            priority
          />
        </div>
      </section>

      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.35),_transparent_60%)]" />
        <div className="absolute inset-0 opacity-40">
          <div className="h-full w-full bg-[linear-gradient(120deg,_rgba(252,211,77,0.35),_transparent_60%)]" />
        </div>
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
          <div className="relative z-10 space-y-6 animate-[fadeIn_1s_ease-out]">
            <p className="text-xs uppercase tracking-[0.4em] text-amber-200">
              Zowkins Pro Store
            </p>
            <h1 className="font-display text-4xl font-semibold leading-tight md:text-5xl text-white drop-shadow-2xl">
              Empowering your business with future-ready IT equipment
            </h1>
            <p className="max-w-xl text-lg text-slate-100 drop-shadow-xl">
              Curated laptops, desktops, and network gear built for reliability,
              performance, and scale. Get expert guidance and fast procurement
              for every team size.
            </p>
            <div className="flex flex-wrap gap-3">
              <button className="rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-slate-950 shadow-[0_0_40px_rgba(252,211,77,0.35)] transition hover:bg-amber-300">
                Explore Products
              </button>
              <button className="rounded-full border border-slate-600 px-6 py-3 text-sm font-semibold text-white transition hover:border-white">
                Get a Quote
              </button>
            </div>
            <div className="grid gap-4 text-sm text-slate-300 sm:grid-cols-3">
              <div>
                <p className="text-lg font-semibold text-white drop-shadow-md">
                  2,400+
                </p>
                <p className="text-slate-200 drop-shadow">Devices delivered</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-white drop-shadow-md">
                  24/7
                </p>
                <p className="text-slate-200 drop-shadow">Support response</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-white drop-shadow-md">
                  48h
                </p>
                <p className="text-slate-200 drop-shadow">Bulk turnaround</p>
              </div>
            </div>
          </div>
          <div className="relative animate-[rise_1.1s_ease-out]">
            <div className="absolute -right-6 top-10 hidden h-44 w-44 rounded-full border border-emerald-400/40 lg:block animate-[floatSlow_6s_ease-in-out_infinite]" />
            <div className="absolute -left-8 bottom-10 hidden h-24 w-24 rounded-full border border-white/20 lg:block animate-[floatSlow_7s_ease-in-out_infinite]" />
            <div className="relative z-10 overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=1200&auto=format&fit=crop"
                alt="Premium laptops and accessories"
                className="h-80 w-full object-cover md:h-[420px]"
              />
              <div className="absolute bottom-6 left-6 rounded-2xl bg-white/90 backdrop-blur-md border border-white/50 p-4 shadow-2xl">
                <p className="text-xs uppercase tracking-[0.2em] font-semibold text-slate-900">
                  New Arrival
                </p>
                <p className="text-lg font-bold text-slate-900 mt-1">
                  Zowkins Pro Kit
                </p>
                <p className="text-sm text-slate-700 mt-0.5">
                  Laptop + Dock + Monitor bundle
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 space-y-20">
        <Carousel
          title="Featured Laptops"
          slides={[
            {
              img: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&auto=format&fit=crop&q=80",
              title: "HP",
              href: "/laptops/hp",
            },
            {
              img: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&auto=format&fit=crop&q=80",
              title: "Lenovo",
              href: "/laptops/lenovo",
            },
            {
              img: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80",
              title: "Dell",
              href: "/laptops/dell",
            },
          ]}
        />
        <Carousel
          title="Featured Desktops"
          slides={[
            {
              img: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80",
              title: "HP",
              href: "/desktops/hp",
            },
            {
              img: "https://images.unsplash.com/photo-1581232321812-9d00e8451d1d?w=800&auto=format&fit=crop&q=80",
              title: "Lenovo",
              href: "/desktops/lenovo",
            },
            {
              img: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80",
              title: "Dell",
              href: "/desktops/dell",
            },
          ]}
        />
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Why choose Zowkins
            </p>
            <h2 className="font-display text-3xl font-semibold">
              We make procurement simple
            </h2>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {valueProps.map((card) => (
              <div
                key={card.title}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.12)]"
              >
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      d="M12 2l7 4v6c0 5-3.5 9-7 10-3.5-1-7-5-7-10V6l7-4z"
                      strokeWidth="1.6"
                    />
                  </svg>
                </div>
                <h3 className="font-display text-lg font-semibold">
                  {card.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600">{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Featured products
            </p>
            <h2 className="font-display text-3xl font-semibold">
              Best picks for modern teams
            </h2>
          </div>
          <button className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(15,23,42,0.12)] transition hover:shadow-[0_0_40px_rgba(252,211,77,0.35)]">
            View all products
          </button>
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {featured.map((item) => (
            <div
              key={item.title}
              className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.12)]"
            >
              <img
                src={item.img}
                alt={item.title}
                className="h-52 w-full object-cover"
              />
              <div className="space-y-2 p-5">
                <h3 className="font-display text-lg font-semibold">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-500">{item.label}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-900">
                    {item.price}
                  </span>
                  <AddToCartButton item={{ id: item.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"), title: item.title, price: item.price, spec: item.spec, image: item.img }} className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] transition group-hover:border-slate-900">
                    Add to cart
                  </AddToCartButton>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-900 text-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-amber-200">
              Get in touch
            </p>
            <h2 className="font-display text-3xl font-semibold">
              Let us build your IT stack
            </h2>
            <p className="text-sm text-slate-300">
              Talk to our procurement team for custom quotes, deployment
              guidance, and premium support.
            </p>
            <div className="space-y-3 text-sm text-slate-200">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      d="M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 3 5.2 2 2 0 0 1 5 3h3a2 2 0 0 1 2 1.7c.1.8.3 1.6.6 2.3a2 2 0 0 1-.5 2.1L9 10a16 16 0 0 0 5 5l.9-1.1a2 2 0 0 1 2.1-.5c.7.3 1.5.5 2.3.6a2 2 0 0 1 1.7 2z"
                      strokeWidth="1.6"
                    />
                  </svg>
                </span>
                <span>+971 54 389 5126</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      d="M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"
                      strokeWidth="1.6"
                    />
                    <path d="M22 7l-10 7L2 7" strokeWidth="1.6" />
                  </svg>
                </span>
                <span>info@zowkins.com</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      d="M12 22s8-6 8-12a8 8 0 1 0-16 0c0 6 8 12 8 12z"
                      strokeWidth="1.6"
                    />
                    <circle cx="12" cy="10" r="3" strokeWidth="1.6" />
                  </svg>
                </span>
                <span>Dubai, UAE</span>
              </div>
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-amber-200">
              Fast quote
            </p>
            <h3 className="font-display text-2xl font-semibold">
              Request pricing today
            </h3>
            <p className="mt-2 text-sm text-slate-300">
              Get a tailored quote within 24 hours for your team size and
              requirements.
            </p>
            <div className="mt-6 grid gap-3">
              <input
                className="rounded-full border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-300 focus:outline-none"
                placeholder="Full name"
              />
              <input
                className="rounded-full border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-300 focus:outline-none"
                placeholder="Work email"
              />
              <input
                className="rounded-full border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-300 focus:outline-none"
                placeholder="Company size"
              />
              <button className="rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950">
                Contact us
              </button>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-slate-950 text-slate-400">
        <div className="mx-auto flex flex-wrap items-center justify-between gap-4 px-4 py-12 text-xs">
          <span className="lg:basis-1/4">
            (c) 2026 Zowkins Enterprises LTD. Dubai, UAE
          </span>
          <nav className="lg:basis-1/2 flex flex-wrap justify-center items-center gap-6 text-sm lg:gap-8">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <Link
              href="/laptops"
              className="hover:text-white transition-colors"
            >
              Laptops
            </Link>
            <Link
              href="/desktops"
              className="hover:text-white transition-colors"
            >
              Desktops
            </Link>
            <Link
              href="/accessories"
              className="hover:text-white transition-colors"
            >
              Accessories
            </Link>
            <Link href="/about" className="hover:text-white transition-colors">
              About
            </Link>
            <Link
              href="/contact"
              className="hover:text-white transition-colors"
            >
              Contact
            </Link>
            <Link href="/cart" className="hover:text-white transition-colors">
              Cart
            </Link>
          </nav>
          <div className="lg:basis-1/4 flex items-center justify-end gap-4">
            <Link
              href="/privacy"
              className="hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

