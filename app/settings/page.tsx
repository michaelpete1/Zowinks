import type { Metadata } from "next";
import Link from "next/link";
import { getAppSettings } from "../../lib/app-settings";

export const metadata: Metadata = {
  title: "App Settings",
  description: "Application information and contact details.",
};

export const dynamic = "force-dynamic";

function statusTone(status: string) {
  switch (status) {
    case "online":
      return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
    case "maintenance":
      return "bg-amber-500/15 text-amber-300 border-amber-500/30";
    default:
      return "bg-rose-500/15 text-rose-300 border-rose-500/30";
  }
}

export default async function AppSettingsPage() {
  const { app } = await getAppSettings();
  const imageCount = app.images?.length ?? 0;

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#050b16_0%,#07142a_48%,#0b1d3b_100%)] text-slate-100">
      <main className="mx-auto max-w-6xl px-4 py-10 md:px-8 md:py-16">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_18px_44px_rgba(15,23,42,0.2)] md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#f3c74d]">
              Application overview
            </p>
            <h1 className="mt-3 font-display text-3xl font-bold leading-tight text-white md:text-5xl">
              {app.name}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
              {app.description}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <span
                className={`rounded-full border px-4 py-2 text-sm font-semibold ${statusTone(app.status.portal)}`}
              >
                {app.status.portal}
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white">
                Rating {app.ratings}/5
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white">
                {imageCount} hero image{imageCount === 1 ? "" : "s"}
              </span>
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_18px_44px_rgba(15,23,42,0.2)]">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
                Contact information
              </p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                    Email
                  </p>
                  <a
                    className="mt-2 block break-words text-sm font-semibold text-white"
                    href={`mailto:${app.email}`}
                  >
                    {app.email}
                  </a>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                    Phone
                  </p>
                  <a
                    className="mt-2 block text-sm font-semibold text-white"
                    href={`tel:${app.phoneNumber}`}
                  >
                    {app.phoneNumber}
                  </a>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                    WhatsApp
                  </p>
                  <a
                    className="mt-2 block text-sm font-semibold text-white"
                    href="https://wa.me/message/6U6S7AJM4GECJ1"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {app.whatsAppNumber}
                  </a>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                    Address
                  </p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-white">
                    {app.address}
                  </p>
                </div>
              </div>
            </section>

            {app.images && app.images.length > 0 ? (
              <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_18px_44px_rgba(15,23,42,0.2)]">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
                  Gallery
                </p>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {app.images.slice(0, 4).map((image, index) => (
                    <div
                      key={`${image}-${index}`}
                      className="overflow-hidden rounded-2xl border border-white/10 bg-black/20"
                    >
                      <img
                        src={image}
                        alt={`${app.name} ${index + 1}`}
                        className="h-40 w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
          </aside>
        </div>

        <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_18px_44px_rgba(15,23,42,0.2)] md:p-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <a
              href={`mailto:${app.email}`}
              className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-5 py-4 text-sm font-semibold text-white transition hover:border-[#f3c74d]/40 hover:bg-white/10"
            >
              Email Us
            </a>
            <a
              href="https://wa.me/message/6U6S7AJM4GECJ1"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-5 py-4 text-sm font-semibold text-white transition hover:border-[#f3c74d]/40 hover:bg-white/10"
            >
              WhatsApp
            </a>
            <a
              href={`tel:${app.phoneNumber}`}
              className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-5 py-4 text-sm font-semibold text-white transition hover:border-[#f3c74d]/40 hover:bg-white/10"
            >
              Call Us
            </a>
            <Link
              href="/request-quote"
              className="flex items-center justify-center gap-2 rounded-2xl bg-[#f3c74d] px-5 py-4 text-center text-sm font-semibold text-[#050b16] transition hover:bg-[#e4b935]"
            >
              Contact Form
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
