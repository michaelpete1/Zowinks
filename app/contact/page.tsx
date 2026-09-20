"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import NewNavbar from "../../components/NewNavbar";
import QuoteRequestForm from "../../components/QuoteRequestForm";

const whatsappNumber = "08064667917";

const infoCards = [
  {
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    label: "Address",
    value: "No 7 Maputo Street",
    sub: "Wuse Zone 3, Abuja, FCT, Nigeria",
    color: "#f3c74d",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
    label: "Phone",
    value: "07036359024",
    sub: "Call us directly",
    href: "tel:07036359024",
    color: "#5ab214",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    label: "Email",
    value: "contact@zowkins.com",
    sub: "We reply within 24 hours",
    href: "mailto:contact@zowkins.com",
    color: "#f3c74d",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    label: "Hours",
    value: "Mon – Fri, 9:00 – 17:00",
    sub: "West Africa Time (WAT)",
    color: "#5ab214",
  },
];

const socialLinks = [
  {
    label: "WhatsApp",
    href: "https://wa.me/message/6U6S7AJM4GECJ1",
    color: "#25D366",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
        <path d="M19.11 4.93A10.94 10.94 0 0 0 11.41 2a10.84 10.84 0 0 0-9.22 16.56L1 22l3.58-1.15A10.84 10.84 0 0 0 11.4 22h.01A10.93 10.93 0 0 0 19.11 4.93Zm-7.7 16a9 9 0 0 1-4.59-1.25l-.33-.2-2.13.69.7-2.07-.21-.34A8.98 8.98 0 1 1 20 13.07a8.87 8.87 0 0 1-8.59 7.86Zm5.23-6.76c-.29-.15-1.72-.85-1.99-.95-.27-.1-.46-.15-.66.15-.2.3-.76.95-.93 1.14-.17.2-.34.22-.63.07-.29-.15-1.22-.45-2.32-1.43-.86-.77-1.43-1.72-1.6-2.01-.17-.29-.02-.44.13-.59.13-.12.29-.32.44-.48.15-.16.2-.27.3-.45.1-.17.05-.34-.02-.48-.07-.15-.66-1.58-.9-2.16-.24-.58-.49-.5-.66-.51h-.56c-.19 0-.48.07-.73.34-.25.27-.95.93-.95 2.26s.98 2.62 1.12 2.8c.15.19 1.9 2.91 4.61 4.08.64.28 1.14.45 1.53.58.64.21 1.23.18 1.69.11.51-.08 1.72-.7 1.96-1.37.24-.68.24-1.26.17-1.38-.07-.12-.27-.19-.56-.34Z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/zowkinsenterprise?utm_source=qr&igsh=ZG1qODFhZnB1Mm5p",
    color: "#E1306C",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
        <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm10 2H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3Zm-5 3.5A4.5 4.5 0 1 1 7.5 12 4.51 4.51 0 0 1 12 7.5Zm0 2A2.5 2.5 0 1 0 14.5 12 2.5 2.5 0 0 0 12 9.5ZM17.75 6.75a1.25 1.25 0 1 1-1.25 1.25 1.25 1.25 0 0 1 1.25-1.25Z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/zowkins-enterprise-ltd-7395ab3ba",
    color: "#0A66C2",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
        <path d="M4.98 3.5A2.49 2.49 0 1 1 2.5 5.99 2.49 2.49 0 0 1 4.98 3.5ZM3 8.75h4v12H3v-12Zm7 0h3.84v1.64h.05a4.2 4.2 0 0 1 3.79-2.08c4.05 0 4.8 2.66 4.8 6.12v6.32h-4v-5.6c0-1.34-.02-3.07-1.87-3.07-1.87 0-2.16 1.46-2.16 2.97v5.7h-4v-12Z" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/share/18k2otvVkU/",
    color: "#1877F2",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
        <path d="M13.5 22v-8h2.7l.4-3h-3.1V9.05c0-.87.24-1.46 1.49-1.46h1.62V5.01c-.28-.04-1.23-.13-2.34-.13-2.3 0-3.87 1.4-3.87 3.96V11H7.7v3h2.7v8h3.1Z" />
      </svg>
    ),
  },
];

