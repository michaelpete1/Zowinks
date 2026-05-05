import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "../components/NewNavbar";
import HeroCarousel from "../components/HeroCarousel";
import HomepageCategoriesSection from "../components/HomepageCategoriesSection";
import FeaturedProductsSection from "../components/FeaturedProductsSection";
import { getAppSettings } from "../lib/app-settings";
import { zowkinsApi } from "../lib/zowkins-api";

export const metadata: Metadata = {
  title: "Zowkins Enterprise",
  description:
    "Business laptops, desktops, accessories, and trusted supplier brands for modern teams.",
};

export const dynamic = "force-dynamic";

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Zowkins Enterprise",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://zowkins.com",
  logo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://zowkins.com"}/icon.png`,
  description:
    "Business laptops, desktops, accessories, and IT procurement solutions for modern teams.",
};

const officeMapsUrl =
  "https://www.google.com/maps/search/?api=1&query=No.%20158%2C%20Adetokunbo%20Ademola%20Cres%2C%20Kamdi%20Arena%2C%20Wuse%2C%20Abuja%2C%20FCT%2C%20Nigeria";

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
          d="M12 3.5l7 3.5v4.5c0 4.6-3.2 8.8-7 9.9-3.8-1.1-7-5.3-7-9.9V7l7-3.5z"
          strokeWidth="1.8"
        />
        <path
          d="M9.3 12.1l1.9 1.9L15.8 9.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.9"
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
        <path d="M12 3.5a8.5 8.5 0 1 0 8.5 8.5" strokeWidth="1.8" />
        <path d="M12 7.5a4.5 4.5 0 0 1 4.5 4.5v1.5" strokeWidth="1.8" />
        <path
          d="M7.8 14.2a1.8 1.8 0 0 1 1.8-1.8h1.1a1.5 1.5 0 0 1 1.5 1.5v1.6a1.5 1.5 0 0 1-1.5 1.5H9.6a1.8 1.8 0 0 1-1.8-1.8v-1z"
          strokeWidth="1.8"
        />
        <path
          d="M14.2 14.2a1.8 1.8 0 0 1 1.8-1.8h1.1a1.5 1.5 0 0 1 1.5 1.5v1.6a1.5 1.5 0 0 1-1.5 1.5H16a1.8 1.8 0 0 1-1.8-1.8v-1z"
          strokeWidth="1.8"
        />
        <path d="M10.5 18.5h3" strokeLinecap="round" strokeWidth="1.8" />
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
      <path
        d="M7 4.5h8.5l3 3V18a1.5 1.5 0 0 1-1.5 1.5H7A1.5 1.5 0 0 1 5.5 18V6A1.5 1.5 0 0 1 7 4.5z"
        strokeWidth="1.8"
      />
      <path d="M15.5 4.5V7h2.5" strokeWidth="1.8" />
      <path d="M8 11.5h8" strokeLinecap="round" strokeWidth="1.8" />
      <path d="M8 14.5h5.5" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  );
}

function getValueTone(title: string) {
  if (title === "Trusted Supplier") {
    return {
      badge:
        "bg-[linear-gradient(180deg,#0b1d3b_0%,#f3c74d_100%)] text-white shadow-[0_10px_24px_rgba(11,29,59,0.28)]",
      link: "text-[#f3c74d] hover:text-white",
    };
  }

  if (title === "Expert Support") {
    return {
      badge:
        "bg-[linear-gradient(180deg,#12386a_0%,#5ab214_100%)] text-white shadow-[0_10px_24px_rgba(18,56,106,0.28)]",
      link: "text-[#5ab214] hover:text-white",
    };
  }

  return {
    badge:
      "bg-[linear-gradient(180deg,#0b1d3b_0%,#12386a_100%)] text-white shadow-[0_10px_24px_rgba(11,29,59,0.28)]",
    link: "text-[#f3c74d] hover:text-white",
  };
}

