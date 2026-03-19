"use client";

import { type FormEvent, useState } from "react";
import Image from "next/image";
import Navbar from "../../components/NewNavbar";
import InfoStrip from "../../components/InfoStrip";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    alert("Message sent! We will get back to you within 24 hours.");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-10 md:px-8 md:py-14">
        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-8 px-6 py-8 md:px-10 md:py-10">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-700">
                  Contact
                </p>
                <h1 className="mt-3 font-display text-4xl font-bold leading-tight text-slate-900 md:text-5xl">
                  Talk to a real person about your IT needs.
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
                  We work with teams that need laptops, desktops, accessories, and support they can trust. Tell us what you are planning and we will respond with clear next steps.
                </p>
              </div>

              <InfoStrip
                items={[
                  { label: "Hours", value: "Mon - Fri, 9:00 to 17:00" },
                  { label: "Phone", value: "+971 54 389 5126" },
                  { label: "Email", value: "info@zowkins.com" },
                  { label: "Location", value: "Nigeria" },
                  { label: "Response time", value: "Usually within 24 hours" },
                ]}
              />

              <div className="flex flex-wrap gap-3">
                <a
                  href="mailto:info@zowkins.com"
                  className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Email Us
                </a>
                <a
                  href="tel:+971543895126"
                  className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-900"
                >
                  Call Now
                </a>
              </div>
            </div>

            <div className="relative min-h-[280px] border-t border-slate-200 lg:min-h-full lg:border-l lg:border-t-0">
              <div className="absolute inset-0">
                <Image
                  src="/desktop.jpg"
                  alt="Desktop setup"
                  fill
                  className="object-cover object-center"
                  priority
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,22,41,0.08)_0%,rgba(9,22,41,0.24)_50%,rgba(9,22,41,0.88)_100%)]" />
              </div>
              <div className="relative flex h-full min-h-[320px] items-end p-6 md:min-h-[420px] md:p-8">
                <div className="max-w-sm rounded-[1.5rem] bg-white/92 p-5 text-slate-900 shadow-[0_18px_40px_rgba(15,23,42,0.12)] backdrop-blur-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-700">
                    For business inquiries
                  </p>
                  <h2 className="mt-2 font-display text-2xl font-bold">
                    Contact Us
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Procurement, deployment, and support for teams of any size.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="space-y-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-700">
              General inquiries
            </p>
            <h2 className="font-display text-2xl font-bold text-slate-900 md:text-3xl">
              Contact form
            </h2>
            <p className="text-sm leading-6 text-slate-600">
              Please fill out all fields and we&apos;ll come back with the right options and pricing.
            </p>
            <div className="grid gap-4 pt-2">
              <div className="rounded-[1.25rem] border border-slate-200 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                  Support
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  Procurement, setup, and after-sales care
                </p>
              </div>
              <div className="rounded-[1.25rem] border border-slate-200 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                  Service area
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  Nigeria and surrounding business markets
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] md:p-8">
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <input
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-cyan-700 focus:bg-white"
                  placeholder="Full name"
                  value={formData.name}
                  onChange={(event) =>
                    setFormData({ ...formData, name: event.target.value })
                  }
                />
                <input
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-cyan-700 focus:bg-white"
                  placeholder="Work email"
                  value={formData.email}
                  onChange={(event) =>
                    setFormData({ ...formData, email: event.target.value })
                  }
                />
              </div>
              <input
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-cyan-700 focus:bg-white"
                placeholder="Company"
                value={formData.company}
                onChange={(event) =>
                  setFormData({ ...formData, company: event.target.value })
                }
              />
              <textarea
                rows={7}
                className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-cyan-700 focus:bg-white"
                placeholder="Tell us about your IT needs..."
                value={formData.message}
                onChange={(event) =>
                  setFormData({ ...formData, message: event.target.value })
                }
              />
              <button className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                Send Message
              </button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}


