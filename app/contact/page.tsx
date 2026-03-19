"use client";

import { useState } from "react";
import Navbar from "../../components/NewNavbar";
import type { FormEvent } from "react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Handle form submission
    alert("Message sent! We will get back to you within 24 hours.");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-16 md:py-24">
        <div className="text-center mb-16">
          <h1 className="font-display text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-800 bg-clip-text text-transparent drop-shadow-2xl mb-4">
            Contact Us
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Get in touch for quotes, support, or custom procurement needs. Our
            team responds within 24 hours.
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
          <div className="space-y-8 lg:sticky lg:top-24 lg:h-fit">
            <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 p-8">
              <h2 className="font-display text-2xl font-bold text-slate-900 mb-6">
                Get in Touch
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors">
                  <div className="grid h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 place-items-center flex-shrink-0 mt-0.5 shadow-lg">
                    <svg
                      className="h-5 w-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.6}
                        d="M3 8l7.27 7.27c.883.883 2.317.883 3.2 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 mb-1">Phone</p>
                    <p className="text-slate-600">+971 54 389 5126</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors">
                  <div className="grid h-12 w-12 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 place-items-center flex-shrink-0 shadow-lg">
                    <svg
                      className="h-5 w-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.6}
                        d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 mb-1">Email</p>
                    <p className="text-slate-600">info@zowkins.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors">
                  <div className="grid h-12 w-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 place-items-center flex-shrink-0 shadow-lg">
                    <svg
                      className="h-5 w-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.6}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.6}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 mb-1">
                      Location
                    </p>
                    <p className="text-slate-600">Dubai, UAE</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-3xl p-8 shadow-2xl">
              <h3 className="font-display text-xl font-bold mb-4">
                Business Hours
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Sunday - Thursday</span>
                  <span>9AM - 6PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Friday</span>
                  <span>Closed</span>
                </div>
                <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                  <span>Emergency</span>
                  <span>24/7</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-8 md:p-12">
              <h2 className="font-display text-2xl font-bold text-slate-900 mb-2">
                Send Message
              </h2>
              <p className="text-slate-600 mb-8">
                Fill out the form below and we&apos;ll respond within 24 hours.
              </p>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all bg-slate-50/50 hover:bg-white"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Work Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all bg-slate-50/50 hover:bg-white"
                    placeholder="john@company.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Company
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) =>
                      setFormData({ ...formData, company: e.target.value })
                    }
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all bg-slate-50/50 hover:bg-white"
                    placeholder="Acme Corp (Optional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Message
                  </label>
                  <textarea
                    rows={5}
                    required
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-lg resize-vertical focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all bg-slate-50/50 hover:bg-white"
                    placeholder="Tell us about your IT needs..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-3xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-4 text-lg font-bold shadow-2xl hover:shadow-3xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 uppercase tracking-wide flex items-center justify-center gap-2"
                >
                  Send Message
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}





