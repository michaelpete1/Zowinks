import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Navbar from "../../components/NewNavbar";
import InfoStrip from "../../components/InfoStrip";
import { getAppSettings } from "../../lib/app-settings";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Zowkins Enterprise LTD and our business IT procurement approach.",
};

export const dynamic = "force-dynamic";

const metrics = [
  { label: "Authorized supply", value: "Genuine stock" },
  { label: "Response time", value: "Within 24h" },
  { label: "Delivery scope", value: "Local and regional" },
];

const principles = [
  {
    title: "Procurement made simple",
    body: "We help businesses source laptops, desktops, and accessories without the usual back-and-forth.",
  },
  {
    title: "Built for real teams",
    body: "Our focus is dependable stock, practical pricing, and support that keeps orders moving.",
  },
  {
    title: "Clear communication",
    body: "You get direct answers, structured quotes, and a process that is easy to follow from start to finish.",
  },
];

const capabilities = [
  "Business laptops and workstations",
  "Office desktops and all-in-one systems",
  "Accessories, docks, and peripherals",
  "Networking gear for office rollouts",
];

const aboutGallery = [
  {
    src: "/desktop.jpg",
    alt: "Business desktop setup",
    eyebrow: "Company focus",
    title: "Reliable hardware. Clear support.",
    body: "Teams need procurement that is predictable. We keep the buying process direct so projects move without unnecessary delays.",
  },
  {
    src: "/hp.jpg",
    alt: "HP laptop",
    eyebrow: "Preferred options",
    title: "Business-ready laptops",
    body: "Business laptops suited for teams that need dependable daily performance.",
  },
  {
    src: "/dell.jpg",
    alt: "Dell laptop",
    eyebrow: "Trusted lines",
    title: "Reliable supply options",
    body: "Reliable supply options for offices, departments, and larger rollouts.",
  },
];