export default function ContactPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#050b16_0%,#07142a_50%,#0b1d3b_100%)] text-slate-100">
      <NewNavbar />

      <main className="mx-auto max-w-6xl px-4 py-10 md:px-8 md:py-14 space-y-8">

        {/* ── Hero ── */}
        <section className="relative overflow-hidden rounded-[2rem] shadow-[0_24px_70px_rgba(0,0,0,0.35)]">
          <div className="absolute inset-0">
            <Image
              src="/heroimage1.jpg"
              alt="Zowkins office"
              fill
              priority
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(5,11,22,0.88)_0%,rgba(7,20,42,0.78)_50%,rgba(5,11,22,0.92)_100%)]" />
            {/* gold shimmer orb */}
            <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-[#f3c74d]/10 blur-3xl animate-[pulse_6s_ease-in-out_infinite]" />
            <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-[#5ab214]/8 blur-3xl animate-[pulse_9s_ease-in-out_infinite_2s]" />
          </div>

          <div className="relative px-6 py-14 md:px-12 md:py-20">
            <div
              className={`max-w-2xl space-y-5 transition-all duration-700 ease-out ${
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#f3c74d]">
                Get in touch
              </p>
              <h1 className="text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
                We&apos;re here to help you get the right IT hardware.
              </h1>
              <p className="text-sm leading-7 text-slate-300 md:text-base">
                Whether you need a quote, have a question about an order, or want to discuss a bulk procurement — reach out and we&apos;ll get back to you within 24 hours.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1ebe5d] hover:-translate-y-0.5 active:scale-95"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                    <path d="M19.11 4.93A10.94 10.94 0 0 0 11.41 2a10.84 10.84 0 0 0-9.22 16.56L1 22l3.58-1.15A10.84 10.84 0 0 0 11.4 22h.01A10.93 10.93 0 0 0 19.11 4.93Zm-7.7 16a9 9 0 0 1-4.59-1.25l-.33-.2-2.13.69.7-2.07-.21-.34A8.98 8.98 0 1 1 20 13.07a8.87 8.87 0 0 1-8.59 7.86Zm5.23-6.76c-.29-.15-1.72-.85-1.99-.95-.27-.1-.46-.15-.66.15-.2.3-.76.95-.93 1.14-.17.2-.34.22-.63.07-.29-.15-1.22-.45-2.32-1.43-.86-.77-1.43-1.72-1.6-2.01-.17-.29-.02-.44.13-.59.13-.12.29-.32.44-.48.15-.16.2-.27.3-.45.1-.17.05-.34-.02-.48-.07-.15-.66-1.58-.9-2.16-.24-.58-.49-.5-.66-.51h-.56c-.19 0-.48.07-.73.34-.25.27-.95.93-.95 2.26s.98 2.62 1.12 2.8c.15.19 1.9 2.91 4.61 4.08.64.28 1.14.45 1.53.58.64.21 1.23.18 1.69.11.51-.08 1.72-.7 1.96-1.37.24-.68.24-1.26.17-1.38-.07-.12-.27-.19-.56-.34Z" />
                  </svg>
                  Chat on WhatsApp
                </a>
                <a
                  href="tel:07036359024"
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:border-[#f3c74d]/40 hover:text-[#f3c74d] hover:-translate-y-0.5 active:scale-95"
                >
                  Call us
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── Info cards ── */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {infoCards.map((card, i) => (
            <div
              key={card.label}
              className={`transition-all duration-500 ease-out ${
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
              style={{ transitionDelay: `${150 + i * 80}ms` }}
            >
              {card.href ? (
                <a
                  href={card.href}
                  className="group flex h-full flex-col gap-3 rounded-[1.5rem] border border-white/8 bg-white/4 p-5 backdrop-blur-sm transition hover:border-white/15 hover:bg-white/7 hover:-translate-y-1"
                >
                  <span style={{ color: card.color }}>{card.icon}</span>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">{card.label}</p>
                    <p className="mt-1 text-sm font-semibold text-white group-hover:underline">{card.value}</p>
                    <p className="mt-0.5 text-xs text-slate-400">{card.sub}</p>
                  </div>
                </a>
              ) : (
                <div className="flex h-full flex-col gap-3 rounded-[1.5rem] border border-white/8 bg-white/4 p-5 backdrop-blur-sm">
                  <span style={{ color: card.color }}>{card.icon}</span>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">{card.label}</p>
                    <p className="mt-1 text-sm font-semibold text-white">{card.value}</p>
                    <p className="mt-0.5 text-xs text-slate-400">{card.sub}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </section>

        {/* ── Form + Map ── */}
        <section
          className={`grid gap-6 lg:grid-cols-[1fr_1fr] transition-all duration-700 delay-300 ease-out ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          {/* Form */}
          <div className="rounded-[2rem] border border-white/8 bg-[#07131f] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.25)] md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#f3c74d]">Quote / Enquiry</p>
            <h2 className="mt-2 text-2xl font-bold text-white">Send us a message</h2>
            <p className="mt-1 text-sm text-slate-400">
              Fill in the form and we&apos;ll respond within 24 hours.
            </p>
            <div className="mt-6">
              <QuoteRequestForm
                title=""
                description=""
                submitLabel="Send message"
                whatsappLabel="Send via WhatsApp"
                whatsappNumber={whatsappNumber}
              />
            </div>
          </div>

          {/* Map + socials */}
          <div className="flex flex-col gap-6">
            {/* Map */}
            <div className="overflow-hidden rounded-[2rem] border border-white/8 shadow-[0_20px_50px_rgba(0,0,0,0.25)]" style={{ minHeight: 280 }}>
              <iframe
                title="Zowkins location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3940.0!2d7.4898!3d9.0765!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x104e0ba6a5b5b5b5%3A0x0!2sWuse+Zone+3%2C+Abuja%2C+FCT%2C+Nigeria!5e0!3m2!1sen!2sng!4v1700000000000"
                width="100%"
                height="280"
                style={{ border: 0, display: "block" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            {/* Social links */}
            <div className="rounded-[2rem] border border-white/8 bg-[#07131f] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.25)]">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#5ab214]">Follow us</p>
              <h2 className="mt-2 text-xl font-bold text-white">Find us on social media</h2>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {socialLinks.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 rounded-[1rem] border border-white/8 bg-white/4 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/8 hover:-translate-y-0.5"
                  >
                    <span style={{ color: s.color }}>{s.icon}</span>
                    {s.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Image card */}
            <div className="relative overflow-hidden rounded-[2rem] border border-white/8 shadow-[0_20px_50px_rgba(0,0,0,0.25)]" style={{ minHeight: 180 }}>
              <Image
                src="/heroimage2.jpg"
                alt="Zowkins products"
                fill
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(5,11,22,0.7)_0%,rgba(7,20,42,0.5)_100%)]" />
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#f3c74d]">Procurement</p>
                <p className="mt-1 text-lg font-bold text-white">Laptops, desktops, accessories & networking</p>
                <Link
                  href="/products"
                  className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
                >
                  Browse products
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
