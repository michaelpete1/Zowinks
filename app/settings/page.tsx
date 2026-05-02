import type { Metadata } from "next";
import Link from "next/link";
import { zowkinsApi } from "../../lib/zowkins-api";

export const metadata: Metadata = {
  title: "App Settings",
  description: "Application information and contact details.",
};

export const dynamic = "force-dynamic";

export default async function AppSettingsPage() {
  try {
    const response = await zowkinsApi.getApp();
    const app = response.app;

    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,#050b16_0%,#07142a_48%,#0b1d3b_100%)] text-slate-100">
        <main className="mx-auto max-w-4xl px-4 py-12 md:px-8 md:py-16">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-white md:text-5xl">{app.name}</h1>
            <p className="mt-4 text-lg text-slate-300">{app.description}</p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <span className="text-yellow-400">⭐</span>
              <span className="font-semibold text-white">{app.ratings}</span>
              <span className="text-slate-300">({app.ratings}.0 rating)</span>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Contact Information */}
            <div className="rounded-lg border border-white/10 bg-white/5 p-6">
              <h2 className="mb-6 text-2xl font-semibold text-white">Contact Information</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-400">Email</p>
                  <p className="font-medium text-white">{app.email}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Phone</p>
                  <p className="font-medium text-white">{app.phoneNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">WhatsApp</p>
                  <p className="font-medium text-white">{app.whatsAppNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Address</p>
                  <p className="font-medium text-white">{app.address}</p>
                </div>
              </div>
            </div>

            {/* App Status */}
            <div className="rounded-lg border border-white/10 bg-white/5 p-6">
              <h2 className="mb-6 text-2xl font-semibold text-white">Service Status</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Portal Status</span>
                  <span className={`rounded-full px-3 py-1 text-sm font-semibold ${
                    app.status.portal === "online" 
                      ? "bg-green-500/15 text-green-300" 
                      : app.status.portal === "maintenance"
                      ? "bg-yellow-500/15 text-yellow-300"
                      : "bg-red-500/15 text-red-300"
                  }`}>
                    {app.status.portal}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Customer Rating</span>
                  <span className="flex items-center gap-1 text-white">
                    <span className="text-yellow-400">⭐</span>
                    {app.ratings}/5.0
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* App Images */}
          {app.images && app.images.length > 0 && (
            <div className="mt-8 rounded-lg border border-white/10 bg-white/5 p-6">
              <h2 className="mb-6 text-2xl font-semibold text-white">Gallery</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {app.images.map((image, index) => (
                  <div key={index} className="aspect-video overflow-hidden rounded-lg">
                    <img
                      src={image}
                      alt={`${app.name} ${index + 1}`}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Contact */}
          <div className="mt-8 rounded-lg border border-white/10 bg-white/5 p-6">
            <h2 className="mb-6 text-2xl font-semibold text-white">Get in Touch</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <a
                href={`mailto:${app.email}`}
                className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-6 py-3 text-white transition hover:border-[#f3c74d]/45 hover:bg-white/10"
              >
                <span>📧</span>
                <span>Email Us</span>
              </a>
              <a
                href={`https://wa.me/${app.whatsAppNumber.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-6 py-3 text-white transition hover:border-[#f3c74d]/45 hover:bg-white/10"
              >
                <span>💬</span>
                <span>WhatsApp</span>
              </a>
              <a
                href={`tel:${app.phoneNumber}`}
                className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-6 py-3 text-white transition hover:border-[#f3c74d]/45 hover:bg-white/10"
              >
                <span>📞</span>
                <span>Call Us</span>
              </a>
              <Link
                href="/request-quote"
                className="flex items-center justify-center gap-2 rounded-lg bg-[#f3c74d] px-6 py-3 text-center text-sm font-semibold text-[#050b16] transition hover:bg-[#e4b935]"
              >
                <span>📝</span>
                <span>Contact Form</span>
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  } catch (error) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,#050b16_0%,#07142a_48%,#0b1d3b_100%)] text-slate-100">
        <main className="mx-auto max-w-4xl px-4 py-12 md:px-8 md:py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white md:text-5xl">Settings Unavailable</h1>
            <p className="mt-4 text-lg text-slate-300">
              We're unable to load application settings at the moment. Please try again later.
            </p>
            <div className="mt-8">
              <Link
                href="/"
                className="inline-block rounded-full bg-[#f3c74d] px-6 py-3 text-sm font-semibold text-[#050b16] transition hover:bg-[#e4b935]"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }
}