export default async function About() {
  const { app } = await getAppSettings();
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#050b16_0%,#07142a_48%,#0b1d3b_100%)] text-slate-100">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">
        <section className="overflow-hidden rounded-[2.25rem] bg-[#0a1020] shadow-[0_24px_80px_rgba(0,0,0,0.24)] ring-1 ring-white/10">
          <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="relative overflow-hidden bg-[linear-gradient(180deg,#0a2a78_0%,#12386a_100%)] px-6 py-10 text-white md:px-10 md:py-14 lg:px-12 lg:py-16">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.18),transparent_28%),radial-gradient(circle_at_75%_15%,rgba(255,255,255,0.12),transparent_22%)]" />
              <div className="relative space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.26em] text-cyan-100 backdrop-blur-sm">
                  About Zowkins
                </div>
                <div className="max-w-2xl space-y-5">
                  <h1 className="font-display text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
                    A practical IT supplier for growing businesses.
                  </h1>
                  <p className="max-w-xl text-base leading-8 text-slate-100/90 md:text-lg">
                    {app.description}
                  </p>
                </div>

                <InfoStrip
                  className="mt-8"
                  items={metrics.map((metric) => ({
                    label: metric.label,
                    value: metric.value,
                  }))}
                />

                <div className="grid gap-3 pt-3 sm:grid-cols-3">
                  <div className="rounded-[1.25rem] bg-white/10 px-4 py-4 backdrop-blur-sm">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-cyan-100">
                      Focus
                    </p>
                    <p className="mt-1 text-sm font-semibold">
                      Office-ready hardware
                    </p>
                  </div>
                  <div className="rounded-[1.25rem] bg-white/10 px-4 py-4 backdrop-blur-sm">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-cyan-100">
                      Support
                    </p>
                    <p className="mt-1 text-sm font-semibold">
                      {app.status.portal === "online"
                        ? "Live support available"
                        : "Support available"}
                    </p>
                  </div>
                  <div className="rounded-[1.25rem] bg-white/10 px-4 py-4 backdrop-blur-sm">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-cyan-100">
                      Delivery
                    </p>
                    <p className="mt-1 text-sm font-semibold">
                      {app.address.split(",")[2]?.trim() ??
                        "Local and regional reach"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 md:p-6">
              <div className="overflow-hidden rounded-[1.8rem] bg-slate-200 lg:hidden">
                <div className="flex snap-x snap-mandatory overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {aboutGallery.map((slide, index) => (
                    <div
                      key={slide.src}
                      className="relative min-h-[320px] w-full shrink-0 snap-start"
                    >
                      <Image
                        src={slide.src}
                        alt={slide.alt}
                        fill
                        className="object-cover"
                        priority={index === 0}
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,25,48,0.10)_0%,rgba(8,25,48,0.72)_100%)]" />
                      <div className="absolute bottom-0 left-0 right-0 p-5 text-white md:p-6">
                        <p className="text-xs uppercase tracking-[0.22em] text-cyan-100 sm:text-[11px] sm:tracking-[0.28em]">
                          {slide.eyebrow}
                        </p>
                        <h2 className="mt-2 font-display text-2xl font-bold md:text-3xl">
                          {slide.title}
                        </h2>
                        <p className="mt-2 max-w-md text-sm leading-6 text-slate-100/90">
                          {slide.body}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <p className="mt-3 text-center text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 lg:hidden">
                Swipe to view more
              </p>

              <div className="hidden lg:grid lg:gap-4">
                <div className="relative min-h-[320px] overflow-hidden rounded-[1.8rem] bg-slate-200">
                  <Image
                    src={aboutGallery[0].src}
                    alt={aboutGallery[0].alt}
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,25,48,0.12)_0%,rgba(8,25,48,0.72)_100%)]" />
                  <div className="absolute bottom-0 left-0 right-0 p-5 text-white md:p-6">
                    <p className="text-xs uppercase tracking-[0.22em] text-cyan-100 sm:text-[11px] sm:tracking-[0.28em]">
                      {aboutGallery[0].eyebrow}
                    </p>
                    <h2 className="mt-2 font-display text-2xl font-bold md:text-3xl">
                      {aboutGallery[0].title}
                    </h2>
                    <p className="mt-2 max-w-md text-sm leading-6 text-slate-100/90">
                      {aboutGallery[0].body}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {aboutGallery.slice(1).map((slide) => (
                    <div
                      key={slide.src}
                      className="overflow-hidden rounded-[1.4rem] bg-white shadow-[0_12px_28px_rgba(15,23,42,0.06)]"
                    >
                      <div className="relative h-44">
                        <Image
                          src={slide.src}
                          alt={slide.alt}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                          {slide.eyebrow}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {slide.body}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-12 grid gap-6 lg:grid-cols-3">
          {principles.map((item, index) => (
            <article
              key={item.title}
              className="rounded-[1.75rem] bg-white p-6 shadow-[0_14px_32px_rgba(15,23,42,0.06)] ring-1 ring-slate-100"
            >
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[linear-gradient(180deg,#1d4f93_0%,#12386a_100%)] text-white">
                  <span className="text-sm font-bold">0{index + 1}</span>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Principle
                  </p>
                  <h3 className="font-display text-xl font-bold text-slate-900">
                    {item.title}
                  </h3>
                </div>
              </div>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                {item.body}
              </p>
            </article>
          ))}
        </section>

        <section className="mt-12 grid gap-6 rounded-[2rem] border border-white/10 bg-[#0a1020] p-6 shadow-[0_16px_40px_rgba(0,0,0,0.18)] lg:grid-cols-[1fr_0.95fr] lg:p-10">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-white/55">
              What we do
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold text-white md:text-4xl">
              Support procurement from inquiry to delivery.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
              Whether you need a single laptop or a larger business rollout, we
              keep the process organized, practical, and easy to approve
              internally.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/request-quote"
                className="rounded-full bg-[#f3c74d] px-6 py-3 text-sm font-semibold text-[#050b16] transition hover:bg-[#e4b935]"
              >
                Request a Quote
              </Link>
              <Link
                href="/products"
                className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:border-[#f3c74d]/45 hover:bg-white/10"
              >
                Browse products
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {capabilities.map((item) => (
              <div
                key={item}
                className="rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-4 text-sm font-medium text-white"
              >
                {item}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