export default async function Home() {
  const { app } = await getAppSettings();

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#050b16_0%,#07142a_48%,#0b1d3b_100%)] text-slate-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            ...organizationJsonLd,
            name: app.name,
            description: app.description,
            logo: app.branding.logo,
          }),
        }}
      />
      <Navbar />

      <HeroCarousel />

      <HomepageCategoriesSection />

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
            {valueProps.map((card) => {
              const tone = getValueTone(card.title);

              return (
                <div
                  key={card.title}
                  className="rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(10,16,32,0.98),rgba(7,12,24,0.98))] p-6 text-center shadow-[0_12px_30px_rgba(0,0,0,0.28)] ring-1 ring-white/5 animate-[rise_0.7s_ease-out]"
                >
                  <div
                    className={`mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl ${tone.badge}`}
                  >
                    <span className="scale-105">
                      {getValueIcon(card.title)}
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-bold text-white">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {card.body}
                  </p>
                  {card.title === "Trusted Supplier" ? (
                    <Link
                      href="/suppliers"
                      className={`mt-4 inline-flex items-center gap-2 text-sm font-semibold transition ${tone.link}`}
                    >
                      See suppliers <span aria-hidden="true">&rarr;</span>
                    </Link>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <FeaturedProductsSection />

      <section className="bg-[linear-gradient(180deg,#050b16_0%,#07142a_100%)] text-white">
        <div className="mx-auto max-w-6xl px-4 py-10 md:px-8 md:py-12">
          <div className="rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(10,16,32,0.98),rgba(7,12,24,0.98))] px-5 py-6 shadow-[0_12px_30px_rgba(0,0,0,0.22)] md:px-6 md:py-8">
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/70">
                Get in Touch
              </p>
              <h3 className="mt-2 font-display text-2xl font-bold text-white md:text-3xl">
                Reach us directly
              </h3>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <a
                href="tel:+971543895126"
                className="group flex items-center gap-4 rounded-[1.35rem] border border-white/10 bg-white/5 p-4 transition-transform duration-300 hover:-translate-y-1 hover:bg-white/[0.08]"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(180deg,#0b1d3b_0%,#12386a_100%)] text-white shadow-[0_10px_24px_rgba(11,29,59,0.28)]">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      d="M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 3 5.2 2 2 0 0 1 5 3h3a2 2 0 0 1 2 1.7c.1.8.3 1.6.6 2.3a2 2 0 0 1-.5 2.1L9 10a16 16 0 0 0 5 5l.9-1.1a2 2 0 0 1 2.1-.5c.7.3 1.5.5 2.3.6a2 2 0 0 1 1.7 2z"
                      strokeWidth="1.6"
                    />
                  </svg>
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/55">
                    Phone
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white md:text-base">
                    +971 54 389 5126
                  </p>
                </div>
              </a>

              <a
                href="mailto:contact@zowkins.com"
                className="group flex items-center gap-4 rounded-[1.35rem] border border-white/10 bg-white/5 p-4 transition-transform duration-300 hover:-translate-y-1 hover:bg-white/[0.08]"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(180deg,#12386a_0%,#5ab214_100%)] text-white shadow-[0_10px_24px_rgba(18,56,106,0.28)]">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
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
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/55">
                    Email
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white md:text-base">
                    contact@zowkins.com
                  </p>
                </div>
              </a>

              <a
                href={officeMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-4 rounded-[1.35rem] border border-white/10 bg-white/5 p-4 transition-transform duration-300 hover:-translate-y-1 hover:bg-white/[0.08]"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(180deg,#0b1d3b_0%,#f3c74d_100%)] text-white shadow-[0_10px_24px_rgba(11,29,59,0.28)]">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
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
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/55">
                    Address
                  </p>
                  <p className="mt-1 text-sm font-semibold leading-6 text-white md:text-base">
                    No. 158, Adetokunbo Ademola Cres, Kamdi Arena, Wuse, Abuja,
                    FCT, Nigeria
                  </p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
