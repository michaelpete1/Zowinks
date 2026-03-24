import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Navbar from "../components/NewNavbar";
import Carousel from "../components/Carousel";
import FeaturedProductsSection from "../components/FeaturedProductsSection";

export const metadata: Metadata = {
  title: "Zowkins Enterprise",
  description: "Business laptops, desktops, accessories, and trusted supplier brands for modern teams.",
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Zowkins Enterprise",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://zowkins.com",
  logo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://zowkins.com"}/icon.png`,
  description: "Business laptops, desktops, accessories, and IT procurement solutions for modern teams.",
};

const valueProps = [
  {
    title: "Trusted Supplier",
    body: "HP, Dell, Lenovo, Asus, Logitech, Canon, Premax, Apple, and Microsoft.",
  },
  {
    title: "Expert Support",
    body: "Fast setup, replacements, and priority support options.",
  },
  {
    title: "Competitive Pricing",
    body: "Bulk discounts, flexible quotes, and transparent invoicing.",
  },
];

const supplierSlides = [
  { title: "HP", img: "/hplogo.jpg", href: "/laptops/hp" },
  { title: "Dell", img: "/delllogo.jpg", href: "/laptops/dell" },
  { title: "Lenovo", img: "/lenovologo.jpg", href: "/laptops/lenovo" },
  { title: "Asus", img: "/asuslogo.jpg", href: "/laptops" },
  { title: "Logitech", img: "/logitech.jpg", href: "/accessories" },
  { title: "Canon", img: "/canonlogo.jpg", href: "/accessories" },
  { title: "Premax", img: "/premaxlogo.png", href: "/accessories" },
  { title: "Apple", img: "/applelogo.jpg", href: "/laptops/apple" },
  { title: "Microsoft", img: "/microsoft%20logo.jpg", href: "/contact" },
];

const supplierHighlights = [
  "HP",
  "Dell",
  "Lenovo",
  "Asus",
  "Logitech",
  "Canon",
  "Premax",
  "Apple",
  "Microsoft",
];

