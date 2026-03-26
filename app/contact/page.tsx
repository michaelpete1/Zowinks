import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Navbar from "../../components/NewNavbar";
import QuoteRequestForm from "../../components/QuoteRequestForm";

export const metadata: Metadata = {
  title: "Request a Quote",
  description: "Request pricing for laptops, desktops, accessories, and bulk IT orders from Zowkins Enterprise.",
};

export default function Contact() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#050b16_0%,#07142a_48%,#0b1d3b_100%)] text-slate-100">
      <Navbar />

      <main className="mx-auto max-w-[1400px] px-4 py-6 md:px-6 md:py-10 lg:px-8 lg:py-12">
        <section className="overflow-hidden rounded-[2rem] bg-[#07131f] text-white shadow-[0_24px_70px_rgba(15,23,42,0.16)] lg:rounded-[2.5rem]">
          <div className="grid lg:grid-cols-[1.08fr_0.92fr]">
            <div className="relative overflow-hidden px-6 py-10 md:px-10 md:py-12 lg:px-14 lg:py-14">
              <div className="absolute inset-0">
                <Image
                  src="/desktop.jpg"
                  alt="Business desktop setup"
                  fill
                  priority
                  className="object-cover object-center opacity-25"
                />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.14),transparent_35%),linear-gradient(180deg,rgba(7,19,31,0.22)_0%,rgba(7,19,31,0.76)_62%,rgba(7,19,31,0.96)_100%)]" />
              </div>

              <div className="relative space-y-8">
                <div className="max-w-2xl space-y-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-200">Contact Us</p>
                  <h1 className="font-display text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
                    Contact us for pricing, availability, and bulk orders.
                  </h1>
                  <p className="max-w-2xl text-sm leading-7 text-slate-200 md:text-base lg:max-w-xl">
                    Share the product, quantity, and delivery location. We&apos;ll respond with pricing, availability,
                    and next steps for your order.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:max-w-3xl">
                  <div className="rounded-[1.25rem] bg-white/6 p-5 backdrop-blur-sm">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-200">Hours</p>
                    <p className="mt-2 text-sm font-semibold text-white">Monday to Friday</p>
                    <p className="mt-1 text-sm text-slate-300">9:00 to 17:00</p>
                  </div>
                  <div className="rounded-[1.25rem] bg-white/6 p-5 backdrop-blur-sm">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-200">Response</p>
                    <p className="mt-2 text-sm font-semibold text-white">Usually within 24 hours</p>
                    <p className="mt-1 text-sm text-slate-300">For quotes, support, and procurement queries</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#050b16] px-4 py-6 text-slate-100 md:px-6 md:py-8 lg:px-8 lg:py-10">
              <QuoteRequestForm
                title="Build your quote request"
                description="Use the form below for product pricing, bulk orders, and delivery quotes. You can send it by email or WhatsApp."
              />
              <div className="mt-4 flex flex-wrap gap-3 px-1 text-xs text-slate-400">
                <Link href="/laptops" className="transition-colors hover:text-[#f3c74d]">
                  Browse laptops
                </Link>
                <Link href="/accessories" className="transition-colors hover:text-[#5ab214]">
                  Browse accessories
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
