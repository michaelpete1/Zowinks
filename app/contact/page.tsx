"use client";

import { type FormEvent, useState } from "react";
import Image from "next/image";
import Navbar from "../../components/NewNavbar";

const contactPoints = [
  {
    label: "Address",
    value: "Nigeria",
    detail: "Serving procurement requests nationwide and across regional business markets.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 21s6-4.8 6-10a6 6 0 10-12 0c0 5.2 6 10 6 10z" />
        <circle cx="12" cy="11" r="2.2" />
      </svg>
    ),
  },
  {
    label: "Phone",
    value: "+971 54 389 5126",
    detail: "Direct line for quotes, follow-ups, and product availability checks.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 3 5.2 2 2 0 0 1 5 3h3a2 2 0 0 1 2 1.7c.1.8.3 1.6.6 2.3a2 2 0 0 1-.5 2.1L9 10a16 16 0 0 0 5 5l.9-1.1a2 2 0 0 1 2.1-.5c.7.3 1.5.5 2.3.6a2 2 0 0 1 1.7 2z" />
      </svg>
    ),
  },
  {
    label: "Email",
    value: "info@zowkins.com",
    detail: "Best for larger requests, procurement planning, and documentation.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" />
        <path d="M22 7l-10 7L2 7" />
      </svg>
    ),
  },
];

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "sending") return;

    setStatus("sending");
    window.setTimeout(() => {
      setFormData({ name: "", email: "", company: "", message: "" });
      setStatus("sent");
      window.setTimeout(() => setStatus("idle"), 3500);
    }, 900);
  };

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
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-200">Contact</p>
                  <h1 className="font-display text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
                    Contact us about your next purchase or rollout.
                  </h1>
                  <p className="max-w-2xl text-sm leading-7 text-slate-200 md:text-base lg:max-w-xl">
                    Keep it simple. Tell us what you need, how many units you are planning, and where the equipment is going. We&apos;ll respond with a clear next step.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {contactPoints.map((item) => (
                    <article key={item.label} className="rounded-[1.4rem] bg-white/6 p-5 backdrop-blur-sm">
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-slate-900 shadow-lg">
                          {item.icon}
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-200">
                            {item.label}
                          </p>
                          <p className="mt-1 text-sm font-semibold text-white">{item.value}</p>
                        </div>
                      </div>
                      <p className="mt-4 text-sm leading-6 text-slate-300">{item.detail}</p>
                    </article>
                  ))}
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
              <div className="rounded-[2rem] bg-[#0a1020] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.18)] md:p-8 lg:sticky lg:top-6">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/55">Send message</p>
                <h2 className="mt-3 font-display text-3xl font-bold text-white">Tell us what you need</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  We will review your request and get back to you with product options and next steps.
                </p>

                {status === "sent" && (
                  <div className="mt-6 rounded-[1.5rem] border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-50 shadow-[0_12px_30px_rgba(0,0,0,0.16)] animate-[fadeIn_0.4s_ease-out]">
                    <div className="flex items-start gap-3">
                      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-emerald-600 text-white">
                        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-display text-lg font-bold text-white">Message sent</p>
                        <p className="mt-1 text-sm leading-6 text-emerald-50/80">
                          Thanks. We received your message and will reply within 24 hours.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="mt-8 grid gap-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <input
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:bg-white/10 focus:ring-2 focus:ring-[#f3c74d]/20"
                      placeholder="Full name"
                      value={formData.name}
                      onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                    />
                    <input
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:bg-white/10 focus:ring-2 focus:ring-[#f3c74d]/20"
                      placeholder="Work email"
                      value={formData.email}
                      onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                    />
                  </div>

                  <input
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:bg-white/10 focus:ring-2 focus:ring-[#f3c74d]/20"
                    placeholder="Company"
                    value={formData.company}
                    onChange={(event) => setFormData({ ...formData, company: event.target.value })}
                  />

                  <textarea
                    rows={7}
                    className="rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:bg-white/10 focus:ring-2 focus:ring-[#f3c74d]/20"
                    placeholder="Tell us about the devices, quantities, and timing..."
                    value={formData.message}
                    onChange={(event) => setFormData({ ...formData, message: event.target.value })}
                  />

                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className="rounded-full bg-[#f3c74d] px-6 py-3 text-sm font-semibold text-[#050b16] transition hover:bg-[#e4b935] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {status === "sending" ? "Sending..." : "Send message"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