function getValueIcon(title: string) {
  if (title === "Trusted Supplier") {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
      >
        <path
          d="M12 2l7 4v6c0 5-3.5 9-7 10-3.5-1-7-5-7-10V6l7-4z"
          strokeWidth="1.8"
        />
        <path
          d="M9.5 12l1.8 1.8L15 10"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
      </svg>
    );
  }

  if (title === "Expert Support") {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
      >
        <path d="M4 12a8 8 0 0 1 16 0" strokeWidth="1.8" />
        <path
          d="M4 12v4a2 2 0 0 0 2 2h1v-6H4zM20 12v4a2 2 0 0 1-2 2h-1v-6h3z"
          strokeWidth="1.8"
        />
        <path d="M10 19h4" strokeLinecap="round" strokeWidth="1.8" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
    >
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
    img: "/hp.jpg",
  },
  {
    title: "Desktop PCs",
    body: "HP and Lenovo desktops for office deployments.",
    href: "/desktops",
    img: "/d.jpg",
  },
  {
    title: "Accessories",
    body: "Docks, headsets, keyboards, and daily-use peripherals.",
    href: "/accessories",
    img: "/keyboard.jpg",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7f2e6_0%,#f1ebdb_100%)] text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <Navbar />

      <section className="relative overflow-hidden bg-[linear-gradient(180deg,#0b1d3b_0%,#12386a_100%)] text-white">
        <div className="absolute inset-0">
          <Image
            src="/desktop.jpg"
            alt="Zowkins business desktop setup"
            fill
            priority
            className="object-cover object-center opacity-70 mix-blend-screen [mask-image:linear-gradient(180deg,rgba(0,0,0,0.95)_0%,rgba(0,0,0,0.9)_60%,rgba(0,0,0,0.4)_100%)]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,29,59,0.82)_0%,rgba(11,29,59,0.58)_46%,rgba(11,33,67,0.16)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_45%)]" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-20 lg:py-24">
          <div className="max-w-2xl space-y-6 animate-[fadeIn_0.9s_ease-out]">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/80 md:text-sm">
              Zowkins Enterprise
            </p>
            <h1 className="font-display text-4xl font-bold leading-tight text-white drop-shadow-2xl md:text-5xl lg:text-6xl">
              Empowering Your Business
              <span className="block">with Innovative IT Solutions</span>
            </h1>
            <p className="max-w-xl text-base leading-7 text-white/95 md:text-lg">
              Trusted partner for laptops, desktops, and
              accessories built for modern teams.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/laptops"
                className="rounded-lg bg-[#0b1d3b] px-6 py-3 text-sm font-semibold text-white shadow-[0_0_28px_rgba(11,29,59,0.22)] transition hover:bg-[#12386a]"
              >
                Explore Products
              </Link>
              <Link
                href="/contact"
                className="rounded-lg bg-[#f3c74d] px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-[#f3c74d]/20 transition hover:bg-[#e7ba2a]"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 md:px-8 md:py-16">
        <div className="md:hidden rounded-[2rem] border border-[#d4a11d]/16 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.98),rgba(255,248,228,0.9)_45%,rgba(243,234,215,0.95)_100%)] p-4 shadow-[0_18px_50px_rgba(15,23,42,0.08)] sm:p-6">
          <div className="space-y-8">
            <Carousel
              title="Our Products"
              variant="photo"
              slides={categories.map((card) => ({
                img: card.img,
                title: card.title,
                href: card.href,
              }))}
            />
          </div>
        </div>
        <div className="hidden md:block">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.35em] text-[#0b1d3b]/70">
              Our Products
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold text-slate-900 md:text-4xl">
              High-Quality Technology for Your Business
            </h2>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {categories.map((card) => (
              <Link
                key={card.title}
                href={card.href}
                className="group overflow-hidden rounded-[1.5rem] border border-white bg-white shadow-[0_14px_30px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(15,23,42,0.12)]"
              >
                <div className="relative h-44 overflow-hidden bg-slate-100">
                  <Image
                    src={card.img}
                    alt={card.title}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-5 text-center">
                  <h3 className="font-display text-lg font-bold text-slate-900">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {card.body}
                  </p>
                    <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#5ab214]">
                      View More <span aria-hidden="true">&rarr;</span>
                    </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[linear-gradient(180deg,#0b1d3b_0%,#12386a_100%)]">
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
            {valueProps.map((card) => (
              <div
                key={card.title}
                className="rounded-[1.5rem] border border-white/10 bg-white p-6 text-center shadow-[0_12px_30px_rgba(15,23,42,0.08)] animate-[rise_0.7s_ease-out]"
              >
                <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-[linear-gradient(180deg,#0b1d3b_0%,#f3c74d_100%)] text-white shadow-[0_10px_24px_rgba(11,29,59,0.24)]">
                  {getValueIcon(card.title)}
                </div>
                <h3 className="font-display text-lg font-bold text-slate-900">
                  {card.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {card.body}
                </p>
                {card.title === "Trusted Supplier" ? (
                  <Link
                    href="#suppliers"
                    className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#5ab214] hover:text-[#0b1d3b]"
                  >
                    See suppliers <span aria-hidden="true">&rarr;</span>
                  </Link>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="suppliers" className="mx-auto max-w-7xl px-4 py-14 md:px-8 md:py-16">
        <div className="overflow-hidden rounded-[2.5rem] border border-slate-200 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.98),rgba(247,242,230,0.92)_55%,rgba(243,235,219,0.95)_100%)] shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
          <div className="px-5 py-10 sm:px-8 sm:py-12">
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.45em] text-slate-500 sm:text-sm">
                They choose Zowkins
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold text-slate-900 md:text-5xl">
                Trusted brands we stock and source from
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
                A clean supplier wall keeps the focus on the brands and works better on mobile than the old card layout.
              </p>
            </div>

            <div className="mt-10 md:hidden">
              <div className="overflow-hidden">
                <div className="flex w-max items-center gap-4 py-2 animate-[supplier-scroll_28s_linear_infinite]">
                  {[...supplierSlides, ...supplierSlides].map((supplier, index) => (
                    <Link
                      key={`${supplier.title}-${index}`}
                      href={supplier.href}
                      className="flex h-20 w-36 shrink-0 items-center justify-center rounded-[1.2rem] border border-slate-200 bg-white px-4 shadow-[0_6px_18px_rgba(15,23,42,0.05)]"
                    >
                      <Image
                        src={supplier.img}
                        alt={supplier.title}
                        width={140}
                        height={56}
                        className="h-10 w-auto max-w-full object-contain opacity-90 grayscale transition duration-300"
                      />
                    </Link>
                  ))}
                </div>
              </div>
              <p className="mt-3 text-center text-xs uppercase tracking-[0.3em] text-slate-500">
                Swipe or watch it move
              </p>
            </div>

            <div className="mt-10 hidden md:block">
              <div className="grid grid-cols-3 gap-4 lg:grid-cols-6">
                {supplierSlides.map((supplier) => (
                  <Link
                    key={supplier.title}
                    href={supplier.href}
                    className="flex h-24 items-center justify-center rounded-[1.2rem] border border-slate-200 bg-white px-5 shadow-[0_6px_18px_rgba(15,23,42,0.05)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_26px_rgba(15,23,42,0.08)]"
                  >
                    <Image
                      src={supplier.img}
                      alt={supplier.title}
                      width={160}
                      height={60}
                      className="h-12 w-auto max-w-full object-contain opacity-90 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0"
                    />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <FeaturedProductsSection />

      <section className="bg-[linear-gradient(180deg,#0b1d3b_0%,#12386a_100%)] text-white">
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
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
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
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
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
                <span>Nigeria</span>
              </div>
            </div>
          </div>
          <div className="rounded-[1.75rem] border border-white/10 bg-white/8 p-6 shadow-2xl backdrop-blur-sm">
            <p className="text-xs uppercase tracking-[0.35em] text-white/75">
              Fast quote
            </p>
            <h3 className="mt-2 font-display text-2xl font-bold">
              Request pricing today
            </h3>
            <p className="mt-2 text-sm leading-6 text-white/80">
              Get a tailored quote within 24 hours for your team size and
              requirements.
            </p>
            <div className="mt-6 grid gap-3">
              <input
                className="rounded-full border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/60 focus:outline-none"
                placeholder="Full name"
              />
              <input
                className="rounded-full border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/60 focus:outline-none"
                placeholder="Work email"
              />
              <input
                className="rounded-full border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/60 focus:outline-none"
                placeholder="Company size"
              />
              <button className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100">
                Contact us
              </button>
            </div>
          </div>
        </div>
      </section>
</div>
  );
}

