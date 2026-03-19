import Image from "next/image";
import Link from "next/link";
import Navbar from "../components/NewNavbar";
import Carousel from "../components/Carousel";
import AddToCartButton from "../components/AddToCartButton";

const valueProps = [
  { title: "Trusted Supplier", body: "Authorized distributor with genuine stock and warranties." },
  { title: "Expert Support", body: "Fast setup, replacements, and priority support options." },
  { title: "Competitive Pricing", body: "Bulk discounts, flexible quotes, and transparent invoicing." },
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


function getValueIcon(title: string) {
  if (title === "Trusted Supplier") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor">
        <path d="M12 2l7 4v6c0 5-3.5 9-7 10-3.5-1-7-5-7-10V6l7-4z" strokeWidth="1.8" />
        <path d="M9.5 12l1.8 1.8L15 10" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      </svg>
    );
  }

  if (title === "Expert Support") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor">
        <path d="M4 12a8 8 0 0 1 16 0" strokeWidth="1.8" />
        <path d="M4 12v4a2 2 0 0 0 2 2h1v-6H4zM20 12v4a2 2 0 0 1-2 2h-1v-6h3z" strokeWidth="1.8" />
        <path d="M10 19h4" strokeLinecap="round" strokeWidth="1.8" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor">
      <path d="M4 7h16v10H4z" strokeWidth="1.8" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" strokeWidth="1.8" />
      <path d="M9 12h2" strokeLinecap="round" strokeWidth="1.8" />
      <path d="M13 12h2" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  );
}
const categories = [
  {
    title: "Laptops",
    body: "HP, Dell, and Lenovo lines for work and business use.",
    href: "/laptops",
    img: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?q=80&w=900&auto=format&fit=crop",
  },
  {
    title: "Desktop PCs",
    body: "Compact and powerful desktops for office deployments.",
    href: "/desktops/hp",
    img: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=900&auto=format&fit=crop",
  },
  {
    title: "Networking Solutions",
    body: "Switches, routers, and access gear for stable infrastructure.",
    href: "/search?q=networking",
    img: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=900&auto=format&fit=crop",
  },
  {
    title: "Accessories",
    body: "Docks, headsets, keyboards, and daily-use peripherals.",
    href: "/accessories",
    img: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?q=80&w=900&auto=format&fit=crop",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <section className="relative overflow-hidden bg-[#0f2f5d] text-white">
        <div className="absolute inset-0">
          <Image
            src="/desktop.jpg"
            alt="Zowkins business desktop setup"
            fill
            priority
            className="object-cover object-center opacity-70 mix-blend-screen [mask-image:linear-gradient(180deg,rgba(0,0,0,0.95)_0%,rgba(0,0,0,0.9)_60%,rgba(0,0,0,0.4)_100%)]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,33,67,0.82)_0%,rgba(11,33,67,0.58)_46%,rgba(11,33,67,0.16)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_45%)]" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-20 lg:py-24">
          <div className="max-w-2xl space-y-6 animate-[fadeIn_0.9s_ease-out]">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/80 md:text-sm">
              Zowkins Enterprise LTD
            </p>
            <h1 className="font-display text-4xl font-bold leading-tight text-white drop-shadow-2xl md:text-5xl lg:text-6xl">
              Empowering Your Business
              <span className="block">with Innovative IT Solutions</span>
            </h1>
            <p className="max-w-xl text-base leading-7 text-white/95 md:text-lg">
              Trusted partner for laptops, desktops, networking gear, and accessories built for modern teams.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/laptops" className="rounded-lg bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow-[0_0_28px_rgba(0,0,0,0.22)] transition hover:bg-slate-900">
                Explore Products
              </Link>
              <Link href="/contact" className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg transition hover:bg-slate-100">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 md:px-8 md:py-16">
        <div className="md:hidden space-y-10">
          <Carousel
            title="Featured Laptops"
            slides={[
              { img: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&auto=format&fit=crop&q=80", title: "HP", href: "/laptops/hp" },
              { img: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&auto=format&fit=crop&q=80", title: "Lenovo", href: "/laptops/lenovo" },
              { img: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80", title: "Dell", href: "/laptops/dell" },
            ]}
          />
          <Carousel
            title="Featured Desktops"
            slides={[
              { img: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80", title: "HP", href: "/desktops/hp" },
              { img: "https://images.unsplash.com/photo-1581232321812-9d00e8451d1d?w=800&auto=format&fit=crop&q=80", title: "Lenovo", href: "/desktops/hp" },
              { img: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80", title: "Dell", href: "/desktops/hp" },
            ]}
          />
        </div>

        <div className="hidden md:block">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
              Our Products
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold text-slate-900 md:text-4xl">
              High-Quality Technology for Your Business
            </h2>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {categories.map((card) => (
              <Link key={card.title} href={card.href} className="group overflow-hidden rounded-[1.5rem] border border-white bg-white shadow-[0_14px_30px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(15,23,42,0.12)]">
                <div className="relative h-44 overflow-hidden bg-slate-100">
                  <img src={card.img} alt={card.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                </div>
                <div className="p-5 text-center">
                  <h3 className="font-display text-lg font-bold text-slate-900">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {card.body}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-cyan-700">
                    View More <span aria-hidden="true">&rarr;</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[linear-gradient(180deg,#1d4f93_0%,#12386a_100%)]">
        <div className="mx-auto max-w-6xl px-4 py-14 md:px-8 md:py-16">
          <div className="text-center text-white">
            <p className="text-xs uppercase tracking-[0.35em] text-white/75">
              Why Choose Zowkins?
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">
              Procurement made simple
            </h2>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {valueProps.map((card, index) => (
              <div key={card.title} className="rounded-[1.5rem] border border-white/10 bg-white p-6 text-center shadow-[0_12px_30px_rgba(15,23,42,0.08)] animate-[rise_0.7s_ease-out]" style={{ animationDelay: `${index * 120}ms` }}>
                <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-[linear-gradient(180deg,#1f4f93_0%,#12386a_100%)] text-white shadow-[0_10px_24px_rgba(11,33,67,0.24)]">
                  {getValueIcon(card.title)}
                </div>
                <h3 className="font-display text-lg font-bold text-slate-900">{card.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 md:px-8 md:py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
              Featured Products
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold text-slate-900 md:text-4xl">
              Best picks for modern teams
            </h2>
          </div>
          <Link href="/laptops" className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
            View All Products
          </Link>
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {featured.map((item, index) => (
            <div key={item.title} className="group overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_12px_30px_rgba(15,23,42,0.08)] animate-[rise_0.8s_ease-out]" style={{ animationDelay: `${index * 120}ms` }}>
              <div className="relative h-52 overflow-hidden">
                <img src={item.img} alt={item.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
              </div>
              <div className="space-y-2 p-5">
                <h3 className="font-display text-lg font-bold text-slate-900">{item.title}</h3>
                <p className="text-sm text-slate-500">{item.label}</p>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-slate-900">{item.price}</span>
                  <AddToCartButton
                    item={{ id: item.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"), title: item.title, price: item.price, spec: item.spec, image: item.img }}
                    className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] transition hover:border-slate-900"
                  >
                    Add to cart
                  </AddToCartButton>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[linear-gradient(180deg,#224f8e_0%,#0f2f5d_100%)] text-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:px-8 md:py-16 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.35em] text-white/75">
              Get in Touch
            </p>
            <h2 className="font-display text-3xl font-bold md:text-4xl">
              Contact Us for Your IT Needs
            </h2>
            <p className="max-w-xl text-sm leading-6 text-white/85 md:text-base">
              Reach out for procurement guidance, bulk pricing, and support.
            </p>
            <div className="flex flex-col gap-4 pt-4 text-sm text-white/90 sm:flex-row sm:flex-wrap sm:items-center">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor"><path d="M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 3 5.2 2 2 0 0 1 5 3h3a2 2 0 0 1 2 1.7c.1.8.3 1.6.6 2.3a2 2 0 0 1-.5 2.1L9 10a16 16 0 0 0 5 5l.9-1.1a2 2 0 0 1 2.1-.5c.7.3 1.5.5 2.3.6a2 2 0 0 1 1.7 2z" strokeWidth="1.6" /></svg>
                </span>
                <span>+971 54 389 5126</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor"><path d="M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" strokeWidth="1.6" /><path d="M22 7l-10 7L2 7" strokeWidth="1.6" /></svg>
                </span>
                <span>info@zowkins.com</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor"><path d="M12 22s8-6 8-12a8 8 0 1 0-16 0c0 6 8 12 8 12z" strokeWidth="1.6" /><circle cx="12" cy="10" r="3" strokeWidth="1.6" /></svg>
                </span>
                <span>Nigeria</span>
              </div>
            </div>
          </div>
          <div className="rounded-[1.75rem] border border-white/10 bg-white/8 p-6 shadow-2xl backdrop-blur-sm">
            <p className="text-xs uppercase tracking-[0.35em] text-white/75">Fast quote</p>
            <h3 className="mt-2 font-display text-2xl font-bold">Request pricing today</h3>
            <p className="mt-2 text-sm leading-6 text-white/80">
              Get a tailored quote within 24 hours for your team size and requirements.
            </p>
            <div className="mt-6 grid gap-3">
              <input className="rounded-full border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/60 focus:outline-none" placeholder="Full name" />
              <input className="rounded-full border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/60 focus:outline-none" placeholder="Work email" />
              <input className="rounded-full border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/60 focus:outline-none" placeholder="Company size" />
              <button className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100">Contact us</button>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-[#123766] text-slate-200">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm md:flex-row md:items-center md:justify-between md:px-8">
          <span className="text-xs text-slate-300">(c) 2026 Zowkins Enterprises LTD</span>
          <div className="flex flex-wrap items-center gap-6 text-xs">
            <Link href="/privacy" className="transition hover:text-white">Privacy Policy</Link>
            <Link href="/terms" className="transition hover:text-white">Terms &amp; Conditions</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}




