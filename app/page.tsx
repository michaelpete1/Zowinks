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
    <div className="min-h-screen bg-[linear-gradient(180deg,#050b16_0%,#07142a_48%,#0b1d3b_100%)] text-slate-100">
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
            className="object-cover object-[center_35%] brightness-[0.68] contrast-[1.15] saturate-[1.08] scale-[1.02]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,12,26,0.92)_0%,rgba(10,25,48,0.76)_42%,rgba(11,29,59,0.34)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.10),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(243,199,77,0.16),transparent_26%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,rgba(5,11,22,0.18)_60%,rgba(5,11,22,0.45)_100%)]" />
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
        <div className="md:hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(11,29,59,0.98),rgba(7,12,24,0.96)_55%,rgba(5,11,22,0.98)_100%)] p-4 shadow-[0_18px_50px_rgba(0,0,0,0.24)] sm:p-6">
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
            <p className="text-xs uppercase tracking-[0.35em] text-white/55">
              Our Products
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold text-white md:text-4xl">
              High-Quality Technology for Your Business
            </h2>
          </div>
          <div className="mx-auto mt-8 grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((card) => (
              <Link
                key={card.title}
                href={card.href}
                className="group mx-auto w-full max-w-[22rem] overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#0a1020] shadow-[0_14px_30px_rgba(0,0,0,0.28)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.34)]"
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
                  <h3 className="font-display text-lg font-bold text-white">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {card.body}
                  </p>
                    <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#f3c74d]">
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
                    href="/suppliers"
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
              Message us
            </p>
            <h3 className="mt-2 font-display text-2xl font-bold">
              Send us a message today
            </h3>
            <p className="mt-2 text-sm leading-6 text-white/80">
              Send your details and our team will reply within 24 hours for your team size and requirements.
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
              <textarea
                rows={4}
                className="rounded-[1.25rem] border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/60 focus:outline-none"
                placeholder="Write your message here"
              />
              <a href="mailto:info@zowkins.com?subject=Zowkins%20enterprise%20inquiry" className="rounded-full bg-white px-6 py-3 text-center text-sm font-semibold text-slate-900 transition hover:bg-slate-100">
                Message us here
              </a>
            </div>
          </div>
        </div>
      </section>
</div>
  );
}

