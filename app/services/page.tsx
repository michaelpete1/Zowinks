import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Navbar from "../../components/NewNavbar";
import InfoStrip from "../../components/InfoStrip";

export const metadata: Metadata = {
  title: "Services",
  description: "Discover sourcing, delivery, support, and procurement services for business clients.",
};

const services = [
  {
    title: "Procurement Support",
    body: "We source laptops, desktops, and accessories with clear pricing and verified availability.",
  },
  {
    title: "Deployment and Setup",
    body: "We handle office rollout, imaging, configuration, and handover for new hardware.",
  },
  {
    title: "Maintenance and Support",
    body: "We help with warranty guidance, replacement planning, and ongoing technical assistance.",
  },
  {
    title: "Networking Projects",
    body: "We supply switches, access points, racks, and cabling for stable business networks.",
  },
];

const process = [
  "Tell us what your team needs.",
  "We recommend the right hardware and accessories.",
  "We deliver, deploy, and stay available for support.",
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#050b16_0%,#07142a_48%,#0b1d3b_100%)] text-slate-100">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-10 md:px-8 md:py-14">
        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#0a1020] shadow-[0_18px_50px_rgba(0,0,0,0.22)]">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-6 px-6 py-8 md:px-10 md:py-10">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/55">
                  Services
                </p>
                <h1 className="mt-3 font-display text-4xl font-bold leading-tight text-white md:text-5xl">
                  Practical services for teams that need hardware to work.
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
                  We keep the service side simple: source the right products, deliver them properly, and stay available when you need support.
                </p>
              </div>

              <InfoStrip
                items={[
                  { label: "Source", value: "Honest pricing" },
                  { label: "Deliver", value: "Ready to use" },
                  { label: "Support", value: "Ongoing help" },
                ]}
              />

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/contact"
                  className="rounded-full bg-[#f3c74d] px-5 py-3 text-sm font-semibold text-[#050b16] transition hover:bg-[#e4b935]"
                >
                  Request a Quote
                </Link>
                <Link
                  href="/laptops"
                  className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-[#f3c74d]/45 hover:bg-white/10"
                >
                  Browse products
                </Link>
              </div>
            </div>

            <div className="grid gap-4 p-6 pt-0 md:p-8 lg:pt-8">
              <div className="relative min-h-[230px] overflow-hidden rounded-[1.75rem] bg-[#0b2446] shadow-[0_16px_36px_rgba(15,23,42,0.12)]">
                <Image
                  src="/desktop 2.jpg"
                  alt="Desktop setup"
                  fill
                  priority
                  className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,36,70,0.05)_0%,rgba(11,36,70,0.18)_50%,rgba(11,36,70,0.86)_100%)]" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/70">
                    Desktop solutions
                  </p>
                  <p className="mt-2 font-display text-2xl font-bold text-white">
                    Office-ready systems
                  </p>
                </div>
              </div>

              <div className="relative min-h-[230px] overflow-hidden rounded-[1.75rem] bg-[#0b2446] shadow-[0_16px_36px_rgba(15,23,42,0.12)]">
                <Image
                  src="/keyboard.jpg"
                  alt="Keyboard accessories"
                  fill
                  className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,36,70,0.05)_0%,rgba(11,36,70,0.18)_50%,rgba(11,36,70,0.86)_100%)]" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/70">
                    Accessories
                  </p>
                  <p className="mt-2 font-display text-2xl font-bold text-white">
                    Keyboards and peripherals
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-6 md:grid-cols-2">
          {services.map((service) => (
              <div
              key={service.title}
              className="rounded-[1.5rem] border border-white/10 bg-[#111a2f] p-6 shadow-[0_12px_30px_rgba(0,0,0,0.18)]"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/55">
                Service
              </p>
              <h2 className="mt-3 font-display text-2xl font-bold text-white">
                {service.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                {service.body}
              </p>
            </div>
          ))}
        </section>

        <section className="mt-10 rounded-[2rem] bg-[#0a1020] px-6 py-8 shadow-[0_18px_50px_rgba(0,0,0,0.18)] md:px-10 md:py-10">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/55">
                How we work
              </p>
              <h2 className="font-display text-3xl font-bold text-white md:text-4xl">
                A simple process that keeps things moving.
              </h2>
              <p className="max-w-xl text-sm leading-6 text-slate-300 md:text-base">
                We keep the handoff straightforward so procurement, delivery, and support do not become a project of their own.
              </p>
            </div>

            <div className="space-y-3">
              {process.map((step, index) => (
                <div
                  key={step}
                  className="flex items-start gap-4 border-b border-white/10 pb-4 last:border-b-0 last:pb-0"
                >
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/10 text-xs font-bold text-white">
                    {index + 1}
                  </div>
                  <p className="pt-1 text-sm leading-6 text-slate-300 md:text-base">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}


